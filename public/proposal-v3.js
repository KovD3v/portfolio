// Full-page version of the approved ASCII and paper study.
import { ShaderMount, paperTextureFragmentShader, getShaderNoiseTexture, getShaderColorFromString, emptyPixel } from "/vendor/paper-texture.js";
import { artworks, drawArtwork } from "/artwork-subjects.js";
import { paperSettings, paperDefaults } from "/paper-texture-settings.js";

const root = document.documentElement;
const surface = root;
const canvas = document.querySelector("#v3-art");
const ctx = canvas?.getContext("2d");
const source = document.createElement("canvas");
source.width = source.height = 480;
const sourceCtx = source.getContext("2d", { willReadFrequently: true });
const reduce = matchMedia("(prefers-reduced-motion: reduce)");
const paperLayer = document.querySelector("#v3-paper");
const params = new URLSearchParams(location.search);
const textureForm = document.querySelector("#texture-controls");
const textureStatus = document.querySelector("#texture-status");
const paperValues = { ...paperDefaults };
const controls = Object.fromEntries(["render", "motion"].map(name => [name, document.querySelector(`#v3-${name}`)]));
const study = root.hasAttribute("data-ascii-lab");
const choices = [...document.querySelectorAll('[name="v3-art-choice"]')];
const validSubjects = [...artworks.map(art => art.id), "gyro", "leaf"];
const state = {
  render: ["characters", "dither", "halftone", "off"].includes(params.get("render")) ? params.get("render") : "dither",
  subject: validSubjects.includes(params.get("subject")) ? params.get("subject") : "robot",
  motion: params.get("motion") !== "off",
  sketch: params.get("sketch") !== "off",
  finish: params.get("finish") === "flat" ? "flat" : "material",
  focus: study,
};
const appearance = () => root.dataset.theme === "light" ? "light" : root.dataset.dark === "warm" ? "warm" : "oled";
const bayer = [0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
    const wrapSVG = content => `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="480" viewBox="0 0 480 480">${content}</svg>`;
    const forms = {
      leaf:wrapSVG(`<defs><radialGradient id="l" cx=".48" cy=".72" r=".75"><stop stop-color="#f0f0f0"/><stop offset=".46" stop-color="#aaaaaa"/><stop offset="1" stop-color="#383838"/></radialGradient></defs><path d="M239 390C201 351 143 333 102 280C53 237 37 180 55 131L91 101L125 83L162 76L189 66L216 80L238 127L259 74L290 65L320 76L357 91L389 111L421 148C437 207 395 268 348 306C307 340 267 359 248 390Z" fill="url(#l)"/><g fill="none" stroke="#e4e4e4" stroke-width="3" opacity=".75">${Array.from({length:29},(_,i)=>{const angle=Math.PI+(i/28)*Math.PI;const x=240+188*Math.cos(angle);const y=228+151*Math.sin(angle);const cx=220+(x-240)*.55,cy=280+(y-100)*.16;const u=.58,bx=(1-u)**2*244+2*(1-u)*u*cx+u*u*x,by=(1-u)**2*391+2*(1-u)*u*cy+u*u*y;const tx=240+188*Math.cos(angle+.024),ty=228+151*Math.sin(angle+.024);return `<path d="M244 391Q${cx} ${cy} ${x} ${y}M${bx} ${by}Q${cx+(tx-cx)*u} ${cy+(ty-cy)*u} ${tx} ${ty}"/>`;}).join('')}</g><path d="M244 378Q259 420 235 454" stroke="#c8c8c8" stroke-width="7" fill="none"/>`)
    };

const images = {};
let ready = false, phase = 0, frame = 0, lastFrame = 0, inView = true, paper;

const paperColors = () => {
  const colors = appearance() === "light" ? ["#fffdf8", "#ebe8e3"] : ["#27221d", "#0f0d0b"];
  return { u_colorFront: getShaderColorFromString(colors[0]), u_colorBack: getShaderColorFromString(colors[1]) };
};
function updatePaper() {
  if (paper && state.finish === "material" && appearance() !== "oled") paper.setUniforms({ ...paperColors(), ...paperValues });
}
async function initPaper() {
  const noise = getShaderNoiseTexture(), empty = new Image();
  empty.src = emptyPixel;
  await Promise.all([noise.decode(), empty.decode()]);
  paper = new ShaderMount(paperLayer, paperTextureFragmentShader, {
    u_noiseTexture: noise, u_image: empty, ...paperColors(),
    ...paperValues,
    u_fit: 2, u_rotation: 0, u_offsetX: 0, u_offsetY: 0, u_originX: .5, u_originY: .5, u_worldWidth: 0, u_worldHeight: 0,
  }, { alpha: false }, 0, 0, 1, 2200000);
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  root.dataset.paper = "ready";
  if (textureForm) {
    for (const fieldset of textureForm.querySelectorAll("fieldset")) fieldset.disabled = false;
    textureStatus.textContent = "";
  }
}

if (textureForm) {
  const visible = textureForm.querySelector("#texture-visible");
  const inputFor = name => textureForm.elements.namedItem(name);
  function applyTexture() {
    for (const { name } of paperSettings) {
      const input = inputFor(name);
      paperValues[`u_${name}`] = input.valueAsNumber;
      input.previousElementSibling.value = input.value;
    }
    state.finish = visible.checked ? "material" : "flat";
    textureStatus.textContent = "";
    render();
  }
  function textureURL() {
    const url = new URL(location.href);
    for (const { name, value } of paperSettings) {
      if (inputFor(name).valueAsNumber === value) url.searchParams.delete(name);
      else url.searchParams.set(name, inputFor(name).value);
    }
    if (visible.checked) url.searchParams.delete("finish");
    else url.searchParams.set("finish", "flat");
    url.searchParams.set("appearance", appearance());
    return url;
  }
  for (const { name, min, max } of paperSettings) {
    const requested = params.get(name);
    const value = Number(requested);
    if (requested?.trim() && Number.isFinite(value)) inputFor(name).value = String(Math.min(max, Math.max(min, value)));
  }
  visible.checked = state.finish === "material";
  // Read initial values before mounting the shared background.
  for (const { name } of paperSettings) {
    const input = inputFor(name);
    paperValues[`u_${name}`] = input.valueAsNumber;
    input.previousElementSibling.value = input.value;
  }
  textureForm.addEventListener("submit", event => event.preventDefault());
  textureForm.addEventListener("input", applyTexture);
  textureForm.addEventListener("change", () => history.replaceState(null, "", textureURL()));
  textureForm.addEventListener("reset", event => {
    event.preventDefault();
    for (const { name, value } of paperSettings) inputFor(name).value = String(value);
    visible.checked = true;
    applyTexture();
    const url = textureURL();
    url.searchParams.delete("appearance");
    history.replaceState(null, "", url);
  });
  textureForm.querySelector("#texture-share").addEventListener("click", async () => {
    const url = textureURL();
    history.replaceState(null, "", url);
    try {
      await navigator.clipboard.writeText(url.href);
      textureStatus.textContent = textureStatus.dataset.copied;
    } catch {
      textureStatus.textContent = textureStatus.dataset.copyError;
    }
  });
}
// Perspective projection follows the existing field's wireframe scene.
function drawGyroscope(t) {
  const turnX = ([x,y,z], a) => [x, y*Math.cos(a)-z*Math.sin(a), y*Math.sin(a)+z*Math.cos(a)];
  const turnY = ([x,y,z], a) => [x*Math.cos(a)+z*Math.sin(a), y, -x*Math.sin(a)+z*Math.cos(a)];
  const outer = p => turnX(turnY(turnX(p, Math.sin(t*.18)*.2), .5), -.35);
  const inner = p => outer(turnY(p, .65 + t*.24));
  const project = p => { const s=132*4/(4+p[2]); return [240+p[0]*s,240-p[1]*s,p[2]]; };
  sourceCtx.lineWidth = state.render === "characters" ? 11 : 7;
  sourceCtx.lineCap = "round";
  const segment = (a,b,transform) => {
    const A=project(transform(a)),B=project(transform(b));
    const shade=Math.round(210-(A[2]+B[2])*25);
    sourceCtx.strokeStyle=`rgb(${shade} ${shade} ${shade})`;
    sourceCtx.beginPath();sourceCtx.moveTo(A[0],A[1]);sourceCtx.lineTo(B[0],B[1]);sourceCtx.stroke();
  };
  const ring = (radius,transform,plane="xy",depth=0) => {
    const point = angle => plane === "yz" ? [0,radius*Math.cos(angle),radius*Math.sin(angle)] : [radius*Math.cos(angle),radius*Math.sin(angle),depth];
    for(let i=0;i<144;i++)segment(point(i*Math.PI/72),point((i+1)*Math.PI/72),transform);
  };
  // Outer and inner gimbals share their two Y-axis pivots.
  for(const r of [1.22,1.28])ring(r,outer);
  for(const r of [.96,1.02])ring(r,inner,"yz");
  for(const sign of [-1,1]) {
    segment([0,sign*.96,0],[0,sign*1.28,0],outer);
    segment([sign*1.22,0,0],[sign*1.43,0,0],outer);
  }
  for(let i=0;i<24;i++) {
    const angle=i*Math.PI/12,length=i%3===0?1.4:1.35;
    segment([1.31*Math.cos(angle),1.31*Math.sin(angle),0],[length*Math.cos(angle),length*Math.sin(angle),0],outer);
  }
  // The rotor spins around its shaft, supported by the inner gimbal.
  segment([0,0,-1.02],[0,0,1.02],inner);
  for(const z of [-.06,.06]) {
    ring(.68,inner,"xy",z);ring(.16,inner,"xy",z);
    for(let i=0;i<8;i++) {
      const a=i*Math.PI/4+t*1.1;
      const blade=[[.22,a-.09],[.64,a-.16],[.64,a+.16],[.22,a+.09]].map(([r,angle])=>project(inner([r*Math.cos(angle),r*Math.sin(angle),z])));
      sourceCtx.beginPath();blade.forEach(([x,y],index)=>index?sourceCtx.lineTo(x,y):sourceCtx.moveTo(x,y));sourceCtx.closePath();
      const shade=Math.round(150-blade[0][2]*30);sourceCtx.fillStyle=`rgb(${shade} ${shade} ${shade})`;sourceCtx.fill();
      segment([.16*Math.cos(a),.16*Math.sin(a),z],[.68*Math.cos(a),.68*Math.sin(a),z],inner);
    }
  }
  for(const sign of [-1,1]) {
    const [x,y]=project(outer([0,sign*1.12,0]));
    sourceCtx.strokeStyle="#eeeeee";sourceCtx.lineWidth=4;sourceCtx.beginPath();sourceCtx.arc(x,y,9,0,Math.PI*2);sourceCtx.stroke();
  }
}
function textRects(canvasRect) {
  const walker=document.createTreeWalker(document.querySelector("#v3-copy"),NodeFilter.SHOW_TEXT);
  const range=document.createRange(),rects=[];
  while(walker.nextNode()) {
    if(!walker.currentNode.textContent.trim())continue;
    range.selectNodeContents(walker.currentNode);
    for(const rect of range.getClientRects())if(rect.width&&rect.height)rects.push({
      left:rect.left-canvasRect.left,right:rect.right-canvasRect.left,
      top:rect.top-canvasRect.top,bottom:rect.bottom-canvasRect.top,
    });
  }
  return rects;
}
function draw() {
  if (!canvas || !ready || !ctx || !sourceCtx || canvas.hidden) return;
  const rect = canvas.getBoundingClientRect();
  const w = rect.width, h = rect.height, dpr = Math.min(devicePixelRatio || 1,2);
  const width=Math.round(w*dpr),height=Math.round(h*dpr);
  if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height}
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,w,h);
  const style=getComputedStyle(surface);
  ctx.fillStyle = style.getPropertyValue("--fg").trim();
  ctx.font = `9px ${style.getPropertyValue("--mono")}`;
  ctx.textBaseline="middle";ctx.textAlign="center";
  sourceCtx.clearRect(0,0,480,480);
  if(state.subject === "gyro")drawGyroscope(phase);
  else if(state.subject === "leaf") {
    sourceCtx.save();sourceCtx.translate(240,390);
    sourceCtx.rotate(Math.sin(phase*.45)*.055);
    sourceCtx.scale(1+Math.sin(phase*.34)*.025,1);
    sourceCtx.drawImage(images.leaf,-240,-390,480,480);
    sourceCtx.restore();
  } else drawArtwork(sourceCtx,state.subject,phase,state.render);
  const pixels = sourceCtx.getImageData(0,0,480,480).data;
  const small = w < 500, size = state.focus ? Math.min(w,420) : small ? 240 : 310;
  const left = state.focus ? (w-size)/2 : w*(small ? .7 : .79)-size/2, top = state.focus ? (h-size)/2 : small ? 3 : 0;
  const step = state.render === "characters" ? 7 : state.render === "dither" ? 2.4 : 5;
  const masks=state.focus ? [] : textRects(rect);
  for(let y=0,row=0;y<size;y+=step,row++)for(let x=0,col=0;x<size;x+=step,col++) {
    const sx=Math.min(479,Math.floor(x/size*480)),sy=Math.min(479,Math.floor(y/size*480));
    const k=(sy*480+sx)*4;
    if(pixels[k+3]<32)continue;
    const lum=pixels[k]/255,light=.94+.09*Math.sin(phase*.8+x*.014-y*.011);
    const strength=Math.min(1,.16+lum*.84*light),px=left+x,py=top+y;
    // Fade around actual text lines in both directions; no column-wide cutoff.
    let distance=64;
    for(const mask of masks)distance=Math.min(distance,Math.hypot(
      Math.max(mask.left-px,0,px-mask.right),Math.max(mask.top-py,0,py-mask.bottom),
    ));
    const fade=distance/64;
    ctx.globalAlpha=.18+.82*fade*fade*(3-2*fade);
    if(state.render === "characters") {
      const ramp=" .,:;+=xX#@";
      ctx.fillText(ramp[Math.min(ramp.length-1,Math.floor(strength*(ramp.length-1)))],px,py);
    } else if(state.render === "dither") {
      if(strength>(bayer[(row%4)*4+col%4]+.5)/16)ctx.fillRect(px,py,1.5,1.5);
    } else {
      ctx.beginPath();ctx.arc(px,py,.25+strength*1.55,0,Math.PI*2);ctx.fill();
    }
  }
  ctx.globalAlpha=1;
}
    function animate(now) {
      frame=0;
      if(!ready||!state.motion||state.render==='off'||reduce.matches||document.hidden||!inView)return;
      if(!lastFrame||now-lastFrame>=1000/12){
        if(lastFrame)phase+=Math.min((now-lastFrame)/1000,.2);
        lastFrame=now;draw();
      }
      frame=requestAnimationFrame(animate);
    }
    function syncMotion() {
      cancelAnimationFrame(frame);frame=0;lastFrame=0;
      if(canvas&&ready&&state.motion&&state.render!=='off'&&!reduce.matches&&!document.hidden&&inView)frame=requestAnimationFrame(animate);
    }

