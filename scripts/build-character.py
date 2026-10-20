"""Turns the character video into sprite sheets for the scroll-driven character.

Usage: python3 scripts/build-character.py path/to/video.mp4
Needs ffmpeg on PATH and Pillow.

Writes assets/character/480-N.webp (25 frames per sheet, 5x5) and
assets/character/poster.webp. The site draws one frame at a time on a canvas,
so scrolling can move the video forward and back smoothly on every phone.
"""
import glob
import json
import os
import subprocess
import sys
import tempfile

from PIL import Image

FPS = 15                 # frames kept per second of video
CROP = '660:660:300:50'  # w:h:x:y of the square around the character in the 1280x720 source
COLS = ROWS = 5
SIZES = (480,)
POSTER_FRAME = 24        # burger in hand

root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
out = os.path.join(root, 'assets', 'character')
os.makedirs(out, exist_ok=True)

src = sys.argv[1]
with tempfile.TemporaryDirectory() as tmp:
    # crop, push the near-white background to pure white, keep FPS frames per second
    subprocess.run([
        'ffmpeg', '-v', 'error', '-i', src, '-an', '-vf',
        f'fps={FPS},crop={CROP},colorlevels=rimax=0.95:gimax=0.95:bimax=0.95',
        os.path.join(tmp, '%04d.png'),
    ], check=True)
    frames = sorted(glob.glob(os.path.join(tmp, '*.png')))
    per = COLS * ROWS
    for size in SIZES:
        for old in glob.glob(os.path.join(out, f'{size}-*.webp')):
            os.remove(old)
        for k in range(0, len(frames), per):
            sheet = Image.new('RGB', (size * COLS, size * ROWS), 'white')
            for j, f in enumerate(frames[k:k + per]):
                im = Image.open(f).convert('RGB').resize((size, size), Image.LANCZOS)
                sheet.paste(im, ((j % COLS) * size, (j // COLS) * size))
            sheet.save(os.path.join(out, f'{size}-{k // per}.webp'), 'WEBP', quality=62, method=6)
    Image.open(frames[POSTER_FRAME]).convert('RGB').resize((480, 480), Image.LANCZOS).save(
        os.path.join(out, 'poster.webp'), 'WEBP', quality=70, method=6)
    meta = {'frames': len(frames), 'fps': FPS, 'cols': COLS, 'rows': ROWS, 'sizes': list(SIZES)}
    with open(os.path.join(out, 'frames.json'), 'w') as fh:
        json.dump(meta, fh)
    print(meta)
