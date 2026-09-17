// Run: node scripts/check-texture-lab.mjs [base URL].
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { paperSettings, paperDefaults } from "../public/paper-texture-settings.js";

const base = process.argv[2] ?? "http://localhost:4321";
const session = `texture-${process.pid}`;
const browser = (...args) => execFileSync("agent-browser", ["--namespace", session, "--session", session, ...args], { encoding: "utf8", timeout: 30000 });
const check = expression => browser("eval", `if (!(${expression})) throw new Error(${JSON.stringify(expression)}); "ok"`);
const open = path => {
  browser("open", new URL(path, base).href);
  browser("wait", "--fn", 'document.documentElement.dataset.paper === "ready"');
};
const uniforms = 'document.querySelector("#v3-paper").paperShaderMount.providedUniforms';

try {
  for (const width of [1440, 390, 320]) {
    browser("set", "viewport", String(width), "900");
    for (const locale of ["", "/it"]) {
      open(`${locale}/lab/texture`);
      check('location.search === "" && document.querySelectorAll("#texture-controls input[type=range]").length === 12');
      check('!document.querySelector("#texture-controls fieldset:disabled")');
      check('document.documentElement.scrollWidth <= innerWidth');
      check('document.querySelector("#v3-paper").getBoundingClientRect().height === innerHeight');
      for (const [name, value] of Object.entries(paperDefaults)) check(`${uniforms}.${name} === ${value}`);
      assert.equal(browser("errors").trim(), "");
    }
  }
  browser("set", "viewport", "1440", "900");
  open("/it/lab/texture");
  // Check the rendered pixels as well as the range value and shader uniform.
  browser("eval", `(() => {
    const paper=document.querySelector("#v3-paper").paperShaderMount;
    paper.setUniforms({});
    const before=paper.canvasElement.toDataURL();
    const input=document.querySelector('[name="contrast"]');
    input.value="0.9";
    input.dispatchEvent(new Event("input",{bubbles:true}));
    if(before===paper.canvasElement.toDataURL()) throw Error("Texture pixels did not change");
    input.dispatchEvent(new Event("change",{bubbles:true}));
  })()`);
  check(`${uniforms}.u_contrast === .9 && new URLSearchParams(location.search).get("contrast") === "0.9"`);
  for (const { name, max } of paperSettings) {
    browser("eval", `(() => {const input=document.querySelector('[name="${name}"]'); input.value="${max}"; input.dispatchEvent(new Event("input",{bubbles:true})); input.dispatchEvent(new Event("change",{bubbles:true}));})()`);
    check(`${uniforms}.u_${name} === ${max}`);
  }
  browser("click", ".v3-theme");
  browser("wait", "--fn", 'document.documentElement.dataset.theme === "light"');
  browser("wait", "--fn", 'document.getAnimations().every(animation => animation.playState === "finished")');
  browser("click", "#texture-share");
  browser("wait", "--fn", 'document.querySelector("#texture-status").textContent.length > 0');
  check('new URLSearchParams(location.search).get("appearance") === "light"');
  browser("reload");
  browser("wait", "--fn", 'document.documentElement.dataset.paper === "ready"');
  for (const { name, max } of paperSettings) check(`${uniforms}.u_${name} === ${max}`);
  check('document.documentElement.dataset.theme === "light"');
  browser("click", "#texture-visible");
  check('getComputedStyle(document.querySelector("#v3-paper")).visibility === "hidden"');
  browser("click", 'button[type="reset"]');
  check('location.search === "" && getComputedStyle(document.querySelector("#v3-paper")).visibility === "visible"');
  for (const [name, value] of Object.entries(paperDefaults)) check(`${uniforms}.${name} === ${value}`);
  browser("focus", '[name="contrast"]');
  browser("press", "ArrowRight");
  check(`${uniforms}.u_contrast === ${Number((paperDefaults.u_contrast + .01).toFixed(2))}`);
  open("/lab/texture?contrast=nope&roughness=Infinity&fiber=-10&fiberSize=0&foldCount=99&scale=&seed=NaN");
  check(`${uniforms}.u_contrast === ${paperDefaults.u_contrast} && ${uniforms}.u_roughness === ${paperDefaults.u_roughness} && ${uniforms}.u_fiber === 0 && ${uniforms}.u_fiberSize === .01 && ${uniforms}.u_foldCount === 15 && ${uniforms}.u_scale === ${paperDefaults.u_scale} && ${uniforms}.u_seed === ${paperDefaults.u_seed}`);
  open("/?contrast=1");
  check(`${uniforms}.u_contrast === ${paperDefaults.u_contrast} && !document.querySelector("#texture-controls")`);
  open("/lab");
  check(`!!document.querySelector('a[href="/lab/texture"]')`);
  assert.equal(browser("errors").trim(), "");
  console.log("Passed: bilingual texture lab, mobile fit, shared defaults, live pixel updates, every control, theme and URL replay, visibility, reset, keyboard, invalid parameters and homepage isolation.");
} finally {
  browser("close");
}
