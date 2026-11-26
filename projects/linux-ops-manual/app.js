/* Linux Ops Manual — static single-page app over the generated data pack (./data).
   Data: pipeline/fetch.py + build.py (official Rocky 9.6 / Ubuntu 22.04 man pages) and
         pipeline/build_curated.py (Korean operations cards). No data is hard-coded here. */
(() => {
"use strict";

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const view = $("#view");
const searchInput = $("#searchInput");
const DISTRO = { r: "Rocky Linux 9.6", u: "Ubuntu 22.04" };
const SHORT = { r: "Rocky", u: "Ubuntu" };
const COL = { r: { pkg: 3, nopt: 5, alias: 7 }, u: { pkg: 4, nopt: 6, alias: 8 } };
const FLAG_RE = /(?<![\w-])(-{1,2}[A-Za-z0-9?@#%!][\w\-.+:]*)(?![\w])/g;

const store = {
  get(k, d) { try { return localStorage.getItem(k) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } }
};
const state = { distro: store.get("lom.distro", "r") === "u" ? "u" : "r" };
let DB = null;          // index.json
let CUR = null;         // curated.json
const byId = new Map(); // "ls.1" -> row
const docCache = new Map();

/* ---------- helpers ---------- */
function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === "class") el.className = v;
    else if (k === "html") el.innerHTML = v;            // only build-sanitized manual HTML
    else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? "" : v);
  }
  for (const kid of kids.flat(Infinity)) if (kid != null && kid !== false) el.append(kid);
  return el;
}
const idOf = (row) => `${row[0]}.${row[1]}`;
const cmdHref = (id) => `#/c/${encodeURIComponent(id)}`;
function safeName(id) {
  let out = "";
  for (const ch of id) {
    const c = ch.codePointAt(0);
    if (/[a-z0-9.+\-_]/.test(ch)) out += ch;
    else if (/[A-Z]/.test(ch)) out += "^" + ch.toLowerCase();
    else out += c < 256 ? "~" + c.toString(16).padStart(2, "0") : "~u" + c.toString(16).padStart(4, "0");
  }
  return out;
}
function bucket(id) { const c = id[0].toLowerCase(); return /[a-z0-9]/.test(c) ? c : "_"; }
function tldrUrl(id) { return `./data/tldr/${bucket(id)}/${encodeURIComponent(safeName(id))}.json`; }
function docUrl(id) { return `./data/cmd/${bucket(id)}/${encodeURIComponent(safeName(id))}.json`; }
async function loadDoc(id) {
  if (!docCache.has(id)) {
    docCache.set(id, fetch(docUrl(id)).then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }));
  }
  return docCache.get(id);
}
/** sections of a command for one distro: [[title, html], ...] or null */
function sectionsFor(doc, d) {
  if (doc.doc) return doc.src[d] ? doc.doc : null;
  if (!doc[d]) return null;
  if (d === "u" && doc.same === false) return doc.u.map(([t, x]) => (typeof x === "number" ? [t, doc.r[x][1]] : [t, x]));
  return doc[d];
}
/** id of the page documenting `name` on distro d, following aliases */
function resolveName(name, d) {
  for (const sec of ["1", "8"]) {
    const row = byId.get(`${name}.${sec}`);
    if (!row) continue;
    if (row[COL[d].pkg] >= 0) return idOf(row);
    if (row[COL[d].alias]) return row[COL[d].alias];
  }
  return null;
}
function koHint(id, o) { const m = CUR.ko[id]; return m ? (o.flags || []).map((f) => m[f]).find(Boolean) : null; }
function available(row, d) { return row[COL[d].pkg] >= 0 || !!row[COL[d].alias]; }
function pick(v, d) { return v && typeof v === "object" && !Array.isArray(v) ? v[d] : v; }
function flagsOf(text) { return Array.from(text.matchAll(FLAG_RE), (m) => m[1].replace(/[.:]+$/, "")); }

async function copyText(text, button) {
  const status = $("#copyStatus");
  try {
    await navigator.clipboard.writeText(text);
    if (button) { const old = button.textContent; button.textContent = "복사됨"; setTimeout(() => { button.textContent = old; }, 1500); }
    status.textContent = "복사되었습니다.";
  } catch {
    status.textContent = "클립보드에 접근할 수 없습니다. 직접 선택해 복사하세요.";
    if (button) { const code = button.closest(".copyable")?.querySelector("code"); if (code) { const r = document.createRange(); r.selectNodeContents(code); const s = getSelection(); s.removeAllRanges(); s.addRange(r); } button.textContent = "직접 선택"; setTimeout(() => { button.textContent = "복사"; }, 1800); }
  }
}
function codeLine(text) {
  const btn = h("button", { class: "copy-button", type: "button" }, "복사");
  btn.addEventListener("click", () => copyText(text, btn));
  return h("div", { class: "command-line copyable" }, h("code", {}, text), btn);
}

