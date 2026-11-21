(function(root){
'use strict';
function clamp(x,a,b){return Math.max(a,Math.min(b,x));}
function randint(a,b,rng){return a+Math.floor(rng()*(b-a+1));}
function weighted(items,weights,rng){var total=0,i,w;for(i=0;i<items.length;i++){w=Math.max(0,Number(weights[i])||0);total+=w;}if(!items.length)return null;if(total<=0)return items[0];var x=rng()*total;for(i=0;i<items.length;i++){x-=Math.max(0,Number(weights[i])||0);if(x<0)return items[i];}return items[items.length-1];}
function createEncounter(player,rng){
  rng=typeof rng==='function'?rng:Math.random;
  if(!player||!root.TTGCS||!root.TTGBONG||!root.THU_MOI||!root.TTG_QUAI_MAIN)return null;
  var cfg=root.TTGBONG.CFG.tx||{},species=root.TTGCS.loai(player.id),z=species&&species.vung!=null?species.vung:0;
  var demoZone=null,i;for(i=0;i<root.THU_MOI.zones.length;i++)if(root.THU_MOI.zones[i].z===z){demoZone=root.THU_MOI.zones[i];break;}
  if(!demoZone)return null;
  var mainZone=null;for(i=0;i<root.TTG_QUAI_MAIN.zones.length;i++)if(root.TTG_QUAI_MAIN.zones[i].slug===demoZone.slug){mainZone=root.TTG_QUAI_MAIN.zones[i];break;}
  if(!mainZone)return null;
  var boss=rng()<(Number(cfg.tiLeBoss)||0),source;
  if(boss){var bw=cfg.trongSoBoss||{main:1,demo:1};source=weighted(['main','demo'],[bw.main,bw.demo],rng);}
  else{var mainShare=Number(cfg.tiLeQuaiMain);if(!isFinite(mainShare))mainShare=0.5;source=rng()<mainShare?'main':'demo';}
  var candidates,weights,q;
  if(source==='main'){candidates=mainZone.quai.filter(function(x){return !!x.boss===boss;});weights=boss?candidates.map(function(){return 1;}):(cfg.trongSoQuaiMain||[]);}
  else{candidates=demoZone.thu.filter(function(x){return !!x.boss===boss;});weights=boss?candidates.map(function(){return 1;}):(cfg.trongSoLoai||[]);}
  q=weighted(candidates,weights,rng);if(!q)return null;
  var playerLv=clamp(Math.floor(Number(player.lv)||1),1,Number(cfg.capMax)||100),delta=boss?[Number(cfg.chenhBoss)||10,Number(cfg.chenhBoss)||10]:(source==='main'?(cfg.chenhQuai||[-5,0]):(cfg.chenhThuong||[-2,10]));
  var lv=clamp(playerLv+randint(Number(delta[0]),Number(delta[1]),rng),Number(cfg.capMin)||1,Number(cfg.capMax)||100);
  var tien=boss?Number(cfg.bacBoss||3):(source==='demo'?weighted([1,2,3],[Number((cfg.trongSoBac||{})[1])||0,Number((cfg.trongSoBac||{})[2])||0,Number((cfg.trongSoBac||{})[3])||0],rng):1);
  /* RANK (bậc) khi đánh: QUÁI thường tung ngẫu nhiên E..SS theo bảng tỉ lệ TTGCS.CFG.bac (có quái yếu, quái mạnh; hs hp/tc/pt/td 0,85..1,35). Boss quái cố định bacBoss. Thú hoang (và boss thú hoang) giữ bậc cố định, KHÔNG hiện rank (bắt xong mới tung bậc thật). */
  var bacCS=root.TTGCS.CFG,bac=boss?(bacCS.bacBoss||'A'):(source==='demo'?(bacCS.bacThuHoang||'C'):(typeof root.TTGCS.tungBac==='function'?root.TTGCS.tungBac(rng):(bacCS.bacQuai||'C')));
  var stats=root.TTGCS.tinh({id:q.id,lv:lv,tien:tien,bac:bac,boss:boss,vung:z,vai:source==='main'?'canbang':undefined});
  return {id:q.id,ten:q.ten,source:source,boss:boss,lv:lv,tien:tien,bac:bac,hienBac:source==='main',vung:z,zoneSlug:demoZone.slug,stats:stats,record:q};
}
root.TTGTHAMHIEM={createEncounter:createEncounter};
})(typeof window!=='undefined'?window:globalThis);