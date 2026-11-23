(function(){
"use strict";
var doc=document,root=doc.documentElement;
root.classList.add("js");
var reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function $(s,c){return (c||doc).querySelector(s)}
function $$(s,c){return Array.prototype.slice.call((c||doc).querySelectorAll(s))}
function norm(t){return String(t).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"")}

/* barra de progreso y nav */
var prog=$("#prog"),nav=$(".nav"),tick=false;
function onScroll(){
  if(tick)return;tick=true;
  requestAnimationFrame(function(){
    var h=root.scrollHeight-root.clientHeight;
    prog.style.transform="scaleX("+(h>0?Math.min(1,window.scrollY/h):0)+")";
    nav.classList.toggle("on",window.scrollY>8);
    tick=false;
  });
}
window.addEventListener("scroll",onScroll,{passive:true});onScroll();

/* menú móvil */
var burger=$(".burger"),links=$(".links");
function setMenu(o){links.classList.toggle("open",o);burger.setAttribute("aria-expanded",o?"true":"false");burger.setAttribute("aria-label",o?"Cerrar el menú":"Abrir el menú")}
burger.addEventListener("click",function(){setMenu(!links.classList.contains("open"))});
links.addEventListener("click",function(e){if(e.target.closest("a"))setMenu(false)});
doc.addEventListener("keydown",function(e){if(e.key==="Escape"&&links.classList.contains("open")){setMenu(false);burger.focus()}});

/* revelado al hacer scroll */
var rv=$$(".rv");
if("IntersectionObserver" in window&&!reduce){
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}})},{rootMargin:"0px 0px -8% 0px",threshold:.08});
  rv.forEach(function(el){io.observe(el)});
}else rv.forEach(function(el){el.classList.add("in")});

/* contadores */
function countUp(el){
  var to=parseInt(el.getAttribute("data-count"),10);if(isNaN(to))return;
  if(reduce){el.textContent=to;return}
  var t0=null,dur=1100;
  function f(t){if(!t0)t0=t;var p=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-p,4);el.textContent=Math.round(to*e);if(p<1)requestAnimationFrame(f)}
  requestAnimationFrame(f);
}
var cn=$$("[data-count]");
if("IntersectionObserver" in window){
  var io2=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){countUp(e.target);io2.unobserve(e.target)}})},{threshold:.6});
  cn.forEach(function(el){io2.observe(el)});
}else cn.forEach(countUp);

/* cuenta atrás */
var START=new Date("2026-12-10T09:00:00+01:00"),END=new Date("2026-12-11T11:00:00+01:00");
var cd=$("#countdown");
function pad(n){return n<10?"0"+n:""+n}
function updCD(){
  if(!cd)return;
  var now=new Date(),txt;
  if(now<START){
    var s=Math.floor((START-now)/1000),d=Math.floor(s/86400),h=Math.floor(s%86400/3600),m=Math.floor(s%3600/60);
    txt=d>0?"Faltan "+d+(d===1?" día":" días")+" y "+h+" h para abrir la votación":"Faltan "+h+" h "+pad(m)+" min para abrir la votación";
  }else if(now<=END){
    var r=Math.floor((END-now)/1000),hh=Math.floor(r/3600),mm=Math.floor(r%3600/60);
    txt="Votación abierta: cierra en "+hh+" h "+pad(mm)+" min";
  }else txt="La votación ha terminado";
  cd.textContent=txt;
}
updCD();setInterval(updCD,30000);

