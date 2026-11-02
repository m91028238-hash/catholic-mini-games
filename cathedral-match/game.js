(function(){
const C=CMG,W=380,H=652,COLS=7,ROWS=8,S=52,BX=8,BY=228;
const BG=['#7a1426','#9a6b12','#3a2a20','#1f3f8f','#2a5f6b','#1f6b45'];
let grid,sel,busy,phase,combo,moves,target,lvScore,score,level,types,removing,popT,anims=[],litPrev=0,sparks=[];
const v=C.canvas(W,H);const ctx=v.ctx;
/* sprites */
const spr=[];for(let t=0;t<6;t++){const c=document.createElement('canvas');c.width=c.height=112;const g=c.getContext('2d');g.scale(2,2);drawPiece(g,t);spr.push(c)}
function drawPiece(g,t){const s=56,cx=28,cy=28;g.save();
  const bg=g.createRadialGradient(cx-8,cy-10,4,cx,cy,30);bg.addColorStop(0,GLASS.shade(BG[t],.25));bg.addColorStop(1,GLASS.shade(BG[t],-.35));g.fillStyle=bg;CMG.rr(g,3,3,s-6,s-6,12);g.fill();g.strokeStyle='rgba(243,217,139,.55)';g.lineWidth=1.2;g.stroke();
  const gold=CMG.goldGrad(g,10,10,46,46);g.lineCap='round';g.lineJoin='round';g.shadowColor='rgba(0,0,0,.5)';g.shadowBlur=3;
  if(t===0){/* rosary */g.fillStyle='#f3d98b';for(let i=0;i<14;i++){const a=i/14*Math.PI*2-Math.PI/2;if(i===7)continue;g.beginPath();g.arc(cx+Math.cos(a)*13,cy-4+Math.sin(a)*13,2.4,0,7);g.fill()}
    g.fillStyle=gold;g.fillRect(cx-1.5,cy+8,3,16);g.fillRect(cx-5,cy+13,10,3)}
  else if(t===1){/* chalice */g.fillStyle=gold;g.beginPath();g.moveTo(cx-13,cy-14);g.lineTo(cx+13,cy-14);g.quadraticCurveTo(cx+12,cy+2,cx+2,cy+5);g.lineTo(cx+2,cy+13);g.quadraticCurveTo(cx+10,cy+15,cx+11,cy+19);g.lineTo(cx-11,cy+19);g.quadraticCurveTo(cx-10,cy+15,cx-2,cy+13);g.lineTo(cx-2,cy+5);g.quadraticCurveTo(cx-12,cy+2,cx-13,cy-14);g.fill();g.fillStyle='#fbf6e8';g.beginPath();g.arc(cx,cy-18,5,0,7);g.fill()}
  else if(t===2){/* candle */g.fillStyle='#f4ecd8';g.fillRect(cx-6,cy-6,12,26);g.fillStyle='rgba(0,0,0,.12)';g.fillRect(cx+2,cy-6,4,26);g.shadowColor='#f6c64a';g.shadowBlur=10;g.fillStyle='#f6c64a';g.beginPath();g.ellipse(cx,cy-13,4,7,0,0,7);g.fill();g.fillStyle='#fff6d0';g.beginPath();g.ellipse(cx,cy-12,1.8,3.5,0,0,7);g.fill()}
  else if(t===3){/* cross */g.fillStyle=gold;g.fillRect(cx-3.5,cy-19,7,40);g.fillRect(cx-13,cy-9,26,7);g.fillStyle='#7a1426';g.beginPath();g.arc(cx,cy-5.5,2.5,0,7);g.fill()}
  else if(t===4){/* dove */g.fillStyle='#fbf6e8';g.beginPath();g.moveTo(cx-18,cy+4);g.quadraticCurveTo(cx-4,cy-2,cx+5,cy+1);g.quadraticCurveTo(cx+13,cy-3,cx+18,cy-1);g.quadraticCurveTo(cx+21,cy+1,cx+17,cy+3);g.quadraticCurveTo(cx+11,cy+5,cx+8,cy+9);g.quadraticCurveTo(cx-2,cy+15,cx-13,cy+10);g.lineTo(cx-21,cy+13);g.closePath();g.fill();
    g.beginPath();g.moveTo(cx-3,cy+1);g.quadraticCurveTo(cx-10,cy-18,cx,cy-22);g.quadraticCurveTo(cx+2,cy-10,cx+8,cy+1);g.fill();g.fillStyle='#e2b23a';g.beginPath();g.moveTo(cx+18,cy-1);g.lineTo(cx+23,cy+1);g.lineTo(cx+18,cy+2);g.fill()}
  else{/* lily */g.fillStyle='#fbf6e8';for(const a of[-.55,0,.55]){g.save();g.translate(cx,cy+2);g.rotate(a);g.beginPath();g.moveTo(0,4);g.quadraticCurveTo(-8,-10,0,-20);g.quadraticCurveTo(8,-10,0,4);g.fill();g.restore()}
    g.fillStyle='#e2b23a';g.beginPath();g.arc(cx,cy+2,2.4,0,7);g.fill();g.fillStyle='#5fbf7f';g.fillRect(cx-1.2,cy+5,2.4,16)}
  g.restore()}
function rnd(){return Math.floor(Math.random()*types)}
function fill(){grid=[];for(let r=0;r<ROWS;r++){grid.push([]);for(let c=0;c<COLS;c++){let t;do{t=rnd()}while((c>1&&grid[r][c-1].t===t&&grid[r][c-2].t===t)||(r>1&&grid[r-1][c].t===t&&grid[r-2][c].t===t));grid[r].push({t,x:c,y:r-ROWS-1,a:1})}}if(!hasMove())fill()}
function matches(){const m=new Set();for(let r=0;r<ROWS;r++){let run=1;for(let c=1;c<=COLS;c++){if(c<COLS&&grid[r][c]&&grid[r][c-1]&&grid[r][c].t===grid[r][c-1].t)run++;else{if(run>=3)for(let k=c-run;k<c;k++)m.add(r*COLS+k);run=1}}}
  for(let c=0;c<COLS;c++){let run=1;for(let r=1;r<=ROWS;r++){if(r<ROWS&&grid[r][c]&&grid[r-1][c]&&grid[r][c].t===grid[r-1][c].t)run++;else{if(run>=3)for(let k=r-run;k<r;k++)m.add(k*COLS+c);run=1}}}return m}
function sw(r1,c1,r2,c2){const a=grid[r1][c1];grid[r1][c1]=grid[r2][c2];grid[r2][c2]=a}
function hasMove(){for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)for(const[dr,dc]of[[0,1],[1,0]]){const r2=r+dr,c2=c+dc;if(r2>=ROWS||c2>=COLS)continue;sw(r,c,r2,c2);const ok=matches().size>0;sw(r,c,r2,c2);if(ok)return true}return false}
function trySwap(r1,c1,r2,c2){if(busy||C.state!=='play'||r2<0||c2<0||r2>=ROWS||c2>=COLS)return;sel=null;sw(r1,c1,r2,c2);busy=true;C.sfx('move');
  if(matches().size){moves--;combo=0;phase='settle'}else{phase='back';anims=[r1,c1,r2,c2]}hudU()}
function resolve(){const m=matches();if(!m.size){busy=false;phase=null;afterTurn();return}combo++;
  let pts=m.size*10*combo+(m.size>=4?40:0)+(m.size>=5?60:0);lvScore+=pts;score+=pts;C.sfx(combo>1?'chime':'good');if(combo>1)C.flash('Cascade ×'+combo,700);
  m.forEach(i=>{const r=Math.floor(i/COLS),c=i%COLS;grid[r][c].rm=true;for(let k=0;k<4;k++)sparks.push({x:BX+c*S+S/2,y:BY+r*S+S/2,vx:(Math.random()-.5)*160,vy:(Math.random()-.5)*160-40,l:.6})});phase='pop';popT=0;hudU()}
function collapse(){for(let c=0;c<COLS;c++){const col=[];for(let r=ROWS-1;r>=0;r--)if(!grid[r][c].rm)col.push(grid[r][c]);let n=0;while(col.length<ROWS){col.push({t:rnd(),x:c,y:-1-n,a:1});n++}for(let r=ROWS-1,i=0;r>=0;r--,i++)grid[r][c]=col[i]}phase='settle'}
function afterTurn(){if(lvScore>=target){level++;C.saveLevel(level);score+=moves*20;C.sfx('win');C.flash('Cathedral lit · level '+level,1800);startLevel(false);return}
  if(moves<=0){C.score=score;C.gameOver(score,{msg:`Reached level ${level}`});return}
  if(!hasMove()){C.flash('Reshuffled',900);do{C.shuffle(grid.flat()).forEach((p,i)=>{grid[Math.floor(i/COLS)][i%COLS]=p})}while(matches().size||!hasMove())}}
function startLevel(first){target=Math.round((700+level*300)*[.8,1,1.15,1.3][C.diff]/10)*10;moves=[30,25,22,19][C.diff];lvScore=0;combo=0;busy=false;phase=null;sel=null;if(first){fill();busy=true;phase='settle'}hudU()}
function hudU(){C.hud(`Score <b>${score}</b><br>Lv <b>${level}</b> · Moves <b>${moves}</b>`)}
function update(dt){let moving=false;
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const p=grid[r][c];const dx=c-p.x,dy=r-p.y,d=Math.hypot(dx,dy),sp=11*dt;if(d>sp){p.x+=dx/d*sp;p.y+=dy/d*sp;moving=true}else{p.x=c;p.y=r}}
  sparks.forEach(s=>{s.x+=s.vx*dt;s.y+=s.vy*dt;s.vy+=200*dt;s.l-=dt});sparks=sparks.filter(s=>s.l>0);
  if(phase==='pop'){popT+=dt;if(popT>.22)collapse();return}
  if(moving)return;
  if(phase==='back'){const[r1,c1,r2,c2]=anims;sw(r1,c1,r2,c2);phase='back2';C.sfx('bad');return}
  if(phase==='back2'){phase=null;busy=false;return}
  if(phase==='settle')resolve()}
