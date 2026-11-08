/* ===== Nâng cấp huyết mạch ===== */
const UP_MAX=10,UP_GAIN=.03,UP_RATE=[80,74,68,62,56,50,44,38,32,26]; /* tỉ lệ thành công (%) theo cấp hiện tại 0..9 — sửa tại đây */
const UP_NM={atk:'Công',def:'Thủ',hp:'Sinh Lực',spd:'Tốc',mag:'Linh',eva:'Né tránh',stun:'Choáng',regen:'Hồi/lượt'};
let upPut={huyet:0,thuoc:0,tinh:0},upSel=null,upMsg='';
function upNeed(n){return{huyet:1+Math.floor(n/3),thuoc:2+n,tinh:3+n,xu:50*(n+1)}} /* nguyên liệu mỗi lần, tăng theo cấp */
function isUpItem(id){return id==='huyet'||id==='thuoc'||/^mat\d+$/.test(id)}
function cnt(id){return bag.reduce((a,s)=>a+(s.id===id?s.n:0),0)}
function removeItem(id,n){for(let i=bag.length-1;i>=0&&n>0;i--){const s=bag[i];if(s.id!==id)continue;const a=Math.min(s.n,n);s.n-=a;n-=a;if(s.n<=0)bag.splice(i,1)}bagSel=-1;renderBag()}
function upIds(){return{huyet:'huyet',thuoc:'thuoc',tinh:'mat'+pet.sp}}
function upKey(id){const I=upIds();return id===I.huyet?'huyet':id===I.thuoc?'thuoc':id===I.tinh?'tinh':null}
const pc=x=>Math.round(x*1000)/10;

/* đổi tên + công dụng vật phẩm */
ITEMS.thuoc.n='Linh Thảo';ITEMS.thuoc.d='Dùng nâng cấp huyết mạch (mở mục 🩸 Huyết mạch).';
ITEMS.huyet.d='Cực hiếm. Dùng nâng cấp huyết mạch (mở mục 🩸 Huyết mạch).';
for(let k=0;k<17;k++)ITEMS['mat'+k].d='Chỉ dùng nâng cấp huyết mạch cho thú vùng '+EPI[k][0]+' (mở mục 🩸 Huyết mạch).';
const _bu=bagUse;bagUse=function(){const s=bag[bagSel];if(s&&isUpItem(s.id)){log('🩸 <b>'+ITEMS[s.id].n+'</b> dùng ở mục <b>Huyết mạch</b>.');return}_bu()};

function upSelect(id){upSel=id;if(pet){const k=upKey(id);if(k){const n=pet.up||0,need=upNeed(n)[k];upSelQty=Math.max(1,Math.min(need-upPut[k],cnt(id)-upPut[k]))}}renderBlood()}
let upSelQty=1;
function upPutIn(){if(!pet||!upSel)return;const k=upKey(upSel);if(!k)return;
 let q=Math.floor(Number($('up-qty').value));if(!q||q<1){upMsg='<span class="bad">Hãy nhập số lượng lớn hơn 0.</span>';renderBlood();return}
 const free=cnt(upSel)-upPut[k];if(q>free)q=free;
 if(q<=0){upMsg='<span class="bad">Bạn không còn '+ITEMS[upSel].n+' để bỏ vào.</span>';renderBlood();return}
 upPut[k]+=q;upMsg='';upSelQty=1;renderBlood()}
