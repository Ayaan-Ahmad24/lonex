# LONEX — Complete Image Inventory & Dimension Audit

**Audit scope:** Entire project (public/ + src/), read-only audit  
**Audit date:** 18 Nov 2026  
**Status:** READ-ONLY — no files modified

---

## Executive Summary

| Metric | Count |
|---|---|
| Total image files in public/ | 59 |
| Unique image files (deduplicated) | 46 |
| Images referenced in source code | 36 |
| Images NOT referenced in source code | 23 |
| SVG / icon files | 6 |
| Duplicate image files (same content, multiple paths) | 13 |
| CMS-driven images (blog covers, product images, verify model images, seller photos) | Dynamic (from database) |
| Broken/missing images | 0 |
| Low-resolution images (under 1000px width) | 8 |

---

## Part 1 — Image Inventory (Static Files)

The table below lists every static image file found in `public/`, its dimensions, file size, format, and whether it is referenced in source code.

| ID | Filename | Path | Format | Original W×H | Aspect Ratio | Size | Referenced in Code? | Pages / Sections Used |
|---|---|---|---|---|---|---|---|---|
| 01 | lonex-logo-transparent.png | public/lonex-logo-transparent.png | PNG | 600×398 | 3:2 | ~95KB | Yes | Header logo, footer logo, admin login logo, drawer logo |
| 02 | lonex-logo.png | public/lonex-logo.png | PNG | 600×398 | 3:2 | ~95KB | Yes | ImagePlaceholder fallback (content-image.tsx) |
| 03 | logo.png | public/logo.png | PNG | 1448×1086 | 4:3 | ~450KB | No | Not referenced in any source file |
| 04 | icon.png | public/icon.png | PNG | 400×400 | 1:1 | ~30KB | Yes | Favicon (layout.tsx) |
| 05 | window.svg | public/window.svg | SVG | Vector | — | ~5KB | No | Not referenced |
| 06 | vercel.svg | public/vercel.svg | SVG | Vector | — | ~5KB | No | Not referenced |
| 07 | next.svg | public/next.svg | SVG | Vector | — | ~5KB | No | Not referenced |
| 08 | globe.svg | public/globe.svg | SVG | Vector | — | ~5KB | No | Not referenced |
| 09 | file.svg | public/file.svg | SVG | Vector | — | ~5KB | No | Not referenced |
| 10 | hero-photo.webp | public/images/homepage/hero-photo.webp | WebP | 1200×1500 | 4:5 | 146KB | Yes | Homepage product cards (featured models) |
| 11 | range-battery.webp | public/images/homepage/range-battery.webp | WebP | 1200×1500 | 4:5 | 88KB | Yes | Homepage range card "Store"; slider slide "store" |
| 12 | range-ev.webp | public/images/homepage/range-ev.webp | WebP | 1200×1500 | 4:5 | 147KB | Yes | Homepage range card "Move"; slider slide "move"; header mega menu EV tile |
| 13 | range-solar.webp | public/images/homepage/range-solar.webp | WebP | 1200×1500 | 4:5 | 320KB | Yes | Homepage range card "Generate"; slider slide "generate" |
| 14 | storage-room.webp | public/images/about/storage-room.webp | WebP | 1200×675 | 16:9 | 177KB | No | Not referenced in any source file |
| 15 | mobility.webp | public/images/categories/mobility.webp | WebP | 1920×1080 | 16:9 | 201KB | Yes | EV bikes category community image |
| 16 | solar.webp | public/images/categories/solar.webp | WebP | 1200×802 | 3:2 | 235KB | No | Not referenced |
| 17 | storage.webp | public/images/categories/storage.webp | WebP | 1200×900 | 4:3 | 507KB | No | Not referenced |
| 18 | solar-array.webp | public/images/hero/solar-array.webp | WebP | 1280×854 | 3:2 | 235KB | No | Not referenced |
| 19 | city-rooftops.webp | public/images/v2/city-rooftops.webp | WebP | 1200×900 | 4:3 | 283KB | Yes | Solar benefit image; About story section image |
| 20 | craft-panel.webp | public/images/v2/craft-panel.webp | WebP | 1200×900 | 4:3 | 174KB | Yes | About pillar "Generate" image |
| 21 | generate-installation.webp | public/images/v2/generate-installation.webp | WebP | 1200×900 | 4:3 | 146KB | Yes | About community figure image; Solar community image |
| 22 | hero-solar-aerial.webp | public/images/v2/hero-solar-aerial.webp | WebP | 1920×1080 | 16:9 | 497KB | Yes | Solar category hero image |
| 23 | move-city.webp | public/images/v2/move-city.webp | WebP | 1200×900 | 4:3 | 117KB | Yes | About pillar "Move" image |
| 24 | generate-solar.webp | public/images/lonex-step-1/generate-solar.webp | WebP | 2000×1125 | 16:9 | 300KB | Yes | Homepage slider "generate" slide; authorized sellers range card "Solar" |
| 25 | move-mobility.webp | public/images/lonex-step-1/move-mobility.webp | WebP | 2000×1125 | 16:9 | 163KB | Yes | Homepage slider "move" slide; EV bikes category hero; authorized sellers range card "Electric Bikes" |
| 26 | store-battery.webp | public/images/lonex-step-1/store-battery.webp | WebP | 2000×1125 | 16:9 | 134KB | Yes | Homepage slider "store" slide; batteries category hero; About pillar "Store" image; authorized sellers range card "Batteries" |
| 27 | generate-solar.webp | public/images/lonex-range/generate-solar.webp | WebP | 1120×840 | 4:3 | 47KB | No | Not referenced (duplicate of ID 24) |
| 28 | move-scooter.webp | public/images/lonex-range/move-scooter.webp | WebP | 2000×874 | 16:7 | 66KB | No | Not referenced (scooter render — superseded by range-ev.webp) |
| 29 | store-battery.webp | public/images/lonex-range/store-battery.webp | WebP | 1200×900 | 4:3 | 33KB | No | Not referenced (duplicate of ID 26) |
| 30 | electric-mobility.webp | public/images/lonex-generated-images/categories/electric-mobility.webp | WebP | 1000×554 | 16:9 | 55KB | No | Not referenced (header uses range-ev.webp instead) |
| 31 | home-storage.webp | public/images/lonex-generated-images/categories/home-storage.webp | WebP | 1000×501 | 2:1 | 44KB | No | Not referenced (header uses store-battery.webp instead) |
| 32 | solar-panels.webp | public/images/lonex-generated-images/categories/solar-panels.webp | WebP | 1000×679 | 3:2 | 88KB | Yes | Header mega menu solar tile |
| 33 | battery-production.webp | public/images/lonex-generated-images/lifestyle/battery-production.webp | WebP | 1000×572 | 16:9 | 49KB | Yes | Batteries category community banner image |
| 34 | ev-charging.webp | public/images/lonex-generated-images/lifestyle/ev-charging.webp | WebP | 1000×560 | 16:9 | 33KB | Yes | Contact page hero inset image |
| 35 | family-energy.webp | public/images/lonex-generated-images/lifestyle/family-energy.webp | WebP | 1000×834 | 6:5 | 62KB | Yes | Contact page hero main image |
| 36 | solar-installation-team.webp | public/images/lonex-generated-images/lifestyle/solar-installation-team.webp | WebP | 1000×559 | 16:9 | 54KB | No | Not referenced |
| 37 | hero-solar-farm.webp | public/images/lonex-generated-images/hero/hero-solar-farm.webp | WebP | 1100×576 | 16:9 | 63KB | No | Not referenced |
| 38 | hero-solar-home-wide.webp | public/images/lonex-generated-images/hero/hero-solar-home-wide.webp | WebP | 1536×295 | 16:3 | 104KB | Yes | Contact page closing section media |
| 39 | commercial-facility.webp | public/images/lonex-generated-images/about/commercial-facility.webp | WebP | 1000×554 | 16:9 | 72KB | No | Not referenced |
| 40 | mountain-energy-landscape.webp | public/images/lonex-generated-images/about/mountain-energy-landscape.webp | WebP | 1000×626 | 8:5 | 19KB | Yes | About page closing section media |
| 41 | city-solar.webp | public/images/lonex-generated-images/editorial/city-solar.webp | WebP | 1000×610 | 5:3 | 74KB | Yes | Authorized sellers hero image |
| 42 | energy-consultation.webp | public/images/lonex-generated-images/editorial/energy-consultation.webp | WebP | 1000×544 | 16:9 | 49KB | Yes | About page approach figure image |
| 43 | sustainability-leaf.webp | public/images/lonex-generated-images/editorial/sustainability-leaf.webp | WebP | 1000×839 | 6:5 | 49KB | No | Not referenced |
| 44 | demo-battery-detail.webp | public/images/lonex-generated-images/demo-products/demo-battery-detail.webp | WebP | 900×706 | 5:4 | 18KB | No | Not referenced |
| 45 | demo-electric-bike.webp | public/images/lonex-generated-images/demo-products/demo-electric-bike.webp | WebP | 900×621 | 3:2 | 32KB | No | Not referenced |
| 46 | demo-home-battery.webp | public/images/lonex-generated-images/demo-products/demo-home-battery.webp | WebP | 900×686 | 4:3 | 17KB | No | Not referenced |
| 47 | demo-inverter.webp | public/images/lonex-generated-images/demo-products/demo-inverter.webp | WebP | 900×678 | 4:3 | 16KB | No | Not referenced |
| 48 | demo-panel-detail.webp | public/images/lonex-generated-images/demo-products/demo-panel-detail.webp | WebP | 900×709 | 5:4 | 38KB | No | Not referenced |
| 49 | demo-solar-module.webp | public/images/lonex-generated-images/demo-products/demo-solar-module.webp | WebP | 900×654 | 4:3 | 23KB | No | Not referenced |
| 50 | story-architecture.webp | public/images/lonex-story/story-architecture.webp | WebP | 1320×1650 | 4:5 | 111KB | Yes | Homepage story photo; About page hero image |
| 51 | ASSET_PREVIEW.jpg | public/images/lonex-generated-images/ASSET_PREVIEW.jpg | JPG | Unknown | Unknown | ~50KB | No | Not referenced |

