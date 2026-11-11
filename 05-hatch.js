
/* ===== V3: Thú Thần Giới – chạm vỡ trứng, Năm/Cấp/EXP, thuộc tính 17 hệ, khắc chế, tỉ lệ ===== */
const MAXLV=100;
function expNeed(l){return 40+l*20}
function renderExp(){$('h-lv').textContent=level;const n=expNeed(level);
  $('exp-fill').style.width=(level>=MAXLV?100:Math.min(100,exp/n*100))+'%';
  $('exp-txt').textContent=level>=MAXLV?'Cấp tối đa':'EXP '+Math.floor(exp)+'/'+n}
/* Chỉ số tăng khi lên cấp: so sánh chỉ số ở cấp cũ và cấp mới */
function lvGain(l0,l1){
  if(!pet||l1<=l0)return '';
  const a=statsOf(pet.bl,pet.pi,pet.base,l0),b=statsOf(pet.bl,pet.pi,pet.base,l1);
  return [['hp','Sinh Lực'],['atk','Công'],['def','Thủ'],['spd','Tốc'],['mag','Linh']]
    .map(([k,n])=>{const d=b[k]-a[k];return d>0?n+' <b>+'+d+'</b>':''}).filter(Boolean).join(' · ')}
let lvupTimer=0;
function lvToast(l0,l1){
  let el=document.getElementById('lvup');
  if(!el){el=document.createElement('div');el.id='lvup';document.body.appendChild(el)}
  const g=lvGain(l0,l1);
  el.innerHTML='<div class="t">⬆️ LÊN CẤP <b>'+l1+'</b>!</div>'+(g?'<div class="g">'+g+'</div>':'');
  el.classList.remove('show');void el.offsetWidth;el.classList.add('show');
  clearTimeout(lvupTimer);lvupTimer=setTimeout(()=>el.classList.remove('show'),3200)}
function addExp(n){if(!hatched)return;exp+=n;const lv0=level;
  while(level<MAXLV&&exp>=expNeed(level)){const l0=level;exp-=expNeed(level);level++;
    const g=lvGain(l0,level);
    log('⬆️ <b style="color:var(--jade)">Lên cấp '+level+'!</b>'+(g?' '+g+'.':''));burst=Math.max(burst,.6)}
  if(level>=MAXLV)exp=0;updateStage();renderExp();
  if(level>lv0){if(window.NOTI)NOTI.level(lv0,level);else lvToast(lv0,level)} /* NOTI (16-notify.js): bảng thông báo lên cấp */
}

/* --- chạm vỡ trứng --- */
function setupTap(){tapsNeed=5+Math.floor(Math.random()*4);taps=0;prog=0;
  $('beads').innerHTML=Array.from({length:tapsNeed},()=>'<div class="bead"></div>').join('')}
function tapEgg(){if(hatched||!chosen)return;taps++;
  prog=Math.min(CRK.length,Math.ceil(taps/tapsNeed*CRK.length));
  document.querySelectorAll('.bead').forEach((b,i)=>b.classList.toggle('on',i<taps));
  burst=Math.max(burst,.3);tapT=performance.now();
  $('mission').textContent=taps>=tapsNeed?'Vỏ trứng vỡ tung!':'Vỏ trứng nứt thêm... ('+taps+'/'+tapsNeed+')';
  if(taps>=tapsNeed){prog=CRK.length;hatch()}}
const _ce=confirmEgg;confirmEgg=function(){if(chosen)return;_ce();setupTap()};