/* ---------- routing ---------- */
function parseRoute() {
  const raw = location.hash.replace(/^#\/?/, "");
  const [path, query = ""] = raw.split("?");
  const parts = path.split("/").filter(Boolean).map(decodeURIComponent);
  return { name: parts[0] || "home", args: parts.slice(1), q: new URLSearchParams(query) };
}
function go(hash) { if (location.hash === hash) render(); else location.hash = hash; }

async function render() {
  const route = parseRoute();
  $$(".tab").forEach((t) => { const on = t.dataset.distro === state.distro; t.classList.toggle("is-active", on); t.setAttribute("aria-pressed", String(on)); });
  const nav = { home: "home", c: "all", all: "all", p: "all", x: "x", about: "about" }[route.name] || "home";
  $$(".topnav a").forEach((a) => a.classList.toggle("is-active", a.dataset.nav === nav));
  renderSidebar(route);
  if (route.name !== "home") searchInput.value = route.name === "all" ? (route.q.get("q") || "") : "";
  else if (document.activeElement !== searchInput) searchInput.value = route.q.get("q") || "";
  view.replaceChildren();
  try {
    if (route.name === "c") await viewCommand(route.args[0], route.q.get("from"));
    else if (route.name === "all") viewAll(route);
    else if (route.name === "p") viewPackage(route.args[0], route.args[1]);
    else if (route.name === "x") await viewExplain(route.q.get("q") || "");
    else if (route.name === "about") await viewAbout();
    else viewHome(route);
  } catch (err) {
    view.replaceChildren(h("div", { class: "notice warn" }, `화면을 그리지 못했습니다: ${err.message}`));
  }
  if (route.name !== "home" || !route.q.get("q")) { /* keep scroll on live search */ }
}

/* ---------- sidebar ---------- */
function renderSidebar(route) {
  const nav = $("#sideNav");
  const cat = route.name === "home" ? (route.q.get("cat") || "") : null;
  const counts = new Map();
  CUR.cards.forEach((c) => counts.set(c.topic, (counts.get(c.topic) || 0) + 1));
  const item = (label, count, href, active) => h("a", { class: "category-pill" + (active ? " is-active" : ""), href }, label, h("span", {}, String(count)));
  nav.replaceChildren(
    item("전체 운영 카드", CUR.cards.length, "#/", cat === ""),
    ...CUR.categories.filter((c) => counts.get(c.id)).map((c) => item(c.label, counts.get(c.id), `#/?cat=${c.id}`, cat === c.id)),
    h("div", { class: "side-sep" }, "공식 매뉴얼"),
    item("전체 명령어 색인", DB.cmds.length.toLocaleString(), "#/all", route.name === "all" || route.name === "c" || route.name === "p")
  );
  const m = DB.meta;
  $("#sideNote").replaceChildren(
    h("strong", {}, "데이터팩"), h("br"),
    `Rocky 9.6 · 패키지 ${m.distros.r.packages.toLocaleString()}개`, h("br"),
    `Ubuntu 22.04 · 패키지 ${m.distros.u.packages.toLocaleString()}개`, h("br"),
    `생성일 ${m.generated}`, h("br"), h("a", { href: "#/about" }, "출처와 한계 보기")
  );
}

/* ---------- search over the index ---------- */
function searchCommands(q, d, limit = 300) {
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  const scored = [];
  // Korean card matches lift their primary commands
  const cardBoost = new Map();
  CUR.cards.forEach((card) => {
    const hay = cardHaystack(card, d);
    if (terms.every((t) => hay.includes(t))) for (const id of card.cmds[d].primary) cardBoost.set(id, 1);
  });
  for (const row of DB.cmds) {
    const name = row[0].toLowerCase();
    const desc = row[2].toLowerCase();
    let score = 0, ok = true;
    for (const t of terms) {
      if (name === t) score += 100;
      else if (name.startsWith(t)) score += 60 - Math.min(20, name.length - t.length);
      else if (name.includes(t)) score += 30;
      else if (desc.includes(t)) score += 8;
      else { ok = false; break; }
    }
    const id = idOf(row);
    if (!ok) { if (cardBoost.has(id)) score = 20; else continue; }
    if (CUR.byCmd[id]) score += 15;
    if (!available(row, d)) score -= 25;
    scored.push([score, row]);
  }
  scored.sort((a, b) => b[0] - a[0] || a[1][0].length - b[1][0].length || (a[1][0] < b[1][0] ? -1 : 1));
  return scored.slice(0, limit).map((x) => x[1]);
}
function cardHaystack(card, d) {
  if (!card._hay) card._hay = {};
  if (!card._hay[d]) {
    const v = card[d];
    card._hay[d] = [pick(card.title, d), card.summary, pick(card.command, d), card.topic, ...(card.keywords || []), v.diff,
      ...v.options.map((o) => `${o.flag} ${o.desc}`), ...v.examples.map((e) => `${e.label} ${e.code}`), ...v.warnings,
      CUR.categories.find((c) => c.id === card.topic)?.label || ""].join(" ").toLowerCase();
  }
  return card._hay[d];
}

function commandRow(row) {
  const d = state.distro;
  const id = idOf(row);
  const target = row[COL[d].pkg] >= 0 ? id : row[COL[d].alias] || id;
  const badges = [];
  for (const x of ["r", "u"]) {
    if (row[COL[x].pkg] >= 0) badges.push(h("span", { class: `badge b-${x}`, title: `${DISTRO[x]} · ${DB.pkgs[x][row[COL[x].pkg]][0]}` }, SHORT[x]));
    else if (row[COL[x].alias]) badges.push(h("span", { class: `badge b-${x} is-alias`, title: `${DISTRO[x]}에서는 ${row[COL[x].alias]} 매뉴얼` }, `${SHORT[x]}→${row[COL[x].alias].replace(/\.\d$/, "")}`));
  }
  const n = row[COL[d].nopt] || (row[COL[d].alias] && byId.get(row[COL[d].alias])?.[COL[d].nopt]) || 0;
  const href = row[COL[d].pkg] >= 0 || !row[COL[d].alias] ? cmdHref(id) : `${cmdHref(target)}?from=${encodeURIComponent(id)}`;
  return h("a", { class: "cmd-row" + (available(row, d) ? "" : " is-missing"), href },
    h("span", { class: "cmd-name" }, row[0], h("small", {}, `(${row[1]})`)),
    h("span", { class: "cmd-desc" }, row[2] || "—"),
    h("span", { class: "cmd-meta" }, row[9] ? h("span", { class: "badge b-ex", title: "예시 있음" }, "예시") : null, CUR.ko[id] ? h("span", { class: "badge b-ko", title: "옵션 한국어 설명 있음" }, "한글") : null, ...badges,
      h("span", { class: "nopt", title: "매뉴얼에서 추출한 옵션 수" }, n ? `옵션 ${n}` : "")));
}

/* ---------- home: curated cards + search ---------- */
function viewHome(route) {
  const d = state.distro;
  const q = (route.q.get("q") || "").trim();
  const cat = route.q.get("cat") || "";
  const scen = route.q.get("s") || "";
  const m = DB.meta;

  if (!q && !cat && !scen) {
    view.append(h("section", { class: "intro" },
      h("h1", {}, "리눅스 운영 명령어"),
      h("p", { class: "lede" }, "Rocky Linux 9.6과 Ubuntu 22.04 공식 패키지의 man 페이지에서 뽑은 옵션 표입니다. 옵션을 검색하고, 배포판 차이를 확인하세요."),
      h("p", { class: "scope-note" }, `명령어 ${DB.cmds.length.toLocaleString()}개 · 운영 카드 ${CUR.cards.length}개`,
        h("span", {}, `패키지 원본을 SHA-256으로 검증해 추출 · ${m.generated} 생성`))));
  }
  const scenBox = h("div", { class: "quick-access" }, h("span", {}, "빠른 점검"),
    h("div", { class: "scenario-grid" }, CUR.scenarios.map((s) =>
      h("a", { class: "scenario-card" + (scen === s.id ? " is-active" : ""), href: scen === s.id ? "#/" : `#/?s=${s.id}`, title: s.note }, s.label))));
  view.append(scenBox);

  if (q) {
    const rows = searchCommands(q, d);
    const sec = h("section", { class: "result-block" },
      h("div", { class: "section-head" }, h("h2", {}, "명령어"), h("span", { class: "result-count" }, rows.length >= 300 ? "300개 이상 — 검색어를 좁혀 보세요" : `${rows.length}개`)));
    if (rows.length) sec.append(h("div", { class: "cmd-list" }, rows.slice(0, 60).map(commandRow)));
    else sec.append(h("p", { class: "empty" }, "일치하는 명령어가 없습니다."));
    if (rows.length > 60) {
      const more = h("button", { class: "button", type: "button" }, `나머지 ${rows.length - 60}개 더 보기`);
      more.addEventListener("click", () => { more.replaceWith(h("div", { class: "cmd-list" }, rows.slice(60).map(commandRow))); });
      sec.append(more);
    }
    view.append(sec);
  }

  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  const scenario = CUR.scenarios.find((s) => s.id === scen);
  const cards = CUR.cards.filter((c) => (!cat || c.topic === cat) && (!scenario || scenario.ids.includes(c.id)) &&
    (!terms.length || terms.every((t) => cardHaystack(c, d).includes(t))));
  const title = scenario ? scenario.label : cat ? CUR.categories.find((c) => c.id === cat)?.label : q ? "운영 카드" : "운영 카드 전체";
  const head = h("div", { class: "section-head list-heading" }, h("div", {}, h("h2", {}, title), h("span", { class: "result-count" }, `${cards.length}개 · ${DISTRO[d]} 기준`)),
    (q || cat || scen) ? h("a", { class: "button", href: "#/" }, "초기화") : null);
  const wrap = h("section", {}, head);
  if (!cards.length) wrap.append(h("p", { class: "empty" }, q ? "일치하는 운영 카드가 없습니다. 위의 명령어 결과에서 공식 매뉴얼을 확인하세요." : "카드가 없습니다."));
  const groups = new Map();
  cards.forEach((c) => { if (!groups.has(c.topic)) groups.set(c.topic, []); groups.get(c.topic).push(c); });
  CUR.categories.forEach((c) => {
    const items = groups.get(c.id);
    if (!items) return;
    wrap.append(h("section", { class: "command-section" },
      h("div", { class: "command-section-head" }, h("h3", {}, c.label), h("span", { class: "result-count" }, `${items.length}개`)),
      h("div", {}, items.map((card) => renderCard(card, d, false)))));
  });
  view.append(wrap);
}

function optionItems(card, d) {
  return card[d].options.map((o) => h("div", { class: "option-item" },
    h("strong", {}, o.flag),
    h("span", {}, o.desc, o.ok ? h("a", { class: "verified", href: cmdHref(o.ok), title: `공식 매뉴얼(${o.ok})의 옵션 목록에서 확인됨` }, "매뉴얼 확인") : null)));
}
function renderCard(card, d, open) {
  const v = card[d];
  const links = card.cmds[d].primary.map((id) => h("a", { class: "man-link", href: cmdHref(id) }, h("span", { class: "mono" }, id.replace(/\.\d$/, "")), " 전체 옵션", h("span", { "aria-hidden": "true" }, " →")));
  const related = card.cmds[d].related.slice(0, 12).map((id) => h("a", { href: cmdHref(id) }, id.replace(/\.\d$/, "")));
  return h("article", { class: "command-card", id: `card-${card.id}` },
    h("div", { class: "card-head" }, h("div", {}, h("h3", {}, pick(card.title, d)), h("p", { class: "summary" }, card.summary))),
    codeLine(pick(card.command, d)),
    links.length ? h("div", { class: "man-links" }, links) : null,
    h("details", { class: "command-details", open },
      h("summary", {}, "자주 쓰는 옵션 · 예시 · 주의사항"),
      h("div", { class: "details-grid" },
        h("div", { class: "detail-block" }, h("div", { class: "block-head" }, h("strong", {}, "자주 쓰는 옵션")), h("div", { class: "option-list" }, optionItems(card, d))),
        h("div", { class: "detail-block" }, h("div", { class: "block-head" }, h("strong", {}, "실전 예시")),
          h("div", { class: "example-list" }, v.examples.map((e) => h("div", { class: "example-item" }, h("strong", {}, e.label), codeLine(e.code))))),
        h("div", { class: "detail-block detail-wide" }, h("div", { class: "block-head" }, h("strong", {}, "Rocky / Ubuntu 차이")), h("div", { class: "diff-row" }, v.diff)),
        h("div", { class: "detail-block detail-wide warning-block" }, h("div", { class: "block-head" }, h("strong", {}, "주의점")), h("ul", { class: "warning-list" }, v.warnings.map((w) => h("li", {}, w)))),
        related.length ? h("div", { class: "detail-block detail-wide related" }, h("strong", {}, "함께 쓰는 명령어 "), related) : null)));
}

/* ---------- all commands (A–Z) ---------- */
function viewAll(route) {
  const d = state.distro;
  const q = (route.q.get("q") || "").trim();
  const letter = route.q.get("l") || (q ? "" : "a");
  const only = route.q.get("only") === "1";
  const letters = "abcdefghijklmnopqrstuvwxyz".split("").concat(["0-9"]);
  const inLetter = (row, l) => (l === "0-9" ? !/^[a-z]/i.test(row[0]) : row[0].toLowerCase().startsWith(l));
  let rows = q ? searchCommands(q, d, 2000) : DB.cmds.filter((r) => inLetter(r, letter));
  if (only) rows = rows.filter((r) => available(r, d));
  const qs = (l) => `#/all?l=${l}${only ? "&only=1" : ""}`;
  view.append(
    h("div", { class: "breadcrumb" }, "공식 매뉴얼 / 전체 명령어 색인"),
    h("section", { class: "intro" }, h("h1", {}, "전체 명령어"),
      h("p", { class: "lede" }, `두 배포판의 공식 패키지에 들어 있는 man 페이지(1·8절) ${DB.cmds.length.toLocaleString()}개입니다. 위 검색창에 이름이나 설명(영문)을 입력하면 전체에서 찾습니다.`)),
    h("div", { class: "az" }, letters.map((l) => h("a", { class: l === letter ? "is-active" : "", href: qs(l) }, l.toUpperCase())),
      h("a", { class: "az-toggle" + (only ? " is-active" : ""), href: `#/all?${q ? `q=${encodeURIComponent(q)}` : `l=${letter}`}${only ? "" : "&only=1"}` }, `${SHORT[d]}에 있는 것만`)),
    h("div", { class: "section-head" }, h("h2", {}, q ? `“${q}” 검색 결과` : letter.toUpperCase()), h("span", { class: "result-count" }, `${rows.length.toLocaleString()}개`)),
    rows.length ? h("div", { class: "cmd-list" }, rows.slice(0, 1500).map(commandRow)) : h("p", { class: "empty" }, "일치하는 명령어가 없습니다."));
}

function viewPackage(d, name) {
  d = d === "u" ? "u" : "r";
  const pi = DB.pkgs[d].findIndex((p) => p[0] === name);
  if (pi < 0) { view.append(h("div", { class: "notice warn" }, "패키지를 찾을 수 없습니다.")); return; }
  const p = DB.pkgs[d][pi];
  const rows = DB.cmds.filter((r) => r[COL[d].pkg] === pi);
  view.append(
    h("div", { class: "breadcrumb" }, h("a", { href: "#/all" }, "전체 명령어"), ` / ${DISTRO[d]} 패키지`),
    h("section", { class: "intro" }, h("h1", { class: "mono" }, p[0]), h("p", { class: "lede" }, p[3] || ""),
      h("p", { class: "scope-note" }, `${DISTRO[d]} · ${p[2]} · 버전 ${p[1]} · 매뉴얼 ${rows.length}개`)),
    h("div", { class: "cmd-list" }, rows.map(commandRow)));
}

/* ---------- command page ---------- */
function parseOptions(secs) {
  // options/subcommands are marked by the build as <dt data-o> / <dt data-c>
  const box = document.createElement("div");
  const out = { opts: [], cmds: [], byFlag: new Map() };
  secs.forEach(([title, html], si) => {
    box.innerHTML = html;
    $$("dt[data-o],dt[data-c]", box).forEach((dt) => {
      const labels = [dt];
      let n = dt.nextElementSibling;
      while (n && n.tagName === "DT") { labels.push(n); n = n.nextElementSibling; }
      const entry = { label: labels.map((x) => x.textContent.trim()).join(", "), labelHtml: labels.map((x) => x.innerHTML).join(", "),
        desc: n && n.tagName === "DD" ? n.innerHTML : "", text: n && n.tagName === "DD" ? n.textContent : "",
        group: dt.dataset.g || title, sec: si };
      if (dt.hasAttribute("data-o")) {
        // italic runs are option arguments (-b<i>n</i>): keep them apart from the flag itself
        const probe = document.createElement("span");
        probe.innerHTML = labels.map((x) => x.innerHTML).join(" , ").replace(/<\/?i>/g, " ");
        entry.flags = flagsOf(probe.textContent);
        entry.flags.forEach((f) => { if (!out.byFlag.has(f)) out.byFlag.set(f, entry); });
        out.opts.push(entry);
      } else out.cmds.push(entry);
    });
  });
  return out;
}

/** tldr command template -> DOM with editable placeholders:  tar xf {{path}} {{[-C|--directory]}} {{dir}} */
function exampleLine(tpl) {
  const code = h("code", {});
  tpl.split(/(\{\{.*?\}\})/).forEach((part) => {
    const m = part.match(/^\{\{(.*)\}\}$/);
    if (!m) { code.append(part); return; }
    const alt = m[1].match(/^\[(.+?)\|(.+?)\]$/);
    if (alt) { code.append(h("span", { class: "ph-opt", title: `${alt[1]} 와 같음` }, alt[2])); return; }
    const ph = h("span", { class: "ph", contenteditable: "plaintext-only", spellcheck: "false", title: "값을 직접 고쳐 쓸 수 있습니다" }, m[1]);
    if (ph.contentEditable !== "plaintext-only") ph.contentEditable = "true";
    ph.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); ph.blur(); } });
    code.append(ph);
  });
  const btn = h("button", { class: "copy-button", type: "button" }, "복사");
  btn.addEventListener("click", () => copyText(code.textContent, btn));
  return h("div", { class: "command-line copyable" }, code, btn);
}