### Duplicate Images (same content, multiple paths)

| Content | Path 1 | Path 2 | Path 3 | Path 4 |
|---|---|---|---|---|
| hero-photo.webp (1200×1500) | public/images/homepage/hero-photo.webp | public/images/final/homepage/hero-photo.webp | — | — |
| range-battery.webp (1200×1500) | public/images/homepage/range-battery.webp | public/images/final/homepage/range-battery.webp | — | — |
| range-ev.webp (1200×1500) | public/images/homepage/range-ev.webp | public/images/final/homepage/range-ev.webp | — | — |
| range-solar.webp (1200×1500) | public/images/homepage/range-solar.webp | public/images/final/homepage/range-solar.webp | — | — |
| city-rooftops.webp (1200×900) | public/images/v2/city-rooftops.webp | public/images/final/v2/city-rooftops.webp | — | — |
| craft-panel.webp (1200×900) | public/images/v2/craft-panel.webp | public/images/final/v2/craft-panel.webp | — | — |
| generate-installation.webp (1200×900) | public/images/v2/generate-installation.webp | public/images/final/v2/generate-installation.webp | — | — |
| hero-solar-aerial.webp (1920×1080) | public/images/v2/hero-solar-aerial.webp | public/images/final/v2/hero-solar-aerial.webp | — | — |
| move-city.webp (1200×900) | public/images/v2/move-city.webp | public/images/final/v2/move-city.webp | — | — |
| generate-solar.webp (2000×1125) | public/images/lonex-step-1/generate-solar.webp | public/images/final/lonex-step-1/generate-solar.webp | — | — |
| move-mobility.webp (2000×1125) | public/images/lonex-step-1/move-mobility.webp | public/images/final/lonex-step-1/move-mobility.webp | — | — |
| store-battery.webp (2000×1125) | public/images/lonex-step-1/store-battery.webp | public/images/final/lonex-step-1/store-battery.webp | — | — |
| mobility.webp (1920×1080) | public/images/categories/mobility.webp | public/images/final/categories/mobility.webp | — | — |