/* --- 17 vùng: phân hạng + thuộc tính độc quyền --- */
const TIERN=['Phổ biến','Hiếm','Rất hiếm','Huyền thoại'],TIERC=['#b8c4c0','#6fe0c8','#c58aff','#ffbe46'];
// theo thứ tự EPI: Tuyết,Sương,Vân,Phong,Lôi,Nguyệt,Dương,Huyền,Kim,Ngọc,Thanh,Xích,Hắc,Tử,Thiên,Linh,Thần
const TIER=[0,0,0,1,2,0,0,2,1,1,0,1,2,1,3,1,3];
const TW=[[72,25,3,0],[55,35,9.5,.5],[38,40,19,3],[20,40,30,10],[8,27,40,25]]; // theo phẩm trứng
const SP17=[
 {n:'Làm chậm',m:30,c:.10,t:v=>'Tốc đối thủ -'+v+'%'},
 {n:'Suy yếu',m:25,c:.12,t:v=>'Công đối thủ -'+v+'%'},
 {n:'Chắn đòn',m:0,c:.12,t:(v,e)=>'Mỗi đòn nhận tối đa '+Math.round((60-40*Math.min(1,e))*10)/10+'% HP'},
 {n:'Liên kích',m:30,c:.15,t:v=>'Xác suất đánh thêm đòn '+v+'% (50% sát thương)'},
 {n:'Chí mạng',m:20,c:.18,t:v=>'Tỉ lệ chí mạng +'+v+'%, sát thương chí mạng +'+Math.round(v*3*10)/10+'%'},
 {n:'Thu hoạch',m:50,c:0,t:v=>'Xu nhận được +'+v+'%'},
 {n:'Danh vọng',m:50,c:0,t:v=>'Uy danh nhận được +'+v+'%'},
 {n:'Phản đòn',m:30,c:.14,t:v=>'Trả lại '+v+'% sát thương nhận'},
 {n:'Xuyên giáp',m:40,c:.18,t:v=>'Bỏ qua '+v+'% Thủ đối thủ'},
 {n:'Khiên',m:25,c:.14,t:v=>'Đầu trận có khiên bằng '+v+'% HP'},
 {n:'Kháng hiệu ứng',m:50,c:.08,t:v=>'Giảm choáng, chậm, đốt nhận vào '+v+'%'},
 {n:'Thiêu đốt',m:10,c:.14,t:v=>'Đốt: '+v+'% Công mỗi lượt'},
 {n:'Hút máu',m:25,c:.14,t:v=>'Hồi '+v+'% sát thương gây ra'},
 {n:'Tầm bảo',m:60,c:0,t:v=>'Tỉ lệ rơi vật phẩm +'+v+'%'},
 {n:'Hồi sinh',m:40,c:.22,t:v=>'Hồi sinh 1 lần mỗi trận với '+v+'% HP'},
 {n:'Ngộ tính',m:60,c:0,t:v=>'Thám hiểm hiệu quả +'+v+'%'},
 {n:'Bất khuất',m:50,c:.22,t:v=>'HP dưới 25%: Công và Thủ +'+v+'%'}];
function spInfo(sp,pi,q){const e=Math.min(1.2,pur(pi)*(1+q*.05)),d=SP17[sp],v=Math.round(d.m*e*10)/10;
  return{e,v,name:d.n,text:d.t(v,e),c:d.c*e}}
function spOfPet(){return pet?spInfo(pet.sp,pet.pi+(pet.up||0)*.03,pet.q):null}
function addFame(n){/* Uy danh chỉ từ Đấu trường (Bước 4). Nguồn cũ (thám hiểm/Linh Đan/Linh Quả) đã tắt. */return 0}

/* --- ngũ hành khắc chế (Hồ trung lập) --- */
const CYC=['ho','long','lan','vu','tuoc'];
function relMul(a,b){if(a==='hu'||b==='hu')return 1;
  if(CYC[(CYC.indexOf(a)+1)%5]===b)return 1.25;
  if(CYC[(CYC.indexOf(b)+1)%5]===a)return .8;return 1}
 function relText(bl){if(bl==='hu')return'Trung lập: không khắc hệ nào, không bị hệ nào khắc';
  const i=CYC.indexOf(bl);return'Khắc <b>'+BL[CYC[(i+1)%5]].h+'</b> (+25%, ×1,25) · Bị <b>'+BL[CYC[(i+4)%5]].h+'</b> khắc (−20%, ×0,8)'}

/* --- tỉ lệ roll --- */
const _pi=pick;
window.rollPet=function(){
  const fox=Math.random()*100<FOXP[eggQ];
  const bl=fox?'hu':['ho','vu','long','tuoc','lan'][Math.floor(Math.random()*5)];
  let pi=pick(PT[eggQ]);if(fox&&pi<1)pi=1;
  const tot=[50,60,72,86,100][eggQ],base={};
  ['hp','atk','def','spd','mag'].forEach(k=>base[k]=tot/5*(.85+Math.random()*.3));
  const tier=pick(TW[eggQ]),pool=[];TIER.forEach((t,i)=>{if(t===tier)pool.push(i)});
  return{bl,pi,q:eggQ,base,sp:pool[Math.floor(Math.random()*pool.length)]}};
