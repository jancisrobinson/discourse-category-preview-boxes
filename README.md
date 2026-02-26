# Category Preview Boxes

A Discourse theme component for [forum.jancis.com](https://forum.jancis.com/) that shows preview entries for restricted categories on the `/categories` page.

Guests and non-members can see that private categories exist. Clicking a preview box reveals an inline message directing them to become a member or log in on the main site.

## Why

Most categories on the forum are restricted to members. Without this component, anonymous visitors only see the single public category (Article Discussions) on the categories page — giving no indication of what else the forum offers. This component fills in the gaps so visitors can see the full category list and are encouraged to join.

## How it works

1. Runs on the `/categories` page via Discourse's `apiInitializer`
2. Parses category definitions from the theme settings
3. Injects preview boxes into the `.custom-category-boxes` wrapper at specified positions, matching the exact HTML structure used by [discourse-minimal-category-boxes](https://github.com/discourse/discourse-minimal-category-boxes)
4. Clicking a preview toggles an inline message with links to the membership and login pages
5. Links inside the message navigate normally (to jancisrobinson.com)

**SSO-friendly** — no Discourse login modal. Designed for DiscourseConnect SSO where users authenticate on jancisrobinson.com first.

## Requirements

- Discourse 3.1+
- [discourse-minimal-category-boxes](https://github.com/discourse/discourse-minimal-category-boxes) theme component
- Works on Discourse Pro (hosted) — no server-side plugin required

## Installation

**Admin → Customize → Themes → Install → From a git repository**

```
https://github.com/jancisrobinson/discourse-category-preview-boxes.git
```

If the repo is private, add the SSH deploy key shown by Discourse to the repo's **Settings → Deploy keys**.

Then add the component to your active theme.

## Configuration

All settings are under **Admin → Customize → Themes → Category Preview Boxes**.

### `category_previews`

Each list entry defines one preview box using tilde-separated fields:

```
slug~Display Name~Description~Color~Logo URL~Position
```

| Field | Required | Description |
|-------|----------|-------------|
| slug | Yes | URL slug matching the real private category |
| Display Name | Yes | Name shown on the preview box |
| Description | No | Short description text |
| Color | No | Hex colour without `#` (default: `0088CC`) |
| Logo URL | No | Category logo image URL. Empty = solid colour block |
| Position | No | 1-based display order among all categories. `0` or empty = append at end |

**Example** — Article Discussions (the real public category) sits at position 4:

```
wine-recommendations~Wine recommendations~What are you drinking? Share favourites, make and request recommendations.~840976~https://canada1.discourse-cdn.com/flex008/uploads/jancisrobinson/original/2X/2/23b2280a20f995f89e7bcb9e234eab4200228b1d.jpeg~1
travel-stuff~Travel stuff~Get insider tips on where to stay, producers to visit, where to eat and more.~840976~https://canada1.discourse-cdn.com/flex008/uploads/jancisrobinson/original/2X/b/bbf9fbbd8e3f34504c05985f810cad0ea175929f.jpeg~2
food-wine~Food & wine~Pairing questions, ideas and advice.~840976~https://canada1.discourse-cdn.com/flex008/uploads/jancisrobinson/original/2X/7/78f391b2b47d0517237e7f56622b16d39ff7f320.jpeg~3
en-primeur-notes~En primeur notes~Share insights and ask questions about the latest en primeur campaigns.~840976~https://canada1.discourse-cdn.com/flex008/uploads/jancisrobinson/original/2X/a/a018159affa27d7308771a3613bb41c252ed86d4.jpeg~5
drinks-other-than-wine~Drinks other than wine~A place to explore whisky, sake, NoLos, tea, coffee or anything else.~840976~https://canada1.discourse-cdn.com/flex008/uploads/jancisrobinson/original/2X/7/7ba49ad6406da65f24f0d47dacc7b2973f7163e8.jpeg~6
events-tastings-and-meetups~Events, tastings and meetups~Post your events, plan a get-together or find out what's on our calendar.~840976~https://canada1.discourse-cdn.com/flex008/uploads/jancisrobinson/original/2X/a/a9e372c1e6a7f52df41dcef9c0edc39bd8323345.jpeg~7
member-offers~Member offers~Discounts and special deals on glassware, events and more for our members.~840976~https://canada1.discourse-cdn.com/flex008/uploads/jancisrobinson/original/2X/1/1832f4fe5caf9b3ba78eff91037a6cc2677c1ed6.jpeg~8
general~General~Start conversations that don't fit into any other existing category.~E45735~~9
```

### `preview_message_html`

HTML shown when a visitor clicks a preview box. Default:

```html
This area is for members only. <a href='https://www.jancisrobinson.com/membership'>Become a member</a> or <a href='https://www.jancisrobinson.com/login'>log in</a> to continue reading.
```

### `membership_url`

URL to the membership page. Default: `https://www.jancisrobinson.com/membership`

### `show_lock_icon`

Show a lock icon before category names. Default: `true`.

## File structure

```
├── about.json                  # Component metadata
├── common/
│   └── common.scss             # Preview box styles
├── javascripts/
│   └── discourse/
│       └── api-initializers/
│           └── category-preview-boxes.js   # Main logic
└── settings.yml                # Admin settings definitions
```

## Updating

After pushing changes to this repo, go to **Admin → Customize → Themes → Category Preview Boxes** and click the update button to pull the latest version.