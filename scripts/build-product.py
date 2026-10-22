"""Turns a product video into the photos and turnable frames the menu uses.

Usage: python3 scripts/build-product.py path/to/video.mp4 dip-purple [poster-frame]
Needs ffmpeg on PATH and Pillow.

Writes assets/products/<id>/:
  photo-900.webp, photo-600.webp  the still on the opening screen (square)
  thumb.webp                      the small picture beside the item in the menu
  frames/NNN.webp                 the frames a guest turns with a finger
  frames.json                     how many frames there are
"""
import glob
import json
import os
import shutil
import subprocess
import sys
import tempfile

from PIL import Image

FRAMES = 72              # frames kept for turning (spread over the whole video)
SIZE = 640               # turning frames, square
CROP = (0, 400, 1080, 1480)  # left, top, right, bottom of the square around the burger in a 1080x1920 video

src, pid = sys.argv[1], sys.argv[2]
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
out = os.path.join(root, 'assets', 'products', pid)

with tempfile.TemporaryDirectory() as tmp:
    subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-an', os.path.join(tmp, '%04d.png')], check=True)
    every = sorted(glob.glob(os.path.join(tmp, '*.png')))
    poster = int(sys.argv[3]) if len(sys.argv) > 3 else len(every) // 2
    if os.path.isdir(out):
        shutil.rmtree(out)
    os.makedirs(os.path.join(out, 'frames'))

    still = Image.open(every[poster]).convert('RGB').crop(CROP)
    for size in (900, 600):
        still.resize((size, size), Image.LANCZOS).save(os.path.join(out, f'photo-{size}.webp'), 'WEBP', quality=78, method=6)
    still.resize((240, 240), Image.LANCZOS).save(os.path.join(out, 'thumb.webp'), 'WEBP', quality=75, method=6)

    picks = [round(i * (len(every) - 1) / (FRAMES - 1)) for i in range(FRAMES)]
    for i, k in enumerate(picks):
        Image.open(every[k]).convert('RGB').crop(CROP).resize((SIZE, SIZE), Image.LANCZOS).save(
            os.path.join(out, 'frames', f'{i:03d}.webp'), 'WEBP', quality=58, method=6)
    with open(os.path.join(out, 'frames.json'), 'w') as fh:
        json.dump({'frames': FRAMES, 'size': SIZE, 'poster': picks.index(min(picks, key=lambda k: abs(k - poster)))}, fh)
print('done', out)
