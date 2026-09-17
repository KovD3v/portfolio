export const artworks = [
  { id: "cpu", name: "CPU package", description: "An exploded chip package: lid, silicon, substrate, and pins turn together." },
  { id: "gears", name: "Planetary gears", description: "A fixed outer ring, a turning sun, and three planets carried around it." },
  { id: "adder", name: "Logic circuit", description: "A one-bit adder cycles through all eight inputs. Bright paths carry a 1." },
  { id: "piston", name: "Crank & piston", description: "A rotating crank drives a piston through a connecting rod of fixed length." },
  { id: "lissajous", name: "Lissajous trace", description: "Two oscillations at a 3:2 ratio trace a curve as their phase changes." },
  { id: "sorting", name: "Sorting network", description: "Eight values travel through compare-and-swap stages until they are sorted." },
  { id: "turing", name: "Turing machine", description: "A tape head adds one to a binary number, rewriting bits until the carry is resolved." },
  { id: "tree", name: "Binary search tree", description: "A search follows smaller or larger keys down the tree, lighting its path to the answer." },
  { id: "robot", name: "Robot arm", description: "A robot arm traces a figure eight while both links keep their length." },
  { id: "fourier", name: "Fourier epicycles", description: "Four rotating vectors add odd harmonics to form a square-wave approximation." },
];

const tau = Math.PI * 2;
const gray = value => `rgb(${value} ${value} ${value})`;
function line(ctx, points, shade = 200, width = ctx.lineWidth) {
  ctx.strokeStyle = gray(shade); ctx.lineWidth = width;
  ctx.beginPath(); points.forEach(([x,y], i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y)); ctx.stroke();
}
function circle(ctx, x, y, radius, shade = 200, fill = false) {
  ctx.beginPath(); ctx.arc(x,y,radius,0,tau);
  if (fill) { ctx.fillStyle = gray(shade); ctx.fill(); }
  else { ctx.strokeStyle = gray(shade); ctx.stroke(); }
}

function cpu(ctx, t) {
  const angle = .65 + t*.17, tilt = -.42;
  const project = ([x,y,z]) => {
    const X = x*Math.cos(angle)+z*Math.sin(angle), Z = -x*Math.sin(angle)+z*Math.cos(angle);
    const Y = y*Math.cos(tilt)-Z*Math.sin(tilt), depth = y*Math.sin(tilt)+Z*Math.cos(tilt);
    const scale = 90*5/(5+depth);
    return [240+X*scale,240-Y*scale,depth];
  };
  const faces = [];
  const box = (w,d,y,h,shade,detail) => {
    const points = [[-w,y,-d],[w,y,-d],[w,y,d],[-w,y,d],[-w,y+h,-d],[w,y+h,-d],[w,y+h,d],[-w,y+h,d]].map(project);
    for (const [indices,light] of [[[0,1,2,3],-.3],[[0,1,5,4],-.2],[[1,2,6,5],-.1],[[2,3,7,6],-.2],[[3,0,4,7],-.1],[[4,5,6,7],0]]) {
      const vertices = indices.map(i => points[i]);
      faces.push({ vertices, depth: vertices.reduce((sum,p) => sum+p[2],0)/4, shade: Math.round(shade*(1+light)), detail: light===0 ? detail : null });
    }
  };
  const gap = Math.sin(t*.5)*.08;
  // Pins belong to the substrate, so the whole exploded assembly shares one rotation.
  for (let x=-.84;x<.9;x+=.28) for (let z=-.84;z<.9;z+=.28) {
    line(ctx,[project([x,-1.2,z]),project([x,-1.62,z])],155,4);
  }
  const trace = (points,y,shade=230,width=4) => line(ctx,points.map(([x,z])=>project([x,y,z])),shade,width);
  box(1.08,1.02,-1.2,.10,100,()=>{
    for(const side of [-1,1])for(let i=-3;i<=3;i++) {
      trace([[i*.13,side*.35],[i*.13,side*.62],[i*.24,side*.86]],-1.099);
      trace([[side*.35,i*.13],[side*.62,i*.13],[side*.9,i*.23]],-1.099,175);
    }
    for(const x of [-.86,.86])for(const z of [-.82,.82])circle(ctx,...project([x,-1.099,z]).slice(0,2),5,245,true);
  });
  box(.52,.48,-.02+gap,.12,110,()=>{
    // Four etched core blocks and the bus separating them, on the silicon face.
    for(const x of [-.41,.07])for(const z of [-.37,.07]) {
      trace([[x,z],[x+.32,z],[x+.32,z+.28],[x,z+.28],[x,z]],.101+gap,240,4);
      for(let j=1;j<=2;j++)trace([[x+.05,z+j*.09],[x+.27,z+j*.09]],.101+gap,185,3);
    }
    trace([[0,-.43],[0,.43]],.101+gap,240,4);
  });
  box(.95,.9,1.2+gap*2,.13,190,()=>{
    trace([[-.78,-.73],[.78,-.73],[.78,.73],[-.78,.73],[-.78,-.73]],1.331+gap*2,240,4);
    for(let i=0;i<3;i++)trace([[-.5,-.35+i*.2],[.25,-.35+i*.2]],1.331+gap*2,105,5);
  });
  for (const face of faces.sort((a,b) => b.depth-a.depth)) {
    ctx.beginPath(); face.vertices.forEach(([x,y],i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y)); ctx.closePath();
    ctx.fillStyle = gray(face.shade); ctx.fill(); ctx.strokeStyle = gray(Math.min(245,face.shade+35)); ctx.lineWidth = 3; ctx.stroke();
    face.detail?.();
  }
}

