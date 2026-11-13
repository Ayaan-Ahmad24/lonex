import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const base = process.env.BASE_URL ?? "http://localhost:3402";
const root = "artifacts/lonex-step-2-review";

const viewports = [
  { dir: "1440", width: 1440, height: 900 },
  { dir: "768", width: 768, height: 1024 },
  { dir: "390", width: 390, height: 844 },
];

for (const vp of viewports) {
  await mkdir(path.join(root, vp.dir), { recursive: true });
}

const screenshots = [];
const reports = [];
const failures = [];
const consoleErrors = [];
const pageErrors = [];

function check(label, condition, detail) {
  if (!condition) {
    failures.push({ label, detail });
  }
}

function isTransparent(color) {
  if (!color) return false;
  if (color === "transparent") return true;
  const match = color.match(/rgba?\(([^)]+)\)/);
  if (!match) return false;
  const parts = match[1].split(",").map((part) => Number(part.trim()));
  return parts.length === 4 ? parts[3] === 0 : false;
}

function isOpaque(color) {
  if (!color) return false;
  if (color === "transparent") return false;
  const match = color.match(/rgba?\(([^)]+)\)/);
  if (!match) return false;
  const parts = match[1].split(",").map((part) => Number(part.trim()));
  return parts.length === 3 || parts[3] > 0.95;
}

function isShadowless(value) {
  if (!value || value === "none") return true;
  const oklab = value.match(/oklab\([^)]*\/\s*([\d.]+)\s*\)/);
  if (oklab) return Number(oklab[1]) === 0;
  const rgba = value.match(/rgba\(([^)]+)\)/);
  if (rgba) {
    const parts = rgba[1].split(",").map((part) => Number(part.trim()));
    return parts.length === 4 && parts[3] === 0;
  }
  return false;
}

async function shot(page, relPath) {
  const buffer = await page.screenshot({ type: "png" });
  await writeFile(path.join(root, relPath), buffer);
  screenshots.push(relPath.replaceAll("\\", "/"));
}

async function readState(page) {
  return page.evaluate(() => {
    const header = document.querySelector(".site-header");
    const hero = document.querySelector(".lx-hero");
    const nav = document.querySelector(".site-header__nav");
    const link = document.querySelector('.site-nav-link[href="/verify"]');
    const toggle = document.querySelector(".site-menu-toggle");
    const topLine = document.querySelector(".lx-hero__top");
    const headerRect = header.getBoundingClientRect();
    const heroRect = hero.getBoundingClientRect();

    const textTarget =
      nav && getComputedStyle(nav).display !== "none" ? link : toggle;

    return {
      scrollY: window.scrollY,
      className: header.className,
      background: getComputedStyle(header).backgroundColor,
      borderColor: getComputedStyle(header).borderBottomColor,
      borderWidth: getComputedStyle(header).borderBottomWidth,
      boxShadow: getComputedStyle(header).boxShadow,
      headerTop: headerRect.top,
      headerHeight: headerRect.height,
      heroTop: heroRect.top,
      heroHeight: heroRect.height,
      navDisplay: nav ? getComputedStyle(nav).display : null,
      navColor: textTarget ? getComputedStyle(textTarget).color : null,
      toggleVisible:
        toggle ? getComputedStyle(toggle).display !== "none" : false,
      toggleBorder: toggle ? getComputedStyle(toggle).borderColor : null,
      toggleBackground: toggle ? getComputedStyle(toggle).backgroundColor : null,
      topLineTop: topLine ? topLine.getBoundingClientRect().top : null,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      scrollHeight: document.documentElement.scrollHeight,
      elementAtHeaderCentre: (() => {
        const node = document.elementFromPoint(
          window.innerWidth / 2,
          Math.min(20, headerRect.height / 2),
        );
        return node ? node.closest(".site-header") !== null : false;
      })(),
    };
  });
}

async function settle(page, ms = 460) {
  await page.waitForTimeout(ms);
}

const browser = await chromium.launch({ headless: true });

