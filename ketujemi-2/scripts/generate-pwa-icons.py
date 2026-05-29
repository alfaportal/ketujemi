"""Generate mobile-friendly PWA icons (opaque, high-contrast, readable on phones)."""
from __future__ import annotations

from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    raise SystemExit("Install Pillow: pip install pillow")

ROOT = Path(__file__).resolve().parents[1] / "artifacts" / "vendi" / "public"
OUT = ROOT / "icons"
OUT.mkdir(parents=True, exist_ok=True)

# Opaque brand colors (RGB only — no alpha; avoids white-on-white on some phones)
BRAND_BG = (21, 72, 140)  # #15488C — darker blue, better contrast
BRAND_RING = (58, 118, 198)
TEXT_FILL = (255, 255, 255)
TEXT_STROKE = (8, 28, 68)

FONT_CANDIDATES = [
    Path("C:/Windows/Fonts/ariblk.ttf"),
    Path("C:/Windows/Fonts/ArialBlack.ttf"),
    Path("C:/Windows/Fonts/segoeuib.ttf"),
    Path("C:/Windows/Fonts/arialbd.ttf"),
    Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"),
    Path("/System/Library/Fonts/Supplemental/Arial Black.ttf"),
]

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


def load_font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for path in FONT_CANDIDATES:
        if path.exists():
            return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


def text_size(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.ImageFont) -> tuple[int, int]:
    box = draw.textbbox((0, 0), text, font=font)
    return box[2] - box[0], box[3] - box[1]


def fit_font(
    draw: ImageDraw.ImageDraw,
    text: str,
    max_w: int,
    max_h: int,
) -> ImageFont.ImageFont:
    for size in range(max_h, 8, -2):
        font = load_font(size)
        w, h = text_size(draw, text, font)
        if w <= max_w and h <= max_h:
            return font
    return load_font(max(10, max_h // 3))


def fit_two_line_font(
    draw: ImageDraw.ImageDraw,
    line1: str,
    line2: str,
    max_w: int,
    max_h: int,
) -> ImageFont.ImageFont:
    for size in range(max_h // 2, 8, -2):
        font = load_font(size)
        w1, h1 = text_size(draw, line1, font)
        w2, h2 = text_size(draw, line2, font)
        gap = max(3, size // 8)
        if max(w1, w2) <= max_w and h1 + gap + h2 <= max_h:
            return font
    return load_font(max(10, max_h // 4))


def draw_label(
    draw: ImageDraw.ImageDraw,
    xy: tuple[float, float],
    text: str,
    font: ImageFont.ImageFont,
    *,
    stroke: int,
) -> None:
    draw.text(
        xy,
        text,
        font=font,
        fill=TEXT_FILL,
        stroke_width=stroke,
        stroke_fill=TEXT_STROKE,
    )


def draw_app_icon(size: int, *, maskable: bool = False) -> Image.Image:
    """Opaque square icon — KJ on small sizes, Ketu/Jemi on larger."""
    img = Image.new("RGB", (size, size), BRAND_BG)
    draw = ImageDraw.Draw(img)

    pad = size * (0.10 if maskable else 0.06)
    ring_w = max(2, int(size * 0.02))
    draw.ellipse(
        [pad, pad, size - pad, size - pad],
        fill=BRAND_BG,
        outline=BRAND_RING,
        width=ring_w,
    )

    inset = int(size * (0.20 if maskable else 0.12))
    area = size - inset * 2
    stroke = max(2, int(size / 56))

    if size <= 96:
        font = fit_font(draw, "KJ", area, area)
        w, h = text_size(draw, "KJ", font)
        draw_label(draw, ((size - w) / 2, (size - h) / 2 - 1), "KJ", font, stroke=stroke)
        return img

    if size <= 152:
        font = fit_font(draw, "KetuJemi", int(area * 0.98), int(area * 0.42))
        w, h = text_size(draw, "KetuJemi", font)
        draw_label(draw, ((size - w) / 2, (size - h) / 2), "KetuJemi", font, stroke=stroke)
        return img

    font = fit_two_line_font(draw, "Ketu", "Jemi", area, int(area * 0.78))
    w1, h1 = text_size(draw, "Ketu", font)
    w2, h2 = text_size(draw, "Jemi", font)
    gap = max(3, font.size // 8)
    block_h = h1 + gap + h2
    y0 = (size - block_h) // 2

    draw_label(draw, ((size - w1) / 2, y0), "Ketu", font, stroke=stroke)
    draw_label(draw, ((size - w2) / 2, y0 + h1 + gap), "Jemi", font, stroke=stroke)
    return img


def main() -> None:
    for filename, px in ICON_SIZES.items():
        maskable = "maskable" in filename
        icon = draw_app_icon(px, maskable=maskable)
        dest = OUT / filename
        icon.save(dest, "PNG")
        print(f"wrote {dest} ({px}x{px})")

    logo = draw_app_icon(512, maskable=False)
    logo.save(ROOT / "logo.png", "PNG")
    logo.save(ROOT / "logo-app.png", "PNG")
    print(f"wrote {ROOT / 'logo.png'}")
    print(f"wrote {ROOT / 'logo-app.png'}")


if __name__ == "__main__":
    main()
