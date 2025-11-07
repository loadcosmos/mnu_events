/* ================== Demo data (пока локально) ================== */
const EVENTS = [
  {
    id: "music-night",
    title: "Music Night",
    short: "Enjoy a night of live performances by university bands.",
    img: "../images/event4.jpg",
    isoStart: "2025-10-28T20:00:00",
    durationMin: 120,
    location: "Auditorium",
    organizer: "Student Council",
    category: "Creativity",
    capacity: 200,
    clubUrl: "#",
    registerUrl: "#"
  },
  {
    id: "guest-lecture-ai",
    title: "Guest Lecture",
    short: "Hands-on session exploring the latest developments in artificial intelligence.",
    img: "../images/event1.jpg",
    isoStart: "2025-10-25T19:00:00",
    durationMin: 90,
    location: "Main Hall A",
    organizer: "DSA MNU",
    category: "Academic",
    capacity: 300,
    clubUrl: "#",
    registerUrl: "#"
  },
  {
    id: "boxing-intro",
    title: "Introductory Boxing",
    short: "Try boxing basics with certified coaches. Beginner-friendly.",
    img: "../images/event3.jpg",
    isoStart: "2025-08-14T18:00:00",
    durationMin: 60,
    location: "Sports Centre, Gym",
    organizer: "DSA MNU",
    category: "Intelligence",
    capacity: 40,
    clubUrl: "#",
    registerUrl: "#"
  },
  {
    id: "dance-workshop",
    title: "Workshop",
    short: "Learn choreography from Mobtrix — open level.",
    img: "../images/event2.jpg",
    isoStart: "2025-08-14T18:00:00",
    durationMin: 90,
    location: "D6, Yoga Room",
    organizer: "Mobtrix",
    category: "Creativity",
    capacity: 60,
    clubUrl: "#",
    registerUrl: "#"
  }
];

/* ================== Helpers ================== */
const el = (tag, props = {}, ...children) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === "class") n.className = v;
    else if (k === "text") n.textContent = v;
    else if (k.startsWith("on") && typeof v === "function")
      n.addEventListener(k.slice(2), v);
    else if (v !== null && v !== undefined) n.setAttribute(k, v);
  }
  for (const c of children)
    n.append(c instanceof Node ? c : document.createTextNode(c));
  return n;
};

const fmtDate = (iso) => {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }); // 28 Oct
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }); // 20:00
  const long = d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  return { date, time, long };
};

const debounce = (fn, ms = 250) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
};

/* ===== CSI ===== */
const CSI_ALIASES = {
  academic: "intelligence",
  science: "intelligence",
  volunteering: "service",
  social: "service",
  arts: "creativity",
};
function normalizeCSI(cat) {
  if (!cat) return [];
  const raw = Array.isArray(cat)
    ? cat
    : String(cat)
        .split(",")
        .map((s) => s.trim());
  const norm = raw.map(
    (c) => CSI_ALIASES[c.toLowerCase()] || c.toLowerCase()
  );
  const keep = ["creativity", "service", "intelligence"];
  return norm.filter((c, i, a) => keep.includes(c) && a.indexOf(c) === i);
}
const titleCase = (s) => (s ? s[0].toUpperCase() + s.slice(1) : "");

/* ================== UI builders ================== */
function cardMeta(e) {
  const { date, time } = fmtDate(e.isoStart);
  const ul = el("ul", { class: "ev-card__meta" });
  ul.append(
    el("li", {}, el("i", { class: "fa-regular fa-calendar" }), `${date} · ${time}`),
    el("li", {}, el("i", { class: "fa-solid fa-location-dot" }), e.location),
    el("li", {}, el("i", { class: "fa-solid fa-users" }), e.organizer)
  );
  return ul;
}

function csiPills(cat) {
  const cats = normalizeCSI(cat);
  if (!cats.length) return null;
  return el(
    "div",
    { class: "csi-pills" },
    ...cats.map((c) =>
      el(
        "span",
        { class: `csi-pill csi--${c}`, "aria-label": titleCase(c) },
        titleCase(c)
      )
    )
  );
}

/* ---------- MODAL (обновлённая структура) ---------- */
let modal; // кэш узлов модалки

function ensureModal() {
  if (modal) return modal;

  const m = el(
    "div",
    { class: "ev-modal", id: "evModal", role: "dialog", "aria-modal": "true", hidden: "" },
    el("div", { class: "ev-modal__backdrop", id: "evModalBackdrop", "data-close": "" }),
    el(
      "article",
      { class: "ev-modal__content", id: "evModalContent", "aria-labelledby": "evMdTitle" },
      el(
        "button",
        { class: "ev-modal__close", id: "evModalClose", "aria-label": "Close", "data-close": "" },
        el("i", { class: "fa-solid fa-xmark" })
      ),
      el("img", { class: "ev-md__hero", id: "evMdHero", alt: "Event cover" }),

      // прокручиваемая часть
      el(
        "div",
        { class: "ev-md__scroll", id: "evMdScroll" },
        el(
          "div",
          { class: "ev-md__body" },
          el(
            "div",
            { class: "ev-md__top" },
            el("h2", { class: "ev-md__title", id: "evMdTitle" }, ""),
            // только CSI-пилюля
            el("div", { class: "csi-pills", id: "evMdCsi" })
          ),
          el("p", { class: "ev-md__desc", id: "evMdDesc" }, ""),
          el("ul", { class: "ev-md__meta", id: "evMdMeta" })
        ),
        el(
          "div",
          { class: "ev-md__footer" },
          el("button", { class: "ev-join", id: "evMdJoin", type: "button" }, "Join")
        )
      )
    )
  );

  document.body.appendChild(m);

  // закрытие
  const close = () => {
    m.hidden = true;
    document.querySelector(".ev-body")?.classList.remove("modal-open");
    document.removeEventListener("keydown", onEsc);
  };
  const onEsc = (e) => {
    if (e.key === "Escape") close();
  };

  m.addEventListener("click", (e) => {
    if (e.target.hasAttribute("data-close")) close();
  });

  modal = {
    root: m,
    close,
    onEsc,
    hero: m.querySelector("#evMdHero"),
    title: m.querySelector("#evMdTitle"),
    desc: m.querySelector("#evMdDesc"),
    meta: m.querySelector("#evMdMeta"),
    csi: m.querySelector("#evMdCsi"),
    join: m.querySelector("#evMdJoin"),
  };
  return modal;
}

