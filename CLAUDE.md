# kn-works — Kyle Numann Portfolio Site

## Project Overview
Personal portfolio site replacing kylenumann.com (WordPress). Hosted on GitHub Pages.

## Owner
Kyle Numann — musician, visual artist, video producer. 15 years web dev experience (hand-coded, WordPress, some React).

## Content Areas
- **Music** — recorded releases, upcoming album in progress
- **Live** — live performances, hosts monthly Ambient Sundays series
- **Video** — video production work
- **Art** — individual artworks + collections

## Navigation
`music` · `live` · `video` · `art`

## Design Direction
- Simple, minimal — content-first
- Subtle interactive elements and easter eggs
- Hand-codable format (no heavy build pipeline required)
- Content should be easy to add/administer

## Tech Constraints
- Static site — GitHub Pages compatible
- Hand-codable if needed (prefer plain HTML/CSS/JS or very light tooling)
- No WordPress

## Site Structure (built)
```
index.html            — home: hero photo + bio + latest grid
music/index.html      — projects list + release grid + Bandcamp embeds
live/index.html       — Ambient Sundays feature + shows list (from data.js)
video/index.html      — YouTube video grid (from data.js)
art/index.html        — collections + filterable art grid + lightbox (from data.js)
assets/css/main.css   — all styles, CSS variables for light/dark, easy tweaking
assets/js/main.js     — nav, art grid render, lightbox, video render, shows render, easter eggs
assets/images/        — hero photo + art images go here
content/data.js       — ALL site content in one JS object (KN). Edit this to update content.
scrape/               — raw scraping output, not part of site
```

## Editing Content
- **To add a show**: edit `KN.live.shows` in `content/data.js`
- **To add a video**: add YouTube ID to `KN.video.videos` in `content/data.js`
- **To add art**: add entry to `KN.art.pieces` in `content/data.js`, drop image in `assets/images/art/`
- **To add a release**: add entry to `KN.music.releases` in `content/data.js`

## Design Tokens (CSS variables in assets/css/main.css)
- `--accent`: terracotta/rust (#bf4e30 light / #d4614a dark)
- `--font-sans`: Roboto · `--font-mono`: Roboto Mono
- Light/dark auto via `prefers-color-scheme`

## Easter Eggs
- Konami code → "you found the quiet room"
- Click site logo 5× → hidden message

## TODO
- Add YouTube video IDs to `KN.video.videos` in content/data.js
- Add hero photo replacement (current: kyle-hero.jpg — old photo from WP)
- Populate remaining art images once scraping agent finishes (copy from scrape/images/ to assets/images/art/)
- Verify Bandcamp embed IDs in content/data.js and music/index.html
- GitHub Pages setup: add CNAME file, push repo

## MCP Servers Installed
- `playwright` — browser automation / scraping
- `context7` — library docs (GSAP, Three.js, etc.)
- `filesystem` — enhanced file ops
- `github` — GitHub Pages deployment
- `figma` — design reference

## Source Content
Existing site: https://kylenumann.com — scrape this for initial content and assets.
