# 0001 — Client-side first (SPA + localStorage)

- **Estado:** Aceptado (2026-06-28)
- **Decisión tomada por:** titular del proyecto, con propuesta del rol de arquitectura.

## Contexto

App Ganadero Ovino es hoy un proyecto **personal y experimental**. Su prioridad es
**validar la utilidad real** de la herramienta para el productor ovino antes de invertir
en infraestructura. Las fuerzas en juego:

- El **activo central** es el motor de cálculo (validado contra Excel, 18/18), no la
  infraestructura. Donde hay que poner esfuerzo es en el núcleo y la experiencia.
- Es de **un solo usuario** y un solo dispositivo en la práctica. No hay necesidad
  actual de cuentas, colaboración ni datos compartidos.
- **Privacidad:** los datos del productor (económicos, sensibles) no deberían salir de
  su equipo sin una razón y un acuerdo explícitos.
- **Sin presupuesto ni necesidad de operar servidores** en esta etapa. Cada pieza de
  backend es costo de desarrollo, operación y seguridad.
- Se busca **iteración rápida** y despliegue trivial para poder mostrar el producto.

## Decisión

Construir la aplicación como una **SPA client-side** (React + TypeScript + Vite), **sin
backend, sin base de datos y sin autenticación**, persistiendo los escenarios del
usuario en **`localStorage`** del navegador (clave `ganadero_escenarios_v1`).

## Consecuencias

### Positivas

- **Cero infraestructura/operaciones:** nada que desplegar, monitorear ni asegurar del
  lado servidor. Despliegue como estáticos (incluso un único HTML offline).
- **Iteración rápida** y foco en el núcleo de valor (motor + UX).
- **Offline-first** y **privacidad por defecto:** los datos viven en el equipo del
  usuario; nada se transmite.
- **Simplicidad:** menos piezas móviles, menos superficie de error, menos dependencias.

### Negativas (asumidas a conciencia)

- **Un solo dispositivo:** los escenarios no se sincronizan entre equipos.
- **Sin multiusuario ni colaboración.**
- **Sin respaldo central:** si el usuario limpia el navegador, pierde sus escenarios
  (mitigable parcialmente con la exportación CSV/PDF ya existente).
- **Límite de tamaño** de `localStorage` (~5 MB) y almacenamiento sin garantías de
  durabilidad.
- **Sin telemetría central** para entender el uso (coherente con la prioridad de
  privacidad en esta etapa).

## Camino de migración (cómo no quedar atrapados)

La decisión es client-side **por ahora**, no para siempre. Para no pintar el proyecto en
un rincón:

- La persistencia se aísla detrás de un **puerto** (`EscenarioRepository`), de modo que
  `localStorage` sea **un detalle de implementación intercambiable**, no una dependencia
  esparcida por la app. Ver [ADR-0002](./0002-storage-abstraction.md).
- Cuando exista una **necesidad real** (sincronización, respaldo, multiusuario,
  integración con el ecosistema del SUL), se implementará un nuevo adapter del puerto
  (p. ej. HTTP contra una API) **sin reescribir la UI ni el motor**. Ese cambio incluirá
  pasar el puerto a **asíncrono** y será una migración deliberada con su propio ADR.

Mientras tanto, **no** se construye backend ni se adoptan servicios que asuman
multiusuario: sería anticipar un escenario que todavía no existe.

## Alternativas consideradas

1. **Backend + base de datos desde el inicio.** Descartada: prematuro. Agrega costo de
   desarrollo y operación, ralentiza la validación del producto y no resuelve ninguna
   necesidad actual del usuario.
2. **Backend-as-a-Service (Firebase / Supabase).** Descartada por ahora: incorpora una
   dependencia importante y complejidad de autenticación/permisos que aún no se
   justifica, además de cierto vendor lock-in. Se reevaluará si aparece la necesidad de
   multiusuario o sincronización.
3. **Solo exportar/importar archivos (sin persistencia automática).** Descartada como
   única vía: degrada la experiencia (el usuario tendría que gestionar archivos a mano).
   La exportación CSV/PDF se mantiene como complemento, pero `localStorage` da una UX
   fluida de guardar/cargar sin fricción.
