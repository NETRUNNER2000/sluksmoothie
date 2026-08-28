# sluk — website

A static website. There is no build step, no framework and no server code:
it is HTML, CSS, JavaScript and images. Any static host will serve it as-is.

```
index.html          the whole page
css/styles.css      all styling
js/main.js          all interaction
assets/brand/       the sluk wordmark (used for the logo, labels, watermark)
assets/products/    the three bottle photographs
assets/people/      the ECD partners photo   <-- PLACEHOLDER, see below
assets/ig/          Instagram posts used in the "Follow the journey" rail
assets/gen/         smoothie textures used as backgrounds
```

## Preview it locally

Double-click `index.html` and it opens in a browser. Everything works
offline except the two web fonts, which load from Google Fonts and need an
internet connection.

## Publish it

Upload the **contents** of this folder (so that `index.html` sits at the
root of the site) to any static host. All of these have a free tier and
support a custom domain such as `sluk.co.za`:

| Host | How |
| --- | --- |
| Netlify | netlify.com → drag this folder onto the deploy area |
| Cloudflare Pages | pages.cloudflare.com → "Upload assets" |
| Vercel | vercel.com → new project → upload |
| GitHub Pages | push the folder to a repo → Settings → Pages |

Nothing needs configuring: no environment variables, no database, no
Node version. Point the domain at the host and it is live.

## Before going live

1. **Replace the ECD partners photo.** `assets/people/annie-and-sandra.jpg`
   is currently a branded placeholder, not a real photograph. Drop in a
   real photo of Annie and Sandra at the same filename — landscape,
   ideally 1600×1200 or larger. Nothing else needs changing.

2. **Check the copy.** The wording is placeholder-grade and written to fit
   the layout; edit freely in `index.html`.

3. **Update the events list.** Find the `<!-- find us -->` section in
   `index.html`. Each event is one `<li class="event">` block — copy one to
   add another date, and change the day/month in `event-day` / `event-mon`.

4. **Email sign-up is not connected.** The "Join our mission" form
   validates the address and shows a confirmation, but does not yet send
   anywhere. Connect it to Mailchimp, Netlify Forms or similar when you
   pick a provider — the handler is at the bottom of `js/main.js`.

## Editing notes

- **Brand colours** are CSS variables at the top of `css/styles.css`
  (`--berry`, `--olive`, `--mango`, `--orange`, `--taupe`, `--pink`, `--cream`).
- **The background colour changes as you scroll.** Each section carries a
  `data-bg="..."` attribute in `index.html`; the matching colours live in
  the `THEMES` table at the top of `js/main.js`.
- **The bottle labels are drawn in HTML, not baked into the photos**, so
  they stay sharp at any size. Each is a `<div class="sticker">` positioned
  over its bottle with four percentages (`--l`, `--t`, `--w`, `--h`). If a
  bottle photo is ever replaced, those four numbers reposition the label.
- **Ingredients** are the `<li>` items in each flavour's `flavour-ings`
  list and match the printed labels exactly.
