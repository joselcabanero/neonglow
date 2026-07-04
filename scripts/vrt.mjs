import { createServer } from "node:http";
import { mkdirSync, existsSync, readFileSync, writeFileSync, copyFileSync, readdirSync } from "node:fs";
import sirv from "sirv";
import { chromium } from "playwright";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

const STATIC = "apps/docs/storybook-static";
const THEMES = ["light", "dark"];
const THRESHOLD = 0.001; // 0.1% differing pixels

if (!existsSync(`${STATIC}/index.json`)) {
  console.error(`Missing ${STATIC}. Run: pnpm --filter @neonglow/docs build`);
  process.exit(1);
}

const server = createServer(sirv(STATIC, { single: false })).listen(0);
const port = server.address().port;
const index = JSON.parse(readFileSync(`${STATIC}/index.json`, "utf8"));
const stories = Object.values(index.entries).filter((e) => e.type === "story");

for (const d of ["vrt/current", "vrt/diff", "vrt/baseline"]) mkdirSync(d, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 640 } });
let failures = 0, seeded = 0;

for (const story of stories) {
  for (const theme of THEMES) {
    const name = `${story.id}--${theme}.png`;
    await page.goto(`http://localhost:${port}/iframe.html?id=${story.id}&globals=theme:${theme}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(150);
    await page.screenshot({ path: `vrt/current/${name}` });
    const basePath = `vrt/baseline/${name}`;
    if (!existsSync(basePath)) { copyFileSync(`vrt/current/${name}`, basePath); seeded++; continue; }
    const a = PNG.sync.read(readFileSync(basePath));
    const b = PNG.sync.read(readFileSync(`vrt/current/${name}`));
    if (a.width !== b.width || a.height !== b.height) { failures++; console.error("SIZE DIFF", name); continue; }
    const diff = new PNG({ width: a.width, height: a.height });
    const n = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold: 0.15 });
    if (n / (a.width * a.height) > THRESHOLD) {
      failures++;
      writeFileSync(`vrt/diff/${name}`, PNG.sync.write(diff));
      console.error(`DIFF ${name}: ${n}px`);
    }
  }
}

await browser.close();
server.close();
console.log(`VRT: ${stories.length} stories x ${THEMES.length} themes, ${seeded} baselines seeded, ${failures} failures`);
process.exit(failures ? 1 : 0);
