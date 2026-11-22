/* Test độ hiếm loài: node tools/test-do-hiem.js */
global.window=global;require('../game-moi/56b-loai.js');
var C=global.TTGCS,ok=0,bad=0;function t(n,c){if(c){ok++;}else{bad++;console.log('LỖI:',n);}}
var tong={};
for(var z=0;z<=5;z++){var ds=C.dsLoai(z),dem={};
  ds.forEach(function(o){var k=C.doHiem(o.id);dem[k]=(dem[k]||0)+1;});
  t('vùng '+z+' 3 Thường',dem.thuong===3);t('vùng '+z+' 3 Hiếm',dem.hiem===3);t('vùng '+z+' 2 Sử Thi',dem.suthi===2);
  t('vùng '+z+' 1 Huyền Thoại',dem.huyenthoai===1);t('vùng '+z+' boss Truyền Thuyết',C.doHiem(ds[9].id)==='truyenthuyet');
  var ws=ds.filter(function(o){return !o.boss;}).map(function(o){return C.hiemInfo(o.id).ts;}),sum=ws.reduce(function(a,b){return a+b;},0);
  tong=ws.map(function(w){return (w/sum*100).toFixed(1)+'%';});
  if(z===0)console.log('Tỉ lệ gặp vùng 0:',ds.slice(0,9).map(function(o,i){return o.id+' '+C.hiemInfo(o.id).ten+' '+tong[i];}).join(' | '));}
['k1','k2','k3'].forEach(function(id){t(id+' Thường',C.doHiem(id)==='thuong');});
t('id lạ -> null',C.doHiem('zz')===null&&C.hiemInfo('zz')===null);
console.log(ok+' đạt, '+bad+' lỗi');process.exit(bad?1:0);
