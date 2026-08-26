const DEITY_COLORS = {
  "Shiva": "var(--deity-shiva)",
  "Krishna": "var(--deity-krishna)",
  "Devi": "var(--deity-devi)",
  "Rama": "var(--deity-rama)",
  "Sai": "var(--deity-sai)",
  "Ganesha": "var(--deity-ganesha)",
  "Sarva Dharma": "var(--deity-sarva-dharma)",
};

function deityColor(deity) {
  return DEITY_COLORS[deity] || "var(--deity-default)";
}

function deityInitial(deity) {
  if (!deity) return "?";
  const words = deity.trim().split(/\s+/);
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return words.map(w => w.charAt(0).toUpperCase()).join("");
}

const state = {
  all: [],
  view: "browse",
  nameQuery: "",
  deity: "",
  beat: "",
  speed: "",
  date: "",
  selectedId: null,
};

const els = {
  navItems: document.querySelectorAll(".nav-item"),
  dateBox: document.getElementById("date-box"),
  nameSearch: document.getElementById("name-search"),
  dateSearch: document.getElementById("date-search"),
  dateClear: document.getElementById("date-clear"),
  filterBeat: document.getElementById("filter-beat"),
  filterSpeed: document.getElementById("filter-speed"),
  heroTitle: document.querySelector(".hero h1"),
  heroSub: document.getElementById("hero-sub"),
  deityRail: document.getElementById("deity-rail"),
  resultsTitle: document.getElementById("results-title"),
  resultsCount: document.getElementById("results-count"),
  trackRows: document.getElementById("track-rows"),
  emptyState: document.getElementById("empty-state"),
  detailPanel: document.getElementById("detail-panel"),
  detailContent: document.getElementById("detail-content"),
  detailClose: document.getElementById("detail-close"),
};

async function loadData() {
  try {
    const res = await fetch("./data/bhajans.json");
    if (!res.ok) throw new Error("Network error loading bhajans.json");
    state.all = await res.json();
    populateFilterOptions();
    populateDeityRail();
    render();
  } catch (err) {
    console.error(err);
    els.emptyState.hidden = false;
    els.emptyState.textContent = "Unable to load bhajan data. Make sure data/bhajans.json is reachable.";
  }
}

function populateFilterOptions() {
  fillSelect(els.filterBeat, uniqueSorted(state.all.map(b => b.beat)));
  fillSelect(els.filterSpeed, uniqueSorted(state.all.map(b => b.speed)));
}

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

function fillSelect(selectEl, values) {
  for (const v of values) {
    const opt = document.createElement("option");
    opt.value = v;
    opt.textContent = v;
    selectEl.appendChild(opt);
  }
}

function populateDeityRail() {
  const counts = {};
  for (const b of state.all) {
    if (!b.deity) continue;
    counts[b.deity] = (counts[b.deity] || 0) + 1;
  }
  const deities = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);

  els.deityRail.innerHTML = "";
  for (const deity of deities) {
    const card = document.createElement("div");
    card.className = "deity-card";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.style.setProperty("--deity-color", deityColor(deity));
    const activate = () => {
      state.deity = state.deity === deity ? "" : deity;
      render();
    };
    card.addEventListener("click", activate);
    card.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activate(); }
    });

    const disc = document.createElement("span");
    disc.className = "deity-disc";
    disc.textContent = deityInitial(deity);

    const name = document.createElement("span");
    name.className = "deity-name";
    name.textContent = deity;

    card.appendChild(disc);
    card.appendChild(name);
    els.deityRail.appendChild(card);
  }
}

function matches(b) {
  if (state.view === "date" && state.date && b.date !== state.date) return false;
  if (state.deity && b.deity !== state.deity) return false;
  if (state.beat && b.beat !== state.beat) return false;
  if (state.speed && b.speed !== state.speed) return false;
  if (state.nameQuery) {
    const q = state.nameQuery.toLowerCase();
    if (!b.name.toLowerCase().includes(q)) return false;
  }
  return true;
}

function render() {
  els.navItems.forEach(item => {
    item.classList.toggle("is-active", item.dataset.view === state.view);
  });
  els.dateBox.hidden = state.view !== "date";

  document.querySelectorAll(".deity-card").forEach(card => {
    const name = card.querySelector(".deity-name").textContent;
    card.classList.toggle("is-active", state.deity === name);
  });

  if (state.view === "date") {
    els.heroTitle.textContent = "What was sung, on any given day";
    els.heroSub.textContent = "Pick a date to see the bhajans sung in that session.";
  } else {
    els.heroTitle.textContent = "Sri Sathya Sai Nandigāna";
    els.heroSub.textContent = `${state.all.length} bhajans in the archive.`;
  }

  let results = state.all.filter(matches);

  if (state.view === "date" && !state.date) {
    results = [];
  }

  results.sort((a, b) => {
    if (a.date && b.date) {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return (a.order || 0) - (b.order || 0);
    }
    if (a.date && !b.date) return -1;
    if (!a.date && b.date) return 1;
    return a.name.localeCompare(b.name);
  });

  els.resultsTitle.textContent = state.view === "date"
    ? (state.date ? `Sung on ${state.date}` : "Pick a date above")
    : "All bhajans";
  els.emptyState.hidden = results.length > 0;
  els.emptyState.textContent = state.view === "date" && !state.date
    ? "Pick a date to see what was sung."
    : "Nothing here yet — the archive is still being built.";
  els.resultsCount.textContent = results.length
    ? `${results.length} bhajan${results.length === 1 ? "" : "s"}`
    : "";

  els.trackRows.innerHTML = "";
  results.forEach((b, i) => els.trackRows.appendChild(renderTrackRow(b, i + 1)));

  renderDetail();
}

