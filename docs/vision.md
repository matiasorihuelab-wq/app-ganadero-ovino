# Visión del proyecto — App Ganadero Ovino

> Documento de referencia. Toda decisión de producto o arquitectura debería poder
> justificarse a partir de este documento y de los [ADR](./adr/). Si una propuesta
> no encaja con esta visión, primero se discute la visión, no se fuerza la propuesta.

## Propósito

Construir una **plataforma digital para la producción ovina uruguaya** que ayude a
los productores a entender y mejorar la **rentabilidad económica y productiva** de su
establecimiento, a partir de datos propios y de un motor de cálculo transparente y
validado.

El objetivo de fondo es que, si la herramienta demuestra ser genuinamente útil, pueda
convertirse en una **referencia para el sector** y eventualmente ser adoptada por una
institución como el **Secretariado Uruguayo de la Lana (SUL)**. Esa adopción será una
**consecuencia de la calidad**, no una condición de diseño impuesta desde el inicio.

## Usuarios objetivo

- **Productor ovino** (usuario primario): carga los datos de su predio (majada, pesos,
  precios, costos) y obtiene indicadores de rentabilidad y producción. Perfil rural,
  no técnico; la herramienta debe ser clara, en español y sin jerga innecesaria.
- **Asesor / técnico agropecuario** (usuario secundario): usa la herramienta para
  analizar escenarios y comparar alternativas con o para el productor.
- **Institución del sector** (usuario futuro, p. ej. SUL): potencial adoptante que
  podría integrar la herramienta a su ecosistema digital. Hoy **no participa** del
  desarrollo.

## Alcance

### Qué resuelve (hoy)

- Cálculo de rentabilidad ovina (ingresos por lana y carne, costos directos y fijos,
  márgenes) replicando fielmente un modelo de referencia validado contra Excel (18/18).
- Carga de datos por formulario, con resultados **en tiempo real**.
- Análisis complementarios: evolución temporal / flujo de caja y **requerimientos
  nutricionales** (consulta de tablas oficiales, no un modelo propio).
- Guardado, comparación y exportación (CSV/PDF) de **escenarios** locales.
- Funciona como SPA, PWA instalable y archivo único offline.

### Qué NO resuelve (hoy, y es deliberado)

- **No** es multiusuario ni colaborativo: no hay cuentas, login ni datos compartidos.
- **No** persiste en servidor: los datos viven en el navegador del usuario.
- **No** integra con sistemas externos (ni del SUL ni de terceros).
- **No** hace trazabilidad individual de animales, ni gestión de stock en tiempo real,
  ni cumplimiento normativo. Es una herramienta de **análisis de rentabilidad**, no un
  ERP ganadero.

Estos límites son intencionales: mantienen el producto simple y enfocado mientras se
consolida el núcleo de valor (el motor de cálculo y la experiencia de análisis).

## Principios de diseño

1. **El motor de cálculo es el activo principal** y permanece **independiente de la
   interfaz**. La lógica de negocio no depende de React ni del navegador.
2. **Simplicidad sobre complejidad.** Se prefiere la solución más simple que resuelva
   el problema real y actual.
3. **Evitar dependencias innecesarias.** Cada dependencia es un costo de mantenimiento
   y un riesgo; se incorpora solo con justificación.
4. **Diseñar para evolucionar, no para anticipar todos los escenarios.** Se crean
   límites (boundaries) claros que permitan cambiar piezas sin reescribir el todo, sin
   construir hoy infraestructura para necesidades que aún no existen.
5. **Documentar las decisiones importantes** ([ADR](./adr/)). El "por qué" es tan
   valioso como el código.
6. **Calidad verificable.** `build` + `typecheck` + `lint` + `validate` (motor vs
   Excel) en verde, automatizado por CI, como condición de avance.
7. **Privacidad.** El repositorio y los datos del usuario son privados; nada se publica
   ni se comparte sin decisión explícita.

## Criterios para aceptar nuevas funcionalidades

Una funcionalidad nueva se considera para incorporación solo si cumple, idealmente,
todos estos criterios:

- **Sirve al usuario primario** (el productor) de forma concreta y demostrable.
- **No compromete el núcleo:** no degrada ni acopla el motor de cálculo a la UI.
- **Respeta los boundaries** de arquitectura (ver [architecture.md](./architecture.md));
  si los toca, viene acompañada del ADR correspondiente.
- **No introduce deuda técnica** sin que esté documentada y justificada.
- **No agrega dependencias pesadas** sin análisis de alternativas.
- **Es coherente con una futura integración institucional** (no cierra puertas a
  escalar hacia backend / multiusuario el día que haga falta).
- **Es verificable** (idealmente con cobertura automatizada o, como mínimo, un
  procedimiento de validación reproducible).

Ante la duda, se prioriza **consolidar la base** antes que sumar superficie.

## Visión de evolución hacia una plataforma institucional

El camino es incremental y guiado por necesidad real, no por anticipación:

1. **Hoy — Producto personal, client-side.** SPA con persistencia en el navegador
   (`localStorage`). Foco: que el núcleo sea excelente y la herramienta, genuinamente
   útil. Ver [ADR-0001](./adr/0001-client-side-first.md).
2. **Cuando haya necesidad real — Backend y multiusuario.** Si el uso lo justifica
   (compartir escenarios, respaldo, acceso multi-dispositivo), se introduce un backend
   detrás de los boundaries ya definidos (la persistencia ya está desacoplada por
   interfaz). Será una migración deliberada, con su ADR.
3. **Si la adopción institucional se concreta — Integración con el ecosistema del
   SUL.** Cada funcionalidad se diseña pensando en que ese día pueda integrarse
   (formatos de datos, identidad, APIs), pero **sin** construir esa integración antes
   de que exista un acuerdo y una necesidad concretos.

La transferencia del repositorio a una organización institucional, si ocurre, será una
decisión del titular del proyecto evaluada junto al SUL, no algo que se anticipe en el
diseño.
