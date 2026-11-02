(function(){
const C=CMG,W=360,H=640,COLS=10,ROWS=20,CS=26,BX=12,BY=84,BAND=78;
const SH={I:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],O:[[1,1],[1,1]],T:[[0,1,0],[1,1,1],[0,0,0]],S:[[0,1,1],[1,1,0],[0,0,0]],Z:[[1,1,0],[0,1,1],[0,0,0]],J:[[1,0,0],[1,1,1],[0,0,0]],L:[[0,0,1],[1,1,1],[0,0,0]]};
const COL={I:'#3fa3b3',O:'#e2b23a',T:'#7a43a8',S:'#2f8f5f',Z:'#c22a3f',J:'#2f5fbf',L:'#d4733f'};
const START=[1,4,8,12];
let grid,cur,bag,next,hold,canHold,score,lines,level,dropT,lockT,clearing,clearT,ascend=[],glow=0,startLv;
const v=C.canvas(W,H);const ctx=v.ctx;
function newBag(){return C.shuffle(Object.keys(SH))}
function take(){if(next.length<4){next.push(...newBag())}return next.shift()}
function spawn(t){const m=SH[t].map(r=>r.slice());cur={t,m,x:Math.floor((COLS-m.length)/2),y:t==='I'?-1:0};canHold=true;if(hit(cur.m,cur.x,cur.y)){end()}}
function hit(m,x,y){for(let r=0;r<m.length;r++)for(let c=0;c<m.length;c++)if(m[r][c]){const gx=x+c,gy=y+r;if(gx<0||gx>=COLS||gy>=ROWS)return true;if(gy>=0&&grid[gy][gx])return true}return false}
function rot(m,dir){const n=m.length,o=m.map(r=>r.slice());for(let r=0;r<n;r++)for(let c=0;c<n;c++)o[r][c]=dir>0?m[n-1-c][r]:m[c][n-1-r];return o}
function rotate(d){if(!cur||clearing)return;const m=rot(cur.m,d);for(const[kx,ky]of[[0,0],[-1,0],[1,0],[0,-1],[-2,0],[2,0],[0,1]])if(!hit(m,cur.x+kx,cur.y+ky)){cur.m=m;cur.x+=kx;cur.y+=ky;lockT=0;C.sfx('tap');return}}
function move(dx){if(!cur||clearing)return;if(!hit(cur.m,cur.x+dx,cur.y)){cur.x+=dx;lockT=0;C.sfx('move')}}
function soft(){if(!cur||clearing)return;if(!hit(cur.m,cur.x,cur.y+1)){cur.y++;score+=1;dropT=0}else lock()}
function hard(){if(!cur||clearing)return;let n=0;while(!hit(cur.m,cur.x,cur.y+1)){cur.y++;n++}score+=2*n;lock()}
function doHold(){if(!cur||!canHold||clearing)return;const t=cur.t;if(hold){const h=hold;hold=t;spawn(h)}else{hold=t;spawn(take())}canHold=false;C.sfx('tap')}
function speed(){return Math.max(.035,Math.pow(.8-(level-1)*.007,level-1))}
function lock(){
  for(let r=0;r<cur.m.length;r++)for(let c=0;c<cur.m.length;c++)if(cur.m[r][c]){const gy=cur.y+r;if(gy<0){end();return}grid[gy][cur.x+c]=cur.t}
  C.sfx('drop');cur=null;const full=[];grid.forEach((row,i)=>{if(row.every(Boolean))full.push(i)});
  if(full.length){clearing=full;clearT=0;C.sfx(full.length>=4?'win':'chime')}else spawn(take());hudU()}
function finishClear(){const n=clearing.length;
  clearing.forEach(i=>ascend.push({y:BY+i*CS,cells:grid[i].slice(),a:1}));
  grid=grid.filter((_,i)=>!clearing.includes(i));while(grid.length<ROWS)grid.unshift(Array(COLS).fill(null));
  score+=[0,100,300,500,800][n]*level;lines+=n;const nl=startLv+Math.floor(lines/10);if(nl>level){level=nl;C.flash('Level '+level);C.saveLevel(level)}
  glow=Math.min(1,glow+.35*n);clearing=null;spawn(take());hudU()}
function hudU(){C.hud(`Score <b>${score}</b><br>Lines <b>${lines}</b> · Lv <b>${level}</b>`)}
function end(){cur=null;C.score=score;C.gameOver(score,{msg:`${lines} lines · level ${level}`})}
function update(dt){
  glow=Math.max(0,glow-dt*.25);
  ascend.forEach(a=>{a.y-=dt*(90+ (BY+ROWS*CS-a.y)*.4);a.a=Math.max(0,Math.min(1,(a.y-0)/(BY+60)))});ascend=ascend.filter(a=>a.y>-CS);
  if(clearing){clearT+=dt;if(clearT>.32)finishClear();return}
  if(!cur)return;dropT+=dt;
  if(hit(cur.m,cur.x,cur.y+1)){lockT+=dt;if(lockT>.5)lock()}else{lockT=0;if(dropT>=speed()){dropT=0;cur.y++}}}
function block(x,y,s,col,alpha){ctx.globalAlpha=alpha==null?1:alpha;const g=ctx.createLinearGradient(x,y,x+s,y+s);g.addColorStop(0,GL(col,.35));g.addColorStop(.5,col);g.addColorStop(1,GL(col,-.35));ctx.fillStyle=g;ctx.fillRect(x+1,y+1,s-2,s-2);
  ctx.strokeStyle='rgba(22,13,11,.9)';ctx.lineWidth=1.5;ctx.strokeRect(x+1.5,y+1.5,s-3,s-3);ctx.fillStyle='rgba(255,248,224,.22)';ctx.fillRect(x+3,y+3,s*.35,s*.18);ctx.globalAlpha=1}
function GL(c,p){return GLASS?GLASS.shade(c,p):c}
function mini(t,x,y,box){if(!t)return;const m=SH[t],n=m.length,s=Math.min(16,box/ (n+.5));let minr=9,maxr=-1,minc=9,maxc=-1;m.forEach((r,ri)=>r.forEach((v,ci)=>{if(v){minr=Math.min(minr,ri);maxr=Math.max(maxr,ri);minc=Math.min(minc,ci);maxc=Math.max(maxc,ci)}}));
  const ox=x+(box-(maxc-minc+1)*s)/2-minc*s,oy=y+(box*.7-(maxr-minr+1)*s)/2-minr*s;m.forEach((r,ri)=>r.forEach((v,ci)=>{if(v)block(ox+ci*s,oy+ri*s,s,COL[t])}))}
function draw(){
  ctx.clearRect(0,0,W,H);const bw=COLS*CS,bh=ROWS*CS;
  /* heaven band: light rays above the board */
  const hg=ctx.createRadialGradient(BX+bw/2,-20,10,BX+bw/2,0,bw*.75);hg.addColorStop(0,`rgba(255,246,210,${.55+glow*.45})`);hg.addColorStop(.5,`rgba(246,226,122,${.18+glow*.3})`);hg.addColorStop(1,'rgba(246,226,122,0)');
  ctx.fillStyle=hg;ctx.fillRect(BX,0,bw,BAND);
  ctx.save();ctx.globalAlpha=.12+glow*.3;ctx.strokeStyle='#f6e27a';for(let i=-6;i<=6;i++){ctx.beginPath();ctx.moveTo(BX+bw/2,-10);ctx.lineTo(BX+bw/2+i*30,BAND);ctx.stroke()}ctx.restore();
  /* board background (translucent so ascending light shows behind blocks) */
  ctx.fillStyle='rgba(20,9,13,.92)';ctx.fillRect(BX,BY,bw,bh);
  ctx.strokeStyle='rgba(212,175,55,.07)';ctx.lineWidth=1;for(let c=1;c<COLS;c++){ctx.beginPath();ctx.moveTo(BX+c*CS,BY);ctx.lineTo(BX+c*CS,BY+bh);ctx.stroke()}for(let r=1;r<ROWS;r++){ctx.beginPath();ctx.moveTo(BX,BY+r*CS);ctx.lineTo(BX+bw,BY+r*CS);ctx.stroke()}
  /* ascending rows: soft gold light behind the stack, rising into the band */
  ctx.save();ctx.beginPath();ctx.rect(BX,0,bw,BY+bh);ctx.clip();ctx.globalCompositeOperation='lighter';
  ascend.forEach(a=>{const inBand=a.y<BY;const al=inBand?a.a*.8:.28;const g=ctx.createLinearGradient(0,a.y-CS*.6,0,a.y+CS*1.6);g.addColorStop(0,'rgba(246,226,122,0)');g.addColorStop(.4,`rgba(246,226,122,${al})`);g.addColorStop(1,'rgba(246,226,122,0)');ctx.fillStyle=g;ctx.fillRect(BX,a.y-CS*.6,bw,CS*2.2)});ctx.restore();
  /* stack */
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const t=grid&&grid[r][c];if(!t)continue;
    if(clearing&&clearing.includes(r)){const k=clearT/.32;block(BX+c*CS,BY+r*CS,CS,'#f3d98b',1-k*.5);ctx.fillStyle=`rgba(255,248,220,${.5*(1-k)})`;ctx.fillRect(BX+c*CS,BY+r*CS,CS,CS)}else block(BX+c*CS,BY+r*CS,CS,COL[t])}
  if(cur){let gy=cur.y;while(!hit(cur.m,cur.x,gy+1))gy++;
    cur.m.forEach((row,r)=>row.forEach((vv,c)=>{if(!vv)return;const y=gy+r;if(y>=0){ctx.strokeStyle='rgba(243,217,139,.45)';ctx.lineWidth=1.5;ctx.strokeRect(BX+(cur.x+c)*CS+3,BY+y*CS+3,CS-6,CS-6)}}));
    cur.m.forEach((row,r)=>row.forEach((vv,c)=>{if(vv&&cur.y+r>=0)block(BX+(cur.x+c)*CS,BY+(cur.y+r)*CS,CS,COL[cur.t])}))}
  ctx.strokeStyle=C.goldGrad(ctx,BX,BY,BX+bw,BY+bh);ctx.lineWidth=2;ctx.strokeRect(BX-1,BY-1,bw+2,bh+2);
  /* sidebar */
  const sx=BX+bw+10,sw=W-sx-8;ctx.textAlign='center';
  const box=(y,h,label)=>{ctx.fillStyle='rgba(26,10,16,.85)';C.rr(ctx,sx,y,sw,h,8);ctx.fill();ctx.strokeStyle='rgba(212,175,55,.45)';ctx.lineWidth=1;ctx.stroke();ctx.fillStyle='#c9a95a';ctx.font='600 10px "Source Serif 4",serif';ctx.fillText(label,sx+sw/2,y+14)};
  box(BY,190,'NEXT');if(next)for(let i=0;i<3;i++)mini(next[i],sx+4,BY+18+i*56,sw-8);
  box(BY+202,76,'HOLD');mini(hold,sx+4,BY+222,sw-8);
  box(BY+290,120,'LEVEL');ctx.fillStyle='#f6e27a';ctx.font='600 30px "Cormorant Garamond",serif';ctx.fillText(level||1,sx+sw/2,BY+340);ctx.fillStyle='#c9a95a';ctx.font='600 10px "Source Serif 4",serif';ctx.fillText('LINES',sx+sw/2,BY+364);ctx.fillStyle='#efe6d4';ctx.font='500 16px "Source Serif 4",serif';ctx.fillText(lines||0,sx+sw/2,BY+386);
}
C.swipe(v.cv,d=>{if(C.state!=='play')return;if(d==='left')move(-1);else if(d==='right')move(1);else if(d==='down')hard();else doHold()},()=>{if(C.state==='play')rotate(1)});
addEventListener('keydown',e=>{if(C.state!=='play')return;const k=e.key;
  if(k==='ArrowLeft'||k==='a')move(-1);else if(k==='ArrowRight'||k==='d')move(1);else if(k==='ArrowDown'||k==='s')soft();else if(k==='ArrowUp'||k==='x'||k==='w')rotate(1);else if(k==='z')rotate(-1);else if(k===' '){e.preventDefault();hard()}else if(k==='c'||k==='Shift')doHold()});
C.controls([{label:'&#8634;',aria:'Rotate left',fn:()=>rotate(-1)},{label:'&#9664;',aria:'Left',fn:()=>move(-1),repeat:70},{label:'&#9660;',aria:'Soft drop',fn:soft,repeat:45,delay:90},{label:'&#9654;',aria:'Right',fn:()=>move(1),repeat:70},{label:'&#8635;',aria:'Rotate right',fn:()=>rotate(1)},{label:'&#10515;',aria:'Hard drop',fn:hard},{label:'Hold',cls:'sm',fn:doHold}]);
C.init({id:'ht',title:'Heaven Tetris',key:'ht_best',lkey:'ht_lvl',desc:'Complete rows and they rise as golden light into Heaven. Tap to rotate, swipe to move, swipe down to drop.',diffs:['Easy','Medium','Hard','Saint'],
  onStart(d){grid=Array.from({length:ROWS},()=>Array(COLS).fill(null));next=newBag();hold=null;score=0;lines=0;startLv=START[d];level=startLv;dropT=0;lockT=0;clearing=null;ascend=[];glow=0;spawn(take());hudU()}});
C.loop(update,draw);
})();