function openModal(ev) {
  const m = ensureModal();

  // наполняем
  m.hero.src = ev.img;
  m.hero.alt = ev.title;

  m.title.textContent = ev.title;
  m.desc.textContent = ev.short || "";

  // CSI (только здесь)
  m.csi.replaceChildren();
  const cats = normalizeCSI(ev.category);
  cats.forEach((c) => {
    m.csi.appendChild(el("span", { class: `csi-pill csi--${c}` }, titleCase(c)));
  });

  // мета
  const { long, time } = fmtDate(ev.isoStart);
  m.meta.replaceChildren(
    el("li", {}, el("i", { class: "fa-regular fa-calendar" }), `${long} · ${time}`),
    el("li", {}, el("i", { class: "fa-solid fa-location-dot" }), ev.location || ""),
    el("li", {}, el("i", { class: "fa-solid fa-users" }), ev.organizer || "")
  );

  // единственная кнопка Join
  m.join.onclick = () => {
    if (ev.registerUrl && ev.registerUrl !== "#") {
      location.href = ev.registerUrl;
    } else {
      alert("Registration flow coming soon ✨");
    }
  };

  // показать
  m.root.hidden = false;
  document.querySelector(".ev-body")?.classList.add("modal-open");
  document.addEventListener("keydown", m.onEsc);
}

/* ---------- Cards ---------- */
function Card(e) {
  const a = el("div", { class: "ev-card", role: "button", tabindex: "0" });
  const open = () => openModal(e);
  a.addEventListener("click", open);
  a.addEventListener("keypress", (ev) => {
    if (ev.key === "Enter" || ev.key === " ") open();
  });

  const img = el("img", {
    class: "ev-card__img",
    src: e.img,
    alt: e.title,
    loading: "lazy",
  });

  const body = el(
    "div",
    { class: "ev-card__body" },
    el("h3", { class: "ev-card__title" }, e.title),
    csiPills(e.category) || "",
    el("p", { class: "ev-card__short" }, e.short),
    cardMeta(e),
    el(
      "button",
      {
        class: "ev-card__btn",
        type: "button",
        onclick: (ev) => {
          ev.stopPropagation();
          open();
        },
      },
      "View Details"
    )
  );

  a.append(img, body);
  return a;
}

/* ================== Page logic ================== */
function hasCategory(e, cat) {
  if (cat === "All") return true;
  const name = (cat || "").toLowerCase();
  const list = Array.isArray(e.category)
    ? e.category
    : String(e.category)
        .split(",")
        .map((s) => s.trim());
  return list.some(
    (c) => (CSI_ALIASES[c.toLowerCase()] || c.toLowerCase()) === name
  );
}

function EventsPage() {
  const search = document.getElementById("evSearch");
  const chipsWrap = document.getElementById("evChips");
  const grid = document.getElementById("evGrid");
  const empty = document.getElementById("evEmpty");

  const CATS = ["All", "Creativity", "Service", "Intelligence"];
  let state = { q: "", cat: "All" };

  function renderChips() {
    chipsWrap.setAttribute("role", "tablist");
    chipsWrap.replaceChildren(
      ...CATS.map((c) => {
        const isActive = state.cat === c;
        return el(
          "button",
          {
            class: `ev-chip${isActive ? " is-active" : ""}`,
            type: "button",
            role: "tab",
            "aria-selected": String(isActive),
            onclick: () => {
              state.cat = c;
              renderChips();
              render();
            },
          },
          c
        );
      })
    );
  }

  function render() {
    const q = state.q.trim().toLowerCase();
    const filtered = EVENTS.filter((e) => hasCategory(e, state.cat))
      .filter(
        (e) =>
          !q ||
          e.title.toLowerCase().includes(q) ||
          (e.short || "").toLowerCase().includes(q) ||
          (e.location || "").toLowerCase().includes(q) ||
          (e.organizer || "").toLowerCase().includes(q)
      )
      .sort((a, b) => new Date(a.isoStart) - new Date(b.isoStart));

    grid.replaceChildren(...filtered.map(Card));
    empty.hidden = filtered.length !== 0;
  }

  search?.addEventListener(
    "input",
    debounce(() => {
      state.q = search.value;
      render();
    }, 200)
  );

  renderChips();
  render();

  // deep-link по ?event=... -> сразу открыть модалку
  const evId = new URLSearchParams(location.search).get("event");
  if (evId) {
    const ev = EVENTS.find((x) => x.id === evId);
    if (ev) openModal(ev);
  }
}

/* экспорт для вызова из HTML */
window.EventsPage = EventsPage;
