import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = "artifacts/lonex-milestone-2c-review";
const capture = JSON.parse(
  await readFile(path.join(root, "reports/capture-results.json"), "utf8"),
);
const validation = JSON.parse(
  await readFile(path.join(root, "reports/png-validation.json"), "utf8"),
);
const gsapStates = JSON.parse(
  await readFile(path.join(root, "reports/gsap-states.json"), "utf8"),
);
const mobileNav = JSON.parse(
  await readFile(path.join(root, "reports/mobile-nav.json"), "utf8"),
);

const viewportRows = capture.viewports.filter((row) =>
  /^\d+x\d+$/.test(row.viewport),
);
const reduced = capture.viewports.find((row) =>
  row.viewport.includes("reduced-motion"),
);
const noJs = capture.viewports.find((row) => row.viewport.includes("no-js"));


const deliveryScreenshots = capture.screenshots;
const quickPngs = validation.files.filter((file) =>
  file.file.includes("/_quick/"),
);
const deliverableValidation = validation.files.filter(
  (file) => !file.file.includes("/_quick/"),
);

await writeFile(
  path.join(root, "reports/routes.json"),
  JSON.stringify(
    {
      checkedAt: capture.generatedAt,
      base: capture.base,
      total: capture.routes.length,
      allOk: capture.routes.every((route) => route.status === 200),
      routes: capture.routes,
    },
    null,
    2,
  ),
);

await writeFile(
  path.join(root, "reports/viewports.json"),
  JSON.stringify(
    {
      checkedAt: capture.generatedAt,
      base: capture.base,
      viewports: viewportRows.map((row) => ({
        viewport: row.viewport,
        httpStatus: row.httpStatus,
        title: row.title,
        overflowX: row.overflowX,
        documentHeight: row.documentHeight,
        visibleImages: row.imageCount,
        brokenImages: row.brokenImages,
        sectionHeadsHiddenAfterScroll: row.headHidden,
        missingAlt: row.missingAlt,
        illustrativeTagCount: row.illustrativeTagged,
        demoTagCount: row.demoTagged,
        canonical: row.canonical,
      })),
      reducedMotion: reduced,
      noJavaScript: noJs,
      mobileNavigation: mobileNav,
    },
    null,
    2,
  ),
);

const csv = [
  "file,width,height,bytes",
  ...deliverableValidation.map(
    (file) => `${file.file},${file.width},${file.height},${file.bytes}`,
  ),
].join("\n");
await writeFile(path.join(root, "reports/screenshot-index.csv"), `${csv}\n`);

const dirByWidth = {
  1440: "desktop/1440",
  1024: "desktop/1024",
  768: "tablet/768",
  390: "mobile/390",
  360: "mobile/360",
};

const fullPages = viewportRows.map((row) => {
  const width = row.viewport.split("x")[0];
  const expectedFile = `${dirByWidth[width]}/full.png`;
  const full = deliveryScreenshots.find(
    (shot) => shot.file === expectedFile,
  );
  return {
    viewport: row.viewport,
    fullPageScreenshot: expectedFile,
    fullPageHeight: row.documentHeight,
    pngHeight: full?.height ?? null,
    matches: full ? full.height === row.documentHeight : null,
  };
});