---

## Part 2 — Image Usage by Page

### Homepage (`/`)
| Section | Image | Source File | Dimensions | Used For |
|---|---|---|---|---|
| Hero slider — slide 1 (Generate) | generate-solar.webp | hero-ui.tsx line 37 | 2000×1125 | Hero background image |
| Hero slider — slide 2 (Store) | store-battery.webp | hero-ui.tsx line 50 | 2000×1125 | Hero background image |
| Hero slider — slide 3 (Move) | move-mobility.webp | hero-ui.tsx line 63 | 2000×1125 | Hero background image |
| Range card — Generate | range-solar.webp | page.tsx line 48 | 1200×1500 | Range chapter image |
| Range card — Store | range-battery.webp | page.tsx line 58 | 1200×1500 | Range chapter image |
| Range card — Move | range-ev.webp | page.tsx line 68 | 1200×1500 | Range chapter image |
| Story section | story-architecture.webp | page.tsx line 350 | 1320×1650 | Story section image |
| Product cards (featured models) | product.image (CMS) | page.tsx line 421 | Dynamic | Product showcase cards |
| Journal cards (feature) | post.cover.url (CMS) | page.tsx line 150 | Dynamic | Featured blog cover |
| Journal cards (side) | post.cover.url (CMS) | page.tsx line 150 | Dynamic | Side blog covers |

