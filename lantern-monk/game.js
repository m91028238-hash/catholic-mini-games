(function(){
const C=CMG,TW=19,TH=27,CW=9,CH=13,TS=20,W=TW*TS,H=TH*TS;
const DIRS={left:[-1,0],right:[1,0],up:[0,-1],down:[0,1]};
let T,cand,lit,total,monk,want,shadows,lives,level,score,fright,frightMax,clock,deadT,banishCount,relics;
const v=C.canvas(W,H);const ctx=v.ctx;
const dark=document.createElement('canvas');dark.width=W;dark.height=H;const dctx=dark.getContext('2d');
const lightSpr=document.createElement('canvas');lightSpr.width=lightSpr.height=128;(()=>{const g=lightSpr.getContext('2d'),gr=g.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,'rgba(0,0,0,1)');gr.addColorStop(.55,'rgba(0,0,0,.75)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,128,128)})();
function gen(seed){const r=C.rng(seed);T=Array.from({length:TH},()=>Array(TW).fill(1));
  const vis={},st=[[4,CH-1]];vis['4,'+(CH-1)]=1;T[2*(CH-1)+1][9]=0;
  while(st.length){const[cx,cy]=st[st.length-1];const nb=[[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dy])=>[cx+dx,cy+dy,dx,dy]).filter(([x,y])=>x>=0&&x<=4&&y>=0&&y<CH&&!vis[x+','+y]);
    if(!nb.length){st.pop();continue}const[nx,ny,dx,dy]=nb[Math.floor(r()*nb.length)];vis[nx+','+ny]=1;T[2*cy+1+dy][2*cx+1+dx]=0;T[2*ny+1][2*nx+1]=0;st.push([nx,ny])}
  const mirror=()=>{for(let y=0;y<TH;y++)for(let x=10;x<TW;x++)T[y][x]=T[y][18-x]};mirror();
  for(let pass=0;pass<2;pass++){for(let cy=0;cy<CH;cy++)for(let cx=0;cx<=4;cx++){const tx=2*cx+1,ty=2*cy+1;const open=[[1,0],[-1,0],[0,1],[0,-1]].filter(([dx,dy])=>!T[ty+dy][tx+dx]);
    if(open.length<=1||r()<.12){const cl=[[1,0],[-1,0],[0,1],[0,-1]].filter(([dx,dy])=>T[ty+dy][tx+dx]&&tx+2*dx>0&&tx+2*dx<TW-1&&ty+2*dy>0&&ty+2*dy<TH-1&&!(cx===4&&dx===1));if(cl.length){const[dx,dy]=cl[Math.floor(r()*cl.length)];T[ty+dy][tx+dx]=0}}}mirror()}
  /* shadow chapel in the centre */
  for(let y=12;y<=14;y++)for(let x=7;x<=11;x++)T[y][x]=0;}
function open(x,y){return y>=0&&y<TH&&x>=0&&x<TW&&!T[y][x]}
function setupLevel(){gen(level*977+C.diff*31+7);cand=[];lit={};relics={};
  for(let y=0;y<TH;y++)for(let x=0;x<TW;x++)if(!T[y][x]&&!(y>=12&&y<=14&&x>=7&&x<=11)&&!(x===9&&y===25))cand.push(x+','+y);
  [[1,1],[17,1],[1,25],[17,25]].forEach(([x,y])=>{relics[x+','+y]=1});total=cand.length;resetPos()}
function resetPos(){monk={x:9,y:25,d:null,p:0};want=null;fright=0;clock=0;deadT=0;
  const n=[2,3,4,4][C.diff];shadows=[];for(let i=0;i<n;i++)shadows.push({x:8+(i%3),y:13,d:[0,-1],p:0,i,rel:i*[4,3,2,1.2][C.diff],eyes:false,home:true});}
function hudU(){C.hud(`Score <b>${score}</b><br>Candles <b>${Object.keys(lit).length}/${total}</b> · ${'&#10014;'.repeat(lives)}`)}
function step(e,speed,dt,choose){e.p+=speed*dt;let guard=0;while(e.p>=1&&guard++<3){e.x+=e.d[0];e.y+=e.d[1];e.p-=1;choose(e)}}
function monkChoose(e){if(want&&open(e.x+want[0],e.y+want[1]))e.d=want;if(!e.d||!open(e.x+e.d[0],e.y+e.d[1])){e.d=null;e.p=0}
  const k=e.x+','+e.y;if(!lit[k]&&cand.includes(k)){lit[k]=1;score+=10;if(Object.keys(lit).length%6===0)C.sfx('tap');hudU()}
  if(relics[k]){delete relics[k];score+=50;fright=Math.max(2,frightMax-(level-1)*.3);banishCount=0;shadows.forEach(s=>{if(!s.eyes&&!s.home){s.d=[-s.d[0],-s.d[1]];s.p=1-s.p;s.x-=s.d[0];s.y-=s.d[1]}});C.sfx('power');C.flash('Blessed relic',1000);hudU()}
  if(Object.keys(lit).length>=total){score+=500;level++;C.saveLevel(level);C.sfx('win');C.flash('Catacomb '+level+' · all candles lit');setupLevel();hudU()}}
function ghostChoose(s){
  if(s.eyes&&s.x===9&&s.y===13){s.eyes=false}
  const opts=Object.values(DIRS).filter(d=>open(s.x+d[0],s.y+d[1])&&!(d[0]===-s.d[0]&&d[1]===-s.d[1]));const o=opts.length?opts:[[-s.d[0],-s.d[1]]];
  let tx,ty;const md=monk.d||[0,0];
  if(s.eyes){tx=9;ty=13}else if(clock<5){tx=[1,17,1,17][s.i];ty=[1,1,25,25][s.i]}else if(s.i===1){tx=monk.x+md[0]*4;ty=monk.y+md[1]*4}else if(s.i===2&&Math.hypot(monk.x-s.x,monk.y-s.y)<7){tx=1;ty=25}else{tx=monk.x;ty=monk.y}
  const fr=fright>0&&!s.eyes;
  if(s.i===3&&!fr&&!s.eyes&&Math.random()<.35){s.d=o[Math.floor(Math.random()*o.length)];return}
  let best=null,bv=fr?-1e9:1e9;for(const d of o){const dd=Math.hypot(s.x+d[0]-tx,s.y+d[1]-ty)+(fr?Math.random()*3:0);if(fr?dd>bv:dd<bv){bv=dd;best=d}}s.d=best}
function update(dt){
  if(deadT){deadT-=dt;if(deadT<=0){deadT=0;if(lives<=0){C.score=score;C.gameOver(score,{msg:`${Object.keys(lit).length} candles lit · catacomb ${level}`});return}resetPos()}return}
  clock+=dt;fright=Math.max(0,fright-dt);
  if(!monk.d&&want&&open(monk.x+want[0],monk.y+want[1])){monk.d=want;monk.p=0}
  if(monk.d&&want&&want[0]===-monk.d[0]&&want[1]===-monk.d[1]&&monk.p>0){monk.x+=monk.d[0];monk.y+=monk.d[1];monk.p=1-monk.p;monk.d=want}
  if(monk.d)step(monk,5.6,dt,monkChoose);
  const gs=Math.min(5.9,[3.6,4.4,5.0,5.4][C.diff]+(level-1)*.12);
  shadows.forEach(s=>{if(s.home){s.rel-=dt;if(s.rel<=0){s.home=false;s.x=9;s.y=13;s.p=0;s.d=[0,-1];ghostChoose(s)}return}
    step(s,s.eyes?9:(fright>0?2.6:gs),dt,ghostChoose);
    const mx=monk.x+(monk.d?monk.d[0]*monk.p:0),my=monk.y+(monk.d?monk.d[1]*monk.p:0),sx=s.x+s.d[0]*s.p,sy=s.y+s.d[1]*s.p;
    if(!s.eyes&&Math.hypot(mx-sx,my-sy)<.7){if(fright>0){s.eyes=true;banishCount++;const pts=200*Math.pow(2,banishCount-1);score+=pts;C.sfx('bell');C.flash('Shadow banished +'+pts,900);hudU()}else{lives--;deadT=1.4;C.sfx('bad');hudU()}}})}
function draw(){
  ctx.fillStyle='#0b0607';ctx.fillRect(0,0,W,H);if(!T)return;const t=performance.now()/1000;
  for(let y=0;y<TH;y++)for(let x=0;x<TW;x++){if(T[y][x]){ctx.fillStyle=(x+y)%2?'#2a1c18':'#30201b';ctx.fillRect(x*TS,y*TS,TS,TS);
    if(!open(x,y-1)===false){ctx.fillStyle='rgba(212,175,55,.18)';ctx.fillRect(x*TS,y*TS,TS,1.5)}}else{ctx.fillStyle='#140b0b';ctx.fillRect(x*TS,y*TS,TS,TS)}}
  ctx.strokeStyle='rgba(212,175,55,.35)';ctx.lineWidth=1;ctx.strokeRect(7*TS+.5,12*TS+.5,5*TS-1,3*TS-1);
  for(const k of cand){const[x,y]=k.split(',').map(Number),cx=x*TS+TS/2,cy=y*TS+TS/2;ctx.fillStyle='#e9dfc9';ctx.fillRect(cx-1.5,cy-2,3,7);
    if(lit[k]){const f=Math.sin(t*9+x*3+y)*0.6;ctx.fillStyle='#f6c64a';ctx.beginPath();ctx.ellipse(cx,cy-5+f*.3,2,3.6,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff6d0';ctx.beginPath();ctx.arc(cx,cy-4.5,1,0,Math.PI*2);ctx.fill()}}
  for(const k in relics){const[x,y]=k.split(',').map(Number),cx=x*TS+TS/2,cy=y*TS+TS/2,pu=1+Math.sin(t*4)*.12;
    ctx.save();ctx.translate(cx,cy);ctx.scale(pu,pu);ctx.shadowColor='#f6e27a';ctx.shadowBlur=14;ctx.fillStyle=C.goldGrad(ctx,-8,-8,8,8);ctx.fillRect(-6,-2,12,9);ctx.beginPath();ctx.moveTo(-7,-2);ctx.lineTo(0,-7);ctx.lineTo(7,-2);ctx.fill();ctx.fillRect(-1,-12,2,6);ctx.fillRect(-3,-10,6,2);ctx.restore()}
  const mx=(monk.x+(monk.d?monk.d[0]*monk.p:0))*TS+TS/2,my=(monk.y+(monk.d?monk.d[1]*monk.p:0))*TS+TS/2;
  shadows.forEach(s=>{const sx=(s.x+s.d[0]*s.p)*TS+TS/2,sy=(s.y+s.d[1]*s.p)*TS+TS/2+(s.home?Math.sin(t*3+s.i)*2:0);ctx.save();ctx.translate(sx,sy);
    if(s.eyes){ctx.globalAlpha=.6;ctx.fillStyle='#efe6d4';ctx.beginPath();ctx.arc(-3,-1,2,0,7);ctx.arc(3,-1,2,0,7);ctx.fill();ctx.restore();return}
    const fr=fright>0,blink=fr&&fright<1.5&&Math.floor(t*6)%2;ctx.globalAlpha=fr?.55:.92;ctx.fillStyle=fr?(blink?'#efe6d4':'#8d97b8'):['#2b1838','#1d2238','#331a24','#1f2a2a'][s.i];
    ctx.shadowColor=fr?'#cfd6ff':'#000';ctx.shadowBlur=8;ctx.beginPath();ctx.arc(0,-2,8,Math.PI,0);for(let i=0;i<=4;i++)ctx.lineTo(8-i*4,7+Math.sin(t*10+i+s.i)*1.6*(i%2?1:-1));ctx.closePath();ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle=fr?'rgba(239,230,212,.7)':'rgba(190,170,215,.55)';ctx.lineWidth=1.2;ctx.stroke();
    ctx.globalAlpha=1;ctx.fillStyle=fr?'#2a1c18':'#c9b9a0';ctx.beginPath();ctx.arc(-3,-2,1.6,0,7);ctx.arc(3,-2,1.6,0,7);ctx.fill();ctx.restore()});
  /* monk */
  ctx.save();ctx.translate(mx,my);if(deadT){ctx.globalAlpha=.4+.4*Math.sin(t*20)}ctx.fillStyle='#5b3a24';ctx.beginPath();ctx.arc(0,1,8,0,Math.PI*2);ctx.fill();ctx.fillStyle='#3e2617';ctx.beginPath();ctx.arc(0,-1,5.5,Math.PI*1.05,Math.PI*1.95);ctx.fill();ctx.fillStyle='#e8c9a0';ctx.beginPath();ctx.arc(0,0,3.6,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#d4af37';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-6,6);ctx.lineTo(6,6);ctx.stroke();const lx=(monk.d?monk.d[0]:1)*7,ly=(monk.d?monk.d[1]:0)*7+3;ctx.fillStyle='#f6e27a';ctx.shadowColor='#f6e27a';ctx.shadowBlur=12;ctx.fillRect(lx-2.5,ly-3,5,6);ctx.restore();
  /* darkness with light from lantern and lit candles */
  dctx.globalCompositeOperation='source-over';dctx.clearRect(0,0,W,H);dctx.fillStyle=`rgba(4,2,3,${[.55,.68,.76,.82][C.diff]})`;dctx.fillRect(0,0,W,H);dctx.globalCompositeOperation='destination-out';
  const R=110+Math.sin(t*5)*3;dctx.drawImage(lightSpr,mx-R,my-R,R*2,R*2);for(const k in lit){const[x,y]=k.split(',');dctx.drawImage(lightSpr,x*TS-12,y*TS-12,TS+24,TS+24)}
  for(const k in relics){const[x,y]=k.split(',');dctx.drawImage(lightSpr,x*TS-10,y*TS-10,TS+20,TS+20)}
  ctx.drawImage(dark,0,0);
  ctx.save();ctx.globalCompositeOperation='lighter';const lg=ctx.createRadialGradient(mx,my,0,mx,my,70);lg.addColorStop(0,'rgba(246,200,100,.18)');lg.addColorStop(1,'rgba(246,200,100,0)');ctx.fillStyle=lg;ctx.fillRect(mx-70,my-70,140,140);ctx.restore();
  ctx.strokeStyle=C.goldGrad(ctx,0,0,W,H);ctx.lineWidth=2;ctx.strokeRect(1,1,W-2,H-2)}
const go=d=>{if(C.state==='play')want=DIRS[d]};
C.swipe(v.cv,go);
addEventListener('keydown',e=>{const d={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',a:'left',d:'right',w:'up',s:'down'}[e.key];if(d){e.preventDefault();go(d)}});
C.controls([{label:'&#9664;',aria:'Left',fn:()=>go('left')},{label:'&#9650;',aria:'Up',fn:()=>go('up')},{label:'&#9660;',aria:'Down',fn:()=>go('down')},{label:'&#9654;',aria:'Right',fn:()=>go('right')}]);
C.init({id:'lm',title:'Lantern Monk',key:'lm_best',lkey:'lm_lvl',desc:'Carry your lantern through the catacombs and light every candle. Shadows follow you; a blessed relic sends them fleeing. Swipe or use the arrows.',diffs:['Easy','Medium','Hard','Saint'],
  onStart(){score=0;lives=3;level=1;frightMax=[9,7,5,3.5][C.diff];setupLevel();hudU()}});
C.loop(update,draw);
})();
