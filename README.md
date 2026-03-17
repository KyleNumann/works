# works

Portfolio site for Kyle Numann — music, live performance, video, and visual art. Replaces the old WordPress site at kylenumann.com.

## Stack

Static site built with plain HTML, CSS, and vanilla JS. No build step, no frameworks. Hosted on GitHub Pages.

## Structure

```
index.html            — home page: hero image, bio, latest release
music/index.html      — music projects + release grid with Bandcamp embeds
live/index.html       — Ambient Sundays feature + shows list
video/index.html      — YouTube video grid
art/index.html        — filterable art grid with lightbox
assets/css/main.css   — all styles (CSS custom properties, light/dark mode)
assets/js/main.js     — nav, grid rendering, lightbox, easter eggs
content/data.js       — all site content lives here as a single JS object
```

## Editing Content

All content is managed in `content/data.js`. Add images to `assets/images/art/`.

- **Show** — add to `KN.live.shows`
- **Video** — add YouTube ID to `KN.video.videos`
- **Art** — add entry to `KN.art.pieces`, drop image in `assets/images/art/`
- **Release** — add entry to `KN.music.releases`

## Design

- Minimal, content-first layout
- Automatic light/dark mode via `prefers-color-scheme`
- Accent color: terracotta (#bf4e30 light / #d4614a dark)
- Fonts: Roboto + Roboto Mono

## Local Development

Open `index.html` in a browser, or serve locally:

```sh
python3 -m http.server
```
