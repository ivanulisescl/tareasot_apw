# Control de Parámetros - Departamento de Ingeniería

Aplicación para monitorear y controlar parámetros del departamento de ingeniería.

**Repositorio:** [https://github.com/ivanulisescl/tareasot_apw](https://github.com/ivanulisescl/tareasot_apw.git)

**URL de la app (GitHub Pages):** [https://ivanulisescl.github.io/tareasot_apw/](https://ivanulisescl.github.io/tareasot_apw/)

**Versión:** 1.19.0 (ver archivo `VERSION`)

### Si la app da 404 en GitHub Pages

1. Ve a **Settings** → **Pages** en el repositorio: https://github.com/ivanulisescl/tareasot_apw/settings/pages
2. En **Build and deployment** → **Source**, selecciona **GitHub Actions** (no "Deploy from a branch").
3. Si ya está en GitHub Actions, haz clic en **Actions** → abre el último workflow "Deploy to GitHub Pages" → **Re-run all jobs**.

## Estructura del proyecto

```
TareasOT_APW/
├── index.html        # Página principal
├── graficos.html     # Vista de gráficos (Ofertas Ingeniería + Ofertas Automáticos)
├── VERSION           # Número de versión
├── data/
│   └── tablaDias.json  # Datos para los gráficos
├── css/
│   ├── styles.css    # Estilos base
│   └── graficos.css  # Estilos de la vista gráficos
├── js/
│   ├── main.js       # Lógica principal
│   └── graficos.js   # Carga JSON y construye gráficos
└── README.md
```

## Cómo ejecutar

1. Clonar el repositorio (o abrir esta carpeta).
2. Abrir `index.html` en el navegador, o usar un servidor local, por ejemplo:
   - Con Python: `python -m http.server 8000` y visitar `http://localhost:8000`
   - Con Node (npx): `npx serve` y abrir la URL indicada

## Tecnologías

- HTML5
- CSS3 (variables, flexbox, diseño responsive)
- JavaScript (vanilla)

## Estado actual

- Interfaz principal con botones **Estado Tareas** (panel con totales del último día) y **Gráficos**.
- Tema día/noche en el encabezado (preferencia guardada en localStorage).
- Vista de gráficos: **Evolución Anual Ofertas de Ingeniería** y **Evolución Anual Ofertas de Automáticos** (datos desde `data/tablaDias.json`).
- Los gráficos y el panel Estado Tareas se construyen desde el JSON; es necesario usar un servidor local (o GitHub Pages) para cargar los datos.
