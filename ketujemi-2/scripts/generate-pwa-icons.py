"""
Generate PWA / apple-touch icons with bold white KetuJemi.com wordmark.

Renders vector layout (font-weight 900, #ffffff) for readability on small phone icons.
Optional: place logo-app.png to tune colors from Cloudinary export.
"""
from __future__ import annotations

import os
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    raise SystemExit("Install Pillow: pip install pillow")

ROOT = Path(__file__).resolve().parents[1] / "artifacts" / "vendi" / "public"
OUT = ROOT / "icons"

# Brand (matches logo-icon.svg)
BRAND_BLUE = (21, 87, 176)
BRAND_RING = (74, 144, 232)
TEXT_WHITE = (255, 255, 255)

ICON_SIZES: dict[str, int] = {
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


def _find_black_font() -> str:
    candidates = [
        Path(r"C:\Windows\Fonts\ariblk.ttf"),
        Path(r"C:\Windows\Fonts\ArialBlack.ttf"),
        Path(r"C:\Windows\Fonts\arialbd.ttf"),
        Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"),
        Path("/System/Library/Fonts/Supplemental/Arial Black.ttf"),
    ]
    for path in candidates:
        if path.exists():
            return str(path)
    raise SystemExit(
        "No bold font found (need Arial Black or similar). Install a .ttf and set PWA_ICON_FONT.",
    )


def _font(size: int) -> ImageFont.FreeTypeFont:
    env = Path(os.environ["PWA_ICON_FONT"]) if "PWA_ICON_FONT" in os.environ else None
    path = str(env) if env and env.exists() else _find_black_font()
    return ImageFont.truetype(path, size)


def _text_size(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont) -> tuple[int, int]:
    box = draw.textbbox((0, 0), text, font=font)
    return box[2] - box[0], box[3] - box[1]


def render_app_icon(size: int) -> Image.Image:
    """Square icon: blue disc + ring + heavy white KetuJemi / .com."""
    img = Image.new("RGB", (size, size), BRAND_BLUE)
    draw = ImageDraw.Draw(img)

    pad = size * 0.06
    ring_w = max(2, int(size * 0.022))
    draw.ellipse(
        [pad, pad, size - pad, size - pad],
        fill=BRAND_BLUE,
        outline=BRAND_RING,
        width=ring_w,
    )

    main_px = max(11, int(size * 0.145))
    com_px = max(9, int(size * 0.092))
    stroke = max(1, int(size / 42))

    font_main = _font(main_px)
    font_com = _font(com_px)

    line1 = "KetuJemi"
    line2 = ".com"
    w1, h1 = _text_size(draw, line1, font_main)
    w2, h2 = _text_size(draw, line2, font_com)
    gap = max(2, int(size * 0.012))
    block_h = h1 + gap + h2
    y0 = (size - block_h) / 2

    x1 = (size - w1) / 2
    x2 = (size - w2) / 2

    for text, x, y, font in (
        (line1, x1, y0, font_main),
        (line2, x2, y0 + h1 + gap, font_com),
    ):
        draw.text(
            (x, y),
            text,
            font=font,
            fill=TEXT_WHITE,
            stroke_width=stroke,
            stroke_fill=TEXT_WHITE,
        )

    return img


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)

    for filename, px in ICON_SIZES.items():
        icon = render_app_icon(px)
        dest = OUT / filename
        icon.save(dest, "PNG", optimize=True)
        print(f"wrote {dest} ({px}x{px})")

    logo_square = render_app_icon(512)
    logo_square.save(ROOT / "logo.png", "PNG", optimize=True)
    print(f"wrote {ROOT / 'logo.png'}")


if __name__ == "__main__":
    main()
