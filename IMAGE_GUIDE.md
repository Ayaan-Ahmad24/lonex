# LONEX — Homepage Image Guide

Premium photography brief for the redesigned home page. **No AI-generated
images** — every image below is a real photograph you can license or shoot.

Drop any image URL you choose into the matching `src` in
`src/app/(site)/page.tsx` (the spots are marked `HERO IMAGE` and
`CategoryTile` uses `category.cover` from the CMS).

---

## 1. Where images go on the home page

| Section | Image role | Where to set it |
|---|---|---|
| Hero (right side) | Large brand/energy photograph — the visual anchor | `Image src="/lonex-logo.png"` in the hero frame (page.tsx). Replace with your supplied photo URL or a `/public` path. |
| Category tiles | One photo per category (Solar, Storage, EV Bikes, Batteries) | `category.cover` — set in the admin CMS per category, or edit the seed data. |
| Featured products | Product photography | `product.image` — set in the admin CMS per product. |

The hero is the only place the page currently hard-codes an image. Everything
else is driven by content you publish through the admin.

---

## 2. Real photo sources (free, commercial use, no attribution required)

These host real photographs — not AI. Search each site with the exact terms
below.

### Unsplash (recommended — highest editorial quality)
- Solar panels / rooftop: https://unsplash.com/s/photos/solar-panel-roof
- Battery / energy storage: https://unsplash.com/s/photos/battery-energy-storage
- Electric bike / EV mobility: https://unsplash.com/s/photos/electric-bike
- Solar installer / warehouse: https://unsplash.com/s/photos/solar-installer
- Pakistan energy / Lahore street: https://unsplash.com/s/photos/pakistan-energy

### Pexels (strong alternative)
- https://pexels.com/search/solar%20panel/
- https://pexels.com/search/energy%20storage/
- https://pexels.com/search/electric%20bike/

### Pixabay
- https://pixabay.com/images/search/solar%20panel/
- https://pixabay.com/images/search/battery%20storage/

**License note:** Unsplash / Pexels / Pixabay photos are free for commercial
use without attribution, but always confirm the license on the individual
photo page before publishing.

---

## 3. Image generation prompts (if you shoot/generate your own)

If you prefer to commission or generate the photography yourself, use these
prompts. They describe **real photographic lighting and materials** — no AI
styling keywords.

### Hero — main brand photograph
> Premium architectural/interior photograph of a modern rooftop solar
> installation at golden hour. Warm sunlight, clean monocrystalline panels on
> a dark tiled roof, subtle lens flare, shallow depth of field. Shot on 35mm
> film, Kodak Portra 400, f/2.8, natural colour grading, editorial
> architecture photography, no people, spacious negative space on the right
> for typography. High resolution, real photograph.

### Category — Solar
> Real photograph of solar panels mounted on a residential roof, bright
> daylight, clear blue sky, crisp detail, architectural photography, f/5.6,
> natural colours, no filters.

### Category — Intelligent storage
> Real photograph of a wall-mounted home battery storage unit in a clean
> garage or utility room, soft directional lighting, minimal composition,
> architectural photography, neutral tones, high detail.

### Category — Electric mobility
> Real photograph of a premium electric bicycle parked outdoors, natural
> daylight, clean background, product photography, f/4, sharp detail, real
> photograph.

### Category — Batteries
> Real photograph of lithium battery cells or a battery bank in a workshop,
> industrial but clean lighting, macro detail, architectural photography,
> neutral background.

---

## 4. Recommended image specifications

| Use | Size (px) | Format | Notes |
|---|---|---|---|
| Hero | 1600 × 2000 (4:5) or wider | WebP / JPEG | Keep focal point centre-right so text on the left stays readable. |
| Category tile | 1200 × 800 (3:2) | WebP / JPEG | One per category; consistent lighting across all four. |
| Product | 800 × 1000 (4:5) | WebP / JPEG | Product centred, clean background. |

Optimise before uploading (e.g. Squoosh / ImageOptim) so the hero doesn't
block LCP.

---

## 5. How to wire an image in

Open `src/app/(site)/page.tsx` and find the hero frame comment:

```tsx
/* ─────────────────────────────────────────────
   HERO IMAGE — replace with a real, premium photograph.
   Drop a supplied photo URL (or /public path) below.
   ───────────────────────────────────────────── */
<Image
  src="/lonex-logo.png"   // <-- replace with your photo URL
  alt="LONEX brand"
  fill
  priority
  sizes="(max-width: 1024px) 90vw, 42vw"
  className="object-contain p-6 sm:p-10 group-hover:scale-105"
/>
```

Change `src="/lonex-logo.png"` to your photo URL, e.g.
`src="https://images.unsplash.com/photo-..."` or a local path like
`src="/public/hero-solar.jpg"` (place the file in `public/`).

For category and product images, set `cover` / `image` in the admin CMS —
those flow through automatically.

---

## 6. Animation notes (already in place)

The page uses CSS-only motion:
- **View-timeline reveals** (`.reveal`, `.reveal-stagger`) — sections and
  children fade up as they enter the viewport.
- **Hero mask & line-up** — the headline writes itself in on load.
- **Parallax hero image** — slow vertical drift on scroll.
- **Lift on hover** — cards and buttons translate upward.
- **Image zoom on hover** — category/product images scale 1.055×.

All motion respects `prefers-reduced-motion: reduce`.

---

## 7. Next step

1. Choose / shoot your hero photograph (and category photos if you want them
   sooner than the CMS flow).
2. Replace the hero `src` in `src/app/(site)/page.tsx`.
3. Run `npm run dev` and review at `http://localhost:3000`.
4. Upload the chosen images to `public/` or the CMS, then commit.

If you find a specific photo URL you like, paste it here and I'll wire it into
the page for you.