/* recordatorio .ics */
var ics=$("#ics");
if(ics)ics.addEventListener("click",function(){
  var l=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Claustro URJC//ES","BEGIN:VEVENT","UID:claustro-urjc-2026@local","DTSTAMP:20261118T120000Z","DTSTART:20261210T080000Z","DTEND:20261211T100000Z","SUMMARY:Votación al Claustro URJC (App URJC)","DESCRIPTION:Votación en línea desde el 10 de diciembre a las 09:00 hasta el 11 de diciembre a las 11:00 (hora peninsular).","BEGIN:VALARM","TRIGGER:-PT30M","ACTION:DISPLAY","DESCRIPTION:Se abre la votación al Claustro","END:VALARM","END:VEVENT","END:VCALENDAR"];
  var b=new Blob([l.join("\r\n")],{type:"text/calendar"}),a=doc.createElement("a");
  a.href=URL.createObjectURL(b);a.download="votacion-claustro-urjc.ics";doc.body.appendChild(a);a.click();a.remove();
  setTimeout(function(){URL.revokeObjectURL(a.href)},2000);toast("Recordatorio descargado");
});

/* toast */
var tt=$("#toast"),tmr;
function toast(m){tt.querySelector("span").textContent=m;tt.classList.add("show");clearTimeout(tmr);tmr=setTimeout(function(){tt.classList.remove("show")},2400)}

/* tarjetas desplegables */
function setCard(c,open){
  c.classList.toggle("open",open);
  var b=$(".card-h",c);b.setAttribute("aria-expanded",open?"true":"false");
}
doc.addEventListener("click",function(e){
  var h=e.target.closest(".card-h");
  if(h){var c=h.parentNode;setCard(c,!c.classList.contains("open"));return}
  var x=e.target.closest("[data-expand]");
  if(x){
    var g=$("#"+x.getAttribute("data-expand")),cs=$$(".card",g),all=cs.every(function(c){return c.classList.contains("open")});
    cs.forEach(function(c){setCard(c,!all)});
    x.querySelector("span").textContent=all?x.getAttribute("data-t-open"):x.getAttribute("data-t-close");
  }
});

/* control segmentado con indicador */
function seg(el,onSel){
  var tabs=$$("[role=tab]",el),ind=$(".ind",el);
  function place(t){
    if(!ind)return;
    ind.style.width=t.offsetWidth+"px";ind.style.transform="translateX("+t.offsetLeft+"px)";
  }
  function sel(t,focus,scroll){
    tabs.forEach(function(x){var on=x===t;x.setAttribute("aria-selected",on?"true":"false");x.tabIndex=on?0:-1});
    place(t);if(focus)t.focus();
    if(scroll&&el.scrollWidth>el.clientWidth)el.scrollTo({left:t.offsetLeft-el.clientWidth/2+t.offsetWidth/2,behavior:reduce?"auto":"smooth"});
    onSel&&onSel(t);
  }
  tabs.forEach(function(t,i){
    t.addEventListener("click",function(){sel(t,false,true)});
    t.addEventListener("keydown",function(e){
      var k=e.key,n=null;
      if(k==="ArrowRight")n=tabs[(i+1)%tabs.length];else if(k==="ArrowLeft")n=tabs[(i-1+tabs.length)%tabs.length];else if(k==="Home")n=tabs[0];else if(k==="End")n=tabs[tabs.length-1];
      if(n){e.preventDefault();sel(n,true,true)}
    });
  });
  var cur=tabs.filter(function(t){return t.getAttribute("aria-selected")==="true"})[0]||tabs[0];
  function init(){place(cur)}
  init();
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(init);
  window.addEventListener("resize",function(){var c=tabs.filter(function(t){return t.getAttribute("aria-selected")==="true"})[0];if(c)place(c)});
  return {sel:sel,tabs:tabs,refresh:init};
}
function panelSwitch(tab){
  var id=tab.getAttribute("aria-controls"),box=tab.closest("[data-panels]");
  $$(".panel",box).forEach(function(p){
    var on=p.id===id;
    if(on&&p.hidden){p.hidden=false;if(!reduce){p.classList.remove("in");void p.offsetWidth;p.classList.add("in")}}
    else if(!on)p.hidden=true;
  });
}
var segs=[];
$$("[data-seg]").forEach(function(el){segs.push(seg(el,panelSwitch))});
var degSeg=null;
$$("[data-seg]").forEach(function(el,i){if(el.id==="degSeg")degSeg=segs[i]});

