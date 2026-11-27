/* ===== 106-thong-bao-roi.js (TTGDROP): THÔNG BÁO NHẬN / RƠI VẬT PHẨM (27/11/2026) =====
   Thẻ thông báo gọn: [ICON có viền phát sáng] + dòng nhỏ (tiêu đề + nhãn độ hiếm) + TÊN VẬT PHẨM tô màu theo độ hiếm + nguồn / số lượng.
   Màu theo độ hiếm (khớp màu Rank của 64-thong-bao.js): E trắng, D xanh lá, C lam, B tím, A vàng, S cam, SS đỏ, SR + THẦN = 7 MÀU CẦU VỒNG (chữ chạy màu, viền chạy màu, hạt lấp lánh, nháy sáng màn hình).
   Bậc độ hiếm thú (thuong/hiem/suthi/huyenthoai/truyenthuyet) cũng dùng được trong tham số muc.
   API:
     TTGDROP.show({ten, so, muc, tieude, nhan, nguon, icon, fb, ms})   // hiện 1 thẻ; muc = 'E'|'D'|'C'|'B'|'A'|'S'|'SS'|'SR'|'than'|'thuong'|'hiem'|'suthi'|'huyenthoai'|'truyenthuyet'
                                                                      // icon = đường dẫn ảnh (hoặc emoji); fb = emoji dự phòng khi ảnh lỗi/thiếu
     TTGDROP.tenHtml('Trứng Đế Giang','than')                          // trả HTML tên đã tô màu (dùng trong câu, thanh chạy chữ...)
     TTGDROP.M                                                         // bảng màu
   Nạp động từ 104-trung-than.js / 105-bao-boss-than.js (không cần sửa index.html). */
