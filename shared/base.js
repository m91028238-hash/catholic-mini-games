/* Catholic Games shared base: menu, difficulty, pause, game over, best score, sounds, helpers */
(function(){
const LS={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:v}catch(e){return d}},set(k,v){try{localStorage.setItem(k,String(v))}catch(e){}}};
const $=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e};
const CROWN='<svg class="cr" viewBox="0 0 46 34"><defs><linearGradient id="cgg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6e27a"/><stop offset=".5" stop-color="#d4af37"/><stop offset="1" stop-color="#b8860b"/></linearGradient></defs><path d="M4 26L2 9l11 8 10-14 10 14 11-8-2 17Z" fill="url(#cgg)"/><rect x="4" y="28" width="38" height="4" rx="1.5" fill="url(#cgg)"/><circle cx="23" cy="15" r="2.2" fill="#7a1426"/></svg>';
const C={LS,$,state:'menu',paused:false,diff:1,score:0,cfg:null};
C.stage=document.getElementById('stage')||(()=>{const s=$('div');s.id='stage';document.body.appendChild(s);return s})();
let AC=null,muted=LS.get('cmgMute','0')==='1',ov,card,flashT;
C.init=function(cfg){
  C.cfg=cfg;C.diff=Math.min((cfg.diffs||[0]).length-1,+LS.get(cfg.id+'_diff',cfg.defDiff==null?1:cfg.defDiff));
  document.title=cfg.title;
  const bar=$('div');bar.id='bar';
  bar.innerHTML='<a class="ib" href="../?v=4" aria-label="Back to all games">&#8592;</a><div id="ttl"></div><div id="hud"></div><button class="ib" id="pz" aria-label="Pause">&#10074;&#10074;</button><button class="ib" id="mu" aria-label="Sound"></button>';
  document.body.prepend(bar);bar.querySelector('#ttl').textContent=cfg.title;
  C.hudEl=bar.querySelector('#hud');
  const fl=$('div');fl.id='flash';C.stage.appendChild(fl);C.flashEl=fl;
  ov=$('div');ov.id='ov';card=$('div','card');ov.appendChild(card);document.body.appendChild(ov);
  const mu=bar.querySelector('#mu');const setMu=()=>mu.innerHTML=muted?'&#215;':'&#9835;';setMu();
  mu.onclick=()=>{muted=!muted;LS.set('cmgMute',muted?1:0);setMu()};
  bar.querySelector('#pz').onclick=()=>C.state==='play'?C.pause():null;
  if(cfg.noPause)bar.querySelector('#pz').style.display='none';
  addEventListener('keydown',e=>{
    if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)&&e.target===document.body)e.preventDefault();
    if((e.key==='p'||e.key==='P'||e.key==='Escape')&&!cfg.noPause){if(C.state==='play')C.pause();else if(C.state==='pause')C.resume();return}
    if(e.key==='Enter'&&ov.classList.contains('on')){const b=card.querySelector('.btn');if(b){e.preventDefault();b.click()}}
  },{passive:false});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&C.state==='play'&&!cfg.noPause)C.pause()});
  addEventListener('pointerdown',C.unlockAudio,{once:false});
  addEventListener('keydown',C.unlockAudio);
  C.menu();
};
C.best=()=>+LS.get(C.cfg.key,0)||0;
C.saveBest=function(s){const b=C.best();if(C.cfg.lower?(s>0&&(!b||s<b)):s>b){LS.set(C.cfg.key,s);return true}return false};
C.saveLevel=function(l){if(C.cfg.lkey&&l>(+LS.get(C.cfg.lkey,0)||0))LS.set(C.cfg.lkey,l)};
C.hud=h=>{C.hudEl.innerHTML=h};
C.flash=function(t,ms){const f=C.flashEl;f.textContent=t;f.classList.add('on');clearTimeout(flashT);flashT=setTimeout(()=>f.classList.remove('on'),ms||1400)};
function show(html,btns){card.innerHTML=html;btns.forEach(b=>{const e=$(b.href?'a':'button','btn'+(b.sec?' sec':''),b.label);if(b.href)e.href=b.href;else e.onclick=()=>{C.sfx('tap');b.fn()};card.appendChild(e)});ov.classList.add('on')}
C.hideOv=()=>ov.classList.remove('on');
C.menu=function(){
  const cfg=C.cfg;C.state='menu';C.paused=false;cfg.onMenu&&cfg.onMenu();
  const b=C.best();
  let h=CROWN+'<h1></h1><span class="rule"></span><p></p>';
  if(cfg.diffs&&cfg.diffs.length>1)h+='<div class="lab">Difficulty</div><div class="diffs">'+cfg.diffs.map((d,i)=>`<button data-i="${i}" class="${i===C.diff?'sel':''}">${d}</button>`).join('')+'</div>';
  h+=`<div class="lab">${cfg.bestLabel||'Best'}: ${b?(cfg.fmt?cfg.fmt(b):b):'&#8212;'}</div>`;
  const btns=[{label:cfg.startLabel||'Begin',fn:()=>C.start()}].concat((cfg.menuExtra||[]).map(x=>typeof x==='function'?x():x)).concat([{label:'All Games',href:'../?v=4',sec:1}]);
  show(h,btns);card.querySelector('h1').textContent=cfg.title;card.querySelector('p').textContent=cfg.desc;
  card.querySelectorAll('.diffs button').forEach(e=>e.onclick=()=>{C.diff=+e.dataset.i;LS.set(cfg.id+'_diff',C.diff);card.querySelectorAll('.diffs button').forEach(x=>x.classList.toggle('sel',x===e));C.sfx('tap')});
};
C.start=function(opt){C.hideOv();C.state='play';C.paused=false;C.score=0;C.cfg.onStart(C.diff,opt)};
C.pause=function(){if(C.state!=='play')return;C.state='pause';C.paused=true;C.cfg.onPause&&C.cfg.onPause();
  show(CROWN+'<h1>Paused</h1><span class="rule"></span>',[{label:'Resume',fn:C.resume},{label:'Restart',sec:1,fn:()=>C.start()},{label:'Menu',sec:1,fn:C.menu}])};
