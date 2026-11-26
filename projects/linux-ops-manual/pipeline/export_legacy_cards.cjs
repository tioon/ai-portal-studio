// One-off: export the hand-written cards that used to live inside app.js into content/cards.json.
const fs = require("fs");
const src = fs.readFileSync(process.argv[2], "utf8");
const cut = src.indexOf("function renderCategories");
const fn = new Function("document", "window", src.slice(0, cut) +
  ";return {COMMANDS,categories,scenarios,getCommandTopic,getCommandDisplay};");
const L = fn({ querySelector: () => null, querySelectorAll: () => [] }, {});
const cards = L.COMMANDS.map((c) => {
  const r = L.getCommandDisplay(c, "rocky"), u = L.getCommandDisplay(c, "ubuntu");
  const v = (x) => ({ options: x.options, examples: x.examples, diff: x.diff, warnings: x.warnings });
  return {
    id: c.id, topic: L.getCommandTopic(c),
    title: r.title === u.title ? r.title : { r: r.title, u: u.title },
    summary: c.summary,
    command: r.command === u.command ? r.command : { r: r.command, u: u.command },
    keywords: c.keywords || [],
    r: v(c.variants.rocky), u: v(c.variants.ubuntu)
  };
});
fs.writeFileSync("content/cards.json", JSON.stringify({
  categories: L.categories.filter((c) => c.id !== "all"), scenarios: L.scenarios, cards
}, null, 1));
console.log(cards.length, "cards");
