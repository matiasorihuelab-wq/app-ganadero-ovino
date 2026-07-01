# Manual Técnico y de Uso — App de Análisis de Rentabilidad Ovina

> Documentación técnica oficial del proyecto. Describe el funcionamiento completo de la
> aplicación: arquitectura, uso pantalla por pantalla, variables, **motor de cálculo con
> todas sus fórmulas**, resultados, alertas, gráficos, validaciones, persistencia y PWA.
>
> **Fuente:** todo lo aquí documentado proviene exclusivamente del código fuente del
> repositorio (`src/`) y de la documentación existente. Versión de referencia: **RC3
> (1.0.0-rc.3)**. El motor reproduce fielmente una planilla Excel (modelo *Merino
> Australiano*); en el código, cada bloque de cálculo cita la(s) celda(s) del Excel que
> replica (p. ej. `C64`, `P25`), y esa nomenclatura se conserva en este manual.

---

## 1. Introducción

### 1.1 Objetivo
Ayudar a un productor ovino (o a su asesor) a **analizar la rentabilidad económica y
productiva** de un establecimiento, a partir de sus propios datos, con **resultados en
tiempo real**. La aplicación replica la lógica de una planilla de referencia validada,
presentándola en una interfaz clara y sin planillas.

### 1.2 Alcance
- Es un **template genérico**: sirve para cualquier raza. Todos los campos arrancan en 0 /
  vacío y el usuario carga sus datos.
- Calcula: existencias por categoría (cascada con mortandad), producción de lana y carne,
  ingresos, costos directos y fijos, y **márgenes** (bruto, neto, por hectárea, por oveja).
- Incluye una vista de **evolución temporal** (flujo de caja mes a mes) y un módulo de
  **Requerimientos Nutricionales** que está **🚧 en construcción** (no funcional aún).
- Funciona **100 % en el navegador**, sin servidor: los datos viven en el dispositivo.

### 1.3 Público objetivo
- **Productor ovino** (usuario primario): perfil rural, no técnico. La interfaz y los
  textos están en español, sin jerga innecesaria.
- **Asesor / técnico agropecuario** (p. ej. del SUL): analiza escenarios y compara
  alternativas con o para el productor.

### 1.4 Qué calcula y qué NO calcula
**Sí calcula (motor económico, validado 18/18 contra el Excel):**
- Cantidades por categoría animal, unidades ganaderas (UG), dotación.
- Producción de lana (kg, micronaje ponderado, precio por curva de micronaje) y de carne (kg).
- Ingresos por lana y carne; costos de sanidad, esquila, alimentación, carneros;
  comercialización (comisiones, IMEBA, INIA, MEVIR, INAC); mano de obra; renta y contribución.
- Márgenes bruto y neto (totales, por hectárea, por oveja) e indicadores derivados.

**No calcula / no hace:**
- **No** es multiusuario, **no** tiene cuentas ni login, **no** persiste en servidor.
- **No** integra con sistemas externos, **no** hace trazabilidad individual de animales ni
  gestión de stock en tiempo real, **no** es un ERP.
- El módulo de **Requerimientos Nutricionales** todavía **no** calcula nada (congelado).
- La vista de **Evolución** es una **distribución estimada** del resultado anual, no un
  flujo de caja transaccional real.

---

## 2. Arquitectura general

### 2.1 Organización
La aplicación es una **SPA** (Single Page Application) en **React + TypeScript + Vite**,
sin backend. Dos capas grandes, desacopladas:

- **Motor económico** (`src/engine/`) — lógica pura, sin UI. Es el activo principal.
  - `types.ts` — modelo de datos (`Inputs` / `Resultados`).
  - `calc.ts` — **motor principal**; réplica fiel del Excel (cada bloque cita su celda).
  - `presets.ts` — preset vacío (genérico) y preset ejemplo (Merino, para QA).
  - `timeline.ts` — evolución temporal / flujo de caja mensual.
- **Módulo de Requerimientos Nutricionales** (`src/nutrition/`) — motor de **consulta** de
  tablas oficiales (NRC…) vía un `NutrientRequirementProvider`. **Congelado / en construcción.**
- **Interfaz** (`src/components/`, `src/App.tsx`):
  - `Formulario` + `Campos` — entrada de datos.
  - `Resultados` — dashboard (KPIs + gráficos + tablas).
  - `Timeline` — evolución temporal.
  - `Nutricion` — módulo nutricional (en construcción).
  - `Modales` — guardar / cargar / comparar escenarios.
  - `ErrorBoundary` — captura errores de render para que la app no muera.
  - `BotonesBeta` — botones de reporte y diagnóstico de la beta.
- **Persistencia** (`src/persistence/`) — detrás de puertos (interfaces):
  `EscenarioRepository` (escenarios con nombre) y `BorradorRepository` (autoguardado),
  con adapters sobre `localStorage`.
- **Utilidades** (`src/utils/`) — `format` (USD/números/%), `validaciones` (avisos),
  `exportar` (CSV/PDF).

### 2.2 Pantallas
La app tiene **una sola ruta** (no hay enrutador). El panel de resultados se organiza en
tres pestañas (estado interno, no URLs): **📊 Dashboard**, **📅 Evolución** y
**🚧 Requerimientos**. A la izquierda está siempre el **formulario**; a la derecha, la
pestaña activa.

### 2.3 Flujo de datos
```
Usuario edita el Formulario
        ↓ (set: Partial<Inputs>)
Estado `inp: Inputs` en App.tsx
        ↓ useMemo(calcular, [inp])           ← recálculo en tiempo real
Resultados `r: Resultados`
        ↓
Dashboard / Evolución (+ validar(inp, r) → avisos)
```
El motor es **puro**: dado un `Inputs`, produce un `Resultados` determinístico. La UI solo
muestra; no calcula economía.

### 2.4 Persistencia y almacenamiento local
- **Autoguardado (borrador):** cada cambio del formulario se guarda (con *debounce* de
  400 ms) en `localStorage`, clave `ganadero_borrador_v1`. Al reabrir la app se restaura.
- **Escenarios con nombre:** el usuario puede guardar/cargar/comparar escenarios;
  se almacenan en `localStorage`, clave `ganadero_escenarios_v1`.
- Todo es **local al navegador/dispositivo**; nada se sube a un servidor.

### 2.5 PWA
La app es una **Progressive Web App**: instalable, con **manifest** e ícono propios y un
**service worker** que permite **uso offline** tras la primera carga. Ver §11.

---

## 3. Manual de uso (pantalla por pantalla)

La barra superior contiene el título con la **etiqueta de versión** (RC3), el campo
**Raza** y la **barra de herramientas**: `Cargar ejemplo`, `Limpiar`, `💾 Guardar`,
`📂 Cargar`, `🔄 Comparar`, `📊 CSV`, `📥 PDF`, `🐞 Reportar o sugerir`, `📋 Copiar diagnóstico`.