function cathedral(p){const cx=W/2,base=206;ctx.save();
  const sky=ctx.createLinearGradient(0,0,0,base);sky.addColorStop(0,`rgba(${20+60*p},${10+30*p},${16+10*p},1)`);sky.addColorStop(1,`rgba(${40+120*p},${20+70*p},${20+20*p},1)`);ctx.fillStyle=sky;C.rr(ctx,8,6,W-16,base-4,10);ctx.fill();
  const halo=ctx.createRadialGradient(cx,70,10,cx,70,200);halo.addColorStop(0,`rgba(246,226,122,${.05+p*.5})`);halo.addColorStop(1,'rgba(246,226,122,0)');ctx.fillStyle=halo;ctx.fillRect(8,6,W-16,base-4);
  ctx.fillStyle='#2a1c18';ctx.strokeStyle='rgba(212,175,55,.5)';ctx.lineWidth=1;
  /* towers */
  for(const tx of[cx-118,cx+70]){ctx.beginPath();ctx.moveTo(tx,base);ctx.lineTo(tx,70);ctx.lineTo(tx+24,22);ctx.lineTo(tx+48,70);ctx.lineTo(tx+48,base);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle=C.goldGrad(ctx,tx+20,8,tx+28,24);ctx.fillRect(tx+23,8,2,14);ctx.fillRect(tx+19,12,10,2);ctx.fillStyle='#2a1c18'}
  ctx.beginPath();ctx.moveTo(cx-70,base);ctx.lineTo(cx-70,96);ctx.lineTo(cx,44);ctx.lineTo(cx+70,96);ctx.lineTo(cx+70,base);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle=C.goldGrad(ctx,cx-6,24,cx+6,44);ctx.fillRect(cx-1.5,26,3,18);ctx.fillRect(cx-6,31,12,3);
  const wins=[];const lan=(x,y,w,h)=>wins.push(()=>{ctx.beginPath();ctx.moveTo(x,y+h);ctx.lineTo(x,y+w/2);ctx.arc(x+w/2,y+w/2,w/2,Math.PI,0);ctx.lineTo(x+w,y+h);ctx.closePath()});
  [cx-118,cx+70].forEach(tx=>{lan(tx+16,80,16,30);lan(tx+16,128,16,30);lan(tx+6,170,12,26);lan(tx+30,170,12,26)});
  wins.push(()=>{ctx.beginPath();ctx.arc(cx,108,26,0,7)});lan(cx-52,146,16,38);lan(cx+36,146,16,38);lan(cx-28,150,12,28);lan(cx+16,150,12,28);
  const N=wins.length,lit=Math.min(N,Math.floor(p*N+.0001));
  if(lit>litPrev&&C.state==='play')C.sfx('bell');litPrev=lit;
  wins.forEach((f,i)=>{f();if(i<lit){const g=ctx.createLinearGradient(0,60,0,base);g.addColorStop(0,'#f6e27a');g.addColorStop(.5,'#d4733f');g.addColorStop(1,'#9b1b30');ctx.fillStyle=g;ctx.shadowColor='#f6c64a';ctx.shadowBlur=14}else{ctx.fillStyle='#141020';ctx.shadowBlur=0}ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle='rgba(212,175,55,.6)';ctx.stroke()});
  if(lit>8){ctx.save();ctx.translate(cx,108);ctx.strokeStyle='rgba(122,20,38,.8)';ctx.lineWidth=1.5;for(let i=0;i<8;i++){ctx.rotate(Math.PI/4);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,26);ctx.stroke()}ctx.restore()}
  ctx.fillStyle='#120a0a';ctx.beginPath();ctx.moveTo(cx-13,base);ctx.lineTo(cx-13,186);ctx.arc(cx,186,13,Math.PI,0);ctx.lineTo(cx+13,base);ctx.fill();if(p>=1){ctx.fillStyle='rgba(246,200,100,.6)';ctx.fill()}
  ctx.restore()}
