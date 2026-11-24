#!/usr/bin/env python3
"""Рендерит модели art/models в спрайты art/sprites и обновляет их привязки в meta.json.

Запуск из корня проекта: python3 tools/render_models.py [имя ...]   (нужны Node 18+, Pillow и ink-studio)
ink-studio: git clone https://github.com/siliconjungle/shapeshift-labs-ink-studio tools/.ink-studio
            или путь к клону в переменной INK_STUDIO.

Камера у всех моделей одна: параллельная проекция, поворот 45°, наклон 30° — это изометрия игры 2:1.
Модель строится так, что точка привязки спрайта лежит в начале координат, поэтому на рендере
она попадает ровно в центр кадра, и смещение спрайта считается без подгонки.
"""
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parent.parent
ink = Path(os.environ.get('INK_STUDIO', root / 'tools/.ink-studio')) / 'cli/ink-studio.js'
if not ink.exists():
    sys.exit(f'Не найден ink-studio: {ink}. См. описание в начале файла.')

# масштаб рендера задают высота кадра и zoom: при высоте 430 и zoom 1 клетка занимает 64 px
# имя → (ширина клетки в спрайте, во сколько раз спрайт уменьшается при отрисовке, размер кадра)
SCALES = {'out': (64, 2, 1200, 860), 'room': (48, 1, 1200, 860), 'detail': (96, 2, 1200, 860), 'ground': (64, 2, 1800, 1400)}

models = json.loads((root / 'art/models/models.json').read_text())
only = set(sys.argv[1:])
meta_file = root / 'art/sprites/meta.json'
meta = json.loads(meta_file.read_text())

for m in models:
    if only and m['name'] not in only:
        continue
    tile, k, W, H = SCALES[m['scale']]
    with tempfile.TemporaryDirectory() as tmp:
        run = subprocess.run(
            ['node', str(ink), 'export-layers', str(root / 'art/models' / m['file']), '--ortho', '--px', '1', '--px1',
             '--w', str(W), '--h', str(H), '--zoom', str(tile / 64 * 430 / H), '--params', json.dumps(m['params']), '--out', tmp],
            cwd=tmp, capture_output=True, text=True)
        frames = list(Path(tmp).glob('*/color/*.png'))
        if run.returncode or not frames:
            sys.exit(f"{m['name']}: рендер не удался\n{run.stdout[-2000:]}\n{run.stderr[-2000:]}")
        im = Image.open(frames[0]).convert('RGBA')
    # края без полупрозрачности: спрайт рисуется пиксель в пиксель
    im.putalpha(im.getchannel('A').point(lambda a: 255 if a >= 128 else 0))
    box = im.getbbox()
    if not box or box[0] == 0 or box[1] == 0 or box[2] == W or box[3] == H:
        sys.exit(f"{m['name']}: модель пустая или не помещается в кадр {box}")
    im.crop(box).save(root / f"art/sprites/{m['name']}.png")
    meta[m['name']] = {'k': k, 'dx': box[0] - W / 2, 'dy': box[1] - H / 2}
    print(f"{m['name']}: {box[2] - box[0]}x{box[3] - box[1]}")

meta_file.write_text(json.dumps(meta, indent=1, sort_keys=True))
