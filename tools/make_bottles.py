"""Cut out the bottle photos (white background -> transparent) and create
colour variants of the label for the product range.

Usage: python tools/make_bottles.py
Outputs PNGs into assets/bottles/.
"""
import colorsys
from collections import deque
from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "bottles"
OUT.mkdir(parents=True, exist_ok=True)

# variant name -> (target hue in degrees or None for graphite, saturation scale, value scale)
VARIANTS = {
    "red": None,                    # original
    "blue": (212, 1.0, 0.95),
    "green": (152, 0.85, 0.85),
    "graphite": (None, 0.0, 0.55),  # racing / fully synthetic black label
    "violet": (272, 0.8, 0.9),
    "amber": (28, 1.0, 1.05),
}


def cutout(img: Image.Image) -> Image.Image:
    img = img.convert("RGBA")
    w, h = img.size
    px = img.load()

    def is_bg(p):
        r, g, b, _ = p
        return min(r, g, b) > 200 and (max(r, g, b) - min(r, g, b)) < 30

    seen = bytearray(w * h)
    q = deque()
    for x in range(w):
        q.append((x, 0)); q.append((x, h - 1))
    for y in range(h):
        q.append((0, y)); q.append((w - 1, y))
    mask = Image.new("L", (w, h), 255)
    mp = mask.load()
    while q:
        x, y = q.popleft()
        i = y * w + x
        if seen[i]:
            continue
        seen[i] = 1
        if not is_bg(px[x, y]):
            continue
        mp[x, y] = 0
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < w and 0 <= ny < h and not seen[ny * w + nx]:
                q.append((nx, ny))
    # keep only the largest connected foreground blob (drops shadow specks)
    best, labels = [], bytearray(w * h)
    for sy in range(h):
        for sx in range(w):
            if mp[sx, sy] == 0 or labels[sy * w + sx]:
                continue
            blob, dq = [], deque([(sx, sy)])
            labels[sy * w + sx] = 1
            while dq:
                x, y = dq.popleft()
                blob.append((x, y))
                for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                    if 0 <= nx < w and 0 <= ny < h and mp[nx, ny] and not labels[ny * w + nx]:
                        labels[ny * w + nx] = 1
                        dq.append((nx, ny))
            if len(blob) > len(best):
                best = blob
    keep = set(best)
    for y in range(h):
        for x in range(w):
            if mp[x, y] and (x, y) not in keep:
                mp[x, y] = 0
    # soften the edge slightly
    mask = mask.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))
    img.putalpha(mask)
    bbox = mask.point(lambda v: 255 if v > 20 else 0).getbbox()
    return img.crop(bbox)


def recolor(img: Image.Image, spec) -> Image.Image:
    if spec is None:
        return img.copy()
    hue, sat_k, val_k = spec
    out = img.copy()
    px = out.load()
    w, h = out.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            hh, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
            deg = hh * 360
            # only touch the red family (label + cap), leave gold, grey, white alone
            if s < 0.28 or not (deg < 22 or deg > 335):
                continue
            nh = (hue / 360) if hue is not None else hh
            ns = min(1.0, s * sat_k)
            nv = min(1.0, v * val_k)
            nr, ng, nb = colorsys.hsv_to_rgb(nh, ns, nv)
            px[x, y] = (int(nr * 255), int(ng * 255), int(nb * 255), a)
    return out


def main():
    for side in ("front", "back"):
        base = cutout(Image.open(ROOT / f"{side}.jpg"))
        for name, spec in VARIANTS.items():
            recolor(base, spec).save(OUT / f"{side}-{name}.png", optimize=True)
            print("wrote", f"{side}-{name}.png")


if __name__ == "__main__":
    main()