async function viewCommand(id, from) {
  const row = byId.get(id);
  if (!row) { view.append(h("div", { class: "notice warn" }, `“${id}” 매뉴얼은 데이터팩에 없습니다. `, h("a", { href: `#/all?q=${encodeURIComponent(id.replace(/\.\d$/, ""))}` }, "전체에서 검색"))); return; }
  let d = state.distro;
  // reached through an alias (awk): follow it again when the distro changes (gawk on Rocky, mawk on Ubuntu)
  const origin = from && from !== id ? byId.get(from) : null;
  if (origin && origin[COL[d].alias] && origin[COL[d].alias] !== id && byId.has(origin[COL[d].alias])) {
    const t = origin[COL[d].alias];
    history.replaceState(null, "", `${cmdHref(t)}?from=${encodeURIComponent(from)}`); return viewCommand(t, from);
  }
  if (row[COL.r.pkg] < 0 && row[COL.u.pkg] < 0) {   // pure alias row
    const t = row[COL[d].alias] || row[COL.r.alias] || row[COL.u.alias];
    history.replaceState(null, "", `${cmdHref(t)}?from=${encodeURIComponent(id)}`); return viewCommand(t, id);
  }
  view.append(h("p", { class: "loading" }, "매뉴얼을 불러오는 중…"));
  const tldrId = [id, from].find((x) => x && byId.get(x)?.[9]);
  const [doc, tldr] = await Promise.all([loadDoc(id), tldrId ? fetch(tldrUrl(tldrId)).then((r) => (r.ok ? r.json() : null)).catch(() => null) : null]);
  view.replaceChildren();
  const other = d === "r" ? "u" : "r";
  const notices = [];
  let shown = d;
  if (!doc.src[d]) {
    shown = other;
    const alias = doc.alias?.[d];
    notices.push(h("div", { class: "notice" }, `${DISTRO[d]} 데이터팩에는 ${row[0]}(${row[1]}) 매뉴얼이 없습니다. `,
      alias ? h("span", {}, "이 배포판에서는 ", h("a", { href: cmdHref(alias) }, alias.replace(/\.(\d)$/, "($1)")), " 매뉴얼이 같은 이름으로 연결됩니다. ") : "수집 범위 밖의 패키지이거나 이 배포판에 없는 도구입니다. ",
      `아래는 ${DISTRO[other]} 매뉴얼입니다.`));
  }
  const src = doc.src[shown];
  const secs = sectionsFor(doc, shown);
  const parsed = parseOptions(secs);
  const fromRow = from && from !== id ? byId.get(from) : null;
  const name = fromRow ? fromRow[0] : row[0];
  if (fromRow) notices.unshift(h("div", { class: "notice" }, h("strong", {}, `${fromRow[0]}`), ` 는 ${DISTRO[d]} 에서 `, h("strong", {}, `${row[0]}`), ` 로 제공됩니다. 아래는 ${row[0]}(${row[1]}) 매뉴얼의 옵션입니다.`));

  /* header */
  view.append(
    h("div", { class: "breadcrumb" }, h("a", { href: "#/all" }, "전체 명령어"), " / ", h("a", { href: `#/p/${shown}/${encodeURIComponent(src.pkg)}` }, src.pkg), ` / ${name}`),
    h("section", { class: "intro cmd-intro" },
      h("h1", { class: "mono" }, name, h("small", {}, `(${row[1]})`), fromRow ? h("span", { class: "alias-of" }, `= ${row[0]}`) : null),
      h("p", { class: "lede" }, doc.desc || ""),
      h("dl", { class: "prov" }, ["r", "u"].map((x) => {
        const s = doc.src[x];
        if (!s) return [h("dt", {}, DISTRO[x]), h("dd", { class: "muted" }, doc.alias?.[x] ? h("a", { href: cmdHref(doc.alias[x]) }, `${doc.alias[x]} 로 제공`) : "매뉴얼 없음")];
        return [h("dt", { class: x === shown ? "is-shown" : "" }, DISTRO[x]),
          h("dd", {}, h("a", { href: `#/p/${x}/${encodeURIComponent(s.pkg)}` }, s.pkg), ` ${s.ver} · ${s.repo} · `,
            h("a", { href: s.url, rel: "noopener", target: "_blank", title: `SHA-256 ${s.sha256}` }, "원본 패키지 ↗"),
            h("span", { class: "muted" }, ` ${s.path}`))];
      }))),
    ...notices);

  /* builder */
  const picked = [];
  const builderCode = h("code", {}, name);
  const builder = h("div", { class: "builder copyable" }, h("span", { class: "builder-label" }, "조합"), builderCode,
    h("button", { class: "copy-button", type: "button", onclick: (e) => copyText(builderCode.textContent, e.currentTarget) }, "복사"),
    h("button", { class: "copy-button", type: "button", onclick: () => { picked.length = 0; syncBuilder(); } }, "비우기"));
  function syncBuilder() {
    builderCode.textContent = [name, ...picked].join(" ");
    builder.classList.toggle("has-items", picked.length > 0);
    $$(".opt-flag", view).forEach((b) => b.classList.toggle("is-picked", picked.includes(b.dataset.flag)));
  }
  function toggleFlag(f) { const i = picked.indexOf(f); if (i >= 0) picked.splice(i, 1); else picked.push(f); syncBuilder(); }

  /* in-page nav */
  const jump = h("nav", { class: "jump", "aria-label": "이 페이지에서" },
    h("a", { href: "#synopsis", "data-jump": "synopsis" }, "사용 형식"),
    h("a", { href: "#examples", "data-jump": "examples" }, "예시"),
    h("a", { href: "#options", "data-jump": "options" }, `전체 옵션 ${parsed.opts.length || ""}`),
    parsed.cmds.length ? h("a", { href: "#subcommands", "data-jump": "subcommands" }, `하위 명령 ${parsed.cmds.length}`) : null,
    null);
  jump.addEventListener("click", (e) => { const a = e.target.closest("a[data-jump]"); if (!a) return; e.preventDefault(); document.getElementById(a.dataset.jump)?.scrollIntoView({ behavior: "smooth", block: "start" }); });
  view.append(jump);

  /* synopsis */
  const syn = secs.find(([t]) => /^SYNOPSIS|^SYNTAX|^USAGE/i.test(t));
  if (syn) view.append(h("section", { class: "block", id: "synopsis" }, h("h2", {}, "사용 형식"), h("div", { class: "man synopsis", html: syn[1] })));

  /* examples: the manual's own EXAMPLES section, then community examples */
  const exSec = secs.find(([t]) => /^EXAMPLES?$/i.test(t));
  const exBlock = h("section", { class: "block", id: "examples" }, h("h2", {}, "예시"));
  if (exSec) exBlock.append(h("details", { class: "man-sec ex-official", open: exSec[1].length < 9000 }, h("summary", {}, `공식 매뉴얼의 EXAMPLES 절 · ${DISTRO[shown]}`), h("div", { class: "man", html: exSec[1] })));
  if (tldr) {
    exBlock.append(h("div", { class: "tldr" },
      h("p", { class: "tldr-head" }, h("strong", {}, "커뮤니티 예시"), " · ", h("a", { href: tldr.source, target: "_blank", rel: "noopener" }, `tldr-pages ${tldr.version}`), " (CC BY 4.0) — 공식 문서가 아니며 배포판 버전에 맞춰 검증된 것은 아닙니다. 밑줄 친 값은 눌러서 고친 뒤 복사할 수 있습니다."),
      tldr.items.map(([label, tpl], i) => h("div", { class: "example-item" }, h("strong", {}, h("span", { class: "ex-num" }, String(i + 1)), label), exampleLine(tpl)))));
  }
  if (!exSec && !tldr) exBlock.append(h("p", { class: "muted small-note" }, "이 매뉴얼에는 EXAMPLES 절이 없고, 연결된 커뮤니티 예시도 없습니다."));
  view.append(exBlock);

  /* distro diff */
  if (doc.src.r && doc.src.u) {
    const body = doc.same
      ? h("p", {}, `두 배포판의 매뉴얼 본문이 동일합니다 (Rocky ${doc.src.r.ver} / Ubuntu ${doc.src.u.ver}).`)
      : h("div", {},
        h("p", {}, `매뉴얼 본문이 다릅니다 (Rocky ${doc.src.r.ver} / Ubuntu ${doc.src.u.ver}). `,
          (doc.diff.r.length || doc.diff.u.length) ? "옵션 목록에서 한쪽에만 있는 항목:" : "추출된 옵션 목록은 같고, 설명 문구만 다릅니다."),
        ["r", "u"].map((x) => doc.diff[x].length ? h("p", { class: "diff-flags" }, h("span", { class: `badge b-${x}` }, `${SHORT[x]}에만`), doc.diff[x].map((f) => h("code", {}, f))) : null));
    view.append(h("section", { class: "block diff-block" }, h("h2", {}, "배포판 차이"), body));
  }

  /* options */
  const only = new Set(doc.same === false ? doc.diff[shown] : []);
  if (parsed.opts.length) {
    const filter = h("input", { type: "search", class: "opt-filter", placeholder: "옵션 필터 — 예: -r, recursive, 압축", "aria-label": "옵션 필터", spellcheck: "false" });
    const count = h("span", { class: "result-count" });
    const list = h("div", { class: "opt-table" });
    const rowsEl = [];
    let group = null;
    parsed.opts.forEach((o) => {
      if (o.group !== group) { group = o.group; const gh = h("h3", { class: "opt-group" }, group); list.append(gh); rowsEl.push({ head: gh, items: [] }); }
      const hint = koHint(id, o);
      const flagBtns = o.flags.length ? o.flags.map((f) => h("button", { class: "opt-flag", type: "button", "data-flag": f, title: "조합에 추가", onclick: () => toggleFlag(f) }, f)) : [];
      const el = h("div", { class: "opt-row" + (hint ? " has-ko" : "") },
        h("div", { class: "opt-term" }, h("div", { class: "opt-label", html: o.labelHtml }), h("div", { class: "opt-flags" }, flagBtns),
          o.flags.some((f) => only.has(f)) ? h("span", { class: `badge b-${shown}` }, `${SHORT[shown]}에만`) : null),
        h("div", { class: "opt-desc" }, hint ? h("p", { class: "ko-hint" }, hint) : null, h("div", { class: "man orig", html: o.desc })));
      list.append(el);
      rowsEl[rowsEl.length - 1].items.push({ el, hay: `${o.label} ${o.text} ${hint || ""}`.toLowerCase() });
    });
    const apply = () => {
      const terms = filter.value.toLowerCase().split(/\s+/).filter(Boolean);
      let n = 0;
      rowsEl.forEach((g) => {
        let any = false;
        g.items.forEach((it) => { const ok = terms.every((t) => it.hay.includes(t)); it.el.hidden = !ok; if (ok) { any = true; n += 1; } });
        g.head.hidden = !any;
      });
      count.textContent = terms.length ? `${n} / ${parsed.opts.length}개` : `${parsed.opts.length}개 · ${DISTRO[shown]} 매뉴얼 원문`;
    };
    filter.addEventListener("input", apply);
    view.append(h("section", { class: "block", id: "options" },
      h("div", { class: "section-head" }, h("h2", {}, "전체 옵션"), count),
      doc.miss?.[shown] ? h("details", { class: "unlisted" }, h("summary", {}, `표에 따로 항목이 없는 표기 ${doc.miss[shown].length}개`),
        h("p", {}, "매뉴얼 어딘가에 굵게 적혀 있지만 옵션 목록에는 독립 항목이 없는 표기입니다. 대개 사용 형식에만 나오는 긴 이름(별칭), 다른 옵션 설명 안에서 언급되는 하위 옵션, 예시 값입니다. 쓰기 전에 서버에서 --help 로 확인하세요."),
        h("p", { class: "diff-flags" }, doc.miss[shown].map((f) => h("code", {}, f)))) : null,
      h("div", { class: "opt-tools" }, filter), builder, list));
    apply();
  } else {
    view.append(h("section", { class: "block", id: "options" }, h("h2", {}, "전체 옵션"),
      h("div", { class: "notice" }, "이 매뉴얼에는 목록 형식의 옵션이 없습니다(옵션이 없는 명령이거나 본문 문장으로만 설명). 아래 설명 원문을 확인하세요.")));
  }

  /* subcommands */
  if (parsed.cmds.length) {
    view.append(h("section", { class: "block", id: "subcommands" }, h("div", { class: "section-head" }, h("h2", {}, "하위 명령"), h("span", { class: "result-count" }, `${parsed.cmds.length}개`)),
      h("div", { class: "opt-table" }, parsed.cmds.map((c) => h("div", { class: "opt-row" }, h("div", { class: "opt-term" }, h("div", { class: "opt-label", html: c.labelHtml })), h("div", { class: "opt-desc" }, h("div", { class: "man", html: c.desc })))))));
  }

  /* manuals without an option list: show their descriptive sections instead of an empty page */
  if (!parsed.opts.length) {
    const body = secs.filter(([t]) => !/^(NAME|SYNOPSIS|SYNTAX|USAGE|EXAMPLES?|AUTHORS?|COPYRIGHT|LICEN[CS]E|SEE ALSO|REPORTING BUGS|BUGS|HISTORY|AVAILABILITY|COLOPHON)$/i.test(t));
    if (body.length) view.append(h("section", { class: "block", id: "manual" }, h("div", { class: "section-head" }, h("h2", {}, "설명"),
      h("span", { class: "result-count" }, `${DISTRO[shown]} 매뉴얼 원문`)),
      body.map(([t, html]) => h("details", { class: "man-sec", open: body.length <= 3 || /^(DESCRIPTION|OPTIONS?)$/i.test(t) }, h("summary", {}, t || "(머리말)"), h("div", { class: "man", html })))));
  }
  document.title = `${name}(${row[1]}) — Linux Ops Manual`;
}