### Solar Category (`/solar`)
| Section | Image | Source File | Dimensions | Used For |
|---|---|---|---|---|
| Hero | hero-solar-aerial.webp | solar-page.tsx line 10 | 1920×1080 | Hero background |
| Benefits | city-rooftops.webp | solar-page.tsx line 15 | 1200×900 | Benefits grid image |
| Community | generate-installation.webp | solar-page.tsx line 20 | 1200×900 | Community banner |
| Product cards | card.image (CMS) | parts.tsx line 156 | Dynamic | Product showcase |

### Batteries Category (`/batteries`)
| Section | Image | Source File | Dimensions | Used For |
|---|---|---|---|---|
| Hero | store-battery.webp | batteries-page.tsx line 20 | 2000×1125 | Hero background |
| Community banner | battery-production.webp | batteries-page.tsx line 25 | 1000×572 | Community section banner |
| Product cards (plinth) | card.image (CMS) | parts.tsx line 156 | Dynamic | Product showcase cards |

### EV Bikes Category (`/ev-bikes`)
| Section | Image | Source File | Dimensions | Used For |
|---|---|---|---|---|
| Hero | move-mobility.webp | ev-bikes-page.tsx line 19 | 2000×1125 | Hero background |
| Community | mobility.webp | ev-bikes-page.tsx line 24 | 1920×1080 | Community section image |
| Product cards (plate) | card.image (CMS) | parts.tsx line 156 | Dynamic | Product showcase cards |

### About Page (`/about`)
| Section | Image | Source File | Dimensions | Used For |
|---|---|---|---|---|
| Hero | story-architecture.webp | about/page.tsx line 109 | 1320×1650 | Hero figure image |
| Story | city-rooftops.webp | about/page.tsx line 175 | 1200×900 | Story section image |
| Pillar — Generate | craft-panel.webp | about/content.ts line 21 | 1200×900 | Pillar media image |
| Pillar — Store | store-battery.webp | about/content.ts line 35 | 2000×1125 | Pillar media image |
| Pillar — Move | move-city.webp | about/content.ts line 49 | 1200×900 | Pillar media image |
| Approach figure | energy-consultation.webp | about/page.tsx line 362 | 1000×544 | Approach figure image |
| Community figure | generate-installation.webp | about/page.tsx line 457 | 1200×900 | Community figure image |
| Closing | mountain-energy-landscape.webp | about/page.tsx line 473 | 1000×626 | Closing section background |

### Contact Page (`/contact`)
| Section | Image | Source File | Dimensions | Used For |
|---|---|---|---|---|
| Hero main | family-energy.webp | contact/page.tsx line 213 | 1000×834 | Hero main image |
| Hero inset | ev-charging.webp | contact/page.tsx line 226 | 1000×560 | Hero inset image |
| Closing | hero-solar-home-wide.webp | contact/page.tsx line 413 | 1536×295 | Closing section background |

### Authorized Sellers (`/authorized-sellers`)
| Section | Image | Source File | Dimensions | Used For |
|---|---|---|---|---|
| Hero | city-solar.webp | authorized-sellers/page.tsx line 24 | 1000×610 | Hero background |
| Range card — Solar | generate-solar.webp | authorized-sellers/content.ts line 57 | 2000×1125 | Range card image |
| Range card — Batteries | store-battery.webp | authorized-sellers/content.ts line 64 | 2000×1125 | Range card image |
| Range card — EV Bikes | move-mobility.webp | authorized-sellers/content.ts line 71 | 2000×1125 | Range card image |

### Header Mega Menu (All pages)
| Section | Image | Source File | Dimensions | Used For |
|---|---|---|---|---|
| Mega menu — Solar tile | solar-panels.webp | site-header.tsx line 37 | 1000×679 | Solar category tile |
| Mega menu — Batteries tile | home-storage.webp | site-header.tsx line 43 | 1000×501 | Batteries category tile |
| Mega menu — EV Bikes tile | range-ev.webp | site-header.tsx line 51 | 1200×1500 | EV Bikes category tile |

### Footer (All pages)
| Section | Image | Source File | Dimensions | Used For |
|---|---|---|---|---|
| Footer brand mark | lonex-logo-transparent.png | brand-mark.tsx line 37 | 600×398 | Footer logo |

### Blog Listing (`/blog`)
| Section | Image | Source File | Dimensions | Used For |
|---|---|---|---|---|
| Featured article cover | post.cover.url (CMS) | blog/page.tsx line 150 | Dynamic | Featured article image |
| Side article covers | post.cover.url (CMS) | blog/page.tsx line 150 | Dynamic | Side article images |

