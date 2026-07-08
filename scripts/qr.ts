import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import QRCode from "qrcode";
import { KITS } from "../lib/kits";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const OUT_DIR = path.join(process.cwd(), "public", "qr");

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const ids = Object.keys(KITS);
  if (ids.length === 0) {
    console.warn("No kits in registry — nothing to generate.");
    return;
  }
  for (const id of ids) {
    const url = `${BASE_URL}/ar/${id}`;
    const png = path.join(OUT_DIR, `${id}.png`);
    const svg = path.join(OUT_DIR, `${id}.svg`);
    await QRCode.toFile(png, url, { width: 1024, margin: 2 });
    const svgString = await QRCode.toString(url, { type: "svg", margin: 2 });
    await writeFile(svg, svgString, "utf8");
    console.log(`✓ ${id} → ${url}`);
  }
  console.log(`Done. ${ids.length} kit(s) written to public/qr/ (BASE_URL=${BASE_URL})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