for (const vp of viewports) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(`${vp.dir}: ${message.text()}`);
    }
  });
  page.on("pageerror", (error) => {
    pageErrors.push(`${vp.dir}: ${error.message}`);
  });

  await page.goto(base, { waitUntil: "networkidle", timeout: 60000 });
  await page.locator(".lx-hero__headline").waitFor({ state: "visible" });
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForFunction(() =>
    Array.from(document.querySelectorAll(".lx-hero img")).every(
      (image) => image.complete && image.naturalWidth > 0,
    ),
  );

  await page.evaluate(() => window.scrollTo(0, 0));
  await settle(page, 700);

  const top = await readState(page);
  await shot(page, `${vp.dir}/top.png`);

  check(`${vp.dir} top: over-hero class`, top.className.includes("site-header--over-hero"), top.className);
  check(`${vp.dir} top: not scrolled`, !top.className.includes("is-scrolled"), top.className);
  check(`${vp.dir} top: header transparent`, isTransparent(top.background), top.background);
  check(`${vp.dir} top: border transparent`, isTransparent(top.borderColor), top.borderColor);
  check(`${vp.dir} top: header at viewport top`, Math.abs(top.headerTop) < 1, top.headerTop);
  check(`${vp.dir} top: hero starts behind header`, Math.abs(top.heroTop) < 1, top.heroTop);
  check(`${vp.dir} top: header above hero`, top.elementAtHeaderCentre, top.elementAtHeaderCentre);
  check(`${vp.dir} top: hero is full viewport height`, Math.abs(top.heroHeight - vp.height) < 1.5 || top.heroHeight >= 620, `${top.heroHeight} / ${vp.height}`);
  check(`${vp.dir} top: no horizontal overflow`, top.scrollWidth <= top.clientWidth + 1, `${top.scrollWidth} > ${top.clientWidth}`);
  check(`${vp.dir} top: hero top line clears header`, top.topLineTop >= top.headerHeight - 1, `${top.topLineTop} / ${top.headerHeight}`);
  if (top.navDisplay === "flex") {
    check(`${vp.dir} top: nav text is white`, /rgba?\(255,\s*255,\s*255/.test(top.navColor ?? "") || (top.navColor ?? "").includes("255"), top.navColor);
  } else {
    check(`${vp.dir} top: menu toggle visible`, top.toggleVisible, top.toggleVisible);
    check(`${vp.dir} top: toggle text is white`, (top.navColor ?? "").includes("255"), top.navColor);
    check(`${vp.dir} top: toggle border is light`, (top.toggleBorder ?? "").includes("255"), top.toggleBorder);
    check(`${vp.dir} top: toggle background clear`, isTransparent(top.toggleBackground), top.toggleBackground);
  }

  // Keyboard focus ring stays visible over the dark hero. A fresh page
  // starts tab order at the skip link, so two tabs reach the brand link.
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  const focus = await page.evaluate(() => {
    const active = document.activeElement;
    return {
      text: active?.textContent?.trim().slice(0, 40) ?? null,
      outlineColor: active ? getComputedStyle(active).outlineColor : null,
      outlineWidth: active ? getComputedStyle(active).outlineWidth : null,
    };
  });
  check(`${vp.dir} keyboard: focus ring is white over hero`, focus.outlineColor.includes("255"), focus);
  reports.push({ viewport: vp.dir, focus });
  await page.evaluate(() => document.activeElement?.blur());

  // Just below the threshold the header must still be clear.
  await page.evaluate(() => window.scrollTo(0, 40));
  await settle(page);
  const below = await readState(page);
  check(`${vp.dir} 40px: still transparent`, isTransparent(below.background), below.background);
  check(`${vp.dir} 40px: not scrolled`, !below.className.includes("is-scrolled"), below.className);
  check(`${vp.dir} 40px: no shadow on the hero`, isShadowless(below.boxShadow), below.boxShadow);

  // Past 50px the header becomes solid.
  await page.evaluate(() => window.scrollTo(0, 60));
  await settle(page);
  const past = await readState(page);
  check(`${vp.dir} 60px: solid class`, past.className.includes("is-scrolled"), past.className);
  check(`${vp.dir} 60px: solid background`, isOpaque(past.background), past.background);
  check(`${vp.dir} 60px: visible border`, !isTransparent(past.borderColor), past.borderColor);
  check(`${vp.dir} 60px: subtle shadow`, !isShadowless(past.boxShadow), past.boxShadow);
  check(`${vp.dir} 60px: header height unchanged`, Math.abs(past.headerHeight - top.headerHeight) < 0.5, `${top.headerHeight} -> ${past.headerHeight}`);
  check(`${vp.dir} 60px: border width unchanged`, past.borderWidth === top.borderWidth, `${top.borderWidth} -> ${past.borderWidth}`);
  if (top.navDisplay === "flex") {
    check(`${vp.dir} 60px: nav text is dark`, !/rgba?\(\s*255/.test(past.navColor ?? ""), past.navColor);
  }

  // Scroll further so the transition is complete for the screenshot.
  await page.evaluate(() => window.scrollTo(0, 260));
  await settle(page);
  const scrolled = await readState(page);
  await shot(page, `${vp.dir}/scrolled.png`);
  check(`${vp.dir} scrolled: header stays at top`, Math.abs(scrolled.headerTop) < 1, scrolled.headerTop);
  check(`${vp.dir} scrolled: hero scrolled away`, scrolled.heroTop < -200, scrolled.heroTop);

  // Back to the top: the header fades back to transparent.
  await page.evaluate(() => window.scrollTo(0, 0));
  await settle(page, 700);
  const restored = await readState(page);
  await shot(page, `${vp.dir}/back-to-top.png`);
  check(`${vp.dir} restored: transparent again`, isTransparent(restored.background), restored.background);
  check(`${vp.dir} restored: class reset`, !restored.className.includes("is-scrolled"), restored.className);
  check(`${vp.dir} restored: no document shift`, Math.abs(restored.scrollHeight - top.scrollHeight) < 1, `${top.scrollHeight} -> ${restored.scrollHeight}`);

  // Menus stay functional while the header is over the hero.
  if (top.navDisplay === "flex") {
    const trigger = page.locator('button[data-nav-menu="products"]');
    await trigger.hover();
    await page.waitForTimeout(420);
    const mega = await page.evaluate(() => {
      const panel = document.querySelector(".site-mega");
      const header = document.querySelector(".site-header");
      return {
        open: panel?.getAttribute("data-open"),
        expanded: document
          .querySelector('button[data-nav-menu="products"]')
          ?.getAttribute("aria-expanded"),
        visibility: panel ? getComputedStyle(panel).visibility : null,
        headerSolid: header?.className.includes("is-scrolled"),
        headerBackground: header ? getComputedStyle(header).backgroundColor : null,
      };
    });
    await shot(page, `${vp.dir}/mega-open-at-top.png`);
    check(`${vp.dir} mega: opens`, mega.open === "true" && mega.expanded === "true", mega);
    check(`${vp.dir} mega: visible`, mega.visibility === "visible", mega.visibility);
    check(`${vp.dir} mega: header turns solid with panel`, mega.headerSolid && isOpaque(mega.headerBackground), mega);

    await page.keyboard.press("Escape");
    await page.waitForTimeout(420);
    const closed = await page.evaluate(() => {
      const panel = document.querySelector(".site-mega");
      const header = document.querySelector(".site-header");
      return {
        open: panel?.getAttribute("data-open"),
        headerSolid: header?.className.includes("is-scrolled"),
        headerBackground: header ? getComputedStyle(header).backgroundColor : null,
      };
    });
    check(`${vp.dir} mega: closes on Escape`, closed.open === "false", closed);
    check(`${vp.dir} mega: header clears again`, !closed.headerSolid && isTransparent(closed.headerBackground), closed);
    reports.push({ viewport: vp.dir, top, below, past, scrolled, restored, mega, closed });

    // The carousel interaction must survive the overlay header.
    if (vp.dir === "1440") {
      const activeBefore = await page
        .locator(".lx-hero__tab.is-active")
        .getAttribute("aria-label");
      await page.locator('button[aria-label="Next slide"]').click();
      await page.waitForTimeout(900);
      const activeAfter = await page
        .locator(".lx-hero__tab.is-active")
        .getAttribute("aria-label");
      await page.locator('button[aria-label="Pause slideshow"]').click();
      await page.waitForTimeout(200);
      const paused = await page.evaluate(() =>
        document.querySelector(".lx-hero")?.classList.contains("is-paused"),
      );
      await page.locator('button[aria-label="Play slideshow"]').click();
      await page.waitForTimeout(200);
      const resumed = await page.evaluate(
        () => !document.querySelector(".lx-hero")?.classList.contains("is-paused"),
      );
      const heroFit = await page.evaluate(() => {
        const hero = document.querySelector(".lx-hero");
        const stage = document.querySelector(".lx-hero__stage");
        return {
          hero: hero?.getBoundingClientRect().height ?? 0,
          stage: stage?.getBoundingClientRect().height ?? 0,
          viewport: window.innerHeight,
        };
      });
      check("1440 hero: next slide advances", activeBefore !== activeAfter, `${activeBefore} -> ${activeAfter}`);
      check("1440 hero: pause works", paused, paused);
      check("1440 hero: resume works", resumed, resumed);
      // The stage is deliberately oversized so the hero background can
      // drift without exposing an edge. It must therefore cover the hero,
      // and the hero must clip the overflow.
      check(
        "1440 hero: stage covers the hero",
        heroFit.stage >= heroFit.hero - 1,
        heroFit,
      );
      check(
        "1440 hero: stage overflow is clipped",
        await page.evaluate(() => {
          const hero = document.querySelector(".lx-hero");
          return hero ? getComputedStyle(hero).overflow === "hidden" : false;
        }),
        heroFit,
      );
      reports.push({ viewport: "1440-hero", activeBefore, activeAfter, paused, resumed, heroFit });

      // All three slides must stay readable behind the transparent header.
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300);
      await shot(page, "1440/top-slide-02.png");
      await page
        .locator('button[aria-label="03: Move — Electric mobility"]')
        .click();
      await page.waitForTimeout(1100);
      await shot(page, "1440/top-slide-03.png");
    }
  } else {
    const toggle = page.locator(".site-menu-toggle");
    await toggle.click();
    await page.waitForTimeout(520);
    const drawer = await page.evaluate(() => {
      const panel = document.querySelector(".site-drawer");
      return {
        open: panel?.getAttribute("data-open"),
        expanded: document
          .querySelector(".site-menu-toggle")
          ?.getAttribute("aria-expanded"),
        panelVisible: panel
          ? getComputedStyle(panel).visibility
          : null,
        closeFocused:
          document.activeElement === document.querySelector(".site-drawer__close"),
      };
    });
    await shot(page, `${vp.dir}/drawer-open.png`);
    check(`${vp.dir} drawer: opens`, drawer.open === "true" && drawer.expanded === "true", drawer);
    check(`${vp.dir} drawer: panel visible`, drawer.panelVisible === "visible", drawer.panelVisible);
    check(`${vp.dir} drawer: close receives focus`, drawer.closeFocused, drawer.closeFocused);

    await page.keyboard.press("Escape");
    await page.waitForTimeout(520);
    const drawerClosed = await page.evaluate(() => {
      const panel = document.querySelector(".site-drawer");
      return {
        open: panel?.getAttribute("data-open"),
        expanded: document
          .querySelector(".site-menu-toggle")
          ?.getAttribute("aria-expanded"),
        triggerFocused:
          document.activeElement === document.querySelector(".site-menu-toggle"),
      };
    });
    check(`${vp.dir} drawer: closes on Escape`, drawerClosed.open === "false", drawerClosed);
    check(`${vp.dir} drawer: focus returns to toggle`, drawerClosed.triggerFocused, drawerClosed);
    reports.push({ viewport: vp.dir, top, below, past, scrolled, restored, drawer, drawerClosed });
  }

  // Other pages keep the standard header.
  await page.goto(`${base}/about`, { waitUntil: "networkidle", timeout: 60000 });
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(400);
  const about = await page.evaluate(() => {
    const header = document.querySelector(".site-header");
    const nav = document.querySelector(".site-header__nav");
    const link = document.querySelector('.site-nav-link[href="/verify"]');
    const cs = getComputedStyle(header);
    return {
      className: header.className,
      background: cs.backgroundColor,
      borderColor: cs.borderBottomColor,
      shadow: cs.boxShadow,
      height: header.getBoundingClientRect().height,
      navColor:
        nav && getComputedStyle(nav).display !== "none"
          ? getComputedStyle(link).color
          : null,
    };
  });
  await shot(page, `${vp.dir}/about.png`);
  check(`${vp.dir} about: no over-hero class`, !about.className.includes("site-header--over-hero"), about.className);
  check(`${vp.dir} about: solid paper header`, isOpaque(about.background), about.background);
  check(`${vp.dir} about: no hero shadow`, isShadowless(about.shadow), about.shadow);
  check(`${vp.dir} about: header height unchanged`, Math.abs(about.height - top.headerHeight) < 0.5, `${top.headerHeight} -> ${about.height}`);
  if (about.navColor) {
    check(`${vp.dir} about: dark nav text`, !about.navColor.includes("255"), about.navColor);
  }
  reports.push({ viewport: vp.dir, about });

  await context.close();
}

