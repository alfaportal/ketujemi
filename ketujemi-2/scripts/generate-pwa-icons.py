"""Generate PWA PNG icons for KetuJemi.com (run once when branding changes)."""
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    raise SystemExit("Install Pillow: pip install pillow")

OUT = Path(__file__).resolve().parents[1] / "artifacts" / "vendi" / "public" / "icons"
OUT.mkdir(parents=True, exist_ok=True)

BG = (59, 130, 246)  # blue-500
FG = (255, 255, 255)


def draw_icon(size: int) -> Image.Image:
    img = Image.new("RGB", (size, size), BG)
    draw = ImageDraw.Draw(img)
    radius = int(size * 0.2)
    draw.rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill=BG)
    font_size = int(size * 0.32)
    try:
        font = ImageFont.truetype("arialbd.ttf", font_size)
    except OSError:
        font = ImageFont.load_default()
    text = "KJ"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text(((size - tw) / 2, (size - th) / 2 - size * 0.02), text, fill=FG, font=font)
    return img


for px in (192, 512):
    draw_icon(px).save(OUT / f"pwa-{px}x{px}.png", "PNG")
    print(f"wrote {OUT / f'pwa-{px}x{px}.png'}")
