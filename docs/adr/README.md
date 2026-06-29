# Architecture Decision Records (ADR)

Este directorio registra las **decisiones de arquitectura** importantes del proyecto:
no solo *qué* se decidió, sino el *contexto* y el *porqué*. El valor de un ADR está en
poder reconstruir, dentro de un año, por qué algo es como es —y revisarlo con criterio.

## Convención

- Un archivo por decisión: `NNNN-titulo-en-kebab-case.md` (numeración incremental).
- Los ADR son **inmutables** una vez aceptados. Si una decisión cambia, se escribe un
  ADR nuevo que **supersede** al anterior (y se actualiza el `Estado` del viejo).
- Estados: `Propuesto` → `Aceptado` → (`Superseded por NNNN` | `Deprecado`).

## Formato

Cada ADR sigue esta estructura (inspirada en MADR, simplificada):

- **Contexto** — la situación y las fuerzas en juego.
- **Decisión** — qué se decidió, en una frase clara.
- **Consecuencias** — positivas y negativas (las negativas se asumen a conciencia).
- **Alternativas consideradas** — qué más se evaluó y por qué se descartó.

## Índice

- [0001 — Client-side first (SPA + localStorage)](./0001-client-side-first.md)
- [0002 — Abstracción de persistencia (puerto EscenarioRepository)](./0002-storage-abstraction.md)
