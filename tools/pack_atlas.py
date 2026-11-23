#!/usr/bin/env python3
"""Собирает art/sprites/*.png в один атлас public/assets/scene.png и пишет src/data/sceneSprites.ts.

Запуск из корня проекта: python3 tools/pack_atlas.py (нужен Pillow).
art/sprites/meta.json: для каждого спрайта k — во сколько раз он уменьшается при отрисовке,
dx, dy — смещение левого верхнего угла от точки привязки на экране, в пикселях спрайта.
"""
import json
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parent.parent
meta = json.loads((root / 'art/sprites/meta.json').read_text())
images = {name: Image.open(root / f'art/sprites/{name}.png').convert('RGBA') for name in meta}

WIDTH = 512
x = y = row = 0
entries = {}
for name in sorted(images, key=lambda n: -images[n].height):
    im = images[name]
    if x + im.width > WIDTH:
        x, y, row = 0, y + row + 1, 0
    entries[name] = [x, y, im.width, im.height, meta[name]['k'], meta[name]['dx'], meta[name]['dy']]
    x += im.width + 1
    row = max(row, im.height)

atlas = Image.new('RGBA', (WIDTH, y + row))
for name, (px, py, *_rest) in entries.items():
    atlas.paste(images[name], (px, py))
atlas.save(root / 'public/assets/scene.png', optimize=True)

lines = [f"  {name}: {json.dumps(entries[name])}," for name in sorted(entries)]
(root / 'src/data/sceneSprites.ts').write_text(
    "// Сгенерировано tools/pack_atlas.py — не править руками.\n"
    "/** public/assets/scene.png: [x, y, w, h, k, dx, dy] */\n"
    "export const SCENE_SPRITES = {\n" + "\n".join(lines) + "\n} as const satisfies Record<string, readonly number[]>;\n\n"
    "export type SceneSprite = keyof typeof SCENE_SPRITES;\n"
)
print(f'{len(entries)} спрайтов, атлас {atlas.size[0]}x{atlas.size[1]}')