(function (root) {
  'use strict';
  var D = root.document;
  if (!D || root.TTGDROP) return;
  var RAINBOW = '#ff3b3b,#ff9a1f,#ffe600,#3dff6a,#00d0ff,#4d6bff,#c13bff,#ff3b3b';
  var M = {
    E:  { nhan: 'Thường',       c: '#ffffff', rgb: '255,255,255' },
    D:  { nhan: 'Khá',          c: '#39ff14', rgb: '57,255,20' },
    C:  { nhan: 'Hiếm',         c: '#3de0ff', rgb: '61,224,255' },
    B:  { nhan: 'Rất hiếm',     c: '#dd77ff', rgb: '204,51,255', hi: 1 },
    A:  { nhan: 'Sử thi',       c: '#ffe600', rgb: '255,230,0', hi: 1 },
    S:  { nhan: 'Huyền thoại',  c: '#ff8000', rgb: '255,128,0', hi: 1 },
    SS: { nhan: 'Truyền thuyết',c: '#ff1744', rgb: '255,23,68', hi: 1 },
    SR: { nhan: 'Cực phẩm',     c: '#ff4fd8', rgb: '255,64,64', hi: 1, rb: 1 },
    than: { nhan: 'Thần phẩm',  c: '#ff4fd8', rgb: '255,64,64', hi: 1, rb: 1 }
  };
  M.thuong = M.E; M.hiem = M.C; M.suthi = M.B; M.huyenthoai = M.A; M.truyenthuyet = M.S;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var css = [
    '#tdr-box{position:fixed;left:50%;top:0;transform:translateX(-50%);padding-top:calc(env(safe-area-inset-top,0px) + 4vh);z-index:400;display:flex;flex-direction:column;gap:8px;align-items:center;pointer-events:none;width:min(94vw,440px);font-family:"Noto Serif","Palatino Linotype",Georgia,serif}',
    '.tdr{position:relative;display:flex;align-items:center;gap:12px;width:100%;box-sizing:border-box;padding:10px 14px 10px 10px;border-radius:14px;color:#fff;background:linear-gradient(160deg,rgba(20,26,80,.95),rgba(6,8,36,.97));border:2px solid rgb(var(--rgb));box-shadow:0 0 14px rgba(var(--rgb),.7),inset 0 0 14px rgba(var(--rgb),.25);animation:tdr-in .3s cubic-bezier(.2,1.4,.4,1)}',
    '.tdr.hi{box-shadow:0 0 22px rgba(var(--rgb),.9),0 0 44px rgba(var(--rgb),.45),inset 0 0 18px rgba(var(--rgb),.35)}',
    '.tdr.out{animation:tdr-out .35s ease-in forwards}',
    '@keyframes tdr-in{from{opacity:0;transform:translateY(-18px) scale(.9)}to{opacity:1;transform:none}}',
    '@keyframes tdr-out{to{opacity:0;transform:translateY(-12px) scale(.96)}}',
    '.tdr-ic{position:relative;flex:none;width:60px;height:60px;border-radius:12px;border:2px solid rgb(var(--rgb));background:radial-gradient(circle,rgba(var(--rgb),.38),rgba(6,8,36,.92));box-shadow:0 0 10px rgba(var(--rgb),.7);display:flex;align-items:center;justify-content:center;font-size:34px;line-height:1;overflow:hidden}',
    '.tdr-ic img{width:90%;height:90%;object-fit:contain;display:block}',
    '.tdr-tx{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}',
    '.tdr-hd{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:800;letter-spacing:.05em;color:#b9c6ff;text-transform:uppercase}',
    '.tdr-tag{padding:1px 8px;border-radius:9px;font-size:11px;font-weight:800;letter-spacing:0;color:#0a0c28;background:rgb(var(--rgb))}',
    '.tdr-nm{font-size:18px;font-weight:800;line-height:1.2;color:rgb(var(--rgb));text-shadow:0 0 8px rgba(var(--rgb),.85),0 1px 0 #000;overflow-wrap:anywhere}',
    '.tdr.hi .tdr-nm{font-size:20px}',
    '.tdr-sb{font-size:12px;font-weight:600;color:#cfd6ff;line-height:1.25}',
    '.tdr-sl{flex:none;font-size:20px;font-weight:800;color:#fff3c4;text-shadow:0 1px 0 #000}',
    /* 7 MÀU: chữ, viền, glow, hạt */
    '.rbt{background:linear-gradient(90deg,' + RAINBOW + ') 0 0/200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent!important;-webkit-text-fill-color:transparent;text-shadow:none!important;filter:drop-shadow(0 1px 0 rgba(0,0,0,.85));animation:tdr-t 2s linear infinite}',
    '@keyframes tdr-t{to{background-position:200% 0}}',
    '.tdr.rb{border:2px solid transparent;background:linear-gradient(160deg,#10165a,#060824) padding-box,linear-gradient(90deg,' + RAINBOW + ') border-box;background-size:auto,300% 100%;animation:tdr-in .3s cubic-bezier(.2,1.4,.4,1),tdr-bg 3s linear infinite;box-shadow:none}',
    '@keyframes tdr-bg{to{background-position:0 0,300% 0}}',
    '.tdr.rb::after{content:"";position:absolute;left:-3px;top:-3px;right:-3px;bottom:-3px;border-radius:17px;box-shadow:0 0 18px 3px #ff3b3b,0 0 40px 6px rgba(255,60,60,.45);animation:tdr-hue 3s linear infinite;pointer-events:none;z-index:-1}',
    '@keyframes tdr-hue{to{filter:hue-rotate(360deg)}}',
    '.tdr.rb .tdr-ic{border:2px solid transparent;background:linear-gradient(#141a66,#070a2c) padding-box,linear-gradient(135deg,' + RAINBOW + ') border-box;box-shadow:none}',
    '.tdr.rb .tdr-tag{background:linear-gradient(90deg,' + RAINBOW + ') 0 0/200% 100%;animation:tdr-t 2s linear infinite}',
    '.tdr-sp{position:absolute;left:0;top:0;right:0;bottom:0;pointer-events:none}',
    '.tdr-sp i{position:absolute;width:6px;height:6px;border-radius:50%;opacity:0;animation:tdr-sp 1.5s ease-in-out infinite}',
    '@keyframes tdr-sp{0%{opacity:0;transform:translateY(6px) scale(.4)}40%{opacity:1}100%{opacity:0;transform:translateY(-22px) scale(1.1)}}',
    '.tdr-fl{position:fixed;left:0;top:0;right:0;bottom:0;z-index:399;pointer-events:none;background:radial-gradient(circle at 50% 14%,rgba(255,255,255,.55),rgba(255,80,200,.18) 38%,transparent 72%);animation:tdr-fl .9s ease-out forwards}',
    '@keyframes tdr-fl{from{opacity:1}to{opacity:0}}'
  ].join('\n');
  var st = D.createElement('style'); st.textContent = css; (D.head || D.documentElement).appendChild(st);

  var box = null, MAXV = 3;
  function ensure() {
    if (box) return;
    box = D.createElement('div'); box.id = 'tdr-box'; D.body.appendChild(box);
  }
  function tenHtml(ten, muc) {
    var m = M[muc] || M.E;
    if (m.rb) return '<b class="rbt">' + esc(ten) + '</b>';
    return '<b style="color:' + m.c + ';text-shadow:0 0 6px rgba(' + m.rgb + ',.8)">' + esc(ten) + '</b>';
  }
  function flash() { var f = D.createElement('div'); f.className = 'tdr-fl'; D.body.appendChild(f); setTimeout(function () { if (f.parentNode) f.parentNode.removeChild(f); }, 950); }
  function iconNode(ic, fb) {
    var wrap = D.createElement('div'); wrap.className = 'tdr-ic';
    var isImg = ic && (ic.indexOf('/') >= 0 || /\.(png|webp|jpe?g|gif|svg)(\?|$)/i.test(ic));
    if (isImg) {
      var im = new Image(); im.alt = '';
      im.onerror = function () { wrap.textContent = fb || '🎁'; };
      im.src = ic; wrap.appendChild(im);
    } else wrap.textContent = ic || fb || '🎁';
    return wrap;
  }
  function remove(el) { el.classList.add('out'); setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 380); }

  function show(o) {
    o = o || {};
    if (!D.body) { setTimeout(function () { show(o); }, 300); return; }
    ensure();
    var m = M[o.muc] || M.E, el = D.createElement('div');
    el.className = 'tdr' + (m.rb ? ' rb' : '') + (m.hi ? ' hi' : '');
    el.style.setProperty('--rgb', m.rgb);
    el.appendChild(iconNode(o.icon, o.fb));
    var tx = D.createElement('div'); tx.className = 'tdr-tx';
    tx.innerHTML = '<div class="tdr-hd"><span>' + esc(o.tieude || 'Nhận được') + '</span><span class="tdr-tag">' + esc(o.nhan || m.nhan) + '</span></div>' +
      '<div class="tdr-nm' + (m.rb ? ' rbt' : '') + '">' + esc(o.ten || '') + '</div>' +
      (o.nguon ? '<div class="tdr-sb">' + esc(o.nguon) + '</div>' : '');
    el.appendChild(tx);
    if (o.so != null && +o.so > 1) { var sl = D.createElement('div'); sl.className = 'tdr-sl'; sl.textContent = 'x' + o.so; el.appendChild(sl); }
    if (m.rb) {
      var sp = D.createElement('div'), h = '', i; sp.className = 'tdr-sp';
      for (i = 0; i < 14; i++) h += '<i style="left:' + (4 + Math.random() * 92).toFixed(1) + '%;top:' + (10 + Math.random() * 80).toFixed(1) + '%;background:hsl(' + (i * 26) + ',100%,65%);box-shadow:0 0 6px hsl(' + (i * 26) + ',100%,65%);animation-delay:-' + (Math.random() * 1.5).toFixed(2) + 's"></i>';
      sp.innerHTML = h; el.appendChild(sp);
      flash();
    }
    box.appendChild(el);
    while (box.children.length > MAXV) box.removeChild(box.firstChild);
    setTimeout(function () { remove(el); }, o.ms || (m.rb ? 5200 : m.hi ? 4000 : 3000));
    return el;
  }

  root.TTGDROP = { M: M, show: show, tenHtml: tenHtml };
})(typeof window !== 'undefined' ? window : globalThis);
