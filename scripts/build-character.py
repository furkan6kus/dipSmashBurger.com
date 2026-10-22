"""Turns the character video into white line frames for the scroll-driven background.

Usage: python3 scripts/build-character.py path/to/video.mp4
Needs ffmpeg on PATH and Pillow.

The video's white paper (inside the character too) becomes transparent and the
lines become white, so the character can sit on the green page. Each frame is a
small transparent WebP in assets/character/{720,480}/NNN.webp; the site draws
one at a time on a canvas, so scrolling moves the video forward and back smoothly.
"""
import glob
import json
import os
import shutil
import subprocess
import sys
import tempfile

from PIL import Image, ImageChops

FPS = 15                 # frames kept per second of video
CROP = '660:660:300:50'  # w:h:x:y of the square around the character in the 1280x720 source
SIZES = (720, 480)       # wide screens, phones

root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
out = os.path.join(root, 'assets', 'character')


def white_lines(im):
    rgb = im.convert('RGB')
    lum = rgb.convert('L')
    # paper is transparent, ink is opaque, the anti-aliased edge in between
    alpha = lum.point(lambda v: 0 if v >= 238 else (255 if v <= 120 else int((238 - v) / 118 * 255)))
    # coloured food would turn into solid white shapes: keep it lighter
    sat = rgb.convert('HSV').split()[1]
    alpha = ImageChops.multiply(alpha, sat.point(lambda v: 255 - int(min(v, 200) / 200 * 150)))
    frame = Image.new('RGBA', rgb.size, (255, 255, 255, 0))
    frame.putalpha(alpha)
    return frame


src = sys.argv[1]
with tempfile.TemporaryDirectory() as tmp:
    subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-an', '-vf', f'fps={FPS},crop={CROP}',
                    os.path.join(tmp, '%04d.png')], check=True)
    frames = sorted(glob.glob(os.path.join(tmp, '*.png')))
    if os.path.isdir(out):
        shutil.rmtree(out)
    for size in SIZES:
        os.makedirs(os.path.join(out, str(size)))
    for i, f in enumerate(frames):
        lines = white_lines(Image.open(f))
        for size in SIZES:
            lines.resize((size, size), Image.LANCZOS).save(
                os.path.join(out, str(size), f'{i:03d}.webp'), 'WEBP', quality=50, alpha_quality=50, method=4)
    meta = {'frames': len(frames), 'fps': FPS, 'sizes': list(SIZES)}
    with open(os.path.join(out, 'frames.json'), 'w') as fh:
        json.dump(meta, fh)
    print(meta)
