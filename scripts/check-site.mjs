// Run: node scripts/check-site.mjs [base URL]. Uses the existing agent-browser CLI.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";

const base = process.argv[2] ?? "http://localhost:4321";
const session = `site-${process.pid}`;
const browser = (...args) => execFileSync("agent-browser", ["--namespace", session, "--session", session, ...args], { encoding: "utf8", timeout: 30000 });
const check = expression => browser("eval", `if (!(${expression})) throw new Error(${JSON.stringify(expression)}); "ok"`);
const pages = ["/", "/about", "/it/about", "/notes", "/notes/the-work-that-disappears", "/projects", "/projects/anthon", "/projects/amber", "/projects/drivewise", "/projects/c-code-lab", "/projects/physic-engine", "/it/", "/it/projects/anthon", "/it/now", "/it/uses", "/it/lab/field", "/lab", "/lab/field", "/lab/ascii", "/now", "/uses", "/changelog", "/404"];
try {
  for (const path of ["/proposal", "/proposal-v2", "/proposal-v3"]) assert.equal((await fetch(new URL(path, base))).status, 404, path);
  for (const path of ["/", "/old"]) assert.equal((await fetch(new URL(path, base))).status, 200, path);
  for (const width of [1440, 390, 320]) {
    browser("set", "viewport", String(width), "900");
    for (const path of pages) {
      browser("open", new URL(path, base).href);
      browser("wait", "--fn", 'document.documentElement.dataset.paper === "ready" || document.documentElement.dataset.paper === "unavailable"');
      check('document.documentElement.hasAttribute("data-proposal-v3") && document.querySelectorAll("main").length === 1');
      check('document.documentElement.scrollWidth <= innerWidth');
      check('location.search === "" && !document.querySelector(".v3-compare")');
      check('getComputedStyle(document.querySelector("main"), "before").display === "none"');
      assert.equal(browser("errors").trim(), "", `${path} browser errors at ${width}px`);
    }
  }
  browser("open", new URL("/notes?appearance=light", base).href);
  browser("wait", "--fn", 'localStorage.getItem("appearance") === "light"');
  browser("open", new URL("/uses", base).href);
  check('document.documentElement.dataset.theme === "light"');
  browser("click", ".v3-theme");
  browser("wait", "--fn", 'localStorage.getItem("appearance") === "warm"');
  browser("open", new URL("/now", base).href);
  check('document.documentElement.dataset.theme === "oled" && document.documentElement.dataset.dark === "warm"');
  browser("click", ".v3-preview .v3-menu");
  check('document.querySelector("#palette").open');
  browser("press", "Escape");
  browser("click", ".v3-sound");
  check('document.querySelector(".v3-sound").getAttribute("aria-pressed") === "true"');
  browser("click", ".v3-sound");
  browser("open", new URL("/old", base).href);
  check('!document.documentElement.hasAttribute("data-proposal-v3") && !!document.querySelector(".frame .intro")');
  check('document.querySelector("meta[name=robots]").content.includes("noindex")');
  console.log("Passed: route migration, all current pages at 1440/390/320px, shared layout, browser errors, appearance persistence, menu, sound, archive isolation and alias removal.");
} finally {
  browser("close");
}