function draw(){ctx.clearRect(0,0,W,H);if(!grid){cathedral(0);return}
  cathedral(Math.min(1,lvScore/target));
  ctx.fillStyle='rgba(26,10,16,.9)';C.rr(ctx,8,212,W-16,10,5);ctx.fill();ctx.fillStyle=C.goldGrad(ctx,8,0,W,0);C.rr(ctx,8,212,Math.max(10,(W-16)*Math.min(1,lvScore/target)),10,5);ctx.fill();
  ctx.fillStyle='rgba(20,9,13,.9)';C.rr(ctx,BX-2,BY-2,COLS*S+4,ROWS*S+4,10);ctx.fill();ctx.strokeStyle='rgba(212,175,55,.45)';ctx.stroke();
  ctx.save();ctx.beginPath();ctx.rect(BX,BY,COLS*S,ROWS*S);ctx.clip();
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const p=grid[r][c];let sc=1,al=1;if(p.rm){sc=1+popT*2;al=Math.max(0,1-popT/.22)}
    ctx.globalAlpha=al;const x=BX+p.x*S,y=BY+p.y*S;ctx.drawImage(spr[p.t],x+S/2-S*sc/2,y+S/2-S*sc/2,S*sc,S*sc);
    if(sel&&sel[0]===r&&sel[1]===c){ctx.strokeStyle='#f6e27a';ctx.lineWidth=2.5;C.rr(ctx,x+3,y+3,S-6,S-6,11);ctx.stroke()}}
  ctx.globalAlpha=1;if(kbd){ctx.setLineDash([5,4]);ctx.strokeStyle='#efe6d4';ctx.lineWidth=1.5;ctx.strokeRect(BX+kc[1]*S+2,BY+kc[0]*S+2,S-4,S-4);ctx.setLineDash([])}ctx.restore();
  sparks.forEach(s=>{ctx.globalAlpha=Math.max(0,s.l/.6);ctx.fillStyle='#f6e27a';ctx.fillRect(s.x-1.5,s.y-1.5,3,3)});ctx.globalAlpha=1;
  ctx.fillStyle='#c9a95a';ctx.font='600 11px "Source Serif 4",serif';ctx.textAlign='center';ctx.fillText(`${lvScore} / ${target}`,W/2,H-4)}
