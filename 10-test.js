/* ===== BẢN TEST: tặng sẵn nguyên liệu. Test xong: đổi true -> false (hoặc xóa dòng script 10-test.js trong index.html) ===== */
const TEST_MODE=true;
if(TEST_MODE){
  addItem('huyet',30);addItem('thuoc',80);
  gold=5000;stats();
  const _hatchT=hatch;
  hatch=function(){_hatchT();addItem('mat'+pet.sp,60)};
  log('🧪 [Bản test] Đã tặng 30 Giọt Huyết Mạch, 80 Linh Thảo, 5000 xu. Nở thú sẽ tặng thêm 60 Tinh Hoa đúng vùng.');
}
