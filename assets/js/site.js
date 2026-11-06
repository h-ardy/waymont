/* ============================================================
   SETTINGS: change these to update the site
   ============================================================ */
var SITE = {
  // Words that cycle after "for" in the menu bar and the scrolling strip
  words: ['businesses','makers','programs','nonprofits','local shops','innovators','entrepreneurs'],
  // Prices used by the "What would mine cost?" estimator
  prices: { starter: 350, professional: 500, premium: 700, booking: 1000, monthly: 10 },
  // Form: paste a Formspree endpoint (https://formspree.io/f/xxxx) to receive messages.
  // Leave empty and the form shows a "not connected yet" note instead.
  formEndpoint: ''
};
/* ============================================================ */

(function(){
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $=function(s,r){return (r||document).querySelector(s)}, $$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
  var clamp=function(v,a,b){return Math.max(a,Math.min(b,v))};
  var lerp=function(a,b,t){return a+(b-a)*t};
  var eOut=function(t){return 1-Math.pow(1-t,3)};
  var eIO=function(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2};
  var eBounce=function(t){var n=7.5625,d=2.75;if(t<1/d)return n*t*t;if(t<2/d)return n*(t-=1.5/d)*t+.75;if(t<2.5/d)return n*(t-=2.25/d)*t+.9375;return n*(t-=2.625/d)*t+.984375};
  var seg=function(p,a,b){return clamp((p-a)/(b-a),0,1)};

  /* grain */
  try{var c=document.createElement('canvas');c.width=c.height=180;var x=c.getContext('2d'),im=x.createImageData(180,180);for(var i=0;i<im.data.length;i+=4){var v=Math.random()*255|0;im.data[i]=im.data[i+1]=im.data[i+2]=v;im.data[i+3]=255}x.putImageData(im,0,0);document.body.style.setProperty('--grain','url('+c.toDataURL()+')')}catch(e){}

  /* smooth scroll */
  var lenis=null;
  if(!reduce&&window.Lenis){try{lenis=new Lenis({lerp:.1,smoothWheel:true});(function raf(t){lenis.raf(t);requestAnimationFrame(raf)})(performance.now())}catch(e){lenis=null}}
  function toTop(){if(lenis)lenis.scrollTo(0,{immediate:true});else window.scrollTo(0,0)}

  /* ---------- routing with wipe ---------- */
  var views={};$$('.view').forEach(function(v){views[v.dataset.view]=v});
  var current=null,wipe=$('#wipe'),first=true;
  var TITLES={home:'Waymont Solutions',philosophy:'Philosophy | Waymont Solutions',team:'Meet us | Waymont Solutions',work:'Our Portfolio | Waymont Solutions',prices:'Prices | Waymont Solutions',contact:'Get a free price | Waymont Solutions'};
  function show(target,anchor){
    Object.keys(views).forEach(function(k){views[k].classList.toggle('on',k===target)});
    current=target;document.title=TITLES[target];
    if(!anchor)toTop();
    $$('.links a.l').forEach(function(a){var on=a.getAttribute('href')==='#'+(location.hash.slice(1)||'home');if(on)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
    measure();revealScan();
    if(target!=='home')drawRidge(views[target]);
    if(anchor){var el=document.getElementById(anchor);setTimeout(function(){var y=el.getBoundingClientRect().top+scrollY;if(lenis)lenis.scrollTo(y,{duration:1.4});else scrollTo({top:y,behavior:reduce?'auto':'smooth'})},first?60:40)}
    tick(true);
  }
  function route(){
    var h=(location.hash||'').slice(1)||'home',target=h,anchor=null;
    if(!views[target])target='home';
    closeMenu();
    if(first||reduce||target===current){show(target,anchor);first=false;return}
    wipe.classList.remove('leave');wipe.classList.add('cover');
    setTimeout(function(){show(target,anchor);wipe.classList.remove('cover');wipe.classList.add('leave');setTimeout(function(){wipe.classList.remove('leave')},650)},560);
  }
  addEventListener('hashchange',route);

  /* ---------- menu ---------- */
  var drawer=$('#drawer'),menuBtn=$('#menuBtn');
  menuBtn.addEventListener('click',function(){drawer.classList.add('open');menuBtn.setAttribute('aria-expanded','true');if(lenis)lenis.stop();$('#menuClose').focus()});
  function closeMenu(){if(!drawer.classList.contains('open'))return;drawer.classList.remove('open');menuBtn.setAttribute('aria-expanded','false');if(lenis)lenis.start()}
  $('#menuClose').addEventListener('click',function(){closeMenu();menuBtn.focus()});
  addEventListener('keydown',function(e){if(e.key==='Escape')closeMenu()});

  /* ---------- hero title: per-letter layouts ---------- */
  var WORDS=SITE.words;
  var title=$('#title'),mA=$('#mA'),mB=$('#mB'),chars=$('#chars');
  var L1='Waymont',L2='Solutions';
  function spans(str,cls){return str.split('').map(function(ch){return '<span class="'+cls+'">'+ch+'</span>'}).join('')}
  mA.innerHTML='<span class="row">'+spans(L1,'a')+'<span> </span>'+spans(L2,'a')+'</span>';
  mB.innerHTML='<span class="row">'+spans(L1,'b')+'</span><span class="row">'+spans(L2,'b')+'</span>';
  var all=(L1+L2).split(''),idx=0;
  chars.innerHTML=all.map(function(ch,i){return '<span class="ch" data-k="'+(i<L1.length?'w':'s')+'"><i style="--i:'+i+'">'+ch+'</i></span>'}).join('');
  var CH=$$('.ch',chars);
  var nw=$('#nw'),NW=WORDS.map(function(w){var e=document.createElement('span');e.textContent=w;nw.appendChild(e);return e}),ni=-1;
  function nextWord(){var prev=ni;ni=(ni+1)%NW.length;NW.forEach(function(e,k){e.classList.remove('cur','gone');if(k===ni)e.classList.add('cur');else if(k===prev)e.classList.add('gone')})}
  nextWord();if(!reduce)setInterval(function(){if(document.body.classList.contains('past'))nextWord()},2200);
  var POS=[],SCALE_A=.6,fsB=0,rowH=0,drumTop=0;
  function measure(){
    if(current!=='home')return;
    var vw=innerWidth,vh=innerHeight,narrow=vw<860;
    // target (B) size: two stacked lines, as big as fits; A: one line
    fsB=narrow?Math.min(vw*.18,96):Math.min(vw*.118,vh*.2,178);
    title.style.setProperty('--fsB',fsB+'px');
    mA.style.fontSize=fsB+'px';mB.style.fontSize=fsB+'px';
    var gx=parseFloat(getComputedStyle(title).left),maxW=narrow?vw-2*gx:Math.min(vw*.6,vw-2*gx),bw=mB.getBoundingClientRect().width;
    if(bw>maxW){fsB*=maxW/bw;title.style.setProperty('--fsB',fsB+'px');mA.style.fontSize=fsB+'px';mB.style.fontSize=fsB+'px'}
    var aw=mA.getBoundingClientRect().width,avail=vw-2*parseFloat(getComputedStyle(title).left);
    SCALE_A=Math.min(1,(avail)/aw)*(narrow?.98:.86);
    var tr=title.getBoundingClientRect();
    var a=$$('.a',mA),b=$$('.b',mB);
    POS=a.map(function(n,i){var ra=n.getBoundingClientRect(),rb=b[i].getBoundingClientRect();return {ax:(ra.left-tr.left)*SCALE_A,ay:(ra.top-tr.top)*SCALE_A,bx:rb.left-tr.left,by:rb.top-tr.top}});
    rowH=fsB*1.12;
    var lede=$('#lede');
    lede.style.setProperty('--ledeTop',(tr.top+rowH*2+fsB*.2+(narrow?24:36))+'px');
    fitScene();
  }

  /* ---------- mountain scene ---------- */
  var svg=$('#mtn'),cam=$('#cam'),asc=$('#asc'),arrow=$('#arrow'),snowRect=$('#snowRect');
  var draws=$$('.draw[data-s]',svg).map(function(p){return {el:p,s:+p.dataset.s,e:+p.dataset.e}});
  var LA=asc.getTotalLength();
  var CX=1080,CY=860,S0=2.6,SW=6,BASE=1;
  var LMAIN=$$('.ln.main',svg),LSUB=[],LSNL=$$('.ln.snl',svg);
  function fitScene(){
    var narrow=innerWidth<860;
    var W=innerWidth,H=innerHeight;
    if(narrow){var lb=$('#lede').getBoundingClientRect().bottom,Ys=Math.min(lb+90,H*.72),Yb=H-70;var sc=Math.min(W/560,(Yb-Ys)/588);var vw=W/sc,vh=H/sc,y0=282-Ys/sc;svg.setAttribute('viewBox',(1230-vw*.5).toFixed(0)+' '+y0.toFixed(0)+' '+vw.toFixed(0)+' '+vh.toFixed(0));CX=1180;CY=y0+(H-110)/sc;S0=2.1;SW=4.5}
    else{svg.setAttribute('viewBox','0 0 1600 900');CX=1080;CY=820;S0=2.1;SW=6}
    var vb=svg.viewBox.baseVal;BASE=Math.max(W/vb.width,H/vb.height);
  }
  var introT0=null,intro=0;

  /* ---------- topographic contours: slow, liquid, fade out on scroll ---------- */
  var topo=$('#topo'),tctx=topo.getContext('2d'),tAlpha=1,tLast=0;
  var PERM=new Uint8Array(512);(function(){var a=[];for(var i=0;i<256;i++)a[i]=i;for(i=255;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t}for(i=0;i<512;i++)PERM[i]=a[i&255]})();
  function fade(t){return t*t*(3-2*t)}
  function hash(x,y,z){return PERM[(PERM[(PERM[x&255]+y)&255]+z)&255]/255}
  function vnoise(x,y,z){var xi=Math.floor(x),yi=Math.floor(y),zi=Math.floor(z),xf=fade(x-xi),yf=fade(y-yi),zf=fade(z-zi);
    function L(a,b,t){return a+(b-a)*t}
    return L(L(L(hash(xi,yi,zi),hash(xi+1,yi,zi),xf),L(hash(xi,yi+1,zi),hash(xi+1,yi+1,zi),xf),yf),L(L(hash(xi,yi,zi+1),hash(xi+1,yi,zi+1),xf),L(hash(xi,yi+1,zi+1),hash(xi+1,yi+1,zi+1),xf),yf),zf)}
  function field(x,y,z){return vnoise(x,y,z)*.62+vnoise(x*2.1+5,y*2.1+3,z*1.3)*.28+vnoise(x*4.3,y*4.3,z*1.7)*.1}
  var TW=0,TH=0,CELL=16,GW=0,GH=0,G=null;
  function sizeTopo(){var dpr=Math.min(2,devicePixelRatio||1),r=topo.getBoundingClientRect();TW=r.width;TH=r.height;topo.width=TW*dpr;topo.height=TH*dpr;tctx.setTransform(dpr,0,0,dpr,0,0);CELL=TW<860?13:16;GW=Math.ceil(TW/CELL)+1;GH=Math.ceil(TH/CELL)+1;G=new Float32Array(GW*GH)}
  function drawTopo(now){
    requestAnimationFrame(drawTopo);
    if(current!=='home'||tAlpha<=0.01||now-tLast<33)return;tLast=now;
    if(!G||topo.getBoundingClientRect().width!==TW)sizeTopo();
    var z=reduce?0:now/9000,sc=TW<860?0.0055:0.0034;
    for(var j=0;j<GH;j++)for(var i=0;i<GW;i++){var x=i*CELL,y=j*CELL;var wx=x*sc+Math.sin(y*sc*1.3+z*2)*.35,wy=y*sc+Math.cos(x*sc*1.1-z*1.6)*.35;G[j*GW+i]=field(wx,wy,z)}
    tctx.clearRect(0,0,TW,TH);
    var LV=11;
    for(var l=1;l<LV;l++){
      var th=0.18+l*0.06;tctx.beginPath();
      for(j=0;j<GH-1;j++)for(i=0;i<GW-1;i++){
        var a=G[j*GW+i],b=G[j*GW+i+1],c=G[(j+1)*GW+i+1],d=G[(j+1)*GW+i];
        var k=(a>th?8:0)|(b>th?4:0)|(c>th?2:0)|(d>th?1:0);if(k===0||k===15)continue;
        var x0=i*CELL,y0=j*CELL,C=CELL;
        var T=[x0+C*(th-a)/(b-a),y0],R=[x0+C,y0+C*(th-b)/(c-b)],B=[x0+C*(th-d)/(c-d),y0+C],Lf=[x0,y0+C*(th-a)/(d-a)];
        var segs={1:[Lf,B],2:[B,R],3:[Lf,R],4:[T,R],5:[Lf,T,B,R],6:[T,B],7:[Lf,T],8:[Lf,T],9:[T,B],10:[T,R,Lf,B],11:[T,R],12:[Lf,R],13:[B,R],14:[Lf,B]}[k];
        for(var q=0;q<segs.length;q+=2){tctx.moveTo(segs[q][0],segs[q][1]);tctx.lineTo(segs[q+1][0],segs[q+1][1])}
      }
      tctx.lineWidth=l%4===0?1.8:1.1;tctx.strokeStyle='rgba(30,27,22,'+(l%4===0?.26:.15)+')';tctx.stroke();
    }
  }
  addEventListener('resize',function(){G=null});
  requestAnimationFrame(drawTopo);
  /* idle: a mountain-shaped lift sweeps across the letters every few seconds */
  var idleT0=null,lastMove=0,idleOn=false;
  addEventListener('scroll',function(){lastMove=performance.now()},{passive:true});
  function idle(now){
    requestAnimationFrame(idle);
    if(reduce||current!=='home'||sp>.02||!CH.length){if(idleOn){idleOn=false;idleT0=null;CH.forEach(function(c){var e=c.firstElementChild;e.style.translate='';e.classList.remove('pk')})}return}
    idleOn=true;
    if(idleT0===null)idleT0=now;
    var period=5200,t=((now-idleT0)%period)/period,N=CH.length;
    var active=t<.42,c=-2.5+(t/.42)*14;
    for(var i=0;i<N;i++){
      var e=CH[i].firstElementChild,lift=0;
      var k=i<L1.length?i:i-L1.length;if(active){var dd=Math.abs(k-c);lift=Math.max(0,1-dd/3)}
      e.style.translate='0 '+(-lift*.2).toFixed(3)+'em';
      e.classList.toggle('pk',active&&Math.abs(k-c)<.5);
    }
  }
  requestAnimationFrame(idle);
  function introLoop(now){if(introT0===null)introT0=now;intro=reduce?1:eOut(clamp((now-introT0-500)/1400,0,1));renderHero(sp);if(intro<1)requestAnimationFrame(introLoop)}
  var mx=0,my=0;addEventListener('mousemove',function(e){mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5;if(current==='home'&&!running&&!reduce)renderHero(sp)},{passive:true});
  function renderHero(p){
    // ascent
    var pa=seg(p,.02,.7);arrow.style.opacity=p>.004?1:0;tAlpha=1-eOut(seg(p,0,.16));topo.style.setProperty('--topo',tAlpha.toFixed(3));
    var k=eIO(seg(p,.06,.72));
    var s=lerp(S0,1,k);
    var pt=asc.getPointAtLength(pa*LA),pb=asc.getPointAtLength(Math.max(0,pa*LA-3));
    var ang=Math.atan2(pt.y-pb.y,pt.x-pb.x)*180/Math.PI;
    var plant=eOut(seg(p,.7,.78));
    ang=lerp(ang,-90,plant);
    var fx=lerp(pt.x,CX,k),fy=lerp(pt.y,CY,k);
    cam.setAttribute('transform','translate('+CX+' '+CY+') scale('+s.toFixed(4)+') translate('+(-fx).toFixed(2)+' '+(-fy).toFixed(2)+')');
    var u=SW/(s*BASE);LMAIN.forEach(function(e){e.style.strokeWidth=u.toFixed(3)+'px'});LSUB.forEach(function(e){e.style.strokeWidth=(u*.55).toFixed(3)+'px'});LSNL.forEach(function(e){e.style.strokeWidth=(u*.75).toFixed(3)+'px'});
    asc.style.strokeDashoffset=(1-pa).toFixed(4);
    arrow.setAttribute('transform','translate('+pt.x.toFixed(2)+' '+(pt.y-plant*10).toFixed(2)+') rotate('+ang.toFixed(2)+') scale('+(1/(s*BASE)*(innerWidth<860?.95:1.05)).toFixed(4)+')');
    draws.forEach(function(o){o.el.style.strokeDashoffset=(1-eOut(seg(p,o.s,o.e))).toFixed(4)});
    var sn=eOut(seg(p,.8,.95));snowRect.setAttribute('height',(sn*230).toFixed(1));
    var r=eOut(seg(p,.45,.85));
    $('#b1').setAttribute('transform','translate('+(mx*-18).toFixed(1)+' '+((1-r)*150+my*-8).toFixed(1)+')');$('#b1').style.opacity=r;
    $('#b2').setAttribute('transform','translate('+(mx*-34).toFixed(1)+' '+((1-r)*240+my*-14).toFixed(1)+')');$('#b2').style.opacity=r;
    $('#bodyFill').style.opacity=clamp(pa*4,0,1);
    var g=$('#ghost');g.style.strokeWidth=(u*.28).toFixed(3)+'px';g.style.strokeDasharray=(u*1.2).toFixed(2)+' '+(u*2.4).toFixed(2);g.style.opacity=(Math.max(intro*.55,seg(p,0,.08)*.55)*(1-seg(p,.7,.85))).toFixed(3);
    // title letters
    var tw=eIO(seg(p,.02,.2));
    for(var i=0;i<CH.length;i++){
      var P=POS[i];if(!P)continue;var isW=i<L1.length,t,x,y,sc,rot=0;
      if(isW){t=tw;x=lerp(P.ax,P.bx,t);y=lerp(P.ay,P.by,t);sc=lerp(SCALE_A,1,t)}
      else{var j=i-L1.length,st=.02+j*.016;t=seg(p,st,st+.13);
        x=lerp(P.ax,P.bx,eIO(t));y=lerp(P.ay,P.by,eBounce(t));sc=lerp(SCALE_A,1,eIO(t));
        rot=Math.sin(t*Math.PI)*(j%2?-16:12)*(1-t*.6);}
      CH[i].style.transform='translate3d('+x.toFixed(1)+'px,'+y.toFixed(1)+'px,0) rotate('+rot.toFixed(2)+'deg) scale('+sc.toFixed(4)+')';
    }
    document.documentElement.style.setProperty('--mp',p.toFixed(3));
  }

  /* ---------- marquee ---------- */
  (function(){var m=$('#marq'),h='',n=0;for(var r=0;r<2;r++)WORDS.forEach(function(w,i){h+='<span'+(i%2?' class="alt"':'')+'>solutions for '+w+'</span>';n++;if(n%3===0)h+='<span class="you">websites for you</span>'});m.innerHTML=h})();

  /* ---------- stacking chapters: scale the one underneath ---------- */
  var CHAPS=$$('.story .chap');
  function stackFx(){
    if(innerWidth<860){CHAPS.forEach(function(c){c.style.transform=''});return}
    for(var i=0;i<CHAPS.length-1;i++){
      var r=CHAPS[i].getBoundingClientRect(),n=CHAPS[i+1].getBoundingClientRect();
      var cov=clamp(1-n.top/innerHeight,0,1);
      CHAPS[i].style.transform='scale('+(1-cov*.06).toFixed(4)+') translateY('+(cov*-24).toFixed(1)+'px)';
      CHAPS[i].style.filter='brightness('+(1-cov*.12).toFixed(3)+')';
    }
  }

  /* ---------- estimator ---------- */
  var OPT={},qv=$('#qv'),qn=$('#qn'),qm=$('#qm'),shown=350;
  $$('#opts .opt').forEach(function(b){b.addEventListener('click',function(){var on=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',on);OPT[b.dataset.k]=on;estimate()})});
  function estimate(){
    var P=SITE.prices,price=P.starter,name='Starter';
    if(OPT.words||OPT.motion){price=P.professional;name='Professional'}
    if(OPT.pages||OPT.shop){price=P.premium;name='Premium'}
    if(OPT.book){price=P.booking;name='Site with bookings or sign-in'}
    qn.textContent=name;qm.textContent=OPT.help?'Plus $'+P.monthly+' a month for up to 5 changes a week.':'';
    var from=shown,to=price,t0=null;
    if(reduce){qv.textContent='$'+to;shown=to;return}
    (function f(now){if(t0===null)t0=now;var k=eOut(clamp((now-t0)/650,0,1));var v=Math.round(from+(to-from)*k);qv.textContent='$'+v.toLocaleString();if(k<1)requestAnimationFrame(f);else shown=to})(performance.now());
  }

  /* ---------- see your name ---------- */
  var DEF={bakery:'Mill Street Bakery',detail:'Ridge Auto Detail',club:'Albany Puzzle Club',idea:'Your idea'};
  var phone=$('#phone'),bizIn=$('#bizName'),curKind='bakery',SCR=$$('.scr',phone);
  function fitScroll(sc){var sl=$('.scroll',sc),d=Math.min(0,sc.clientHeight-sl.scrollHeight);sl.style.setProperty('--dist',d+'px')}
  function showKind(){SCR.forEach(function(sc){var on=sc.dataset.kind===curKind;sc.classList.toggle('on',on);if(on){var sl=$('.scroll',sc);sl.style.animation='none';void sl.offsetWidth;sl.style.animation='';fitScroll(sc)}});phone.dataset.kind=curKind;setNames(true)}
  function setNames(pop){SCR.forEach(function(sc){var n=$('.pn',sc),v=bizIn.value.trim()||DEF[sc.dataset.kind];n.textContent=v;if(pop&&sc.dataset.kind===curKind){n.classList.remove('pop');void n.offsetWidth;n.classList.add('pop')}});var on=$('.scr.on',phone);if(on)fitScroll(on)}
  bizIn.addEventListener('input',function(){setNames(false)});
  $$('#kinds .kbtn').forEach(function(b){b.addEventListener('click',function(){$$('#kinds .kbtn').forEach(function(x){x.classList.remove('on')});b.classList.add('on');curKind=b.dataset.kind;bizIn.placeholder=DEF[curKind];showKind()})});
  showKind();
  addEventListener('resize',function(){var on=$('.scr.on',phone);if(on)fitScroll(on)});

  /* ---------- belief words light up ---------- */
  var bigq=$('#bigq');bigq.innerHTML=bigq.textContent.split(/(\s+)/).map(function(w){return /\S/.test(w)?'<span class="w">'+w+'</span>':w}).join('');
  $$('.w',bigq).forEach(function(w){if(/^love/i.test(w.textContent)){w.classList.add('hlw');w.innerHTML='<mark class="hl">love</mark>'}});
  var BW=$$('.w',bigq),bchap=$('#belief-chap');
  $$('mark.hl',bchap).forEach(function(m,i){m.style.setProperty('--hd',(.25+i*.28)+'s')});
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add(e.target.tagName==='MARK'?'on':'grown');io.unobserve(e.target)}})},{threshold:.35});
    $$('mark.hl, .pillar').forEach(function(el){if(reduce){el.classList.add(el.tagName==='MARK'?'on':'grown')}else io.observe(el)});
  }else $$('mark.hl, .pillar').forEach(function(el){el.classList.add(el.tagName==='MARK'?'on':'grown')});
  $$('.dot').forEach(function(d){d.style.setProperty('--pd',(Math.random()*4).toFixed(2)+'s')});
  if(!reduce&&matchMedia('(hover:hover) and (pointer:fine)').matches){
    var DOTS=$$('.dot');
    addEventListener('mousemove',function(e){DOTS.forEach(function(d){if(!d.offsetParent)return;var r=d.getBoundingClientRect(),cx2=r.left+r.width/2-(+d.dataset.tx||0),cy2=r.top+r.height/2-(+d.dataset.ty||0),dx=e.clientX-cx2,dy=e.clientY-cy2,dist=Math.hypot(dx,dy),R=d.classList.contains('go')?220:120;
      if(dist<R){var k=(1-dist/R)*.5,tx=Math.max(-18,Math.min(18,dx*k)),ty=Math.max(-18,Math.min(18,dy*k));if(d.classList.contains('go')){tx*=1.8;ty*=1.8}d.dataset.tx=tx;d.dataset.ty=ty;d.style.transform='translate('+tx.toFixed(1)+'px,'+ty.toFixed(1)+'px) scale('+(1+(1-dist/R)*.18).toFixed(3)+')';d.classList.add('near')}
      else if(d.classList.contains('near')){d.dataset.tx=0;d.dataset.ty=0;d.style.transform='';d.classList.remove('near')}})},{passive:true});
  }
  function renderBelief(){var r=bchap.getBoundingClientRect(),q=clamp((innerHeight*.7-r.top)/(innerHeight*.5),0,1);var n=Math.floor(q*BW.length*1.05);BW.forEach(function(w,i){w.classList.toggle('lit',i<n)})}

  /* ---------- cursor + magnetic + tilt ---------- */
  var cur=$('#cur'),cx=0,cy=0,px=0,py=0,cang=0,fine=matchMedia('(hover:hover) and (pointer:fine)').matches&&!reduce;
  if(fine){
    document.documentElement.classList.add('has-cur');
    addEventListener('mousemove',function(e){cx=e.clientX;cy=e.clientY;var el=document.elementFromPoint(cx,cy);var dark=el&&el.closest('.ink,.pine,.cta,.bar.dark,.drawer,.head.dark,.head.pine,.tile.ink,.tile.pine,.plan.feat,.plan.pro,.wipc.next,.contact .aside,.fbox');cur.classList.toggle('dark',!!dark);cur.classList.toggle('big',!!(el&&el.closest('a,button,label,.opt,.kbtn,.ch')))},{passive:true});
    (function cl(){var dx=cx-px,dy=cy-py;px+=dx*.22;py+=dy*.22;if(Math.hypot(dx,dy)>.5)cang+=((Math.atan2(dy,dx)*180/Math.PI)-cang)*.2;cur.style.transform='translate3d('+px.toFixed(1)+'px,'+py.toFixed(1)+'px,0)';cur.firstElementChild.style.transform='rotate('+cang.toFixed(1)+'deg)';requestAnimationFrame(cl)})();
    $$('.btn').forEach(function(b){b.addEventListener('mousemove',function(e){var r=b.getBoundingClientRect();b.style.transform='translate('+((e.clientX-r.left-r.width/2)*.18).toFixed(1)+'px,'+((e.clientY-r.top-r.height/2)*.3).toFixed(1)+'px)'});b.addEventListener('mouseleave',function(){b.style.transform=''})});
    $$('.tilt').forEach(function(t){t.addEventListener('mousemove',function(e){var r=t.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;t.style.transform='perspective(900px) rotateX('+(-y*8).toFixed(2)+'deg) rotateY('+(x*10).toFixed(2)+'deg)'});t.addEventListener('mouseleave',function(){t.style.transform=''})});
  }

  /* ---------- how-it-works trail ---------- */
  var how=$('#how'),tpath=$('#tpath'),tarrow=$('#tarrow'),LT=tpath.getTotalLength(),ST=$$('#steps li',how);
  var hq=0,hTarget=0,hRun=false;
  function renderHow(d){
    tpath.style.strokeDashoffset=(1-d).toFixed(4);
    var svgEl=tpath.ownerSVGElement,bb=svgEl.getBoundingClientRect(),vb=svgEl.viewBox.baseVal,sx=bb.width/vb.width,sy=bb.height/vb.height;
    ST.forEach(function(s){s.classList.toggle('on',d>=+s.dataset.at-.02)});
    if(!bb.width||!bb.height)return;
    var pt=tpath.getPointAtLength(Math.max(.5,d*LT)),pb=tpath.getPointAtLength(Math.max(0,d*LT-3));
    var ang=Math.atan2((pt.y-pb.y)*sy,(pt.x-pb.x)*sx)*180/Math.PI;
    tarrow.setAttribute('transform','translate('+pt.x.toFixed(1)+' '+pt.y.toFixed(1)+') scale('+(1/sx).toFixed(4)+' '+(1/sy).toFixed(4)+') rotate('+ang.toFixed(1)+')');
    ST.forEach(function(s){s.classList.toggle('on',d>=+s.dataset.at-.02)});
  }
  function howLoop(){hq+=(hTarget-hq)*.08;if(Math.abs(hTarget-hq)<.001)hq=hTarget;renderHow(hq);if(hq!==hTarget)requestAnimationFrame(howLoop);else hRun=false}
  function updateHow(){
    var r=how.getBoundingClientRect();
    hTarget=reduce||innerWidth<860?1:clamp((innerHeight*.85-r.top)/(innerHeight*.55),0,1);
    if(!hRun){hRun=true;requestAnimationFrame(howLoop)}
  }

  /* ---------- page ridges: arrow climbs to the peak, then the far side draws ---------- */
  function drawRidge(view){
    var rg=$('.ridge',view);if(!rg)return;var up=$('.up',rg),dn=$('.dn',rg),ar=$('.arrow',rg),L=up.getTotalLength(),t0=null;rg.classList.remove('go');
    dn.style.strokeDashoffset=1;up.style.strokeDashoffset=1;
    function f(now){
      if(t0===null)t0=now;var el=now-t0;
      var b=rg.getBoundingClientRect(),vb=rg.viewBox.baseVal,sx=b.width/vb.width,sy=b.height/vb.height;
      var t=reduce?1:eIO(clamp((el-300)/1500,0,1)),t2=reduce?1:eOut(clamp((el-1700)/900,0,1));
      up.style.strokeDashoffset=1-t;dn.style.strokeDashoffset=1-t2;
      var pt=up.getPointAtLength(Math.max(.5,t*L)),pb=up.getPointAtLength(Math.max(0,t*L-3));
      var ang=Math.atan2((pt.y-pb.y)*sy,(pt.x-pb.x)*sx)*180/Math.PI,pl=eOut(clamp((el-1700)/500,0,1));ang=lerp(ang,-90,pl);
      ar.setAttribute('transform','translate('+pt.x+' '+(pt.y-pl*16/sy)+') scale('+(1/sx).toFixed(4)+' '+(1/sy).toFixed(4)+') rotate('+ang+')');
      if(el<2700&&!reduce)requestAnimationFrame(f);else rg.classList.add('go');
    }
    requestAnimationFrame(f);
  }

  /* ---------- reveals ---------- */
  function revealScan(){$$('.view.on .rv:not(.in-view)').forEach(function(el){var r=el.getBoundingClientRect();if(r.top<innerHeight*.92)el.classList.add('in-view')})}

  /* ---------- loop ---------- */
  var bar=$('#bar'),phonebar=$('#phonebar'),hero=$('#hero');
  var sp=0,target=0,last=0,running=false;
  function heroProgress(){var r=hero.getBoundingClientRect(),span=r.height-innerHeight;return span>0?clamp(-r.top/span,0,1):1}
  function tick(force){
    revealScan();
    if(current==='home'){
      target=reduce?1:heroProgress();
      updateHow();stackFx();renderBelief();
      var hb=hero.getBoundingClientRect().bottom;bar.classList.toggle('solid',hb<innerHeight*.98&&scrollY>40);document.body.classList.toggle('past',hb<innerHeight*.98);
    }else{
      bar.classList.toggle('solid',scrollY>40);document.body.classList.add('past');
    }
    phonebar.classList.toggle('show',current!=='contact'&&(current!=='home'||scrollY>innerHeight*.6));
    if(force)sp=target;
    if(!running){running=true;requestAnimationFrame(loop)}
  }
  function loop(now){
    var dt=Math.min(.05,(now-(last||now))/1000);last=now;
    sp+=(target-sp)*(1-Math.exp(-dt*10));
    if(Math.abs(target-sp)<.0004)sp=target;
    if(current==='home')renderHero(sp);
    if(sp!==target)requestAnimationFrame(loop);else{running=false;last=0}
  }
  addEventListener('scroll',function(){tick(false)},{passive:true});
  addEventListener('resize',function(){measure();tick(true)});
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){measure();tick(true)});

  /* ---------- form ---------- */
  var form=$('#form'),done=$('#done');
  function check(id,ok){var f=$('#f-'+id),i=$('.in',f);f.classList.toggle('bad',!ok);i.setAttribute('aria-invalid',ok?'false':'true');if(!ok)i.setAttribute('aria-describedby','e-'+id);else i.removeAttribute('aria-describedby');return ok}
  function validate(){var ev=$('#email').value.trim(),ee=$('#e-email');ee.textContent=ev?ee.dataset.bad:ee.dataset.empty;return [check('name',$('#name').value.trim().length>0),check('email',/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(ev)),check('msg',$('#msg').value.trim().length>=10)]}
  ['name','email','msg'].forEach(function(id){$('#'+id).addEventListener('input',function(){if($('#f-'+id).classList.contains('bad'))validate()})});
  form.addEventListener('submit',function(e){
    e.preventDefault();var r=validate(),ids=['name','email','msg'],firstBad=r.indexOf(false),nBad=r.filter(function(x){return !x}).length;
    $('#errSum').textContent=nBad?('Fix '+(nBad===1?'the field':'the '+nBad+' fields')+' marked in red, then send again.'):'';
    if(firstBad>-1){$('#'+ids[firstBad]).focus();return}
    var btn=$('#send');btn.disabled=true;$('#sendLabel').textContent='Sending';
    function finish(sent){$('#doneH').textContent='Thanks, '+$('#name').value.trim().split(' ')[0]+'.';$('#doneNote').hidden=sent;form.style.display='none';done.classList.add('show');var h=$('h2',done);h.setAttribute('tabindex','-1');h.focus();btn.disabled=false;$('#sendLabel').textContent='Send message'}
    if(!SITE.formEndpoint){setTimeout(function(){finish(false)},650);return}
    fetch(SITE.formEndpoint,{method:'POST',headers:{'Accept':'application/json'},body:new FormData(form)}).then(function(r){
      if(r.ok)finish(true);else throw 0;
    }).catch(function(){btn.disabled=false;$('#sendLabel').textContent='Send message';$('#errSum').textContent='That didn\'t send. Check your connection and try again, or email us directly.'});
  });
  $('#again').addEventListener('click',function(){form.reset();form.style.display='';done.classList.remove('show');$('#name').focus()});

  route();
  requestAnimationFrame(introLoop);
})();
