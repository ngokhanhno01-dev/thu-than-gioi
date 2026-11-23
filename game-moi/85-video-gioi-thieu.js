/* 85-video-gioi-thieu.js - VIDEO GIỚI THIỆU lần đầu vào game (game-moi).
   Được nạp từ 51-thu-moi.js (khối [INTRO] đầu file) nên KHÔNG cần sửa index.html.
   LUỒNG: mở game lần đầu -> video giới thiệu (~1p13s) phủ kín màn hình -> hết video (hoặc bấm Bỏ qua) -> mờ dần để lộ MÀN CHỜ (#ttg-boot) -> chạm vào màn hình để vào game.
   Màn chờ vẫn tải game ngầm bên dưới trong lúc video chạy, nên hết video thường đã sẵn sàng.
   VIDEO: đặt file đúng đường dẫn CFG.file (game-moi/video/gioi-thieu.mp4) rồi đẩy lên GitHub là chạy. Chưa có file / lỗi tải -> tự bỏ qua, vào màn chờ như bình thường (KHÔNG ghi là đã xem, nên khi có video rồi vẫn phát ở lần vào đầu tiên).
   "LẦN ĐẦU" = máy chưa có khóa CFG.key trong localStorage. Xem hết hoặc bấm Bỏ qua thì ghi khóa. Muốn mọi người xem lại bản video mới: đổi CFG.key (ttg_moi_intro_v1 -> ttg_moi_intro_v2).
   Trình duyệt chặn tự phát có tiếng (hay gặp trên iPhone) -> hiện chữ "Chạm để xem video giới thiệu", chạm là phát có tiếng.
   THỬ LẠI: đặt CFG.luonPhat = true (lần nào vào cũng phát), hoặc thêm ?intro=1 vào link. */