function gear(ctx, x,y,r,teeth,angle, internal = false) {
  ctx.save(); ctx.translate(x,y); ctx.rotate(angle);
  ctx.beginPath();
  // ponytail: trapezoidal teeth for this visual study; use involute profiles for a dimensioned model.
  for (let i=0;i<teeth*4;i++) {
    const a = (i-.5)/(teeth*4)*tau;
    const radius = r + (internal ? -1 : 1)*(i%4===1||i%4===2 ? 4 : -4);
    const X=radius*Math.cos(a),Y=radius*Math.sin(a);
    if(i)ctx.lineTo(X,Y); else ctx.moveTo(X,Y);
  }
  ctx.closePath();
  ctx.moveTo(internal ? r+18 : r*.28,0);
  ctx.arc(0,0,internal ? r+18 : r*.28,0,tau);
  ctx.fillStyle = gray(internal ? 80 : 125); ctx.fill("evenodd");
  ctx.strokeStyle = gray(220); ctx.lineWidth=3; ctx.stroke();
  if(!internal) {
    ctx.lineWidth=4;circle(ctx,0,0,r*.82,195);circle(ctx,0,0,r*.38,235);
    for(let i=0;i<3;i++) {
      const a=i*tau/3;
      circle(ctx,Math.cos(a)*r*.59,Math.sin(a)*r*.59,r*.16,35,true);
      ctx.lineWidth=3;circle(ctx,Math.cos(a)*r*.59,Math.sin(a)*r*.59,r*.16,215);
    }
  }
  ctx.restore();
}
function gears(ctx,t) {
  // 24 sun / 12 planet / 48 ring teeth. Fixed ring: carrier = sun/3, planets = -sun.
  gear(ctx,240,240,160,48,0,true);
  gear(ctx,240,240,80,24,t);
  for(let i=0;i<3;i++) {
    const a=t/3+i*tau/3, x=240+120*Math.cos(a), y=240+120*Math.sin(a);
    gear(ctx,x,y,40,12,-t+Math.PI/12);
    line(ctx,[[240,240],[x,y]],70,14);line(ctx,[[240,240],[x,y]],155,5);
    ctx.lineWidth=4;circle(ctx,x,y,12,230);
    circle(ctx,x,y,7,230,true);
  }
  circle(ctx,240,240,11,230,true);
  for(let i=0;i<6;i++) {
    const x=240+171*Math.cos(i*tau/6),y=240+171*Math.sin(i*tau/6);
    ctx.lineWidth=3;circle(ctx,x,y,6,245);line(ctx,[[x-3,y],[x+3,y]],245,3);
  }
}

