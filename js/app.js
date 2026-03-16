"use strict";
// ============================================================
// The Surveyor's Catalog — app.ts
// Loads projects.json, renders entries, handles filtering,
// session accent rotation, and touch interactions.
// ============================================================
// ── Session accent rotation ──────────────────────────────────
// Same lightness/chroma, different hue each session.
// Stored in sessionStorage so it stays consistent within a tab.
const ACCENT_HUES = [30, 155, 220, 75, 340]; // terracotta, sage, slate, ochre, dusty rose
function getSessionAccentHue() {
    const stored = sessionStorage.getItem("accent-hue-index");
    const allVisits = parseInt(localStorage.getItem("visit-count") || "0", 10);
    let index;
    if (stored !== null) {
        index = parseInt(stored, 10);
    }
    else {
        index = allVisits % ACCENT_HUES.length;
        sessionStorage.setItem("accent-hue-index", String(index));
        localStorage.setItem("visit-count", String(allVisits + 1));
    }
    return ACCENT_HUES[index] ?? 30;
}
function applyAccentHue(hue) {
    document.documentElement.style.setProperty("--accent-hue", String(hue));
}
// ── Image URL resolution ─────────────────────────────────────
function resolveImageUrl(image) {
    if (image.type === "thum") {
        return `https://image.thum.io/get/width/640/crop/360/noanimate/https://${image.src.replace(/^https?:\/\//, "")}`;
    }
    return image.src;
}
// ── Render filter tabs ───────────────────────────────────────
function renderFilterTabs(categories, projects) {
    const container = document.getElementById("filter-tabs");
    if (!container)
        return;
    // Count per category
    const counts = { all: projects.length };
    for (const p of projects) {
        counts[p.category] = (counts[p.category] ?? 0) + 1;
    }
    // "All" tab
    const allBtn = document.createElement("button");
    allBtn.className = "filter-tab active";
    allBtn.dataset.category = "all";
    allBtn.setAttribute("role", "tab");
    allBtn.setAttribute("aria-selected", "true");
    allBtn.setAttribute("aria-controls", "project-grid");
    allBtn.textContent = `All (${counts.all})`;
    container.appendChild(allBtn);
    // Category tabs
    for (const [key, cat] of Object.entries(categories)) {
        if (!counts[key])
            continue;
        const btn = document.createElement("button");
        btn.className = "filter-tab";
        btn.dataset.category = key;
        btn.setAttribute("role", "tab");
        btn.setAttribute("aria-selected", "false");
        btn.setAttribute("aria-controls", "project-grid");
        btn.textContent = `${cat.label} (${counts[key]})`;
        container.appendChild(btn);
    }
}
// ── Render project entries ───────────────────────────────────
function renderProjects(projects, categories) {
    const grid = document.getElementById("project-grid");
    if (!grid)
        return;
    // Sort: featured first, then year descending
    const sorted = [...projects].sort((a, b) => {
        if (a.featured !== b.featured)
            return a.featured ? -1 : 1;
        return b.year - a.year;
    });
    sorted.forEach((project, index) => {
        const entry = buildEntry(project, categories, index);
        grid.appendChild(entry);
    });
}
function buildEntry(project, categories, index) {
    const cat = categories[project.category];
    const catColor = cat ? `oklch(58% 0.12 ${cat.hue})` : "currentColor";
    const article = document.createElement("article");
    article.className = `project-entry${project.featured ? " featured" : ""}`;
    article.dataset.category = project.category;
    article.style.setProperty("--i", String(Math.min(index, 9))); // cap stagger at 10 items
    article.setAttribute("role", "listitem");
    // Figure number
    const figNum = String(index + 1).padStart(2, "0");
    // Status badge
    const statusLabel = project.status === "live" ? "Live ↗" : project.status === "active" ? "Active" : "Archive";
    const statusHtml = `<span class="entry-status entry-status--${escAttr(project.status)}" aria-label="Status: ${escAttr(project.status)}">${statusLabel}</span>`;
    // Image or placeholder
    const imageHtml = buildImageHtml(project);
    // Tech preview (first 2, always visible)
    const techPreviewHtml = project.tech.slice(0, 2)
        .map((t) => `<span class="tech-tag">${escHtml(t)}</span>`)
        .join("");
    // Tech tags in details (remaining, or all if <=2)
    const detailTech = project.tech.length > 2 ? project.tech.slice(2) : project.tech;
    const techHtml = detailTech
        .map((t) => `<span class="tech-tag">${escHtml(t)}</span>`)
        .join("");
    // Action buttons
    const actionsHtml = buildActionsHtml(project);
    article.innerHTML = `
    <div class="entry-header">
      <p class="entry-figure" aria-label="Figure ${figNum}">Fig. ${figNum}</p>
      ${statusHtml}
    </div>
    ${imageHtml}
    <p class="entry-category" style="color: ${catColor}">${escHtml(cat?.label ?? project.category)}</p>
    <h2 class="entry-title">${escHtml(project.name)}</h2>
    <p class="entry-tagline">${escHtml(project.tagline)}</p>
    <div class="entry-tech-preview" aria-label="Technologies used">${techPreviewHtml}</div>
    <div class="entry-details" aria-hidden="true">
      <div class="entry-details-inner">
        <p class="entry-description">${escHtml(project.description)}</p>
        ${techHtml ? `<div class="entry-tech" aria-label="More technologies">${techHtml}</div>` : ""}
        <div class="entry-actions">${actionsHtml}</div>
      </div>
    </div>
  `;
    // Touch / keyboard: toggle expanded state
    article.addEventListener("click", (e) => {
        // Let action link clicks pass through without toggling
        if (e.target.closest(".entry-action"))
            return;
        if (isTouchDevice()) {
            const isExpanded = article.classList.toggle("expanded");
            const details = article.querySelector(".entry-details");
            if (details)
                details.setAttribute("aria-hidden", String(!isExpanded));
        }
    });
    article.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            const isExpanded = article.classList.toggle("expanded");
            const details = article.querySelector(".entry-details");
            if (details)
                details.setAttribute("aria-hidden", String(!isExpanded));
        }
    });
    // Make article focusable for keyboard nav
    article.setAttribute("tabindex", "0");
    return article;
}
function buildImageHtml(project) {
    const imgUrl = resolveImageUrl(project.image);
    // Check if image src looks like a placeholder (no real src)
    if (!imgUrl || imgUrl === "images/" || imgUrl.endsWith("/")) {
        return `<div class="entry-image-placeholder" aria-hidden="true">
      <span class="placeholder-title">${escHtml(project.name)}</span>
    </div>`;
    }
    return `<div class="entry-image-wrap">
    <img
      class="entry-image"
      src="${escAttr(imgUrl)}"
      alt="${escAttr(project.name + " — " + project.tagline)}"
      loading="lazy"
      decoding="async"
      width="640"
      height="400"
    >
  </div>`;
}
function buildActionsHtml(project) {
    const parts = [];
    if (project.url) {
        parts.push(`<a href="${escAttr(project.url)}" class="entry-action entry-action--primary"
         target="_blank" rel="noopener noreferrer"
         aria-label="Open ${escAttr(project.name)} live site">
        Live Site ↗
      </a>`);
    }
    if (project.repo) {
        parts.push(`<a href="${escAttr(project.repo)}" class="entry-action entry-action--secondary"
         target="_blank" rel="noopener noreferrer"
         aria-label="View ${escAttr(project.name)} source on GitHub">
        Source
      </a>`);
    }
    return parts.join("");
}
// ── Filter logic ─────────────────────────────────────────────
function setupFilters(allProjects) {
    const tabsContainer = document.getElementById("filter-tabs");
    if (!tabsContainer)
        return;
    tabsContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(".filter-tab");
        if (!btn)
            return;
        const category = btn.dataset.category ?? "all";
        // Update tab states
        tabsContainer.querySelectorAll(".filter-tab").forEach((t) => {
            const isActive = t === btn;
            t.classList.toggle("active", isActive);
            t.setAttribute("aria-selected", String(isActive));
        });
        // Show/hide entries
        const entries = document.querySelectorAll(".project-entry");
        let visibleCount = 0;
        entries.forEach((entry) => {
            const match = category === "all" || entry.dataset.category === category;
            entry.classList.toggle("hidden", !match);
            if (match)
                visibleCount++;
        });
        updateCount(visibleCount, allProjects.length);
    });
}
// ── Count display ────────────────────────────────────────────
function updateCount(visible, total) {
    const el = document.getElementById("project-count");
    if (!el)
        return;
    el.textContent = visible === total
        ? `${total} projects`
        : `${visible} of ${total} projects`;
}
// ── Helpers ──────────────────────────────────────────────────
function isTouchDevice() {
    return window.matchMedia("(pointer: coarse)").matches;
}
function escHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
function escAttr(str) {
    return str.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
// ── Footer year ───────────────────────────────────────────────
function setFooterYear() {
    const el = document.getElementById("footer-year");
    if (el)
        el.textContent = String(new Date().getFullYear());
}
// ── Init ─────────────────────────────────────────────────────
async function init() {
    // Apply session accent before render to avoid flash
    const hue = getSessionAccentHue();
    applyAccentHue(hue);
    setFooterYear();
    let data;
    try {
        const resp = await fetch("data/projects.json");
        if (!resp.ok)
            throw new Error(`HTTP ${resp.status}`);
        data = await resp.json();
    }
    catch (err) {
        console.error("Failed to load projects.json:", err);
        const grid = document.getElementById("project-grid");
        if (grid)
            grid.innerHTML = `<p style="color:var(--text-secondary);padding:2rem 0">Could not load projects.</p>`;
        return;
    }
    renderFilterTabs(data.categories, data.projects);
    renderProjects(data.projects, data.categories);
    updateCount(data.projects.length, data.projects.length);
    setupFilters(data.projects);
}
document.addEventListener("DOMContentLoaded", init);
