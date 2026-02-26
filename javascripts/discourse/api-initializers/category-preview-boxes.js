import { apiInitializer } from "discourse/lib/api";

export default apiInitializer((api) => {
  // Only show previews to anonymous/guest users
  if (api.getCurrentUser()) return;

  // Parse the category_previews setting
  // Discourse list type uses | between entries; each entry uses ~ between fields
  // Format: slug~Display Name~Description~Color~Logo URL~Position
  function parsePreviews() {
    const raw = settings.category_previews;
    if (!raw || !raw.length) return [];

    const lines = typeof raw === "string" ? raw.split("|") : raw;
    const previews = [];

    lines.forEach((line) => {
      const trimmed = (typeof line === "string" ? line : "").trim();
      if (!trimmed) return;

      const parts = trimmed.split("~");
      if (parts.length < 2) return;

      previews.push({
        slug: (parts[0] || "").trim(),
        name: (parts[1] || "").trim(),
        description: (parts[2] || "").trim(),
        color: (parts[3] || "0088CC").trim(),
        logoUrl: (parts[4] || "").trim(),
        position: parseInt(parts[5], 10) || 0,
      });
    });

    return previews;
  }

  function lockIconSVG() {
    return '<svg class="fa d-icon d-icon-lock svg-icon svg-string" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" style="width:0.75em;height:0.75em;vertical-align:-0.05em;"><path fill="currentColor" d="M144 144v48H304V144c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192V144C80 64.5 144.5 0 224 0s144 64.5 144 144v48h16c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V256c0-35.3 28.7-64 64-64H80z"></path></svg>';
  }

  function toggleMessage(container) {
    const msg = container.querySelector(".category-preview-message");
    if (!msg) return;

    document
      .querySelectorAll(".category-preview-message.visible")
      .forEach((el) => {
        if (el !== msg) el.classList.remove("visible");
      });

    msg.classList.toggle("visible");
  }

  function messageHTML() {
    return settings.preview_message_html || "This area is for members only.";
  }

  function buildPreviewBox(preview) {
    const lockHtml = settings.show_lock_icon ? lockIconSVG() + " " : "";

    let logoHTML = "";
    if (preview.logoUrl) {
      logoHTML =
        '<div class="category-logo" style="background-color: #' + preview.color + ';">' +
          '<div class="category-logo aspect-image">' +
            '<img src="' + preview.logoUrl + '" alt="">' +
          '</div>' +
        '</div>';
    } else {
      const abbr = preview.name.slice(0, 2);
      logoHTML =
        '<div class="category-logo no-logo-present" style="background-color: #' + preview.color + ';">' +
          '<span class="category-abbreviation">' + abbr + '</span>' +
        '</div>';
    }

    const box = document.createElement("a");
    box.href = "javascript:void(0)";
    box.className = "category category-box category-box-" + preview.slug + " category-preview-box";
    box.setAttribute("data-preview-slug", preview.slug);

    box.innerHTML =
      '<div class="category-box-inner">' +
        logoHTML +
        '<div class="category-details">' +
          '<div class="category-box-heading">' +
            '<a class="parent-box-link" href="javascript:void(0)">' +
              '<h3>' + lockHtml + preview.name + '</h3>' +
            '</a>' +
          '</div>' +
          (preview.description
            ? '<div class="description"><p>' + preview.description + '</p></div>'
            : '') +
          '<div class="category-preview-message">' + messageHTML() + '</div>' +
        '</div>' +
      '</div>';

    box.addEventListener("click", function (e) {
      if (e.target.tagName === "A" && e.target.closest(".category-preview-message")) {
        return;
      }
      e.preventDefault();
      toggleMessage(box);
    });

    return box;
  }

  // ========================================
  // INJECTION - inserts each preview at its defined position
  // ========================================
  function injectPreviews() {
    const previews = parsePreviews();
    if (!previews.length) return;

    const container = document.querySelector(
      ".categories-list, .category-list"
    );
    if (!container) return;
    if (container.querySelector(".category-preview-box")) return;

    const boxesWrapper = container.querySelector(".custom-category-boxes");
    if (!boxesWrapper) return;

    // Sort previews by position (0 means append at end, sorted last)
    const sorted = [...previews].sort((a, b) => {
      if (a.position === 0 && b.position === 0) return 0;
      if (a.position === 0) return 1;
      if (b.position === 0) return -1;
      return a.position - b.position;
    });

    // Insert each preview at its 1-based position.
    // After each insertion the child list grows, so we process
    // lowest positions first (already sorted) to keep indices stable.
    sorted.forEach((preview) => {
      const box = buildPreviewBox(preview);
      const children = boxesWrapper.children;

      if (preview.position > 0 && preview.position <= children.length + 1) {
        // position is 1-based: position 1 = before first child, etc.
        const refIndex = preview.position - 1;
        if (refIndex < children.length) {
          boxesWrapper.insertBefore(box, children[refIndex]);
        } else {
          boxesWrapper.appendChild(box);
        }
      } else {
        boxesWrapper.appendChild(box);
      }
    });
  }

  function cleanupPreviews() {
    document.querySelectorAll(".category-preview-box").forEach((el) => el.remove());
  }

  // ========================================
  // PAGE CHANGE HANDLER
  // ========================================
  api.onPageChange(function (url) {
    if (url === "/categories" || url === "/categories/") {
      setTimeout(function () {
        cleanupPreviews();
        injectPreviews();
      }, 250);

      const observer = new MutationObserver(function () {
        const container = document.querySelector(
          ".categories-list, .category-list"
        );
        if (container && !container.querySelector(".category-preview-box")) {
          cleanupPreviews();
          injectPreviews();
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });
      setTimeout(function () {
        observer.disconnect();
      }, 5000);
    }
  });

  if (
    window.location.pathname === "/" ||
    window.location.pathname === "/categories" ||
    window.location.pathname === "/categories/"
  ) {
    setTimeout(function () {
      cleanupPreviews();
      injectPreviews();
    }, 500);
  }
});
