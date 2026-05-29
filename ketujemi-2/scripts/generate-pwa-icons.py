"""Generate mobile-friendly PWA icons (readable on home screen)."""
from __future__ import annotations

from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    raise SystemExit("Install Pillow: pip install pillow")

ROOT = Path(__file__).resolve().parents[1] / "artifacts" / "vendi" / "public"
OUT = ROOT / "icons"
OUT.mkdir(parents=True, exist_ok=True)

# Brand blue — matches site UI (#1A56A0)
BRAND = (26, 86, 160, 255)
WHITE = (255, 255, 255, 255)

FONT_CANDIDATES = [
    Path("C:/Windows/Fonts/segoeuib.ttf"),
    Path("C:/Windows/Fonts/arialbd.ttf"),
    Path("C:/Windows/Fonts/calibrib.ttf"),
    Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"),
    Path("/System/Library/Fonts/Supplemental/Arial Bold.ttf"),
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
        gap = max(4, size // 10)
        total_h = h1 + gap + h2
        total_w = max(w1, w2)
        if total_w <= max_w and total_h <= max_h:
            return font
    return load_font(max(12, max_h // 4))


def draw_wordmark(size: int, *, maskable: bool = False) -> Image.Image:
    """Two-line Ketu / Jemi — legible when scaled to ~48px on phones."""
    img = Image.new("RGBA", (size, size), BRAND)
    draw = ImageDraw.Draw(img)

    inset = int(size * (0.14 if maskable else 0.10))
    area = size - inset * 2

    font = fit_two_line_font(draw, "Ketu", "Jemi", area, int(area * 0.72))
    w1, h1 = text_size(draw, "Ketu", font)
    w2, h2 = text_size(draw, "Jemi", font)
    gap = max(4, font.size // 10)
    block_h = h1 + gap + h2
    y0 = (size - block_h) // 2

    draw.text(((size - w1) // 2, y0), "Ketu", font=font, fill=WHITE)
    draw.text(((size - w2) // 2, y0 + h1 + gap), "Jemi", font=font, fill=WHITE)
    return img


def main() -> None:
    for filename, px in ICON_SIZES.items():
        maskable = "maskable" in filename
        icon = draw_wordmark(px, maskable=maskable)
        dest = OUT / filename
        icon.save(dest, "PNG", optimize=True)
        print(f"wrote {dest} ({px}x{px})")

    logo = draw_wordmark(512, maskable=False)
    logo.save(ROOT / "logo.png", "PNG", optimize=True)
    print(f"wrote {ROOT / 'logo.png'}")


if __name__ == "__main__":
    main()
