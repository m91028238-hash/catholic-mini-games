(function(){
const C=CMG,WORDS=['AARON','ABBEY','ABBOT','ABNER','ADORE','AGAPE','AGNES','ALPHA','ALTAR','AMICE','ANGEL','ANNAS','ARISE','ASHER','ASHES','BABEL','BASIL','BEADS','BELLS','BIBLE','BLESS','BREAD','BRUNO','CALEB','CANON','CAROL','CEDAR','CHANT','CHOIR','CLARE','CREED','CRETE','CROSS','CROWN','CRUET','CRYPT','CURIA','CYRIL','CYRUS','DAVID','DEITY','DINAH','DOGMA','EGYPT','ELDER','ELECT','ENOCH','EPHOD','EXILE','FAITH','FEAST','FLAME','FLOCK','FRIAR','GEMMA','GIFTS','GILES','GLORY','GRACE','GRAIL','HABIT','HAGAR','HEROD','HOREB','HOSEA','HOSTS','HYMNS','ICONS','ISAAC','JACOB','JAMES','JESSE','JESUS','JOASH','JONAH','JOPPA','JUDAH','JUDEA','JUDGE','KNEEL','LABAN','LAITY','LAMBS','LAMPS','LIGHT','LINEN','LOGOS','MAGUS','MANNA','MERCY','MICAH','MITRE','MONKS','MOSES','MOTET','MYRRH','NAHUM','NAOMI','OLIVE','OMEGA','ORDER','PALMS','PAPAL','PASCH','PATEN','PEACE','PETER','PIETA','PIETY','PIOUS','PRIOR','PSALM','QUEEN','RABBI','RELIC','REIGN','RISEN','ROBES','SAINT','SALVE','SARAH','SAVED','SEDER','SERVE','SHEEP','SIDON','SILAS','SIMON','SINAI','SOULS','SPIRE','STAFF','STOLE','STOUP','SYNOD','TITHE','TITUS','TOBIT','TORAH','TRIBE','TRUST','TRUTH','UNITY','URIAH','VERSE','VIGIL','WATER','WHEAT','WINGS','WORLD','ABIDE','HEART','THORN','TOWER','KINGS','NAILS','SPEAR','TUNIC','DOVES','CLOAK','BRIDE','GROOM','WIDOW','SWORD','SLING','GIANT','HARPS','FIELD','SOWER','VINES','YEAST','SEEDS','PEARL','LEPER','BLIND','SHEOL','TOMBS','FLESH','BLOOD','AGNUS','MOUNT','OASIS','ELIAS'];
const st=document.createElement('style');st.textContent=`
#dw{width:100%;max-width:440px;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:10px 8px 8px}
#dwg{display:grid;grid-template-rows:repeat(6,1fr);gap:6px;flex:1;max-height:390px;aspect-ratio:5/6;margin:auto 0}
.dwr{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}
.dwr.shake{animation:sh .35s}@keyframes sh{20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}
.dwt{display:flex;align-items:center;justify-content:center;border:1px solid rgba(212,175,55,.32);border-radius:8px;font:600 1.7rem var(--disp);color:#f3e7c6;background:rgba(26,10,16,.6);text-transform:uppercase;transition:background .3s,border-color .3s}
.dwt.f{border-color:rgba(243,217,139,.75)}
.dwt.g{background:linear-gradient(135deg,#f6e27a,#d4af37 45%,#b8860b);color:#2a1608;border-color:#f6e27a}
.dwt.y{background:#7a1426;border-color:#c25a6a;color:#f6e6d0}
.dwt.x{background:#221a1c;color:#8a7d72;border-color:#3a2e2c}
#dwk{width:100%;display:flex;flex-direction:column;gap:6px;margin-top:10px}
.kr{display:flex;gap:5px;justify-content:center}
.kr button{flex:1;max-width:40px;height:52px;border-radius:7px;border:1px solid rgba(212,175,55,.3);background:rgba(48,18,26,.85);color:#efe6d4;font:600 .95rem var(--serif);padding:0;touch-action:manipulation;cursor:pointer}
.kr button.w{max-width:62px;flex:1.5;font-size:.72rem;letter-spacing:.05em}
.kr button.g{background:#c9a24a;color:#2a1608}.kr button.y{background:#7a1426}.kr button.x{background:#1a1416;color:#6e625a}
#dwn{font-size:.74rem;letter-spacing:.14em;text-transform:uppercase;color:#c9a95a;min-height:1em}`;document.head.appendChild(st);
const root=document.createElement('div');root.id='dw';root.innerHTML='<div id="dwn"></div><div id="dwg"></div><div id="dwk"></div>';C.stage.appendChild(root);
const g=document.getElementById('dwg'),kb=document.getElementById('dwk'),note=document.getElementById('dwn');
for(let r=0;r<6;r++){const row=document.createElement('div');row.className='dwr';for(let c=0;c<5;c++){const t=document.createElement('div');t.className='dwt';row.appendChild(t)}g.appendChild(row)}
const keys={};['QWERTYUIOP','ASDFGHJKL','+ZXCVBNM-'].forEach(r=>{const row=document.createElement('div');row.className='kr';[...r].forEach(ch=>{const b=document.createElement('button');
  if(ch==='+'){b.textContent='Enter';b.className='w';b.onclick=()=>key('Enter')}else if(ch==='-'){b.innerHTML='&#9003;';b.className='w';b.setAttribute('aria-label','Delete');b.onclick=()=>key('Backspace')}else{b.textContent=ch;keys[ch]=b;b.onclick=()=>key(ch)}row.appendChild(b)});kb.appendChild(row)});
let mode,answer,guesses,curG,done;
const ORDER=C.shuffle(WORDS.slice(),C.rng(20261102));
function dailyWord(){return ORDER[((C.dayNum()%ORDER.length)+ORDER.length)%ORDER.length]}
function saved(){try{return JSON.parse(C.LS.get('dw_today','{}'))}catch(e){return{}}}
function streak(){try{return JSON.parse(C.LS.get('dw_streak','{}'))}catch(e){return{}}}
function score(guess){const res=Array(5).fill('x'),a=answer.split(''),used=Array(5).fill(false);
  for(let i=0;i<5;i++)if(guess[i]===a[i]){res[i]='g';used[i]=true}
  for(let i=0;i<5;i++){if(res[i]==='g')continue;const j=a.findIndex((ch,k)=>ch===guess[i]&&!used[k]);if(j>=0){res[i]='y';used[j]=true}}return res}
function paint(){const rows=g.children;for(let r=0;r<6;r++){const word=r<guesses.length?guesses[r]:(r===guesses.length?curG:'');const res=r<guesses.length?score(guesses[r]):null;
  for(let c=0;c<5;c++){const t=rows[r].children[c];t.textContent=word[c]||'';t.className='dwt'+(res?' '+res[c]:(word[c]?' f':''))}}
  Object.values(keys).forEach(b=>b.className='');const rank={x:1,y:2,g:3};const best={};guesses.forEach(w=>score(w).forEach((s,i)=>{if(!best[w[i]]||rank[s]>rank[best[w[i]]])best[w[i]]=s}));for(const ch in best)keys[ch].className=best[ch];
  note.textContent=mode==='daily'?'Today\u2019s word · '+C.today():'Practice';C.hud(mode==='daily'?`Streak <b>${(streak().cur)||0}</b><br>Guess <b>${Math.min(6,guesses.length+1)}/6</b>`:`Practice<br>Guess <b>${Math.min(6,guesses.length+1)}/6</b>`)}
function key(k){if(C.state!=='play'||done)return;
  if(k==='Enter'){if(curG.length<5){shake();note.textContent='Five letters needed';return}guesses.push(curG);curG='';C.sfx('tap');
    const won=guesses[guesses.length-1]===answer;if(won||guesses.length>=6){done=true;finish(won)}else C.sfx('move');save();paint();return}
  if(k==='Backspace'){curG=curG.slice(0,-1);paint();return}
  if(/^[A-Z]$/.test(k)&&curG.length<5){curG+=k;C.sfx('tap');paint()}}
function shake(){const r=g.children[guesses.length];if(!r)return;r.classList.remove('shake');void r.offsetWidth;r.classList.add('shake');C.sfx('bad')}
function save(){if(mode==='daily')C.LS.set('dw_today',JSON.stringify({date:C.today(),guesses,done}))}
function finish(won){save();paint();
  if(mode==='daily'){const s=streak(),today=C.today();const y=new Date();y.setDate(y.getDate()-1);const yest=y.getFullYear()+'-'+String(y.getMonth()+1).padStart(2,'0')+'-'+String(y.getDate()).padStart(2,'0');
    let cur=won?(s.last===yest?(s.cur||0)+1:1):0;if(s.last===today)cur=s.cur||0;C.LS.set('dw_streak',JSON.stringify({last:won?today:s.last,cur}));C.saveBest(cur)}
  setTimeout(()=>result(won),900)}
function result(won){const s=streak();C.gameOver(0,{noScore:true,win:won,title:won?'Well done':'The word was',again:'Practice',againOpt:'practice',
  html:`<div class="big" style="letter-spacing:.12em">${answer}</div><div class="lab">${won?'Solved in '+guesses.length+' of 6':'Not solved this time'}</div>`+(mode==='daily'?`<div class="lab">Daily streak: ${s.cur||0}</div>`:''),
  msg:mode==='daily'?'A new word arrives tomorrow.':'Another practice word is ready.'})}
addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey)return;if(e.key==='Enter'&&C.state==='play'){e.preventDefault();key('Enter')}else if(e.key==='Backspace')key('Backspace');else if(/^[a-zA-Z]$/.test(e.key))key(e.key.toUpperCase())});
function dailyDone(){const s=saved();return s.date===C.today()&&s.done}
C.init({id:'dw',title:'Daily Word',key:'dw_best',noPause:true,bestLabel:'Best streak',desc:'Guess the day\u2019s Catholic or Biblical word in six tries. Gold means right place; crimson means in the word but elsewhere.',startLabel:'Today\u2019s Word',
  menuExtra:[{label:'Practice',sec:1,fn:()=>C.start('practice')}],
  onStart(d,opt){mode=opt==='practice'?'practice':'daily';curG='';done=false;
    if(mode==='daily'){answer=dailyWord();const s=saved();guesses=s.date===C.today()?s.guesses||[]:[];done=!!(s.date===C.today()&&s.done);paint();if(done){const won=guesses.includes(answer);setTimeout(()=>result(won),300)}}
    else{let w;do{w=WORDS[Math.floor(Math.random()*WORDS.length)]}while(w===answer);answer=w;guesses=[];paint()}}});
})();
