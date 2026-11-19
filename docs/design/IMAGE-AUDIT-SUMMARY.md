# LONEX — Image Audit Summary

**Audit date:** 18 Nov 2026  
**Scope:** Entire project (public/ + src/), read-only audit  
**Status:** READ-ONLY — no files modified

---

## Counts

| Metric | Count |
|---|---|
| Total image files in `public/` | 59 |
| Unique static image files (deduplicated) | 46 |
| SVG / icon files | 6 |
| WebP photographic images | 50 |
| JPG images | 1 |
| PNG logo/favicon files | 4 |
| Images referenced in source code | 36 |
| Images NOT referenced (unused) | 23 |
| Duplicate files (same content, multiple paths) | 13 |
| Broken/missing images | 0 |
| Low-resolution images (<1000px width) | 8 |
| CMS-driven images (dynamic) | Blog covers, product images, category covers, verify model images |

### Images used across public pages: 30
### Images used in admin: 1 (logo, reused from public)

---

## Duplicate Assets (13 files)

These files are exact duplicates of images stored elsewhere:

| Content | Primary Path | Duplicate Path(s) |
|---|---|---|
| hero-photo.webp (1200×1500) | public/images/homepage/ | public/images/final/homepage/ |
| range-battery.webp (1200×1500) | public/images/homepage/ | public/images/final/homepage/ |
| range-ev.webp (1200×1500) | public/images/homepage/ | public/images/final/homepage/ |
| range-solar.webp (1200×1500) | public/images/homepage/ | public/images/final/homepage/ |
| city-rooftops.webp (1200×900) | public/images/v2/ | public/images/final/v2/ |
| craft-panel.webp (1200×900) | public/images/v2/ | public/images/final/v2/ |
| generate-installation.webp (1200×900) | public/images/v2/ | public/images/final/v2/ |
| hero-solar-aerial.webp (1920×1080) | public/images/v2/ | public/images/final/v2/ |
| move-city.webp (1200×900) | public/images/v2/ | public/images/final/v2/ |
| generate-solar.webp (2000×1125) | public/images/lonex-step-1/ | public/images/final/lonex-step-1/ |
| move-mobility.webp (2000×1125) | public/images/lonex-step-1/ | public/images/final/lonex-step-1/ |
| store-battery.webp (2000×1125) | public/images/lonex-step-1/ | public/images/final/lonex-step-1/ |
| mobility.webp (1920×1080) | public/images/categories/ | public/images/final/categories/ |

---

## Unused Assets (23 files)

These images exist in `public/` but are **not referenced in any source file**:

1. `public/logo.png` (1448×1086)
2. `public/storage-room.webp` (1200×675)
3. `public/images/categories/solar.webp` (1200×802)
4. `public/images/categories/storage.webp` (1200×900)
5. `public/images/hero/solar-array.webp` (1280×854)
6. `public/images/lonex-range/generate-solar.webp` (1120×840)
7. `public/images/lonex-range/move-scooter.webp` (2000×874) — scooter render, superseded
8. `public/images/lonex-range/store-battery.webp` (1200×900)
9. `public/images/lonex-generated-images/categories/electric-mobility.webp` (1000×554) — header uses `range-ev.webp` instead
10. `public/images/lonex-generated-images/categories/home-storage.webp` (1000×501) — header uses `store-battery.webp` instead
11. `public/images/lonex-generated-images/lifestyle/solar-installation-team.webp` (1000×559)
12. `public/images/lonex-generated-images/hero/hero-solar-farm.webp` (1100×576)
13. `public/images/lonex-generated-images/about/commercial-facility.webp` (1000×554)
14. `public/images/lonex-generated-images/editorial/sustainability-leaf.webp` (1000×839)
15. `public/images/lonex-generated-images/demo-products/demo-battery-detail.webp` (900×706)
16. `public/images/lonex-generated-images/demo-products/demo-electric-bike.webp` (900×621)
17. `public/images/lonex-generated-images/demo-products/demo-home-battery.webp` (900×686)
18. `public/images/lonex-generated-images/demo-products/demo-inverter.webp` (900×678)
19. `public/images/lonex-generated-images/demo-products/demo-panel-detail.webp` (900×709)
20. `public/images/lonex-generated-images/demo-products/demo-solar-module.webp` (900×654)
21. `public/images/lonex-generated-images/ASSET_PREVIEW.jpg`
22. `public/window.svg`
23. `public/vercel.svg`, `public/next.svg`, `public/globe.svg`, `public/file.svg`

---

## Most Urgently Needing Replacement

### Priority 1 — Hero images (LCP impact, largest visual presence)

| Image | Current Size | Recommended | Reason |
|---|---|---|---|
| `hero-solar-aerial.webp` | 1920×1080, 497KB | 2400×1350 | Solar category hero — LCP image, needs high-res desktop + mobile variant |
| `generate-solar.webp` | 2000×1125, 300KB | 2400×1350 | Homepage slider slide — LCP image |
| `store-battery.webp` | 2000×1125, 134KB | 2400×1350 | Homepage slider slide — LCP image |
| `move-mobility.webp` | 2000×1125, 163KB | 2400×1350 | Homepage slider slide — LCP image |

### Priority 2 — Range cards (prominent homepage position)

| Image | Current Size | Recommended | Reason |
|---|---|---|---|
| `range-solar.webp` | 1200×1500, 320KB | 1200×1500 | Already good size, but 320KB is large — compress to <150KB |
| `range-battery.webp` | 1200×1500, 88KB | 1200×1500 | Already well-optimized |
| `range-ev.webp` | 1200×1500, 147KB | 1200×1500 | Already well-optimized |