export function fullAdder(a,b,carryIn) {
  const half = a ^ b;
  return { sum: half ^ carryIn, carry: (a & b) | (half & carryIn) };
}
function adder(ctx,t) {
  const bits = Math.floor(t/2.4)%8, a=(bits>>2)&1, b=(bits>>1)&1, c=bits&1;
  const half=a^b, generated=a&b, propagated=half&c, result=fullAdder(a,b,c);
  const wire = (points,on) => {
    line(ctx,points,on ? 225 : 65,5);
    if(!on)return;
    const lengths=points.slice(1).map((p,i)=>Math.hypot(p[0]-points[i][0],p[1]-points[i][1]));
    let position=((t*.55)%1)*lengths.reduce((sum,l)=>sum+l,0);
    for(let i=0;i<lengths.length;i++) {
      if(position<=lengths[i]) {
        const u=position/lengths[i];
        circle(ctx,points[i][0]+(points[i+1][0]-points[i][0])*u,points[i][1]+(points[i+1][1]-points[i][1])*u,6,255,true);break;
      }
      position-=lengths[i];
    }
  };
  const gate = (x,y,kind,on,w=65,h=54) => {
    ctx.beginPath();ctx.moveTo(x,y-h/2);
    if(kind==="and") {
      ctx.lineTo(x+w*.5,y-h/2);ctx.bezierCurveTo(x+w*1.15,y-h/2,x+w*1.15,y+h/2,x+w*.5,y+h/2);ctx.lineTo(x,y+h/2);ctx.closePath();
    } else {
      ctx.quadraticCurveTo(x+w*.65,y-h/2,x+w,y);ctx.quadraticCurveTo(x+w*.65,y+h/2,x,y+h/2);ctx.quadraticCurveTo(x+w*.32,y,x,y-h/2);
    }
    ctx.fillStyle=gray(on?85:30);ctx.fill();
    ctx.strokeStyle=gray(on?250:155);ctx.lineWidth=6;ctx.stroke();
    if(kind==="xor") { ctx.beginPath();ctx.moveTo(x-10,y-h/2);ctx.quadraticCurveTo(x+w*.32-10,y,x-10,y+h/2);ctx.stroke(); }
  };
  wire([[35,80],[90,80],[90,92],[122,92]],a);
  wire([[35,180],[78,180],[78,128],[122,128]],b);
  wire([[60,80],[60,242],[120,242]],a);
  wire([[50,180],[50,278],[120,278]],b);
  wire([[185,110],[225,110],[225,92],[295,92]],half);
  wire([[225,110],[225,240],[285,240]],half);
  wire([[35,400],[250,400],[250,128],[295,128]],c);
  wire([[250,400],[270,400],[270,278],[285,278]],c);
  wire([[185,260],[205,260],[205,337],[355,337]],generated);
  wire([[350,259],[365,259],[365,300],[335,300],[335,373],[355,373]],propagated);
  wire([[360,110],[450,110]],result.sum);
  wire([[420,355],[450,355]],result.carry);
  for(const [x,y,on] of [[60,80,a],[50,180,b],[225,110,half],[250,400,c]])circle(ctx,x,y,5,on?225:65,true);
  gate(120,110,"xor",half);gate(295,110,"xor",result.sum);
  gate(120,260,"and",generated);gate(285,259,"and",propagated);gate(355,355,"or",result.carry);
  for(const [x,y,on] of [[35,80,a],[35,180,b],[35,400,c],[450,110,result.sum],[450,355,result.carry]]) {
    ctx.lineWidth=4;circle(ctx,x,y,10,on?250:140);circle(ctx,x,y,4,on?250:70,true);
  }
  ctx.font='22px monospace';ctx.textAlign="left";ctx.textBaseline="middle";
  for(const [text,x,y,on] of [[`A ${a}`,20,50,a],[`B ${b}`,20,155,b],[`Ci ${c}`,20,429,c],[`S ${result.sum}`,401,78,result.sum],[`Co ${result.carry}`,390,392,result.carry]]) {
    ctx.fillStyle=gray(on?255:135);ctx.fillText(text,x,y);
  }
}

