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

  function buildDefaultState() {
    var categories = DEFAULT_CATEGORIES.map(function (cat) {
      return {
        id: cat.id,
        name: cat.name,
        items: cat.items.map(function (text, i) {
          return { id: cat.id + "-" + i, text: text };
        })
      };
    });
    return {
      version: 1,
      mode: "ida",
      dates: { ida: "", regreso: "" },
      categories: categories,
      checks: { ida: {}, regreso: {} }
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
      return parsed;
    } catch (e) {
      return buildDefaultState();
    }
  }

  var state = load();

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function otherMode(mode) {
    return mode === "ida" ? "regreso" : "ida";
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
    var checks = state.checks[state.mode];
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
      var p = categoryProgress(cat);
      totalDone += p.done;
      totalAll += p.total;
    });
    var pct = totalAll ? Math.round((totalDone / totalAll) * 100) : 0;
    document.getElementById("global-label").textContent = totalDone + "/" + totalAll + " empacado";
    document.getElementById("global-fill").style.width = pct + "%";
  }

  // ---- Render categories ----
  var categoriesEl = document.getElementById("categories");

  function render() {
    renderTripBar();
    renderGlobalProgress();

    var checks = state.checks[state.mode];
    categoriesEl.innerHTML = "";

    state.categories.forEach(function (cat) {
      var p = categoryProgress(cat);
      var pct = p.total ? Math.round((p.done / p.total) * 100) : 0;

      var section = document.createElement("section");
      section.className = "category";
      section.dataset.catId = cat.id;

      var header = document.createElement("header");
      header.className = "category-header";
      header.innerHTML =
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
            '<span class="item-text">' + escapeHtml(item.text) + '</span>' +
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
      form.innerHTML =
        '<input type="text" placeholder="Agregar ítem…" maxlength="80" aria-label="Nuevo ítem para ' + escapeHtml(cat.name) + '" />' +
        '<button type="submit" aria-label="Agregar">+</button>';
      section.appendChild(form);

      categoriesEl.appendChild(section);
    });
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // ---- Mutations ----
  function toggleItem(itemId) {
    var checks = state.checks[state.mode];
    checks[itemId] = !checks[itemId];
    save();
    render();
  }

  function deleteItem(catId, itemId) {
    var cat = state.categories.find(function (c) { return c.id === catId; });
    if (!cat) return;
    var item = cat.items.find(function (it) { return it.id === itemId; });
    if (!item) return;
    if (!confirm('¿Eliminar "' + item.text + '"? Esto lo borra de ambos modos (Ida y Regreso).')) return;
    cat.items = cat.items.filter(function (it) { return it.id !== itemId; });
    delete state.checks.ida[itemId];
    delete state.checks.regreso[itemId];
    save();
    render();
  }

  function editItem(catId, itemId, liEl) {
    var cat = state.categories.find(function (c) { return c.id === catId; });
    if (!cat) return;
    var item = cat.items.find(function (it) { return it.id === itemId; });
    if (!item) return;

    var checkRow = liEl.querySelector(".check-row");
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
    var cat = state.categories.find(function (c) { return c.id === catId; });
    if (!cat) return;
    cat.items.push({ id: genId(), text: trimmed });
    save();
    render();
    showToast("Ítem agregado a " + cat.name);
  }

  function resetCategory(catId) {
    var cat = state.categories.find(function (c) { return c.id === catId; });
    if (!cat) return;
    var modeLabel = state.mode === "ida" ? "Ida" : "Regreso";
    if (!confirm('¿Reiniciar el progreso de "' + cat.name + '" en modo ' + modeLabel + '? Esto desmarca todos sus ítems (no los borra).')) return;
    var checks = state.checks[state.mode];
    cat.items.forEach(function (it) { delete checks[it.id]; });
    save();
    render();
  }

  function resetGlobal() {
    var modeLabel = state.mode === "ida" ? "Ida" : "Regreso";
    if (!confirm('¿Reiniciar TODO el progreso del modo ' + modeLabel + '? Esto desmarca todos los ítems de todas las categorías (no los borra).')) return;
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

  categoriesEl.addEventListener("click", function (e) {
    var btn = e.target.closest("button[data-action]");
    if (!btn) return;
    var section = e.target.closest(".category");
    var li = e.target.closest(".item");
    var catId = section ? section.dataset.catId : null;
    var itemId = li ? li.dataset.itemId : null;

    if (btn.dataset.action === "reset-cat") {
      resetCategory(catId);
    } else if (btn.dataset.action === "delete") {
      deleteItem(catId, itemId);
    } else if (btn.dataset.action === "edit") {
      editItem(catId, itemId, li);
    }
  });

  categoriesEl.addEventListener("change", function (e) {
    if (e.target.matches('input[type="checkbox"][data-action="toggle"]')) {
      var li = e.target.closest(".item");
      toggleItem(li.dataset.itemId);
    }
  });

  categoriesEl.addEventListener("submit", function (e) {
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
