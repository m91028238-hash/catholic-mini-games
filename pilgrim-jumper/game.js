(function(){
const C=CMG,W=360,H=640,G=1500,JUMP=-700;
let P,clouds,camY=0,best,topGen,inputs={},keyDir=0,tiltDir=0,tilt=C.LS.get('pj_tilt','0')==='1',parts,stars,height,lastMile,ms;
const v=C.canvas(W,H);const ctx=v.ctx;
stars=Array.from({length:70},()=>({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.2+.3,p:Math.random()*6}));
function D(){return{brk:[.08,.15,.22,.3][C.diff],mov:[.08,.18,.28,.36][C.diff],gap:[105,122,138,150][C.diff],spd:[40,60,80,100][C.diff],wing:[.06,.05,.04,.03][C.diff]}}
function addCloud(y,type){const w=type==='brk'?66:62+Math.random()*16;const c={x:Math.random()*(W-w),y,w,type,vx:type==='mov'?(Math.random()<.5?-1:1)*D().spd*(1+Math.random()*.5):0,broken:0,wing:type==='norm'&&Math.random()<D().wing};clouds.push(c);return c}
function gen(){const d=D();while(topGen>camY-200){const prog=Math.min(1,-topGen/12000);const gap=40+Math.random()*(d.gap*(.55+.45*prog)-40);topGen-=gap;const r=Math.random();
  addCloud(topGen,r<d.mov*(.4+prog)?'mov':'norm');if(Math.random()<d.brk*(.5+prog))addCloud(topGen-gap*.5,'brk')}
  clouds=clouds.filter(c=>c.y<camY+H+60&&!(c.broken>1.2))}
function reset(){P={x:W/2-12,y:H-120,vx:0,vy:JUMP,face:1};clouds=[];camY=0;topGen=H-60;parts=[];height=0;lastMile=0;
  addCloud(H-60,'norm').x=W/2-35;clouds[0].wing=false;gen();hudU()}
function hudU(){C.hud(`Height <b>${height} m</b>`)}
function update(dt){
  let dir=keyDir;const tp=Object.values(inputs);if(tp.length)dir=tp[tp.length-1];if(!dir&&tilt)dir=tiltDir;
  P.vx+=(dir*330-P.vx)*Math.min(1,dt*10);P.x+=P.vx*dt;if(Math.abs(P.vx)>20)P.face=Math.sign(P.vx);
  if(P.x<-24)P.x=W;if(P.x>W)P.x=-24;
  const prevY=P.y;P.vy+=G*dt;P.y+=P.vy*dt;
  clouds.forEach(c=>{if(c.vx){c.x+=c.vx*dt;if(c.x<0||c.x+c.w>W)c.vx*=-1}if(c.broken)c.broken+=dt});
  if(P.vy>0)for(const c of clouds){if(c.broken)continue;const feet=P.y+34,pf=prevY+34;if(pf<=c.y+4&&feet>=c.y&&P.x+18>c.x&&P.x+6<c.x+c.w){
    if(c.type==='brk'){c.broken=.01;C.sfx('bad');for(let i=0;i<8;i++)parts.push({x:c.x+Math.random()*c.w,y:c.y,vx:(Math.random()-.5)*60,vy:Math.random()*60,l:.8,col:'#bdb3a6'});continue}
    P.y=c.y-34;if(c.wing){P.vy=JUMP*1.65;c.wing=false;C.sfx('power');C.flash('Borne on wings',900);for(let i=0;i<14;i++)parts.push({x:P.x+12,y:P.y+30,vx:(Math.random()-.5)*120,vy:Math.random()*80,l:.9,col:'#f6e27a'})}else{P.vy=JUMP;C.sfx('jump')}break}}
  camY=Math.min(camY,P.y-H*.42);const h=Math.max(0,Math.floor((H-120-P.y)/10));if(h>height){height=h;hudU();const mile=Math.floor(height/250);if(mile>lastMile){lastMile=mile;C.flash(['','Morning light','Above the hills','Among the clouds','The air grows bright','Heaven draws near','Higher still','Into the glory'][Math.min(mile,7)]||'Higher still',1300);C.sfx('bell');C.saveLevel(mile)}}
  gen();parts.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=300*dt;p.l-=dt});parts=parts.filter(p=>p.l>0);
  if(P.y>camY+H+30){C.score=height;C.gameOver(height,{scoreLabel:'Height',msg:height>1000?'A fine climb, pilgrim.':'Take heart and try again.'})}}