function upTake(k){upPut[k]=0;upMsg='';renderBlood()}
function upDo(){
 if(!hatched||!pet)return;
 const ids=upIds(),n=pet.up||0;
 if(n>=UP_MAX||pur(pet.pi+n*UP_GAIN)>=1){renderBlood();return}
 const need=upNeed(n);
 for(const k of['huyet','thuoc','tinh'])upPut[k]=Math.min(upPut[k],cnt(ids[k]));
 const miss=['huyet','thuoc','tinh'].filter(k=>upPut[k]<need[k]).map(k=>ITEMS[ids[k]].n+' ('+upPut[k]+'/'+need[k]+')');
 if(miss.length){upMsg='<span class="bad">Chưa đủ nguyên liệu: '+miss.join(', ')+'.</span>';renderBlood();return}
 if(gold<need.xu){upMsg='<span class="bad">Không đủ xu: cần '+need.xu+', bạn có '+gold+'.</span>';renderBlood();return}
 for(const k of['huyet','thuoc','tinh']){removeItem(ids[k],need[k]);upPut[k]-=need[k]}
 gold-=need.xu;stats();
 const p0=pur(pet.pi+n*UP_GAIN),p1=pur(pet.pi+(n+1)*UP_GAIN);
 if(Math.random()*100<UP_RATE[n]){
  pet.up=n+1;
  upMsg='<span class="ok">✨ Nâng cấp THÀNH CÔNG! Huyết mạch +'+(n+1)+': '+pc(p0)+'% → '+pc(p1)+'% (+'+pc(p1-p0)+'%).</span>';
  log('🩸 <b style="color:var(--jade)">Nâng cấp huyết mạch thành công!</b> +'+(n+1)+', huyết mạch '+pc(p0)+'% → '+pc(p1)+'%.');
 }else{
  upMsg='<span class="bad">💥 Nâng cấp THẤT BẠI! Nguyên liệu và xu đã mất, huyết mạch giữ nguyên +'+n+' ('+pc(p0)+'%).</span>';
  log('🩸 <b style="color:#ff8a7a">Nâng cấp huyết mạch thất bại</b>, mất nguyên liệu và '+need.xu+' xu. Vẫn giữ +'+n+'.');
 }
 renderInfo();renderBlood()}