function render() {
  root.dataset.finish = state.finish;
  root.dataset.sketch = state.sketch ? "on" : "off";
  root.dataset.motion = state.motion && !reduce.matches && state.render !== "off" ? "on" : "off";
  if (canvas) {
    canvas.hidden = state.render === "off";
    canvas.dataset.render = state.render;
    canvas.dataset.subject = state.subject;
  }
  if (study) {
    controls.render.value = state.render;
    controls.motion.checked = state.motion && !reduce.matches;
    controls.motion.disabled = reduce.matches;
  }
  if(study) {
    root.dataset.artFocus = state.focus ? "on" : "off";
    for(const choice of choices)choice.checked = choice.value === state.subject;
    document.querySelector("#v3-subject-description").textContent = choices.find(choice => choice.value === state.subject)?.dataset.description ?? "";
  }
  document.querySelector('meta[name="theme-color"]').content = getComputedStyle(root).getPropertyValue("--bg").trim();
  try { localStorage.setItem("appearance", appearance()); } catch {}
  updatePaper();
  draw();
  syncMotion();
}
function saveParam(name, value) {
  const url = new URL(location.href);
  url.searchParams.set(name, value);
  history.replaceState(null, "", url);
}
for (const name of ["render", "motion"]) controls[name]?.addEventListener("change", () => {
  state[name] = name === "motion" ? controls[name].checked : controls[name].value;
  saveParam(name, name === "motion" ? state.motion ? "on" : "off" : state.render);
  render();
});
for(const choice of choices)choice.addEventListener("change",()=>{ state.subject=choice.value; phase=0; saveParam("subject", state.subject); render(); });
new MutationObserver(render).observe(root, { attributes: true, attributeFilter: ["data-theme", "data-dark"] });
reduce.addEventListener("change", render);
document.addEventListener("visibilitychange", syncMotion);
if (canvas) {
  new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; syncMotion(); }).observe(canvas);
  new ResizeObserver(draw).observe(canvas);
  addEventListener("resize", draw);
}
addEventListener("pagehide", event => { cancelAnimationFrame(frame); if (!event.persisted) paper?.dispose(); });
addEventListener("pageshow", syncMotion);

render();
initPaper().catch(error => {
  paperLayer.hidden = true;
  root.dataset.paper = "unavailable";
  if (textureStatus) textureStatus.textContent = textureStatus.dataset.unavailable;
  console.warn(error.message);
});
if (canvas) Promise.all([document.fonts.ready, ...Object.entries(forms).map(([name, svg]) => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => { images[name] = img; resolve(); };
  img.onerror = reject;
  img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}))]).then(() => { ready = true; render(); canvas.dataset.ready = ""; }).catch(error => {
  canvas.hidden = true;
  console.warn("The study artwork could not load.", error);
});