export function sliderCrank(t) {
  const x=66*Math.sin(t), y=66*Math.cos(t);
  return { pin:[240+x,350-y], slider:[240,350-y-Math.sqrt(180**2-x**2)] };
}
function piston(ctx,t) {
  const {pin,slider}=sliderCrank(t);
  line(ctx,[[175,265],[175,55],[305,55],[305,265]],125,6);
  for(const x of [166,314])line(ctx,[[x,65],[x,245]],75,3);
  for(let y=72;y<250;y+=23)for(const side of [-1,1])line(ctx,[[240+side*65,y],[240+side*90,y]],155,6);
  for(const x of [188,292]){ctx.lineWidth=4;circle(ctx,x,55,8,220);}
  ctx.lineWidth=6;
  circle(ctx,240,350,83,160);
  ctx.lineWidth=4;circle(ctx,240,350,74,215);
  for(let i=0;i<6;i++) {
    const a=t+i*tau/6;
    line(ctx,[[240+17*Math.cos(a),350+17*Math.sin(a)],[240+75*Math.cos(a),350+75*Math.sin(a)]],100,7);
  }
  ctx.fillStyle=gray(110);ctx.fillRect(184,slider[1]-24,112,48);
  for(const y of [-24,-13,-3,24])line(ctx,[[184,slider[1]+y],[296,slider[1]+y]],220,5);
  line(ctx,[slider,pin],210,19);line(ctx,[slider,pin],85,8);line(ctx,[[240,350],pin],160,19);
  for(const point of [slider,pin,[240,350]]) { circle(ctx,...point,15,230,true);circle(ctx,...point,8,65,true);circle(ctx,...point,3,245,true); }
}

function lissajous(ctx,t) {
  const stroke=ctx.lineWidth;
  const point = u => [240+178*Math.sin(3*u+t*.23+.7),240+164*Math.sin(2*u)];
  line(ctx,[[45,240],[435,240]],65,3);line(ctx,[[240,55],[240,425]],65,3);
  for(let i=-3;i<=3;i++) {
    line(ctx,[[240+i*54,234],[240+i*54,246]],110,3);
    line(ctx,[[234,240+i*50],[246,240+i*50]],110,3);
  }
  const [hx,hy]=point(t*.75);
  ctx.setLineDash([7,9]);line(ctx,[[hx,240],[hx,hy],[240,hy]],110,3);ctx.setLineDash([]);
  ctx.lineWidth=stroke;
  line(ctx,Array.from({length:721},(_,i)=>point(i*tau/720)),145,ctx.lineWidth);
  const head=t*.75;
  for(let i=0;i<40;i++)line(ctx,[point(head-.65+i*.65/40),point(head-.65+(i+1)*.65/40)],Math.round(145+i*2.7),ctx.lineWidth);
  circle(ctx,...point(head),7,255,true);
  for(let i=0;i<12;i++)circle(ctx,...point(head-i*tau/12),4,210,true);
}

