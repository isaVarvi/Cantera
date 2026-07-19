# PROYECTO — Cantera

> **Este archivo es la memoria viva del proyecto.** Sirve como instrucciones para
> continuar Y como registro de decisiones y estado. **Mantenlo actualizado**: cada vez
> que se termine algo importante, actualiza "Estado actual" y "Roadmap".

---

## 1. Visión

Checklist de mudanza para Isabela: se muda a **Querétaro por 5 meses** (agosto–diciembre)
a un cuarto compartido (1 roomie) dentro de un edificio de estudiantes, con baño privado
pero cocina/lavandería/áreas comunes compartidas.

- Checklist organizado por categorías (cocina, cuarto, baño, lavandería, mochila diaria,
  seguridad, ropa), con ítems editables/agregables/eliminables.
- **Modo Ida (agosto)** y **Modo Regreso (diciembre)**: misma lista base de ítems, pero
  cada modo tiene su propio progreso (checks independientes). Si se agrega un ítem nuevo
  en un modo, aparece también en el otro — solo el check es por modo.
- Se usa principalmente **desde el celular mientras empaca maletas**, offline.

**Alcance:** v1 es 100% personal (uso propio, un solo dispositivo/navegador — el progreso
no sincroniza entre dispositivos porque vive en `localStorage`).

---

## 2. Stack técnico

- **HTML/CSS/JS vanilla.** Sin framework, sin build step, sin dependencias externas
  (ni siquiera fuentes de Google) — a propósito, para que cargue instantáneo y funcione
  100% offline una vez abierta.
- **Sin backend.** Todo el estado vive en `localStorage` (una sola key, ver §4). Misma
  decisión que se tomó en `pagina-web-3-cozy-todo` para v1: sin cuentas ni Firebase, se
  mantiene simple porque es un solo usuario en un solo dispositivo.
- **Deploy:** Vercel (deploy estático directo de los 3 archivos, sin proceso de build).

### Por qué no el stack de los proyectos hermanos (Next.js + Tailwind + shadcn)

Los otros proyectos del workspace (`pagina-web-1`, `pagina-web-2-biblioteca`,
`pagina-web-3-cozy-todo`) usan Next.js. Aquí se decidió **no** usarlo: es una app de un
solo uso, de vida corta (~5 meses), de una sola pantalla — el peso de un framework/build
no aporta nada y sí le resta velocidad de carga en el celular mientras empaca.

---

## 3. Decisiones tomadas (locked)

| Tema | Decisión |
|---|---|
| **Nombre** | **Cantera** — por la piedra cantera de las fachadas del centro de Querétaro |
| **Carpeta** | `pagina-web-4-cantera` |
| **Persistencia** | `localStorage`, key `cantera-mudanza-v1`. Sin backend, sin cuentas. |
| **Paleta** | "Cantera cálida": terracota/cantera/dorado sobre fondo crema, con modo
  oscuro automático vía `prefers-color-scheme` (ver `style.css` `:root`) |
| **Tipografía** | Fuentes de sistema (Georgia para títulos, system-ui para cuerpo) —
  cero fuentes externas, garantiza que funcione offline |
| **Reset** | Reinicia (desmarca) el progreso del modo actual, **no borra ítems** — para
  eso existe el botón de eliminar por ítem, que sí es permanente y sí pide confirmación |

---

## 4. Modelo de datos (localStorage)

Una sola key `cantera-mudanza-v1`, JSON serializado:

```js
{
  version: 2,
  mode: "ida" | "regreso",
  dates: { ida: "2026-08-15", regreso: "" },   // input type=date, opcional
  categories: [
    {
      id: "cocina",
      name: "Cocina (compartida)",
      kind: "items",              // "items" (empaque) | "tasks" (Antes de irme)
      group: null,                // null | "antes-de-irme"
      items: [ { id: "cocina-0", text: "Plato, tazón y taza personales" }, ... ]
    },
    {
      id: "casa",
      name: "Casa / cuarto actual",
      kind: "tasks",
      group: "antes-de-irme",
      items: [
        ...,
        { id: "casa-6", text: "Revisar qué necesitas comprar...", dynamic: "pendingCount" }
      ]
    },
    ...
  ],
  checks: {
    ida:     { "cocina-0": true, ... },  // solo entradas marcadas; ausente = sin marcar
    regreso: { "cocina-0": false, ... }
  },
  taskChecks: { "tramites-0": true, ... }  // check de "Antes de irme", NO por modo
}
```

