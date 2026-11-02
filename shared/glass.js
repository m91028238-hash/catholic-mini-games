/* Procedural stained glass + Catholic motifs (shared by puzzle and other games) */
(function(){
const PAL=[['#9b1b30','#c22a3f','#6e0f20'],['#1f3f8f','#2f5fbf','#16306b'],['#1f6b45','#2f8f5f','#145034'],['#c8901e','#e2b23a','#9a6b12'],['#5b2a86','#7a43a8','#3f1b60'],['#2a7f8f','#3fa3b3','#1b5c68'],['#b5562a','#d4733f','#8a3d1b']];
const LEAD='#160d0b';
function motif(ctx,t,cx,cy,s){
  ctx.save();ctx.translate(cx,cy);ctx.scale(s/100,s/100);ctx.lineJoin='round';ctx.lineCap='round';
  const gold=ctx.createLinearGradient(-50,-50,50,50);gold.addColorStop(0,'#fff3b8');gold.addColorStop(.5,'#e8c252');gold.addColorStop(1,'#b8860b');
  ctx.shadowColor='rgba(255,240,200,.6)';ctx.shadowBlur=12;ctx.strokeStyle=LEAD;ctx.lineWidth=5;
  const F=(c)=>{ctx.fillStyle=c;ctx.fill();ctx.shadowBlur=0;ctx.stroke();ctx.shadowBlur=12};
  ctx.beginPath();
  switch(t){
  case 0: /* cross */ ctx.moveTo(-9,-46);ctx.lineTo(9,-46);ctx.lineTo(9,-18);ctx.lineTo(32,-18);ctx.lineTo(32,0);ctx.lineTo(9,0);ctx.lineTo(9,48);ctx.lineTo(-9,48);ctx.lineTo(-9,0);ctx.lineTo(-32,0);ctx.lineTo(-32,-18);ctx.lineTo(-9,-18);ctx.closePath();F(gold);break;
  case 1: /* dove */ ctx.moveTo(-44,6);ctx.quadraticCurveTo(-10,-6,10,2);ctx.quadraticCurveTo(26,-4,38,-2);ctx.quadraticCurveTo(46,0,40,6);ctx.quadraticCurveTo(28,8,22,16);ctx.quadraticCurveTo(0,30,-30,20);ctx.lineTo(-48,26);ctx.lineTo(-40,12);ctx.closePath();F('#f7f1e3');
    ctx.beginPath();ctx.moveTo(-6,0);ctx.quadraticCurveTo(-20,-40,-2,-52);ctx.quadraticCurveTo(4,-30,16,0);ctx.closePath();F('#f7f1e3');
    ctx.beginPath();ctx.arc(30,-3,2.5,0,Math.PI*2);ctx.fillStyle=LEAD;ctx.fill();break;
  case 2: /* chalice */ ctx.moveTo(-30,-24);ctx.lineTo(30,-24);ctx.quadraticCurveTo(28,10,6,16);ctx.lineTo(6,34);ctx.quadraticCurveTo(24,38,26,46);ctx.lineTo(-26,46);ctx.quadraticCurveTo(-24,38,-6,34);ctx.lineTo(-6,16);ctx.quadraticCurveTo(-28,10,-30,-24);ctx.closePath();F(gold);
    ctx.beginPath();ctx.arc(0,-40,16,0,Math.PI*2);F('#fbf6e8');ctx.beginPath();ctx.moveTo(0,-50);ctx.lineTo(0,-30);ctx.moveTo(-8,-42);ctx.lineTo(8,-42);ctx.lineWidth=3;ctx.stroke();break;
  case 3: /* lily */ for(const a of [-0.5,0,0.5]){ctx.save();ctx.rotate(a);ctx.beginPath();ctx.moveTo(0,8);ctx.quadraticCurveTo(-16,-24,0,-48);ctx.quadraticCurveTo(16,-24,0,8);F('#fbf6e8');ctx.restore()}
    ctx.beginPath();ctx.moveTo(-3,6);ctx.lineTo(3,6);ctx.lineTo(3,48);ctx.lineTo(-3,48);ctx.closePath();F('#3f8f5f');ctx.beginPath();ctx.ellipse(14,30,14,5,-.6,0,Math.PI*2);F('#3f8f5f');ctx.beginPath();ctx.ellipse(-14,34,14,5,.6,0,Math.PI*2);F('#3f8f5f');break;
  case 4: /* chi-rho */ ctx.lineWidth=14;ctx.strokeStyle=LEAD;ctx.moveTo(-30,-30);ctx.lineTo(30,30);ctx.moveTo(30,-30);ctx.lineTo(-30,30);ctx.moveTo(0,-46);ctx.lineTo(0,46);ctx.moveTo(0,-46);ctx.quadraticCurveTo(30,-46,30,-30);ctx.quadraticCurveTo(30,-14,0,-14);ctx.stroke();ctx.lineWidth=8;ctx.strokeStyle=gold;ctx.stroke();break;
  case 5: /* sacred heart */ ctx.moveTo(0,40);ctx.bezierCurveTo(-50,8,-34,-30,0,-12);ctx.bezierCurveTo(34,-30,50,8,0,40);F('#c22a3f');
    ctx.beginPath();ctx.moveTo(-8,-16);ctx.quadraticCurveTo(-14,-36,0,-50);ctx.quadraticCurveTo(14,-36,8,-16);ctx.closePath();F('#f3b73a');ctx.beginPath();ctx.moveTo(-3,-22);ctx.lineTo(3,-22);ctx.lineTo(3,-36);ctx.lineTo(9,-36);ctx.lineTo(9,-41);ctx.lineTo(3,-41);ctx.lineTo(3,-47);ctx.lineTo(-3,-47);ctx.lineTo(-3,-41);ctx.lineTo(-9,-41);ctx.lineTo(-9,-36);ctx.lineTo(-3,-36);ctx.closePath();F(gold);break;
  case 6: /* keys */ for(const sgn of [-1,1]){ctx.save();ctx.rotate(sgn*0.75);ctx.beginPath();ctx.arc(0,-34,12,0,Math.PI*2);ctx.moveTo(-4,-22);ctx.lineTo(4,-22);ctx.lineTo(4,44);ctx.lineTo(-4,44);ctx.closePath();ctx.rect(4,26,12,7);ctx.rect(4,37,10,7);F(sgn<0?'#e9edf2':gold);ctx.restore()}break;
  default: /* star */ for(let i=0;i<16;i++){const a=i/16*Math.PI*2-Math.PI/2,r=i%2?18:46;ctx[i?'lineTo':'moveTo'](Math.cos(a)*r,Math.sin(a)*r)}ctx.closePath();F(gold);
  }
  ctx.restore()}
function window_(ctx,S,seed){
  const r=CMG.rng(seed);const pal=CMG.shuffle(PAL.slice(),r).slice(0,4);const pick=()=>{const p=pal[Math.floor(r()*pal.length)];return p[Math.floor(r()*3)]};
  ctx.save();ctx.fillStyle=LEAD;ctx.fillRect(0,0,S,S);ctx.lineWidth=Math.max(2,S/170);ctx.strokeStyle=LEAD;
  /* background quarries */
  const q=S/(6+Math.floor(r()*4));
  for(let y=-q;y<S+q;y+=q/2)for(let x=-q;x<S+q;x+=q){const ox=(Math.round(y/(q/2))%2)?q/2:0;const p=()=>{ctx.beginPath();ctx.moveTo(x+ox,y-q/2);ctx.lineTo(x+ox+q/2,y);ctx.lineTo(x+ox,y+q/2);ctx.lineTo(x+ox-q/2,y);ctx.closePath()};
    const c=pal[(((Math.floor(x/q)+Math.floor(y/q))%pal.length)+pal.length)%pal.length][2];p();ctx.fillStyle=c;ctx.fill();ctx.globalAlpha=.12+r()*.18;ctx.fillStyle='#fff';ctx.fill();ctx.globalAlpha=1;ctx.stroke()}
  const type=Math.floor(r()*2),mot=Math.floor(r()*8);
  if(type===0){/* rose window */
    const cx=S/2,cy=S/2,R=S*.47;const rings=[R*.26,R*.5,R*.76,R];const segs=[0,[6,8][Math.floor(r()*2)],12,[16,24][Math.floor(r()*2)]];
    for(let k=3;k>=1;k--){const n=segs[k],off=r()*Math.PI;for(let i=0;i<n;i++){const a0=off+i/n*Math.PI*2,a1=off+(i+1)/n*Math.PI*2;const c=pick();
      ctx.beginPath();ctx.arc(cx,cy,rings[k],a0,a1);ctx.arc(cx,cy,rings[k-1],a1,a0,true);ctx.closePath();
      const g=ctx.createRadialGradient(cx,cy,rings[k-1],cx,cy,rings[k]);g.addColorStop(0,c);g.addColorStop(1,shade(c,-.25));ctx.fillStyle=g;ctx.fill();ctx.stroke();
      if(k===3&&r()<.7){const am=(a0+a1)/2,rm=(rings[2]+rings[3])/2;ctx.beginPath();ctx.arc(cx+Math.cos(am)*rm,cy+Math.sin(am)*rm,(rings[3]-rings[2])*.28,0,Math.PI*2);ctx.fillStyle=pick();ctx.fill();ctx.stroke()}}}
    ctx.beginPath();ctx.arc(cx,cy,rings[0],0,Math.PI*2);const g=ctx.createRadialGradient(cx,cy,0,cx,cy,rings[0]);g.addColorStop(0,'#3f7fd0');g.addColorStop(1,'#1a3270');ctx.fillStyle=r()<.5?g:'#7a1426';ctx.fill();ctx.stroke();
    ctx.lineWidth=S/60;ctx.strokeStyle='#b8860b';ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);ctx.stroke();ctx.lineWidth=S/170;ctx.strokeStyle=LEAD;ctx.stroke();
    motif(ctx,mot,cx,cy,rings[0]*1.6);
  }else{/* three lancets */
    const w=S*.28,gap=(S-3*w)/4;
    for(let i=0;i<3;i++){const x=gap+i*(w+gap),y=S*.06,h=S*.88;const path=()=>{ctx.beginPath();ctx.moveTo(x,y+h);ctx.lineTo(x,y+w*.6);ctx.quadraticCurveTo(x,y,x+w/2,y-w*.05);ctx.quadraticCurveTo(x+w,y,x+w,y+w*.6);ctx.lineTo(x+w,y+h);ctx.closePath()};
      path();const g=ctx.createLinearGradient(0,y,0,y+h);const c=pick();g.addColorStop(0,shade(c,.15));g.addColorStop(1,shade(c,-.3));ctx.fillStyle=g;ctx.fill();
      ctx.save();path();ctx.clip();const bh=h/7;for(let j=1;j<7;j++){ctx.beginPath();ctx.moveTo(x,y+j*bh);ctx.lineTo(x+w,y+j*bh);ctx.stroke()}
      for(let j=0;j<7;j++){ctx.fillStyle=pick();ctx.fillRect(x+3,y+j*bh+3,w*.12,bh-6);ctx.fillRect(x+w-3-w*.12,y+j*bh+3,w*.12,bh-6)}ctx.restore();
      ctx.lineWidth=S/80;ctx.strokeStyle='#b8860b';path();ctx.stroke();ctx.lineWidth=S/170;ctx.strokeStyle=LEAD;ctx.stroke();
      motif(ctx,(mot+i*3)%8,x+w/2,y+h*.45,w*.82)}
  }
  ctx.restore()}
function shade(hex,p){const n=parseInt(hex.slice(1),16);let R=n>>16,G=n>>8&255,B=n&255;const f=p<0?0:255,t=Math.abs(p);R=Math.round(R+(f-R)*t);G=Math.round(G+(f-G)*t);B=Math.round(B+(f-B)*t);return'#'+((1<<24)|(R<<16)|(G<<8)|B).toString(16).slice(1)}
window.GLASS={window:window_,motif,shade,PAL};
})();