(function () {
  if (window.TTG_BLOCK || window.TTGINTRO) return;
  var boot = document.getElementById('ttg-boot');
  if (!boot || !document.getElementById('tb-scene')) return;   /* chỉ chạy ở trang game-moi (có màn chờ) */
  var CFG = {
    file: 'game-moi/video/gioi-thieu.mp4',   /* đường dẫn video (tính từ thư mục gốc repo) */
    key: 'ttg_moi_intro_v1',                 /* khóa localStorage: có khóa = đã xem */
    luonPhat: false,                         /* true = lần nào vào cũng phát (để thử) */
    choPhepBoQua: true,                      /* false = ẩn nút Bỏ qua, bắt buộc xem hết */
    hanChoTai: 25000                         /* ms chờ video lên hình; quá hạn thì bỏ qua (mạng quá yếu) */
  };
  function seen() { try { return localStorage.getItem(CFG.key) === '1'; } catch (e) { return false; } }
  function mark() { try { localStorage.setItem(CFG.key, '1'); } catch (e) {} }
  window.TTGINTRO = { CFG: CFG, reset: function () { try { localStorage.removeItem(CFG.key); } catch (e) {} } };
  if (seen() && !(CFG.luonPhat || /[?&]intro=1/.test(location.search))) return;

  var done = false, playing = false, watch = 0;
  var css = document.createElement('style');
  css.textContent =
    '#ttg-intro{position:fixed;left:0;top:0;right:0;bottom:0;z-index:2147483600;background:#000;overflow:hidden;font-family:"VT323",monospace;transition:opacity .6s ease;touch-action:none;-webkit-tap-highlight-color:transparent}' +
    '#ttg-intro.out{opacity:0;pointer-events:none}' +
    '#ttg-intro video{position:absolute;left:0;top:0;width:100%;height:100%;object-fit:contain;background:#000}' +
    '#ttg-intro .msg{position:absolute;left:0;right:0;bottom:calc(16px + env(safe-area-inset-bottom,0px));text-align:center;color:#e8fff4;font-size:18px;opacity:.85;text-shadow:0 1px 4px #000;pointer-events:none}' +
    '#ttg-intro .tap{position:absolute;left:0;top:0;right:0;bottom:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.6);cursor:pointer}' +
    '#ttg-intro .tap span{font-size:clamp(20px,6vh,30px);color:#ffe9a0;text-shadow:0 0 10px rgba(255,210,74,.7),0 1px 0 #000;animation:ttgi-blink 1.4s ease-in-out infinite}' +
    '#ttg-intro .skip{position:absolute;right:calc(14px + env(safe-area-inset-right,0px));top:calc(10px + env(safe-area-inset-top,0px));padding:4px 14px;font:inherit;font-size:20px;line-height:1.1;color:#fff;background:rgba(0,0,0,.45);border:1px solid rgba(255,255,255,.4);border-radius:14px;opacity:.75;cursor:pointer;touch-action:manipulation}' +
    '#ttg-intro .skip:active{opacity:1}' +
    '@keyframes ttgi-blink{0%,100%{opacity:1}50%{opacity:.4}}';
  document.head.appendChild(css);

  var ov = document.createElement('div'); ov.id = 'ttg-intro';
  var v = document.createElement('video');
  v.setAttribute('playsinline', ''); v.setAttribute('webkit-playsinline', '');
  v.setAttribute('disablepictureinpicture', ''); v.setAttribute('controlslist', 'nodownload noremoteplayback');
  v.preload = 'auto'; v.controls = false;
  var msg = document.createElement('div'); msg.className = 'msg'; msg.textContent = 'Đang tải video giới thiệu...';
  var tap = document.createElement('div'); tap.className = 'tap'; tap.innerHTML = '<span>Chạm để xem video giới thiệu</span>';
  ov.appendChild(v); ov.appendChild(msg); ov.appendChild(tap);
  var sk = null;
  if (CFG.choPhepBoQua) {
    sk = document.createElement('button'); sk.type = 'button'; sk.className = 'skip'; sk.textContent = 'Bỏ qua ›';
    sk.addEventListener('click', function (e) { e.stopPropagation(); finish(true); });
    ov.appendChild(sk);
  }

  /* kết thúc: ghi "đã xem" (nếu markSeen), mờ video để lộ màn chờ, dọn sạch sau 0,7s */
  function finish(markSeen) {
    if (done) return; done = true; clearTimeout(watch);
    if (markSeen) mark();
    try { v.pause(); } catch (e) {}
    boot.style.visibility = '';
    ov.className = 'out';
    setTimeout(function () {
      try { v.removeAttribute('src'); v.load(); } catch (e) {}
      if (ov.parentNode) ov.parentNode.removeChild(ov);
      if (css.parentNode) css.parentNode.removeChild(css);
    }, 700);
  }
  function startWatch() { clearTimeout(watch); watch = setTimeout(function () { if (!playing) finish(false); }, CFG.hanChoTai); }
  function tryPlay(fromTap) {
    var p; try { p = v.play(); } catch (e) { p = null; }
    if (p && p.catch) p.catch(function (err) {
      if (done) return;
      var n = err && err.name;
      if (n === 'NotAllowedError') {
        if (!fromTap) { clearTimeout(watch); msg.style.display = 'none'; tap.style.display = 'flex'; }   /* bị chặn tự phát có tiếng: chờ người chơi chạm */
        else { v.muted = true; var q; try { q = v.play(); } catch (e) { q = null; } if (q && q.catch) q.catch(function () { finish(false); }); }   /* chạm rồi vẫn bị chặn (hiếm): phát không tiếng */
      } else if (n !== 'AbortError') finish(false);
    });
  }
  v.addEventListener('playing', function () { playing = true; clearTimeout(watch); msg.style.display = 'none'; tap.style.display = 'none'; });
  v.addEventListener('waiting', function () { if (!done) msg.style.display = 'block'; });
  v.addEventListener('ended', function () { finish(true); });
  v.addEventListener('error', function () { finish(playing); });   /* thiếu file / không phát được: bỏ qua; đã xem được một đoạn thì tính là đã xem */
  tap.addEventListener('click', function () { tap.style.display = 'none'; msg.style.display = 'block'; startWatch(); tryPlay(true); });
  document.addEventListener('visibilitychange', function () {   /* ra khỏi app rồi quay lại: phát tiếp */
    if (done || document.hidden || !playing || v.ended) return;
    try { var p = v.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {}
  });

  boot.style.visibility = 'hidden';   /* màn chờ vẫn tải ngầm, chỉ ẩn hình cho nhẹ máy trong lúc xem video */
  v.src = CFG.file;
  document.body.appendChild(ov);
  startWatch();
  tryPlay(false);
})();
