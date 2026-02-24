# Control de Parámetros - Departamento de Ingeniería

Aplicación para monitorear y controlar parámetros del departamento de ingeniería. Repositorio y despliegue solo en GitLab.

**Repositorio (GitLab):** [https://gitlab.com/ivan.ulises.cl/tareasot_apw](https://gitlab.com/ivan.ulises.cl/tareasot_apw)

**URL de la app (GitLab Pages):** [https://ivan.ulises.cl.gitlab.io/tareasot_apw/](https://ivan.ulises.cl.gitlab.io/tareasot_apw/)

**Versión:** 1.27.0 (ver archivo `VERSION`)

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
- Los gráficos y el panel Estado Tareas se construyen desde el JSON; es necesario usar un servidor local o GitLab Pages para cargar los datos.