/* ---------- explain a command line ---------- */
function tokenize(line) {
  const out = []; let cur = "", q = null, any = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) { if (c === q) q = null; else if (c === "\\" && q === '"' && i + 1 < line.length) cur += line[++i]; else cur += c; continue; }
    if (c === "'" || c === '"') { q = c; any = true; continue; }
    if (c === "\\" && i + 1 < line.length) { cur += line[++i]; continue; }
    if (/\s/.test(c)) { if (cur || any) out.push({ t: cur, quoted: any }); cur = ""; any = false; continue; }
    const two = line.slice(i, i + 2);
    if (two === "&&" || two === "||") { if (cur || any) out.push({ t: cur, quoted: any }); out.push({ op: two }); cur = ""; any = false; i++; continue; }
    if (c === "|" || c === ";") { if (cur || any) out.push({ t: cur, quoted: any }); out.push({ op: c }); cur = ""; any = false; continue; }
    cur += c;
  }
  if (cur || any) out.push({ t: cur, quoted: any });
  return out;
}
const OPS = { "|": "앞 명령의 표준 출력을 뒤 명령의 표준 입력으로 연결", "&&": "앞 명령이 성공(종료 코드 0)하면 뒤 명령 실행", "||": "앞 명령이 실패하면 뒤 명령 실행", ";": "앞 명령의 결과와 무관하게 이어서 실행" };

