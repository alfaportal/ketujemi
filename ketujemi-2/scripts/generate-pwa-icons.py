"""
Generate square PWA / home-screen icons from public/logo-app.png (or logo.png).

Source logo (Cloudinary): ketujemi-logo_jerh6s — re-download to logo-app.png if updated.

Icons use a solid brand-blue background (no transparency) so iOS/Android
do not render a white square on the home screen.
"""
from __future__ import annotations

from pathlib import Path

try:
    from PIL import Image
except ImportError:
    raise SystemExit("Install Pillow: pip install pillow")

ROOT = Path(__file__).resolve().parents[1] / "artifacts" / "vendi" / "public"
OUT = ROOT / "icons"

# Dominant blue from KetuJemi circular logo
BRAND_BLUE = (21, 87, 176, 255)
WHITE_THRESHOLD = 235


def _pick_source() -> Path:
    for name in ("logo-app.png", "logo.png"):
        p = ROOT / name
        if p.exists():
            return p
    raise SystemExit(f"Missing logo source in {ROOT} (logo-app.png or logo.png)")


def _flatten_to_brand_square(src: Image.Image, size: int) -> Image.Image:
    img = src.convert("RGBA")
    img = img.resize((size, size), Image.Resampling.LANCZOS)
    out = Image.new("RGBA", (size, size), BRAND_BLUE)
    pixels = []
    for r, g, b, a in img.getdata():
        if a < 16 or (r >= WHITE_THRESHOLD and g >= WHITE_THRESHOLD and b >= WHITE_THRESHOLD):
            pixels.append(BRAND_BLUE)
        else:
            pixels.append((r, g, b, 255))
    out.putdata(pixels)
    return out.convert("RGB")


def main() -> None:
    src_path = _pick_source()
    src = Image.open(src_path)
    OUT.mkdir(parents=True, exist_ok=True)

    sizes: dict[str, int] = {
        "icon-72.png": 72,
        "icon-96.png": 96,
        "icon-128.png": 128,
        "icon-144.png": 144,
        "icon-152.png": 152,
        "icon-167.png": 167,
        "apple-touch-icon.png": 180,
        "icon-180.png": 180,
        "pwa-192x192.png": 192,
        "icon-192.png": 192,
        "icon-256.png": 256,
        "icon-384.png": 384,
        "pwa-512x512.png": 512,
        "icon-512.png": 512,
        "pwa-512x512-maskable.png": 512,
    }

    for filename, px in sizes.items():
        icon = _flatten_to_brand_square(src, px)
        dest = OUT / filename
        icon.save(dest, "PNG", optimize=True)
        print(f"wrote {dest} ({px}x{px})")

    # Square favicon / og fallback in public root
    logo_square = _flatten_to_brand_square(src, 512)
    logo_square.save(ROOT / "logo.png", "PNG", optimize=True)
    print(f"wrote {ROOT / 'logo.png'}")


if __name__ == "__main__":
    main()
