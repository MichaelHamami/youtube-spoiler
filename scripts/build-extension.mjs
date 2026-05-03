import { copyFileSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

const rootDir = process.cwd();
const publicDir = join(rootDir, "public");
const staticFiles = [
  "manifest.json",
  "content-script.js",
  "icon_16.png",
  "icon_32.png",
  "icon_48.png",
  "icon_128.png",
];

rmSync(publicDir, { recursive: true, force: true });
execSync("npm --prefix extension-ui run build", {
  cwd: rootDir,
  stdio: "inherit",
});

mkdirSync(publicDir, { recursive: true });

for (const file of staticFiles) {
  copyFileSync(join(rootDir, file), join(publicDir, file));
}
