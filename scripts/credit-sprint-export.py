"""Mechanical web exports only; preserve generated originals unchanged."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'website-ventures-assets/credit-sprint-20261007'
for source in sorted((BASE / 'originals').glob('*.png')):
    with Image.open(source) as im:
        im.load()
        for width in (480, 1280):
            out = im.copy()
            out.thumbnail((width, width * 2), Image.Resampling.LANCZOS)
            target = BASE / f'{source.stem}-{width}.webp'
            temporary = target.with_suffix('.webp.tmp')
            out.save(temporary, 'WEBP', quality=78, method=6)
            temporary.replace(target)
            print(target.name, out.size, target.stat().st_size)