function renderTrackRow(b, displayIndex) {
  const row = document.createElement("div");
  row.className = "track-row track-row--data";
  row.tabIndex = 0;
  row.setAttribute("role", "button");
  const activate = () => {
    state.selectedId = state.selectedId === b.id ? null : b.id;
    render();
  };
  row.addEventListener("click", activate);
  row.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activate(); }
  });

  const index = document.createElement("span");
  index.className = "col-index";
  index.textContent = b.order || displayIndex;

  const title = document.createElement("span");
  title.className = "col-title";
  const dot = document.createElement("span");
  dot.className = "title-deity-dot";
  dot.style.setProperty("--deity-color", deityColor(b.deity));
  const titleText = document.createElement("span");
  titleText.textContent = b.name;
  title.appendChild(dot);
  title.appendChild(titleText);

  const deity = document.createElement("span");
  deity.className = "col-deity";
  deity.textContent = b.deity || "—";

  const raga = document.createElement("span");
  raga.className = "col-raga";
  raga.textContent = b.raga || "—";

  const beat = document.createElement("span");
  beat.className = "col-beat";
  beat.textContent = b.beat || "—";

  const speed = document.createElement("span");
  speed.className = "col-speed";
  speed.textContent = b.speed || "—";

  const duration = document.createElement("span");
  duration.className = "col-duration";
  duration.textContent = b.duration ? b.duration.replace(/^00:/, "") : "—";

  row.appendChild(index);
  row.appendChild(title);
  row.appendChild(deity);
  row.appendChild(raga);
  row.appendChild(beat);
  row.appendChild(speed);
  row.appendChild(duration);
  return row;
}

function renderDetail() {
  const b = state.all.find(x => x.id === state.selectedId);
  els.detailPanel.hidden = !b;
  if (!b) return;

  els.detailContent.innerHTML = "";

  const title = document.createElement("p");
  title.className = "detail-title";
  title.textContent = b.name;

  const sub = document.createElement("p");
  sub.className = "detail-sub";
  sub.textContent = b.date ? `Sung ${b.date}${b.order ? ` · track ${b.order}` : ""}` : (b.sub_category || "");

  const tags = document.createElement("div");
  tags.className = "detail-tags";
  [b.deity, b.raga, b.beat, b.speed].filter(Boolean).forEach(t => {
    const tag = document.createElement("span");
    tag.className = "detail-tag";
    tag.textContent = t;
    tags.appendChild(tag);
  });

  els.detailContent.appendChild(title);
  els.detailContent.appendChild(sub);
  els.detailContent.appendChild(tags);

  const rows = [
    ["Sruthi (male)", b.sruthi_male],
    ["Sruthi (female)", b.sruthi_female],
    ["Duration", b.duration],
    ["Category", b.sub_category],
  ].filter(([, v]) => v);

  for (const [label, value] of rows) {
    const row = document.createElement("p");
    row.className = "detail-row";
    const labelSpan = document.createElement("span");
    labelSpan.className = "detail-label";
    labelSpan.textContent = label;
    row.appendChild(labelSpan);
    row.appendChild(document.createTextNode(value));
    els.detailContent.appendChild(row);
  }

  if (b.lyrics) {
    const heading = document.createElement("p");
    heading.className = "detail-section-label";
    heading.textContent = "Lyrics";
    const lyrics = document.createElement("pre");
    lyrics.className = "detail-lyrics";
    lyrics.textContent = b.lyrics;
    els.detailContent.appendChild(heading);
    els.detailContent.appendChild(lyrics);
  }

  if (b.meaning) {
    const heading = document.createElement("p");
    heading.className = "detail-section-label";
    heading.textContent = "Meaning";
    const meaning = document.createElement("p");
    meaning.className = "detail-meaning";
    meaning.textContent = b.meaning;
    els.detailContent.appendChild(heading);
    els.detailContent.appendChild(meaning);
  }
}

els.navItems.forEach(item => {
  item.addEventListener("click", () => {
    state.view = item.dataset.view;
    render();
  });
});

els.nameSearch.addEventListener("input", e => { state.nameQuery = e.target.value; render(); });
els.filterBeat.addEventListener("change", e => { state.beat = e.target.value; render(); });
els.filterSpeed.addEventListener("change", e => { state.speed = e.target.value; render(); });
els.dateSearch.addEventListener("change", e => {
  state.date = e.target.value;
  els.dateClear.hidden = !state.date;
  render();
});
els.dateClear.addEventListener("click", () => {
  state.date = "";
  els.dateSearch.value = "";
  els.dateClear.hidden = true;
  render();
});
els.detailClose.addEventListener("click", () => {
  state.selectedId = null;
  render();
});

loadData();