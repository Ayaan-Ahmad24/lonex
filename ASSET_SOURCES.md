# Image asset sources and licences

All public-site photography is stored locally under `public/images/`. No page
requests a remote image at runtime. Each file below was downloaded, converted to
WebP with `sharp`, and stripped of camera metadata by the conversion.

## v2 homepage photography (Pexels)

Downloaded on **10 November 2026** from Pexels and stored in
`public/images/v2/`. The [Pexels licence](https://www.pexels.com/license/)
allows free commercial use without attribution; the photographers are credited
in the site footer and here as a courtesy. None of these images depicts a LONEX
product.

| Local file | Used on | Pexels photo | Creator | Licence |
| --- | --- | --- | --- | --- |
| `public/images/v2/hero-solar-aerial.webp` | Home hero source (Step 1) | [9893731 — Directly Above Solar Farm](https://www.pexels.com/photo/9893731/) | Tom Fisk | Pexels licence |
| `public/images/v2/generate-installation.webp` | Home range, Generate / Journal cover | [30285845 — Technician installing solar panels on rooftop](https://www.pexels.com/photo/30285845/) | Pexels User | Pexels licence |
| `public/images/v2/move-city.webp` | Step 1 Move hero source | [9538575 — Black City Bike Parked Beside White Wall](https://www.pexels.com/photo/9538575/) | Erik Mclean | Pexels licence |
| `public/images/v2/city-rooftops.webp` | Home story | [12530460 — Bird's Eye View of Buildings Rooftops](https://www.pexels.com/photo/12530460/) | 8K | Pexels licence |
| `public/images/v2/craft-panel.webp` | Journal cover | [9875418 — A Man Installing Solar Panel](https://www.pexels.com/photo/9875418/) | Kindel Media | Pexels licence |
| `public/images/about/storage-room.webp` | Home range, Store | see v1 table below | Enyavar | CC BY-SA 4.0 |

Grades applied in `scripts/fetch-photos.mjs`: the hero is desaturated to 0.84
and given +5% contrast to sit closer to the stone/ink palette; the rooftop
aerial is desaturated to 0.82 for the same reason. No compositing, no generative
editing, no scene alteration.

## v1 photography (Wikimedia Commons)

Downloaded on **9 November 2026**, converted to WebP (quality 82, long edge
limited to the width shown) with `sharp`, and stripped of camera metadata by the
conversion.

The CC BY-SA 4.0 files are distributed here under the same licence. Attribution
appears in the public footer and in the caption of the image where one is shown.

| Local file | Used on | Source | Creator | Licence |
| --- | --- | --- | --- | --- |
| `public/images/hero/solar-array.webp` | Home hero | [Phipps Conservatory 24.jpg](https://commons.wikimedia.org/wiki/File:Phipps_Conservatory_24.jpg) | Dllu | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| `public/images/categories/solar.webp` | Home range, Solar category hero | [A photovoltaic power station in the United States (36130544874).jpg](https://commons.wikimedia.org/wiki/File:A_photovoltaic_power_station_in_the_United_States_(36130544874).jpg) | Chris Allan / U.S. Department of Energy | Public domain |
| `public/images/categories/storage.webp` | Home range, Batteries category hero | [Invenergy Beech Ridge Energy Storage System.jpg](https://commons.wikimedia.org/wiki/File:Invenergy_Beech_Ridge_Energy_Storage_System.jpg) | Z22 | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| `public/images/categories/mobility.webp` | Home range, EV Bikes category hero | [Cycling Amsterdam 03.jpg](https://commons.wikimedia.org/wiki/File:Cycling_Amsterdam_03.jpg) | Alfredo Borba | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| `public/images/about/storage-room.webp` | Home story, About hero | [Schwerin 20140923 wemag2.jpg](https://commons.wikimedia.org/wiki/File:Schwerin_20140923_wemag2.jpg) | Enyavar | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |

## Derivative notes

- `hero/solar-array.webp` — 1280 × 854 source, WebP 1600 px wide.
- `categories/solar.webp` — 1280 × 855 source, WebP 1200 px wide.
- `categories/storage.webp` — 1280 × 960 source, WebP 1200 px wide.
- `categories/mobility.webp` — 1280 × 848 source, WebP 1200 px wide.
- `about/storage-room.webp` — 1280 px source, WebP 1200 px wide.

No cropping or retouching was applied beyond scaling. The scene is not altered;
the images are used as documentary photography of solar, storage and cycling
infrastructure, not as depictions of specific LONEX products.

## Alt text

- `hero/solar-array.webp` — “A solar array angled towards a soft evening sky beside a garden.”
- `categories/solar.webp` — “Ground-mounted solar panels catching the last light of the day.”
- `categories/storage.webp` — “Containerised battery storage cabinets at a grid energy site.”
- `categories/mobility.webp` — “A rider moving through a city street.”
- `about/storage-room.webp` — “Rows of battery racks inside an energy storage facility.”

## Step 1 hero derivatives (cinematic slideshow)

The homepage hero uses three 16:9 plates prepared with `sharp` and stored in
`public/images/lonex-step-1/`. Each is a crop and unified grade of local
photography; no new image was generated and no scene was composited. They are
used as illustrative brand imagery, not as depictions of specific LONEX models.

| Local file | Derived from | Source / creator | Licence |
| --- | --- | --- | --- |
| `lonex-step-1/generate-solar.webp` | `v2/hero-solar-aerial.webp` | [Pexels 9893731](https://www.pexels.com/photo/9893731/) — Tom Fisk | Pexels licence |
| `lonex-step-1/store-battery.webp` | `lonex-generated-images/categories/home-storage.webp` | AI-generated visual board | Illustrative |
| `lonex-step-1/move-mobility.webp` | `v2/move-city.webp` | [Pexels 9538575](https://www.pexels.com/photo/9538575/) — Erik Mclean | Pexels licence |

Derivative treatment: resized to 2000 × 1125 (16:9) with a centred or
attention-weighted crop, saturation 0.86–0.90, brightness 0.90–0.94, a slight
contrast lift and WebP quality 84–86. The solar plate was additionally
upscaled from a 1100 px source with Lanczos3 and a light sharpen. Every hero
slide is labelled "Illustrative imagery" in the interface.

## AI-generated illustrative pack (Milestone 2C)

No new photography was generated or licensed for Milestone 2C. The redesigned
homepage reuses the local pack in `public/images/lonex-generated-images/`,
prepared from AI-generated visual boards. Every file is a locally served WebP;
no public page requests a remote image at runtime. The full 20-file inventory,
prompts and dimensions are recorded in
`public/images/lonex-generated-images/ASSET_MANIFEST.csv` and
`public/images/lonex-generated-images/README.md`.

| Local file | Homepage use | Status |
| --- | --- | --- |
| `hero/hero-solar-farm.webp` | Earlier hero visual (superseded by Step 1) | AI-generated, illustrative |
| `hero/hero-solar-home-wide.webp` | Unused — the closing photo band was removed | AI-generated, illustrative |
| `categories/solar-panels.webp` | Earlier hero range — Solar (superseded) | AI-generated, illustrative |
| `categories/home-storage.webp` | Store chapter; earlier hero range — Store (superseded) | AI-generated, illustrative |
| `categories/electric-mobility.webp` | Earlier hero range — Move (superseded) | AI-generated, illustrative |
| `lifestyle/solar-installation-team.webp` | Generate chapter (source) | AI-generated, illustrative |
| `lifestyle/ev-charging.webp` | Unused — car charging imagery, replaced by e-bike photography | AI-generated, illustrative |
| `about/commercial-facility.webp` | Unused — replaced by real photography in the company story section | AI-generated, illustrative |

Wherever one of these images still appears on a public page it carries an
"Illustrative visual" caption. None depicts real LONEX premises, staff, stock,
authorized sellers or a specific manufacturer model. Product and journal
imagery is served from the CMS media library (`/media/<id>`), not from this
pack.

## Range section plates (Generate / Store / Move)

The three range chapters use plates prepared from the pack above and stored in
`public/images/lonex-range/`. Each plate is cropped for the exact frame it
sits in — the chapters show a 4:3 photograph beside the copy and a 16:7 band
across the full row — then graded with the same restrained treatment used on
the hero plates (saturation 0.88–0.90, brightness 0.97–0.99, slight contrast
lift) and written as WebP quality 84. No image was generated, composited or
altered in content.

| Local file | Derived from | Chapter | Output | Source / creator | Licence |
| --- | --- | --- | --- | --- | --- |
| `lonex-range/generate-solar.webp` | `lonex-generated-images/lifestyle/solar-installation-team.webp` | Generate | 1120 × 840 (4:3) | AI-generated visual board | Illustrative |
| `lonex-range/store-battery.webp` | `lonex-generated-images/categories/home-storage.webp` | Store | 1200 × 900 (4:3) | AI-generated visual board | Illustrative |

The Move chapter now uses `homepage/range-ev.webp`, the real e-bike
photograph. The older scooter plate is no longer produced or referenced.

Rebuild them with `node scripts/prepare-range-images.mjs`.

The range section carries no on-page "Illustrative visual" caption, so the
plates are described here instead. The story, journal and closing sections
keep their captions.

## Company story plate

The company story section is led by one large architectural frame. It uses
real photography rather than the illustrative pack, so it carries no on-page
"illustrative" caption — the subject is a building, not a LONEX facility.

| Local file | Source | Section | Output | Creator | Licence |
| --- | --- | --- | --- | --- | --- |
| `lonex-story/story-architecture.webp` | [Pexels 35726122 — Modern Rooftop Solar Panels and Tiled Roof A](https://www.pexels.com/photo/35726122/) | Company story | 1320 × 1650 (4:5) | Budget Bizar | Pexels licence |

Downloaded at 2400 px and cropped to 4:5 from below the sky line, so the roof
pitch, the panel array, the rendered wall and the window all sit inside the
frame. The plate is then graded with the same treatment as the hero and range
plates (saturation 0.90, brightness 0.99, slight contrast lift). No compositing
and no generative editing. Rebuild it with
`node scripts/prepare-story-image.mjs`.

> Replacing a plate in `public/images` also invalidates the Next.js image
> optimiser cache for that path. Clear `.next/cache/images` and restart before
> capturing, or the previous crop keeps being served.

## Photography attribution

The public footer no longer carries a photography credit line. The full source
list is this file, and the Pexels photographs are used under the Pexels
licence, which does not require attribution. The CC BY-SA images credited
above are no longer published anywhere on the public site.

## Not used for product imagery

CMS product images are served from the media library. Where a product has no
approved image, the site shows a labelled placeholder rather than stock
photography, so a visitor is never shown a product that LONEX does not supply.