async function explainSegment(tokens, d) {
  const rows = [];
  let i = 0;
  while (i < tokens.length && /^[A-Za-z_][A-Za-z0-9_]*=/.test(tokens[i].t) && !tokens[i].quoted) rows.push({ tok: tokens[i++].t, kind: "env", text: "이 명령에만 적용되는 환경 변수 지정" });
  if (i >= tokens.length) return { rows };
  let name = tokens[i].t.replace(/^.*\//, "");
  let id = resolveName(name, d);
  rows.push({ tok: tokens[i].t, kind: "cmd", id, text: id ? (byId.get(id)?.[2] || "") : null });
  i++;
  if (!id) { for (; i < tokens.length; i++) rows.push({ tok: tokens[i].t, kind: "arg" }); return { rows, unknown: true }; }
  let parsed = parseOptions(sectionsFor(await loadDoc(id), d) || sectionsFor(await loadDoc(id), d === "r" ? "u" : "r"));
  let sub = false;
  for (; i < tokens.length; i++) {
    const { t, quoted } = tokens[i];
    if (!quoted && t === "--") { rows.push({ tok: t, kind: "note", text: "옵션의 끝 — 이후는 모두 인자로 취급" }); for (i++; i < tokens.length; i++) rows.push({ tok: tokens[i].t, kind: "arg" }); break; }
    if (!quoted && /^-/.test(t) && t.length > 1) {
      const key = t.startsWith("--") ? t.split("=")[0] : t;
      let o = parsed.byFlag.get(key) || parsed.byFlag.get(t.split("=")[0]);
      if (o) { rows.push({ tok: t, kind: "opt", o, id }); continue; }
      if (!t.startsWith("--") && t.length > 2) {   // -alh  => -a -l -h   (or -n5 => -n with value)
        const parts = [];
        for (let k = 1; k < t.length; k++) {
          const f = parsed.byFlag.get("-" + t[k]);
          if (!f) { parts.push({ tok: t.slice(k), kind: parts.length ? "val" : "miss" }); break; }
          parts.push({ tok: "-" + t[k], kind: "opt", o: f, id });
        }
        if (parts[0]?.kind === "opt") { rows.push({ tok: t, kind: "combo", parts }); continue; }
      }
      rows.push({ tok: t, kind: "miss" });
      continue;
    }
    if (!sub && !quoted && /^[a-z][\w-]*$/i.test(t)) {
      // sub-command with its own manual page (git commit -> git-commit, ip addr -> ip-address) or listed in this one
      const subId = resolveName(`${name}-${t}`, d) || DB.cmds.filter((r) => r[0].startsWith(`${name}-${t}`) && available(r, d)).map(idOf).sort((a, b) => a.length - b.length)[0];
      const listed = parsed.cmds.find((c) => c.label.split(/[\s,\[|]/)[0] === t);
      if (subId && (resolveName(`${name}-${t}`, d) || t.length >= 3)) {
        sub = true; rows.push({ tok: t, kind: "sub", id: subId, text: byId.get(subId)?.[2] || "" });
        const sdoc = await loadDoc(subId);
        const sp = parseOptions(sectionsFor(sdoc, d) || sectionsFor(sdoc, d === "r" ? "u" : "r"));
        sp.byFlag.forEach((v, k) => { if (!parsed.byFlag.has(k)) parsed.byFlag.set(k, v); });
        const merged = new Map(sp.byFlag); parsed.byFlag.forEach((v, k) => { if (!merged.has(k)) merged.set(k, v); });
        parsed = { ...parsed, byFlag: merged }; id = subId; name = `${name}-${t}`;
        continue;
      }
      if (listed) { sub = true; rows.push({ tok: t, kind: "sub", o: listed }); continue; }
    }
    rows.push({ tok: t, kind: "arg" });
  }
  return { rows };
}

async function viewExplain(q) {
  const d = state.distro;
  const input = h("textarea", { class: "explain-input", rows: "2", spellcheck: "false", placeholder: "예: tar -xzvf backup.tar.gz -C /srv && journalctl -u nginx --since today -p err" }, q);
  const run = () => go(`#/x?q=${encodeURIComponent(input.value.trim())}`);
  input.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); run(); } });
  const samples = ["tar -xzvf backup.tar.gz -C /srv", "find /var/log -type f -mtime +7 -name '*.log' -delete", "rsync -avz --delete /data/ backup:/data/", "ss -tulpn | grep :443", "journalctl -u nginx --since today -p err"];
  view.append(
    h("div", { class: "breadcrumb" }, "도구 / 명령줄 해설"),
    h("section", { class: "intro" }, h("h1", {}, "명령줄 해설"),
      h("p", { class: "lede" }, `명령줄을 붙여 넣으면 각 옵션을 ${DISTRO[d]} 공식 매뉴얼의 설명과 대조합니다. 실행하지 않고 문서만 찾아봅니다.`)),
    h("div", { class: "explain-form" }, input, h("button", { class: "button primary", type: "button", onclick: run }, "해설")),
    h("div", { class: "quick-access" }, h("span", {}, "예시"), h("div", { class: "scenario-grid" }, samples.map((s) => h("a", { class: "scenario-card mono", href: `#/x?q=${encodeURIComponent(s)}` }, s)))));
  if (!q.trim()) return;
  const toks = tokenize(q);
  const segs = [[]]; const ops = [];
  toks.forEach((t) => { if (t.op) { ops.push(t.op); segs.push([]); } else segs[segs.length - 1].push(t); });
  const out = h("div", { class: "explain-out" });
  view.append(out);
  for (let s = 0; s < segs.length; s++) {
    let seg = segs[s];
    const pre = [];
    while (seg.length && ["sudo", "time", "nohup"].includes(seg[0].t) && !seg[0].quoted) {
      const w = seg[0].t; const wid = resolveName(w, d);
      pre.push(h("div", { class: "ex-row" }, h("code", { class: "ex-tok k-cmd" }, w), h("div", {}, wid ? h("a", { href: cmdHref(wid) }, `${w} — ${byId.get(wid)?.[2] || ""}`) : w)));
      seg = seg.slice(1);
      while (w === "sudo" && seg.length && /^-/.test(seg[0].t)) { pre.push(h("div", { class: "ex-row" }, h("code", { class: "ex-tok" }, seg[0].t), h("div", { class: "muted" }, "sudo의 옵션 — sudo 매뉴얼을 확인하세요"))); seg = seg.slice(1); }
    }
    const { rows, unknown } = await explainSegment(seg, d);
    const optCell = (r) => h("div", {}, h("div", { class: "ex-label", html: r.o.labelHtml }), koHint(r.id, r.o) ? h("p", { class: "ko-hint" }, koHint(r.id, r.o)) : null, h("div", { class: "man clamp", html: r.o.desc }));
    const box = h("div", { class: "ex-seg" }, ...pre, rows.map((r) => {
      let cell;
      if (r.kind === "cmd") cell = r.id ? h("div", {}, h("a", { href: cmdHref(r.id) }, `${r.id.replace(/\.(\d)$/, "($1)")} 매뉴얼`), ` — ${r.text}`) : h("div", { class: "miss" }, `${DISTRO[d]} 데이터팩에서 이 명령의 매뉴얼을 찾지 못했습니다 (셸 내장 명령이거나 수집 범위 밖).`);
      else if (r.kind === "opt") cell = optCell(r);
      else if (r.kind === "combo") cell = h("div", { class: "ex-combo" }, h("p", { class: "muted" }, "짧은 옵션을 붙여 쓴 형태로 해석했습니다."), r.parts.map((p) => h("div", { class: "ex-row" }, h("code", { class: `ex-tok k-${p.kind}` }, p.tok), p.kind === "opt" ? optCell(p) : h("div", { class: p.kind === "val" ? "muted" : "miss" }, p.kind === "val" ? "앞 옵션의 값(또는 매뉴얼 목록에 없는 문자)" : "매뉴얼 옵션 목록에서 찾지 못함"))));
      else if (r.kind === "sub") cell = r.id ? h("div", {}, "하위 명령 — ", h("a", { href: cmdHref(r.id) }, `${r.id.replace(/\.(\d)$/, "($1)")} 매뉴얼`), ` — ${r.text}`) : h("div", {}, h("div", { class: "ex-label", html: r.o.labelHtml }), h("div", { class: "man clamp", html: r.o.desc }));
      else if (r.kind === "miss") cell = h("div", { class: "miss" }, "매뉴얼의 옵션 목록에서 찾지 못했습니다. 오타이거나, 목록 형식이 아닌 본문에만 설명된 옵션일 수 있습니다.");
      else if (r.kind === "env" || r.kind === "note") cell = h("div", { class: "muted" }, r.text);
      else cell = h("div", { class: "muted" }, unknown ? "" : "인자 (대상·값). 바로 앞 옵션의 값일 수 있습니다.");
      return h("div", { class: "ex-row" }, h("code", { class: `ex-tok k-${r.kind}` }, r.tok), cell);
    }));
    out.append(box);
    if (ops[s]) out.append(h("div", { class: "ex-op" }, h("code", {}, ops[s]), OPS[ops[s]]));
  }
  out.append(h("p", { class: "muted small" }, "해설은 매뉴얼의 옵션 목록과 글자 그대로 대조한 결과입니다. 값을 받는 옵션과 인자의 경계, 셸 확장($VAR, 글로브, 리다이렉션)은 해석하지 않습니다."));
}

