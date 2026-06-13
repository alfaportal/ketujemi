/**
 * Apply KetuJemi logo to Capacitor Android/iOS native assets.
 * Run after `npx cap add android|ios` or when source logos change.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const publicDir = path.join(root, "public");
const androidRes = path.join(root, "android", "app", "src", "main", "res");
const iosAssets = path.join(root, "ios", "App", "App", "Assets.xcassets");

function copy(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function copyToDir(src, dir) {
  for (const file of fs.readdirSync(dir)) {
    if (file.endsWith(".png")) {
      copy(src, path.join(dir, file));
    }
  }
}

const logoApp = path.join(publicDir, "logo-app.png");
const icons = {
  mdpi: path.join(publicDir, "icons", "icon-72.png"),
  hdpi: path.join(publicDir, "icons", "icon-72.png"),
  xhdpi: path.join(publicDir, "icons", "icon-96.png"),
  xxhdpi: path.join(publicDir, "icons", "icon-144.png"),
  xxxhdpi: path.join(publicDir, "icons", "icon-192.png"),
};

for (const [density, icon] of Object.entries(icons)) {
  const dir = path.join(androidRes, `mipmap-${density}`);
  for (const name of ["ic_launcher.png", "ic_launcher_round.png", "ic_launcher_foreground.png"]) {
    copy(icon, path.join(dir, name));
  }
}

for (const entry of fs.readdirSync(androidRes, { withFileTypes: true })) {
  if (entry.isDirectory() && entry.name.startsWith("drawable")) {
    copy(logoApp, path.join(androidRes, entry.name, "splash.png"));
  }
}

const iosIcon = path.join(publicDir, "icons", "pwa-512x512.png");
copy(iosIcon, path.join(iosAssets, "AppIcon.appiconset", "AppIcon-512@2x.png"));

const splashDir = path.join(iosAssets, "Splash.imageset");
for (const file of fs.readdirSync(splashDir)) {
  if (file.endsWith(".png")) {
    copy(logoApp, path.join(splashDir, file));
  }
}

console.log("Capacitor branding applied (Android + iOS icons & splash).");