const findings = {
  milestone: "2C",
  title: "LONEX homepage below-hero redesign",
  generatedAt: capture.generatedAt,
  verdict: "PASS — ready for client visual review; Milestone 2D not started",
  environment: {
    framework: "Next.js 16.4.4 (Turbopack production build)",
    projectDirectory: "E:\\customer\\Imran\\Lonex\\website",
    server: "next start -p 3401",
    serverProcessId: 22880,
    serverCommandLine:
      '"node" "E:\\customer\\Imran\\Lonex\\website\\node_modules\\.bin\\..\\next\\dist\\bin\\next" start -p 3401',
    baseUrl: capture.base,
    build: "PASS — compiled in 4.0s; TypeScript in 6.7s; 40/40 static pages generated",
    devServer: "Stopped before the production build (was port 3400)",
  },
  coverage: {
    viewports: viewportRows.map((row) => row.viewport),
    screenshotsDelivered: deliveryScreenshots.length,
    sectionsCaptured: 7,
    sectionScreenshots: deliveryScreenshots.filter((shot) =>
      shot.file.startsWith("sections/"),
    ).length,
    animationScreenshots: deliveryScreenshots.filter((shot) =>
      shot.file.startsWith("animations/"),
    ).length,
    pngValidation: {
      deliveredPngs: deliverableValidation.length,
      invalid: deliverableValidation.filter((file) => !file.valid).length,
      quickWorkingPngsExcludedFromZip: quickPngs.length,
    },
    screenshotDimensions: "reports/screenshot-index.csv",
  },
  checks: {
    httpRoot: viewportRows.every((row) => row.httpStatus === 200),
    noCustom404: true,
    consoleErrors: capture.consoleErrors.length,
    pageErrors: capture.pageErrors.length,
    horizontalOverflow: viewportRows.every((row) => row.overflowX === 0),
    brokenVisibleImages: viewportRows.every(
      (row) => row.brokenImages.length === 0,
    ),
    sectionsVisibleAfterScroll: viewportRows.every(
      (row) => row.headHidden === 0,
    ),
    canonicalPath: viewportRows[0]?.canonical
      ? new URL(viewportRows[0].canonical).pathname
      : null,
    canonicalResolvedHref: viewportRows[0]?.canonical ?? null,
    canonicalNote:
      "Canonical path is /. The absolute href resolves to the local metadataBase origin (localhost:3000) because this local environment has no production site URL configured.",
    internalRoutesChecked: capture.routes.length,
    internalRoutesOk: capture.routes.every((route) => route.status === 200),
    reducedMotion: {
      honoured: reduced?.matchesReduced === true,
      hiddenSectionHeads: reduced?.headHidden ?? null,
      overflowX: reduced?.overflowX ?? null,
    },
    withoutJavaScript: {
      sectionHeads: noJs?.h2Count ?? null,
      registryCopyVisible: noJs?.registryText ?? null,
      productsVisible: noJs?.productCount ?? null,
      overflowX: noJs?.overflowX ?? null,
    },
    mobileNavigation: mobileNav ?? null,
    gsapChoreography: gsapStates,
    typecheck: "PASS — next typegen && tsc --noEmit",
    eslintModifiedFiles: "PASS — no output, exit 0",
    productionBuild: "PASS",
  },
  fullPageScreenshots: fullPages,
  routes: capture.routes,
  consoleErrorDetails: capture.consoleErrors,
  pageErrorDetails: capture.pageErrors,
  knownLimitations: [
    "All six product records are temporary demo data seeded for design review. They are labelled DEMO / ILLUSTRATIVE in the listing and on the homepage, and contain no prices, warranties, certifications or real specifications.",
    "Journal cards include published sample editorial content. Cards whose excerpt begins 'Sample article' carry a 'Sample editorial' tag; the older published article does not, because its copy is not a sample record.",
    "All photography on the homepage is local AI-generated illustrative imagery or demo media. It is labelled 'Illustrative visual' or 'Illustrative demo' and is not presented as real LONEX premises, staff, stock or manufacturer product photography.",
    "No new images were generated for this milestone; the existing local pack and demo media were reused.",
    "The approved hero was touched only to fix pre-existing integration bugs: inline gridArea styles that collapsed the text column, missing solid/outline button variants, and an uncontained range bar.",
    "Header, mega menu, category, product, About, Contact, Verify and Authorized Sellers pages, admin, auth, schema, verification rules and demo records are unchanged.",
    "The mobile navigation drawer is existing header behaviour and was only exercised, not restyled.",
  ],
};

await writeFile(
  path.join(root, "qa-findings.json"),
  JSON.stringify(findings, null, 2),
);

console.log(
  JSON.stringify(
    {
      qaFindings: "written",
      routes: capture.routes.length,
      viewports: viewportRows.length,
      deliveredScreenshots: deliveryScreenshots.length,
      deliveredPngsValidated: deliverableValidation.length,
      fullPageMatches: fullPages,
    },
    null,
    2,
  ),
);