/* ---------- about ---------- */
async function viewAbout() {
  const m = DB.meta;
  const cov = await fetch("./data/coverage.json").then((r) => r.json()).catch(() => null);
  const c = m.counts;
  const li = (...x) => h("li", {}, ...x);
  view.append(
    h("div", { class: "breadcrumb" }, "문서 / 데이터 출처"),
    h("section", { class: "intro" }, h("h1", {}, "데이터 출처와 한계"), h("p", { class: "lede" }, "이 사이트의 옵션·설명은 사람이 옮겨 적은 것이 아니라, 배포판 공식 저장소의 패키지에서 꺼낸 man 페이지 원문입니다.")),
    h("section", { class: "block prose" }, h("h2", {}, "어디서 가져왔나"),
      h("ul", {},
        li(h("strong", {}, "Rocky Linux 9.6"), ` — ${m.sources.r} · 패키지 ${m.distros.r.packages.toLocaleString()}개 · 매뉴얼 ${m.distros.r.pages.toLocaleString()}개`),
        li(h("strong", {}, "Ubuntu 22.04 LTS"), ` — ${m.sources.u} · 패키지 ${m.distros.u.packages.toLocaleString()}개 · 매뉴얼 ${m.distros.u.pages.toLocaleString()}개`),
        li("범위는 man 1절(사용자 명령)과 8절(관리 명령)입니다. 설정 파일 형식(5절)·개념(7절)·라이브러리(3절)는 포함하지 않습니다."),
        li("각 패키지 파일은 저장소 색인에 적힌 SHA-256과 대조한 뒤에만 사용했습니다. 명령어 페이지의 “원본 패키지” 링크와 ", h("a", { href: "./data/manifest.json" }, "manifest.json"), "에서 패키지·버전·해시를 확인할 수 있습니다."),
        li("roff 원문은 mandoc으로 변환했고, 본문 문장은 번역·요약·수정하지 않았습니다. 그래서 옵션 설명은 영어입니다."))),
    h("section", { class: "block prose" }, h("h2", {}, "숫자"),
      h("ul", {},
        li(`명령어(매뉴얼 이름) ${DB.cmds.length.toLocaleString()}개 — 본문 ${c.files.toLocaleString()}개, 다른 매뉴얼로 연결되는 별칭 ${(c.alias_rows || 0).toLocaleString()}개`),
        li(`두 배포판 모두에 있는 매뉴얼 ${((c.identical || 0) + (c.differs || 0)).toLocaleString()}개 — 본문 동일 ${(c.identical || 0).toLocaleString()}개, 다름 ${(c.differs || 0).toLocaleString()}개(그중 옵션 목록이 다른 것 ${(c.option_set_differs || 0).toLocaleString()}개)`),
        li(`Rocky에만 ${(c.only_rocky || 0).toLocaleString()}개 · Ubuntu에만 ${(c.only_ubuntu || 0).toLocaleString()}개`),
        cov ? li(`옵션 목록이 없는 매뉴얼 ${cov.no_option_list.length.toLocaleString()}개 (옵션이 없거나 본문 문장으로만 설명됨 — 이 경우 설명 원문을 대신 보여줍니다) · 변환 실패 ${cov.parse_failures.length}개`) : null,
        m.audit ? li(`옵션 표 자체 점검: 매뉴얼에 굵게 적힌 모든 옵션 표기가 표에 들어 있는 매뉴얼 ${(m.audit.table_covers_all_bold_flags || 0).toLocaleString()}개, 표에 없는 표기가 하나 이상 있는 매뉴얼 ${(m.audit.with_unlisted || 0).toLocaleString()}개 (해당 페이지에 그 표기를 그대로 나열합니다)`) : null,
        cov?.curated ? li(`한국어 운영 카드 ${cov.curated.cards}개가 언급한 옵션 중 ${cov.curated.flags_confirmed}개를 공식 매뉴얼 옵션 목록에서 확인, ${cov.curated.flags_unconfirmed.length}개는 목록에서 확인하지 못함 (세부는 `, h("a", { href: "./data/coverage.json" }, "coverage.json"), ")") : null)),
    h("section", { class: "block prose" }, h("h2", {}, "한계"),
      h("ul", {},
        li("“리눅스의 모든 명령어”라는 고정된 목록은 없습니다. 여기 있는 것은 위 저장소 범위에서 man 페이지가 있는 명령입니다. man 페이지가 없는 명령(예: 일부 셸 내장 명령, nvidia-smi·kubectl 같은 외부 배포 도구)은 운영 카드에만 있거나 없습니다."),
        li("Ubuntu universe와 EPEL은 운영 도구 위주로 선별했습니다. EPEL은 9.6에 고정된 저장소가 아니라 수집일 기준 최신본입니다."),
        li(cov ? `패키지 파일이 60MB를 넘는 ${cov.skipped_packages.length}개(브라우저·JDK 등)는 건너뛰었습니다.` : "아주 큰 패키지는 건너뛰었습니다."),
        li("옵션 표는 매뉴얼의 목록 구조를 기계적으로 읽은 결과입니다. 표에 없다고 해서 옵션이 없는 것은 아닙니다. 표에서 빠진 것으로 보이는 표기는 각 페이지의 “표에 따로 항목이 없는 표기”에 나열하며, 최종 확인은 서버의 man / --help 입니다."),
        li("한국어 “운영 노트”와 옵션 옆 한국어 한 줄 설명은 직접 작성한 요약입니다. 공식 문서가 아니며, 실제 서버에서 모든 예시를 실행해 검증한 것은 아닙니다."),
        li("서버에 실제 설치된 버전은 `rpm -q 패키지` / `dpkg -s 패키지`로 확인하세요. 보안 업데이트로 패키지 버전이 달라질 수 있습니다."))),
    m.tldr ? h("section", { class: "block prose" }, h("h2", {}, "예시의 출처"),
      h("ul", {},
        li("“공식 매뉴얼의 EXAMPLES 절”은 위 man 페이지 원문 그대로입니다."),
        li(`“커뮤니티 예시”는 `, h("a", { href: "https://github.com/tldr-pages/tldr", target: "_blank", rel: "noopener" }, "tldr-pages"), ` ${m.tldr.version} (CC BY 4.0)에서 가져왔습니다 — 명령어 ${m.tldr.commands.toLocaleString()}개, 예시 ${m.tldr.examples.toLocaleString()}개(한국어판 ${m.tldr.korean.toLocaleString()}개 명령). 배포판 공식 문서가 아니며, 사용된 옵션이 9.6 / 22.04 버전에 있는지는 옵션 표에서 확인하세요.`))) : null,
    h("section", { class: "block prose" }, h("h2", {}, "라이선스"),
      h("p", {}, "man 페이지의 저작권은 각 프로젝트에 있으며 해당 패키지의 라이선스(GPL, BSD, MIT 등)를 따릅니다. 원문의 저작권·라이선스 문구는 데이터팩(data/cmd)에 그대로 들어 있고, 각 페이지의 “원본 패키지” 링크에서 출처를 확인할 수 있습니다.")));
}