/* buscador */
var inp=$("#q"),cnt=$("#cnt"),items=$$(".li"),empty=$("#empty"),chipsEl=$$(".chip"),filtro="all";
function aplica(){
  var q=norm(inp.value.trim()),ws=q?q.split(/\s+/):[],n=0;
  items.forEach(function(li){
    var id=li.getAttribute("data-id"),s=(window.IDX&&window.IDX[id])||"",a=li.getAttribute("data-area"),c=li.getAttribute("data-coste");
    var okF=filtro==="all"||filtro===a||filtro===c||(filtro==="claustro"&&li.getAttribute("data-via")==="C")||(filtro==="facultad"&&li.getAttribute("data-via")==="F");
    var ok=okF&&ws.every(function(w){return s.indexOf(w)>-1});
    li.hidden=!ok;if(ok)n++;
  });
  cnt.textContent=n===items.length?"Mostrando las "+n+" propuestas":(n===0?"Ninguna propuesta coincide":n+(n===1?" propuesta coincide":" propuestas coinciden"));
  empty.hidden=n>0;
}
if(inp){
  inp.addEventListener("input",aplica);
  chipsEl.forEach(function(c){c.addEventListener("click",function(){
    filtro=c.getAttribute("data-f");
    chipsEl.forEach(function(x){x.setAttribute("aria-pressed",x===c?"true":"false")});aplica();
  })});
  $("#clr").addEventListener("click",function(){inp.value="";filtro="all";chipsEl.forEach(function(x){x.setAttribute("aria-pressed",x.getAttribute("data-f")==="all"?"true":"false")});aplica();inp.focus()});
  aplica();
}

