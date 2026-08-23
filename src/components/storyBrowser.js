import {storyCard} from "./storyCard.js";

function uniqueSorted(stories, key) {
  return [...new Set(stories.map((s) => s[key]))].sort();
}

function field(labelText, control) {
  const wrap = document.createElement("div");
  const label = document.createElement("label");
  label.textContent = labelText;
  wrap.append(label, control);
  return wrap;
}

function select(options, {allLabel}) {
  const el = document.createElement("select");
  const all = document.createElement("option");
  all.value = "";
  all.textContent = allLabel;
  el.append(all);
  for (const value of options) {
    const opt = document.createElement("option");
    opt.value = value;
    opt.textContent = value;
    el.append(opt);
  }
  return el;
}

export function storyBrowser(stories) {
  const root = document.createElement("div");
  root.className = "browser";

  const filters = {
    search: "",
    protagonist_role: "",
    setting: "",
    sentiment: "",
    protagonist_gender: "",
    core_conflict: "",
    resolution_type: "",
  };

  // --- toolbar ---
  const toolbar = document.createElement("div");
  toolbar.className = "browser__toolbar";

  const searchInput = document.createElement("input");
  searchInput.type = "search";
  searchInput.placeholder = "title, summary, or story text…";

  const roleSelect = select(uniqueSorted(stories, "protagonist_role"), {allLabel: "All roles"});
  const settingSelect = select(uniqueSorted(stories, "setting"), {allLabel: "All settings"});
  const sentimentSelect = select(uniqueSorted(stories, "sentiment"), {allLabel: "All sentiments"});
  const genderSelect = select(uniqueSorted(stories, "protagonist_gender"), {allLabel: "All genders"});
  const conflictSelect = select(uniqueSorted(stories, "core_conflict"), {allLabel: "All conflicts"});
  const resolutionSelect = select(uniqueSorted(stories, "resolution_type"), {allLabel: "All resolutions"});

  const clearButton = document.createElement("button");
  clearButton.type = "button";
  clearButton.className = "read-more";
  clearButton.textContent = "Clear filters";

  const more = document.createElement("details");
  const moreSummary = document.createElement("summary");
  moreSummary.textContent = "More filters";
  const moreBody = document.createElement("div");
  moreBody.className = "browser__toolbar";
  moreBody.style.marginTop = "0.75rem";
  moreBody.append(
    field("Gender", genderSelect),
    field("Core conflict", conflictSelect),
    field("Resolution", resolutionSelect)
  );
  more.append(moreSummary, moreBody);

  toolbar.append(
    field("Search", searchInput),
    field("Role", roleSelect),
    field("Setting", settingSelect),
    field("Sentiment", sentimentSelect),
    clearButton
  );

  const countLabel = document.createElement("p");
  countLabel.className = "browser__count";

  const grid = document.createElement("div");
  grid.className = "browser__grid";

  // --- dialog for full-text reading ---
  const dialog = document.createElement("dialog");
  dialog.className = "story-dialog";
  root.append(toolbar, more, countLabel, grid, dialog);

  let currentFiltered = stories;
  let currentIndex = -1;

  function openStory(story) {
    currentIndex = currentFiltered.indexOf(story);
    renderDialog();
    dialog.showModal();
  }

  function renderDialog() {
    const story = currentFiltered[currentIndex];
    dialog.replaceChildren();
    if (!story) return;

    const h2 = document.createElement("h2");
    h2.textContent = story.title;

    const meta = document.createElement("p");
    meta.className = "summary";
    meta.textContent = `${story.protagonist_gender} ${story.protagonist_role} · ${story.setting} · ${story.sentiment}`;

    const text = document.createElement("div");
    text.className = "story-text";
    text.textContent = story.story;

    const nav = document.createElement("div");
    nav.className = "story-dialog__nav";

    const prev = document.createElement("button");
    prev.type = "button";
    prev.textContent = "← Previous";
    prev.disabled = currentIndex <= 0;
    prev.addEventListener("click", () => {
      currentIndex -= 1;
      renderDialog();
    });

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "story-dialog__close";
    closeBtn.textContent = "Close";
    closeBtn.addEventListener("click", () => dialog.close());

    const next = document.createElement("button");
    next.type = "button";
    next.textContent = "Next →";
    next.disabled = currentIndex >= currentFiltered.length - 1;
    next.addEventListener("click", () => {
      currentIndex += 1;
      renderDialog();
    });

    nav.append(prev, closeBtn, next);
    dialog.append(h2, meta, text, nav);
  }

  function matches(story) {
    const q = filters.search.trim().toLowerCase();
    if (q) {
      const haystack = `${story.title} ${story.summary} ${story.story}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    for (const key of ["protagonist_role", "setting", "sentiment", "protagonist_gender", "core_conflict", "resolution_type"]) {
      if (filters[key] && story[key] !== filters[key]) return false;
    }
    return true;
  }

  function render() {
    currentFiltered = stories.filter(matches);
    countLabel.textContent = `Showing ${currentFiltered.length} of ${stories.length} stories`;
    grid.replaceChildren();
    if (!currentFiltered.length) {
      const empty = document.createElement("p");
      empty.className = "browser__empty";
      empty.textContent = "No stories match these filters.";
      grid.append(empty);
      return;
    }
    for (const story of currentFiltered) {
      grid.append(storyCard(story, {onOpen: openStory}));
    }
  }

  let debounceTimer;
  searchInput.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      filters.search = searchInput.value;
      render();
    }, 150);
  });

  const selectBindings = [
    [roleSelect, "protagonist_role"],
    [settingSelect, "setting"],
    [sentimentSelect, "sentiment"],
    [genderSelect, "protagonist_gender"],
    [conflictSelect, "core_conflict"],
    [resolutionSelect, "resolution_type"],
  ];
  for (const [el, key] of selectBindings) {
    el.addEventListener("change", () => {
      filters[key] = el.value;
      render();
    });
  }

  clearButton.addEventListener("click", () => {
    filters.search = "";
    searchInput.value = "";
    for (const [el, key] of selectBindings) {
      filters[key] = "";
      el.value = "";
    }
    render();
  });

  render();
  return root;
}
