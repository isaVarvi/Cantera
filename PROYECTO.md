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
  version: 1,
  mode: "ida" | "regreso",
  dates: { ida: "2026-08-15", regreso: "" },   // input type=date, opcional
  categories: [
    {
      id: "cocina",
      name: "Cocina (compartida)",
      items: [ { id: "cocina-0", text: "Plato, tazón y taza personales" }, ... ]
    },
    ...
  ],
  checks: {
    ida:     { "cocina-0": true, ... },  // solo entradas marcadas; ausente = sin marcar
    regreso: { "cocina-0": false, ... }
  }
}
```

- `categories` es la única fuente de verdad de qué ítems existen — compartida entre
  ambos modos.
- `checks.ida` y `checks.regreso` son mapas independientes `itemId -> boolean`.
- Los ítems por default (ver `DEFAULT_CATEGORIES` en `app.js`) se generan una sola vez,
  la primera vez que se carga la app sin datos guardados. Si en el futuro se agregan
  categorías/ítems nuevos al código, **no aparecerán automáticamente** para quien ya
  tiene datos guardados (no hay migración) — habría que agregarlos a mano desde la UI o
  ampliar `load()` en `app.js` para mergear.

Categorías iniciales y conteo de ítems: Cocina (12), Cuarto (17), Baño (12), Lavandería
(7), Para andar/mochila diaria (6), Random/seguridad (14), Ropa (6). Total: 74 ítems.

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

Todo el render es un `render()` que reconstruye el DOM de `#categories` desde `state` en
cada cambio, con event delegation en el contenedor (`categoriesEl.addEventListener`) en
vez de re-bindear listeners por ítem — así no hay que preocuparse por listeners huérfanos
al agregar/eliminar ítems.

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
  `varvi`, la misma de Cozy To-Do). Deploy manual por ahora (`vercel --prod` desde la
  carpeta) — no auto-deploy porque todavía no estaba conectado a GitHub.
- ⬜ **GitHub:** en proceso — conectar repo para que el deploy en Vercel sea automático
  en cada push (igual que Cozy To-Do → `github.com/isaVarvi/Cozy-To-Do`).

## Deploy

- **Vercel:** https://pagina-web-4-cantera.vercel.app
  - Para republicar tras un cambio: `npx vercel --prod` desde esta carpeta.
- **GitHub:** (pendiente de confirmar URL final tras conectar)

---

## 7. Roadmap / ideas futuras (no en v1, no diseñar todavía)

- Conectar GitHub → Vercel para auto-deploy en cada push (en proceso).
- Si algún día se necesita ver el progreso desde más de un dispositivo, evaluar migrar
  de `localStorage` a algo sincronizado (Firebase) — **no vale la pena para v1**, es un
  solo dispositivo por 5 meses.
- Migración de datos por defecto si se agregan categorías/ítems nuevos al código después
  de que Isabela ya tenga datos guardados (ver nota en §4).

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