- `categories` es la única fuente de verdad de qué ítems existen — compartida entre
  ambos modos (para `kind: "items"`).
- `checks.ida` / `checks.regreso`: mapas independientes `itemId -> boolean`, solo para
  categorías `kind: "items"`.
- `taskChecks`: un solo mapa `itemId -> boolean` para categorías `kind: "tasks"` — no se
  repite entre Ida/Regreso porque son pendientes de una sola vez.
- `checksFor(cat)` en `app.js` decide qué mapa usar según `cat.kind`.
- Los ítems por default (`DEFAULT_CATEGORIES` + `DEFAULT_TASK_CATEGORIES` en `app.js`) se
  generan una sola vez, la primera vez que se carga la app sin datos guardados.
- **Sí hay migración** para categorías/ítems nuevos agregados al código después de que ya
  existan datos guardados, pero solo a nivel de grupo: `load()` agrega las categorías de
  `group: "antes-de-irme"` completas si no existen todavía (ver `hasTaskGroup` en
  `load()`). Agregar un ítem suelto a una categoría *ya existente* sigue sin propagarse
  solo — habría que hacerlo a mano desde la UI o ampliar `load()`.

Categorías de empaque y conteo de ítems: Cocina (12), Cuarto (17), Baño (12), Lavandería
(7), Para andar/mochila diaria (6), Random/seguridad (14), Ropa (6). Total: 74 ítems.

Subcategorías de "Antes de irme": Trámites y documentos (6), Transporte (4), Casa/cuarto
actual (7), Salud y bienestar (4), Social/logística (5). Total: 26 ítems.

---

## 5. Funcionalidad implementada

Todo lo del pedido original está hecho:

1. Checklist por categorías con checkbox por ítem.
2. Agregar ítem nuevo a cualquier categoría (form al fondo de cada categoría).
3. Eliminar ítem (con `confirm()`, borra de ambos modos porque la lista es compartida).
4. Editar nombre de ítem (clic en el lápiz → input inline, Enter/blur guarda, Esc cancela).
5. Modo Ida/Regreso con checks independientes sobre la misma lista (`setMode()` en `app.js`).
6. Barra de progreso global y por categoría (ej. "Cocina: 5/12").
7. Persistencia en `localStorage`, se guarda en cada mutación (`save()`).
8. Reset por categoría y global, con `confirm()` antes de desmarcar.
9. Diseño mobile-first, sin librerías, paleta cantera/terracota.
10. Contador de días ("Faltan X días") por fecha de ida/regreso, opcional.
11. Funciona offline una vez cargada — no hay ninguna llamada de red en el código.

Todo el render es un `render()` que reconstruye el DOM desde `state` en cada cambio, con
event delegation en `.app` (`appEl.addEventListener`) en vez de re-bindear listeners por
ítem — así no hay que preocuparse por listeners huérfanos al agregar/eliminar ítems, y el
mismo delegado cubre tanto `#categories` como `#antes-de-irme-list`.

### "Antes de irme" (2026-07-19)

Segunda sección, mismo componente de checklist (`renderCategory()`), pero categorías con
`kind: "tasks"` y `group: "antes-de-irme"` en vez de `kind: "items"`. Diferencias clave
frente al checklist de empaque:

- **Check independiente de Ida/Regreso** (`state.taskChecks`, no `state.checks[mode]`):
  son pendientes de una sola vez ("antes de irme a Qro"), no algo que se repite al volver.
  `checksFor(cat)` decide qué mapa usar según `cat.kind`.
