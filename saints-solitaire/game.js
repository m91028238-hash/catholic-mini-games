(function(){
const C=CMG,W=392,H=700,CW=52,CHh=74,GAP=(W-7*CW)/8,TY=CHh+22;
const SUITS=['\u2660','\u2665','\u2666','\u2663'],RED=[false,true,true,false],RANKS=['','A','2','3','4','5','6','7','8','9','10','J','Q','K'];
const COURT={11:['George','Joan','Martin','Sebastian'],12:['Margaret','Elizabeth','Helena','Hedwig'],13:['Louis','Stephen','Edward','Wenceslas']};
let stock,waste,found,tab,score,hist,t0,draw3,moves,anims=new Map(),autoRun=false;
const v=C.canvas(W,H);const ctx=v.ctx;
const spr={};function mk(){const S=2;const f=(key,fn)=>{const c=document.createElement('canvas');c.width=CW*S;c.height=CHh*S;const g=c.getContext('2d');g.scale(S,S);fn(g);spr[key]=c};
  f('back',g=>{const gr=g.createLinearGradient(0,0,CW,CHh);gr.addColorStop(0,'#7a1426');gr.addColorStop(1,'#3f0a14');g.fillStyle=gr;C.rr(g,.5,.5,CW-1,CHh-1,5);g.fill();g.strokeStyle='#d4af37';g.lineWidth=1;g.stroke();
    g.strokeStyle='rgba(243,217,139,.55)';C.rr(g,4,4,CW-8,CHh-8,3);g.stroke();g.save();g.beginPath();C.rr(g,4,4,CW-8,CHh-8,3);g.clip();g.strokeStyle='rgba(212,175,55,.18)';for(let i=-80;i<80;i+=7){g.beginPath();g.moveTo(i,0);g.lineTo(i+CHh,CHh);g.moveTo(i+CHh,0);g.lineTo(i,CHh);g.stroke()}g.restore();
    g.fillStyle='rgba(26,10,16,.85)';g.beginPath();g.ellipse(CW/2,CHh/2,13,18,0,0,7);g.fill();g.strokeStyle='#d4af37';g.stroke();g.fillStyle=C.goldGrad(g,CW/2-8,CHh/2-12,CW/2+8,CHh/2+12);g.fillRect(CW/2-1.6,CHh/2-12,3.2,24);g.fillRect(CW/2-7,CHh/2-6,14,3.2)});
  for(let s=0;s<4;s++)for(let r=1;r<=13;r++)f(s+'_'+r,g=>{const col=RED[s]?'#9b1b30':'#1c1a2a';g.fillStyle='#f7f0e1';C.rr(g,.5,.5,CW-1,CHh-1,5);g.fill();g.strokeStyle='#b8860b';g.lineWidth=1;g.stroke();
    g.fillStyle=col;g.font='600 15px "Cormorant Garamond",Georgia,serif';g.textAlign='left';g.textBaseline='top';g.fillText(RANKS[r],4,3);g.font='12px serif';g.fillText(SUITS[s],r===10?22:15,4);
    if(r>10){const cx=CW/2,cy=CHh/2+6;g.save();g.fillStyle='rgba(212,175,55,.25)';g.beginPath();g.arc(cx,cy-14,11,0,7);g.fill();g.strokeStyle='#d4af37';g.lineWidth=1.2;g.stroke();
      g.fillStyle='#e8c9a0';g.beginPath();g.arc(cx,cy-13,5,0,7);g.fill();g.fillStyle=col;g.beginPath();g.moveTo(cx-13,cy+20);g.quadraticCurveTo(cx-12,cy-4,cx,cy-7);g.quadraticCurveTo(cx+12,cy-4,cx+13,cy+20);g.closePath();g.fill();
      g.fillStyle='#d4af37';g.fillRect(cx-1,cy-5,2,22);g.fillRect(cx-5,cy+1,10,2);
      if(r===13){g.beginPath();g.moveTo(cx-6,cy-17);g.lineTo(cx-6,cy-22);g.lineTo(cx-3,cy-19);g.lineTo(cx,cy-23);g.lineTo(cx+3,cy-19);g.lineTo(cx+6,cy-22);g.lineTo(cx+6,cy-17);g.fill()}
      if(r===12){g.fillStyle='#efe6d4';g.beginPath();g.moveTo(cx-6,cy-16);g.quadraticCurveTo(cx-9,cy-6,cx-8,cy);g.lineTo(cx-5,cy-9);g.fill();g.beginPath();g.moveTo(cx+6,cy-16);g.quadraticCurveTo(cx+9,cy-6,cx+8,cy);g.lineTo(cx+5,cy-9);g.fill();g.fillStyle='#d4af37';g.fillRect(cx-5,cy-20,10,3)}
      if(r===11){g.strokeStyle='#8a6a2a';g.lineWidth=1.6;g.beginPath();g.moveTo(cx+11,cy+18);g.lineTo(cx+11,cy-16);g.stroke();g.fillStyle='#efe6d4';g.fillRect(cx+11,cy-16,7,5);g.fillStyle='#9b1b30';g.fillRect(cx+13,cy-16,1.5,5);g.fillRect(cx+11,cy-14.2,7,1.5)}
      g.restore();g.fillStyle=col;g.font='italic 500 8.5px "Cormorant Garamond",Georgia,serif';g.textAlign='center';g.textBaseline='alphabetic';g.fillText('St '+COURT[r][s],CW/2,CHh-4)}
    else{g.font=(r===1?'30px':'24px')+' serif';g.textAlign='center';g.textBaseline='middle';g.fillText(SUITS[s],CW/2,CHh/2+6);if(r===1){g.strokeStyle='rgba(212,175,55,.6)';g.beginPath();g.arc(CW/2,CHh/2+5,17,0,7);g.stroke()}}})}
mk();document.fonts&&document.fonts.ready.then(mk);
function deal(){const d=[];for(let s=0;s<4;s++)for(let r=1;r<=13;r++)d.push({s,r,up:false});C.shuffle(d);tab=[];for(let c=0;c<7;c++){tab.push([]);for(let i=0;i<=c;i++){const k=d.pop();k.up=i===c;tab[c].push(k)}}
  stock=d;waste=[];found=[[],[],[],[]];score=0;hist=[];moves=0;t0=performance.now();anims.clear();hudU()}
function snap(){hist.push(JSON.stringify({stock,waste,found,tab,score}));if(hist.length>300)hist.shift()}
function undo(){if(!hist.length||C.state!=='play')return;const o=JSON.parse(hist.pop());stock=o.stock;waste=o.waste;found=o.found;tab=o.tab;score=o.score;anims.clear();C.sfx('move');hudU()}
function hudU(){const s=Math.floor((performance.now()-t0)/1000);C.hud(`Score <b>${score}</b><br>${Math.floor(s/60)}:${String(s%60).padStart(2,'0')} · Moves <b>${moves}</b>`)}
/* layout positions */
function stockPos(){return{x:GAP,y:8}}function wastePos(i,n){const k=draw3?Math.max(0,i-Math.max(0,n-3)):0;return{x:GAP*2+CW+(draw3?Math.max(0,k)*13:0),y:8}}
function foundPos(i){return{x:GAP*(4+i)+CW*(3+i),y:8}}
function colOffsets(c){const col=tab[c],avail=H-TY-CHh-6;let dn=0,up=0;col.forEach(k=>k.up?up++:dn++);let od=9,ou=22;const need=dn*od+Math.max(0,up-1)*ou;if(need>avail){ou=Math.max(10,(avail-dn*od)/Math.max(1,up-1));if(dn*od+(up-1)*ou>avail)od=Math.max(4,(avail-(up-1)*ou)/Math.max(1,dn))}return{od,ou}}
function tabPos(c,i){const{od,ou}=colOffsets(c);let y=TY;for(let k=0;k<i;k++)y+=tab[c][k].up?ou:od;return{x:GAP+c*(CW+GAP),y}}
function where(card){let i=stock.indexOf(card);if(i>=0)return stockPos();i=waste.indexOf(card);if(i>=0)return wastePos(i,waste.length);for(let f=0;f<4;f++){i=found[f].indexOf(card);if(i>=0)return foundPos(f)}for(let c=0;c<7;c++){i=tab[c].indexOf(card);if(i>=0)return tabPos(c,i)}return{x:0,y:0}}
function animFrom(cards){const now=performance.now();cards.forEach(k=>{const p=where(k);anims.set(k,{x:p.x,y:p.y,t:now})})}
/* moves */
function canFound(k){const f=found[k.s];return f.length?f[f.length-1].r===k.r-1:k.r===1}
function canTab(stack,c){const col=tab[c];if(!col.length)return stack[0].r===13;const t=col[col.length-1];return t.up&&RED[t.s]!==RED[stack[0].s]&&t.r===stack[0].r+1}
function flipTop(c){const col=tab[c];if(col.length&&!col[col.length-1].up){col[col.length-1].up=true;score+=5}}
function tryMove(src,idx){/* src: 'w' | 'f0..3' | 0..6 */
  let stack;if(src==='w'){if(!waste.length)return false;stack=[waste[waste.length-1]]}else if(typeof src==='string'){const f=found[+src[1]];if(!f.length)return false;stack=[f[f.length-1]]}else stack=tab[src].slice(idx);
  if(!stack.length||!stack[0].up)return false;
  const before=stack.slice();animFrom(before);const remove=()=>{if(src==='w')waste.pop();else if(typeof src==='string')found[+src[1]].pop();else tab[src].splice(idx)};
  if(stack.length===1&&typeof src!=='string'&&canFound(stack[0])){snap();remove();found[stack[0].s].push(stack[0]);score+=10;if(typeof src==='number')flipTop(src);done('good');return true}
  const order=[];for(let i=1;i<=7;i++){const c=((typeof src==='number'?src:-1)+i+7)%7;if(c!==src)order.push(c)}
  order.sort((a,b)=>(tab[a].length?0:1)-(tab[b].length?0:1));
  for(const c of order)if(canTab(stack,c)){if(typeof src==='number'&&idx===0&&!tab[c].length)continue;snap();remove();tab[c].push(...stack);if(src==='w')score+=5;else if(typeof src==='string')score=Math.max(0,score-15);else flipTop(src);done('move');return true}
  anims.clear();return false}
function done(snd){moves++;C.sfx(snd);hudU();checkWin()}
function drawStock(){if(C.state!=='play')return;snap();if(!stock.length){if(!waste.length){hist.pop();return}stock=waste.reverse().map(k=>(k.up=false,k));waste=[];if(!draw3)score=Math.max(0,score-100);C.sfx('drop')}
  else{const n=draw3?3:1;const moved=[];for(let i=0;i<n&&stock.length;i++){const k=stock.pop();k.up=true;waste.push(k);moved.push(k)}const now=performance.now();moved.forEach(k=>anims.set(k,{x:GAP,y:8,t:now}));C.sfx('tap')}moves++;hudU()}
function autoFound(){let any=false;for(let pass=0;pass<60;pass++){let m=false;if(waste.length&&canFound(waste[waste.length-1])){tryMove('w');m=true}else for(let c=0;c<7;c++){const col=tab[c];if(col.length&&col[col.length-1].up&&canFound(col[col.length-1])){tryMove(c,col.length-1);m=true;break}}if(!m)break;any=true}if(!any)C.sfx('bad')}
function checkWin(){if(found.every(f=>f.length===13)){const secs=Math.floor((performance.now()-t0)/1000);score+=Math.max(0,1000-secs*2);C.score=score;C.LS.set('sol_wins',+C.LS.get('sol_wins',0)+1);setTimeout(()=>C.gameOver(score,{win:true,title:'Deo gratias',msg:`Solved in ${Math.floor(secs/60)}:${String(secs%60).padStart(2,'0')} with ${moves} moves.`}),600);return}
  if(!stock.length&&!waste.length&&tab.every(c=>c.every(k=>k.up))&&!autoRun){autoRun=true;const step=()=>{if(C.state!=='play'){autoRun=false;return}let m=false;for(let c=0;c<7;c++){const col=tab[c];if(col.length&&canFound(col[col.length-1])){tryMove(c,col.length-1);m=true;break}}if(m&&!found.every(f=>f.length===13))setTimeout(step,120);else autoRun=false};setTimeout(step,200)}}
/* input */
v.cv.addEventListener('pointerdown',e=>{if(C.state!=='play')return;const p=v.pt(e);const inR=(q,w,h)=>p.x>=q.x&&p.x<=q.x+(w||CW)&&p.y>=q.y&&p.y<=q.y+(h||CHh);
  if(inR(stockPos()))return drawStock();
  if(waste.length&&inR(wastePos(waste.length-1,waste.length))){if(!tryMove('w'))C.sfx('bad');return}
  for(let f=0;f<4;f++)if(inR(foundPos(f))){if(!tryMove('f'+f))C.sfx('bad');return}
  for(let c=0;c<7;c++){const col=tab[c];for(let i=col.length-1;i>=0;i--){const q=tabPos(c,i);const h=i===col.length-1?CHh:(tabPos(c,i+1).y-q.y);if(inR(q,CW,h)){if(!col[i].up){C.sfx('bad');return}if(!tryMove(c,i))C.sfx('bad');return}}}});
addEventListener('keydown',e=>{if(C.state!=='play')return;const k=e.key.toLowerCase();if(k==='d'||k===' '){e.preventDefault();drawStock()}else if(k==='u'||k==='z')undo();else if(k==='a')autoFound();else if(k==='w'){if(!tryMove('w'))C.sfx('bad')}else if(k>='1'&&k<='7'){const c=+k-1,col=tab[c];const i=col.findIndex(x=>x.up);if(i<0||!(tryMove(c,col.length-1)||tryMove(c,i)))C.sfx('bad')}});
C.controls([{label:'Undo',cls:'sm',fn:undo},{label:'Auto',cls:'sm',fn:autoFound},{label:'New Deal',cls:'sm',fn:()=>{deal();C.sfx('chime')}}]);
function drawCard(k,x,y){ctx.drawImage(k.up?spr[k.s+'_'+k.r]:spr.back,x,y,CW,CHh)}
function slot(x,y,label){ctx.strokeStyle='rgba(212,175,55,.35)';ctx.lineWidth=1;C.rr(ctx,x+.5,y+.5,CW-1,CHh-1,5);ctx.stroke();if(label){ctx.fillStyle='rgba(212,175,55,.35)';ctx.font='20px serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(label,x+CW/2,y+CHh/2)}}
function draw(){ctx.clearRect(0,0,W,H);if(!tab)return;const now=performance.now();const late=[];
  const put=(k,p)=>{const a=anims.get(k);if(a){const t=Math.min(1,(now-a.t)/160);if(t>=1)anims.delete(k);else{late.push([k,a.x+(p.x-a.x)*t,a.y+(p.y-a.y)*t]);return}}drawCard(k,p.x,p.y)};
  const sp=stockPos();if(stock.length)drawCard(stock[stock.length-1],sp.x,sp.y);else slot(sp.x,sp.y,'\u21BB');
  const w0=Math.max(0,waste.length-(draw3?3:2));for(let i=w0;i<waste.length;i++)put(waste[i],wastePos(i,waste.length));
  for(let f=0;f<4;f++){const p=foundPos(f);slot(p.x,p.y,SUITS[f]);const fl=found[f];if(fl.length>1)drawCard(fl[fl.length-2],p.x,p.y);if(fl.length)put(fl[fl.length-1],p)}
  for(let c=0;c<7;c++){if(!tab[c].length)slot(GAP+c*(CW+GAP),TY,'K');tab[c].forEach((k,i)=>put(k,tabPos(c,i)))}
  late.forEach(([k,x,y])=>{ctx.save();ctx.shadowColor='rgba(0,0,0,.5)';ctx.shadowBlur=8;drawCard(k,x,y);ctx.restore()});
  if(C.state==='play'&&Math.floor(now/1000)!==draw._s){draw._s=Math.floor(now/1000);hudU()}}
C.init({id:'sol',title:'Saints Solitaire',key:'sol_best',desc:'Klondike patience with saintly court cards. Tap a card to send it to its best place; undo freely.',diffs:['Draw 1','Draw 3'],defDiff:0,
  onStart(d){draw3=d===1;autoRun=false;deal()}});
C.loop(()=>{},draw);
})();
