# -*- coding: utf-8 -*-
import csv
import json

csv_path = r'c:\Users\i.ulises\Desktop\tablaDias.csv'
json_path = r'c:\Users\i.ulises\Desktop\tablaDias.json'

data = []
with open(csv_path, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f, delimiter=';')
    for row in reader:
        for key in row:
            val = row[key].strip()
            if val and val.isdigit():
                row[key] = int(val)
        data.append(row)

with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f'Convertido: {len(data)} filas -> {json_path}')