function renderBlood(){
 const el=$('up-wrap');if(!el)return;
 if(!hatched||!pet){el.innerHTML='<div class="infobox" style="text-align:center">Cần nở thú trước khi nâng cấp huyết mạch.</div>';return}
 const ids=upIds(),n=pet.up||0,B=BL[pet.bl],p0=pur(pet.pi+n*UP_GAIN);
 for(const k in ids)upPut[k]=Math.max(0,Math.min(upPut[k],cnt(ids[k])));
 const maxed=n>=UP_MAX||p0>=1-1e-9,need=upNeed(n),p1=pur(pet.pi+(n+1)*UP_GAIN);
 const slotDef=[['huyet',50,18],['thuoc',17,75],['tinh',83,75]];
 let circle='<div class="upcircle"><svg viewBox="0 0 100 100"><circle cx="50" cy="56" r="38" class="r1"/><circle cx="50" cy="56" r="31" class="r2"/><polygon points="50,18 17,75 83,75" class="tri"/></svg>'+
  '<div class="uppet" style="background:radial-gradient(circle,rgba('+B.au+',.55),rgba('+B.au+',.08) 70%)"><canvas id="up-pet" width="128" height="128"></canvas></div>';
 for(const[k,x,y]of slotDef){const it=ITEMS[ids[k]],full=upPut[k]>=need[k];
  circle+='<button class="upslot'+(full?' full':'')+'" style="left:'+x+'%;top:'+y+'%" onclick="upTake(\''+k+'\')" title="Chạm để lấy ra"><span style="color:'+(it.col||'inherit')+'">'+it.i+'</span><b>'+upPut[k]+'/'+need[k]+'</b></button>'}
 circle+='</div>';
 let right='<div class="upbag">';
 for(const k of['huyet','thuoc','tinh']){const id=ids[k],it=ITEMS[id],free=cnt(id)-upPut[k];
  right+='<button class="slot'+(upSel===id?' sel':'')+'" onclick="upSelect(\''+id+'\')"><span style="color:'+(it.col||'inherit')+'">'+it.i+'</span><b>'+free+'</b></button>'}
 right+='</div>';
 const si=upSel&&upKey(upSel)?ITEMS[upSel]:null;
 right+='<div class="infobox upinfo">'+(si?'<b style="color:var(--gold)">'+si.n+'</b> (còn '+(cnt(upSel)-upPut[upKey(upSel)])+')':'<small>Chạm vào vật phẩm, nhập số lượng rồi bấm Bỏ vào.</small>')+'</div>'+
  '<div class="sellrow"><input type="number" id="up-qty" min="1" value="'+upSelQty+'" inputmode="numeric"><button class="mini jade" onclick="upPutIn()">⬇ Bỏ vào</button></div>';
 let bonus='';
 {const a=Object.keys(B.b).map(k=>UP_NM[k]+' '+pc(B.b[k]*p0/100)+'%'+(maxed?'':' → '+pc(B.b[k]*p1/100)+'%'));bonus=a.join(', ')}
 let note;
 if(maxed)note='<b style="color:var(--gold)">Huyết mạch đã đạt mức tối đa'+(n>=UP_MAX?' (+'+UP_MAX+')':' (100%)')+'.</b>';
 else note='<b>Nâng +'+n+' → +'+(n+1)+'</b><br>✅ Tỉ lệ thành công: <b style="color:var(--jade)">'+UP_RATE[n]+'%</b><br>🧬 Huyết mạch: <b>'+pc(p0)+'% → '+pc(p1)+'%</b> (+'+pc(p1-p0)+'%)<br>📈 Thưởng: '+bonus+'<br>📦 Cần: '+ITEMS[ids.huyet].n+' ×'+need.huyet+', '+ITEMS[ids.thuoc].n+' ×'+need.thuoc+', '+ITEMS[ids.tinh].n+' ×'+need.tinh+', <b style="color:var(--gold)">'+need.xu+' xu</b> (bạn có '+gold+')<br><small>Thất bại: mất nguyên liệu và xu, không bị giảm cấp. Mỗi lần thành công, lần sau tốn nhiều nguyên liệu hơn và khó hơn. Tối đa +'+UP_MAX+'.</small>';
 el.innerHTML='<div class="infobox" style="text-align:center;margin-bottom:4px">Huyết mạch: <b style="color:rgb('+B.au+')">'+B.n+'</b> · '+PL[pet.pi][1]+(n?' <b style="color:var(--jade)">+'+n+'</b>':'')+' · <b style="color:var(--gold)">'+pc(p0)+'%</b></div>'+
  '<div class="upgrid"><div>'+circle+'</div><div>'+right+'</div></div>'+
  '<div class="infobox upnote">'+note+'</div>'+
  (maxed?'':'<button class="jade" style="margin-top:5px" onclick="upDo()">✨ Nâng cấp huyết mạch</button>')+
  '<div class="infobox upmsg">'+upMsg+'</div>';
 if(!upRaf)upRaf=requestAnimationFrame(upLoop)}

let upRaf=0;
function upLoop(t){const cv=document.getElementById('up-pet');
 if(!cv||!pet||!document.getElementById('blood-box').open){upRaf=0;return}
 const x=cv.getContext('2d'),api=window.VanKiepSprites;x.clearRect(0,0,128,128);x.imageSmoothingEnabled=false;
 const sh=api?api.getSheet(pet.bl,pet.sp):null,r=api?api.frameRect(stageOf(level),Math.floor(t/200)%api.frameCount):null;
 if(sh&&r)x.drawImage(sh,r.sx,r.sy,r.sw,r.sh,0,0,128,128);
 else{const im=spriteFor(pet.bl,pet.sp);if(im.complete&&im.naturalWidth)x.drawImage(im,0,0,128,128)}
 upRaf=requestAnimationFrame(upLoop)}
document.getElementById('blood-box').addEventListener('toggle',e=>{if(e.target.open)renderBlood()});
renderBlood();