C.resume=function(){C.hideOv();C.state='play';C.paused=false;C.cfg.onResume&&C.cfg.onResume()};
C.gameOver=function(score,o){
  o=o||{};C.state='over';const isBest=o.noScore?false:C.saveBest(score);const b=C.best();C.sfx(o.win?'win':'over');
  let h=CROWN+`<h1>${o.title||'Game Over'}</h1><span class="rule"></span>`;
  if(o.html)h+=o.html;
  if(!o.noScore)h+=`<div class="lab">${o.scoreLabel||C.cfg.scoreLabel||'Score'}</div><div class="big">${C.cfg.fmt?C.cfg.fmt(score):score}</div><div class="lab">${isBest?'New best':(C.cfg.bestLabel||'Best')+': '+(C.cfg.fmt?C.cfg.fmt(b):b)}</div>`;
  if(o.msg)h+=`<p>${o.msg}</p>`;else h+='<div style="height:10px"></div>';
  show(h,(o.buttons||[]).concat([{label:o.again||'Play Again',fn:()=>C.start(o.againOpt)},{label:'Menu',sec:1,fn:C.menu}]));
};
/* sound */
C.unlockAudio=function(){if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)()}catch(e){}}if(AC&&AC.state==='suspended')AC.resume()};
function tone(f,d,type,vol,delay,slide){if(!AC||muted)return;const t=AC.currentTime+(delay||0),o=AC.createOscillator(),g=AC.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(slide,t+d);g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol||0.12,t+0.012);g.gain.exponentialRampToValueAtTime(0.0001,t+d);o.connect(g).connect(AC.destination);o.start(t);o.stop(t+d+0.05)}
const SFX={tap:()=>tone(660,.06,'triangle',.06),move:()=>tone(420,.05,'triangle',.05),drop:()=>tone(180,.12,'sine',.12,0,110),
  good:()=>{tone(784,.18,'sine',.1);tone(1175,.25,'sine',.06,.05)},chime:()=>[523,659,784,1047].forEach((f,i)=>tone(f,.5,'sine',.07,i*.07)),
  bad:()=>tone(160,.22,'sawtooth',.05,0,90),win:()=>[523,659,784,1047,1319].forEach((f,i)=>tone(f,.7,'sine',.08,i*.1)),
  over:()=>[392,330,262].forEach((f,i)=>tone(f,.45,'sine',.08,i*.16)),jump:()=>tone(330,.12,'sine',.07,0,660),power:()=>[440,554,659,880].forEach((f,i)=>tone(f,.3,'triangle',.07,i*.05)),
  bell:()=>{tone(880,1.2,'sine',.08);tone(1320,.9,'sine',.04);tone(2200,.5,'sine',.02)}};