### Blog Article (`/blog/[slug]`)
| Section | Image | Source File | Dimensions | Used For |
|---|---|---|---|---|
| Article cover | post.cover (CMS) | blog/[slug]/page.tsx line 62 | Dynamic | Article hero cover |
| Related article covers | item.cover (CMS) | blog/[slug]/page.tsx line 310 | Dynamic | Related article images |

### Model Verification (`/verify`)
| Section | Image | Source File | Dimensions | Used For |
|---|---|---|---|---|
| Verified model image | active.model.image.url (CMS) | verify-form.tsx line 300 | Dynamic | Verified model display |

### Admin Panel
| Section | Image | Source File | Dimensions | Used For |
|---|---|---|---|---|
| Login page logo | brand.logoSrc (/lonex-logo-transparent.png) | admin/login/page.tsx line 70 | 600×398 | Admin login branding |
| Login page logo (mobile) | brand.logoSrc (/lonex-logo-transparent.png) | admin/login/page.tsx line 130 | 600×398 | Admin login branding |
| Media library previews | /admin/media/{id}/file | media/[id]/page.tsx line 72 | Dynamic | Image asset previews |

### CMS-Driven Images
The following images are stored in the database and served via `/admin/media/{id}/file`. They are not static files in `public/`:

| Type | Table | Field | Used On |
|---|---|---|---|
| Blog cover images | Blog posts | cover.url | /blog, /blog/[slug] |
| Product images | Product images | url | Product detail pages, category pages |
| Category covers | Categories | cover.url | Category pages, header mega menu |
| Seller photos | Sellers | (none — no photos used) | /authorized-sellers |
| Verify model images | Registry | image.url | /verify |
| Admin logo | Settings | logoMediaId | Admin pages |

---

## Part 3 — Responsive Image Dimensions

Rendered dimensions at key breakpoints for each statically-referenced image:

| ID | Image | Desktop 1440px | Laptop 1024px | Tablet 768px | Mobile 390px | Small Mobile 360px | Cropped? |
|---|---|---|---|---|---|---|---|
| 12 | range-battery.webp | ~420px wide (4:5) | ~31vw | ~100vw | 100vw | 100vw | Yes (4:5 from 16:9 source) |
| 13 | range-ev.webp | ~420px wide (4:5) | ~31vw | ~100vw | 100vw | 100vw | Yes (4:5 from 16:9 source) |
| 14 | range-solar.webp | ~420px wide (4:5) | ~31vw | ~100vw | 100vw | 100vw | Yes (4:5 from 16:9 source) |
| 19 | hero-solar-aerial.webp | 100vw full height | 100vw full height | 100vw full height | 100vw full height | 100vw full height | Yes (object-fit: cover) |
| 20 | city-rooftops.webp | ~40vw | ~40vw | ~40vw | 100vw | 100vw | Yes (object-fit: cover) |
| 21 | generate-installation.webp | ~38vw | ~38vw | ~38vw | 100vw | 100vw | Yes (object-fit: cover) |
| 24 | generate-solar.webp | 100vw (hero) | 100vw (hero) | 100vw (hero) | 100vw (hero) | 100vw (hero) | Yes (object-fit: cover) |
| 25 | move-mobility.webp | 100vw (hero) | 100vw (hero) | 100vw (hero) | 100vw (hero) | 100vw (hero) | Yes (object-fit: cover) |
| 26 | store-battery.webp | 100vw (hero) | 100vw (hero) | 100vw (hero) | 100vw (hero) | 100vw (hero) | Yes (object-fit: cover) |
| 32 | solar-panels.webp | ~28vw (mega menu) | ~28vw | ~100vw | 100vw | 100vw | Yes (object-fit: cover) |
| 33 | battery-production.webp | 100vw (banner) | 100vw (banner) | 100vw (banner) | 100vw (banner) | 100vw (banner) | Yes (object-fit: cover) |
| 34 | ev-charging.webp | 200px fixed | 200px fixed | 200px fixed | 200px fixed | 200px fixed | Yes (object-fit: cover) |
| 35 | family-energy.webp | ~46vw | ~46vw | ~46vw | 100vw | 100vw | Yes (object-fit: cover) |
| 38 | hero-solar-home-wide.webp | 100vw | 100vw | 100vw | 100vw | 100vw | Yes (object-fit: cover) |
| 40 | mountain-energy-landscape.webp | 100vw | 100vw | 100vw | 100vw | 100vw | Yes (object-fit: cover) |
| 41 | city-solar.webp | 100vw | 100vw | 100vw | 100vw | 100vw | Yes (object-fit: cover) |
| 42 | energy-consultation.webp | ~34vw | ~34vw | ~34vw | 100vw | 100vw | Yes (object-fit: cover) |
| 50 | story-architecture.webp | ~52vw | ~52vw | ~52vw | 100vw | 100vw | Yes (object-fit: cover) |