function cloud(c){const x=c.x,y=c.y-camY;if(c.broken){ctx.globalAlpha=Math.max(0,1-c.broken)}
  const col=c.type==='brk'?'#b9afa3':'#f4ede0';ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(x+c.w*.3,y+2,c.w*.24,10,0,0,7);ctx.ellipse(x+c.w*.55,y-3,c.w*.26,13,0,0,7);ctx.ellipse(x+c.w*.78,y+3,c.w*.2,9,0,0,7);ctx.fill();
  ctx.fillStyle=c.type==='brk'?'#8f857a':'#d9cdb6';ctx.fillRect(x+c.w*.1,y+6,c.w*.8,5);
  if(c.type==='brk'){ctx.strokeStyle='#6e655c';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x+c.w*.4,y-8);ctx.lineTo(x+c.w*.48,y);ctx.lineTo(x+c.w*.42,y+8);ctx.moveTo(x+c.w*.7,y-4);ctx.lineTo(x+c.w*.64,y+6);ctx.stroke()}
  if(c.type==='mov'){ctx.strokeStyle='rgba(212,175,55,.8)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x+c.w*.15,y+11);ctx.lineTo(x+c.w*.85,y+11);ctx.stroke()}
  if(c.wing){const wx=x+c.w/2,wy=y-18,t=performance.now()/300;ctx.save();ctx.translate(wx,wy+Math.sin(t)*2);ctx.fillStyle=C.goldGrad(ctx,-12,-8,12,8);ctx.shadowColor='#f6e27a';ctx.shadowBlur=10;
    for(const s of[-1,1]){ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(s*14,-12,s*16,-2);ctx.quadraticCurveTo(s*10,0,s*12,4);ctx.quadraticCurveTo(s*6,2,0,4);ctx.fill()}ctx.restore()}
  ctx.globalAlpha=1}
function pilgrim(){const x=P.x,y=P.y-camY;ctx.save();ctx.translate(x+12,y);ctx.scale(P.face,1);
  ctx.strokeStyle='#8a6a3a';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(10,2);ctx.lineTo(13,34);ctx.stroke();ctx.fillStyle='#f3e7c6';ctx.beginPath();ctx.arc(10.5,6,3,0,7);ctx.fill();
  ctx.fillStyle='#5b3a24';ctx.beginPath();ctx.moveTo(-9,30);ctx.quadraticCurveTo(-10,12,0,9);ctx.quadraticCurveTo(10,12,9,30);ctx.closePath();ctx.fill();ctx.fillStyle='#4a2e1c';ctx.fillRect(-9,28,18,4);
  ctx.fillStyle='#e8c9a0';ctx.beginPath();ctx.arc(0,5,5,0,7);ctx.fill();ctx.fillStyle='#3e2617';ctx.beginPath();ctx.ellipse(0,0,10,2.6,0,0,7);ctx.fill();ctx.beginPath();ctx.arc(0,-.5,5,Math.PI,0);ctx.fill();
  ctx.fillStyle='#f3e7c6';ctx.beginPath();ctx.arc(-3,16,2.6,0,7);ctx.fill();ctx.fillStyle='#3e2617';ctx.fillRect(-3,30,3,4);ctx.fillRect(2,30,3,4);ctx.restore()}
