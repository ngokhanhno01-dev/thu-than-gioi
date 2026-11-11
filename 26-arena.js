/* ===== 26-arena.js — Bước 3: Đối thủ bóng, danh sách Khiêu Chiến, mô phỏng trận
   Nạp SAU 25-season.js (cần TTGSEASON) và 23-view.js (cần TTGVIEW).
   Uy danh chỉ thay đổi ở đây (các nguồn cũ vẫn còn, sẽ dọn ở bước sau nếu bạn muốn).
*/
(function(){
  'use strict';

  /* ---------- HẰNG SỐ (dễ chỉnh) ---------- */
  const NEAR_ABOVE = 5;          // số người ngay trên mình trong danh sách
  const NEAR_BELOW = 5;          // số người ngay dưới
  const RECENT_MS  = 5 * 60 * 1000;  // 5 phút không hiện lại đối thủ vừa đánh
  const CARD_CACHE_MS = 5 * 60 * 1000; // cache thẻ thú 5 phút
  const LIST_CACHE_MS = 45 * 1000;     // cache danh sách rank 45 giây

  // Bảng uy danh (đề xuất mặc định)
  // Thắng: base + bonus theo chênh lệch uy danh (ưu tiên đánh người cao hơn)
  const FAME_WIN_BASE   = 12;
  const FAME_WIN_MIN    = 6;
  const FAME_WIN_MAX    = 28;
  const FAME_DIFF_DIV   = 18;   // mỗi 18 uy danh chênh → ±1 điểm
  // Thua: mất khoảng một nửa phần thắng (không xuống dưới 0)
  const FAME_LOSE_RATIO = 0.45;
  const FAME_LOSE_MIN   = 3;
  const FAME_LOSE_MAX   = 14;

  // NPC dự phòng khi không đủ người thật
  const NPC_NAMES = ['Hắc Phong Lang', 'Thanh Mộc Hổ', 'Lôi Vân Điểu', 'Huyết Ảnh Xà', 'Kim Sơn Khải'];

  /* ---------- TRẠNG THÁI ---------- */
  let cardCache = {};           // uid -> {t, data}
  let listCache = {t:0, rows:[]};
  let recentFight = {};         // uid -> timestamp (máy local, chỉ để ẩn khỏi list)
  let panelOpen = false;
  let busy = false;

  /* ---------- TIỆN ÍCH ---------- */
  function nowSrv(){
    return (window.TTGSEASON && TTGSEASON.nowSrv) ? TTGSEASON.nowSrv() : Date.now();
  }
  function curSeason(){
    return (window.TTGSEASON && TTGSEASON.currentSeason) ? TTGSEASON.currentSeason() : 1;
  }
  function isGuest(){
    try{
      if(window.TTGNET && TTGNET.me) return !!TTGNET.me.guest;
      if(window.TTGSAVE && TTGSAVE.user) return TTGSAVE.user.key === '__guest';
    }catch(_){}
    return true;
  }
  function myUid(){
    try{
      if(window.TTGNET && TTGNET.me && TTGNET.me.uid) return TTGNET.me.uid;
      if(window.TTGSAVE && TTGSAVE.user && TTGSAVE.user.key && TTGSAVE.user.key !== '__guest') return TTGSAVE.user.key;
    }catch(_){}
    return null;
  }
  function myNick(){
    try{
      if(window.TTGNET && TTGNET.me && TTGNET.me.name) return String(TTGNET.me.name).slice(0,20);
      if(typeof nick === 'string') return nick.slice(0,20);
    }catch(_){}
    return 'Người chơi';
  }
  function dispFame(row){
    // Uy danh hiển thị = max(0, fame - lost). Bước 5 mới đầy đủ lost.
    const f = Math.max(0, Math.floor(Number(row.fame) || 0));
    const l = Math.max(0, Math.floor(Number(row.lost) || 0));
    return Math.max(0, f - l);
  }
  function myDispFame(){
    return Math.max(0, Math.floor(typeof fame === 'number' ? fame : 0));
  }

  /* ---------- CACHE THẺ THÚ (Firestore) ---------- */
  function getCard(uid){
    return new Promise(function(resolve){
      if(!uid){ resolve(null); return; }
      const c = cardCache[uid];
      if(c && (Date.now() - c.t) < CARD_CACHE_MS){ resolve(c.data); return; }
      try{
        firebase.firestore().collection('cards').doc(uid).get()
          .then(function(sn){
            const d = sn.exists ? sn.data() : null;
            cardCache[uid] = {t: Date.now(), data: d};
            resolve(d);
          })
          .catch(function(e){
            console.warn('[arena] đọc thẻ', e);
            resolve(null);
          });
      }catch(e){
        console.warn('[arena] Firestore', e);
        resolve(null);
      }
    });
  }

  /* ---------- LẤY DANH SÁCH XẾP HẠNG GẦN ---------- */
  function loadRankList(force){
    return new Promise(function(resolve){
      if(!force && listCache.rows.length && (Date.now() - listCache.t) < LIST_CACHE_MS){
        resolve(listCache.rows);
        return;
      }
      let rdb = null;
      try{ rdb = firebase.database(); }catch(_){}
      if(!rdb){ resolve([]); return; }

      const s = curSeason();
      rdb.ref('seasonRank/' + s).once('value')
        .then(function(sn){
          const rows = [];
          sn.forEach(function(ch){
            const v = ch.val() || {};
            rows.push({
              uid: ch.key,
              nick: String(v.nick || '?').slice(0,20),
              fame: Math.max(0, Math.floor(Number(v.fame) || 0)),
              lost: Math.max(0, Math.floor(Number(v.lost) || 0)),
              lv: Math.max(1, Math.min(100, Math.floor(Number(v.lv) || 1))),
              wins: Math.max(0, Math.floor(Number(v.wins) || 0)),
              foes: Math.max(0, Math.floor(Number(v.foes) || 0)),
              t: Number(v.t) || 0
            });
          });
          // Sắp xếp theo uy danh hiển thị giảm dần
          rows.sort(function(a,b){ return dispFame(b) - dispFame(a) || a.uid.localeCompare(b.uid); });
          listCache = {t: Date.now(), rows: rows};
          resolve(rows);
        })
        .catch(function(e){
          console.warn('[arena] loadRank', e);
          resolve([]);
        });
    });
  }

  function pickNearby(rows){
    const me = myUid();
    const myF = myDispFame();
    // Lọc bỏ mình + người vừa đánh gần đây
    const now = Date.now();
    const pool = rows.filter(function(r){
      if(r.uid === me) return false;
      if(recentFight[r.uid] && (now - recentFight[r.uid]) < RECENT_MS) return false;
      return true;
    });
    if(!pool.length) return [];

    // Tìm vị trí gần uy danh mình nhất
    let idx = 0;
    let best = Math.abs(dispFame(pool[0]) - myF);
    for(let i = 1; i < pool.length; i++){
      const d = Math.abs(dispFame(pool[i]) - myF);
      if(d < best){ best = d; idx = i; }
    }
    const from = Math.max(0, idx - NEAR_ABOVE);
    const to = Math.min(pool.length, idx + NEAR_BELOW + 1);
    return pool.slice(from, to);
  }

  /* ---------- CÔNG THỨC UY DANH ---------- */
  function calcFameDelta(myF, oppF, win){
    const diff = oppF - myF;
    let gain = FAME_WIN_BASE + Math.round(diff / FAME_DIFF_DIV);
    gain = Math.max(FAME_WIN_MIN, Math.min(FAME_WIN_MAX, gain));
    // Bonus nhỏ từ "Danh vọng" vùng (sp === 6) nếu còn
    try{
      if(win && pet && pet.sp === 6 && typeof spOfPet === 'function'){
        const b = spOfPet().v || 0;
        gain = Math.round(gain * (1 + b / 100));
      }
    }catch(_){}
    if(win) return gain;
    // Thua
    let lose = Math.round(gain * FAME_LOSE_RATIO);
    lose = Math.max(FAME_LOSE_MIN, Math.min(FAME_LOSE_MAX, lose));
    return -lose;
  }

  /* ---------- MÔ PHỎNG TRẬN (dựa trên chỉ số thật của 2 thẻ) ---------- */
  // Dùng công thức sát thương gần với sim() của 06-mobs.js, bỏ hiệu ứng set phức tạp của đối thủ
  // để chạy ổn định khi chỉ có dữ liệu thẻ công khai.
  function mkFighterFromCard(card, name){
    const st = (card && card.stats) ? card.stats : {};
    const hp = Math.max(1, Math.round(Number(st.hp) || 100));
    return {
      n: name || (card && card.nick) || 'Đối thủ',
      hp: hp, mx: hp,
      atk: Math.max(1, Math.round(Number(st.atk) || 10)),
      def: Math.max(1, Math.round(Number(st.def) || 10)),
      spd: Math.max(1, Math.round(Number(st.spd) || 10)),
      mag: Math.max(0, Math.round(Number(st.mag) || 0)),
      eva: Math.min(45, Number(st.eva) || 5),
      stun: Math.min(35, Number(st.stun) || 0),
      regen: Math.min(8, Number(st.regen) || 0),
      crit: Math.min(60, Number(st.crit) || 0),
      r: 1,          // hệ số khắc (đơn giản = 1, không có dữ liệu huyết mạch đầy đủ của đối thủ)
      stn: 0
    };
  }
  function mkFighterFromMe(){
    // Dùng statsOf hiện tại (đã gồm trang bị)
    let s;
    try{
      s = statsOf(pet.bl, pet.pi, pet.base, level);
    }catch(_){
      s = {hp:100,atk:10,def:10,spd:10,mag:5,eva:5,stun:0,regen:0,crit:0};
    }
    return {
      n: 'Thú của bạn',
      hp: s.hp, mx: s.hp,
      atk: s.atk, def: s.def, spd: s.spd, mag: s.mag,
      eva: s.eva || 5, stun: s.stun || 0, regen: s.regen || 0, crit: s.crit || 0,
      r: 1, stn: 0
    };
  }

  function simArena(P, Q){
    // Trận tối đa 14 lượt, giống game
    const ev = [];
    const acc = function(v){ return Math.random() * 100 < v; };
    const push = function(w, k, d, t){
      ev.push({w:w, k:k, d:d, t:t, hp:Math.max(0,P.hp), mh:Math.max(0,Q.hp)});
    };
    const act = function(a, d){
      if(a.hp <= 0 || d.hp <= 0) return;
      if(a.stn){ a.stn = 0; push(a === P ? 'p' : 'm', 'stun', 0, a.n + ' bị choáng, bỏ lượt'); return; }
      // Né
      if(acc(d.eva)){ push(a === P ? 'p' : 'm', 'miss', 0, a.n + ' đánh trượt (né)'); return; }
      const cr = acc(a.crit);
      let dm = Math.max(1, Math.round((a.atk + a.mag * 0.3) * 1.6 * 100 / (100 + d.def) * a.r * (cr ? 1.5 : 1)));
      d.hp -= dm;
      push(a === P ? 'p' : 'm', cr ? 'crit' : 'hit', dm,
        (cr ? '💥 Chí mạng! ' : '') + a.n + ' đánh -' + dm);
      // Choáng
      if(d.hp > 0 && acc(a.stun)){ d.stn = 1; push(a === P ? 'p' : 'm', 'stun', 0, d.n + ' bị choáng'); }
    };

    const first = P.spd >= Q.spd ? P : Q;
    for(let r = 1; r <= 14 && P.hp > 0 && Q.hp > 0; r++){
      act(first, first === P ? Q : P);
      act(first === P ? Q : P, first);
      // Hồi máu cuối lượt
      [P, Q].forEach(function(c){
        if(c.hp > 0 && c.regen){
          const heal = Math.min(c.mx - c.hp, Math.round(c.mx * c.regen / 100));
          if(heal > 0){ c.hp += heal; push(c === P ? 'p' : 'm', 'heal', heal, c.n + ' hồi +' + heal); }
        }
      });
    }
    const win = Q.hp <= 0 || (P.hp > 0 && P.hp / P.mx >= Q.hp / Q.mx);
    return { win: win, ev: ev, maxP: P.mx, maxM: Q.mx };
  }

  /* ---------- NPC DỰ PHÒNG ---------- */
  function makeNpcCard(){
    const lv = Math.max(1, Math.min(100, level + Math.floor(Math.random() * 5) - 2));
    const base = 8 + lv * 1.1;
    return {
      nick: NPC_NAMES[Math.floor(Math.random() * NPC_NAMES.length)],
      lv: lv,
      stats: {
        hp: Math.round(base * 8 * (0.9 + Math.random() * 0.2)),
        atk: Math.round(base * (0.9 + Math.random() * 0.2)),
        def: Math.round(base * (0.9 + Math.random() * 0.2)),
        spd: Math.round(base * (0.9 + Math.random() * 0.2)),
        mag: Math.round(base * 0.7 * (0.9 + Math.random() * 0.2)),
        eva: 5 + Math.random() * 8,
        stun: Math.random() * 10,
        regen: Math.random() * 3,
        crit: 5 + Math.random() * 10
      },
      _npc: true
    };
  }

  /* ---------- KHIÊU CHIẾN ---------- */
  function doChallenge(targetUid, targetNick, targetFame, isNpc){
    if(busy) return;
    if(isGuest()){ log('🔒 Khách chỉ xem được bảng xếp hạng, hãy đăng nhập để khiêu chiến.'); return; }
    if(!hatched || !pet){ log('🥚 Cần thú đã nở mới được khiêu chiến.'); return; }
    if(!window.TTGSEASON || !TTGSEASON.useTicket){ log('⚠️ Module mùa chưa sẵn sàng.'); return; }

    // Trừ vé
    if(!TTGSEASON.useTicket()){
      log('🎫 Hết vé Đấu trường. ' + (TTGSEASON.ticketsStr ? TTGSEASON.ticketsStr() : ''));
      return;
    }

    busy = true;
    const myF = myDispFame();
    const oppF = Math.max(0, Math.floor(targetFame || 0));

    const runFight = function(card){
      const P = mkFighterFromMe();
      const Q = mkFighterFromCard(card, targetNick || (card && card.nick));
      const R = simArena(P, Q);
      const delta = calcFameDelta(myF, oppF, R.win);

      // Cập nhật uy danh local
      if(R.win){
        fame = Math.max(0, fame + delta);
      }else{
        fame = Math.max(0, fame + delta); // delta âm
      }

      // Cập nhật wins / foes (chỉ khi thắng người thật)
      let winsAdd = 0, foesAdd = 0;
      if(R.win && !isNpc && targetUid){
        winsAdd = 1;
        // foes: đơn giản +1 nếu chưa đánh (local gần đây coi như mới)
        if(!recentFight[targetUid] || (Date.now() - recentFight[targetUid]) > 24*3600*1000){
          foesAdd = 1;
        }
      }

      // Ghi nhận vừa đánh
      if(targetUid) recentFight[targetUid] = Date.now();

      // Ghi seasonRank của mình ngay
      try{
        if(window.TTGSEASON && TTGSEASON.writeSeasonRank){
          // Đọc wins/foes hiện tại rồi cộng
          TTGSEASON.writeSeasonRank({
            season: curSeason(),
            fame: fame,
            wins: undefined,   // để writeSeasonRank giữ và cộng nếu cần
            foes: undefined
          }).then(function(){
            // Cộng wins/foes thủ công bằng cách đọc lại (đơn giản)
            if(winsAdd || foesAdd){
              const rdb = firebase.database();
              const ref = rdb.ref('seasonRank/' + curSeason() + '/' + myUid());
              ref.once('value').then(function(sn){
                const cur = sn.val() || {};
                const payload = {
                  nick: myNick(),
                  fame: Math.max(0, Math.floor(fame)),
                  lost: Math.max(0, Math.floor(Number(cur.lost) || 0)),
                  lv: Math.max(1, Math.min(100, level || 1)),
                  wins: Math.max(0, Math.floor(Number(cur.wins) || 0) + winsAdd),
                  foes: Math.max(0, Math.floor(Number(cur.foes) || 0) + foesAdd),
                  t: firebase.database.ServerValue.TIMESTAMP
                };
                return ref.set(payload);
              }).catch(function(e){ console.warn('[arena] cập nhật wins', e); });
            }
          });
        }
      }catch(e){ console.warn('[arena] ghi rank', e); }

      // Lưu game
      try{ if(window.TTGSAVE && TTGSAVE.save) TTGSAVE.save(); }catch(_){}

      // Hiện kết quả
      showResult({
        win: R.win,
        name: Q.n,
        delta: delta,
        myFame: fame,
        tickets: TTGSEASON.getTickets ? TTGSEASON.getTickets() : '?'
      });

      if(typeof stats === 'function') stats();
      if(typeof log === 'function'){
        log((R.win ? '⚔️ <b style="color:var(--jade)">Thắng</b> ' : '⚔️ <b style="color:#e34e48">Thua</b> ') +
          Q.n + ' · uy danh ' + (delta >= 0 ? '+' : '') + delta +
          ' (hiện ' + fame + ') · vé còn ' + (TTGSEASON.getTickets ? TTGSEASON.getTickets() : '?'));
      }

      // Làm mới list
      listCache.t = 0;
      busy = false;
      if(panelOpen) renderList();
    };

    if(isNpc){
      runFight(makeNpcCard());
      return;
    }

    getCard(targetUid).then(function(card){
      if(!card || !card.stats){
        // Không có thẻ → dùng NPC thay
        log('⚠️ Không đọc được thẻ thú của ' + (targetNick || 'đối thủ') + ', dùng đối thủ giả.');
        runFight(makeNpcCard());
      }else{
        runFight(card);
      }
    });
  }

  /* ---------- GIAO DIỆN TẠM (để test Bước 3, Bước 4 sẽ thay bằng giao diện đẹp) ---------- */
  function ensurePanel(){
    if($('ar-ov')) return;
    const css = document.createElement('style');
    css.textContent =
      '#ar-ov{position:fixed;inset:0;z-index:120;background:rgba(4,10,14,.78);display:none;align-items:flex-end;justify-content:center}'+
      '#ar-ov.show{display:flex}'+
      '#ar-box{width:min(96vw,420px);max-height:78vh;background:#14272d;border:3px solid #f6c66a;box-shadow:0 4px 0 #040a0e;display:flex;flex-direction:column;color:#f5edcf;font-size:16px}'+
      '#ar-box .hd{display:flex;justify-content:space-between;align-items:center;padding:8px 10px;border-bottom:2px solid #78613a;color:#f6c66a;font-size:18px}'+
      '#ar-box .hd button{width:auto;margin:0;padding:2px 10px;font-size:18px;background:#3b4a4f;border:2px solid #040a0e;color:#f5edcf;cursor:pointer}'+
      '#ar-info{padding:6px 10px;font-size:15px;color:#b7bda9;border-bottom:1px dashed #78613a}'+
      '#ar-list{flex:1;overflow-y:auto;padding:6px 8px}'+
      '#ar-list .row{display:flex;align-items:center;gap:6px;padding:7px 6px;border-bottom:1px solid #2a3c42;font-size:16px}'+
      '#ar-list .row .nm{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'+
      '#ar-list .row .lv{color:#72e4b0;font-size:14px;min-width:42px}'+
      '#ar-list .row .fm{color:#f6c66a;font-size:15px;min-width:52px;text-align:right}'+
      '#ar-list .row button{width:auto;margin:0;padding:3px 8px;font-size:14px;cursor:pointer;background:#3b4a4f;border:2px solid #040a0e;color:#f5edcf}'+
      '#ar-list .row button.go{background:#1e5c45;border-color:#72e4b0;color:#e8fff4}'+
      '#ar-list .empty{padding:20px;text-align:center;color:#78864f}'+
      '#ar-res{position:fixed;inset:0;z-index:130;background:rgba(4,10,14,.85);display:none;align-items:center;justify-content:center}'+
      '#ar-res.show{display:flex}'+
      '#ar-res .box{width:min(90vw,340px);background:#14272d;border:3px solid #f6c66a;padding:14px 16px;text-align:center;color:#f5edcf}'+
      '#ar-res .box b.win{color:#72e4b0;font-size:22px}'+
      '#ar-res .box b.lose{color:#e34e48;font-size:22px}'+
      '#ar-res .box button{margin-top:12px;padding:6px 18px;font-size:16px;background:#3b4a4f;border:2px solid #040a0e;color:#f5edcf;cursor:pointer}';
    document.head.appendChild(css);

    const ov = document.createElement('div');
    ov.id = 'ar-ov';
    ov.innerHTML =
      '<div id="ar-box">'+
        '<div class="hd"><span>⚔️ Khiêu Chiến</span><button type="button" id="ar-x">✕</button></div>'+
        '<div id="ar-info"></div>'+
        '<div id="ar-list"><div class="empty">Đang tải...</div></div>'+
      '</div>';
    document.body.appendChild(ov);
    $('ar-x').onclick = function(){ showPanel(false); };
    ov.addEventListener('click', function(e){ if(e.target === ov) showPanel(false); });

    const res = document.createElement('div');
    res.id = 'ar-res';
    res.innerHTML = '<div class="box" id="ar-res-box"></div>';
    document.body.appendChild(res);
  }

  function showPanel(v){
    ensurePanel();
    panelOpen = !!v;
    const ov = $('ar-ov');
    if(!ov) return;
    ov.classList.toggle('show', panelOpen);
    if(panelOpen) renderList(true);
  }

  function renderList(force){
    ensurePanel();
    const info = $('ar-info');
    const list = $('ar-list');
    if(!info || !list) return;

    const tk = (window.TTGSEASON && TTGSEASON.ticketsStr) ? TTGSEASON.ticketsStr() : '';
    const seas = curSeason();
    info.innerHTML = 'Mùa <b>' + seas + '</b> · Uy danh của bạn: <b style="color:#f6c66a">' + myDispFame() + '</b><br>' + tk +
      (isGuest() ? '<br><span style="color:#e34e48">Khách chỉ xem, không khiêu chiến được.</span>' : '');

    list.innerHTML = '<div class="empty">Đang tải danh sách...</div>';

    loadRankList(!!force).then(function(rows){
      const near = pickNearby(rows);
      if(!near.length){
        // Không có ai → hiện 1 nút NPC
        list.innerHTML =
          '<div class="empty">Chưa có đối thủ thật gần uy danh bạn.<br>Đầu mùa mọi người đều 0 điểm.</div>'+
          '<div class="row" style="justify-content:center;margin-top:8px">'+
            '<button type="button" class="go" id="ar-npc">Đấu với đối thủ giả (NPC)</button>'+
          '</div>';
        const btn = $('ar-npc');
        if(btn) btn.onclick = function(){
          if(isGuest()) return;
          doChallenge(null, 'Đối thủ giả', myDispFame(), true);
        };
        return;
      }

      list.innerHTML = near.map(function(r){
        const df = dispFame(r);
        const can = !isGuest();
        return '<div class="row" data-uid="'+r.uid+'">'+
          '<span class="nm">'+(r.nick || '?')+'</span>'+
          '<span class="lv">Lv.'+r.lv+'</span>'+
          '<span class="fm">'+df+'</span>'+
          '<button type="button" class="view" data-uid="'+r.uid+'" data-nick="'+(r.nick||'')+'">Xem</button>'+
          (can ? '<button type="button" class="go" data-uid="'+r.uid+'" data-nick="'+(r.nick||'')+'" data-fame="'+df+'">Khiêu chiến</button>' : '')+
          '</div>';
      }).join('');

      list.querySelectorAll('button.view').forEach(function(b){
        b.onclick = function(){
          const u = b.getAttribute('data-uid');
          const n = b.getAttribute('data-nick') || '';
          if(window.TTGVIEW && TTGVIEW.view) TTGVIEW.view(u, n);
        };
      });
      list.querySelectorAll('button.go').forEach(function(b){
        b.onclick = function(){
          const u = b.getAttribute('data-uid');
          const n = b.getAttribute('data-nick') || '';
          const f = Number(b.getAttribute('data-fame') || 0);
          doChallenge(u, n, f, false);
        };
      });
    });
  }

  function showResult(o){
    ensurePanel();
    const box = $('ar-res-box');
    const res = $('ar-res');
    if(!box || !res) return;
    box.innerHTML =
      '<div><b class="'+(o.win?'win':'lose')+'">'+(o.win?'CHIẾN THẮNG':'THẤT BẠI')+'</b></div>'+
      '<div style="margin:8px 0">Đối thủ: <b>'+ (o.name||'?') +'</b></div>'+
      '<div>Uy danh '+(o.delta>=0?'+':'')+'<b style="color:'+(o.delta>=0?'#72e4b0':'#e34e48')+'">'+o.delta+'</b></div>'+
      '<div>Uy danh hiện tại: <b style="color:#f6c66a">'+o.myFame+'</b></div>'+
      '<div style="margin-top:4px;font-size:14px;color:#b7bda9">Vé còn: '+o.tickets+'</div>'+
      '<button type="button" id="ar-res-ok">Đóng</button>';
    res.classList.add('show');
    $('ar-res-ok').onclick = function(){ res.classList.remove('show'); };
  }

  /* ---------- MÓC NÚT ĐẤU TRƯỜNG CŨ ---------- */
  function hookArenaBtn(){
    // Ghi đè hàm arena toàn cục
    window.arena = function(){
      if(!hatched){ log('🥚 Cần thú đã nở.'); return; }
      showPanel(true);
    };
    // Nếu nút HTML còn listener cũ thì cũng bắt
    const btn = $('btn-arena');
    if(btn){
      btn.onclick = function(){ window.arena(); };
    }
  }

  /* ---------- KHỞI ĐỘNG ---------- */
  function start(){
    hookArenaBtn();
    // Mỗi lần đổi cấp thì cập nhật lv trên rank (nhẹ)
    try{
      const _addExp = window.addExp;
      if(typeof _addExp === 'function'){
        window.addExp = function(n){
          const lv0 = level;
          _addExp(n);
          if(level > lv0 && window.TTGSEASON && TTGSEASON.writeSeasonRank){
            TTGSEASON.writeSeasonRank({ lv: level });
          }
        };
      }
    }catch(_){}
  }

  // Chờ DOM + module khác
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', start);
  }else{
    setTimeout(start, 0);
  }

  /* ---------- XUẤT RA NGOÀI (để Bước 4/5 dùng lại) ---------- */
  window.TTGARENA = {
    showPanel: showPanel,
    doChallenge: doChallenge,
    loadRankList: loadRankList,
    getCard: getCard,
    calcFameDelta: calcFameDelta,
    NEAR_ABOVE: NEAR_ABOVE,
    NEAR_BELOW: NEAR_BELOW,
    FAME_WIN_BASE: FAME_WIN_BASE,
    FAME_WIN_MIN: FAME_WIN_MIN,
    FAME_WIN_MAX: FAME_WIN_MAX
  };

})();