/* ---------- boot ---------- */
function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }

async function boot() {
  try {
    [DB, CUR] = await Promise.all([fetch("./data/index.json").then((r) => r.json()), fetch("./data/curated.json").then((r) => r.json())]);
  } catch (err) {
    view.replaceChildren(h("div", { class: "notice warn" }, "데이터팩을 불러오지 못했습니다. 파일로 직접 열었다면 `npm start`로 로컬 서버를 띄워 주세요."));
    return;
  }
  DB.cmds.forEach((row) => byId.set(idOf(row), row));
  $("#footer").replaceChildren(
    `명령어는 설치 패키지와 버전에 따라 달라질 수 있습니다. 실행 전 대상과 권한을 확인하세요. 데이터팩 ${DB.meta.generated} 생성 · `,
    h("a", { href: "#/about" }, "출처와 한계"), " · ", h("a", { href: "./review/analysis.html" }, "이전 정밀 분석 보고서 ↗"));
  $$(".tab").forEach((tab) => tab.addEventListener("click", () => { state.distro = tab.dataset.distro; store.set("lom.distro", state.distro); render(); }));
  searchInput.addEventListener("input", debounce(() => {
    const q = searchInput.value.trim();
    const route = parseRoute();
    const base = route.name === "all" ? "#/all" : "#/";
    const next = q ? `${base}?q=${encodeURIComponent(q)}` : base;
    if (location.hash !== next) history.replaceState(null, "", next);
    render();
  }, 140));
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && !/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) { e.preventDefault(); searchInput.focus(); searchInput.select(); }
    if (e.key === "Escape" && document.activeElement === searchInput) { searchInput.value = ""; searchInput.dispatchEvent(new Event("input")); }
  });
  window.addEventListener("hashchange", () => { render().then(() => { if (!parseRoute().q.get("q")) window.scrollTo(0, 0); }); });
  const mq = window.matchMedia("(max-width: 720px)");
  const sync = () => { $(".navigation").open = !mq.matches; };
  sync(); mq.addEventListener("change", sync);
  render();
}
boot();
})();