### Priority 3 — Category & section images

| Image | Current Size | Recommended | Reason |
|---|---|---|---|
| `city-rooftops.webp` | 1200×900, 283KB | 1600×1200 | Used on 2 pages, compress to <150KB |
| `generate-installation.webp` | 1200×900, 146KB | 1600×1200 | Used on 2 pages |
| `battery-production.webp` | 1000×572, 49KB | 1400×800 | Full-width dark banner on /batteries |
| `mobility.webp` | 1920×1080, 201KB | 1920×1080 | Already good, used on /ev-bikes |

### Priority 4 — About & Contact pages

| Image | Current Size | Recommended | Reason |
|---|---|---|---|
| `story-architecture.webp` | 1320×1650, 111KB | 1600×2000 | Used on 2 pages, 4:5 portrait |
| `family-energy.webp` | 1000×834, 62KB | 1200×1000 | Contact hero main, needs mobile variant |
| `craft-panel.webp` | 1200×900, 174KB | 1200×900 | About pillar generate |
| `move-city.webp` | 1200×900, 117KB | 1200×900 | About pillar move |

### Priority 5 — Header & UI

| Image | Current Size | Recommended | Reason |
|---|---|---|---|
| `lonex-logo-transparent.png` | 600×398 | 1200×800 | Logo used everywhere — needs high-res for retina displays |

---

## Images Reused Across Multiple Pages

| Image | Pages / Sections | Count |
|---|---|---|
| `store-battery.webp` | Homepage slider, /batteries hero, /about pillar "Store", /authorized-sellers range card | 4 + CMS product images |
| `move-mobility.webp` | Homepage slider, /ev-bikes hero, /authorized-sellers range card | 3 + CMS product images |
| `generate-solar.webp` | Homepage slider, /authorized-sellers range card | 2 + CMS product images |
| `city-rooftops.webp` | /solar benefits, /about story | 2 |
| `generate-installation.webp` | /solar community, /about community | 2 |
| `story-architecture.webp` | Homepage story, /about hero | 2 |
| `range-ev.webp` | Homepage range card, slider "move", header EV tile | 3 |
| `lonex-logo-transparent.png` | Header, footer, admin login, mobile drawer | 4 |

---

## Missing / Broken Images

**None found.** All 36 images referenced in source code exist in `public/` and resolve correctly.

---

## Low-Resolution Images (<1000px width)

| Image | Current Size | Risk |
|---|---|---|
| `demo-battery-detail.webp` | 900×706 | Unused demo asset |
| `demo-electric-bike.webp` | 900×621 | Unused demo asset |
| `demo-home-battery.webp` | 900×686 | Unused demo asset |
| `demo-inverter.webp` | 900×678 | Unused demo asset |
| `demo-panel-detail.webp` | 900×709 | Unused demo asset |
| `demo-solar-module.webp` | 900×654 | Unused demo asset |
| `mountain-energy-landscape.webp` | 1000×626 | Used on /about closing — borderline, very small file (19KB) |

---

## Recommended Replacement Priorities (Ranked)

1. **Homepage slider images** (`generate-solar.webp`, `store-battery.webp`, `move-mobility.webp`) — LCP impact, 2400×1350
2. **Homepage range cards** (`range-solar.webp`, `range-battery.webp`, `range-ev.webp`) — Prominent homepage position, 1200×1500
3. **Solar category hero** (`hero-solar-aerial.webp`) — Full-width hero, 2400×1350
4. **Logo** (`lonex-logo-transparent.png`) — Used everywhere, 1200×800 PNG
5. **Category benefit/community images** (`city-rooftops.webp`, `generate-installation.webp`, `battery-production.webp`, `mobility.webp`)
6. **About page images** (`story-architecture.webp`, `craft-panel.webp`, `move-city.webp`)
7. **Contact page images** (`family-energy.webp`, `hero-solar-home-wide.webp`, `ev-charging.webp`)
8. **Authorized sellers hero** (`city-solar.webp`)

---

## CMS-Driven Images (not static files)

The following image types are stored in the database and served via `/admin/media/{id}/file`. Dimensions vary per upload:

| Type | Database Table | Pages Used |
|---|---|---|
| Blog cover images | Blog posts | /blog, /blog/[slug] |
| Product images | Product images | Product detail pages, category pages |
| Category covers | Categories | Category pages, header mega menu |
| Verify model images | Model registry | /verify |
| Admin logo | Settings logoMediaId | Admin pages |

**Recommendation:** Enforce minimum upload dimensions of 1600×900 (16:9) for blog covers and 1200×1200 for product images in the CMS validation.

---

## Key Findings

1. **No broken images** — all referenced images exist.
2. **13 duplicate files** in `public/images/final/` subfolders — exact copies, safe to consolidate.
3. **23 unused assets** — including demo products, scooter render (`move-scooter.webp`), and leftover Next.js template SVGs.
4. **Range cards use 4:5 display ratio on 16:9 source images** — significant cropping occurs; replacement images should be shot/composed for 4:5.
5. **Hero images are 2000×1125 (16:9)** but display at full viewport width — recommend 2400×1350 for retina desktop displays.
6. **Logo is only 600×398** — should be upgraded to 1200×800 for retina/4K displays.
7. **8 low-resolution demo images** (900px width) are unused and safe to remove.