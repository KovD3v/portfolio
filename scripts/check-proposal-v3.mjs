// Run: node scripts/check-proposal-v3.mjs [base URL].
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
const base = process.argv[2] ?? "http://localhost:4321";
const session = `home-${process.pid}`;
const browser = (...args) => execFileSync("agent-browser", ["--namespace", session, "--session", session, ...args], { encoding: "utf8", timeout: 30000 });
const check = expression => browser("eval", `if (!(${expression})) throw new Error(${JSON.stringify(expression)}); "ok"`);
const open = path => { browser("open", new URL(path, base).href); browser("wait", "#v3-art[data-ready]"); };
try {
  open("/");
  check('location.search === "" && !document.querySelector(".v3-compare, #v3-appearance")');
  check('document.querySelector("#v3-art").dataset.subject === "robot" && document.querySelector("#v3-art").dataset.render === "dither"');
  browser("click", ".v3-theme");
  browser("wait", "--fn", 'document.documentElement.dataset.theme === "light"');
  check('location.search === ""');
  browser("wait", "--fn", 'document.getAnimations().every(animation => animation.playState === "finished")');
  browser("click", ".v3-theme");
  browser("wait", "--fn", 'document.documentElement.dataset.theme === "oled"');
  check('location.search === "" && document.documentElement.dataset.dark === "warm"');
  const query = "?appearance=light&render=characters&subject=leaf&motion=off&finish=flat&sketch=off";
  open("/" + query);
  check(`location.search === ${JSON.stringify(query)}`);
  check('document.querySelector("#v3-art").dataset.subject === "leaf" && document.querySelector("#v3-art").dataset.render === "characters"');
  check('document.documentElement.dataset.motion === "off" && document.documentElement.dataset.finish === "flat" && document.documentElement.dataset.sketch === "off"');
  browser("eval", '(async()=>{const art=document.querySelector("#v3-art"), before=art.toDataURL();await new Promise(r=>setTimeout(r,300));if(before!==art.toDataURL())throw new Error("Paused artwork changed");})()');
  open("/?subject=missing&render=missing&appearance=oled");
  check('document.querySelector("#v3-art").dataset.subject === "robot" && document.querySelector("#v3-art").dataset.render === "dither" && document.documentElement.dataset.dark === "warm"');
  browser("set", "media", "light", "reduced-motion");
  open("/");
  check('location.search === "" && document.documentElement.dataset.motion === "off"');
  assert.equal(browser("errors").trim(), "");
  console.log("Passed: clean default URLs, robot/dither defaults, warm light/dark toggle, explicit URL overrides, invalid-value fallback, pause and reduced motion.");
} finally { browser("close"); }
