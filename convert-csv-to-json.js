const fs = require('fs');
const path = require('path');

const csvPath = path.join('c:', 'Users', 'i.ulises', 'Desktop', 'tablaDias.csv');
const jsonPath = path.join('c:', 'Users', 'i.ulises', 'Desktop', 'tablaDias.json');

const csv = fs.readFileSync(csvPath, 'utf8');
const lines = csv.trim().split(/\r?\n/);
const headers = lines[0].split(';');

const data = lines.slice(1)
  .filter(line => line.trim())
  .map(line => {
    const values = line.split(';');
    const obj = {};
    headers.forEach((h, i) => {
      const val = values[i] !== undefined ? values[i].trim() : '';
      obj[h] = val === '' || isNaN(Number(val)) ? val : Number(val);
    });
    return obj;
  });

fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
console.log('Convertido:', data.length, 'filas ->', jsonPath);
