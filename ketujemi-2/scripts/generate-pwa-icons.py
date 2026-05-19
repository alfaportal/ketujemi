"""Generate PWA PNG icons from public/logo.png."""
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    raise SystemExit("Install Pillow: pip install pillow")

ROOT = Path(__file__).resolve().parents[1] / "artifacts" / "vendi" / "public"
SRC = ROOT / "logo.png"
OUT = ROOT / "icons"
OUT.mkdir(parents=True, exist_ok=True)

if not SRC.exists():
    raise SystemExit(f"Missing {SRC}")

src = Image.open(SRC).convert("RGBA")
for px in (192, 512):
    icon = src.copy()
    icon.thumbnail((px, px), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (px, px), (255, 255, 255, 0))
    x = (px - icon.width) // 2
    y = (px - icon.height) // 2
    canvas.paste(icon, (x, y), icon)
    canvas.save(OUT / f"pwa-{px}x{px}.png", "PNG")
    print(f"wrote {OUT / f'pwa-{px}x{px}.png'}")
