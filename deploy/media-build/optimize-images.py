#!/usr/bin/env python3
"""Generate AVIF + WebP responsive variants for every <img>/poster/CSS image used by the site.
Run from the repo root: python3 deploy/media-build/optimize-images.py
Originals (.jpg/.png) are read from --src (default: the repo itself, or pass a pristine copy)."""
import sys, os, re
from PIL import Image
src_root = sys.argv[1] if len(sys.argv) > 1 else '.'
out_root = '.'
WIDTHS = [480, 960]           # plus the original width (capped at 1600)
def save(im, base, w):
    if im.width > w: im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    im.save(f'{base}.avif', quality=58, speed=4)
    im.save(f'{base}.webp', quality=82, method=6)
    return im.width
def variants(rel, widths=WIDTHS, cap=1600):
    p = os.path.join(src_root, rel); base = os.path.splitext(rel)[0]
    im = Image.open(p); im = im.convert('RGBA') if im.mode in ('P','RGBA','LA') else im.convert('RGB')
    full = min(im.width, cap); done = []
    for w in widths:
        if w < full: done.append(save(im, f'{base}-{w}', w))
    done.append(save(im, base, full))
    return sorted(set(done + [full]))
if __name__ == '__main__':
    html = open(os.path.join(src_root, 'index.html')).read()
    imgs = set(re.findall(r'<img[^>]*?src="((?:img|media)/[^"]+\.jpg)"', html))
    for rel in sorted(imgs):
        print(rel, variants(rel))
    # posters / hero poster used as single files
    posters = set(re.findall(r'poster="(media/[^"]+\.jpg)"', html)) | {'media/flyby.jpg'}
    for rel in sorted(posters - imgs):
        im = Image.open(os.path.join(src_root, rel)).convert('RGB')
        base = os.path.splitext(rel)[0]
        im.save(f'{base}.webp', quality=80, method=6); print(rel, '-> webp poster')
    # logo (displayed at most ~216px wide)
    im = Image.open(os.path.join(src_root, 'img/logo.png')).convert('RGBA')
    for w in (216, 432):
        r = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS); r.save(f'img/logo-{w}.webp', quality=88, method=6)
