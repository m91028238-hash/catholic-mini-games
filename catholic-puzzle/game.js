(function(){
const C=CMG,SZ=[3,4,5,6],B=400;
let N,tiles,blank,moves,level,img,anim=[],peek=false,nums=true,solvedT=0,total=0;
const v=C.canvas(B,B);v.pad=14;const ctx=v.ctx;
function lvKey(){return 'cpz_lv'+C.diff}
function build(){
  N=SZ[C.diff];level=+C.LS.get(lvKey(),1)||1;
  img=document.createElement('canvas');img.width=img.height=600;GLASS.window(img.getContext('2d'),600,level*7919+C.diff*104729+13);
  tiles=[];for(let i=0;i<N*N;i++)tiles.push(i);blank=N*N-1;
  const r=C.rng(level*31+C.diff);let prev=-1;
  for(let k=0;k<N*N*30||isSolved();k++){const nb=nbrs(blank).filter(p=>p!==prev);const p=nb[Math.floor(r()*nb.length)];prev=blank;swap(p)}
  anim=tiles.map((t,p)=>({x:p%N,y:Math.floor(p/N)}));moves=0;solvedT=0;hud()}
function nbrs(p){const x=p%N,y=Math.floor(p/N),o=[];if(x>0)o.push(p-1);if(x<N-1)o.push(p+1);if(y>0)o.push(p-N);if(y<N-1)o.push(p+N);return o}
function swap(p){const bp=tiles.indexOf(N*N-1);tiles[bp]=tiles[p];tiles[p]=N*N-1;blank=p}
function isSolved(){return tiles.every((t,i)=>t===i)}
function hud(){C.hud(`Window <b>${level}</b><br>Moves <b>${moves}</b>`)}
function tryMove(p){ /* slide the line between p and blank */
  if(solvedT||C.state!=='play')return;const bp=tiles.indexOf(N*N-1),bx=bp%N,by=Math.floor(bp/N),x=p%N,y=Math.floor(p/N);
  if(p===bp||(x!==bx&&y!==by))return;
  const step=x===bx?(y>by?N:-N):(x>bx?1:-1);let cur=bp;
  while(cur!==p){const nx=cur+step;tiles[cur]=tiles[nx];tiles[nx]=N*N-1;cur=nx;moves++}
  C.sfx('move');hud();
  if(isSolved()){solvedT=performance.now();const pts=N*N*10+Math.max(0,N*N*12-moves)*2;total+=pts;C.score=total;C.saveBest(total);
    C.LS.set(lvKey(),level+1);C.saveLevel(level);C.sfx('chime');C.flash('Window complete  +'+pts);
    setTimeout(()=>{if(C.state==='play'||C.state==='pause'){build()}},2200)}}
function dirMove(d){const bp=tiles.indexOf(N*N-1),bx=bp%N,by=Math.floor(bp/N);
  const m={left:[bx+1,by],right:[bx-1,by],up:[bx,by+1],down:[bx,by-1]}[d];if(m[0]<0||m[1]<0||m[0]>=N||m[1]>=N)return;tryMove(m[1]*N+m[0])}
C.swipe(v.cv,d=>dirMove(d),e=>{const p=v.pt(e),c=B/N;tryMove(Math.floor(p.y/c)*N+Math.floor(p.x/c))});
addEventListener('keydown',e=>{if(C.state!=='play')return;const d={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',a:'left',d:'right',w:'up',s:'down'}[e.key];if(d){e.preventDefault();dirMove(d)}if(e.key===' '){peek=true}});
addEventListener('keyup',e=>{if(e.key===' ')peek=false});
C.controls([{label:'Peek',cls:'sm',fn:()=>peek=true,up:()=>peek=false},{label:'Numbers',cls:'sm',fn:()=>nums=!nums},{label:'Reshuffle',cls:'sm',fn:()=>{build();C.sfx('tap')}}]);
function draw(){
  ctx.fillStyle='#0d0709';ctx.fillRect(0,0,B,B);if(!tiles)return;
  const c=B/N,src=600/N,now=performance.now();
  if(solvedT||peek){ctx.drawImage(img,0,0,B,B);
    if(solvedT){const t=(now-solvedT)/1000;ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createLinearGradient(0,B*(1.2-t),0,B*(1.6-t));g.addColorStop(0,'rgba(246,226,122,0)');g.addColorStop(.5,'rgba(246,226,122,.35)');g.addColorStop(1,'rgba(246,226,122,0)');ctx.fillStyle=g;ctx.fillRect(0,0,B,B);ctx.restore()}
    ctx.strokeStyle=C.goldGrad(ctx,0,0,B,B);ctx.lineWidth=3;ctx.strokeRect(1.5,1.5,B-3,B-3);return}
  for(let p=0;p<N*N;p++){const t=tiles[p];if(t===N*N-1)continue;const a=anim[t]||(anim[t]={x:p%N,y:Math.floor(p/N)});
    a.x+=(p%N-a.x)*.35;a.y+=(Math.floor(p/N)-a.y)*.35;const x=a.x*c,y=a.y*c;
    ctx.drawImage(img,(t%N)*src,Math.floor(t/N)*src,src,src,x+1.5,y+1.5,c-3,c-3);
    ctx.strokeStyle='rgba(212,175,55,.55)';ctx.lineWidth=1;ctx.strokeRect(x+2,y+2,c-4,c-4);
    if(nums&&C.diff<3){ctx.fillStyle='rgba(13,7,9,.72)';C.rr(ctx,x+5,y+5,22,18,4);ctx.fill();ctx.fillStyle='#f3d98b';ctx.font='600 12px "Source Serif 4",serif';ctx.textAlign='center';ctx.fillText(t+1,x+16,y+18)}}
  const bp=tiles.indexOf(N*N-1);ctx.fillStyle='rgba(122,20,38,.18)';ctx.fillRect((bp%N)*c+2,Math.floor(bp/N)*c+2,c-4,c-4);
}
C.init({id:'cpz',title:'Catholic Puzzle',key:'cpz_best',lkey:'cpz_lvl',desc:'Slide the panes to restore each stained-glass window. Every window is new, and they never run out.',diffs:['Easy 3×3','Medium 4×4','Hard 5×5','Saint 6×6'],
  onStart(){total=0;nums=C.diff<2;build()}});
C.loop(()=>{},draw);
})();
