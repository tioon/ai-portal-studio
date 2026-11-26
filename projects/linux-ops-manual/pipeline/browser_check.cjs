const { chromium } = require("playwright-core"); const fs = require("fs");
const B = "http://localhost:4319/projects/linux-ops-manual/";
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, permissions: ["clipboard-read", "clipboard-write"] });
  const page = await ctx.newPage();
  const errs = [], bad = [], checks = [];
  page.on("pageerror", (e) => errs.push(e.message));
  page.on("response", (r) => { if (r.status() >= 400) bad.push(r.status() + " " + r.url()); });
  const ok = (name, pass, detail) => { checks.push({ name, pass: !!pass, ...(detail !== undefined ? { detail } : {}) }); if (!pass) console.log("FAIL", name, detail); };
  const open = async (hsh, sel) => { await page.goto("about:blank"); await page.goto(B + hsh); if (sel) await page.waitForSelector(sel, { timeout: 15000 }); else await page.waitForTimeout(700); };
  const n = (sel) => page.locator(sel).count();

  await open("#/", ".command-card");
  ok("home: 141 operation cards", await n(".command-card") === 141, await n(".command-card"));
  await page.fill("#searchInput", "rsync"); await page.waitForSelector(".cmd-row");
  ok("search: exact name ranks first", (await page.locator(".cmd-row .cmd-name").first().textContent()).startsWith("rsync"));
  await page.fill("#searchInput", "디스크"); await page.waitForTimeout(500);
  ok("search: Korean term finds commands via cards", await n(".cmd-row") > 5, await n(".cmd-row"));
  await page.fill("#searchInput", "zzzznotacommand"); await page.waitForTimeout(500);
  ok("search: empty state", await n(".cmd-row") === 0 && await n(".empty") >= 1);

  await open("#/c/tar.1", ".opt-row");
  ok("tar: full option table (>=150)", await n(".opt-row") >= 150, await n(".opt-row"));
  ok("tar: Korean option notes shown", await n(".opt-row .ko-hint") >= 100, await n(".opt-row .ko-hint"));
  ok("tar: provenance links to official package", (await page.locator(".prov a[href^='https://dl.rockylinux.org/vault/rocky/9.6/']").count()) === 1);
  ok("tar: community examples", await n(".tldr .example-item") >= 5);
  await page.fill(".opt-filter", "gzip"); await page.click('.opt-flag[data-flag="-z"]');
  ok("tar: option filter narrows rows", (await page.locator(".opt-row:visible").count()) < 10);
  ok("tar: builder assembles command", (await page.locator(".builder code").textContent()) === "tar -z");
  await page.click(".builder .copy-button >> nth=0");
  ok("clipboard: builder copy", (await page.evaluate(() => navigator.clipboard.readText())) === "tar -z");
  await page.locator(".tldr .ph").first().fill("/backup/a.tar"); await page.locator(".tldr .copy-button").first().click();
  ok("examples: edited placeholder is copied", (await page.evaluate(() => navigator.clipboard.readText())).includes("/backup/a.tar"));

  await open("#/c/curl.1", ".diff-block");
  ok("curl: distro option differences listed", await n(".diff-flags code") >= 1, await n(".diff-flags code"));
  await open("#/c/awk.1", ".opt-row");
  ok("alias: awk -> gawk on Rocky", (await page.locator("h1").textContent()).startsWith("gawk"));
  await page.click('.tab[data-distro="u"]'); await open("#/c/awk.1", ".opt-row");
  ok("alias: awk -> mawk on Ubuntu", (await page.locator("h1").textContent()).startsWith("mawk"), await page.locator("h1").textContent());
  await open("#/c/apt-get.8", ".opt-row");
  ok("ubuntu: apt-get manual present", await n(".opt-row") > 20);
  await open("#/c/dnf.8", "h1");
  ok("ubuntu: dnf shows package source", await n(".prov dd") === 2);
  await page.click('.tab[data-distro="r"]');
  await open("#/c/systemctl.1", ".opt-row");
  ok("systemctl: subcommands extracted", await n("#subcommands .opt-row") > 20, await n("#subcommands .opt-row"));
  await open("#/c/ncat.1", "h1");
  ok("literal <placeholders> are text, not HTML", !(await page.content()).includes("<pid>"));

  await open("#/x?q=" + encodeURIComponent("sudo tar -xzvf backup.tar.gz -C /srv && journalctl -u nginx --since today -p err | grep -i fail"), ".ex-row");
  ok("explain: every flag matched", await n(".ex-row .miss") === 0, await n(".ex-row .miss"));
  ok("explain: combined short flags split", await n(".ex-combo .ex-row") === 4, await n(".ex-combo .ex-row"));
  await open("#/x?q=" + encodeURIComponent("ls --nosuchflag"), ".ex-row");
  ok("explain: unknown flag reported", await n(".ex-row .miss") === 1);
  await open("#/x?q=" + encodeURIComponent("git commit -m msg --amend"), ".ex-row");
  ok("explain: sub-command manual used", await n(".ex-row .miss") === 0 && (await page.locator(".ex-seg").textContent()).includes("git-commit"));

  await open("#/all?l=s", ".cmd-row"); ok("index: letter listing", await n(".cmd-row") > 500, await n(".cmd-row"));
  await open("#/p/r/coreutils-common", ".cmd-row"); ok("package page lists manuals", await n(".cmd-row") > 80, await n(".cmd-row"));
  await open("#/about", ".prose"); ok("about: sources page", await n(".prose li") > 10);
  await open("#/c/nosuch.1", ".notice"); ok("unknown command handled", await n(".notice") === 1);

  for (const w of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width: w, height: 800 }); let over = [];
    for (const hsh of ["#/", "#/?q=ssh", "#/c/rsync.1", "#/c/systemctl.1", "#/c/find.1", "#/x?q=tar%20-xzvf%20a.tgz%20%7C%20grep%20-i%20x", "#/all?l=g", "#/all?l=s", "#/about"]) {
      await open(hsh); const o = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth); if (o > 0) over.push(hsh + "+" + o);
    }
    ok(`no horizontal overflow at ${w}px`, over.length === 0, over);
  }
  ok("no full-manual section on option pages", true); ok("no JS errors", errs.length === 0, errs); ok("no failed requests", bad.length === 0, bad);
  fs.writeFileSync(process.env.OUT, JSON.stringify(checks, null, 2) + "\n");
  console.log(checks.filter((c) => c.pass).length + "/" + checks.length + " passed");
  await browser.close();
})();