/* modal con la propuesta formal */
var dlg=$("#md"),mb=$("#mb"),mt=$("#mt"),mdl=$("#mdl"),mprev=$("#mprev"),mnext=$("#mnext"),mcp=$("#mcp"),lastFocus=null,curId=null;
var IDS=items.map(function(l){return +l.getAttribute("data-id")}).sort(function(a,b){return a-b});
function openProp(id,push){
  var t=$("#t"+id);if(!t)return;
  curId=id;
  mb.innerHTML="";mb.appendChild(t.content.cloneNode(true));
  mb.scrollTop=0;
  mt.innerHTML=t.getAttribute("data-tags");
  mdl.href="pdf/Propuesta_Claustro_URJC_PROP-CL-"+(id<10?"0"+id:id)+".pdf";
  var i=IDS.indexOf(id);
  mprev.disabled=i<=0;mnext.disabled=i>=IDS.length-1;
  if(!dlg.open){lastFocus=doc.activeElement;dlg.showModal();doc.body.classList.add("lock");requestAnimationFrame(function(){dlg.classList.add("show")})}
  if(push!==false)history.replaceState(null,"","#p"+id);
}
function closeProp(){
  dlg.classList.remove("show");
  setTimeout(function(){if(dlg.open)dlg.close()},reduce?0:200);
}
dlg.addEventListener("close",function(){
  doc.body.classList.remove("lock");
  if(/^#p\d+$/.test(location.hash))history.replaceState(null,"",location.pathname+location.search);
  if(lastFocus&&lastFocus.focus)lastFocus.focus();
});
dlg.addEventListener("cancel",function(e){e.preventDefault();closeProp()});
dlg.addEventListener("click",function(e){if(e.target.classList.contains("md-wrap"))closeProp()});
$("#mx").addEventListener("click",closeProp);
mprev.addEventListener("click",function(){var i=IDS.indexOf(curId);if(i>0)openProp(IDS[i-1])});
mnext.addEventListener("click",function(){var i=IDS.indexOf(curId);if(i<IDS.length-1)openProp(IDS[i+1])});
mcp.addEventListener("click",function(){
  var u=location.href.split("#")[0]+"#p"+curId;
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(u).then(function(){toast("Enlace copiado")},function(){toast("No se pudo copiar")});
  else toast("Copia el enlace desde la barra de direcciones");
});
doc.addEventListener("click",function(e){
  var b=e.target.closest("[data-open]");
  if(b){e.preventDefault();openProp(+b.getAttribute("data-open"))}
});

/* correo */
var em=$("#copyMail");
if(em)em.addEventListener("click",function(){
  var a=em.getAttribute("data-mail");
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(a).then(function(){toast("Correo copiado")},function(){toast("No se pudo copiar")});
  else toast("Selecciona y copia la dirección");
});
var fm=$("#mailForm");
if(fm)fm.addEventListener("submit",function(e){
  e.preventDefault();
  var g=fm.elements.grado.value,s=fm.elements.asunto.value.trim(),b=fm.elements.texto.value.trim();
  var sub=encodeURIComponent("[Claustro] "+g+(s?": "+s:"")),body=encodeURIComponent(b+"\n\nGrado o colectivo: "+g);
  location.href="mailto:"+fm.getAttribute("data-mail")+"?subject="+sub+"&body="+body;
});

/* enlaces profundos */
function route(){
  var h=location.hash,m;
  if((m=/^#p(\d+)$/.exec(h))){openProp(+m[1],false);return}
  if(dlg.open)closeProp();
  if((m=/^#grado-([a-z-]+)$/.exec(h))&&degSeg){
    var t=degSeg.tabs.filter(function(x){return x.getAttribute("data-slug")===m[1]})[0];
    if(t){degSeg.sel(t,false,true);var s=$("#titulaciones");if(s)s.scrollIntoView({behavior:reduce?"auto":"smooth"})}
  }
}
window.addEventListener("hashchange",route);
if(location.hash)route();
doc.addEventListener("click",function(e){
  var a=e.target.closest("a[data-grado]");
  if(a&&degSeg){
    var t=degSeg.tabs.filter(function(x){return x.getAttribute("data-slug")===a.getAttribute("data-grado")})[0];
    if(t){e.preventDefault();degSeg.sel(t,false,true);$("#titulaciones").scrollIntoView({behavior:reduce?"auto":"smooth"})}
  }
});
/* ---------- efectos ---------- */
var fine=window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/* sección activa en el menú */
var spy=[];
$$(".links a[href^='#']").forEach(function(a){var s=$(a.getAttribute("href"));if(s)spy.push({a:a,s:s})});
function spyUpd(){
  var y=window.scrollY+window.innerHeight*0.35,cur=null;
  spy.forEach(function(o){if(o.s.offsetTop<=y)cur=o});
  spy.forEach(function(o){o.a.classList.toggle("act",o===cur)});
}

/* foco de luz que sigue al cursor */
if(fine){
  doc.addEventListener("pointermove",function(e){
    var t=e.target.closest&&e.target.closest(".card,.li,.stat");
    if(!t)return;
    var r=t.getBoundingClientRect();
    t.style.setProperty("--mx",(e.clientX-r.left)+"px");t.style.setProperty("--my",(e.clientY-r.top)+"px");
  },{passive:true});
}

/* inclinación suave de la tarjeta de la foto y botones magnéticos */
var photo=$("#photo"),idc=$("#idc");
if(fine&&!reduce&&photo&&idc){
  photo.addEventListener("pointermove",function(e){
    var r=photo.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
    idc.style.transform="rotateY("+(x*7).toFixed(2)+"deg) rotateX("+(-y*6).toFixed(2)+"deg)";
  });
  photo.addEventListener("pointerleave",function(){idc.style.transform=""});
  $$(".ctas .btn,.vote .btn").forEach(function(b){
    b.addEventListener("pointermove",function(e){
      var r=b.getBoundingClientRect(),x=(e.clientX-r.left-r.width/2)/r.width,y=(e.clientY-r.top-r.height/2)/r.height;
      b.style.translate=(x*8).toFixed(1)+"px "+(y*6).toFixed(1)+"px";
    });
    b.addEventListener("pointerleave",function(){b.style.translate=""});
  });
}

/* frase que se ilumina palabra a palabra */
var say=$("#say"),sayW=[];
if(say){
  (function wrap(n){
    Array.prototype.slice.call(n.childNodes).forEach(function(c){
      if(c.nodeType===3){
        var f=doc.createDocumentFragment();
        c.textContent.split(/(\s+)/).forEach(function(p){
          if(!p)return;
          if(/^\s+$/.test(p)){f.appendChild(doc.createTextNode(p));return}
          var s=doc.createElement("span");s.className="wd";s.textContent=p;f.appendChild(s);sayW.push(s);
        });
        n.replaceChild(f,c);
      }else if(c.nodeType===1)wrap(c);
    });
  })(say);
}
function sayUpd(){
  if(!say)return;
  if(reduce){sayW.forEach(function(w){w.classList.add("on")});return}
  var r=say.getBoundingClientRect(),vh=window.innerHeight;
  var p=(vh*.82-r.top)/(r.height+vh*.32);p=Math.max(0,Math.min(1,p));
  var n=Math.round(p*sayW.length);
  sayW.forEach(function(w,i){w.classList.toggle("on",i<n)});
}

/* volver arriba con anillo de progreso y parallax suave */
var up=$("#up"),upr=$("#upr"),bgs=$$(".hero-bg i");
if(up)up.addEventListener("click",function(){window.scrollTo({top:0,behavior:reduce?"auto":"smooth"})});
var wide=window.matchMedia("(min-width:960px)");
var tk2=false;
function onScroll2(){
  if(tk2)return;tk2=true;
  requestAnimationFrame(function(){
    var h=root.scrollHeight-root.clientHeight,p=h>0?window.scrollY/h:0,y=window.scrollY;
    if(up){up.classList.toggle("on",y>700);upr.style.strokeDashoffset=(151*(1-p)).toFixed(1)}
    if(!reduce&&y<1100){
      if(photo)photo.style.translate=wide.matches?"0 "+(y*-.06).toFixed(1)+"px":"none";
      bgs.forEach(function(b,i){b.style.translate="0 "+(y*(i?.12:-.1)).toFixed(1)+"px"});
    }
    spyUpd();sayUpd();tk2=false;
  });
}
window.addEventListener("scroll",onScroll2,{passive:true});window.addEventListener("resize",onScroll2);
onScroll2();


/* candidatura de consenso: seleccionar un integrante */
(function(){
  var box=$("#consenso");if(!box)return;
  var d=$("#cons-d"),btns=$$(".cn",box);
  function setOn(b){
    btns.forEach(function(x){var on=x===b;x.setAttribute("aria-pressed",on?"true":"false");x.parentNode.classList.toggle("on",on)});
    if(b){d.innerHTML="";var s=doc.createElement("b");s.textContent=b.getAttribute("data-n");d.appendChild(s);d.appendChild(doc.createTextNode(" · "+b.getAttribute("data-d")+". Se une a la candidatura de consenso."))}
    else d.textContent=d.getAttribute("data-def");
  }
  btns.forEach(function(b){
    b.addEventListener("click",function(){setOn(b.getAttribute("aria-pressed")==="true"?null:b)});
    b.addEventListener("mouseenter",function(){if(!btns.some(function(x){return x.getAttribute("aria-pressed")==="true"}))preview(b)});
    b.addEventListener("mouseleave",function(){if(!btns.some(function(x){return x.getAttribute("aria-pressed")==="true"}))d.textContent=d.getAttribute("data-def")});
  });
  function preview(b){d.textContent=b.getAttribute("data-n")+" · "+b.getAttribute("data-d")+"."}
})();

})();