export function networkSort(input) {
  const values=[...input], frames=[[...values]];
  for(let stage=0;stage<values.length;stage++) {
    for(let row=stage%2;row<values.length-1;row+=2) {
      if(values[row]>values[row+1])[values[row],values[row+1]]=[values[row+1],values[row]];
    }
    frames.push([...values]);
  }
  return frames;
}
const sortFrames=networkSort([6,2,7,3,8,1,5,4]);
function sorting(ctx,t) {
  const progress=(t*.8)%10,stage=Math.min(8,Math.floor(progress)),u=stage===8?0:progress%1;
  const y=row=>75+row*46, x=50+stage*46;
  for(let row=0;row<8;row++)line(ctx,[[40,y(row)],[433,y(row)]],75,3);
  for(let column=0;column<8;column++)for(let row=column%2;row<7;row+=2) {
    const X=73+column*46,shade=column===stage?220:105;
    line(ctx,[[X,y(row)],[X,y(row+1)]],shade,4);
    circle(ctx,X,y(row),4,shade,true);circle(ctx,X,y(row+1),4,shade,true);
    line(ctx,[[X-6,y(row)+10],[X,y(row)+3],[X+6,y(row)+10]],shade,3);
    line(ctx,[[X-6,y(row+1)-10],[X,y(row+1)-3],[X+6,y(row+1)-10]],shade,3);
  }
  const before=sortFrames[stage],after=sortFrames[Math.min(8,stage+1)];
  for(let row=0;row<8;row++) {
    const value=before[row],to=after.indexOf(value),mix=Math.max(0,Math.min(1,(u-.25)*2));
    const X=x+u*46,Y=y(row)+(y(to)-y(row))*mix;
    circle(ctx,X,Y,3+value*.8,130+value*15,true);
  }
  ctx.font="21px monospace";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillStyle=gray(180);
  for(let column=0;column<8;column++)ctx.fillText(String(column+1),73+column*46,35);
  for(let row=0;row<8;row++) {
    ctx.fillText(String(sortFrames[0][row]),20,y(row));
    if(stage===8)ctx.fillText(String(before[row]),456,y(row));
  }
}

export function incrementTape(bits) {
  const tape=[null,...Array.from(bits,Number),null],frames=[];
  let head=1,state="scan";
  frames.push({tape:[...tape],head,state});
  while(state!=="halt") {
    if(state==="scan") {
      if(tape[head]===null){state="carry";head--;}
      else head++;
    } else if(tape[head]===1) {tape[head]=0;head--;}
    else {tape[head]=1;state="halt";}
    frames.push({tape:[...tape],head,state});
  }
  return frames;
}
const tapeFrames=incrementTape("1011");
function turing(ctx,t) {
  const progress=t*.85%(tapeFrames.length+2),index=Math.min(tapeFrames.length-1,Math.floor(progress));
  const current=tapeFrames[index],next=tapeFrames[Math.min(index+1,tapeFrames.length-1)],u=progress%1;
  const head=66+58*(current.head+(next.head-current.head)*u*u*(3-2*u))+29;
  for(let i=0;i<3;i++) {
    const x=88+i*152,active=current.state===["scan","carry","halt"][i];
    ctx.lineWidth=5;circle(ctx,x,95,36,active?245:100);
    if(i===2){ctx.lineWidth=3;circle(ctx,x,95,28,active?245:100);}
    ctx.font="19px monospace";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillStyle=gray(active?245:140);
    ctx.fillText(["scan","carry","halt"][i],x,95);
    if(i<2)line(ctx,[[x+40,95],[x+112,95],[x+103,88],[x+112,95],[x+103,102]],100,4);
  }
  const controller=88+["scan","carry","halt"].indexOf(current.state)*152;
  line(ctx,[[controller,135],[controller,155],[head,155],[head,187]],150,4);
  line(ctx,[[head-20,185],[head+20,185],[head+20,219],[head,233],[head-20,219],[head-20,185]],225,5);
  for(let i=0;i<current.tape.length;i++) {
    const x=66+i*58;
    ctx.fillStyle=gray(i===current.head?75:25);ctx.fillRect(x+2,247,54,58);
    line(ctx,[[x,245],[x+58,245],[x+58,307],[x,307],[x,245]],155,4);
    ctx.font="36px monospace";ctx.fillStyle=gray(225);
    ctx.fillText(current.tape[i]===null?"·":String(current.tape[i]),x+29,277);
    for(const y of [234,320])circle(ctx,x+29,y,4,170,true);
  }
  line(ctx,[[66,320],[414,320]],75,3);
  ctx.font="24px monospace";ctx.fillStyle=gray(150);
  ctx.fillText(current.state==="halt"?"1011 + 1 = 1100":"1011 + 1",240,375);
}