let down=null;
v.cv.addEventListener('pointerdown',e=>{if(C.state!=='play'||busy)return;const p=v.pt(e),c=Math.floor((p.x-BX)/S),r=Math.floor((p.y-BY)/S);if(r<0||c<0||r>=ROWS||c>=COLS)return;down={r,c,x:p.x,y:p.y,moved:false}});
v.cv.addEventListener('pointermove',e=>{if(!down||down.moved)return;const p=v.pt(e),dx=p.x-down.x,dy=p.y-down.y;if(Math.hypot(dx,dy)>S*.4){down.moved=true;const[dr,dc]=Math.abs(dx)>Math.abs(dy)?[0,Math.sign(dx)]:[Math.sign(dy),0];trySwap(down.r,down.c,down.r+dr,down.c+dc)}});
v.cv.addEventListener('pointerup',()=>{if(!down)return;const d=down;down=null;if(d.moved||busy)return;
  if(sel&&Math.abs(sel[0]-d.r)+Math.abs(sel[1]-d.c)===1)trySwap(sel[0],sel[1],d.r,d.c);else{sel=(sel&&sel[0]===d.r&&sel[1]===d.c)?null:[d.r,d.c];C.sfx('tap')}});
let kc=[3,3];addEventListener('keydown',e=>{if(C.state!=='play'||busy)return;const m={ArrowLeft:[0,-1],ArrowRight:[0,1],ArrowUp:[-1,0],ArrowDown:[1,0]}[e.key];
  if(m){e.preventDefault();if(sel){kc=[sel[0]+m[0],sel[1]+m[1]].map((v,i)=>Math.max(0,Math.min(i?COLS-1:ROWS-1,v)));trySwap(sel[0],sel[1],sel[0]+m[0],sel[1]+m[1])}else{kc=[Math.max(0,Math.min(ROWS-1,kc[0]+m[0])),Math.max(0,Math.min(COLS-1,kc[1]+m[1]))];kbd=true}}
  else if(e.key===' '||e.key==='Enter'){e.preventDefault();kbd=true;sel=sel?null:kc.slice()}});
let kbd=false;
C.init({id:'m3',title:'Cathedral Match',key:'m3_best',lkey:'m3_lvl',desc:'Swap rosaries, chalices, candles, crosses, doves and lilies to make rows of three. Each match lights the cathedral; reach the target before your moves run out.',diffs:['Easy','Medium','Hard','Saint'],
  onStart(){types=C.diff===0?5:6;score=0;level=1;litPrev=0;startLevel(true)}});
C.loop(update,draw);
})();