function draw(){const prog=Math.min(1,-camY/15000);
  const sky=ctx.createLinearGradient(0,0,0,H);const mix=(a,b)=>a.map((v,i)=>Math.round(v+(b[i]-v)*prog));const top=mix([26,10,16],[246,226,160]),mid=mix([60,18,30],[250,236,200]),bot=mix([13,7,9],[230,190,110]);
  sky.addColorStop(0,`rgb(${top})`);sky.addColorStop(.6,`rgb(${mid})`);sky.addColorStop(1,`rgb(${bot})`);ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#fff8e0';stars.forEach(s=>{const y=((s.y-camY*.08)%H+H)%H;ctx.globalAlpha=(1-prog)*(.4+.4*Math.sin(performance.now()/700+s.p));ctx.beginPath();ctx.arc(s.x,y,s.r,0,7);ctx.fill()});ctx.globalAlpha=1;
  const rays=ctx.createRadialGradient(W/2,-60,10,W/2,-60,H*.9);rays.addColorStop(0,`rgba(255,246,210,${.25+prog*.6})`);rays.addColorStop(1,'rgba(255,246,210,0)');ctx.fillStyle=rays;ctx.fillRect(0,0,W,H);
  const gy=H-30-camY*.5;if(gy<H+200){ctx.fillStyle='#120a0b';ctx.beginPath();ctx.moveTo(0,gy+40);ctx.lineTo(0,gy);ctx.lineTo(60,gy-30);ctx.lineTo(120,gy+5);ctx.lineTo(150,gy+5);ctx.lineTo(150,gy-70);ctx.lineTo(165,gy-105);ctx.lineTo(180,gy-70);ctx.lineTo(180,gy-20);ctx.lineTo(240,gy-20);ctx.lineTo(240,gy-50);ctx.lineTo(260,gy-50);ctx.lineTo(260,gy+5);ctx.lineTo(300,gy-25);ctx.lineTo(W,gy+10);ctx.lineTo(W,H+300);ctx.lineTo(0,H+300);ctx.fill();ctx.fillStyle='#d4af37';ctx.fillRect(164,gy-118,2,13);ctx.fillRect(160,gy-114,10,2)}
  if(!P)return;clouds.forEach(cloud);parts.forEach(p=>{ctx.globalAlpha=Math.max(0,p.l);ctx.fillStyle=p.col;ctx.fillRect(p.x-2,p.y-camY-2,4,4)});ctx.globalAlpha=1;pilgrim()}
v.cv.addEventListener('pointerdown',e=>{if(C.state!=='play')return;const p=v.pt(e);inputs[e.pointerId]=p.x<W/2?-1:1});
['pointerup','pointercancel','pointerleave'].forEach(t=>v.cv.addEventListener(t,e=>{delete inputs[e.pointerId]}));
addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='a'){keyDir=-1;e.preventDefault()}else if(e.key==='ArrowRight'||e.key==='d'){keyDir=1;e.preventDefault()}});
addEventListener('keyup',e=>{if((e.key==='ArrowLeft'||e.key==='a')&&keyDir<0)keyDir=0;if((e.key==='ArrowRight'||e.key==='d')&&keyDir>0)keyDir=0});
addEventListener('deviceorientation',e=>{if(e.gamma==null)return;const g=e.gamma;tiltDir=Math.abs(g)<4?0:Math.max(-1,Math.min(1,g/18))});
C.controls([{label:'&#9664;',aria:'Left',fn:()=>inputs.b=-1,up:()=>delete inputs.b},{label:'&#9654;',aria:'Right',fn:()=>inputs.b=1,up:()=>delete inputs.b}]);
C.init({id:'pj',title:'Pilgrim Jumper',key:'pj_best',lkey:'pj_lvl',desc:'Bounce from cloud to cloud towards Heaven. Hold left or right side of the screen, use the arrows, or tilt your phone. Grey clouds crumble; golden wings lift you high.',diffs:['Easy','Medium','Hard','Saint'],fmt:x=>x+' m',bestLabel:'Best height',
  menuExtra:[()=>({label:'Tilt control: '+(tilt?'On':'Off'),sec:1,fn:()=>{tilt=!tilt;C.LS.set('pj_tilt',tilt?1:0);try{if(tilt&&window.DeviceOrientationEvent&&DeviceOrientationEvent.requestPermission)DeviceOrientationEvent.requestPermission().catch(()=>{})}catch(e){}C.menu()}})],
  onStart(){inputs={};keyDir=0;reset()}});
C.loop(update,draw);
})();
