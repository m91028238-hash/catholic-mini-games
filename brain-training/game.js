const $=id=>document.getElementById(id),G=$('grid'),M=$('menu');$('time').textContent='';
const L=JSON.parse(localStorage.getItem('bt_modes')||'{"m":1,"r":1,"b":1}'),B=JSON.parse(localStorage.getItem('bt_modesbest')||'{"m":0,"r":0,"b":0}');
const NAMES={m:'Saints Memory Match',r:'Rosary Sequence',b:'Bible Order'};
const SAINTS=[['St Peter','Keys'],['St Patrick','Shamrock'],['St Francis','Animals'],['St Joseph','Carpenters'],['St Anthony','Lost things'],['St Jude','Lost causes'],['St Cecilia','Music'],['St Luke','Doctors'],['St Lucy','Eyes'],['St Christopher','Travellers'],['St Michael','Sword & scales'],['St Catherine','Wheel']];
const BOOKS=['Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth','1 Samuel','2 Samuel','1 Kings','2 Kings','Tobit','Judith','Job','Psalms','Proverbs','Wisdom','Sirach','Isaiah','Jeremiah','Matthew','Mark','Luke','John','Acts','Romans','Hebrews','James','Revelation'];
let mode,lock,step,seq,cur,first,miss,t0,lives=3,nextT;
const SC=JSON.parse(localStorage.getItem('bt_score')||'{"m":0,"r":0,"b":0}');
const BADGES=['Altar Server','Lector','Catechist','Deacon','Missionary','Doctor of the Church'];
const FACTS=['St Peter was the first Pope.','St Patrick used the shamrock to teach the Trinity.','St Francis wrote the Canticle of the Sun.','The Bible has 73 books in Catholic tradition.','St Jerome translated the Bible into Latin.','St Luke was a physician.','The Rosary has 20 mysteries.','St Thérèse is called the Little Flower.','Psalms is the longest book of the Bible.','St Augustine wrote the Confessions.','St Joseph is patron of the universal Church.','St Cecilia is patron of musicians.','The Book of Tobit features the Archangel Raphael.','St Catherine of Siena is a Doctor of the Church.','St Dominic is linked with spreading the Rosary.'];
const MAXL=30,badge=l=>BADGES[Math.min(BADGES.length-1,Math.floor((l-1)/5))-0],nextB=l=>Math.ceil((l+0.01)/5)*5;
function earned(l){const n=Math.floor((l-1)/5);return n?BADGES[Math.min(n,BADGES.length)-1]:'None yet'}
const sh=a=>a.map(x=>[Math.random(),x]).sort((p,q)=>p[0]-q[0]).map(p=>p[1]);
function toast(s){const e=$('toast');e.textContent=s;e.classList.add('on');setTimeout(()=>e.classList.remove('on'),1500)}
function save(){localStorage.setItem('bt_score',JSON.stringify(SC));localStorage.setItem('bt_modes',JSON.stringify(L));localStorage.setItem('bt_modesbest',JSON.stringify(B));localStorage.setItem('bt_lvl',Math.max(...Object.values(L)));localStorage.setItem('bt_best',Object.values(B).reduce((a,b)=>a+b))}
function head(o,s){$('obj').textContent=o;$('theme').textContent=s}
function menu(){clearTimeout(nextT);$('result').className='';mode=null;G.innerHTML='';head('Brain Training','Choose a mode');
  M.innerHTML=Object.keys(NAMES).map(k=>`<button data-k="${k}">${NAMES[k]}<br><small>Level ${L[k]} · Best ${B[k]} · Score ${SC[k]}</small><br><small>🏅 ${earned(L[k])}</small><div class="bar"><i style="width:${((L[k]-1)%5)/5*100}%"></i></div><small>Next badge: ${BADGES[Math.min(BADGES.length-1,Math.floor((L[k]-1)/5))]} at Level ${nextB(L[k])}</small></button>`).join('');
  M.querySelectorAll('button').forEach(b=>b.onclick=()=>start(b.dataset.k))}
