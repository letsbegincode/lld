const syllabus = window.LLD_SYLLABUS || [];
const references = window.LLD_REFERENCE || [];

const els = {
  shell: document.querySelector(".shell"),
  content: document.querySelector("#content"),
  topicNav: document.querySelector("#topicNav"),
  breadcrumb: document.querySelector("#breadcrumb"),
  search: document.querySelector("#searchInput"),
  sidebar: document.querySelector("#sidebar"),
  sidebarClose: document.querySelector("#sidebarClose"),
  sidebarToggle: document.querySelector("#sidebarToggle"),
  sidebarPercent: document.querySelector("#sidebarPercent"),
  sidebarProgressFill: document.querySelector("#sidebarProgressFill"),
  themeToggle: document.querySelector("#themeToggle"),
  toast: document.querySelector("#toast")
};

const store = {
  get(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

let progress = store.get("lld-academy-progress", {});
let notes = store.get("lld-academy-notes", {});
let state = parseHash();
let searchTerm = "";
let topicRailCollapsed = store.get("lld-academy-topic-rail-collapsed", false);

function parseHash() {
  const raw = location.hash.replace(/^#/, "");
  if (!raw || raw === "dashboard") return { page: "dashboard" };
  if (raw === "quiz") return { page: "quiz" };
  if (raw === "parked") return { page: "parked" };
  if (raw === "reference") return { page: "reference" };
  if (raw.startsWith("topic/")) {
    const [, topicId, subId] = raw.split("/");
    return { page: "topic", topicId, subId };
  }
  return { page: "dashboard" };
}

function setHash(next) {
  if (next.page === "topic") {
    location.hash = `topic/${next.topicId}/${next.subId || ""}`;
  } else {
    location.hash = next.page;
  }
}

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function allSubtopics() {
  return syllabus.flatMap((topic) =>
    topic.subtopics.map((subtopic, index) => ({
      topic,
      subtopic,
      index,
      id: lessonId(topic, subtopic)
    }))
  );
}

function lessonId(topic, subtopic) {
  return `${topic.id}-${subtopic.id}`;
}

function getTopic(topicId) {
  return syllabus.find((topic) => topic.id === topicId) || syllabus[0];
}

function getSubtopic(topic, subId) {
  return topic.subtopics.find((subtopic) => subtopic.id === subId) || topic.subtopics[0];
}

function getLessonProgress(id) {
  return progress[id] || { status: "unread", confidence: 0 };
}

function updateLessonProgress(id, patch) {
  progress[id] = {
    ...getLessonProgress(id),
    ...patch,
    visitedAt: new Date().toISOString()
  };
  store.set("lld-academy-progress", progress);
  updateProgressUI();
}

function updateLessonNotes(id, patch) {
  notes[id] = { ...(notes[id] || {}), ...patch, updatedAt: new Date().toISOString() };
  store.set("lld-academy-notes", notes);
}

function progressStats() {
  const lessons = allSubtopics();
  const done = lessons.filter((lesson) => getLessonProgress(lesson.id).status === "done").length;
  const reading = lessons.filter((lesson) => getLessonProgress(lesson.id).status === "reading").length;
  const parked = lessons.filter((lesson) => getLessonProgress(lesson.id).status === "parked").length;
  const pct = lessons.length ? Math.round((done / lessons.length) * 100) : 0;
  return { total: lessons.length, done, reading, parked, pct };
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => els.toast.classList.remove("show"), 1800);
}

function itemText(item) {
  if (!item) return "";
  if (typeof item === "string") return item;
  if (Array.isArray(item)) return item.map(itemText).join(" ");
  if (typeof item === "object") return Object.values(item).map(itemText).join(" ");
  return String(item);
}

function renderSidebar() {
  const term = searchTerm.trim().toLowerCase();
  const grouped = new Map();
  for (const topic of syllabus) {
    const matches =
      !term ||
      itemText(topic).toLowerCase().includes(term) ||
      topic.subtopics.some((subtopic) => itemText(subtopic).toLowerCase().includes(term));
    if (!matches) continue;
    if (!grouped.has(topic.week)) grouped.set(topic.week, []);
    grouped.get(topic.week).push(topic);
  }

  els.topicNav.innerHTML = [...grouped.entries()]
    .map(([week, topics]) => {
      const total = topics.reduce((sum, topic) => sum + topic.subtopics.length, 0);
      return `
        <div class="week-group">
          <div class="week-title"><span>Week ${week}</span><span>${total} lessons</span></div>
          ${topics
            .map((topic) => {
              const active = state.page === "topic" && state.topicId === topic.id ? " active" : "";
              const firstSub = topic.subtopics[0]?.id || "";
              return `
                <button class="topic-link${active}" type="button" data-topic="${topic.id}" data-sub="${firstSub}">
                  <strong>${esc(topic.title)}</strong>
                  <small>Day ${topic.day} - ${topic.subtopics.length} lessons</small>
                </button>
              `;
            })
            .join("")}
        </div>
      `;
    })
    .join("") || '<p class="muted" style="padding:1rem;">No matching topics.</p>';

  els.topicNav.querySelectorAll("[data-topic]").forEach((button) => {
    button.addEventListener("click", () => {
      setHash({ page: "topic", topicId: button.dataset.topic, subId: button.dataset.sub });
      if (window.innerWidth < 1120) els.sidebar.classList.add("collapsed");
    });
  });
}

function updateProgressUI() {
  const stats = progressStats();
  els.sidebarPercent.textContent = `${stats.pct}%`;
  els.sidebarProgressFill.style.width = `${stats.pct}%`;
}

function updatePrimaryNav() {
  document.querySelectorAll(".primary-nav-item").forEach((button) => {
    button.classList.toggle("active", button.dataset.page === state.page);
  });
}

function renderDashboard() {
  const stats = progressStats();
  const next =
    allSubtopics().find((lesson) => getLessonProgress(lesson.id).status !== "done") ||
    allSubtopics()[0];

  els.breadcrumb.textContent = "Dashboard";
  els.content.innerHTML = `
    <section class="hero">
      <div>
        <p class="eyebrow">Java-first low level design academy</p>
        <h1>Learn LLD like an interview course.</h1>
        <p>
          This site is built like a self-contained textbook: each lesson explains the problem,
          mental model, design steps, diagrams, Java code, trade-offs, edge cases, and interview answers.
        </p>
        <div class="lesson-actions">
          <button class="solid-button" type="button" data-start-next>Continue next lesson</button>
          <button class="ghost-button" type="button" data-page-jump="reference">Open quick reference</button>
        </div>
      </div>
      <div class="hero-map">
        ${["Clarify requirements", "Model objects", "Draw flow", "Code core workflow", "Defend trade-offs"].map((step, index) => `
          <div class="hero-step">
            <span>${index + 1}</span>
            <div><strong>${esc(step)}</strong><small>Repeat this in every LLD problem</small></div>
          </div>
        `).join("")}
      </div>
    </section>

    <section class="stats-grid">
      <div class="stat"><strong>${syllabus.length}</strong><span>topics</span></div>
      <div class="stat"><strong>${stats.total}</strong><span>lessons</span></div>
      <div class="stat"><strong>${stats.done}</strong><span>done</span></div>
      <div class="stat"><strong>${stats.parked}</strong><span>parked</span></div>
    </section>

    <section class="section">
      <div class="section-head">
        <div>
          <p class="eyebrow">Weekly map</p>
          <h2>Study path</h2>
        </div>
      </div>
      <div class="week-grid">
        ${[...new Set(syllabus.map((topic) => topic.week))].map((week) => {
          const topics = syllabus.filter((topic) => topic.week === week);
          return `
            <article class="topic-card">
              <p class="eyebrow">Week ${week}</p>
              <h3>${esc(weekTitle(week))}</h3>
              <p>${topics.length} topics, ${topics.reduce((sum, topic) => sum + topic.subtopics.length, 0)} lessons.</p>
              <div class="tag-row">${topics.slice(0, 4).map((topic) => `<span class="tag">${esc(topic.title)}</span>`).join("")}</div>
            </article>
          `;
        }).join("")}
      </div>
    </section>

    <section class="section">
      <div class="section-head">
        <div>
          <p class="eyebrow">All topics</p>
          <h2>Open any topic</h2>
        </div>
      </div>
      <div class="topic-grid">
        ${syllabus.map((topic) => `
          <article class="topic-card">
            <p class="eyebrow">Week ${topic.week} - Day ${topic.day}</p>
            <h3>${esc(topic.title)}</h3>
            <p>${esc(topic.goal)}</p>
            <div class="topic-card-footer">
              <span class="subtopic-count">${topic.subtopics.length} lessons</span>
              <button class="ghost-button" type="button" data-open-topic="${topic.id}" data-open-sub="${topic.subtopics[0].id}">Open</button>
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `;

  els.content.querySelector("[data-start-next]").addEventListener("click", () => {
    setHash({ page: "topic", topicId: next.topic.id, subId: next.subtopic.id });
  });

  els.content.querySelectorAll("[data-page-jump]").forEach((button) => {
    button.addEventListener("click", () => setHash({ page: button.dataset.pageJump }));
  });

  els.content.querySelectorAll("[data-open-topic]").forEach((button) => {
    button.addEventListener("click", () => {
      setHash({ page: "topic", topicId: button.dataset.openTopic, subId: button.dataset.openSub });
    });
  });
}

function weekTitle(week) {
  return {
    1: "OOP and object discovery",
    2: "SOLID and patterns",
    3: "Java implementation toolkit",
    4: "SDE1 case studies",
    5: "SDE2 product case studies",
    6: "Infrastructure-style LLD",
    7: "Marketplace systems",
    8: "Games, ATM, and interview playbook",
    9: "Phase 1: OS to JVM Bridge",
    10: "Phase 2: Synchronization and lock-free",
    11: "Phase 3: High-throughput thread management",
    12: "Phase 4: Redis-Lite capstone"
  }[week] || "LLD practice";
}

function renderTopic() {
  const topic = getTopic(state.topicId);
  const subtopic = getSubtopic(topic, state.subId);
  const id = lessonId(topic, subtopic);
  const currentProgress = getLessonProgress(id);
  const currentNotes = notes[id] || {};
  state.topicId = topic.id;
  state.subId = subtopic.id;

  els.breadcrumb.textContent = `Week ${topic.week} / ${topic.title} / ${subtopic.name}`;
  if (currentProgress.status === "unread") {
    updateLessonProgress(id, { status: "reading" });
  }
  const shownProgress = getLessonProgress(id);

  els.content.innerHTML = `
    <section class="topic-layout${topicRailCollapsed ? " rail-collapsed" : ""}">
      <aside class="topic-rail">
        <div class="topic-rail-head">
          <span>Subtopics</span>
          <button class="mini-button" type="button" data-rail-toggle>Minimize</button>
        </div>
        ${topic.subtopics.map((item, index) => {
          const itemId = lessonId(topic, item);
          const p = getLessonProgress(itemId);
          return `
            <button class="topic-tab${item.id === subtopic.id ? " active" : ""}" type="button" data-sub="${item.id}">
              <strong>${index + 1}. ${esc(item.name)}</strong>
              <small>${esc(item.level)} - ${p.status || "unread"} - ${p.confidence || 0}/5</small>
            </button>
          `;
        }).join("")}
      </aside>

      <article class="topic-reader">
        <div class="reader-toolbar">
          <button class="mini-button" type="button" data-rail-toggle>
            ${topicRailCollapsed ? "Show subtopics" : "Hide subtopics"}
          </button>
        </div>
        <header class="topic-hero">
          <div class="topic-meta">
            <span class="tag core">Week ${topic.week}</span>
            <span class="tag">Day ${topic.day}</span>
            <span class="tag ${subtopic.level === "ADV" ? "adv" : "core"}">${esc(subtopic.level)}</span>
          </div>
          <h1>${esc(subtopic.name)}</h1>
          <p>${esc(subtopic.problem)}</p>
        </header>

        <div class="lesson-actions">
          ${["reading", "done", "parked", "unread"].map((status) => `
            <button class="status-button${shownProgress.status === status ? " active" : ""}" type="button" data-status="${status}">
              ${statusLabel(status)}
            </button>
          `).join("")}
        </div>

        <div class="confidence panel" style="padding:0.8rem 1rem;margin-bottom:1rem;">
          <span class="meta-label">Confidence</span>
          ${[1, 2, 3, 4, 5].map((value) => `
            <button class="star${(shownProgress.confidence || 0) >= value ? " filled" : ""}" type="button" data-confidence="${value}">*</button>
          `).join("")}
        </div>

        ${renderLesson(topic, subtopic)}

        <section class="reader-section panel" style="margin-top:1rem;">
          <h3>Personal Notes</h3>
          <div class="notes-grid">
            <label><span class="meta-label">My understanding</span><textarea data-note="understanding">${esc(currentNotes.understanding || "")}</textarea></label>
            <label><span class="meta-label">My questions</span><textarea data-note="questions">${esc(currentNotes.questions || "")}</textarea></label>
            <label><span class="meta-label">Key points</span><textarea data-note="keyPoints">${esc(currentNotes.keyPoints || "")}</textarea></label>
          </div>
        </section>
      </article>
    </section>
  `;

  els.content.querySelectorAll("[data-sub]").forEach((button) => {
    button.addEventListener("click", () => setHash({ page: "topic", topicId: topic.id, subId: button.dataset.sub }));
  });
  els.content.querySelectorAll("[data-rail-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      topicRailCollapsed = !topicRailCollapsed;
      store.set("lld-academy-topic-rail-collapsed", topicRailCollapsed);
      renderTopic();
    });
  });
  els.content.querySelectorAll("[data-status]").forEach((button) => {
    button.addEventListener("click", () => {
      updateLessonProgress(id, { status: button.dataset.status });
      showToast(`Marked ${statusLabel(button.dataset.status).toLowerCase()}`);
      render();
    });
  });
  els.content.querySelectorAll("[data-confidence]").forEach((button) => {
    button.addEventListener("click", () => {
      updateLessonProgress(id, { confidence: Number(button.dataset.confidence) });
      showToast("Confidence saved");
      render();
    });
  });
  els.content.querySelectorAll("[data-note]").forEach((textarea) => {
    textarea.addEventListener("input", () => {
      updateLessonNotes(id, { [textarea.dataset.note]: textarea.value });
    });
  });
}

function statusLabel(status) {
  return {
    reading: "Reading",
    done: "Done",
    parked: "Park",
    unread: "Reset"
  }[status] || status;
}

function renderLesson(topic, subtopic) {
  return `
    <div class="reader-card">
      <section class="reader-section">
        <h3>The Problem It Solves</h3>
        <p>${esc(subtopic.problem)}</p>
        <p>${esc(subtopic.core)}</p>
      </section>

      <section class="reader-section">
        <h3>Mental Model</h3>
        <p>${esc(subtopic.mentalModel)}</p>
        ${renderDiagram(subtopic)}
      </section>

      <section class="reader-section">
        <h3>Core Concepts</h3>
        <div class="concept-grid">${renderCards(subtopic.concepts, "concept-card")}</div>
      </section>

      <section class="reader-section">
        <h3>Real Examples</h3>
        <div class="example-grid">${renderCards(subtopic.examples, "example-card")}</div>
      </section>

      <section class="reader-section">
        <h3>Step-by-Step Flow</h3>
        <div class="diagram-block">
          <div class="diagram-label">${esc(subtopic.name)} flow</div>
          <pre>${esc(subtopic.flow.map((step, index) => `${String(index + 1).padStart(2, "0")}  ${step}`).join("\n"))}</pre>
        </div>
      </section>

      <section class="reader-section">
        <h3>Java Implementation</h3>
        <p>${esc(subtopic.deepDive)}</p>
        <div class="diagram-block">
          <div class="diagram-label">${esc(subtopic.codeTitle || "Java sketch")}</div>
          <pre><code>${esc(subtopic.code || "// Code sketch coming soon")}</code></pre>
        </div>
      </section>

      <section class="reader-section">
        <h3>Design Trade-offs</h3>
        <div class="tradeoff-grid">${renderCards(subtopic.tradeoffs, "tradeoff-card")}</div>
      </section>

      <section class="reader-section">
        <h3>Failure Modes and Edge Cases</h3>
        <div class="failure-grid">
          ${(subtopic.failures || []).map((item) => `<div class="failure-card"><strong>Watch out</strong><p>${esc(item)}</p></div>`).join("")}
        </div>
      </section>

      <section class="reader-section">
        <h3>When To Use / Avoid</h3>
        <div class="summary-strip">
          <div><strong>Use when</strong>${renderList(subtopic.useWhen)}</div>
          <div><strong>Avoid when</strong>${renderList(subtopic.avoidWhen)}</div>
          <div><strong>Revision</strong><p>${esc(subtopic.revision)}</p></div>
        </div>
      </section>

      <section class="reader-section">
        <h3>Interview Questions</h3>
        <div class="qa-grid">${renderQuestions(subtopic.questions)}</div>
      </section>

      <section class="reader-section">
        <h3>Practice Task</h3>
        <p>Close the page for five minutes and redesign this lesson from memory. Then code the core method and explain one failure path aloud.</p>
      </section>
    </div>
  `;
}

function renderDiagram(subtopic) {
  const lines = [
    `[Problem] ${subtopic.problem}`,
    "        |",
    `        v`,
    `[Model] ${subtopic.mentalModel}`,
    "        |",
    `        v`,
    `[Flow] ${subtopic.flow.slice(0, 4).join(" -> ")}`,
    "        |",
    `        v`,
    `[Invariant] ${subtopic.revision}`
  ];
  return `
    <div class="diagram-block">
      <div class="diagram-label">Visual model</div>
      <pre>${esc(lines.join("\n"))}</pre>
    </div>
  `;
}

function renderCards(items, className) {
  return (items || [])
    .map((item) => `<article class="${className}"><strong>${esc(item.title || "Point")}</strong><p>${esc(item.body || item)}</p></article>`)
    .join("");
}

function renderList(items = []) {
  return `<ul>${items.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`;
}

function renderQuestions(items = []) {
  return items
    .map((item) => `
      <article class="qa-item">
        <div class="qa-question"><span class="qa-level">${esc(item.level)}</span><span>${esc(item.question)}</span></div>
        <div class="qa-answer">${esc(item.answer)}</div>
      </article>
    `)
    .join("");
}

function renderQuiz() {
  const pool = allSubtopics().flatMap(({ topic, subtopic }) =>
    (subtopic.questions || []).map((question) => ({ topic, subtopic, question }))
  );
  const selected = pool.sort(() => 0.5 - Math.random()).slice(0, 20);
  els.breadcrumb.textContent = "Quiz Mode";
  els.content.innerHTML = `
    <section class="section" style="margin-top:0;">
      <div class="section-head">
        <div>
          <p class="eyebrow">Random practice</p>
          <h2>Quiz Mode</h2>
        </div>
        <button class="ghost-button" type="button" data-reroll>New questions</button>
      </div>
      <div class="panel-grid">
        ${selected.map((item, index) => `
          <article class="quiz-card">
            <p class="eyebrow">${esc(item.topic.title)} - ${esc(item.subtopic.name)}</p>
            <h3>${index + 1}. ${esc(item.question.question)}</h3>
            <button class="quiz-answer-toggle" type="button" data-answer="${index}">Show answer</button>
            <p class="hidden" id="answer-${index}">${esc(item.question.answer)}</p>
          </article>
        `).join("")}
      </div>
    </section>
  `;
  els.content.querySelector("[data-reroll]").addEventListener("click", renderQuiz);
  els.content.querySelectorAll("[data-answer]").forEach((button) => {
    button.addEventListener("click", () => document.querySelector(`#answer-${button.dataset.answer}`).classList.toggle("hidden"));
  });
}

function renderParked() {
  const parked = allSubtopics().filter((lesson) => getLessonProgress(lesson.id).status === "parked");
  els.breadcrumb.textContent = "Parked Lessons";
  els.content.innerHTML = `
    <section class="section" style="margin-top:0;">
      <div class="section-head">
        <div>
          <p class="eyebrow">Later queue</p>
          <h2>Parked Lessons</h2>
        </div>
      </div>
      ${
        parked.length
          ? `<div class="topic-grid">${parked.map(({ topic, subtopic, id }) => `
              <article class="topic-card">
                <p class="eyebrow">${esc(topic.title)}</p>
                <h3>${esc(subtopic.name)}</h3>
                <p>${esc(subtopic.problem)}</p>
                <button class="ghost-button" type="button" data-open-topic="${topic.id}" data-open-sub="${subtopic.id}">Open</button>
              </article>
            `).join("")}</div>`
          : '<div class="empty-state"><h2>No parked lessons yet</h2><p class="muted">Park advanced lessons when you want to revisit them later.</p></div>'
      }
    </section>
  `;
  els.content.querySelectorAll("[data-open-topic]").forEach((button) => {
    button.addEventListener("click", () => setHash({ page: "topic", topicId: button.dataset.openTopic, subId: button.dataset.openSub }));
  });
}

function renderReference() {
  els.breadcrumb.textContent = "Quick Reference";
  els.content.innerHTML = `
    <section class="section" style="margin-top:0;">
      <div class="section-head">
        <div>
          <p class="eyebrow">Interview cheatsheets</p>
          <h2>Quick Reference</h2>
        </div>
      </div>
      <div class="reference-grid">
        ${references.map((ref) => `
          <article class="reference-card">
            <h3>${esc(ref.title)}</h3>
            <div class="summary-strip">
              ${ref.rows.map((row) => `<div><strong>${esc(row[0])}</strong><p>${esc(row[1])}</p></div>`).join("")}
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function render() {
  state = parseHash();
  renderSidebar();
  updatePrimaryNav();
  updateProgressUI();
  if (state.page === "topic") renderTopic();
  else if (state.page === "quiz") renderQuiz();
  else if (state.page === "parked") renderParked();
  else if (state.page === "reference") renderReference();
  else renderDashboard();
}

function syncSidebarForViewport() {
  if (window.innerWidth < 1120) {
    setSidebarCollapsed(true);
  } else {
    setSidebarCollapsed(store.get("lld-academy-sidebar-collapsed", false));
  }
}

function setSidebarCollapsed(collapsed, persist = false) {
  els.sidebar.classList.toggle("collapsed", collapsed);
  els.shell.classList.toggle("sidebar-collapsed", collapsed);
  els.sidebarToggle.setAttribute("aria-expanded", String(!collapsed));
  if (els.sidebarClose) {
    els.sidebarClose.setAttribute("aria-expanded", String(!collapsed));
  }
  if (persist && window.innerWidth >= 1120) {
    store.set("lld-academy-sidebar-collapsed", collapsed);
  }
}

document.querySelectorAll("[data-page]").forEach((target) => {
  target.addEventListener("click", (event) => {
    event.preventDefault();
    setHash({ page: target.dataset.page });
    if (window.innerWidth < 1120) setSidebarCollapsed(true);
  });
});

els.search.addEventListener("input", (event) => {
  searchTerm = event.target.value;
  renderSidebar();
});

els.sidebarToggle.addEventListener("click", () => {
  setSidebarCollapsed(!els.sidebar.classList.contains("collapsed"), true);
});

if (els.sidebarClose) {
  els.sidebarClose.addEventListener("click", () => setSidebarCollapsed(true, true));
}

els.themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light");
  store.set("lld-academy-theme", document.body.classList.contains("light") ? "light" : "dark");
});

window.addEventListener("hashchange", render);
window.addEventListener("resize", syncSidebarForViewport);

if (store.get("lld-academy-theme", "dark") === "light") {
  document.body.classList.add("light");
}

syncSidebarForViewport();
render();