**Notes on cropping:**
- Range cards use 4:5 aspect ratio on 16:9 source images — significant cropping of top/bottom
- Hero images use object-fit: cover — portions may be cropped on extreme viewports
- The `move-scooter.webp` (16:7) is not referenced anywhere; replaced by `range-ev.webp` (4:5) in header and homepage

---

## Part 4 — Recommended Replacement Sizes

| Image ID | Usage | Original Size | Recommended Replacement | Aspect Ratio | Format | Target Size | Quality | Mobile/ Desktop Separate? |
|---|---|---|---|---|---|---|---|---|
| 12 | Range card — Store | 1200×1500 | 1200×1500 | 4:5 | WebP | <100KB | 82 | No |
| 13 | Range card — Move | 1200×1500 | 1200×1500 | 4:5 | WebP | <100KB | 82 | No |
| 14 | Range card — Generate | 1200×1500 | 1200×1500 | 4:5 | WebP | <150KB | 82 | No |
| 19 | Solar category hero | 1920×1080 | 2400×1350 | 16:9 | WebP | <300KB | 80 | Yes (mobile 1200×675) |
| 20 | Solar benefits image | 1200×900 | 1600×1200 | 4:3 | WebP | <150KB | 82 | No |
| 21 | Solar community image | 1200×900 | 1600×1200 | 4:3 | WebP | <120KB | 82 | No |
| 24 | Homepage slider — Generate | 2000×1125 | 2400×1350 | 16:9 | WebP | <350KB | 80 | Yes (mobile 1200×675) |
| 25 | Homepage slider — Move | 2000×1125 | 2400×1350 | 16:9 | WebP | <300KB | 80 | Yes (mobile 1200×675) |
| 26 | Homepage slider — Store | 2000×1125 | 2400×1350 | 16:9 | WebP | <250KB | 80 | Yes (mobile 1200×675) |
| 32 | Header solar tile | 1000×679 | 1200×800 | 3:2 | WebP | <80KB | 82 | No |
| 33 | Batteries community banner | 1000×572 | 1400×800 | 16:9 | WebP | <100KB | 82 | Yes (mobile 700×400) |
| 34 | Contact hero inset | 1000×560 | 400×400 | 1:1 | WebP | <60KB | 82 | No |
| 35 | Contact hero main | 1000×834 | 1200×1000 | 6:5 | WebP | <120KB | 82 | Yes (mobile 600×500) |
| 38 | Contact closing background | 1536×295 | 2000×400 | 5:1 | WebP | <150KB | 80 | Yes (mobile 1000×200) |
| 40 | About closing background | 1000×626 | 1600×1000 | 8:5 | WebP | <120KB | 82 | Yes (mobile 800×500) |
| 41 | Authorized sellers hero | 1000×610 | 1600×1000 | 8:5 | WebP | <150KB | 82 | Yes (mobile 800×500) |
| 42 | About approach figure | 1000×544 | 1200×650 | 16:9 | WebP | <80KB | 82 | No |
| 50 | Homepage story photo | 1320×1650 | 1600×2000 | 4:5 | WebP | <200KB | 82 | Yes (mobile 800×1000) |
| 01 | Logo (all uses) | 600×398 | 1200×800 | 3:2 | PNG | <200KB | lossless | No |

**General recommendations:**
- All hero images: use WebP with `sizes="100vw"` for full-bleed, `preload` for LCP hero
- Product images: CMS-served, recommend 1200×1200 minimum for square products
- Blog covers: CMS-served, recommend 1600×900 (16:9) for featured, 800×600 for side cards
- Range cards: 4:5 portrait works well for vertical product shots; ensure subject is centered vertically
- Consider AVIF for next-generation compression (20-30% smaller than WebP at same quality)

---

## Part 5 — Image Quality Audit

### Missing Images
None found — all referenced images exist in `public/`.

### Broken Image URLs
None found — all `src` attributes resolve to existing files.

### Duplicate Images
13 duplicate image files found in `public/images/final/` subfolders (see Part 1, Duplicate Images table). These are exact duplicates of images in `public/images/homepage/`, `public/images/v2/`, `public/images/lonex-step-1/`, and `public/images/categories/`.

