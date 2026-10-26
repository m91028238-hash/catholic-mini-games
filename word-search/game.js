const T={'Saints':['PETER','PAUL','MARY','JOSEPH','FRANCIS','CLARE','BENEDICT','THERESE','AUGUSTINE','PATRICK','DOMINIC','MONICA','AGNES','IGNATIUS','CATHERINE','ANTHONY','BRIGID'],
'Sacraments':['BAPTISM','CONFIRMATION','EUCHARIST','PENANCE','ANOINTING','HOLYORDERS','MATRIMONY','GRACE','CHRISM','HOST','PRIEST','BISHOP','ALTAR','FONT'],
'Rosary Mysteries':['ANNUNCIATION','VISITATION','NATIVITY','PRESENTATION','FINDING','AGONY','SCOURGING','CROWNING','CRUCIFIXION','RESURRECTION','ASCENSION','PENTECOST','ASSUMPTION','BAPTISM','TRANSFIGURATION'],
'Books of the Bible':['GENESIS','EXODUS','LEVITICUS','NUMBERS','JOSHUA','JUDGES','RUTH','PSALMS','ISAIAH','TOBIT','JUDITH','MATTHEW','MARK','LUKE','JOHN','ACTS','ROMANS','HEBREWS','JAMES','JUDE','SIRACH','WISDOM'],
'Parts of the Mass':['INTROIT','KYRIE','GLORIA','COLLECT','GOSPEL','HOMILY','CREDO','OFFERTORY','SANCTUS','CONSECRATION','AGNUSDEI','COMMUNION','DISMISSAL','PREFACE','BLESSING'],
'Virtues':['FAITH','HOPE','CHARITY','PRUDENCE','JUSTICE','FORTITUDE','TEMPERANCE','HUMILITY','PATIENCE','CHASTITY','KINDNESS','DILIGENCE','MEEKNESS','PIETY']};
const TN=Object.keys(T),$=id=>document.getElementById(id),G=$('grid');
let lvl=+localStorage.getItem('ws_lvl')||1,N,grid,words,found,t0,sel=[],start=null,timer;
function toast(s){const e=$('toast');e.textContent=s;e.classList.add('on');setTimeout(()=>e.classList.remove('on'),1800)}
function build(){
  N=Math.min(14,7+lvl);const cnt=Math.min(14,5+lvl),th=TN[(lvl-1)%TN.length];
  let dirs=[[0,1],[1,0]];if(lvl>=3)dirs.push([1,1],[-1,1]);if(lvl>=5)dirs.push([0,-1],[-1,0],[-1,-1],[1,-1]);
  for(let tries=0;;tries++){
    grid=Array.from({length:N},()=>Array(N).fill(''));words=[];
    const pool=T[th].filter(w=>w.length<=N).sort(()=>Math.random()-.5);
    for(const w of pool){if(words.length>=cnt)break;
      for(let k=0;k<200;k++){const[dr,dc]=dirs[Math.random()*dirs.length|0],r=Math.random()*N|0,c=Math.random()*N|0;
        let ok=true;for(let i=0;i<w.length;i++){const rr=r+dr*i,cc=c+dc*i;if(rr<0||cc<0||rr>=N||cc>=N||(grid[rr][cc]&&grid[rr][cc]!==w[i])){ok=false;break}}
        if(ok){for(let i=0;i<w.length;i++)grid[r+dr*i][c+dc*i]=w[i];words.push({w,cells:[...Array(w.length)].map((_,i)=>(r+dr*i)*N+c+dc*i)});break}}}
    if(words.length>=Math.min(cnt,pool.length)||tries>30)break}
  const A='ABCDEFGHIJKLMNOPRSTUVWY';
  G.style.gridTemplateColumns=`repeat(${N},1fr)`;G.style.setProperty('--fs',Math.floor(200/N)+'px');G.innerHTML='';
  for(let i=0;i<N*N;i++){const s=document.createElement('span');s.textContent=grid[i/N|0][i%N]||A[Math.random()*A.length|0];s.dataset.i=i;G.appendChild(s)}
  found=new Set();$('obj').textContent=`Level ${lvl}: Find ${words.length} words`;$('theme').textContent=th;
  $('list').innerHTML=words.map(o=>`<li id="w_${o.w}">${o.w==='AGNUSDEI'?'AGNUS DEI':o.w==='HOLYORDERS'?'HOLY ORDERS':o.w}</li>`).join('');
  t0=Date.now();clearInterval(timer);timer=setInterval(()=>{const s=(Date.now()-t0)/1000|0;$('time').textContent=`${s/60|0}:${String(s%60).padStart(2,'0')}`},500)}
function cellAt(e){const p=e.touches?e.touches[0]:e,el=document.elementFromPoint(p.clientX,p.clientY);return el&&el.dataset.i!=null?+el.dataset.i:null}
function line(a,b){const r0=a/N|0,c0=a%N,r1=b/N|0,c1=b%N,dr=Math.sign(r1-r0),dc=Math.sign(c1-c0),n=Math.max(Math.abs(r1-r0),Math.abs(c1-c0));
  if(r0!==r1&&c0!==c1&&Math.abs(r1-r0)!==Math.abs(c1-c0))return[a];return[...Array(n+1)].map((_,i)=>(r0+dr*i)*N+c0+dc*i)}
function paint(){[...G.children].forEach((s,i)=>s.classList.toggle('sel',sel.includes(i)))}
function down(e){e.preventDefault();start=cellAt(e);if(start!=null){sel=[start];paint()}}
function move(e){if(start==null)return;e.preventDefault();const c=cellAt(e);if(c!=null){sel=line(start,c);paint()}}
function up(){if(start==null)return;start=null;const k=sel.join(),kr=[...sel].reverse().join();
  const o=words.find(o=>!found.has(o.w)&&(o.cells.join()===k||o.cells.join()===kr));if(o)mark(o);sel=[];paint()}
function mark(o){found.add(o.w);o.cells.forEach(i=>G.children[i].classList.add('f'));$('w_'+o.w).classList.add('done');
  if(found.size===words.length){const s=(Date.now()-t0)/1000|0,b=+localStorage.getItem('ws_best')||0;
    if(!b||s<b)localStorage.setItem('ws_best',s);lvl++;localStorage.setItem('ws_lvl',lvl);clearInterval(timer);
    toast(`Level complete in ${s}s! Next level…`);setTimeout(build,1600)}else toast(o.w+' found')}
G.addEventListener('mousedown',down);addEventListener('mousemove',move);addEventListener('mouseup',up);
G.addEventListener('touchstart',down,{passive:false});addEventListener('touchmove',move,{passive:false});addEventListener('touchend',up);
build();
