(function () {
  "use strict";

  var STORAGE_KEY = "cantera-mudanza-v1";

  var DEFAULT_CATEGORIES = [
    {
      id: "cocina",
      name: "Cocina (compartida)",
      items: [
        "Plato, tazón y taza personales",
        "Cubiertos personales",
        "Sartén pequeño",
        "Olla chica",
        "Tupperware varios tamaños",
        "Bolsas reusables de mandado (2-3)",
        "Cuchillo propio",
        "Especiero mini / frascos de condimentos",
        "Termo o vaso personal",
        "Abrelatas",
        "Rollo de papel / servilletas personales",
        "Candado chico para alacena/locker"
      ]
    },
    {
      id: "cuarto",
      name: "Cuarto",
      items: [
        "Sábanas y funda extra",
        "Cobija ligera + cobija gruesa",
        "Almohada propia",
        "Luces led / lámpara de buró",
        "Tapete pequeño",
        "Organizadores de closet colgantes",
        "Cajas o cestos apilables bajo la cama",
        "Ventilador chico",
        "Calentador eléctrico pequeño",
        "Cinta washi / ganchos sin clavo",
        "Fotos o polaroids",
        "Espejo de cuerpo completo",
        "Regleta/extensión eléctrica",
        "Tapones para oídos y antifaz",
        "Divisor o cortina de privacidad",
        "Audífonos con cancelación de ruido",
        "Difusor sin flama"
      ]
    },
    {
      id: "bano",
      name: "Baño (privado)",
      items: [
        "Toallas (cuerpo y mano)",
        "Chanclas de regadera",
        "Caddy/organizador de regadera",
        "Bote de basura con tapa",
        "Productos de higiene femenina (stock)",
        "Copa menstrual / productos preferidos",
        "Analgésico para cólicos (ibuprofeno/naproxeno)",
        "Cojín térmico para cólicos",
        "Tapete antiderrapante",
        "Jabón íntimo",
        "Prueba de embarazo",
        "Espejo de aumento"
      ]
    },
    {
      id: "lavanderia",
      name: "Lavandería (compartida)",
      items: [
        "Bolsa de malla / cesto plegable",
        "Detergente en pods",
        "Ganchos de ropa (10-15)",
        "Tendedero portátil",
        "Bolsa para ropa delicada",
        "Monedas/tarjeta para máquinas",
        "Quitamanchas de bolsillo"
      ]
    },
    {
      id: "diario",
      name: "Para andar / mochila diaria",
      items: [
        "Paraguas plegable",
        "Impermeable ligero",
        "Power bank",
        "Botella de agua reutilizable",
        "Kit de costura mini",
        "Kit primeros auxilios mini"
      ]
    },
    {
      id: "seguridad",
      name: "Random / seguridad",
      items: [
        "Candado(s) de combinación para locker",
        "Ladrón de contactos / adaptador múltiple",
        "Plumón permanente para marcar cosas",
        "Cubrebocas y gel antibacterial",
        "Snacks de emergencia",
        "Repelente de mosquitos",
        "Plancha de viaje / spray quitaarrugas",
        "Adaptador de corriente si aplica",
        "Notas/post-its",
        "Llave duplicada en lugar seguro",
        "Alarma personal / silbato",
        "Vitaminas / multivitamínico",
        "Copias de documentos importantes (identificación, comprobante inscripción)",
        "Efectivo de emergencia"
      ]
    },
    {
      id: "ropa",
      name: "Ropa (referencia rápida)",
      items: [
        "Ropa ligera / capa base (ago-sep)",
        "Impermeable/rompevientos",
        "Blazer o saco",
        "Sudaderas de entretiempo (oct)",
        "Chamarra gruesa (nov-dic)",
        "Bufanda, gorro, guantes (dic)"
      ]
    }
  ];

  // "Antes de irme": pendientes/tareas (verbos), no objetos. Comparten checklist
  // pero con su propio check independiente de Ida/Regreso (no se empacan dos veces).
  var DEFAULT_TASK_CATEGORIES = [
    {
      id: "tramites",
      name: "Trámites y documentos",
      items: [
        "Actualizar/corregir CV",
        "Sacar copias de identificación y comprobante de inscripción",
        "Revisar vigencia de documentos importantes (INE, pasaporte si aplica)",
        'Avisar a banco/tarjetas del cambio de ciudad (evitar bloqueos por "movimiento sospechoso")',
        "Dar de alta domicilio temporal donde corresponda (seguro médico, etc.)",
        "Confirmar inscripción/documentos pendientes con la escuela en Qro"
      ]
    },
    {
      id: "transporte",
      name: "Transporte",
      items: [
        "Checar precios y horarios de camión Monterrey-Querétaro (ida y regreso ocasional)",
        "Guardar apps de las líneas de camiones (ETN, Futura, Senda, Ómnibus, etc.) y comparar precios",
        "Definir cómo te vas a mover en Qro (Uber, camión local, bici, a pie) e investigar costos aprox",
        "Revisar boleto/vuelo si aplica para el viaje inicial"
      ]
    },
    {
      id: "casa",
      name: "Casa / cuarto actual",
      items: [
        "Lavar tenis",
        "Lavar brochas de maquillaje",
        "Hacer maleta(s)",
        "Separar ropa de temporada (lo que llevas vs lo que dejas)",
        "Etiquetar/organizar lo que dejas guardado en casa",
        "Dar de baja o pausar servicios que no vas a usar (si aplica)",
        {
          text: "Revisar qué necesitas comprar de cada categoría del checklist principal",
          dynamic: "pendingCount"
        }
      ]
    },
    {
      id: "salud",
      name: "Salud y bienestar",
      items: [
        "Revisión médica/dental antes de irte, si aplica",
        "Surtir recetas médicas para varios meses si tomas algún medicamento",
        "Renovar/comprar lentes de contacto o de armazón si los usas",
        "Actualizar cartilla de vacunación si aplica"
      ]
    },
    {
      id: "social",
      name: "Social / logística",
      items: [
        "Despedida con familia/amigos",
        "Compartir dirección y datos de contacto de emergencia con alguien de confianza",
        "Guardar contacto de administración del edificio en Qro",
        "Investigar dónde está el súper, farmacia y clínica más cercana al nuevo lugar",
        "Confirmar fecha y hora exacta de check-in en el edificio"
      ]
    }
  ];

  function buildTaskCategories() {
    return DEFAULT_TASK_CATEGORIES.map(function (cat) {
      return {
        id: cat.id,
        name: cat.name,
        kind: "tasks",
        group: "antes-de-irme",
        items: cat.items.map(function (raw, i) {
          if (typeof raw === "string") return { id: cat.id + "-" + i, text: raw };
          return { id: cat.id + "-" + i, text: raw.text, dynamic: raw.dynamic };
        })
      };
    });
  }

  function buildDefaultState() {
    var categories = DEFAULT_CATEGORIES.map(function (cat) {
      return {
        id: cat.id,
        name: cat.name,
        kind: "items",
        group: null,
        items: cat.items.map(function (text, i) {
          return { id: cat.id + "-" + i, text: text };
        })
      };
    }).concat(buildTaskCategories());

    return {
      version: 2,
      mode: "ida",
      dates: { ida: "", regreso: "" },
      categories: categories,
      checks: { ida: {}, regreso: {} },
      taskChecks: {}
    };
  }

  function genId() {
    if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
    return "id-" + Date.now() + "-" + Math.random().toString(16).slice(2);
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return buildDefaultState();
      var parsed = JSON.parse(raw);
      if (!parsed || !parsed.categories || !parsed.checks) return buildDefaultState();
      if (!parsed.dates) parsed.dates = { ida: "", regreso: "" };
      if (!parsed.mode) parsed.mode = "ida";
      if (!parsed.taskChecks) parsed.taskChecks = {};

      parsed.categories.forEach(function (c) {
        if (!c.kind) c.kind = "items";
        if (c.group === undefined) c.group = null;
      });

      var hasTaskGroup = parsed.categories.some(function (c) { return c.group === "antes-de-irme"; });
      if (!hasTaskGroup) {
        parsed.categories = parsed.categories.concat(buildTaskCategories());
      }

      return parsed;
    } catch (e) {
      return buildDefaultState();
    }
  }

  var state = load();

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function checksFor(cat) {
    return cat.kind === "tasks" ? state.taskChecks : state.checks[state.mode];
  }

  function findCategory(catId) {
    return state.categories.find(function (c) { return c.id === catId; });
  }

  // ---- Toast ----
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 1800);
  }

  // ---- Countdown ----
  function daysLeft(dateStr) {
    if (!dateStr) return null;
    var target = new Date(dateStr + "T00:00:00");
    if (isNaN(target.getTime())) return null;
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.round((target - today) / 86400000);
  }

  function renderTripBar() {
    var dateLabel = document.getElementById("date-label");
    var dateInput = document.getElementById("trip-date");
    var countdown = document.getElementById("countdown");

    if (state.mode === "ida") {
      dateLabel.textContent = "Fecha de ida";
      dateInput.value = state.dates.ida || "";
    } else {
      dateLabel.textContent = "Fecha de regreso";
      dateInput.value = state.dates.regreso || "";
    }

    var d = daysLeft(state.dates[state.mode]);
    var destino = state.mode === "ida" ? "tu ida a Querétaro" : "tu regreso a casa";
    if (d === null) {
      countdown.textContent = "Agrega una fecha para ver la cuenta regresiva.";
    } else if (d > 1) {
      countdown.textContent = "Faltan " + d + " días para " + destino + ".";
    } else if (d === 1) {
      countdown.textContent = "¡Falta 1 día para " + destino + "!";
    } else if (d === 0) {
      countdown.textContent = "¡Es hoy! " + (state.mode === "ida" ? "Buen viaje a Querétaro." : "Buen viaje de vuelta.");
    } else {
      countdown.textContent = "Ya pasaron " + Math.abs(d) + " días de esa fecha.";
    }
  }

  // ---- Progress ----
  function categoryProgress(cat) {
    var checks = checksFor(cat);
    var total = cat.items.length;
    var done = cat.items.reduce(function (acc, it) {
      return acc + (checks[it.id] ? 1 : 0);
    }, 0);
    return { done: done, total: total };
  }

  function renderGlobalProgress() {
    var totalDone = 0;
    var totalAll = 0;
    state.categories.forEach(function (cat) {
      if (cat.kind === "tasks") return;
      var p = categoryProgress(cat);
      totalDone += p.done;
      totalAll += p.total;
    });
    var pct = totalAll ? Math.round((totalDone / totalAll) * 100) : 0;
    document.getElementById("global-label").textContent = totalDone + "/" + totalAll + " empacado";
    document.getElementById("global-fill").style.width = pct + "%";
  }

  function renderTaskGroupProgress() {
    var totalDone = 0;
    var totalAll = 0;
    state.categories.forEach(function (cat) {
      if (cat.kind !== "tasks") return;
      var p = categoryProgress(cat);
      totalDone += p.done;
      totalAll += p.total;
    });
    var pct = totalAll ? Math.round((totalDone / totalAll) * 100) : 0;
    document.getElementById("tasks-global-label").textContent = totalDone + "/" + totalAll + " listo";
    document.getElementById("tasks-global-fill").style.width = pct + "%";
  }

  // ---- Dynamic item text ----
  function countPendingPackingItems() {
    var n = 0;
    var checks = state.checks[state.mode];
    state.categories.forEach(function (cat) {
      if (cat.kind === "tasks") return;
      cat.items.forEach(function (it) {
        if (!checks[it.id]) n++;
      });
    });
    return n;
  }

  function getItemDisplayText(item, cat) {
    if (item.dynamic === "pendingCount") {
      var n = countPendingPackingItems();
      var modeLabel = state.mode === "ida" ? "Ida" : "Regreso";
      if (n === 0) return item.text + " — ¡ya tienes todo marcado en el checklist principal!";
      return item.text + " — quedan " + n + " sin marcar en el checklist principal (modo " + modeLabel + ")";
    }
    return item.text;
  }

  // ---- Render categories ----
  var categoriesEl = document.getElementById("categories");
  var taskListEl = document.getElementById("antes-de-irme-list");

  function renderCategory(cat) {
    var checks = checksFor(cat);
    var p = categoryProgress(cat);
    var pct = p.total ? Math.round((p.done / p.total) * 100) : 0;
    var isTasks = cat.kind === "tasks";

    var section = document.createElement("section");
    section.className = "category" + (isTasks ? " category--tasks" : "");
    section.dataset.catId = cat.id;

    var header = document.createElement("header");
    header.className = "category-header";
    header.innerHTML =
      '<span class="cat-icon" aria-hidden="true">' + (isTasks ? "✓" : "▪") + '</span>' +
      '<h2>' + escapeHtml(cat.name) + '</h2>' +
      '<div class="category-progress">' +
        '<span class="count">' + p.done + '/' + p.total + '</span>' +
        '<div class="mini-track"><div class="mini-fill" style="width:' + pct + '%"></div></div>' +
      '</div>' +
      '<button type="button" class="cat-reset" data-action="reset-cat" title="Reiniciar categoría">↺</button>';
    section.appendChild(header);

    var list = document.createElement("ul");
    list.className = "item-list";

    cat.items.forEach(function (item) {
      var li = document.createElement("li");
      li.className = "item" + (checks[item.id] ? " done" : "");
      li.dataset.itemId = item.id;

      li.innerHTML =
        '<label class="check-row">' +
          '<input type="checkbox" data-action="toggle"' + (checks[item.id] ? " checked" : "") + ' />' +
          '<span class="item-text">' + escapeHtml(getItemDisplayText(item, cat)) + '</span>' +
        '</label>' +
        '<div class="item-actions">' +
          '<button type="button" data-action="edit" title="Editar">✎</button>' +
          '<button type="button" class="delete-btn" data-action="delete" title="Eliminar">×</button>' +
        '</div>';

      list.appendChild(li);
    });

    section.appendChild(list);

    var form = document.createElement("form");
    form.className = "add-item-form";
    form.dataset.action = "add-item";
    var noun = isTasks ? "pendiente" : "ítem";
    form.innerHTML =
      '<input type="text" placeholder="Agregar ' + noun + '…" maxlength="80" aria-label="Nuevo ' + noun + ' para ' + escapeHtml(cat.name) + '" />' +
      '<button type="submit" aria-label="Agregar">+</button>';
    section.appendChild(form);

    return section;
  }

  function render() {
    renderTripBar();
    renderGlobalProgress();
    renderTaskGroupProgress();

    categoriesEl.innerHTML = "";
    state.categories
      .filter(function (c) { return c.group !== "antes-de-irme"; })
      .forEach(function (cat) { categoriesEl.appendChild(renderCategory(cat)); });

    taskListEl.innerHTML = "";
    state.categories
      .filter(function (c) { return c.group === "antes-de-irme"; })
      .forEach(function (cat) { taskListEl.appendChild(renderCategory(cat)); });

    renderSuggestionWidget();
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // ---- Mutations ----
  function toggleItem(catId, itemId) {
    var cat = findCategory(catId);
    if (!cat) return;
    var checks = checksFor(cat);
    checks[itemId] = !checks[itemId];
    save();
    render();
  }

  function deleteItem(catId, itemId) {
    var cat = findCategory(catId);
    if (!cat) return;
    var item = cat.items.find(function (it) { return it.id === itemId; });
    if (!item) return;
    var msg = cat.kind === "tasks"
      ? '¿Eliminar "' + item.text + '"?'
      : '¿Eliminar "' + item.text + '"? Esto lo borra de ambos modos (Ida y Regreso).';
    if (!confirm(msg)) return;
    cat.items = cat.items.filter(function (it) { return it.id !== itemId; });
    if (cat.kind === "tasks") {
      delete state.taskChecks[itemId];
    } else {
      delete state.checks.ida[itemId];
      delete state.checks.regreso[itemId];
    }
    save();
    render();
  }

  function editItem(catId, itemId, liEl) {
    var cat = findCategory(catId);
    if (!cat) return;
    var item = cat.items.find(function (it) { return it.id === itemId; });
    if (!item) return;

    var textSpan = liEl.querySelector(".item-text");

    var input = document.createElement("input");
    input.type = "text";
    input.className = "item-text-input";
    input.value = item.text;
    input.maxLength = 80;

    textSpan.replaceWith(input);
    input.focus();
    input.select();

    function commit() {
      var newText = input.value.trim();
      if (newText) item.text = newText;
      save();
      render();
    }

    input.addEventListener("blur", commit);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        input.blur();
      } else if (e.key === "Escape") {
        e.preventDefault();
        render();
      }
    });
  }

  function addItem(catId, text) {
    var trimmed = text.trim();
    if (!trimmed) return;
    var cat = findCategory(catId);
    if (!cat) return;
    cat.items.push({ id: genId(), text: trimmed });
    save();
    render();
    showToast("Agregado a " + cat.name);
  }

  function resetCategory(catId) {
    var cat = findCategory(catId);
    if (!cat) return;
    var scope = cat.kind === "tasks" ? "" : " en modo " + (state.mode === "ida" ? "Ida" : "Regreso");
    if (!confirm('¿Reiniciar el progreso de "' + cat.name + '"' + scope + '? Esto desmarca todos sus ítems (no los borra).')) return;
    var checks = checksFor(cat);
    cat.items.forEach(function (it) { delete checks[it.id]; });
    save();
    render();
  }

  function resetGlobal() {
    var modeLabel = state.mode === "ida" ? "Ida" : "Regreso";
    if (!confirm('¿Reiniciar TODO el progreso de empaque del modo ' + modeLabel + '? Esto desmarca todos los ítems de todas las categorías de empaque (no afecta "Antes de irme" ni los borra).')) return;
    state.checks[state.mode] = {};
    save();
    render();
  }

  function setMode(mode) {
    if (mode === state.mode) return;
    state.mode = mode;
    save();
    document.querySelectorAll(".mode-btn").forEach(function (btn) {
      btn.setAttribute("aria-selected", btn.dataset.mode === mode ? "true" : "false");
    });
    render();
  }

  // ---- Sugerencia random ----
  var widgetMode = "idle"; // "idle" | "suggestion" | "empty"
  var currentSuggestion = null;
  var suggestionEl = document.getElementById("suggestion-widget");

  function getAllPendingSuggestions() {
    var out = [];
    state.categories.forEach(function (cat) {
      var checks = checksFor(cat);
      cat.items.forEach(function (it) {
        if (!checks[it.id]) {
          out.push({
            catId: cat.id,
            catName: cat.name,
            kind: cat.kind,
            itemId: it.id,
            text: getItemDisplayText(it, cat)
          });
        }
      });
    });
    return out;
  }

  function requestSuggestion(excludeCurrent) {
    var pending = getAllPendingSuggestions();
    if (excludeCurrent && currentSuggestion && pending.length > 1) {
      pending = pending.filter(function (p) {
        return !(p.catId === currentSuggestion.catId && p.itemId === currentSuggestion.itemId);
      });
    }
    if (pending.length === 0) {
      currentSuggestion = null;
      widgetMode = "empty";
    } else {
      currentSuggestion = pending[Math.floor(Math.random() * pending.length)];
      widgetMode = "suggestion";
    }
  }

  function handleSuggestionDone() {
    if (!currentSuggestion) return;
    var cat = findCategory(currentSuggestion.catId);
    if (cat) {
      checksFor(cat)[currentSuggestion.itemId] = true;
      save();
    }
    requestSuggestion(false);
    render();
  }

  function renderSuggestionWidget() {
    if (widgetMode === "suggestion" && currentSuggestion) {
      var cat = findCategory(currentSuggestion.catId);
      var item = cat && cat.items.find(function (it) { return it.id === currentSuggestion.itemId; });
      if (!cat || !item || checksFor(cat)[item.id]) {
        widgetMode = "idle";
        currentSuggestion = null;
      } else {
        currentSuggestion.text = getItemDisplayText(item, cat);
        currentSuggestion.catName = cat.name;
        currentSuggestion.kind = cat.kind;
      }
    }

    suggestionEl.classList.remove("suggestion-anim");
    void suggestionEl.offsetWidth;

    if (widgetMode === "suggestion") {
      suggestionEl.innerHTML =
        '<div class="suggestion-card">' +
          '<p class="suggestion-eyebrow">' + (currentSuggestion.kind === "tasks" ? "Pendiente" : "Por empacar") + ' · ' + escapeHtml(currentSuggestion.catName) + '</p>' +
          '<p class="suggestion-text">' + escapeHtml(currentSuggestion.text) + '</p>' +
          '<div class="suggestion-actions">' +
            '<button type="button" class="suggestion-btn suggestion-btn--primary" data-action="suggestion-done">Marcar como hecho ✓</button>' +
            '<button type="button" class="suggestion-btn" data-action="suggestion-reroll">Otra sugerencia</button>' +
          '</div>' +
        '</div>';
    } else if (widgetMode === "empty") {
      suggestionEl.innerHTML =
        '<div class="suggestion-card suggestion-card--done">' +
          '<p class="suggestion-text">¡Ya no hay pendientes, estás list@ para Qro! 🎉</p>' +
          '<div class="suggestion-actions">' +
            '<button type="button" class="suggestion-btn" data-action="suggestion-reroll">Revisar de nuevo</button>' +
          '</div>' +
        '</div>';
    } else {
      suggestionEl.innerHTML =
        '<button type="button" class="suggestion-cta" data-action="suggestion-start">¿No sabes qué hacer? <span aria-hidden="true">→</span></button>';
    }

    suggestionEl.classList.add("suggestion-anim");
  }

  suggestionEl.addEventListener("click", function (e) {
    var btn = e.target.closest("button[data-action]");
    if (!btn) return;
    if (btn.dataset.action === "suggestion-start") {
      requestSuggestion(false);
      renderSuggestionWidget();
    } else if (btn.dataset.action === "suggestion-reroll") {
      requestSuggestion(true);
      renderSuggestionWidget();
    } else if (btn.dataset.action === "suggestion-done") {
      handleSuggestionDone();
    }
  });

  // ---- Event wiring ----
  document.querySelectorAll(".mode-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      setMode(btn.dataset.mode);
    });
  });

  document.getElementById("trip-date").addEventListener("change", function (e) {
    state.dates[state.mode] = e.target.value;
    save();
    renderTripBar();
  });

  document.getElementById("reset-global").addEventListener("click", resetGlobal);

  var appEl = document.querySelector(".app");

  appEl.addEventListener("click", function (e) {
    var btn = e.target.closest("button[data-action]");
    if (!btn) return;
    var section = e.target.closest(".category");
    if (!section) return;
    var li = e.target.closest(".item");
    var catId = section.dataset.catId;
    var itemId = li ? li.dataset.itemId : null;

    if (btn.dataset.action === "reset-cat") {
      resetCategory(catId);
    } else if (btn.dataset.action === "delete") {
      deleteItem(catId, itemId);
    } else if (btn.dataset.action === "edit") {
      editItem(catId, itemId, li);
    }
  });

  appEl.addEventListener("change", function (e) {
    if (e.target.matches('input[type="checkbox"][data-action="toggle"]')) {
      var li = e.target.closest(".item");
      var section = e.target.closest(".category");
      toggleItem(section.dataset.catId, li.dataset.itemId);
    }
  });

  appEl.addEventListener("submit", function (e) {
    var form = e.target.closest('form[data-action="add-item"]');
    if (!form) return;
    e.preventDefault();
    var section = e.target.closest(".category");
    var input = form.querySelector("input");
    addItem(section.dataset.catId, input.value);
    input.value = "";
    input.focus();
  });

  render();
})();
