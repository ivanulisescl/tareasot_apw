# Esquema de `proyectos.json`

Todo en un único fichero. Fechas en formato **ISO 8601** (`YYYY-MM-DD`). Números con punto decimal.

## Estructura raíz

```json
{
  "fechaHoraActualizacion": "2026-02-20T10:00:00",
  "proyectos": [ ... ]
}
```

- **fechaHoraActualizacion** (opcional): fecha/hora de generación del JSON (ISO 8601).
- **proyectos**: array de objetos proyecto.

---

## Objeto proyecto (equivale a dtTablaProyectos)

| Campo | Tipo | Ejemplo |
|-------|------|---------|
| idProyecto | number | 1 |
| estado | string | "En curso" |
| numeroPedido | string | "PV_1430" |
| ofertaReferencia | string | "OF-2025-001" |
| nombreProyecto | string | "Nombre del proyecto" |
| pais | string | "España" |
| fechaVenta | string \| null | "2025-01-15" |
| cliente | string | "Cliente S.L." |
| integrador | string | "Integrador XYZ" |
| importeEur | number \| null | 125000.50 |
| pesoKg | number \| null | 5200.25 |
| ratioEurKg | number \| null | 24.04 |
| sistema | string | "Sistema A" |
| tipoInstalacion | string | "Tipo 1" |
| numeroPaletas | number \| null | 12 |
| alturaTotalMm | number \| null | 11500 |
| jefeProyecto | string | "Nombre" |
| delineantePrincipal | string | "Nombre" |
| delineanteApoyo1 | string | "Nombre" |
| delineanteApoyo2 | string | "Nombre" |
| inicioMontaje | string \| null | "2025-03-01" |
| duracionMontajeDias | number \| null | 25 |
| tipoTransporte | string | "Camión" |
| transitoDias | number \| null | 5 |
| planoValidacion | string | "Sí" / "No" |
| fechaValidacionPlano | string \| null | "2025-02-10" |
| entregadoProduccionPorc | number \| null | 75 |
| planosMontajeRealizadosPorc | number \| null | 85 |
| planosMontajePublicadosPorc | number \| null | 80 |
| observacionesGlobal | string | "Texto..." |
| entregasMRP | array | [ ... ] (opcional) |
| tiempos | array | [ ... ] (opcional) |

Valores no disponibles: usar `null` o `""` según el tipo.

---

## entregasMRP (dentro de cada proyecto)

Array de objetos. Si no hay entregas, usar `[]`.

| Campo | Tipo | Ejemplo |
|-------|------|---------|
| estado | string | "Entregado" |
| nEntrega | string | "1" |
| entrega | string | "Entrega 1" |
| pesoTotalEstructura | number | 1500.5 |

---

## tiempos (dentro de cada proyecto)

Array de objetos. Si no hay datos, usar `[]`.

| Campo | Tipo | Ejemplo |
|-------|------|---------|
| tecnico | string | "Juan Pérez" |
| horas | number | 42.5 |

---

El visor web calcula el **% Desviación** en Entregas MRP como:  
`(suma de pesoTotalEstructura / pesoKg del proyecto) * 100`.
