(function(){
const C=CMG,Q=window.QUESTIONS;
const st=document.createElement('style');st.textContent=`
#qz{width:100%;max-width:440px;height:100%;display:flex;flex-direction:column;padding:16px 16px 18px;gap:12px}
#qmeta{display:flex;justify-content:space-between;font-size:.74rem;letter-spacing:.14em;text-transform:uppercase;color:#c9a95a}
#qbar{height:4px;border-radius:4px;background:rgba(212,175,55,.15);overflow:hidden}#qbar i{display:block;height:100%;width:100%;background:linear-gradient(90deg,#b8860b,#f6e27a);transform-origin:left}
#qq{flex:1;display:flex;align-items:center;justify-content:center;text-align:center;font-family:var(--disp);font-weight:600;font-size:1.65rem;line-height:1.2;color:#f3e7c6;padding:10px 6px;min-height:120px;border-radius:90px 90px 14px 14px;border:1px solid rgba(212,175,55,.3);background:linear-gradient(180deg,rgba(48,18,26,.55),rgba(16,9,12,.6))}
#qa{display:grid;gap:9px}
#qa button{min-height:54px;padding:10px 14px;border-radius:14px;border:1px solid rgba(212,175,55,.42);background:linear-gradient(180deg,rgba(40,16,22,.92),rgba(18,9,12,.95));color:#efe6d4;font:500 1rem var(--serif);text-align:left;display:flex;gap:10px;align-items:center;cursor:pointer;touch-action:manipulation}
#qa button b{flex:0 0 26px;height:26px;border-radius:50%;border:1px solid rgba(212,175,55,.5);display:flex;align-items:center;justify-content:center;font-size:.75rem;color:#d4af37}
#qa button.ok{background:linear-gradient(180deg,rgba(47,95,60,.9),rgba(25,55,35,.95));border-color:#7fcf9a}
#qa button.no{background:linear-gradient(180deg,rgba(122,20,38,.9),rgba(70,12,22,.95));border-color:#e07a8a}
#qnote{text-align:center;font-size:.8rem;color:#d9cdb6;min-height:1.2em}`;document.head.appendChild(st);
const root=document.createElement('div');root.id='qz';root.innerHTML='<div id="qmeta"><span id="qm1"></span><span id="qm2"></span></div><div id="qbar"><i></i></div><div id="qq"></div><div id="qa"></div><div id="qnote"></div>';C.stage.appendChild(root);
const el=id=>document.getElementById(id);
let mode,pool,idx,cur,lives,score,streak,bestStreak,count,correct,timer,tmax,locked,daily;
const TIMES=[25,20,15];const DKEY='bq_daily';
function dailyInfo(){try{return JSON.parse(C.LS.get(DKEY,'{}'))}catch(e){return{}}}
function mkPool(){const d=C.diff;const allowed=d===0?[1]:d===1?[1,2]:[2,3];return C.shuffle(Q.filter(q=>allowed.includes(q[0])))}
function next(){
  if(mode==='daily'&&count>=10)return finishDaily();
  if(idx>=pool.length){pool=C.shuffle(pool);idx=0}
  const q=pool[idx++];count++;cur={q,ans:C.shuffle(q.slice(2).map((a,i)=>({a,ok:i===0})))};locked=false;timer=tmax;
  el('qq').textContent=q[1];el('qnote').textContent='';
  el('qa').innerHTML='';cur.ans.forEach((x,i)=>{const b=document.createElement('button');b.innerHTML='<b>'+(i+1)+'</b><span></span>';b.querySelector('span').textContent=x.a;b.onclick=()=>pick(i);el('qa').appendChild(b)});hudU()}
function pick(i){if(locked||C.state!=='play')return;locked=true;const bs=el('qa').children;const okI=cur.ans.findIndex(x=>x.ok);bs[okI].classList.add('ok');
  if(i===okI){correct++;streak++;bestStreak=Math.max(bestStreak,streak);const pts=(10*[1,2,3][cur.q[0]-1])+Math.ceil(Math.max(0,timer));score+=pts;C.sfx('good');el('qnote').textContent=streak>2?`Streak ${streak} · +${pts}`:`+${pts}`}
  else{if(i>=0)bs[i].classList.add('no');streak=0;C.sfx('bad');el('qnote').textContent=i<0?'Time is up':'The answer is shown in green';if(mode==='endless'){lives--}}
  hudU();setTimeout(()=>{if(C.state!=='play'&&C.state!=='pause')return;if(mode==='endless'&&lives<=0){C.score=score;C.gameOver(score,{msg:`${correct} correct · best streak ${bestStreak}`});return}waitNext()},i===okI?800:1500)}
function waitNext(){if(C.state==='pause'){setTimeout(waitNext,300);return}if(C.state==='play')next()}
function hudU(){if(mode==='daily'){C.hud(`Daily <b>${Math.min(count,10)}/10</b><br>Correct <b>${correct}</b>`);el('qm1').textContent='Daily Ten';el('qm2').textContent='Question '+Math.min(count,10)+' of 10'}
  else{C.hud(`Score <b>${score}</b><br>${'&#10014;'.repeat(Math.max(0,lives))}`);el('qm1').textContent=['Easy','Medium','Hard'][C.diff];el('qm2').textContent='Streak '+streak}}
function finishDaily(){const di=dailyInfo(),today=C.today();const y=new Date();y.setDate(y.getDate()-1);const yest=y.getFullYear()+'-'+String(y.getMonth()+1).padStart(2,'0')+'-'+String(y.getDate()).padStart(2,'0');
  const s=di.last===today?di.streak:(di.last===yest?(di.streak||0)+1:1);C.LS.set(DKEY,JSON.stringify({last:today,streak:s,score:correct}));
  C.gameOver(correct,{noScore:true,win:correct>=7,title:'Daily Ten',again:'Endless Play',html:`<div class="lab">Correct</div><div class="big">${correct}/10</div><div class="lab">Daily streak: ${s} day${s===1?'':'s'}</div>`,msg:'A new set of questions arrives tomorrow.'})}
function startDaily(){const di=dailyInfo();if(di.last===C.today()){C.gameOver(0,{noScore:true,title:'Daily Ten',html:`<div class="lab">Today</div><div class="big">${di.score}/10</div><div class="lab">Daily streak: ${di.streak} day${di.streak===1?'':'s'}</div>`,msg:'Already completed today. Try endless play meanwhile.',again:'Endless Play'});return}
  C.start('daily')}
C.loop(dt=>{if(locked||!cur)return;timer-=dt;el('qbar').firstChild.style.transform=`scaleX(${Math.max(0,timer/tmax)})`;if(timer<=0)pick(-1)},()=>{});
addEventListener('keydown',e=>{if(C.state==='play'&&e.key>='1'&&e.key<='4')pick(+e.key-1)});
C.init({id:'bq',title:'Bible Trivia',key:'bq_best',desc:`${Q.length} questions on Scripture and the Church. Endless play with three lives, or the Daily Ten to keep your streak.`,diffs:['Easy','Medium','Hard'],defDiff:0,startLabel:'Endless Play',
  menuExtra:[()=>{const di=dailyInfo();return{label:'Daily Ten'+(di.streak?` · streak ${di.streak}`:''),sec:1,fn:startDaily}}],
  onStart(d,opt){mode=opt==='daily'?'daily':'endless';tmax=TIMES[mode==='daily'?1:d];
    if(mode==='daily'){const r=C.rng(C.dayNum()*2654435761>>>0);pool=C.shuffle(Q.slice(),r).slice(0,10)}else pool=mkPool();
    idx=0;lives=3;score=0;streak=0;bestStreak=0;count=0;correct=0;next()}});
})();
