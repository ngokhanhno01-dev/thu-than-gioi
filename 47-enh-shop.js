/* ===== 47-enh-shop.js — [CUONG HOA 3] Cửa hàng bán Vé Bảo Hộ và Đá Ngũ Sắc =====
   Nạp NGAY SAU 46-enh-items.js. Không sửa 10-drops-shop.js và KHÔNG đụng POTIONS (3 thuốc cũ giữ nguyên):
   chỉ bọc shopRestock() và shopList() để thêm 2 món vào cùng kho hàng; shopBuy()/renderShop() cũ tự dùng chung
   (mua ×1, ×5, hết hàng, thiếu xu, đầy balo, làm mới 30 phút xử lý y như thuốc). Mọi con số sửa ở khối dưới. */
const ENH_SHOP=[
 {id:'ve_bao_ho', price:1000, stock:10},   /* Vé Bảo Hộ: 1.000 xu, mỗi lần nhập 10 vé */
 {id:'da_ngu_sac',price:1500, stock:10}];  /* Đá Ngũ Sắc: 1.500 xu, mỗi lần nhập 10 viên */
for(const S of ENH_SHOP)SHOP_STOCK[S.id]=S.stock;
{const _rs=shopRestock;
 shopRestock=function(){_rs.apply(this,arguments);for(const S of ENH_SHOP)shopStock[S.id]=SHOP_STOCK[S.id]||0}}
{const _sl=shopList;
 shopList=function(){return _sl.apply(this,arguments).concat(ENH_SHOP.map(S=>({id:S.id,p:S.price,s:shopStock[S.id],m:SHOP_STOCK[S.id]||0})))}}
shopRestock();   /* nhập sẵn lần đầu (không đổi đồng hồ làm mới) */