export function searchTree(value) {
  const path=[];let low=1,high=7;
  while(low<=high) {
    const key=Math.floor((low+high)/2);path.push(key);
    if(key===value)break;
    if(value<key)high=key-1;else low=key+1;
  }
  return path;
}
const treePoint=key=>[60+(key-1)*60,80+(2-Math.log2(key&-key))*140];
function tree(ctx,t) {
  const query=[6,1,7,3][Math.floor(t/7)%4],path=searchTree(query),progress=(t%7)*.85;
  const step=Math.min(path.length-1,Math.floor(progress)),u=progress%1;
  for(let key=1;key<=7;key++) {
    const depth=2-Math.log2(key&-key),from=treePoint(key);
    if(depth===2)continue;
    for(const child of [key-(1<<(1-depth)),key+(1<<(1-depth))]) {
      const to=treePoint(child),length=Math.hypot(to[0]-from[0],to[1]-from[1]);
      const ends=[from.map((v,i)=>v+(to[i]-v)*35/length),to.map((v,i)=>v+(from[i]-v)*35/length)];
      const visited=path.indexOf(key)>=0&&path.indexOf(child)===path.indexOf(key)+1&&path.indexOf(child)<=step;
      line(ctx,ends,visited?245:140,6);
    }
  }
  ctx.font="bold 44px monospace";ctx.textAlign="center";ctx.textBaseline="middle";
  for(let key=1;key<=7;key++) {
    const [x,y]=treePoint(key),visited=path.slice(0,step+1).includes(key);
    circle(ctx,x,y,34,visited?65:20,true);
    ctx.lineWidth=5;circle(ctx,x,y,34,visited?250:190);
    ctx.fillStyle=gray(250);ctx.fillText(String(key),x,y+1);
  }
  if(step<path.length-1) {
    const from=treePoint(path[step]),to=treePoint(path[step+1]);
    const length=Math.hypot(to[0]-from[0],to[1]-from[1]),along=35+(length-70)*u;
    circle(ctx,from[0]+(to[0]-from[0])*along/length,from[1]+(to[1]-from[1])*along/length,8,255,true);
  } else {ctx.lineWidth=4;circle(ctx,...treePoint(query),43,240);}
  ctx.font="30px monospace";ctx.fillStyle=gray(200);ctx.fillText(`find ${query}`,240,441);
}

