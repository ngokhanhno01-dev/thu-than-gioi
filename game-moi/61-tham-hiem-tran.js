(function(root){
'use strict';
function clamp(x,a,b){return Math.max(a,Math.min(b,x));}
function randint(a,b,rng){return a+Math.floor(rng()*(b-a+1));}
function weighted(items,weights,rng){var total=0,i,w;for(i=0;i<items.length;i++){w=Math.max(0,Number(weights[i])||0);total+=w;}if(!items.length)return null;if(total<=0)return items[0];var x=rng()*total;for(i=0;i<items.length;i++){x-=Math.max(0,Number(weights[i])||0);if(x<0)return items[i];}return items[items.length-1];}
function createEncounter(player,rng,opts){
  rng=typeof rng==='function'?rng:Math.random;opts=opts||{};
  if(!player||!root.TTGCS||!root.TTGBONG||!root.THU_MOI||!root.TTG_QUAI_MAIN)return null;
  if(opts.than!=null){   /* BOSS THẦN THẾ GIỚI (103): không thuộc vùng đang chơi; cấp 270, V3, Rank TUNG mỗi trận (E..SR như thú hoang; máu toàn cục là TỈ LỆ nên Rank không ảnh hưởng), nền theo thú Thần */
    var tn=root.THU_MOI.than,tq=tn&&tn.thu.filter(function(x){return x.id===String(opts.than);})[0];
    if(!tq)return null;
    var tbac=typeof root.TTGCS.tungBac==='function'?root.TTGCS.tungBac(rng):(root.TTGCS.CFG.bacQuai||'C');
    return {id:tq.id,ten:tq.ten,source:'demo',boss:true,than:true,lv:270,tien:3,variant:'V3',bac:tbac,hienBac:true,vung:tn.z,zoneSlug:tq.nen||tn.slug,rarity:'truyenthuyet',
      stats:root.TTGCS.tinh({id:tq.id,lv:270,tien:3,bac:tbac,boss:true,vung:tn.z}),record:tq};}
  var cfg=root.TTGBONG.CFG.tx||{},species=root.TTGCS.loai(player.id),z=species&&species.vung!=null?species.vung:0;
  if(root.TTGDV&&root.TTGDV.vung)z=root.TTGDV.vung();
  var demoZone=null,i;for(i=0;i<root.THU_MOI.zones.length;i++)if(root.THU_MOI.zones[i].z===z){demoZone=root.THU_MOI.zones[i];break;}
  var mainZone=null;for(i=0;i<root.TTG_QUAI_MAIN.zones.length;i++){var mz=root.TTG_QUAI_MAIN.zones[i];if((demoZone&&mz.slug===demoZone.slug)||(!demoZone&&Number(mz.soVung)===Number(z)+1)){mainZone=mz;break;}}
  if(!demoZone&&!mainZone)return null;
  var zoneSlug=demoZone?demoZone.slug:mainZone.slug;
  var forcedId=opts.bossId!=null?String(opts.bossId):null,auto=opts.encounter==='auto'||opts.khu!=null;
  var area=clamp(Math.floor(Number(opts.khu)||1),1,4),boss=opts.boss===true||forcedId!==null,source=null,candidates=[],weights=[],q,hiem=opts.hiem||null;
  if(forcedId!==null){source='main';candidates=mainZone?mainZone.quai.filter(function(x){return !!x.boss&&String(x.id)===forcedId;}):[];if(!candidates.length&&demoZone){source='demo';candidates=demoZone.thu.filter(function(x){return !!x.boss&&String(x.id)===forcedId;});}if(!candidates.length)return null;weights=candidates.map(function(){return 1;});boss=true;}
  else if(auto){
    if(area===4&&mainZone&&rng()<(Number(cfg.tiLeBoss)||0)){source='main';boss=true;candidates=mainZone.quai.filter(function(x){return !!x.boss;});weights=candidates.map(function(){return 1;});hiem='truyenthuyet';}
    else{boss=false;source=mainZone&&(!demoZone||rng()<(Number(cfg.tiLeQuaiMain)||0.7))?'main':'demo';
      if(source==='main'&&mainZone){candidates=mainZone.quai.filter(function(x){if(x.boss)return false;var key=x.doHiem||x.hiem||null,order=Number(x.thuTuTrongVung)||0;if(!key)key=order<=2?'thuong':order===3?'hiem':order===4?'suthi':'huyenthoai';return !hiem||key===hiem;});weights=candidates.map(function(){return 1;});}
      else if(demoZone){candidates=demoZone.thu.filter(function(x){if(x.boss)return false;var h=root.TTGCS.hiemInfo&&root.TTGCS.hiemInfo(x.id);return !hiem||(h&&h.key===hiem);});weights=candidates.map(function(x,k){var h=root.TTGCS.hiemInfo&&root.TTGCS.hiemInfo(x.id);return h?h.ts:((cfg.trongSoLoai||[])[k]||1);});}
      if(!candidates.length){source=source==='main'?'demo':'main';if(source==='main'&&mainZone){candidates=mainZone.quai.filter(function(x){return !x.boss;});weights=candidates.map(function(){return 1;});}else if(demoZone){candidates=demoZone.thu.filter(function(x){return !x.boss;});weights=candidates.map(function(x,k){var h=root.TTGCS.hiemInfo&&root.TTGCS.hiemInfo(x.id);return h?h.ts:((cfg.trongSoLoai||[])[k]||1);});}}
    }
  }else{if(boss){if(!mainZone)return null;source='main';candidates=mainZone.quai.filter(function(x){return !!x.boss;});weights=candidates.map(function(){return 1;});}else{source=mainZone&&(!demoZone||rng()<(Number(cfg.tiLeQuaiMain)||0.7))?'main':'demo';candidates=source==='main'?mainZone.quai.filter(function(x){return !x.boss;}):demoZone.thu.filter(function(x){return !x.boss;});weights=candidates.map(function(x,k){var h=root.TTGCS.hiemInfo&&root.TTGCS.hiemInfo(x.id);return h?h.ts:((cfg.trongSoLoai||[])[k]||1);});}}
  if(opts.chon){ /* con thú đã hiện sẵn trên map thám hiểm: ép đúng con đó; không tìm thấy thì giữ kết quả tung thường */
    var ch=opts.chon,list=ch.source==='main'?(mainZone&&mainZone.quai):(demoZone&&demoZone.thu),fix=(list||[]).filter(function(x){return String(x.id)===String(ch.id);})[0];
    if(fix){source=ch.source;boss=!!ch.boss;candidates=[fix];weights=[1];if(boss)hiem='truyenthuyet';}
  }
  q=weighted(candidates,weights,rng);if(!q)return null;
  var bands={thuong:[1,4],hiem:[4,8],suthi:[8,12],huyenthoai:[12,16],truyenthuyet:[17,17]},tier=boss?'truyenthuyet':null;
  if(source==='main'&&!boss){var ord=Number(q.thuTuTrongVung)||0;tier=q.doHiem||q.hiem||(ord<=2?'thuong':ord===3?'hiem':ord===4?'suthi':'huyenthoai');}
  if(source==='demo'&&!boss){var qi=root.TTGCS.hiemInfo&&root.TTGCS.hiemInfo(q.id);tier=qi&&qi.key||hiem||'thuong';}if(!bands[tier])tier='thuong';
  var cap=270; /* Trần Danh Vọng áp dụng cho THÚ NGƯỜI CHƠI; địch giữ dải cấp riêng theo vùng/độ hiếm. */
  var base=Math.max(0,Math.floor(Number(z)||0))*15,lv=clamp(randint(base+bands[tier][0],base+bands[tier][1],rng),1,cap);
  var tien=weighted([1,2,3],[Number((cfg.trongSoBac||{})[1])||1,Number((cfg.trongSoBac||{})[2])||1,Number((cfg.trongSoBac||{})[3])||1],rng);
  if(opts.chon&&opts.chon.tien&&String(opts.chon.id)===String(q.id))tien=opts.chon.tien;
  if(boss)tien=Math.max(1,Math.min(3,Number(cfg.bacBoss)||3));   /* Boss (thú & quái) luôn V3 khi đánh; bắt về theo bacKhiBat (V1) ở 62 */
  var bacCS=root.TTGCS.CFG,bac=typeof root.TTGCS.tungBac==='function'?root.TTGCS.tungBac(rng):(bacCS.bacQuai||'C');
  var stats=root.TTGCS.tinh({id:q.id,lv:lv,tien:tien,bac:bac,boss:boss,vung:z,vai:source==='main'?'canbang':undefined});
  return {id:q.id,ten:q.ten,source:source,boss:boss,lv:lv,tien:tien,variant:'V'+tien,bac:bac,hienBac:true,vung:z,zoneSlug:zoneSlug,rarity:tier,stats:stats,record:q};
}
root.TTGTHAMHIEM={createEncounter:createEncounter};
})(typeof window!=='undefined'?window:globalThis);