function pct(a){const s=a.reduce((x,y)=>x+y,0);return a.map(x=>Math.round(x/s*1000)/10)}
function ratesHtml(){
  const t=pct(TW[eggQ]);
  let h='<b>Tỉ lệ phẩm trứng:</b> '+QN.map((n,i)=>n+' '+QW[i]+'%').join(' · ');
  h+='<br><b>Vùng đất (trứng '+QN[eggQ]+'):</b> '+TIERN.map((n,i)=>'<span style="color:'+TIERC[i]+'">'+n+' '+t[i]+'%</span>').join(' · ');
  h+='<br><b>Tộc Cửu Vĩ Hồ:</b> '+FOXP[eggQ]+'% <small>(tộc cân bằng nên khó nở hơn)</small>';
  h+='<details style="margin-top:6px"><summary style="cursor:pointer;color:var(--gold)">Bảng tỉ lệ đầy đủ</summary><table style="width:100%;font-size:10px;border-collapse:collapse;margin-top:6px"><tr style="color:var(--gold)"><td>Trứng</td><td>Phổ biến</td><td>Hiếm</td><td>R.hiếm</td><td>H.thoại</td><td>Hồ</td></tr>'+
   TW.map((w,i)=>'<tr><td style="color:rgb('+QC[i]+')">'+QN[i]+'</td>'+pct(w).map(x=>'<td>'+x+'%</td>').join('')+'<td>'+FOXP[i]+'%</td></tr>').join('')+'</table>'+
   '<div style="margin-top:6px;text-align:left">'+TIERN.map((n,i)=>'<span style="color:'+TIERC[i]+'"><b>'+n+':</b></span> '+EPI.filter((_,k)=>TIER[k]===i).map(x=>x[0]).join(', ')).join('<br>')+'</div></details>';
  return h}
const _rp=renderPick;renderPick=function(){_rp();
  const b=$('btn-reroll');b.innerHTML='<span class="ic">🎲</span>Gieo Quẻ (còn '+rerollLeft+' lượt)';
  b.disabled=rerollLeft<=0;b.classList.toggle('locked',rerollLeft<=0);
  $('rates').innerHTML=ratesHtml()};

/* --- bảng thông tin: thêm thuộc tính độc quyền + khắc chế --- */
const _ri=renderInfo;renderInfo=function(){_ri();
  const q=pet?pet.q:eggQ;let bl,sp,pi;
  if(pv.on){bl=pv.bl;sp=pv.sp;pi=pv.pi}else if(pet){bl=pet.bl;sp=pet.sp;pi=pet.pi}else return;
  const pe=pi+(!pv.on&&pet?(pet.up||0)*.03:0),s=spInfo(sp,pe,q),el=$('info');
  {const B=BL[bl],p=pur(pe),NM={atk:'Công',def:'Thủ',hp:'Sinh Lực',spd:'Tốc',mag:'Linh',eva:'Né tránh',stun:'Choáng',regen:'Hồi/lượt'};
   const cur=Object.keys(B.b).map(k=>NM[k]+' <b style="color:var(--jade)">+'+Math.round(B.b[k]*p*10)/10+'%</b>').join(', ');
   el.innerHTML=el.innerHTML.replace('<small>'+B.tip+' khi Phản Tổ</small>','<div style="margin-top:4px">Thưởng huyết mạch hiện tại ('+PL[pi][1]+(!pv.on&&pet&&pet.up?' +'+pet.up:'')+' '+Math.round(p*100)+'%): '+cur+'<br><small>Tối đa '+B.tip+' khi Phản Tổ 100%</small></div>')}
  el.insertAdjacentHTML('beforeend','<div style="margin-top:10px;padding-top:8px;border-top:1px dashed rgba(168,92,78,.4)">'+
   'Vùng <b>'+EPI[sp][0]+'</b> · <b style="color:'+TIERC[TIER[sp]]+'">'+TIERN[TIER[sp]]+'</b><br>'+
   '✨ <b style="color:var(--gold)">'+s.name+'</b>: '+s.text+(s.c>0?'<br><small>🎖️ Đấu trường: chiến lực +'+Math.round(s.c*1000)/10+'%</small>':'')+'<br>'+
   '☯ '+relText(bl)+'</div>')};

/* --- hoạt động: thám hiểm / đấu trường / cửa hàng --- */
window.train=function(){if(!hatched)return;const s=spOfPet(),ex=10*(1+(pet.sp===15?s.v/100:0));
  stats();addExp(ex);log('🧭 Thú thám hiểm, EXP +'+Math.round(ex)+'.')};
window.arena=function(){if(!hatched)return;log('⚔️ Đấu trường: cập nhật tiếp theo.');};
ITEMS.dan.use=()=>{stats();addExp(40);log('💊 Thú dùng Linh Đan, EXP +40.')};
ITEMS.dan.d='Thú tăng tu vi: EXP +40.';
ITEMS.qua.use=()=>{stats();addExp(8);log('🍎 Thú ăn Linh Quả, EXP +8.')};
ITEMS.qua.d='Quả chứa linh khí: EXP +8.';
renderExp();renderPick();