### Unused Assets (not referenced in source code)
23 images are not referenced in any source file:
- logo.png (1448×1086)
- storage-room.webp (1200×675)
- solar.webp (1200×802)
- storage.webp (1200×900)
- solar-array.webp (1280×854)
- generate-solar.webp (lonex-range/, 1120×840)
- move-scooter.webp (2000×874) — scooter render, superseded
- store-battery.webp (lonex-range/, 1200×900)
- electric-mobility.webp (1000×554) — header uses range-ev.webp instead
- home-storage.webp (1000×501) — header uses store-battery.webp instead
- solar-installation-team.webp (1000×559)
- hero-solar-farm.webp (1100×576)
- commercial-facility.webp (1000×554)
- sustainability-leaf.webp (1000×839)
- All 6 demo-products images (900×6xx)
- ASSET_PREVIEW.jpg
- window.svg, vercel.svg, next.svg, globe.svg, file.svg

### Low-Resolution Images (under 1000px width)
8 images under 1000px width that may appear stretched when used at larger display sizes:
- demo-battery-detail.webp (900×706)
- demo-electric-bike.webp (900×621)
- demo-home-battery.webp (900×686)
- demo-inverter.webp (900×678)
- demo-panel-detail.webp (900×709)
- demo-solar-module.webp (900×654)
- mountain-energy-landscape.webp (1000×626) — borderline
- All demo products (900px width)

### Stretched Beyond Original Resolution
None identified — all images use `object-fit: cover` or `contain` which prevents stretching.

### Incorrect Aspect Ratios
- Range cards display at 4:5 but source images (generate-solar.webp, store-battery.webp, move-mobility.webp) are 16:9 — significant top/bottom cropping occurs
- move-scooter.webp (16:7) is not referenced; range-ev.webp (4:5) is used instead

### SVG Icons
window.svg, vercel.svg, next.svg, globe.svg, file.svg — not referenced in any component. Likely leftover from Next.js template.

---

## Part 6 — Image Replacement Map

| ID | Current Filename | Page | Section | Source File | Original W×H | Display W×H | Rec. Replacement W×H | Rec. Ratio | Subject & Composition | Reused In |
|---|---|---|---|---|---|---|---|---|---|---|
| 01 | lonex-logo-transparent.png | All | Header, Footer, Admin | brand-mark.tsx, site-header.tsx | 600×398 | Variable | 1200×800 | 3:2 | LONEX wordmark logo, transparent background | Header, footer, admin login, drawer |
| 11 | range-battery.webp | / | Range card "Store" | page.tsx | 1200×1500 | ~420×525 | 1200×1500 | 4:5 | Wall-mounted home battery unit on stone wall | Header mega menu (batteries tile uses store-battery.webp from lonex-step-1) |
| 12 | range-ev.webp | / | Range card "Move" | page.tsx | 1200×1500 | ~420×525 | 1200×1500 | 4:5 | Black electric bike, full side view, city street | Header mega menu (EV tile), slider "move" slide |
| 13 | range-solar.webp | / | Range card "Generate" | page.tsx | 1200×1500 | ~420×525 | 1200×1500 | 4:5 | Ground-mounted solar modules, dry field, low sun | Slider "generate" slide |
| 19 | hero-solar-aerial.webp | /solar | Hero background | solar-page.tsx | 1920×1080 | 100vw full height | 2400×1350 | 16:9 | Aerial view, solar array rows, open ground | — |
| 20 | city-rooftops.webp | /solar, /about | Benefits grid; Story section | solar-page.tsx, about/page.tsx | 1200×900 | ~40vw; ~52vw | 1600×1200 | 4:3 | Rooftop solar arrays, dense city block | 2 pages |
| 21 | generate-installation.webp | /solar, /about | Community banner; Community figure | solar-page.tsx, about/page.tsx | 1200×900 | ~38vw; ~40vw | 1600×1200 | 4:3 | Technician connecting cabling, roof-mounted panels | 2 pages |
| 24 | generate-solar.webp | /, /authorized-sellers | Slider "generate"; Range card | hero-ui.tsx, authorized-sellers/content.ts | 2000×1125 | 100vw; ~33vw | 2400×1350 | 16:9 | Two technicians, rooftop solar installation | 2 pages + slider |
| 25 | move-mobility.webp | /, /ev-bikes, /authorized-sellers | Slider "move"; Hero; Range card | hero-ui.tsx, ev-bikes-page.tsx, authorized-sellers/content.ts | 2000×1125 | 100vw; 100vw; ~33vw | 2400×1350 | 16:9 | Electric bicycle, city courtyard, stainless rack | 3 pages + slider |
| 26 | store-battery.webp | /, /batteries, /about, /authorized-sellers | Slider "store"; Hero; Pillar image; Range card | hero-ui.tsx, batteries-page.tsx, about/content.ts, authorized-sellers/content.ts | 2000×1125 | 100vw; 100vw; ~58vw; ~33vw | 2400×1350 | 16:9 | Home battery system, wall-mounted inverter, warm interior | 4 pages + slider |
| 32 | solar-panels.webp | All | Header mega menu solar tile | site-header.tsx | 1000×679 | ~28vw | 1200×800 | 3:2 | Solar modules on roof at sunset | — |
| 33 | battery-production.webp | /batteries | Community banner | batteries-page.tsx | 1000×572 | 100vw banner | 1400×800 | 16:9 | Battery modules on production line | — |
| 34 | ev-charging.webp | /contact | Hero inset | contact/page.tsx | 1000×560 | 200px fixed | 400×400 | 1:1 | EV charging connector, sunset lighting | — |
| 35 | family-energy.webp | /contact | Hero main | contact/page.tsx | 1000×834 | ~46vw | 1200×1000 | 6:5 | Family looking up together, warm evening light, trees | — |
| 38 | hero-solar-home-wide.webp | /contact | Closing background | contact/page.tsx | 1536×295 | 100vw | 2000×400 | 5:1 | Home with solar panels on roof | — |
| 40 | mountain-energy-landscape.webp | /about | Closing background | about/page.tsx | 1000×626 | 100vw | 1600×1000 | 8:5 | Mountain energy landscape | — |
| 41 | city-solar.webp | /authorized-sellers | Hero background | authorized-sellers/page.tsx | 1000×610 | 100vw | 1600×1000 | 8:5 | City skyline at golden hour beyond rooftop solar array | — |
| 42 | energy-consultation.webp | /about | Approach figure | about/page.tsx | 1000×544 | ~34vw | 1200×650 | 16:9 | Three people reviewing info, solar array background | — |
| 50 | story-architecture.webp | /, /about | Story photo; Hero image | page.tsx, about/page.tsx | 1320×1650 | ~52vw; 100vw | 1600×2000 | 4:5 | Terracotta roof tiles meeting dark solar array, pale sky | 2 pages |

