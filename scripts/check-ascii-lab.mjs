// Run: node scripts/check-ascii-lab.mjs [base URL].
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { artworks, fullAdder, sliderCrank, networkSort, incrementTape, searchTree, armPose } from "../public/artwork-subjects.js";

for(let inputs=0;inputs<8;inputs++) {
  const a=(inputs>>2)&1,b=(inputs>>1)&1,c=inputs&1,{sum,carry}=fullAdder(a,b,c);
  assert.equal(sum+carry*2,a+b+c,"The adder must conserve the numeric sum");
}
for(let input=0;input<256;input++) {
  const values=Array.from({length:8},(_,i)=>(input>>i)&1);
  assert.deepEqual(networkSort(values).at(-1),[...values].sort((a,b)=>a-b),"The comparator network must sort every binary input");
}
for(let value=0;value<32;value++) {
  const result=incrementTape(value.toString(2).padStart(5,"0")).at(-1);
  assert.equal(result.state,"halt");
  assert.equal(parseInt(result.tape.filter(bit=>bit!==null).join(""),2),value+1,"The tape must add exactly one, including overflow");
}
for(let value=1;value<=7;value++) {
  const path=searchTree(value);
  assert.equal(path.at(-1),value);assert.ok(path.length<=3);
  for(let i=1;i<path.length;i++)assert.equal(Math.sign(path[i]-path[i-1]),Math.sign(value-path[i-1]));
}
for(let i=0;i<360;i++) {
  const {base,elbow,tip}=armPose(i*Math.PI/180);
  assert.ok(Math.abs(Math.hypot(elbow[0]-base[0],elbow[1]-base[1])-165)<1e-9);
  assert.ok(Math.abs(Math.hypot(tip[0]-elbow[0],tip[1]-elbow[1])-145)<1e-9,"Both robot links must keep their length");
}
for(let i=0;i<360;i++) {
  const {pin,slider}=sliderCrank(i*Math.PI/180);
  assert.equal(slider[0],240);
  assert.ok(Math.abs(Math.hypot(pin[0]-slider[0],pin[1]-slider[1])-180)<1e-9,"Rod length must stay fixed");
}

const base=process.argv[2]??"http://localhost:4322";
const url=new URL("/lab/ascii",base).href;
const subjects=[...artworks.map(art=>art.id),"gyro","leaf"];
let session=`lab-${process.pid}`;
const namespace=session;
const browser=(...args)=>execFileSync("agent-browser",["--namespace",namespace,"--session",session,...args],{encoding:"utf8",timeout:30000});
const check=expression=>browser("eval",`if(!(${expression}))throw new Error(${JSON.stringify(expression)});"ok"`);
const ready=()=>{browser("wait","#v3-art[data-ready]");browser("wait","--fn",'document.documentElement.dataset.paper==="ready"');};
try {
  browser("set","viewport","1440","1000");browser("open",url);ready();
  check(`document.querySelectorAll("[name=v3-art-choice]").length===${subjects.length}`);
  check('document.querySelector("#v3-art").dataset.subject==="robot"');
  check('document.querySelector("h1").textContent==="ASCII lab"');
  check(`document.querySelector('a[href="https://shaders.paper.design/paper-texture"]')!==null`);
  check('!document.querySelector(".v3-intro") && document.documentElement.dataset.artFocus==="on"');
  browser("eval",`(async()=>{
    const art=document.querySelector("#v3-art"),out=new Set(),delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
    const choose=(name,value)=>{const input=document.querySelector("#v3-"+name);if(input.type==="checkbox")input.checked=value;else input.value=value;input.dispatchEvent(new Event("change",{bubbles:true}));};
    const assert=(ok,message)=>{if(!ok)throw new Error(message);};
    choose("motion",false);
    for(const subject of ${JSON.stringify(subjects)})for(const mode of ["dither","characters","halftone"]) {
      document.querySelector('[name="v3-art-choice"][value="'+subject+'"]').click();choose("render",mode);
      const pixels=art.getContext("2d").getImageData(0,0,art.width,art.height).data;
      assert(pixels.some((value,i)=>i%4===3&&value>0),"Empty "+subject+" "+mode);
      out.add(art.toDataURL());
      assert(new URL(location.href).searchParams.get("subject")===subject,"Selection must survive a reload");
    }
    assert(out.size===${subjects.length*3},"All artwork treatments must differ");
    choose("render","dither");choose("motion",true);
    for(const subject of ${JSON.stringify(subjects)}) {
      document.querySelector('[name="v3-art-choice"][value="'+subject+'"]').click();
      const before=art.toDataURL(),deadline=performance.now()+3000;
      while(before===art.toDataURL()&&performance.now()<deadline)await delay(60);
      assert(before!==art.toDataURL(),subject+" must animate ("+document.visibilityState+")");
    }
    choose("motion",false);const before=art.toDataURL();await delay(300);assert(before===art.toDataURL(),"Pause must freeze");
    return "${subjects.length*3} renders, ${subjects.length} animations, pause and appearance passed";
  })()`);
  browser("click",'[name="v3-art-choice"][value="cpu"]');
  browser("press","ArrowRight");
  check('document.querySelector("#v3-art").dataset.subject==="gears"');
  browser("screenshot","/tmp/ascii-lab-desktop.png");
  browser("close");session+="-m";
  browser("set","viewport","390","844");browser("open",url);ready();
  check('document.documentElement.scrollWidth<=innerWidth');
  browser("press","Escape");
  check('document.querySelector("#v3-art").getBoundingClientRect().right<=innerWidth');
  browser("screenshot","/tmp/ascii-lab-mobile.png");
  assert.equal(browser("errors").trim(),"");browser("close");
  session+="-motion";browser("set","media","light","reduced-motion");
  browser("open",`${url}?subject=piston&view=artwork&render=characters&appearance=light`);ready();
  check('document.querySelector("#v3-art").dataset.subject==="piston" && document.documentElement.dataset.artFocus==="on"');
  check('document.querySelector("#v3-motion").disabled && document.documentElement.dataset.motion==="off"');
  browser("eval",'(async()=>{const art=document.querySelector("#v3-art"),before=art.toDataURL();await new Promise(resolve=>setTimeout(resolve,350));if(before!==art.toDataURL())throw new Error("Reduced motion must stay still");return "static"})()');
  assert.equal(browser("errors").trim(),"");
  console.log(`Passed: sorting network, tape increment including overflow, tree search, fixed robot and piston link lengths, adder truth table, ${subjects.length} subjects in three styles, animation and pause, keyboard selection, dedicated Lab view, mobile fit, URL replay and reduced motion.`);
} finally { browser("close"); }
