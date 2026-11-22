/* 73-luat-trang-bi.js - LUẬT TRANG BỊ / NGUYÊN LIỆU / RÈN / CƯỜNG HÓA, chép đúng luật main (12-equip.js, 46-enh-items.js, 48-enh-ui.js, 10-drops-shop.js).
   KHÔNG vẽ giao diện (giao diện Rèn / Cường hóa ở 74-ren-cuong-hoa.js, khung ở 72-khung-ren-cuong-hoa.js). Nạp SAU 53-balo, 55-trang-bi, 66-tien-te, 70-bo-trang-bi, 102-quai-vung.

   GIỮ NGUYÊN SỐ CỦA MAIN: 17 bộ x 4 món, phẩm Phàm/Linh/Địa/Thiên/Thần (gacha 55/28/12/4/1, cộng 0/10/22/38/60%), 1 chỉ số mặc định + 2 dòng bốc ngẫu nhiên,
   nhân vùng (1+z*0,03), cường hóa +0..+10 (mỗi cấp +4% mọi dòng), tỉ lệ 95..15%, đá bậc 1..6 theo vùng, Vé Bảo Hộ, Đá Ngũ Sắc +5%, giá rèn eqNeed(z), tỉ lệ rơi nguyên liệu/đá.
   KHÁC MAIN (vì nhánh này có hệ thống khác, sửa ở khối CẤU HÌNH):
   - "xu" của main = TINH THẠCH (TTGTIEN 'tt').
   - 4 món của main nằm vào 4 ô của 8 ô Trang bị: Vũ Khí -> ô 4 (Vũ khí), Giáp -> ô 1 (Áo giáp), Vòng -> ô 5 (Dây chuyền), Ngọc -> ô 7 (Ngọc bội). Ô Mũ/Găng tay/Giày/Nhẫn chưa có đồ.
   - Chỉ số: dùng ĐÚNG khóa chỉ số Thú Thần (hp, tc, pt, td, mm, cm, hm, hutm, ne, choang, cx, pd, lk, stcm, stdb, xg, khu, kdb, kc, kne, klk, khutm, khm, kpd). Không còn Pháp Công: món Ngọc có chỉ số mặc định là ST đặc biệt (stdb). Có trần tổng (CAPS).
     Chỉ số cố định = 7% (mặc định ô: 9..20%) chỉ số thú ĐIỂN HÌNH của vùng đó (thú cấp giữa vùng), tính từ TTGCS.CFG, thay cho eqRef của main.
   - Địch nhánh này chỉ có Rank E..SR (không có Yếu/Thường/Tinh Anh/Thống Lĩnh): xem TIER_NORMAL / TIER_BOSS để đổi Rank sang bậc của main.
   - Chỉ quái nguồn "main" (102 quái vùng) rơi nguyên liệu + đá; thú hoang (demo) không rơi.
   API: TTGLT.roiDo(enemy,mm) | .ren(z,s) | .cuongHoa(uid,{tier,rb,ticket}) | .apDung(chiSo) | .tong() | .need(z) | .ids(z,s) | .tierOf(z) | ...
   THỬ: thêm ?luat=demo vào link, mở khung Rèn/Cường hóa lần đầu sẽ được tặng sẵn nguyên liệu, đá, vé, 20.000 Tinh Thạch (1 lần mỗi phiên). */