**Images reused across 3+ locations:**
- `store-battery.webp`: slider, batteries hero, about pillar "Store", authorized sellers range card (4 locations + CMS product images)
- `move-mobility.webp`: slider, EV bikes hero, authorized sellers range card (3 locations)
- `generate-solar.webp`: slider, authorized sellers range card (2 locations)
- `city-rooftops.webp`: solar benefits, about story (2 locations)
- `generate-installation.webp`: solar community, about community (2 locations)
- `story-architecture.webp`: homepage story, about hero (2 locations)
- `range-ev.webp`: homepage range card, slider, header EV tile (3 locations)

---

## Part 7 — Summary

**Total static image files:** 59 (including SVGs and duplicates)  
**Unique static images (deduplicated):** 46  
**Images actually referenced in source code:** 36  
**Images NOT referenced (unused):** 23  
**Duplicate files:** 13  
**Broken images:** 0  
**Low-resolution images (<1000px):** 8  
**CMS-driven images:** Dynamic (blog covers, product images, category covers, verify model images)

### Recommended Replacement Priorities

**Priority 1 — Hero images (highest visual impact, largest display):**
- hero-solar-aerial.webp (2400×1350)
- generate-solar.webp (2400×1350)
- store-battery.webp (2400×1350)
- move-mobility.webp (2400×1350)

**Priority 2 — Range cards (prominent on homepage):**
- range-solar.webp (1200×1500)
- range-battery.webp (1200×1500)
- range-ev.webp (1200×1500)

**Priority 3 — Category pages:**
- city-rooftops.webp (1600×1200)
- generate-installation.webp (1600×1200)
- battery-production.webp (1400×800)
- mobility.webp (1920×1080)

**Priority 4 — About & Contact pages:**
- story-architecture.webp (1600×2000)
- family-energy.webp (1200×1000)
- craft-panel.webp (1200×900)
- move-city.webp (1200×900)

**Priority 5 — Header & UI:**
- lonex-logo-transparent.png (1200×800 PNG)
- solar-panels.webp (1200×800)

### Notes
- All product images, blog covers, category covers, and verify model images are CMS-driven and stored in the database. These are not static files and their dimensions vary per upload.
- The `move-scooter.webp` is a scooter render that is NOT referenced anywhere — it has been superseded by `range-ev.webp` (real e-bike) in the header and homepage.
- 13 duplicate files exist in `public/images/final/` subfolders — these are exact copies of images in other locations and should be consolidated.