- 5 subcategorías: Trámites y documentos, Transporte, Casa/cuarto actual, Salud y
  bienestar, Social/logística (26 ítems en total).
- Un ítem especial en "Casa/cuarto actual" tiene `dynamic: "pendingCount"` — su texto se
  calcula en cada render (`getItemDisplayText()`) mostrando cuántos ítems del checklist
  de empaque (modo actual) siguen sin marcar. El texto base (`item.text`) no incluye el
  conteo — se le pega el sufijo solo al mostrarlo, así editar el ítem no lo rompe.
- Diferenciación visual: `.category--tasks` (borde izquierdo sage) + ícono `✓` vs `▪` en
  el header — mismo componente, look distinto.
- **Migración:** `load()` revisa si el estado guardado ya tiene categorías con
  `group === "antes-de-irme"`; si no, las agrega (y agrega `taskChecks: {}` si falta) sin
  tocar el progreso de empaque existente. Necesario porque la app ya estaba desplegada
  antes de este cambio.
- La barra de progreso global ("X/Y empacado") **excluye** categorías `kind: "tasks"`
  a propósito — tiene su propia barra en el header de la sección ("X/Y listo").

### Sugerencia random (2026-07-19)

Widget en `#suggestion-widget`, con tres estados manejados por una variable de módulo
`widgetMode` ("idle" | "suggestion" | "empty") + `currentSuggestion`:

- **idle:** botón "¿No sabes qué hacer? →".
- **suggestion:** elige un ítem al azar **sin marcar de TODAS las categorías** (empaque +
  antes de irme, `getAllPendingSuggestions()`), con botones "Marcar como hecho ✓" (marca
  y pide una nueva sugerencia automáticamente) y "Otra sugerencia" (excluye la actual del
  sorteo si hay más de una pendiente).
- **empty:** mensaje "¡Ya no hay pendientes, estás list@ para Qro! 🎉" con botón "Revisar
  de nuevo" (útil si agrega ítems nuevos después).
- `renderSuggestionWidget()` se llama al final de cada `render()` global y revalida la
  sugerencia mostrada (por si el ítem se marcó/borró desde su propia categoría en vez de
  desde el widget) — si ya no es válida, vuelve a "idle".
- Animación: clase `.suggestion-anim` (`@keyframes suggestionIn`, fade + slide de 6px) que
  se remueve y re-agrega forzando reflow (`void el.offsetWidth`) para que se reinicie en
  cada cambio de contenido.

### Dashboard / gráficas (2026-07-19)

Pedido: layout de dos columnas — checklist de un lado, gráficas de progreso del otro.
`<aside class="dashboard" id="dashboard">` (en `index.html`, dentro de `.layout` junto a
`.main-col`), poblado por `renderDashboard()` en cada `render()`.

- **Layout responsivo:** `.layout` es `flex-direction: column` (dashboard queda al final,
  después de "Empaque") hasta 880px; a partir de ahí (`@media (min-width: 880px)`) pasa a
  `row` y `.app` crece a `max-width: 1120px`. En mobile el dashboard **no** se reordena
  arriba — sigue siendo checklist-first, el dashboard queda al fondo de la página (es un
  bonus, no compite con el uso principal de empacar desde el celular).
- **Colores de gráfica separados de los de UI:** `--chart-a` (Empaque) y `--chart-b`
  (Antes de irme) en vez de reusar `--terracota`/`--sage` directamente. Necesario porque
  `--terracota`/`--sage` (sobre todo en modo oscuro, L≈0.7) no pasaban el validador de
  `dataviz` (piso de lightness/croma para uso categórico en gráficas) — se recalibraron
  valores específicos para gráficas que sí pasan:
  `node scripts/validate_palette.js "#BF5B34,#178F6E" --mode light` y
  `"#CE7040,#209A75" --mode dark` → **ALL CHECKS PASS** (CVD queda en banda 6.3–7.8, WARN,
  legal solo con codificación secundaria — por eso cada barra/leyenda siempre lleva
  ícono + texto, nunca solo color). `--chart-a-track`/`--chart-b-track` son
  `color-mix(in oklab, var(--chart-a) 20%, var(--surface-soft))` — track más clara del
  mismo tono, no gris genérico.