(function(root){
'use strict';
var D='game-moi/img/';
/* ===================== CẤU HÌNH ===================== */
var ZN=[['Tuyết Nguyên','tuyet-nguyen'],['Sương Cốc','suong-coc'],['Vân Đảo','van-dao'],['Phong Nguyên','phong-nguyen'],['Lôi Vực','loi-vuc'],['Nguyệt Cung','nguyet-cung'],['Dương Sơn','duong-son'],['Huyền Uyên','huyen-uyen'],['Kim Khoáng','kim-khoang'],['Ngọc Động','ngoc-dong'],['Thanh Lâm','thanh-lam'],['Xích Hỏa Địa','xich-hoa-dia'],['Hắc Ám Lâm','hac-am-lam'],['Tử Tinh Hải','tu-tinh-hai'],['Thiên Không','thien-khong'],['Linh Hoa Viên','linh-hoa-vien'],['Thần Điện','than-dien']];
var NZ=ZN.length;
var CATN=[{n:'Móng Vuốt',t:'claw'},{n:'Vảy Giáp',t:'scale'},{n:'Nanh Thú',t:'fang'},{n:'Nhãn Châu',t:'eye'},{n:'Linh Cốt',t:'bone'}];   /* loại nguyên liệu = quái thứ 1..5 của vùng */
var SHARED=4;   /* Linh Cốt dùng chung cho mọi ô */
/* 4 món của main -> ô trong 8 ô Trang bị (55-trang-bi.js). cat = loại nguyên liệu chính; main/b = chỉ số mặc định cố định của ô */
var PIECE=[{k:'vukhi',n:'Vũ Khí',slot:4,cat:0,main:'tc',b:10},{k:'giap',n:'Giáp',slot:1,cat:1,main:'pt',b:10},{k:'vong',n:'Vòng',slot:5,cat:2,main:'td',b:9},{k:'ngoc',n:'Ngọc',slot:7,cat:3,main:'stdb',b:7}];
var QN=['Phàm','Linh','Địa','Thiên','Thần'],QW=[55,28,12,4,1],QB=[0,.10,.22,.38,.60],QC=['190,190,190','110,220,200','110,170,255','200,130,255','255,190,70'];
var EQ={BAG:100,LINES:2,ZSTEP:.03,ROLL:[.6,1],GAIN:.04,MAX:10};
/* BẢNG CHỈ SỐ TRANG BỊ = đúng khóa + tên của chỉ số Thú Thần (PAGES ở 54-thu-than.js, PHU ở 56-chi-so.js). Trang bị cộng THẲNG vào chỉ số thú.
   t:'f' = số cố định, tính theo % chỉ số thú điển hình của vùng (REFK) | t:'p' = tỉ lệ %, hiện kèm dấu % | t:'n' = số thẳng, không dấu % (May mắn).
   b = giá trị gốc (% ở vùng 1, phẩm Phàm, chưa cường hóa). Giá thật = b x (1+vùng*0,03) x (1+cộng phẩm) x (0,6~1 ngẫu nhiên) x (1+0,04*cấp cường hóa).
   Chỉ số chưa có luật chiến đấu vẫn bốc + cộng bình thường (có hiệu lực khi làm luật). */
var STATS={
  hp:{n:'HP',b:7,t:'f'},tc:{n:'Tấn công',b:7,t:'f'},pt:{n:'Phòng thủ',b:7,t:'f'},td:{n:'Tốc độ',b:7,t:'f'},mm:{n:'May mắn',b:2,t:'n'},
  cm:{n:'Chí mạng',b:4,t:'p'},hm:{n:'Hồi máu',b:1.4,t:'p'},hutm:{n:'Hút máu',b:2,t:'p'},ne:{n:'Né tránh',b:4,t:'p'},choang:{n:'Choáng',b:3.5,t:'p'},
  cx:{n:'Chính xác',b:4,t:'p'},pd:{n:'Phản đòn',b:3,t:'p'},lk:{n:'Liên kích',b:3,t:'p'},stcm:{n:'ST chí mạng',b:6,t:'p'},stdb:{n:'ST đặc biệt',b:5,t:'p'},
  xg:{n:'Xuyên giáp',b:3,t:'p'},khu:{n:'Kháng hiệu ứng',b:4,t:'p'},kdb:{n:'Kháng đặc biệt',b:4,t:'p'},kc:{n:'Kháng choáng',b:4,t:'p'},kne:{n:'Kháng né',b:3,t:'p'},
  klk:{n:'Kháng liên kích',b:3,t:'p'},khutm:{n:'Kháng hút máu',b:3,t:'p'},khm:{n:'Kháng hồi máu',b:3,t:'p'},kpd:{n:'Kháng phản đòn',b:3,t:'p'}};
var W={hp:14,tc:14,pt:14,td:12,mm:4,                                       /* trọng số bốc dòng ngẫu nhiên */
  cm:12,hm:8,hutm:6,ne:10,choang:8,cx:8,pd:5,lk:6,stcm:8,stdb:8,
  xg:6,khu:7,kdb:6,kc:6,kne:5,klk:4,khutm:4,khm:4,kpd:4};
var CAPS={mm:100,cm:60,hm:8,hutm:30,ne:45,choang:35,cx:60,pd:35,lk:35,stcm:100,stdb:100,  /* trần TỔNG chỉ số thú sau khi cộng trang bị (hp/tc/pt/td không có trần) */
  xg:50,khu:60,kdb:60,kc:60,kne:45,klk:45,khutm:45,khm:45,kpd:45};
var REFK={hp:'hp',tc:'tc',pt:'pt',td:'td'};   /* chỉ số 'f' tính theo chỉ số thú nào */
/* Giá rèn theo vùng z (0..16): boss = Tinh Hoa, main = nguyên liệu chính của ô, shared = Linh Cốt, xu = Tinh Thạch */
function need(z){return {boss:1+Math.floor(z/6),main:5+Math.floor(z/4),shared:3+Math.floor(z/5),xu:40*(z+1)};}
/* Cường hóa (48-enh-ui.js, 46-enh-items.js) */
var ENH_TIERS=[[1,4],[5,7],[8,10],[11,13],[14,16]],ENH_TIER_MAX=6;
var ENH_RATE=[95,90,85,75,65,55,45,35,25,15],ENH_STONE_QTY=[1,1,2,2,3,3,4,4,5,5],ENH_XU_BASE=200,ENH_DROP_FROM=4,ENH_RB_PCT=5;
/* Rơi đồ (10-drops-shop.js + 46-enh-items.js) */
var DROP_MAT=[38,38,38,38,34],DROP_BOSS_MAT=65,DROP_LV=[.85,.95,1.05,1.15,1.25,1.35],DROP_TIER_NORMAL=[.7,1,1.3,1.7],DROP_TIER_BOSS=[1,1.3,1.7];
var ENH_DROP={mob:[6,6,10,15],boss:35,mobQty:[1,1],bossQty:[1,2],t6Zones:[15,17],t6Mul:.5,t6BossZone:17};   /* mob: % theo bậc quái Yếu/Thường/Tinh Anh/Thống Lĩnh */
/* Rank E..SR của nhánh -> bậc của main (0 Yếu/Trấn Thủ ... 3 Thống Lĩnh). Quái thường: E=Yếu, D/C=Thường, B/A=Tinh Anh, S/SS/SR=Thống Lĩnh. Boss: E/D/C=Trấn Thủ, B/A=Chúa Tể, S/SS/SR=Thiên Ma. */
var TIER_NORMAL={E:0,D:1,C:1,B:2,A:2,S:3,SS:3,SR:3},TIER_BOSS={E:0,D:0,C:0,B:1,A:1,S:2,SS:2,SR:2};
/* ===================== TIỆN ÍCH ===================== */
function clamp(x,a,b){return Math.max(a,Math.min(b,x));}
function r1(x){return Math.round(x*10)/10;}
function zbStart(z){return z===0?1:Math.ceil(z*100/NZ)+1;}   /* cấp bắt đầu của vùng (khớp VAN_KIEP_ZONE_BOUNDS của main, 100 cấp / 17 vùng) */
function zbEnd(z){return z===NZ-1?100:Math.ceil((z+1)*100/NZ);}
function zoneName(z){return ZN[z]?ZN[z][0]:'?';}
function zoneCol(z){var Q=root.TTG_QUAI_MAIN,i,zz;if(Q)for(i=0;i<Q.zones.length;i++){zz=Q.zones[i];if(zz.slug===ZN[z][1]&&zz.quai[0])return zz.quai[0].mauNhan||zz.quai[0].mauChuDao||'#ffd24a';}return '#ffd24a';}
function setName(z){return (root.TTGBO&&TTGBO.SETS&&TTGBO.SETS[z]&&TTGBO.SETS[z].ten)||('Bộ '+(z+1));}
function matId(z,s){return 'zm'+z+'_'+s;}
function bossId(z){return 'zb'+z;}
function ids(z,s){return {boss:bossId(z),main:matId(z,PIECE[s].cat),shared:matId(z,SHARED)};}
function pickW(w){var t=0,i,x;for(i=0;i<w.length;i++)t+=w[i];x=Math.random()*t;for(i=0;i<w.length-1;i++){x-=w[i];if(x<0)return i;}return w.length-1;}
function eqImg(z,s){return D+'trang-bi/img-eq-'+ZN[z][1]+'-'+PIECE[s].k+'.webp';}
function itemImg(id){var c=root.TTGBALO&&TTGBALO.CAT[id];return c&&c.img||'';}
/* ===================== NGUYÊN LIỆU + ĐÁ: đăng ký vào Balo ===================== */
function zoneMobs(z){var Q=root.TTG_QUAI_MAIN,i,out={normal:[],boss:null};if(!Q)return out;
  for(i=0;i<Q.zones.length;i++)if(Q.zones[i].slug===ZN[z][1]){Q.zones[i].quai.forEach(function(q){if(q.boss)out.boss=q;else out.normal.push(q);});out.normal.sort(function(a,b){return a.thuTuTrongVung-b.thuTuTrongVung;});}
  return out;}
function tierZones(t){var all=t>=ENH_TIER_MAX,a=all?1:ENH_TIERS[t-1][0],b=all?NZ:ENH_TIERS[t-1][1],o=[],v;for(v=a;v<=b;v++)o.push(v+'. '+zoneName(v-1));return o.join(' · ');}
function regItems(){
  if(!root.TTGBALO)return;var o={},z,s,Z,M;
  for(z=0;z<NZ;z++){Z=ZN[z];M=zoneMobs(z);
    for(s=0;s<5;s++){var mn=M.normal[s]?M.normal[s].ten:'';
      o[matId(z,s)]={loai:'nl',ten:(CATN[s].n+' '+mn).trim(),img:D+'nguyen-lieu/img-mat-'+Z[1]+'-'+CATN[s].t+'.webp',
        mo:'Nguyên liệu bộ '+Z[0]+(mn?', chỉ rơi từ '+mn:'')+'. '+(s<SHARED?'Dùng rèn '+PIECE[s].n+'.':'Dùng chung để rèn mọi món của bộ.')+' (Rèn)'};}
    o[bossId(z)]={loai:'nl',ten:'Tinh Hoa '+(M.boss?M.boss.ten:Z[0]),img:D+'nguyen-lieu/img-mat-'+Z[1]+'-essence.webp',
      mo:'Tinh hoa của chủ vùng '+Z[0]+(M.boss?', chỉ rơi từ boss '+M.boss.ten:'')+'. Dùng rèn mọi món của bộ. (Rèn)'};}
  for(s=1;s<=ENH_TIER_MAX;s++)o['da_ch'+s]={loai:'nl',ten:'Đá Cường Hóa bậc '+s,img:D+'cuong-hoa/img-enh-stone'+s+'.png',
    mo:(s===ENH_TIER_MAX?'Cường hóa trang bị của MỌI vùng, kể cả Thần Điện: ':'Cường hóa trang bị thuộc các vùng: ')+tierZones(s)+'. Dùng ở mục Cường hóa.'+(s===ENH_TIER_MAX?'':' Đá bậc '+ENH_TIER_MAX+' cũng thay được.')};
  o.ve_bao_ho={loai:'nl',ten:'Vé Bảo Hộ',img:D+'cuong-hoa/img-enh-ticket.png',mo:'Dùng khi cường hóa: thất bại không bị tụt cấp (từ +'+ENH_DROP_FROM+' trở lên).'};
  o.da_ngu_sac={loai:'nl',ten:'Đá Ngũ Sắc',img:D+'cuong-hoa/img-enh-rainbow.png',mo:'Bỏ vào khi cường hóa để tăng tỉ lệ thành công (+'+ENH_RB_PCT+'% mỗi viên, tối đa 100%).'};
  TTGBALO.reg(o);}
/* ===================== TRANG BỊ: chỉ số ===================== */
/* chỉ số thú điển hình của vùng z (cấp giữa vùng) để tính chỉ số cố định của trang bị */
function refStat(z,k){var C=root.TTGCS&&TTGCS.CFG,goc=(C&&C.goc)||{hp:150,tc:40,pt:30,td:40},hc=(C&&C.hsCap)||{hp:.07,tc:.07,pt:.07,td:.02},hz=(C&&C.hsVungMoiZ!=null)?C.hsVungMoiZ:.3,lv=(zbStart(z)+zbEnd(z))/2;
  return (goc[k]||0)*(1+(hc[k]||0)*(lv-1))*(1+hz*z);}
function val(z,k,q,r,b,e){var d=STATS[k],pct=b*(1+z*EQ.ZSTEP)*(1+QB[q])*r*(1+EQ.GAIN*(e||0));
  return d.t==='f'?Math.max(1,Math.round(refStat(z,REFK[k])*pct/100)):Math.round(pct*10)/10;}
/* mọi dòng của 1 món = [chỉ số mặc định] + [2 dòng bốc]; tính lại mỗi lần từ z/q/roll/cấp. Trả [[k,giá trị],...] */
function lines(it,e){e=e==null?(it.e||0):e;var m=PIECE[it.s],out=[[m.main,val(it.z,m.main,it.q,1,m.b,e)]];
  (it.L||[]).forEach(function(l){if(STATS[l[0]])out.push([l[0],val(it.z,l[0],it.q,l[1],STATS[l[0]].b,e)]);});return out;}
function lineTxt(l){var d=STATS[l[0]];return d.n+' +'+l[1]+(d.t==='p'?'%':'');}
function mainRange(z,s){var m=PIECE[s],a=val(z,m.main,0,1,m.b),b=val(z,m.main,4,1,m.b),p=STATS[m.main].t==='p'?'%':'';return STATS[m.main].n+' +'+a+(a===b?'':'~'+b)+p;}
function pickKeys(excl,n){var pool=Object.keys(STATS).filter(function(k){return k!==excl;}).map(function(k){return [k,W[k]||1];}),out=[],i,j,x,t;
  for(i=0;i<n&&pool.length;i++){t=0;pool.forEach(function(p){t+=p[1];});x=Math.random()*t;for(j=0;j<pool.length-1;j++){x-=pool[j][1];if(x<0)break;}out.push(pool.splice(j,1)[0][0]);}
  return out;}
function roll(z,s,q){var L=pickKeys(PIECE[s].main,EQ.LINES).map(function(k){return [k,Math.round((EQ.ROLL[0]+Math.random()*(EQ.ROLL[1]-EQ.ROLL[0]))*1000)/1000];});return {z:z,s:s,q:q,e:0,L:L};}
/* các trường hiển thị của 1 món (tên, ảnh, mô tả, ô, bộ, cấp mặc) - dựng lại mỗi lần đổi cấp cường hóa */
function decor(it){var P=PIECE[it.s];
  return {id:'eq-'+it.z+'-'+P.k,ten:'['+QN[it.q]+'] '+P.n+' '+zoneName(it.z)+(it.e?' +'+it.e:''),img:eqImg(it.z,it.s),slot:P.slot,bo:it.z,lv:zbStart(it.z),
    mo:'Bộ '+setName(it.z)+' · mặc từ cấp '+zbStart(it.z)+' · '+lines(it).map(lineTxt).join(' · ')};}
/* tổng chỉ số của món ĐANG MẶC (khóa của main) */
function tong(){var T={},k;for(k in STATS)T[k]=0;
  try{(root.TTGTB&&TTGTB.dangMac?TTGTB.dangMac():[]).forEach(function(it){if(it&&it.z!=null&&it.L&&PIECE[it.s])lines(it).forEach(function(l){T[l[0]]=r1((T[l[0]]||0)+l[1]);});});}catch(e){}
  return T;}
/* cộng trang bị vào chỉ số thú trong trận (gọi ở startExplore, index.html): số cố định cộng thẳng, chỉ số % có trần tổng như main */
function apDung(ps){if(!ps)return ps;var T=tong(),o=Object.assign({},ps),k;
  for(k in STATS){if(!T[k])continue;
    if(STATS[k].t==='f')o[k]=Math.round((o[k]||0)+T[k]);
    else{o[k]=r1((o[k]||0)+T[k]);if(CAPS[k]!=null)o[k]=Math.min(CAPS[k],o[k]);}}
  return o;}
/* ===================== RÈN (fgDo) ===================== */
function check(z,s){var n=need(z),I=ids(z,s),miss=[],ok=true;
  ['boss','main','shared'].forEach(function(k){var have=root.TTGBALO?TTGBALO.count(I[k]):0;if(have<n[k]){ok=false;miss.push((root.TTGBALO&&TTGBALO.CAT[I[k]]?TTGBALO.CAT[I[k]].ten:I[k])+' ('+have+'/'+n[k]+')');}});
  var tt=root.TTGTIEN?TTGTIEN.get('tt'):0;if(tt<n.xu){ok=false;miss.push('Tinh Thạch ('+tt+'/'+n.xu+')');}
  return {ok:ok,miss:miss,need:n,ids:I};}
function ren(z,s){
  if(!root.TTGBALO||!root.TTGTIEN||!root.TTGTB)return {err:'Chưa nạp đủ hệ thống'};
  if(!(z>=0&&z<NZ)||!PIECE[s])return {err:'Chưa chọn bộ trang bị'};
  var c=check(z,s);if(!c.ok)return {err:'Chưa đủ: '+c.miss.join(', ')+'.'};
  if(TTGTB.list().length>=EQ.BAG)return {err:'Kho trang bị đã đầy ('+EQ.BAG+' ô). Hãy vứt bớt.'};
  ['boss','main','shared'].forEach(function(k){TTGBALO.add(c.ids[k],-c.need[k]);});
  TTGTIEN.add('tt',-c.need.xu);
  var q=pickW(QW),it=roll(z,s,q),t=Object.assign({},it,decor(it)),uid=TTGTB.addItem(t);
  return {uid:uid,item:TTGTB.get(uid),q:q,need:c.need};}
/* ===================== CƯỜNG HÓA (48-enh-ui.js) ===================== */
function tierOf(z){var v=z+1,i;for(i=0;i<ENH_TIERS.length;i++)if(v>=ENH_TIERS[i][0]&&v<=ENH_TIERS[i][1])return [i+1,ENH_TIER_MAX];return [ENH_TIER_MAX];}
function enhNeed(e){return {stone:ENH_STONE_QTY[e],xu:ENH_XU_BASE*(e+1)};}
function rateAt(e,rb){return Math.min(100,ENH_RATE[e]+ENH_RB_PCT*(rb||0));}
function rbMax(e){return Math.max(0,Math.ceil((100-ENH_RATE[e])/ENH_RB_PCT));}
/* roll ∈ [0,100). Thành công +1. Thất bại: từ +4 trở lên tụt 1 cấp (trừ khi có vé: giữ cấp, mất 1 vé); dưới +4 giữ cấp, KHÔNG mất vé. */
function resolve(e,r,ticket,rate){if(r<rate)return {ok:true,e2:e+1,saved:false};if(e>=ENH_DROP_FROM)return ticket?{ok:false,e2:e,saved:true}:{ok:false,e2:e-1,saved:false};return {ok:false,e2:e,saved:false};}
function cuongHoa(uid,o){o=o||{};
  if(!root.TTGBALO||!root.TTGTIEN||!root.TTGTB)return {err:'Chưa nạp đủ hệ thống'};
  var it=TTGTB.get(uid);if(!it||it.z==null||!PIECE[it.s])return {err:'Hãy chọn một món trang bị trước.'};
  var e=it.e||0;if(e>=EQ.MAX)return {err:'Món này đã đạt cấp tối đa +'+EQ.MAX+'.'};
  var tiers=tierOf(it.z),tier=tiers.indexOf(o.tier)>=0?o.tier:tiers[0],sid='da_ch'+tier,n=enhNeed(e),have=TTGBALO.count(sid),tt=TTGTIEN.get('tt');
  if(have<n.stone)return {err:'Chưa đủ '+TTGBALO.CAT[sid].ten+' ('+have+'/'+n.stone+').'};
  if(tt<n.xu)return {err:'Không đủ Tinh Thạch: cần '+n.xu+', bạn có '+tt+'.'};
  var rb=Math.min(o.rb|0,TTGBALO.count('da_ngu_sac'),rbMax(e)),rate=rateAt(e,rb),ticket=!!o.ticket&&TTGBALO.count('ve_bao_ho')>0;
  TTGBALO.add(sid,-n.stone);if(rb>0)TTGBALO.add('da_ngu_sac',-rb);TTGTIEN.add('tt',-n.xu);   /* trừ đá + xu TRƯỚC khi roll (thành công hay thất bại đều mất) */
  var r=resolve(e,Math.random()*100,ticket,rate);if(r.saved)TTGBALO.add('ve_bao_ho',-1);   /* vé chỉ mất khi thật sự cứu được cấp */
  it.e=r.e2;var p=decor(it);p.e=r.e2;TTGTB.update(uid,p);
  return {ok:r.ok,saved:r.saved,e:e,e2:r.e2,rate:rate,rb:rb,need:n,tier:tier,item:TTGTB.get(uid)};}
/* ===================== RƠI ĐỒ (dropRates + enhDropRates) ===================== */
function rates(enemy,bonus){bonus=bonus||1;var out=[];if(!enemy||enemy.source!=='main')return out;
  var z=clamp(Math.floor(+enemy.vung||0),0,NZ-1),boss=!!enemy.boss,rec=enemy.record||{},slot=boss?-1:clamp((rec.thuTuTrongVung||1)-1,0,4),
    off=clamp(Math.floor((+enemy.lv||1)-zbStart(z)),0,5),bac=enemy.bac||'C',
    ti=boss?(TIER_BOSS[bac]!=null?TIER_BOSS[bac]:0):(TIER_NORMAL[bac]!=null?TIER_NORMAL[bac]:1),tm=boss?DROP_TIER_BOSS[ti]:DROP_TIER_NORMAL[ti],v=z+1,t;
  if(boss)out.push({id:bossId(z),p:Math.min(95,DROP_BOSS_MAT*DROP_LV[off]*tm*bonus),q:[ti>=2?2:1,ti>=2?2:1]});
  else out.push({id:matId(z,slot),p:Math.min(95,DROP_MAT[slot]*DROP_LV[off]*tm*bonus),q:[1,1]});
  var base=boss?ENH_DROP.boss:ENH_DROP.mob[ti],q=boss?ENH_DROP.bossQty:ENH_DROP.mobQty;
  for(t=1;t<=ENH_TIERS.length;t++)if(v>=ENH_TIERS[t-1][0]&&v<=ENH_TIERS[t-1][1])out.push({id:'da_ch'+t,p:Math.min(95,base*bonus),q:q});
  if(v>=ENH_DROP.t6Zones[0]&&v<=ENH_DROP.t6Zones[1])out.push({id:'da_ch'+ENH_TIER_MAX,p:Math.min(95,base*((boss&&v===ENH_DROP.t6BossZone)?1:ENH_DROP.t6Mul)*bonus),q:q});
  return out;}
/* tung rơi đồ khi THẮNG 1 địch, cộng thẳng vào Balo. mm = chỉ số May Mắn của thú bạn (nhân tỉ lệ như sách boss: x(1+mm/100), tối đa x3). Trả [{id,q}] */
function roiDo(enemy,mm){var out=[];if(!root.TTGBALO)return out;var bonus=Math.min(3,1+Math.max(0,+mm||0)/100);
  try{rates(enemy,bonus).forEach(function(d){if(Math.random()*100<d.p){var q=d.q[0]+Math.floor(Math.random()*(d.q[1]-d.q[0]+1));TTGBALO.add(d.id,q);out.push({id:d.id,q:q});}});}catch(e){}
  return out;}
function moTa(list){return (list||[]).map(function(d){var c=root.TTGBALO&&TTGBALO.CAT[d.id];return (c?c.ten:d.id)+' x'+d.q;}).join(', ');}
/* ===================== THỬ ===================== */
var demoOn=/[?&]luat=demo/.test(location.search),demoDone=false;
function demo(){if(!demoOn||demoDone||!root.TTGBALO)return;try{if(sessionStorage.getItem('ttg_luat_demo'))return;sessionStorage.setItem('ttg_luat_demo','1');}catch(e){}
  demoDone=true;var z,s,n,t;for(z=0;z<NZ;z++){n=need(z);TTGBALO.add(bossId(z),n.boss*PIECE.length);for(s=0;s<4;s++)TTGBALO.add(matId(z,s),n.main);TTGBALO.add(matId(z,SHARED),n.shared*PIECE.length);}
  for(t=1;t<=ENH_TIER_MAX;t++)TTGBALO.add('da_ch'+t,30);TTGBALO.add('ve_bao_ho',10);TTGBALO.add('da_ngu_sac',30);if(root.TTGTIEN)TTGTIEN.add('tt',20000);}
regItems();
root.TTGLT={ZN:ZN,PIECE:PIECE,CATN:CATN,QN:QN,QC:QC,QB:QB,EQ:EQ,STATS:STATS,ENH:{MAX:EQ.MAX,RATE:ENH_RATE,DROP_FROM:ENH_DROP_FROM,RB_PCT:ENH_RB_PCT,TIER_MAX:ENH_TIER_MAX},
  need:need,ids:ids,check:check,ren:ren,cuongHoa:cuongHoa,tierOf:tierOf,enhNeed:enhNeed,rateAt:rateAt,rbMax:rbMax,resolve:resolve,tierZones:tierZones,
  lines:lines,lineTxt:lineTxt,mainRange:mainRange,decor:decor,tong:tong,apDung:apDung,rates:rates,roiDo:roiDo,moTa:moTa,
  zoneName:zoneName,zoneCol:zoneCol,setName:setName,zbStart:zbStart,eqImg:eqImg,itemImg:itemImg,regItems:regItems,demo:demo};
})(typeof window!=='undefined'?window:globalThis);
