# -*- coding: utf-8 -*-
"""Genera data/tablaDias.js desde data/tablaDias.json para que los gráficos funcionen sin servidor (file://)."""
import json
import os

base = os.path.dirname(os.path.abspath(__file__))
json_path = os.path.join(base, 'data', 'tablaDias.json')
js_path = os.path.join(base, 'data', 'tablaDias.js')

with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

js_content = 'window.TABLA_DIAS = ' + json.dumps(data, ensure_ascii=False) + ';\n'
with open(js_path, 'w', encoding='utf-8') as f:
    f.write(js_content)

print('Generado:', js_path, '(', len(data), 'filas )')