C.sfx=n=>{try{SFX[n]&&SFX[n]()}catch(e){}};
/* loop */
C.loop=function(update,draw){let last=performance.now();function f(t){const dt=Math.min(.05,(t-last)/1000);last=t;if(C.state==='play'&&!C.paused)update(dt);draw(dt);requestAnimationFrame(f)}requestAnimationFrame(f)};
/* canvas fitted to stage with fixed logical size */
C.canvas=function(w,h,parent){
  const cv=$('canvas');(parent||C.stage).appendChild(cv);const ctx=cv.getContext('2d');const o={cv,ctx,w,h,scale:1};
  function fit(){const r=(parent||C.stage).getBoundingClientRect();const pad=o.pad==null?6:o.pad;const s=Math.max(.2,Math.min((r.width-pad)/w,(r.height-pad)/h));o.scale=s;const dpr=Math.min(2.5,window.devicePixelRatio||1);
    cv.style.width=Math.floor(w*s)+'px';cv.style.height=Math.floor(h*s)+'px';cv.width=Math.floor(w*s*dpr);cv.height=Math.floor(h*s*dpr);ctx.setTransform(s*dpr,0,0,s*dpr,0,0);o.onfit&&o.onfit()}
  o.fit=fit;addEventListener('resize',fit);setTimeout(fit,0);fit();
  o.pt=e=>{const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)/r.width*w,y:(e.clientY-r.top)/r.height*h}};
  return o};
/* swipe + tap on an element */
C.swipe=function(el,onSwipe,onTap){let sx,sy,st,id=null,done;
  el.addEventListener('pointerdown',e=>{id=e.pointerId;sx=e.clientX;sy=e.clientY;st=performance.now();done=false});
  el.addEventListener('pointermove',e=>{if(e.pointerId!==id||done)return;const dx=e.clientX-sx,dy=e.clientY-sy;if(Math.hypot(dx,dy)>26){done=true;onSwipe(Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up'),e)}});
  el.addEventListener('pointerup',e=>{if(e.pointerId!==id)return;id=null;if(!done&&onTap&&performance.now()-st<500)onTap(e)});
  el.addEventListener('pointercancel',()=>id=null)};
/* control buttons row: [{label,fn,repeat,cls,up}] */
C.controls=function(list){const row=$('div','ctl');list.forEach(b=>{const e=$('button',b.cls||'',b.label);e.setAttribute('aria-label',b.aria||b.label);let iv,to;
  const stop=()=>{clearTimeout(to);clearInterval(iv);e.classList.remove('on');b.up&&b.up()};
  e.addEventListener('pointerdown',ev=>{ev.preventDefault();if(C.state!=='play'&&!b.always)return;e.classList.add('on');b.fn();if(b.repeat){to=setTimeout(()=>iv=setInterval(()=>C.state==='play'&&b.fn(),b.repeat),b.delay||170)}});
  ['pointerup','pointerleave','pointercancel'].forEach(t=>e.addEventListener(t,stop));row.appendChild(e)});
  document.body.appendChild(row);return row};
/* misc */
C.rng=function(seed){let a=seed>>>0;return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}};
C.today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
C.dayNum=()=>{const d=new Date();return Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/864e5)};
C.shuffle=(a,r)=>{r=r||Math.random;for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
C.rr=function(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()};
C.goldGrad=(ctx,x0,y0,x1,y1)=>{const g=ctx.createLinearGradient(x0,y0,x1,y1);g.addColorStop(0,'#f6e27a');g.addColorStop(.35,'#d4af37');g.addColorStop(.62,'#b8860b');g.addColorStop(1,'#f3d98b');return g};
C.COL={bg:'#0d0709',bg2:'#1a0a10',g1:'#f6e27a',g2:'#d4af37',g3:'#b8860b',g4:'#f3d98b',iv:'#efe6d4',iv2:'#d9cdb6',ox:'#5a0f1c',cr:'#7a1426'};
window.CMG=C;
})();
