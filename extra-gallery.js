/* TEMNAK – EXTRA GALLERY. Načítá se po hlavním skriptu (defer). */
(function(){
"use strict";

/* ============ UPRAVTE ZDE ============
   price v CZK (0 = zobrazí se „Připravujeme“). color = barva na věšáku.
   Vlastní fotky: img:{white:{front:"a.png",back:"b.png"},black:{front:"c.png",back:"d.png"}}
   (když fotka chybí, nakreslí se ilustrace). */
const XG_ITEMS=[
 {id:"h1",type:"hoodie",color:"black",name:{cs:"Mikina TEMNAK 1",en:"TEMNAK Hoodie 1"},price:0,img:{}},
 {id:"t1",type:"tee",color:"white",name:{cs:"Tričko TEMNAK 1",en:"TEMNAK Tee 1"},price:0,img:{}},
 {id:"h2",type:"hoodie",color:"white",name:{cs:"Mikina TEMNAK 2",en:"TEMNAK Hoodie 2"},price:0,img:{}},
 {id:"t2",type:"tee",color:"black",name:{cs:"Tričko TEMNAK 2",en:"TEMNAK Tee 2"},price:0,img:{}},
 {id:"h3",type:"hoodie",color:"black",name:{cs:"Mikina TEMNAK 3",en:"TEMNAK Hoodie 3"},price:0,img:{}},
 {id:"t3",type:"tee",color:"white",name:{cs:"Tričko TEMNAK 3",en:"TEMNAK Tee 3"},price:0,img:{}}
];
const XGT={
 cs:{close:"Zavřít",closeAria:"Zavřít galerii",hint:"Táhni do stran · klepni na kousek",back:"Zpět na věšák",flip:"Klepni na produkt a otoč ho",flipAria:"Otočit produkt",soon:"Připravujeme"},
 en:{close:"Close",closeAria:"Close gallery",hint:"Drag sideways · tap an item",back:"Back to the rail",flip:"Tap the product to flip it",flipAria:"Flip product",soon:"Coming soon"}
};
/* ===================================== */

const $=(s,r=document)=>r.querySelector(s);
const root=$("#xg"),track=$("#xgTrack"),prod=$("#xgProduct"),flip=$("#xgFlip");
if(!root||!track)return;
const lg=()=>document.documentElement.lang==="en"?"en":"cs";
const tx=k=>XGT[lg()][k];
const L=o=>o&&typeof o==="object"?(o[lg()]??o.cs??""):(o??"");
const price=it=>it.price>0?(typeof money==="function"?money(it.price):it.price+" Kč"):tx("soon");
const byId=id=>XG_ITEMS.find(i=>i.id===id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

let curItem=null,curColor="white",pushed=false,opener=null,moved=false;

/* ---------- ilustrace oblečení ---------- */
function garment(it,color,side){
  const im=it.img&&it.img[color]&&it.img[color][side];
  if(im)return `<img src="${esc(im)}" alt="${esc(L(it.name))}" draggable="false" loading="lazy">`;
  const c=color==="black"?{f:"#151515",s:"#555",ink:"#fff"}:{f:"#fafafa",s:"#1a1a1a",ink:"#121212"};
  const hood=it.type==="hoodie",front=side==="front";
  let body,det;
  if(hood){
    body="M70 18 L30 36 L10 122 L36 130 L44 100 L44 208 L156 208 L156 100 L164 130 L190 122 L170 36 L130 18 C124 40 112 52 100 52 C88 52 76 40 70 18Z";
    det=front?'<path d="M70 18C72 4 128 4 130 18M76 22C80 40 90 50 100 50C110 50 120 40 124 22M92 50L90 84M108 50L110 84M66 150H134L142 188H58Z"/>'
             :'<path d="M70 18C76 30 124 30 130 18M76 22C84 36 116 36 124 22"/>';
    det+='<path d="M44 198H156M14 112L38 120M186 112L162 120"/>';
  }else{
    body="M70 22 L22 46 L40 88 L60 79 L60 206 L140 206 L140 79 L160 88 L178 46 L130 22 C124 36 113 42 100 42 C87 42 76 36 70 22Z";
    det=front?'<path d="M74 24C80 38 90 46 100 46C110 46 120 38 126 24"/>':'<path d="M74 24C84 31 116 31 126 24"/>';
  }
  const txt=front
    ?`<text x="100" y="${hood?116:112}" font-size="${hood?15:16}" letter-spacing="2.5">TEMNAK</text>`
    :`<text x="100" y="${hood?100:98}" font-size="17" letter-spacing="3">TEMNAK</text><text x="100" y="${hood?114:112}" font-size="6.5" font-weight="400" letter-spacing="2.5">OFFICIAL MERCH</text>`;
  return `<svg viewBox="0 0 200 220" aria-hidden="true"><g fill="${c.f}" stroke="${c.s}" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"><path d="${body}"/><g fill="none">${det}</g></g><g fill="${c.ink}" font-family="Helvetica Neue,Helvetica,Arial,sans-serif" font-weight="700" text-anchor="middle">${txt}</g></svg>`;
}
const HANGER='<svg class="xg-hanger" viewBox="0 0 60 40" aria-hidden="true"><path d="M30 36L30 24C30 15 40 15 40 8C40 3 33 0 29 3" fill="none" stroke="#6a6a6a" stroke-width="2" stroke-linecap="round"/><path d="M30 30L4 38H56Z" fill="none" stroke="#6a6a6a" stroke-width="2" stroke-linejoin="round"/></svg>';

/* ---------- vykreslení ---------- */
function applyT(){
  document.querySelectorAll("#xg [data-xgt]").forEach(el=>{el.textContent=tx(el.dataset.xgt)});
  $("#xgClose").setAttribute("aria-label",tx("closeAria"));
  flip.setAttribute("aria-label",tx("flipAria"));
}
function renderStage(){
  const sl=track.scrollLeft,fid=document.activeElement&&document.activeElement.dataset&&document.activeElement.dataset.id;
  track.innerHTML=XG_ITEMS.map((it,i)=>`<button type="button" class="xg-item" style="--i:${i}" data-id="${it.id}" aria-label="${esc(L(it.name)+", "+price(it))}" data-testid="xg-item-${it.id}">
    <span class="xg-sway">${HANGER}<span class="xg-g">${garment(it,it.color||"white","front")}</span></span>
    <span class="xg-lbl"><b>${esc(L(it.name))}</b><span>${esc(price(it))}</span></span></button>`).join("");
  track.scrollLeft=sl;
  if(fid&&root.classList.contains("on")&&!root.classList.contains("pv")){const b=track.querySelector(`[data-id="${fid}"]`);b&&b.focus({preventScroll:true})}
}
function renderFaces(){
  if(!curItem)return;
  $("#xgFront").innerHTML=garment(curItem,curColor,"front");
  $("#xgBackF").innerHTML=garment(curItem,curColor,"back");
  $("#xgName").textContent=L(curItem.name);
  $("#xgPrice").textContent=price(curItem);
  document.querySelectorAll("#xgColors [data-xcolor]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.xcolor===curColor));
}
function refresh(){applyT();renderStage();renderFaces()}

/* ---------- zobrazení / skrytí ---------- */
function openUI(){
  if(root.classList.contains("on"))return;
  opener=document.activeElement;
  root.classList.add("on");root.setAttribute("aria-hidden","false");
  document.documentElement.classList.add("xg-lock");
  setTimeout(()=>$("#xgClose").focus({preventScroll:true}),80);
}
function closeUI(){
  if(!root.classList.contains("on"))return;
  root.classList.remove("on","pv");root.setAttribute("aria-hidden","true");
  document.documentElement.classList.remove("xg-lock");
  prod.hidden=true;curItem=null;pushed=false;
  if(opener&&opener.focus)try{opener.focus({preventScroll:true})}catch(e){}
}
function showStage(){
  const had=curItem;
  root.classList.remove("pv");prod.hidden=true;curItem=null;pushed=false;
  if(had){const b=track.querySelector(`[data-id="${had.id}"]`);b&&b.focus({preventScroll:true})}
}
function showProduct(it){
  if(curItem===it&&root.classList.contains("pv"))return;
  curItem=it;curColor="white";
  flip.classList.remove("flipped");flip.setAttribute("aria-pressed","false");
  renderFaces();
  root.classList.add("pv");prod.hidden=false;prod.scrollTop=0;
  setTimeout(()=>$("#xgBack").focus({preventScroll:true}),60);
}
function sync(){
  const h=location.hash;
  if(h==="#extra-gallery"||h.indexOf("#extra-gallery/")===0){
    openUI();
    const it=byId(h.split("/")[1]||"");
    it?showProduct(it):showStage();
  }else closeUI();
}
function closeGallery(){
  history.replaceState(null,"",location.pathname+location.search);
  sync();
}
function goBack(){
  if(pushed)history.back();
  else{history.replaceState(null,"",location.pathname+location.search+"#extra-gallery");sync()}
}

/* ---------- události ---------- */
$("#xgClose").addEventListener("click",closeGallery);
$("#xgBack").addEventListener("click",goBack);
flip.addEventListener("click",()=>{const f=flip.classList.toggle("flipped");flip.setAttribute("aria-pressed",f)});
$("#xgColors").addEventListener("click",e=>{const b=e.target.closest("[data-xcolor]");if(!b)return;curColor=b.dataset.xcolor;renderFaces()});
track.addEventListener("click",e=>{
  if(moved){moved=false;e.preventDefault();e.stopPropagation();return}
  const b=e.target.closest(".xg-item");if(!b)return;
  pushed=true;location.hash="#extra-gallery/"+b.dataset.id;
},true);
window.addEventListener("hashchange",sync);
document.addEventListener("keydown",e=>{
  if(!root.classList.contains("on"))return;
  if(e.key==="Escape"){root.classList.contains("pv")?goBack():closeGallery();return}
  if((e.key==="ArrowRight"||e.key==="ArrowLeft")&&!root.classList.contains("pv")){
    const items=[...track.querySelectorAll(".xg-item")],i=items.indexOf(document.activeElement);
    if(i<0)return;e.preventDefault();
    const n=items[i+(e.key==="ArrowRight"?1:-1)];if(n){n.focus();n.scrollIntoView({inline:"center",block:"nearest",behavior:"smooth"})}
  }
  if(e.key==="Tab"){ /* focus zůstává uvnitř galerie */
    const f=[...root.querySelectorAll("button:not([disabled])")].filter(x=>x.offsetParent!==null&&getComputedStyle(x).visibility!=="hidden");
    if(!f.length)return;
    const a=f[0],z=f[f.length-1];
    if(e.shiftKey&&(document.activeElement===a||!root.contains(document.activeElement))){e.preventDefault();z.focus()}
    else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}
  }
});

/* tažení myší + kolečko myši = posun do stran (na telefonu funguje nativní swipe) */
let down=false,sx=0,sl=0;
track.addEventListener("pointerdown",e=>{if(e.pointerType!=="mouse"||e.button!==0)return;down=true;moved=false;sx=e.clientX;sl=track.scrollLeft});
track.addEventListener("pointermove",e=>{
  if(!down)return;const dx=e.clientX-sx;
  if(!moved&&Math.abs(dx)>5){moved=true;track.classList.add("drag");try{track.setPointerCapture(e.pointerId)}catch(_){}}
  if(moved)track.scrollLeft=sl-dx;
});
["pointerup","pointercancel"].forEach(ev=>track.addEventListener(ev,()=>{down=false;track.classList.remove("drag");setTimeout(()=>{moved=false},0)}));
track.addEventListener("wheel",e=>{
  if(Math.abs(e.deltaY)>Math.abs(e.deltaX)&&track.scrollWidth>track.clientWidth){track.scrollLeft+=e.deltaY;e.preventDefault()}
},{passive:false});

/* přepočet při změně jazyka / měny (hlavní skript volá applyLang a renderAll) */
["applyLang","renderAll"].forEach(n=>{
  const f=window[n];
  if(typeof f==="function")window[n]=function(){const r=f.apply(this,arguments);try{refresh()}catch(e){}return r};
});

refresh();
sync();
})();