// Reduced motion: the header still swaps states, just without the fade.
{
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();

  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(`reduced-motion: ${message.text()}`);
    }
  });
  page.on("pageerror", (error) => {
    pageErrors.push(`reduced-motion: ${error.message}`);
  });

  await page.goto(base, { waitUntil: "networkidle", timeout: 60000 });
  await page.locator(".lx-hero__headline").waitFor({ state: "visible" });
  await page.waitForTimeout(400);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  const atTop = await readState(page);
  await page.evaluate(() => window.scrollTo(0, 300));
  await page.waitForTimeout(300);
  const scrolledReduced = await readState(page);
  await shot(page, "1440/reduced-motion-scrolled.png");

  check("reduced-motion top: transparent", isTransparent(atTop.background), atTop.background);
  check("reduced-motion scrolled: solid", isOpaque(scrolledReduced.background), scrolledReduced.background);
  check("reduced-motion: no transition", (await page.evaluate(() => getComputedStyle(document.querySelector(".site-header")).transitionDuration)) === "0s", "transition-duration should be 0s");
  reports.push({ viewport: "1440-reduced-motion", atTop, scrolledReduced });
  await context.close();
}

await writeFile(
  path.join(root, "report.json"),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      base,
      screenshots,
      failures,
      consoleErrors,
      pageErrors,
      reports,
    },
    null,
    2,
  ),
);

await browser.close();

console.log(
  JSON.stringify(
    {
      screenshots: screenshots.length,
      failures,
      consoleErrors,
      pageErrors,
      reports,
    },
    null,
    2,
  ),
);

if (failures.length > 0) {
  process.exitCode = 1;
}