export function armPose(t) {
  const base=[110,395],tip=[270+45*Math.cos(t),205+35*Math.sin(t*2)];
  const dx=tip[0]-base[0],dy=tip[1]-base[1],upper=165,forearm=145;
  const elbowAngle=Math.acos(Math.max(-1,Math.min(1,(dx*dx+dy*dy-upper*upper-forearm*forearm)/(2*upper*forearm))));
  const shoulder=Math.atan2(dy,dx)-Math.atan2(forearm*Math.sin(elbowAngle),upper+forearm*Math.cos(elbowAngle));
  return {base,elbow:[base[0]+upper*Math.cos(shoulder),base[1]+upper*Math.sin(shoulder)],tip};
}
function robot(ctx,t) {
  const {base,elbow,tip}=armPose(t*.55);
  ctx.translate(240,240);ctx.scale(1.25,1.25);ctx.translate(-230,-265);
  const trace=Array.from({length:181},(_,i)=>{const [x,y]=armPose(i*tau/180).tip;return [x,y+45];});
  ctx.setLineDash([5,9]);line(ctx,trace,90,3);ctx.setLineDash([]);
  // A cast pedestal, tapered link housings, and separate bearings keep the silhouette legible.
  ctx.fillStyle=gray(110);ctx.beginPath();
  for(const [i,[x,y]] of [[72,416],[88,384],[132,384],[148,416]].entries())i?ctx.lineTo(x,y):ctx.moveTo(x,y);
  ctx.closePath();ctx.fill();ctx.strokeStyle=gray(210);ctx.lineWidth=5;ctx.stroke();
  ctx.fillStyle=gray(150);ctx.fillRect(48,416,124,13);
  for(const x of [61,159])circle(ctx,x,422,4,245,true);
  for(const [from,to,halfWidth] of [[base,elbow,25],[elbow,tip,19]]) {
    const length=Math.hypot(to[0]-from[0],to[1]-from[1]);
    ctx.save();ctx.translate(...from);ctx.rotate(Math.atan2(to[1]-from[1],to[0]-from[0]));
    ctx.beginPath();
    [[20,-halfWidth],[length-20,-halfWidth*.65],[length-12,0],[length-20,halfWidth*.65],[20,halfWidth]].forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));
    ctx.closePath();ctx.fillStyle=gray(145);ctx.fill();ctx.strokeStyle=gray(220);ctx.lineWidth=4;ctx.stroke();
    line(ctx,[[38,-halfWidth*.5],[length-34,-halfWidth*.35]],240,5);
    line(ctx,[[40,halfWidth*.3],[length-36,halfWidth*.2]],45,7);
    ctx.restore();
  }
  for(const [point,radius] of [[base,30],[elbow,24],[tip,13]]) {
    circle(ctx,...point,radius,45,true);ctx.lineWidth=6;circle(ctx,...point,radius,240);
    circle(ctx,...point,radius*.43,170,true);circle(ctx,...point,radius*.2,35,true);
  }
  line(ctx,[[tip[0],tip[1]+7],[tip[0],tip[1]+17]],220,12);
  line(ctx,[[tip[0]-20,tip[1]+17],[tip[0]+20,tip[1]+17]],200,9);
  for(const side of [-1,1])line(ctx,[[tip[0]+side*20,tip[1]+17],[tip[0]+side*20,tip[1]+37],[tip[0]+side*9,tip[1]+45]],235,7);
}

const harmonics=[1,3,5,7];
const fourierY=t=>240+harmonics.reduce((sum,n)=>sum+70/n*Math.sin(n*t),0);
function fourier(ctx,t) {
  const phase=t*.65;
  line(ctx,[[290,240],[465,240]],80,3);
  for(let x=300;x<=460;x+=40)line(ctx,[[x,234],[x,246]],125,3);
  // The ideal square wave shows what the finite sum is approaching.
  ctx.setLineDash([6,8]);
  line(ctx,Array.from({length:241},(_,i)=>[300+i*160/240,240+Math.PI*70/4*Math.sign(Math.sin(phase-i*tau/180))]),75,3);
  ctx.setLineDash([]);
  let x=145,y=240;
  for(const n of harmonics) {
    const radius=70/n,X=x+radius*Math.cos(n*phase),Y=y+radius*Math.sin(n*phase);
    ctx.lineWidth=3;circle(ctx,x,y,radius,110);
    for(let i=0;i<4;i++) {
      const a=i*tau/4;
      line(ctx,[[x+(radius-4)*Math.cos(a),y+(radius-4)*Math.sin(a)],[x+(radius+4)*Math.cos(a),y+(radius+4)*Math.sin(a)]],165,3);
    }
    line(ctx,[[x,y],[X,Y]],190,5);circle(ctx,X,Y,4,235,true);x=X;y=Y;
  }
  line(ctx,[[x,y],[300,y]],120,3);
  const wave=Array.from({length:241},(_,i)=>[300+i*160/240,fourierY(phase-i*tau/180)]);
  line(ctx,wave,220,6);circle(ctx,300,y,6,255,true);
}

const draw = { cpu, gears, adder, piston, lissajous, sorting, turing, tree, robot, fourier };
export function drawArtwork(ctx, subject, phase, mode) {
  ctx.save();ctx.lineCap="round";ctx.lineJoin="round";ctx.lineWidth=mode==="characters"?10:6;
  draw[subject](ctx,phase);
  ctx.restore();
}
