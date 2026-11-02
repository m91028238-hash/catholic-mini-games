(function(){
const C=CMG,W=400,H=470;
const LAD=['Seeker','Pilgrim','Disciple','Servant','Deacon','Priest','Bishop','Confessor','Martyr','Saint','Heaven'];
const FILL=['#2a1c1a','#3a2420','#4a2a22','#5a2a24','#6e1f2a','#7a1426','#5b2a86','#1f3f8f','#9b1b30','#b8860b','#f6e27a'];
let N,grid,tiles,score,maxT,anim,over,fourP,id=0,won;
const v=C.canvas(W,H);const ctx=v.ctx;
function empty(){const e=[];for(let r=0;r<N;r++)for(let c=0;c<N;c++)if(!grid[r][c])e.push([r,c]);return e}
function spawn(){const e=empty();if(!e.length)return;const[r,c]=e[Math.floor(Math.random()*e.length)];const t={id:id++,v:Math.random()<fourP?1:0,r,c,pr:r,pc:c,born:performance.now(),merged:0};grid[r][c]=t;tiles.push(t)}
function slide(dir){if(C.state!=='play'||anim)return;const[dr,dc]={left:[0,-1],right:[0,1],up:[-1,0],down:[1,0]}[dir];let moved=false,gained=0;
  tiles.forEach(t=>{t.pr=t.r;t.pc=t.c});const rem=[];const order=[];for(let i=0;i<N;i++)order.push(i);if(dr>0||dc>0)order.reverse();
  const mergedNow=new Set();
  for(const r of(dr?order:[...Array(N).keys()]))for(const c of(dc?order:[...Array(N).keys()])){const t=grid[r][c];if(!t)continue;let nr=r,nc=c;
    while(true){const ar=nr+dr,ac=nc+dc;if(ar<0||ac<0||ar>=N||ac>=N)break;const o=grid[ar][ac];if(!o){nr=ar;nc=ac;continue}
      if(o.v===t.v&&!mergedNow.has(o)){grid[r][c]=null;t.r=ar;t.c=ac;rem.push(t);o.v++;o.merged=performance.now()+110;mergedNow.add(o);gained+=Math.pow(2,o.v+1);if(o.v>maxT){maxT=o.v;if(maxT>=3)C.flash(LAD[Math.min(maxT,10)]+(maxT>10?' ✦'+(maxT-10):''),1200);C.saveLevel(maxT+1)}moved=true;nr=-1}break}
    if(nr===-1)continue;if(nr!==r||nc!==c){grid[r][c]=null;grid[nr][nc]=t;t.r=nr;t.c=nc;moved=true}}
  if(!moved)return;score+=gained;C.score=score;C.saveBest(score);C.sfx(gained?(gained>=128?'chime':'good'):'move');
  anim={t:performance.now(),rem};setTimeout(()=>{tiles=tiles.filter(t=>!rem.includes(t));spawn();anim=null;hudU();
    if(maxT>=10&&!won){won=true;C.sfx('win');C.flash('Heaven reached · keep going',2200)}if(!canMove()){C.gameOver(score,{msg:`Highest tile: ${LAD[Math.min(maxT,10)]}`})}},120);hudU()}
function canMove(){if(empty().length)return true;for(let r=0;r<N;r++)for(let c=0;c<N;c++){const v=grid[r][c].v;if(c<N-1&&grid[r][c+1].v===v)return true;if(r<N-1&&grid[r+1][c].v===v)return true}return false}
function hudU(){C.hud(`Score <b>${score}</b><br>Top <b>${LAD[Math.min(maxT,10)]}</b>`)}
function draw(){ctx.clearRect(0,0,W,H);
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='600 13px "Source Serif 4",serif';ctx.fillStyle='#c9a95a';
  /* ladder strip */
  const lw=W/11;for(let i=0;i<11;i++){ctx.globalAlpha=maxT>=i&&grid?1:.3;ctx.fillStyle=FILL[i];C.rr(ctx,i*lw+2,4,lw-4,22,5);ctx.fill();ctx.fillStyle=i>=9?'#2a1608':'#efe6d4';ctx.font='600 8px "Source Serif 4",serif';ctx.fillText(LAD[i],i*lw+lw/2,15,lw-6)}ctx.globalAlpha=1;
  const B=W-8,ox=4,oy=H-B-4;ctx.fillStyle='rgba(26,10,16,.92)';C.rr(ctx,ox,oy,B,B,14);ctx.fill();ctx.strokeStyle='rgba(212,175,55,.5)';ctx.lineWidth=1.2;ctx.stroke();
  if(!grid)return;const g=8,cs=(B-g*(N+1))/N,now=performance.now();
  for(let r=0;r<N;r++)for(let c=0;c<N;c++){ctx.fillStyle='rgba(212,175,55,.07)';C.rr(ctx,ox+g+c*(cs+g),oy+g+r*(cs+g),cs,cs,10);ctx.fill()}
  const k=anim?Math.min(1,(now-anim.t)/110):1;
  tiles.forEach(t=>{const r=t.pr+(t.r-t.pr)*k,c=t.pc+(t.c-t.pc)*k;let s=1;const age=(now-t.born)/140;if(age<1)s=age;if(t.merged&&now>t.merged&&now<t.merged+160)s=1+.12*Math.sin((now-t.merged)/160*Math.PI);
    const x=ox+g+c*(cs+g)+cs/2,y=oy+g+r*(cs+g)+cs/2,w=cs*s;const lv=Math.min(t.v,10);
    ctx.save();if(lv>=8){ctx.shadowColor='#f6e27a';ctx.shadowBlur=lv*2}
    const gr=ctx.createLinearGradient(x-w/2,y-w/2,x+w/2,y+w/2);gr.addColorStop(0,GL(FILL[lv],.18));gr.addColorStop(1,GL(FILL[lv],-.25));ctx.fillStyle=lv===10?C.goldGrad(ctx,x-w/2,y-w/2,x+w/2,y+w/2):gr;C.rr(ctx,x-w/2,y-w/2,w,w,10);ctx.fill();ctx.restore();
    ctx.strokeStyle=lv>=9?'#fff3c0':'rgba(212,175,55,.55)';ctx.lineWidth=1.2;C.rr(ctx,x-w/2,y-w/2,w,w,10);ctx.stroke();
    if(lv>=9){ctx.strokeStyle='rgba(42,22,8,.5)';ctx.beginPath();ctx.arc(x,y-w*.2,w*.16,0,7);ctx.stroke()}
    const fs=Math.min(cs*.22,22)*s;ctx.fillStyle=lv>=9?'#2a1608':'#f3e7c6';ctx.font=`600 ${fs}px "Cormorant Garamond",serif`;ctx.fillText(LAD[lv]+(t.v>10?' ✦'+(t.v-10):''),x,y+w*.02);
    ctx.font=`500 ${fs*.55}px "Source Serif 4",serif`;ctx.globalAlpha=.75;ctx.fillText(Math.pow(2,t.v+1),x,y+w*.3);ctx.globalAlpha=1});}
function GL(c,p){const n=parseInt(c.slice(1),16);let R=n>>16,G=n>>8&255,B=n&255;const f=p<0?0:255,t=Math.abs(p);return`rgb(${R+(f-R)*t|0},${G+(f-G)*t|0},${B+(f-B)*t|0})`}
C.swipe(C.stage,slide);
addEventListener('keydown',e=>{const d={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',a:'left',d:'right',w:'up',s:'down'}[e.key];if(d){e.preventDefault();slide(d)}});
C.init({id:'s2048',title:'2048 Saints',key:'s2048_best',lkey:'s2048_lvl',desc:'Swipe to merge matching tiles and climb the ladder from Seeker to Saint, and on to Heaven.',diffs:['Easy 5×5','Medium 4×4','Hard 4×4','Saint 4×4'],
  onStart(d){N=d===0?5:4;fourP=[.1,.1,.25,.4][d];grid=Array.from({length:N},()=>Array(N).fill(null));tiles=[];score=0;maxT=0;anim=null;won=false;spawn();spawn();hudU()}});
C.loop(()=>{},draw);
})();