function btn(t,c,f){const b=document.createElement('button');b.textContent=t;if(c)b.className=c;b.onclick=()=>f(b);G.appendChild(b);return b}
function win(){const k=mode,l=L[k];lock=true;const t=(Date.now()-t0)/1000,st=miss===0&&t<5+l*3?3:miss<=2?2:1,pts=l*10*st;SC[k]+=pts;B[k]=Math.max(B[k],l);L[k]++;save();
  if(l%5===0)toast(`🏅 Badge earned: ${BADGES[Math.min(BADGES.length,l/5)-1]}!`);else toast('✝ '+FACTS[Math.random()*FACTS.length|0]);
  const r=$('result');r.innerHTML=`<b>Level ${l} complete! +${pts}</b> <span>${'★'.repeat(st)}${'☆'.repeat(3-st)}</span> <button id="nx">Next level ›</button>`;r.className='on';
  $('nx').onclick=()=>start(k);nextT=setTimeout(()=>start(k),2200)}
function lose(){if(mode==='r'&&--lives>0){toast(`Wrong bead! ${lives} ${lives>1?'lives':'life'} left`);miss++;lock=true;setTimeout(()=>start(mode,true),1200);return}
  lives=3;toast('Not quite, retry this level');lock=true;setTimeout(()=>start(mode),1200)}
function start(k,keep){clearTimeout(nextT);$('result').className='';if(mode!==k||!keep){lives=3;miss=0}mode=k;M.innerHTML='';G.innerHTML='';lock=false;t0=Date.now();const l=L[k];const H=head;head=(o,s)=>{H(`Level ${l} of ${MAXL}: ${o.replace(/^Level \d+: /,'')} — Next badge at Level ${nextB(l)}`,`Score ${SC[k]}${k==='r'?' · '+'❤'.repeat(lives):''} · ${s}`);head=H};
  if(k==='m'){const n=Math.min(12,l+2);head(`Level ${l}: Match ${n} pairs`,'Saint to symbol or patronage');G.style.setProperty('--c',n>6?4:3);
    let left=n;first=null;sh(sh(SAINTS).slice(0,n).flatMap((p,i)=>[[p[0],i],[p[1],i]])).forEach(([t,i])=>{const b=btn('✝','back',b=>{
      if(lock||b===first||b.className==='ok')return;b.className='';b.textContent=t;
      if(!first){first=b;return}const a=first;first=null;
      if(a.dataset.i===b.dataset.i){a.className=b.className='ok';if(--left===0)win()}
      else{miss++;lock=true;setTimeout(()=>{a.className=b.className='back';a.textContent=b.textContent='✝';lock=false},800)}});b.dataset.i=i})}
  if(k==='r'){const n=l+2;head(`Level ${l}: Repeat ${n} beads`,'Watch, then tap the beads in order');G.style.setProperty('--c',3);
    seq=[...Array(n)].map(()=>Math.random()*6|0);cur=0;lock=true;
    const bs=['●','●','●','●','●','●'].map((t,i)=>btn(t,'bead',b=>{if(lock)return;flash(b);if(i!==seq[cur])return lose();if(++cur===n)win()}));
    ['#8b1e1e','#1e4b8b','#2e7d32','#b8860b','#6a1b9a','#5d4037'].forEach((c,i)=>bs[i].style.color=c);
    seq.forEach((s,j)=>setTimeout(()=>flash(bs[s]),600+j*Math.max(350,800-l*40)));setTimeout(()=>lock=false,600+n*Math.max(350,800-l*40));
    function flash(b){b.classList.add('glow');setTimeout(()=>b.classList.remove('glow'),300)}}
  if(k==='b'){const n=Math.min(BOOKS.length,l+3);head(`Level ${l}: Order ${n} books`,'Tap from first to last');G.style.setProperty('--c',2);
    const pick=sh(BOOKS.map((_,i)=>i)).slice(0,n).sort((a,b)=>a-b);cur=0;
    sh(pick).forEach(i=>btn(BOOKS[i],'',b=>{if(b.className==='ok')return;if(i!==pick[cur])return lose();b.className='ok';if(++cur===n)win()}))}}
$('top').querySelector('a').onclick=e=>{if(mode){e.preventDefault();menu()}};
menu();