- **Qué se muestra** (según `references/choosing-a-form.md` de la skill `dataviz`: una
  proporción sola → *meter*, no dona/pie; magnitud comparada entre categorías → *bar
  chart*; un valor puntual → *stat tile*):
  - Dos **meters** grandes (barra + valor %): "Empaque" y "Antes de irme".
  - Dos **stat tiles**: pendientes totales (suma de ambos grupos) y días restantes
    (según la fecha del modo actual — reusa `daysLeft()`).
  - **Bar chart** de las 12 categorías (7 empaque + 5 antes de irme), ordenadas como
    aparecen en `state.categories`, coloreadas por grupo (`--chart-a`/`--chart-b`) con
    leyenda de 2 ítems arriba (obligatoria por tener ≥2 series, per skill `dataviz`).
- Todo recalcula en cada `render()` — no hay estado propio del dashboard, es una vista
  derivada de `state.categories` + `state.checks` + `state.taskChecks`.

---

## 6. Estado actual

**Hecho (v1 completa):** ✅ (2026-07-19)
- ✅ `index.html` + `style.css` + `app.js` — funcionalidad completa descrita en §5.
- ✅ Verificado con Chrome headless (`--dump-dom` y screenshot): renderiza los 74 ítems,
  sin errores de consola, tanto por `http://` como por `file://` directo, y el modo
  oscuro automático se ve bien.
- ✅ `git init` local, primer commit, identidad `Isabela Varela <isavarelavi@gmail.com>`
  (misma que en los proyectos hermanos).
- ✅ **Vercel:** desplegado en **https://pagina-web-4-cantera.vercel.app** (cuenta
  `varvi`, la misma de Cozy To-Do).
- ✅ **GitHub:** **https://github.com/isaVarvi/Cantera** (repo público), conectado al
  proyecto de Vercel (`vercel git connect`) — **cada push a `master` redespliega
  automático**, igual que Cozy To-Do.

## Deploy

- **Vercel:** https://pagina-web-4-cantera.vercel.app
- **GitHub:** https://github.com/isaVarvi/Cantera
- Flujo normal desde ahora: editar → `git add` / `git commit` / `git push` → Vercel
  redespliega solo. `vercel --prod` manual ya no debería hacer falta salvo para probar
  algo sin commitear.

---

## 7. Roadmap / ideas futuras (no en v1, no diseñar todavía)

- Si algún día se necesita ver el progreso desde más de un dispositivo, evaluar migrar
  de `localStorage` a algo sincronizado (Firebase) — **no vale la pena para v1**, es un
  solo dispositivo por 5 meses.
- La migración de `load()` solo cubre grupos completos nuevos (ver §4). Si se agrega un
  ítem suelto a una categoría existente en el código, no aparece solo para quien ya tiene
  datos guardados.

---

## 8. Cómo trabajar (recordatorio para el asistente)

- Proyecto de un solo archivo lógico (`index.html`/`style.css`/`app.js`), sin build step.
  No proponer migrar a un framework salvo que Isabela lo pida explícitamente — la
  decisión de mantenerlo vanilla fue deliberada (§2).
- Cambios de estilo/paleta: todo vive en las variables `:root` de `style.css` (incluye
  bloque `@media (prefers-color-scheme: dark)` — tocar ambos si se cambia un color).
- Cambios de datos por defecto: `DEFAULT_CATEGORIES` en `app.js`. Recordar la nota de
  migración de §4 si Isabela ya tiene la app en uso con datos guardados.
- Tras cualquier cambio, verificar con Chrome headless (`--dump-dom` o screenshot) antes
  de dar por terminado — no hay tests automatizados en este proyecto.
- Para republicar: `npx vercel --prod` desde esta carpeta. Actualizar este archivo
  (§6 Estado actual) cuando cambie algo importante.