> **Recomendación general:** empezá con **"Cargar ejemplo"** para ver la app con datos
> completos; luego **"Limpiar"** y cargá los datos de tu establecimiento. Ambas acciones
> **piden confirmación** antes de reemplazar tus datos.

### 3.1 Formulario (columna izquierda)
Compuesto por 8 secciones colapsables. Todos los campos numéricos son **no negativos**
(los valores negativos o inválidos se convierten a 0 automáticamente).

#### Sección 1 · Identificación y Predio
- **Objetivo:** describir el predio y la majada base.
- **Campos:** Nombre del predio (texto), Ovejas madres encarneradas (#), Peso adulto
  ovejas (kg), Dotación total segura (UG/ha), % reposición anual (%), Superficie propia
  (ha), Superficie arrendada (ha), Cantidad de trabajadores (#).
- **Cómo completarlo:** "Ovejas encarneradas" es la majada de cría base (dispara todo el
  cálculo). "Peso adulto" alimenta los pesos de lana y UG. "% reposición" es la fracción de
  ovejas que se reemplazan por año.
- **Errores frecuentes:** dejar ovejas en 0 (no hay resultados); confundir superficie propia
  con arrendada (afecta renta vs contribución).

#### Sección 2 · Configuración Productiva
- **Objetivo:** definir el sistema de venta y el calendario.
- **Campos:** Categoría de venta (lista), Señalada / corderos por oveja (%), Engorde de
  corderos (lista), Engorde de borregos (lista), fechas (encarnerada, esquila, destete,
  venta), Cotización dólar (UYU/USD).
- **Significado:** la **categoría de venta** determina qué animales se venden y cómo se
  calcula la carne (ver §5). La **señalada** es corderos logrados por oveja
  (0,8 = 80 %; puede superar 100 %). La **cotización del dólar** convierte los costos en
  pesos (salario, esquila) a USD.
- **Recomendación:** cargá las fechas: se usan para ubicar ingresos/costos en la vista de
  Evolución.
- **Errores frecuentes:** dejar la cotización del dólar en 0 teniendo costos en UYU (la app
  avisa); interpretar la señalada como porcentaje ≤ 100 cuando puede ser > 100.

#### Sección 3 · Genética y Calidad de Lana
- **Campos:** Micronaje (µ), % peso en lana sucia (%), Precio de lana (curva por micronaje:
  promedio últimos 2 o 3 años), casilla de **Certificación / Grifa Verde**.
- **Significado:** el **micronaje** determina el precio de la lana por una curva polinómica
  (ver §5.7). El **% de lana sucia** relaciona peso vivo con vellón. La certificación agrega
  un **premio** por finura.

#### Sección 4 · Mortandad
- **Campos:** mortandad de Ovejas, Corderos señalada-destete, Corderos destete-esquila,
  Corderos destete-venta, Solteros (todas en %).
- **Significado:** cada mortandad reduce las cantidades en la cascada de categorías.
- **Errores frecuentes:** cargar una mortandad > 30 % (la app la marca como error probable).

#### Sección 5 · Precios de Carne
- **Campos:** Precio carne base (USD/kg, cordero pesado 4ta balanza), Rendimiento canal (%).
- **Significado:** del **precio base** se derivan los demás precios (ver §5.8). El
  **rendimiento de canal** convierte peso vivo a carcasa.
- **Errores frecuentes:** rendimiento de canal en 0 (anula el ingreso por carne; la app avisa).

#### Sección 6 · Costos de Sanidad
- **Objetivo:** costear la sanidad por categoría.
- **Campos:** tabla de **medicamentos** (Nombre, Precio envase USD, Volumen, Dosis) con
  botones para agregar/eliminar filas; costos por cabeza de Clostridiosis, Baño de
  inmersión y Ectima; **Coeficiente de seguridad**; pesos de dosis (adulto, cordero, recría).
- **Significado:** cada medicamento aporta un costo por kg de peso vivo =
  `dosis × precio / volumen`; la sanidad por categoría combina esos costos con el peso de
  prorrateo y el coeficiente de seguridad (ver §5.5).
- **Errores frecuentes:** dejar el volumen del envase en 0 (ese medicamento se ignora,
  aporta 0); olvidar el coeficiente de seguridad.

#### Sección 7 · Esquila, Alimentación y Comercialización
- **Campos:** Esquila (costo base UYU/animal), Factor esquila, Adicional esquila (USD);
  Precio ración (USD/kg), Suplemento diario (kg/día), Duración suplementación (días),
  Costo verdeos (USD/ha).
- **Significado:** definen el costo de esquila por animal (ver §5.6) y el costo de
  alimentación según el sistema de engorde elegido (Campo Natural, Suplemento sobre CN o
  Verdeos).

#### Sección 8 · Carneros y Costos Fijos
- **Campos:** Precio carnero (USD), Ovejas por carnero (#), Vida útil carnero (años),
  Carneros/oveja en stock; Salario mensual (UYU), Sueldos/año (aguinaldo), Cargas sociales,
  Renta tierra (USD/ha), Contribución (USD/ha).
- **Significado:** el **carnero** se amortiza (precio / (ovejas por carnero × vida útil));
  la **mano de obra** se calcula desde el salario, aguinaldo y cargas, convertido a USD;
  la **renta** aplica sobre superficie arrendada y la **contribución** sobre la propia.

### 3.2 Pestaña 📊 Dashboard
Muestra el **Resumen de Rentabilidad** (ingresos, costos directos, costos fijos, margen
neto + margen/ha, margen/oveja, margen bruto %), la **Producción** (lana, micronaje,
animales, carne, dotación), tres **gráficos** (§8) y tres **tablas** desplegables (detalle
por categoría, desglose de costos, indicadores económicos). Si no hay datos, muestra un
**estado vacío** invitando a cargar datos o el ejemplo.

### 3.3 Pestaña 📅 Evolución
Distribuye el resultado **anual** en un calendario de 12 meses (flujo de caja estimado),
con un gráfico de barras (ingresos/costos) + línea de acumulado, y una tabla mes a mes. Si
faltan fechas, avisa y usa una distribución estimada. **La suma anual coincide con el
margen neto** del dashboard.

### 3.4 Pestaña 🚧 Requerimientos
Módulo de Requerimientos Nutricionales **en construcción**: muestra su estructura pero
**todavía no es funcional** (se incorporará en una futura versión con tablas oficiales
NRC/INRA/AFRC).

### 3.5 Modales (barra de herramientas)
- **💾 Guardar:** guarda el escenario actual con un nombre (el botón se habilita al escribir
  un nombre).
- **📂 Cargar:** lista los escenarios guardados (con su margen neto), permite **Cargar** o
  **Eliminar** (con confirmación).
- **🔄 Comparar:** compara la configuración actual (**A**) contra un escenario guardado
  (**B**), mostrando la diferencia (Δ) por indicador.
- Los modales se cierran con **Escape**, con click fuera, o con su botón.

---

## 4. Variables utilizadas

Tabla del modelo de entrada (`Inputs`, ver `src/engine/types.ts`). "Interno" es el nombre
de celda del Excel usado en el código. "Ejemplo" es el valor del preset Merino
(`INPUTS_EJEMPLO`); "Vacío" es el valor por defecto del preset genérico (`INPUTS_VACIO`).
Los campos numéricos aceptan solo valores **≥ 0** (no hay tope superior forzado). Los
porcentajes se **editan como %** pero se **almacenan como fracción 0–1**.

### 4.1 Predio
| Mostrado | Interno | Unidad | Vacío | Ejemplo | Explicación |
|---|---|---|---|---|---|
| Nombre del predio | nombrePredio | texto | "" | "Ejemplo Merino Australiano" | Identificación; usado en exportaciones |
| Raza | raza | texto | "" | "Merino Australiano" | Informativa; la app es genérica |
| Ovejas madres encarneradas | ovejasEncarneradas (B12) | # | 0 | 600 | Majada base de cría; dispara todo el cálculo |
| Peso adulto ovejas | pesoAdulto (B3) | kg | 0 | 47 | Base de pesos de lana y de UG |
| Dotación total segura | dotacionSegura (B2) | UG/ha | 0 | 0,7 | Carga animal objetivo; usada en renta/contribución |
| % reposición anual | porcReposicion (B5) | fracción | 0 | 0,2 | Fracción de ovejas reemplazadas/año |
| Superficie propia | supPropiedad (E3) | ha | 0 | 597 | Base de la contribución |
| Superficie arrendada | supArrendada (E5) | ha | 0 | 0 | Base de la renta |
| Cantidad de trabajadores | cantTrabajadores (G8) | # | 0 | 6 | Multiplica la mano de obra |

### 4.2 Configuración productiva
| Mostrado | Interno | Unidad | Vacío | Ejemplo | Explicación |
|---|---|---|---|---|---|
| Categoría de venta | categoriaVenta (B6) | lista | Cord Dest | Cord Dest | Sistema de venta; define carne y flags de categoría |
| Señalada / corderos por oveja | senaladaBase (B4) | fracción | 0 | 0,8 | Corderos logrados por oveja (puede ser > 1) |
| Engorde de corderos | sistemaEngordeCorderos (B7) | lista | Campo Natural | Campo Natural | Define costo de alimentación de corderos |
| Engorde de borregos | sistemaEngordeBgos (B8) | lista | Campo Natural | Campo Natural | Ídem para borregos |
| Fecha encarnerada | fechaEncarnerada | fecha | "" | 2024-03-15 | Mes base del calendario (Evolución) |
| Fecha esquila | fechaEsquila | fecha | "" | 2024-07-15 | Ubica el ingreso de lana |
| Fecha destete | fechaDestete | fecha | "" | 2024-12-15 | Evento sanitario / stock |
| Fecha de venta | fechaVenta | fecha | "" | 2024-09-15 | Ubica el ingreso de carne |
| Cotización dólar | precioDolar (L10) | UYU/USD | 0 | 39 | Convierte costos en UYU a USD (si 0, se usa 1) |
| Precio de lana | modoPrecios (E19) | lista | últimos 2 | últimos 2 | Elige la curva polinómica (2 o 3 años) |

### 4.3 Genética y lana
| Mostrado | Interno | Unidad | Vacío | Ejemplo | Explicación |
|---|---|---|---|---|---|
| Micronaje | micronaje (B13) | µ | 0 | 20,5 | Finura de la lana; base del precio |
| % peso en lana sucia | porcPesoLanaSucia (B14) | fracción | 0 | 0,09 | Relaciona peso vivo con vellón |
| Certificación | certificacion (L12) | sí/no | false | false | Premio Grifa Verde según finura |

### 4.4 Mortandad
| Mostrado | Interno | Unidad | Vacío | Ejemplo | Explicación |
|---|---|---|---|---|---|
| Ovejas | mortOvejas (B16) | fracción | 0 | 0,04 | Mortandad de ovejas |
| Corderos señalada-destete | mortCordSenDest (B17) | fracción | 0 | 0,03 | Muerte entre señalada y destete |
| Corderos destete-esquila | mortCordDestEsq (B18) | fracción | 0 | 0,03 | Muerte destete→esquila |
| Corderos destete-venta | mortCordDestVenta (B19) | fracción | 0 | 0,03 | Muerte destete→venta |
| Solteros (esquila-esquila) | mortSolteros (B20) | fracción | 0 | 0,03 | Muerte de recría |

### 4.5 Precios de carne
| Mostrado | Interno | Unidad | Vacío | Ejemplo | Explicación |
|---|---|---|---|---|---|
| Precio carne base | precioCarneBase (G13) | USD/kg | 0 | 3,38 | Base del modelo (cordero pesado 4ta balanza) |
| Rendimiento canal | rendimientoCanal (I) | fracción | 0 | 0,48 | Peso vivo → carcasa |

### 4.6 Sanidad
| Mostrado | Interno | Unidad | Vacío | Ejemplo | Explicación |
|---|---|---|---|---|---|
| Medicamentos (tabla) | medicamentos | — | 8 filas (precio 0) | 8 filas con precios | Nombre, precio envase, volumen, dosis |
| Clostridiosis | costoClostridiosis (AK8) | USD/cab | 0 | 15,56/120 | Costo por cabeza |
| Baño inmersión | costoBano (AK9) | USD/cab | 0 | 0,3 | Costo por cabeza |
| Ectima | costoEctima (AK10) | USD/cab | 0 | 0,23×0,76 | Costo por cabeza |
| Coeficiente de seguridad | coefSeguridad | factor | 1,1 | 1,1 | Sobredosificación/pérdidas (si 0, se usa 1) |
| Peso dosis adulto | pesoDosisAdulto (AFa) | kg | 60 | 60 | Prorrateo de dosis en adultos |
| Peso dosis cordero | pesoDosisCordero (AFc) | kg | 45 | 45 | Prorrateo en corderos de venta |
| Peso dosis recría | pesoDosisRecria (AFr) | kg | 35 | 35 | Prorrateo en recría |

### 4.7 Carneros
| Mostrado | Interno | Unidad | Vacío | Ejemplo | Explicación |
|---|---|---|---|---|---|
| Precio carnero | precioCarnero | USD | 0 | 440 | Costo de reposición de un carnero |
| Ovejas por carnero | ovejasPorCarnero | # | 33 | 33 | Ovejas servidas por carnero |
| Vida útil carnero | vidaCarneroAnios | años | 3 | 3 | Amortización del carnero |
| Carneros / oveja en stock | relacionCarnerosStock | #/oveja | 0,035 | 0,035 | Stock de carneros |

### 4.8 Esquila
| Mostrado | Interno | Unidad | Vacío | Ejemplo | Explicación |
|---|---|---|---|---|---|
| Esquila (costo base) | costoEsquilaUYU | UYU/an | 0 | 108 | Costo base por animal en pesos |
| Factor esquila | factorEsquila | factor | 1,22 | 1,22 | Ajuste de la esquila |
| Adicional esquila | adicionalEsquilaUSD | USD | 0 | 0,1 | Adicional por animal en USD |

### 4.9 Alimentación
| Mostrado | Interno | Unidad | Vacío | Ejemplo | Explicación |
|---|---|---|---|---|---|
| Precio ración (supl. CN) | precioRacionCN (AK15) | USD/kg | 0 | 0,4 | Precio de la ración |
| Suplemento diario | suplDiarioCN (AK16) | kg/día | 0 | 0,5 | Ración diaria |
| Duración suplementación | duracionCN (AK17) | días | 0 | 90 | Duración del suplemento |
| Costo verdeos | costoVerdeoHa (AO23) | USD/ha | 0 | 344 | Costo total del verdeo |

### 4.10 Costos fijos
| Mostrado | Interno | Unidad | Vacío | Ejemplo | Explicación |
|---|---|---|---|---|---|
| Salario mensual | salarioMensualUYU | UYU/mes | 0 | 31612 | Salario base mensual |
| Sueldos/año (aguinaldo) | aguinaldoFactor | factor | 14 | 14 | Sueldos equivalentes por año |
| Cargas sociales | cargasSociales | factor | 1,075 | 1,075 | Multiplicador de cargas |
| Renta tierra | rentaHa | USD/ha | 60 | 60 | Renta sobre superficie arrendada |
| Contribución | contribucionHa | USD/ha | 8 | 8 | Contribución sobre superficie propia |

> **Nota (documentada en el código):** `rentaHa` y `contribucionHa` **no** arrancan en 0 en
> el preset vacío (60 y 8), por lo que un predio nuevo genera un costo de renta/contribución
> "fantasma" hasta que el usuario los ajuste. Es una decisión pendiente de confirmar contra
> el Excel (marca `M6`).

---

## 5. Motor de cálculo (todas las fórmulas)

> Archivo: `src/engine/calc.ts`, función `calcular(inp) → Resultados`. La nomenclatura
> (`B12`, `C23`, `AA3`, `P25`…) es la del Excel de referencia. Convenciones internas:
> `L10 = precioDolar || 1` (evita dividir por 0), `coef = coefSeguridad || 1`, `SI/NO` son
> banderas de categoría.

### 5.1 Costo unitario de un medicamento (AO)
```
AOᵢ = (dosisᵢ × precioᵢ) / volumenᵢ        (USD por kg de peso vivo)
si volumenᵢ = 0  →  AOᵢ = 0                 (guarda contra división por cero)
```
- **Significado:** costo por kg de peso vivo de aplicar el medicamento *i*, prorrateando el
  precio del envase por su volumen y la fracción de dosis.
- **Supuesto/limitación:** requiere un volumen de envase > 0 (si es 0, ese medicamento no
  aporta costo).

### 5.2 Banderas de categoría (B24…B33)
Según `categoriaVenta` (B6), se activan (SI/NO) las categorías que existen en el sistema:
```
B24 = SI si B6 = 'Cord Dest'                        (corderos venta al destete)
B25 = SI si B6 ∈ {'Cord Pz','Cord Pes'}             (corderos DL de venta)
B26 = SI si B25=SI o B6='Cord Dest'                 (corderas DL de venta)
B27 = SI si B25=NO y B24=NO                          (corderos DL para recría)
B28 = SI (siempre)                                   (corderas DL para reposición)
B29 = B30 = SI si B6 ∈ {'Bgos 4D','Cap 6/8D','Cap 8D'}
B31 = SI (siempre)                                   (ovejas descarte)
B32 = SI si B6 ∈ {'Cap 6/8D','Cap 8D'}
B33 = SI si B6 = 'Cap 8D'
```
- **Significado biológico:** el sistema de venta determina qué categorías se generan
  (corderos que se venden al destete vs. se recrían a borrego/capón).

### 5.3 Cantidades por categoría — cascada con mortandad (C23…C34)
```
C23 = B12                                             (ovejas de cría = encarneradas)

Corderas DL de venta (según categoría):
  C26 = (C23·B4·(1−B17)·(1−B19))/2 − C23·B16 − C23·B5   si B6='Cord Pes' o 'Cord Dest'
  C26 = (C23·B4·(1−B17)·(1−B19))/2 − C23·B5             si B6='Cord Pz'

C24 = C23·B4·(1−B17) − C26                            si B24=SI, si no 0   (corderos venta destete)
C25 = (C23·B4·(1−B17)·(1−B19))/2                       si B25=SI            (corderos DL venta)
C27 = (C23·B4·(1−B17)·(1−B18))/2                       si B27=SI            (corderos DL recría)
C28 = (C23·B4·(1−B17)·(1−B18))/2 − C26                 si B28=SI            (corderas DL)
C29 = (C28 − (C23·B5 + C23·B16))·(1−B20)               si B29=SI            (borregas 2-4D S/e)
C30 = C27·(1−B20)                                      si B30=SI            (borregos 2-4D)
C31 = C23·B5·(1−B16)                                   si B31=SI            (ovejas descarte)
C32 = C30·(1−B20)                                      si B32=SI            (capones 6D)
C33 = C32·(1−B20)                                      si B33=SI            (capones 8D)
C34 = C23 · relacionCarnerosStock                                          (carneros)
```
- **Significado:** parte de la majada base (C23) y aplica **señalada** (B4) y **mortandades**
  (B16–B20) en cascada; la mitad ÷2 separa machos de hembras.
- **Supuesto:** relación de sexos ~50/50 (÷2). La señalada puede ser > 1 (más de un cordero
  por oveja).

### 5.4 Pesos de lana (E) y micras (F) por categoría
```
C35_pre = C23 + C25 + C26 + C27 + C28 + C29 + C30 + C31 + C32 + C33 + C34   (stock esquilado)
I22 = C35_pre / E6        (dotación de animales por ha; 0 si E6=0)
E23 = B3·B14·0,9   si I22 ≥ 2 ;   E23 = B3·B14   si I22 < 2   (vellón de la oveja)
```
Pesos de vellón por categoría (derivados de E23):
```
E25 = E26 = E23·0,4 (si B6='Cord Pz') o E23·0,7 (resto);  E27 = E28 = E23·0,7
E29 = E23 ;  E30 = E23·1,08 ;  E31 = E23·0,9 ;  E32 = E30·1,05 ;  E33 = E30 ;  E34 = E23·1,2
```
Micras por categoría (F), con `F23 = micronaje`:
```
para corderos (F25..F28): 0 si NO ;  si micronaje<22 → F23−2 ;  si no → F23−4
F29 = F30 = F23 (o 0 si NO) ;  F31 = F32 = F33 = F23·1,03 (o 0 si NO) ;  F34 = F23·1,05
```
- **Significado:** a mayor dotación (≥ 2 animales/ha) el vellón individual baja 10 %; los
  corderos afinan (menos micras); adultos y carneros engrosan levemente.

### 5.5 Unidades Ganaderas (UG) por categoría (G23…G35)
Se usan polinomios del peso (réplica del Excel). Pesos estándar del modelo:
`E12=40, E13=40, E15=42, E17=40` (hardcodeados; ver nota).
```
G23 = (−0,0000666667·B3² + 0,009·B3 − 0,1233) · C23                (ovejas)
ugCordero(peso, c) = (−0,0002·peso² + 0,021·peso − 0,43)·0,75·c + c·0,25·0,04
G25, G26 = ugCordero(E13, C25|C26)   [o variante ·0,375 si B6='Cord Pz']
G27, G28 = (−0,0002·(B3·0,8)² + 0,021·(B3·0,8) − 0,43)·0,5·C + C·0,25·0,04
G29 = (0,0000666667·E17² − 0,005·E17 + 0,2233)·C29
G30 = (0,0000666667·B3²  − 0,005·B3  + 0,2233)·C30
G31 = (0,0000666667·E17² − 0,005·E17 + 0,2033)·C31
G32, G33 = (0,0000666667·E15² − 0,005·E15 + 0,2233)·C32|C33
G34 = (0,0000666667·(B3·1,25)² − 0,005·(B3·1,25) + 0,2533)·C34
G35 = G23 + G25 + … + G34                                          (UG totales)
```
- **Significado:** convierte cada categoría a **unidades ganaderas** (equivalencia de
  consumo/tamaño) según su peso. Base de la dotación y de indicadores por UG.
- **Limitación (documentada):** los pesos de faena/UG (`E12,E13,E15,E17`) están fijos en el
  modelo; confirmar contra el Excel si deberían ser editables (marca `V1-04`).

### 5.6 Costos de sanidad, esquila, alimentación y carneros (por cabeza)
**Sanidad por categoría (AA), con `a(i)=AOᵢ`, `coef` = coef. seguridad:**
```
AA3 (ovejas)  = (a0 + AFa·a1 + AFa·a2 + AFa·a0 + AFa·a3 + AFa·a4 + AFa·a5 + AFa·a1
                 + AK8·2 + AFa·a6 + AK9) · coef
AA4 (corderos destete) = (AK8·2 + AK10 + AFa·a6 + AK9) · coef
AA5 (corderos DL venta, AFc) = (AFc·a7 + AFc·a6 + AFc·a3 + AFc·a0 + AFc·a1 + AFc·a5
                 + AFc·a1 + AK8·3 + AK9 + AK10) · coef
AA6=AA7=AA8 (adultos/borregos, AFa) = (AFa·a0 + AFa·a1 + AFa·a2 + AFa·a0 + AFa·a3
                 + AK8 + AK9) · coef
AA9 (recría, AFr) = (AFr·a7 + AFr·a6 + AFr·a3 + AFr·a0 + AFr·a1 + AFr·a5 + AFr·a1
                 + AK8·3 + AK9 + AK10) · coef
```
donde `AFa, AFc, AFr` = pesos de dosis (adulto/cordero/recría); `AK8/AK9/AK10` =
clostridiosis/baño/ectima.

**Esquila (AB):**
```
AB3 = (costoEsquilaUYU · factorEsquila) / L10 + adicionalEsquilaUSD    (USD/animal)
AB7 = AB3 · 2                                                          (carneros)
```
**Alimentación (AD), según sistema de engorde:**
```
AK19 = precioRacionCN · suplDiarioCN · duracionCN · 1,1     (costo de suplemento sobre CN)
AO24 = ((100/180) · costoVerdeoHa) / 15                     (verdeos por cabeza)
alim(sistema) = AO24 si 'Verdeos' ; AK19 si 'Supl. sobre CN' ; 0 si 'Campo Natural'
AD3 = AK19 si B4 > 0,85, si no 0    (suplementación de gestantes; umbral aprox.)
AD5 = alim(sistemaEngordeCorderos) ;  AD8 = alim(sistemaEngordeBgos)
```
**Carneros (AE):**
```
AE3 = precioCarnero / ((ovejasPorCarnero || 1) · (vidaCarneroAnios || 1))   (USD/oveja)
```
- **Limitación (documentada):** el umbral 0,85 para suplementar gestantes es aproximado
  (marca `V1-03`).

### 5.7 Costos directos totales (columnas P/Q/R/S)
Cada categoría multiplica su cantidad (C) por su costo/cabeza:
```
Sanidad:  P3=C23·AA3, P4=C24·AA4, P5=C25·AA5, P6=C26·AA5, P7=C27·AA9, P8=C28·AA9,
          P9=C29·AA8, P10=C30·AA8, P11=C31·AA5, P12=C34·AA7
          P13 = Σ P (sanidad total)
Esquila:  Q3=C23·AB3, Q5=C25·AB3, … , Q12=C34·AB7 ;  Q13 = Σ Q
Alim.:    R3=C23·AD3, R5=C25·AD5, R6=C26·AD5, R9=C29·AD8, R10=C30·AD8 ;  R13 = Σ R
Carneros: S3=C23·AE3 ;  S13 = S3
Costos directos:  P25 = P13 + Q13 + R13 + S13
```

### 5.8 Producción y precio de la lana
```
C45 = Σ (Cᵢ · Eᵢ)               (lana total, kg — SUMPRODUCT cantidad × vellón)
C47 = C45 / C35                 (lana por cabeza; 0 si C35=0)
C48 = Σ(Cᵢ·Eᵢ·Fᵢ) / Σ(Cᵢ·Eᵢ)   (micronaje ponderado por producción; 0 si denom.=0)
```
**Precio de la lana (curva polinómica por micronaje):**
```
polyUlt2 = 0,0372·C48² − 2,3241·C48 + 37,311      (promedio últimos 2 años)
polyUlt3 = 0,0301·C48² − 2,0157·C48 + 34,744      (promedio últimos 3 años)
L13 = premio de certificación (0 si no certifica; ver §7 de nota) 
V4 = (polyUlt3 si modo='últimos 3', si no polyUlt2) + L13     (USD/kg)
E20 = 1 si C48<22, si no 0,7                       (valor de subproductos, 10% del vellón)
C39 = C45·0,9·V4 + C45·0,1·E20                     (ingreso por lana)
```
**Premio por certificación (L13):** `1 si micronaje<20 ; 0,7 si <25 ; 0,5 si ≥25`.
- **Significado:** el precio de la lana sale de una **curva** ajustada al micronaje
  ponderado; el 90 % del vellón se paga a ese precio y el 10 % (subproductos) a un valor
  reducido; la certificación agrega un premio por finura.

### 5.9 Precios de carne derivados (G) e ingreso por carne (C41)
Del precio base `G13 = precioCarneBase`:
```
G11 = G13·0,45   (cordero destete, en pie)
G16 = G13 − 0,5  (oveja descarte)
G15 = G16 + 0,15 (capón)
G12 = G14 = G17 = G13
```
Pesos de venta estándar del modelo: `E11=23, E14=48, E16=50` (kg). `I = rendimientoCanal`.
El **ingreso por carne (C41)** y el **total de carne (C46)** dependen de la categoría de
venta (B6):
```
Cord Dest: C41 = E11·G11·C24 + E16·G16·I·C31            ; C46 = E11·C24 + E16·C31
Cord Pz:   C41 = C25·E12·G12·I + C26·E12·G12·I + C31·E16·G16·I ; C46 = C25·E12 + C26·E12 + C31·E16
Cord Pes:  C41 = C25·E13·G13·I + C26·E13·G13·I + C31·E16·G16·I ; C46 = C25·E13 + C26·E13 + C31·E16
Bgos 4D:   C41 = C29·E17·G17·I + C30·E14·G14·I + C31·E16·G16·I ; C46 = C29·E17 + C30·E14 + C31·E16
Cap 6/8D:  C41 = C29·E17·G17·I + C31·E16·G16·I + C32·E15·G15·I ; C46 = C29·E17 + C31·E16 + C32·E15
Cap 8D:    C41 = C33·E15·G15·I + C29·E17·G17·I + C31·E16·G16·I ; C46 = C33·E15 + C29·E17 + C31·E16
```
- **Limitación (documentada):** los coeficientes 0,45 / −0,5 / +0,15 y los pesos
  `E11/E14/E16` son fijos del modelo (marca `V1-04`).

### 5.10 Comercialización, costos fijos y márgenes
```
Ingreso bruto:  C57 = C39 + C41

Comercialización (sobre ingresos):
  P16 = 0,02·C39 + 0,02·C41           (comisiones)
  P17 = 0,025·C39 + 0,02·C41          (IMEBA)
  P18 = 0,00125·(C39+C41)             (INIA)
  P19 = 0,00125·(C39+C41)             (MEVIR)
  P20 = 0,00125·C41                   (INAC)

Mano de obra:
  P21 = G8 · ((salarioMensualUYU · aguinaldoFactor · cargasSociales) / L10)

Dotación:  C52 = G35 / E6   (UG/ha; 0 si E6=0)
Renta:         P22 = (C52/B2)·(E5·rentaHa)          si B2>0, si no 0
Contribución:  P23 = (E3·contribucionHa)·(C52/B2)   si E3>0 y B2>0, si no 0

Costos fijos totales:  P26 = P16+P17+P18+P19+P20+P21+P22+P23

Márgenes:
  Margen bruto:        C64 = C57 − P25
  Ingreso de capital:  C70 = C64 − P16 − P17 − P18 − P19 − P20 − P21 − P23
  Margen neto:         C72 = C64 − P26
  Margen neto / ha:    C73 = C72 / E6                (0 si E6=0)
  Margen neto / oveja: C72 / C23                     (0 si C23=0)
  Margen bruto / ha:   C64 / E6                       (0 si E6=0)

Indicadores:
  IB/UG:     C57 / G35              (0 si G35=0)
  % IB lana:  (C39/(C39+C41))·100   ; % IB carne: (C41/(C39+C41))·100  (0 si suma=0)
```
- **Limitación (documentada):** hay una posible incoherencia de monedas entre `P21` (que
  divide por `L10`) y `rentaHa/contribucionHa` (que se asumen ya en USD); pendiente de
  confirmar contra el Excel (marca `M4`).

### 5.11 Supuestos y limitaciones generales del motor
- Reproduce **fielmente** un Excel de referencia (modelo Merino); coincide con **18
  resultados clave** del escenario de ejemplo con precisión < 1e-6.
- Varias constantes (pesos de faena/UG, coeficientes de precios de carne, umbrales) están
  **hardcodeadas** como "estándar del modelo"; están marcadas con `TODO(excel)` para
  auditar contra el Excel definitivo. **La auditoría completa (todas las categorías) está
  pendiente.**
- Todas las divisiones del motor están **protegidas** contra denominador 0 (devuelven 0),
  por lo que no se producen `NaN`/`Infinity` visibles.

---

## 6. Resultados (indicadores)

Origen: objeto `Resultados` (ver `src/engine/types.ts`) mostrado por `Resultados.tsx`.

| Indicador | Cómo se calcula | Interpretación |
|---|---|---|
| **Ingresos totales** (ingresoBruto, C57) | Ingreso lana + carne | Facturación bruta antes de costos |
| **Costos directos** (P25) | Sanidad + esquila + alimentación + carneros | Costos variables de producción |
| **Costos fijos** (P26) | Comercialización + mano de obra + renta + contribución | Costos de estructura y comercialización |
| **Margen bruto** (C64) | Ingreso bruto − costos directos | Rentabilidad antes de estructura; positivo esperable |
| **Margen neto total** (C72) | Margen bruto − costos fijos | **Resultado final**; negativo = pérdida |
| **Margen neto / ha** (C73) | Margen neto / superficie total | Eficiencia por hectárea; clave para comparar predios |
| **Margen neto / oveja** | Margen neto / ovejas de cría | Resultado por vientre |
| **Margen bruto %** | Margen bruto / ingreso bruto · 100 | Proporción del ingreso que queda tras costos directos |
| **Ingreso de capital** (C70) | Margen bruto − comercialización − mano de obra − contribución | Retorno al capital (excluye renta) |
| **IB / hectárea** | Ingreso bruto / superficie | Productividad económica de la tierra |
| **IB / UG** | Ingreso bruto / UG totales | Productividad por unidad ganadera |
| **Producción de lana** | totalLanaKg, lanaPorCab, kg/ha, micronaje pond. | Volumen y calidad de lana |
| **Producción de carne** | totalCarneKg | Kilos de carne producidos |
| **Dotación ovina** (C52) | UG / superficie | Carga animal real (comparar con la dotación segura) |

> **Cómo interpretar (guía general, no umbrales del sistema):** un **margen neto positivo**
> indica rentabilidad; el **margen/ha** permite comparar establecimientos de distinto
> tamaño; una **dotación** muy por encima de la "segura" puede indicar sobrecarga. La app
> **no** define umbrales de "bueno/malo" salvo la alerta de rentabilidad negativa (§7).

**Costo por kilo producido:** la aplicación **no** expone hoy un indicador explícito de
"costo por kg de lana/carne". Puede derivarse de los datos exportados (costos totales ÷ kg
producidos), pero no es un campo del modelo `Resultados`.

---

## 7. Alertas

Origen: `src/utils/validaciones.ts` (función `validar`). Tipos: `info` (🟡), `warn` (⚠️),
`err` (🔴). Se muestran arriba del panel de resultados.

| Condición | Tipo | Mensaje / significado | Qué hacer |
|---|---|---|---|
| ovejasEncarneradas ≤ 0 | info | "Ingresá la cantidad de ovejas encarneradas para comenzar." | Cargar la majada base |
| precioCarneBase ≤ 0 y micronaje ≤ 0 | warn | "Completá precios (carne / micronaje de lana)…" | Cargar precios para obtener resultados |
| precioDolar ≤ 0 con salario o esquila > 0 | err | "Cotización del dólar en 0: los valores en UYU no se convierten…" | Ingresar UYU/USD |
| precioCarneBase > 0 y rendimientoCanal ≤ 0 | warn | "Rendimiento de canal en 0: el ingreso por carne queda anulado." | Cargar el rendimiento |
| supPropiedad + supArrendada ≤ 0 | warn | "Superficie total en 0: no se pueden calcular indicadores por hectárea." | Cargar superficie |
| senaladaBase ≤ 0 | warn | "Señalada en 0: no se generan corderos…" | Cargar la señalada |
| trabajadores > 0 y salario ≤ 0 | warn | "Hay trabajadores pero salario 0: la mano de obra queda en 0." | Cargar el salario |
| dotacionSegura > 1,5 | warn | "Dotación muy alta (>1,5 UG/ha). Verificar sostenibilidad." | Revisar la carga |
| mortandad > 30 % (cualquiera) | err | "Mortandad de … >30% — revisá el valor…" | Corregir el valor |
| mortandad entre 10 % y 30 % | warn | "Mortandad … elevada (…%). Revisar sanidad." | Revisar sanidad |
| micronaje > 30 | warn | "Micronaje >30 µ: lana muy gruesa, revisar genética." | Verificar el dato |
| micronaje entre 0 y 15 | warn | "Micronaje <15 µ: valor inusualmente fino, verificar." | Verificar el dato |
| pesoAdulto entre 0 y 25 kg | warn | "Peso adulto <25 kg: verificar." | Verificar el dato |
| fecha encarnerada ≥ destete | warn | "La fecha de encarnerada debería ser anterior al destete." | Corregir fechas |
| margenNeto < 0 con ingreso > 0 | err | "RENTABILIDAD NEGATIVA: el margen neto es menor a cero." | Revisar costos/ingresos |

> El módulo de Evolución agrega un aviso propio (info) cuando faltan fechas de encarnerada y
> venta: usa una distribución **estimada** hasta que se carguen.

---

## 8. Gráficos

Origen: `Resultados.tsx` (dashboard) y `Timeline.tsx` (evolución), con la librería
**Recharts** (animaciones desactivadas para recálculo en tiempo real).

1. **Composición de Ingresos** (torta). *Datos:* ingreso de lana y de carne (solo valores
   > 0). *Interpretación:* peso relativo lana vs. carne. *Limitación:* si un rubro es 0, no
   aparece; en estado totalmente vacío no se dibuja.
2. **Desglose de Costos** (barras horizontales). *Datos:* sanidad, esquila, alimentación,
   carneros, comercialización, mano de obra, renta+contribución (solo > 0).
   *Interpretación:* dónde se concentra el gasto.
3. **Unidades Ganaderas (UG) por categoría** (barras). *Datos:* UG de cada categoría con
   cantidad > 0,01. *Interpretación:* estructura de la carga animal.
4. **Evolución / Cash Flow mensual** (barras + línea). *Datos:* ingresos (verde) y costos
   (rojo, negativos) por mes, más el **acumulado** (línea azul, opcional).
   *Interpretación:* estacionalidad del flujo de caja a lo largo del ciclo.
   *Limitación:* es una **distribución estimada** del total anual (ver §5 y §3.3), no un
   registro de caja real.

---

## 9. Validaciones

- **A nivel de campo (entrada):** todos los campos numéricos usan `NumberField`, que
  **coerciona a número ≥ 0** (descarta `NaN` y recorta negativos a 0), con `min=0`. No hay
  tope superior forzado. Los porcentajes se editan como % y se guardan como fracción 0–1.
  La rueda del mouse sobre un campo enfocado **no** cambia su valor (se hace `blur`).
- **A nivel de dominio (avisos):** la función `validar` (ver §7) recorre reglas de negocio y
  emite `info`/`warn`/`err`. No bloquean el cálculo: son orientativas.
- **A nivel de presentación:** el formateador (`fmtUSD`, `fmtNum`) convierte cualquier valor
  **no finito** (`NaN`/`Infinity`) a **0**, de modo que nunca se muestran esos tokens.
- **Robustez de datos:** al cargar datos guardados se aplica `sanitizeInputs`, que mergea
  sobre el preset vacío (rellena campos faltantes de versiones viejas) y garantiza que
  `medicamentos` sea un arreglo válido, evitando errores por esquemas viejos o corruptos.
- **Tratamiento de errores de render:** un `ErrorBoundary` envuelve la app para que una
  excepción no deje la pantalla en blanco.

---

## 10. Persistencia

### 10.1 Qué se guarda y dónde
- **Borrador en curso:** el `Inputs` que se está editando. Clave `localStorage`:
  `ganadero_borrador_v1`.
- **Escenarios con nombre:** lista de `{ id, nombre, fecha, inputs }`. Clave `localStorage`:
  `ganadero_escenarios_v1`. El `id` se genera con `crypto.randomUUID()`.
- Todo vive en el **navegador/dispositivo del usuario**; no hay servidor.

### 10.2 Autoguardado
- Cada cambio del formulario dispara un guardado del borrador con **debounce de 400 ms** (no
  escribe en cada tecla).
- Al **ocultar/cerrar** la pestaña (`visibilitychange` → oculta) se hace un **flush** del
  último estado para no perder lo tipeado dentro de la ventana de debounce.
- Al **abrir** la app, se restaura el borrador (saneado); si no hay, arranca con el preset
  vacío.
- La escritura es **best-effort**: si el almacenamiento está lleno o bloqueado (modo
  privado), la operación falla silenciosamente **sin** tumbar la UI.

### 10.3 Escenarios (guardar / cargar / comparar)
- **Guardar:** desde el modal 💾, con un nombre. Se agrega a la lista.
- **Cargar:** desde 📂, elige un escenario (los inputs se sanean al cargar).
- **Eliminar:** desde 📂, con confirmación.
- **Comparar:** desde 🔄, la configuración actual (A) contra un escenario (B), con Δ por
  indicador (ingreso bruto, costos directos/fijos, márgenes, lana, animales).

### 10.4 Importar / Exportar
- **Exportar CSV** (📊): genera un `.csv` (separador `;`, con BOM para Excel) con producción,
  categorías, ingresos, costos y resultados; se descarga como
  `rentabilidad_<predio>.csv`. Archivo: `src/utils/exportar.ts`.
- **Exportar PDF** (📥): usa el **diálogo de impresión** del navegador (Guardar como PDF); un
  `@media print` adapta el diseño para el papel.
- **Copiar diagnóstico** (📋): copia versión, fecha/hora, navegador, sistema, idioma y user
  agent (sin datos personales), para pegar en el formulario de reporte.
- **Nota:** no existe una función de **importar** un CSV/escenario desde archivo; el
  intercambio entre dispositivos se hace re-cargando datos manualmente o guardando
  escenarios en el mismo navegador.

---

## 11. PWA

### 11.1 Instalación
La app declara un **manifest** (`public/manifest.webmanifest`): `name`, `short_name`,
`display: standalone`, `theme_color`, `background_color` e íconos 192/512 (incluye uno
`maskable`). Los navegadores compatibles ofrecen **"Instalar aplicación"**; una vez
instalada, se abre como app independiente.

### 11.2 Funcionamiento offline
El **service worker** (`public/sw.js`) se registra **solo en producción** y sobre http(s)
(ruta relativa `./sw.js`). Estrategia:
- **Navegación / HTML:** *network-first* — si hay red, trae la última versión; si no,
  responde desde caché (y como último recurso, un mensaje "Sin conexión").
- **Resto de assets** (JS/CSS hasheados, íconos, manifest): *stale-while-revalidate* —
  sirve del caché al instante y actualiza en segundo plano.
- **Requisito:** el uso offline funciona **tras la primera carga online** (el service worker
  cachea a medida que se usan los recursos; no hay precarga).

### 11.3 Actualización de versiones
El caché es **versionado** (`rentab-ovina-v2`). Al activar una versión nueva del service
worker, se **borran los cachés anteriores**. Como la navegación es *network-first*, los
usuarios online reciben la versión nueva en la siguiente carga (no quedan "congelados" en
una versión vieja).

### 11.4 Compatibilidad con GitHub Pages
La app usa **rutas relativas** (`base: './'`), manifest/SW/íconos relativos y **no** tiene
enrutador, por lo que funciona servida desde un **subdirectorio** (`/app-ganadero-ovino/`).
Está publicada en `https://matiasorihuelab-wq.github.io/app-ganadero-ovino/`.

---

## 12. Anexo técnico — todas las fórmulas por módulo

> Notación compacta; el detalle y los condicionales por categoría están en §5. Variables:
> `Bx` = entradas, `Cx` = cantidades, `Ex/Fx` = pesos/micras de lana, `Gx` = UG, `AA/AB/AD/AE`
> = costos por cabeza, `Px/Qx/Rx/Sx` = costos totales, `C39/C41/C57` = ingresos,
> `C64/C70/C72/C73` = márgenes.

### 12.1 Motor económico (`engine/calc.ts`)
**Sanidad unitaria**
```
AOᵢ = dosisᵢ·precioᵢ/volumenᵢ  (0 si volumen=0)
```
**Cantidades (cascada)**
```
C23 = ovejasEncarneradas
C24 = C23·B4·(1−B17) − C26      C25,C27,C28 = C23·B4·(1−B17)·(1−mort)/2  [− C26 en C28]
C26 = C23·B4·(1−B17)·(1−B19)/2 − C23·B5 [− C23·B16 según categoría]
C29 = (C28 − C23·(B5+B16))·(1−B20)   C30 = C27·(1−B20)   C31 = C23·B5·(1−B16)
C32 = C30·(1−B20)   C33 = C32·(1−B20)   C34 = C23·relacionCarnerosStock
C35 = C23+C25+C26+C27+C28+C29+C30+C31+C32+C33+C34
```
**Lana (pesos/micras/UG)**
```
E23 = B3·B14·(0,9 si dotación≥2, si no 1)   Eᵢ = E23·{0,4;0,7;1;1,08;0,9;1,05;1,2}
Fᵢ = f(micronaje) por categoría              Gᵢ = polinomios de peso · Cᵢ ;  G35 = Σ Gᵢ
```
**Costos directos**
```
AA (sanidad/cab) = (Σ AF±·AOᵢ + AK8·k + AK9 [+ AK10]) · coef
AB3 = costoEsquilaUYU·factorEsquila/L10 + adicionalEsquilaUSD ;  AB7 = 2·AB3
AD  = {0 | AK19 | AO24} según sistema ;  AK19 = precioRacionCN·suplDiarioCN·duracionCN·1,1
AE3 = precioCarnero/(ovejasPorCarnero·vidaCarneroAnios)
P13=Σ Cᵢ·AAᵢ ; Q13=Σ Cᵢ·ABᵢ ; R13=Σ Cᵢ·ADᵢ ; S13=C23·AE3 ; P25=P13+Q13+R13+S13
```
**Lana: producción, precio e ingreso**
```
C45 = Σ Cᵢ·Eᵢ    C47 = C45/C35    C48 = Σ Cᵢ·Eᵢ·Fᵢ / Σ Cᵢ·Eᵢ
V4 = poly(C48) + L13    C39 = C45·0,9·V4 + C45·0,1·E20
```
**Carne**
```
G11=0,45·G13 ; G16=G13−0,5 ; G15=G16+0,15
C41 = Σ (peso · precio · rendimiento · cantidad)  [según categoría]
C46 = Σ (peso · cantidad)
```
**Ingresos, comercialización, fijos, márgenes**
```
C57 = C39 + C41
P16=0,02(C39+C41) [carne 0,02] ; P17=0,025·C39+0,02·C41 ; P18=P19=0,00125(C39+C41) ; P20=0,00125·C41
P21 = G8·(salario·aguinaldo·cargas / L10)
C52 = G35/E6 ;  P22 = (C52/B2)·E5·rentaHa ;  P23 = E3·contribucionHa·(C52/B2)
P26 = P16+P17+P18+P19+P20+P21+P22+P23
C64 = C57 − P25   ;   C70 = C64 − (P16+P17+P18+P19+P20+P21+P23)
C72 = C64 − P26   ;   C73 = C72/E6   ;   margen/oveja = C72/C23
IB/UG = C57/G35 ; %lana = 100·C39/(C39+C41) ; %carne = 100·C41/(C39+C41)
```
*(Todas las divisiones devuelven 0 si el denominador es 0.)*

### 12.2 Evolución temporal (`engine/timeline.ts`)
Distribuye los totales anuales en 12 meses, partiendo del mes de **encarnerada** (o enero
si no hay fecha):
```
Ingreso lana  → mes de esquila         Ingreso carne → mes de venta
Costo esquila → mes de esquila         Comercialización → mes de venta
Sanidad → repartida en eventos {encarnerada, parición(≈+5m), destete}
Alimentación → ventana de suplementación (round(duracionCN/30) meses) terminando en la venta
Carneros → mes de encarnerada (inversión puntual)
Mano de obra → /12 mensual             Renta+Contribución → /12 mensual
Flujoₘ = Ingresosₘ − Costosₘ           Acumuladoₘ = Σ Flujo hasta m
```
La **suma anual reconcilia** con el margen neto del dashboard.

### 12.3 Formato y presentación (`utils/format.ts`)
```
fmtUSD(n) = "$ " + n en es-UY   (n no finito → 0)
fmtNum(n) = n en es-UY          (n no finito → 0)
fmtPct(n) = fmtNum(n) + " %"    ;   round(n, dec) = redondeo a `dec` decimales
```

### 12.4 Módulo nutricional (`src/nutrition/`) — sin fórmulas
Actualmente **no realiza cálculos**: es infraestructura de **consulta** de tablas oficiales
(hoy vacías) vía `NutrientRequirementProvider`. Documentación: `docs/nutricion/`.

---

*Fin del manual. Todo el contenido deriva del código fuente y de la documentación del
repositorio; no se agregó información externa. Para el detalle de gobernanza del motor
(baseline y política de cambios) ver `docs/BASELINE_RC1.md` y `docs/CHANGE_POLICY.md`.*
