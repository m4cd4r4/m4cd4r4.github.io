#!/usr/bin/env node
"use strict";
// ============================================================
// generate-readme.ts
// Reads data/projects.json and outputs a new README.md
// for the m4cd4r4/m4cd4r4 profile repo.
//
// Usage:
//   npx ts-node scripts/generate-readme.ts > ../path/to/m4cd4r4/README.md
//   npx ts-node scripts/generate-readme.ts --out /path/to/README.md
// ============================================================
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
// Resolve image URL for README (must be absolute, raw.githubusercontent or public URL)
function readmeImageUrl(project) {
    if (project.image.type === "asset") {
        // Point at the portfolio repo's raw images
        return `https://raw.githubusercontent.com/m4cd4r4/m4cd4r4.github.io/main/${project.image.src}`;
    }
    if (project.image.type === "thum") {
        return `https://image.thum.io/get/width/600/${project.image.src.replace(/^https?:\/\//, "")}`;
    }
    return project.image.src;
}
// Primary link for a project
function projectLink(project) {
    return project.url ?? project.repo ?? "https://github.com/m4cd4r4";
}
// Build a 3-column featured projects table (2 rows × 3 cols = 6 projects)
function buildFeaturedTable(projects) {
    const featured = projects.filter((p) => p.featured).slice(0, 6);
    const rows = [];
    for (let i = 0; i < featured.length; i += 3) {
        const chunk = featured.slice(i, i + 3);
        // Pad to 3 if last row is short
        while (chunk.length < 3)
            chunk.push(null);
        const cells = chunk
            .map((p) => {
            if (!p)
                return "    <td width=\"33%\"></td>";
            const link = projectLink(p);
            const imgSrc = readmeImageUrl(p);
            return `    <td width="33%">
      <a href="${link}">
        <img src="${imgSrc}" alt="${p.name}"/>
      </a>
      <b>${p.name}</b><br>
      <sub>${p.tagline}</sub>
    </td>`;
        })
            .join("\n");
        rows.push(`  <tr>\n${cells}\n  </tr>`);
    }
    return `<table>\n${rows.join("\n")}\n</table>`;
}
// ── Main ─────────────────────────────────────────────────────
const dataPath = (0, path_1.resolve)(__dirname, "..", "data", "projects.json");
const data = JSON.parse((0, fs_1.readFileSync)(dataPath, "utf-8"));
const featuredTable = buildFeaturedTable(data.projects);
const readme = `## Hi, I'm Macdara

Full-stack developer building practical tools across AI, health tech, scientific computing, and IoT. Based in Perth, Western Australia.

[![Email](https://img.shields.io/badge/-m4cd4r4@gmail.com-c14438?style=flat&logo=Gmail&logoColor=white)](mailto:m4cd4r4@gmail.com)
[![Location](https://img.shields.io/badge/-Perth,%20WA-blue?style=flat&logo=google-maps&logoColor=white)](https://github.com/m4cd4r4)
[![Solaisoft](https://img.shields.io/badge/-Solaisoft-000?style=flat&logo=safari&logoColor=white)](https://solaisoft.com)
[![Portfolio](https://img.shields.io/badge/-Portfolio-8B4513?style=flat&logo=github&logoColor=white)](https://m4cd4r4.github.io)

---

### Tech

![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Python](https://img.shields.io/badge/-Python-3776AB?style=flat&logo=python&logoColor=white)
![Rust](https://img.shields.io/badge/-Rust-000000?style=flat&logo=rust&logoColor=white)
![React](https://img.shields.io/badge/-React-61DAFB?style=flat&logo=react&logoColor=black)
![Next.js](https://img.shields.io/badge/-Next.js-000000?style=flat&logo=nextdotjs&logoColor=white)
![FastAPI](https://img.shields.io/badge/-FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/-PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/-Docker-2496ED?style=flat&logo=docker&logoColor=white)
![Azure](https://img.shields.io/badge/-Azure-0078D4?style=flat&logo=microsoftazure&logoColor=white)
![ESP32](https://img.shields.io/badge/-ESP32-E7352C?style=flat&logo=espressif&logoColor=white)

---

### Open Source Contributions

**Merged**

[![astroquery](https://img.shields.io/badge/astropy%2Fastroquery-%233551-2ea44f?style=flat&logo=github)](https://github.com/astropy/astroquery/pull/3551)
[![auto-archiver](https://img.shields.io/badge/bellingcat%2Fauto--archiver-%23377-2ea44f?style=flat&logo=github)](https://github.com/bellingcat/auto-archiver/pull/377)
[![ifme](https://img.shields.io/badge/ifmeorg%2Fifme-%232402-2ea44f?style=flat&logo=github)](https://github.com/ifmeorg/ifme/pull/2402)
[![buildspace](https://img.shields.io/badge/buildspace%2Fprojects-%23286-2ea44f?style=flat&logo=github)](https://github.com/buildspace/buildspace-projects/pull/286)

**Under review**

[![lightkurve](https://img.shields.io/badge/lightkurve-%231543-dfb317?style=flat&logo=github)](https://github.com/lightkurve/lightkurve/pull/1543)
[![astropy](https://img.shields.io/badge/astropy-%2319389-dfb317?style=flat&logo=github)](https://github.com/astropy/astropy/pull/19389)
[![sunpy](https://img.shields.io/badge/sunpy-%238537-dfb317?style=flat&logo=github)](https://github.com/sunpy/sunpy/pull/8537)
[![astroplan](https://img.shields.io/badge/astroplan-%23636-dfb317?style=flat&logo=github)](https://github.com/astropy/astroplan/pull/636)
[![spacepy](https://img.shields.io/badge/spacepy-%23832-dfb317?style=flat&logo=github)](https://github.com/spacepy/spacepy/pull/832)

---

### Featured Projects

${featuredTable}

**[See all projects on my portfolio &rarr;](https://m4cd4r4.github.io)**

---

### Stats

<p>
  <img height="160" src="https://github-readme-stats.vercel.app/api?username=m4cd4r4&show_icons=true&theme=transparent&hide_border=true&count_private=true" alt="GitHub stats"/>
  <img height="160" src="https://github-readme-stats.vercel.app/api/top-langs/?username=m4cd4r4&layout=compact&theme=transparent&hide_border=true&langs_count=8" alt="Top languages"/>
</p>

<img src="https://github-readme-streak-stats.herokuapp.com/?user=m4cd4r4&theme=transparent&hide_border=true" alt="GitHub streak"/>

---

### Activity

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://github.com/m4cd4r4/m4cd4r4/blob/output/github-snake-dark.svg" />
  <source media="(prefers-color-scheme: light)" srcset="https://github.com/m4cd4r4/m4cd4r4/blob/output/github-snake.svg" />
  <img alt="contribution graph animation" src="https://github.com/m4cd4r4/m4cd4r4/blob/output/github-snake.svg" />
</picture>
`;
// Write to file or stdout
const args = process.argv.slice(2);
const outIndex = args.indexOf("--out");
if (outIndex !== -1 && args[outIndex + 1]) {
    const outPath = (0, path_1.resolve)(args[outIndex + 1]);
    (0, fs_1.writeFileSync)(outPath, readme, "utf-8");
    console.error(`Written to ${outPath}`);
}
else {
    process.stdout.write(readme);
}
