/* ===== 26-arena.js — Bước 3+4: Đối thủ bóng, Khiêu Chiến, mô phỏng full set, GIAO DIỆN ĐẤU TRƯỜNG
   Nạp SAU 25-season.js (TTGSEASON) và 23-view.js (TTGVIEW / drawPet).
   Uy danh CHỈ thay đổi ở đây. Nguồn cũ (thám hiểm / Linh Đan / Linh Quả) đã tắt ở 05-hatch.js.
   Bước 5: người thắng TRỪ uy danh người bị đánh (cộng lost), ghi nhật ký arenaLog, khiên bảo vệ.
*/
(function(){
  'use strict';

  /* ---------- HẰNG SỐ ---------- */
  const NEAR_ABOVE = 5;
  const NEAR_BELOW = 5;
  const CARD_CACHE_MS = 5 * 60 * 1000;
  const LIST_CACHE_MS = 45 * 1000;
  const TOP_LISTEN_LIMIT = 30;

  const FAME_WIN_BASE   = 12;
  const FAME_WIN_MIN    = 6;
  const FAME_WIN_MAX    = 28;
  const FAME_DIFF_DIV   = 18;
  const FAME_LOSE_RATIO = 0.45;
  const FAME_LOSE_MIN   = 3;
  const FAME_LOSE_MAX   = 14;

  /* ----- BƯỚC 5: bị thách đấu (đổi số ở đây; Rules đã cho dư biên để không phải sửa Rules) ----- */
  const VICTIM_RATIO     = 0.5;               // người bị đánh thua mất = 1/2 uy danh gốc người thắng nhận (không tính % Danh vọng)
  const VICTIM_MIN       = 1;                 // mất ít nhất
  const VICTIM_MAX       = 14;                // mất nhiều nhất mỗi trận (Rules cho tối đa 20)
  const PROT_MS          = 5 * 60 * 1000;     // bị đánh thua xong: 5 phút không ai thách đấu được
  const SHIELD_AFTER     = 3;                 // thua liên tiếp 3 lần (chưa thủ thành công lần nào) → khiên
  const SHIELD_MS        = 60 * 60 * 1000;    // khiên nghỉ 60 phút
  const PAIR_COOLDOWN_MS = 60 * 60 * 1000;    // cùng 1 cặp A→B: 1 giờ mới đánh lại được
  const LOG_KEEP         = 30;                // nhật ký hiển thị tối đa

  /* Bảng thưởng lấy từ season-config.js (dùng chung với script chốt mùa). Nếu file đó chưa nạp thì dùng bản dự phòng. */
  const REWARD_TABLE = (window.TTGCFG && TTGCFG.TIERS) ? TTGCFG.TIERS.map(function(t){
    return { rank: t.name, title: t.title ? TTGCFG.TITLES[t.title] + ' · Mùa N' : '—', xu: t.xu, box: t.box,
             blood: (t.blood.huyet + t.blood.thuoc + t.blood.tinh) ? (t.blood.huyet + ' huyết · ' + t.blood.thuoc + ' thảo dược · ' + t.blood.tinh + ' tinh hoa') : 0,
             note: '' };
  }) : [
    {rank:'Hạng 1', title:'Chí Tôn Đấu Trường · Mùa N', xu:5000, box:3, blood:0, note:''}
  ];

  const NPC_NAMES = ['Hắc Phong Lang','Thanh Mộc Hổ','Lôi Vân Điểu','Huyết Ảnh Xà','Kim Sơn Khải'];

  let cardCache = {};
  let listCache = {t:0, rows:[]};
  const RF_KEY = 'ttg_arena_rf';
  let recentFight = (function(){ try{ return JSON.parse(localStorage.getItem(RF_KEY)) || {}; }catch(_){ return {}; } })();
  function saveRecent(){
    try{
      const now = Date.now();
      Object.keys(recentFight).forEach(function(k){ if(now - recentFight[k] > PAIR_COOLDOWN_MS) delete recentFight[k]; });
      localStorage.setItem(RF_KEY, JSON.stringify(recentFight));
    }catch(_){}
  }
  let logRef = null, logCb = null, logRows = [], logReady = false, lastToastT = 0, unreadN = 0;
  let panelOpen = false;
  let fighting = false;
  let rankListener = null;
  let topRows = [];
  let myRankNum = null;

  function $(id){ return document.getElementById(id); }
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
      // biệt danh hiện tại của người chơi (đổi biệt danh là cập nhật ở đây)
      if(window.TTGSAVE && TTGSAVE.user && TTGSAVE.user.name) return String(TTGSAVE.user.name).slice(0,20);
      if(window.TTGNET && TTGNET.me && TTGNET.me.name) return String(TTGNET.me.name).slice(0,20);
    }catch(_){}
    return 'Người chơi';
  }
  function dispFame(row){
    const f = Math.max(0, Math.floor(Number(row.fame) || 0));
    const l = Math.max(0, Math.floor(Number(row.lost) || 0));
    return Math.max(0, f - l);
  }
  function myDispFame(){
    return Math.max(0, Math.floor(typeof fame === 'number' ? fame : 0));
  }
  function rtdb(){
    try{
      if(window.TTGNET && TTGNET.rtdb) return TTGNET.rtdb;
      if(firebase && firebase.database) return firebase.database();
    }catch(_){}
    return null;
  }
  let toastT = null;
  function toast(msg){
    try{ if(typeof log === 'function') log(msg); }catch(_){}
    ensurePanel();
    const t = $('ar-toast');
    if(!t) return;
    t.innerHTML = msg;
    t.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(function(){ t.classList.remove('show'); }, 4500);
  }
  function fmtMs(ms){
    ms = Math.max(0, Math.floor(Number(ms) || 0));
    const m = Math.floor(ms / 60000), s = Math.floor((ms % 60000) / 1000);
    return m + 'p ' + s + 's';
  }
  function esc(s){
    return String(s==null?'':s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function getCard(uid){
    return new Promise(function(resolve){
      if(!uid){ resolve(null); return; }
      const c = cardCache[uid];
      if(c && (Date.now() - c.t) < CARD_CACHE_MS){ resolve(c.data); return; }
      try{
        const db = (window.TTGNET && TTGNET.fs) || (firebase && firebase.firestore && firebase.firestore());
        if(!db){ resolve(null); return; }
        db.collection('cards').doc(uid).get().then(function(snap){
          const data = snap.exists ? snap.data() : null;
          cardCache[uid] = {t: Date.now(), data: data};
          resolve(data);
        }).catch(function(){ resolve(null); });
      }catch(_){ resolve(null); }
    });
  }

  function loadRankList(force){
    return new Promise(function(resolve){
      if(!force && listCache.rows.length && (Date.now() - listCache.t) < LIST_CACHE_MS){
        resolve(listCache.rows.slice()); return;
      }
      const db = rtdb();
      if(!db){ resolve([]); return; }
      const seas = curSeason();
      db.ref('seasonRank/' + seas).orderByChild('fame').limitToLast(80).once('value', function(snap){
        const rows = [];
        snap.forEach(function(ch){
          const v = ch.val() || {};
          rows.push({
            uid: ch.key,
            nick: String(v.nick || '?').slice(0,20),
            fame: Math.max(0, Math.floor(Number(v.fame) || 0)),
            lost: Math.max(0, Math.floor(Number(v.lost) || 0)),
            lv: Math.max(1, Math.floor(Number(v.lv) || 1)),
            wins: Math.max(0, Math.floor(Number(v.wins) || 0)),
            foes: Math.max(0, Math.floor(Number(v.foes) || 0)),
            t: Number(v.t) || 0,
            prot: Number(v.prot) || 0
          });
        });
        rows.sort(function(a,b){ return dispFame(b) - dispFame(a); });
        listCache = {t: Date.now(), rows: rows};
        resolve(rows.slice());
      }, function(err){ toast('⚠️ Không đọc được danh sách (' + esc((err && (err.code || err.message)) || err) + ').'); resolve([]); });
    });
  }

  function startTopListen(){
    stopTopListen();
    const db = rtdb();
    if(!db) return;
    const seas = curSeason();
    const ref = db.ref('seasonRank/' + seas).orderByChild('fame').limitToLast(TOP_LISTEN_LIMIT);
    rankListener = ref.on('value', function(snap){
      const rows = [];
      snap.forEach(function(ch){
        const v = ch.val() || {};
        rows.push({
          uid: ch.key,
          nick: String(v.nick || '?').slice(0,20),
          fame: Math.max(0, Math.floor(Number(v.fame) || 0)),
          lost: Math.max(0, Math.floor(Number(v.lost) || 0)),
          lv: Math.max(1, Math.floor(Number(v.lv) || 1)),
          wins: Math.max(0, Math.floor(Number(v.wins) || 0)),
          foes: Math.max(0, Math.floor(Number(v.foes) || 0)),
          t: Number(v.t) || 0,
            prot: Number(v.prot) || 0
        });
      });
      rows.sort(function(a,b){ return dispFame(b) - dispFame(a); });
      topRows = rows;
      const uid = myUid();
      myRankNum = null;
      if(uid){
        for(let i=0;i<rows.length;i++){
          if(rows[i].uid === uid){ myRankNum = i+1; break; }
        }
      }
      if(panelOpen) renderMain();
    }, function(err){
      toast('⚠️ Không đọc được bảng xếp hạng (' + esc((err && (err.code || err.message)) || err) + '). Kiểm tra Rules Realtime Database.');
    });
  }
  function stopTopListen(){
    if(rankListener && rtdb()){
      try{ rtdb().ref('seasonRank/' + curSeason()).off('value', rankListener); }catch(_){}
    }
    rankListener = null;
  }

  function baseWinFame(myF, oppF){
    const d = FAME_WIN_BASE + Math.round((oppF - myF) / FAME_DIFF_DIV);
    return Math.max(FAME_WIN_MIN, Math.min(FAME_WIN_MAX, d));
  }
  /* uy danh người bị đánh thua mất (chưa chặn theo số uy danh họ còn) */
  function victimLoss(myF, oppF){
    return Math.max(VICTIM_MIN, Math.min(VICTIM_MAX, Math.round(baseWinFame(myF, oppF) * VICTIM_RATIO)));
  }
  function calcFameDelta(myF, oppF, win){
    let d;
    if(win){
      d = baseWinFame(myF, oppF);
    }else{
      d = -Math.round(FAME_WIN_BASE * FAME_LOSE_RATIO);
      d = Math.max(-FAME_LOSE_MAX, Math.min(-FAME_LOSE_MIN, d));
    }
    try{
      if(pet && pet.sp === 6 && typeof spOfPet === 'function'){
        const bonus = spOfPet().v || 0;
        if(bonus > 0) d = Math.round(d * (1 + bonus / 100));
      }
    }catch(_){}
    return d;
  }

  /* Đếm số món mỗi bộ + phẩm chất trung bình (giống eqSetInfo() trong 12-equip.js) */
  function countSetsFromEq(eqArr){
    const cnt = {}, qs = {};
    if(!Array.isArray(eqArr)) return {cnt: cnt, qs: qs};
    const QB = (typeof EQ_QBONUS !== 'undefined' && EQ_QBONUS) ? EQ_QBONUS : [0,.06,.12,.20,.30];
    eqArr.forEach(function(it){
      if(!it || it.z == null) return;
      const z = Math.floor(Number(it.z));
      if(!(z >= 0 && z < 17)) return;
      const q = Math.max(0, Math.min(QB.length - 1, Math.floor(Number(it.q) || 0)));
      cnt[z] = (cnt[z] || 0) + 1;
      (qs[z] = qs[z] || []).push(QB[q] || 0);
    });
    return {cnt: cnt, qs: qs};
  }
  /* Nhân giá trị bộ theo phẩm chất — cùng công thức eqScale() của game gốc */
  function scaleSet(v, qb, z){
    if(typeof eqScale === 'function') return eqScale(v, qb, z);
    const o = {};
    for(const k in v){ o[k] = Math.round(v[k] * (1 + qb) * (1 + (z || 0) * 0.03) * 10) / 10; if(k === 'ch') o[k] = Math.min(100, o[k]); }
    return o;
  }
  function activeSetBuffs(info){
    const out = [];
    if(typeof EQ_SETS === 'undefined' || !EQ_SETS) return out;
    const cnt = info.cnt, qs = info.qs;
    Object.keys(cnt).forEach(function(z){
      const n = cnt[z];
      if(n < 2) return;
      const S = EQ_SETS[z];
      if(!S) return;
      const level = n >= 4 ? 4 : 2;
      const base = level === 4 ? (S.v4 || S.v2) : S.v2;
      const qb = qs[z].reduce(function(a,b){ return a + b; }, 0) / qs[z].length;
      out.push({k: S.k, level: level, v: scaleSet(base, qb, Number(z)), name: S.name, i: S.i});
    });
    return out;
  }

  // kỹ năng thú: {chỉ số kỹ năng: giá trị} — giống mkP/mkM của thám hiểm
  function skillMap(sp, info){
    const k = {};
    if(info && typeof info.v === 'number') k[sp] = info.v;
    return k;
  }
  function mkFighterFromMe(){
    const s = (typeof statsOf === 'function' && pet)
      ? statsOf(pet.bl, pet.pi, pet.base, level)
      : {hp:100,atk:20,def:10,spd:15,mag:10,eva:5,stun:5,regen:1,crit:8};
    const eqArr = (typeof eqWorn !== 'undefined' && Array.isArray(eqWorn))
      ? eqWorn.map(function(it){ return it ? {z: it.z, s: it.s, q: it.q} : null; })
      : [];
    const sets = activeSetBuffs(countSetsFromEq(eqArr));
    return {
      n: myNick(),
      hp: Math.round(s.hp), mx: Math.round(s.hp),
      atk: Math.round(s.atk), def: Math.round(s.def),
      spd: Math.round(s.spd), mag: Math.round(s.mag),
      eva: +s.eva || 0, stun: +s.stun || 0, regen: +s.regen || 0, crit: +s.crit || 0,
      r: 1, stn: 0, sets: sets,
      shield: 0, revived: false, nextEvade: false, firstHit: true,
      bl: pet.bl, k: skillMap(pet.sp, spOfPet()), e: (spOfPet() || {}).e || 1
    };
  }
  function mkFighterFromCard(card, nameFallback){
    const st = (card && card.stats) || {};
    const eqArr = (card && Array.isArray(card.eq)) ? card.eq : [];
    const sets = activeSetBuffs(countSetsFromEq(eqArr));
    const hp = Math.max(1, Math.round(Number(st.hp) || 80));
    const oppBl = (card && card.bl) || 'ho';
    const oppSp = Math.max(0, Math.min(16, Math.floor(Number(card && card.sp) || 0)));
    let oppInfo = null;
    try{
      oppInfo = spInfo(oppSp, (Number(card && card.pi) || 0) + (Number(card && card.up) || 0) * .03, Math.max(0, Math.min(4, Number(card && card.q) || 0)));
    }catch(_){}
    return {
      n: String((card && card.nick) || nameFallback || 'Đối thủ').slice(0,20),
      hp: hp, mx: hp,
      atk: Math.max(1, Math.round(Number(st.atk) || 15)),
      def: Math.max(0, Math.round(Number(st.def) || 8)),
      spd: Math.max(1, Math.round(Number(st.spd) || 12)),
      mag: Math.max(0, Math.round(Number(st.mag) || 8)),
      eva: +st.eva || 5, stun: +st.stun || 3, regen: +st.regen || 1, crit: +st.crit || 6,
      r: 1, stn: 0, sets: sets,
      shield: 0, revived: false, nextEvade: false, firstHit: true,
      bl: oppBl, k: skillMap(oppSp, oppInfo), e: (oppInfo || {}).e || 1
    };
  }

  function hasSet(c, key){
    for(let i=0;i<c.sets.length;i++) if(c.sets[i].k === key) return c.sets[i];
    return null;
  }
  function roll(pct){ return Math.random() * 100 < pct; }

  function simArena(P, Q){
    const ev = [];
    let note = '';
    const kv = function(c, i){ return (c.k && c.k[i]) || 0; };
    const rs = function(c){ return 1 - kv(c, 10) / 100; };           // Kháng hiệu ứng
    const lo = function(c){ return (c.hp < c.mx * .5 && kv(c, 16)) ? 1 + kv(c, 16) / 100 : 1; }; // Bất khuất
    const elem = function(c){ try{ return BL[c.bl].h; }catch(_){ return ''; } };

    // hệ khắc chế (ngũ hành) như thám hiểm
    try{ P.r = relMul(P.bl, Q.bl); Q.r = relMul(Q.bl, P.bl); }catch(_){ P.r = 1; Q.r = 1; }

    const push = function(w, k, d, t, r){
      ev.push({w:w, k:k, d:d, r:r || 1, hp:Math.max(0,P.hp), mh:Math.max(0,Q.hp),
               sp:Math.max(0,P.shield||0), sm:Math.max(0,Q.shield||0), t:t});
    };
    const side = function(c){ return c === P ? 'p' : 'm'; };

    // Làm chậm / Suy yếu (đầu trận)
    [[P, Q], [Q, P]].forEach(function(pr){
      const a = pr[0], d = pr[1];
      if(kv(a, 0)) d.spd *= 1 - kv(a, 0) * rs(d) / 100;
      if(kv(a, 1)) d.atk *= 1 - kv(a, 1) / 100;
    });
    // Khiên (kỹ năng + bộ trang bị)
    [P, Q].forEach(function(c){
      const sh = hasSet(c, 'shield');
      if(sh && sh.v && sh.v.pct) c.shield += Math.round(c.mx * sh.v.pct / 100);
      if(kv(c, 9)) c.shield += Math.round(c.mx * kv(c, 9) / 100);
    });
    const shP0 = P.shield || 0, shM0 = Q.shield || 0;

    const LABEL = {wind:'🌪️ Phong Nhận', thunder:'⚡ Lôi Kích', counter:'🌙 Nguyệt Ảnh phản kích', lava:'🌋 Dung Nham'};

    const deal = function(a, d, baseDm, tag, rr){
      let dm = baseDm;
      const mist = hasSet(d, 'mist');
      if(mist && mist.v && roll(mist.v.ch)){
        dm = Math.max(1, Math.round(dm * 0.5));
        note += ' · ☁️ Sương Tán giảm nửa';
      }
      const sun = hasSet(a, 'sun');
      if(sun && sun.v && d.hp / d.mx > 0.6){
        dm = Math.round(dm * (1 + sun.v.pct / 100));
      }
      if(d.shield > 0){
        const ab = Math.min(d.shield, dm);
        d.shield -= ab;
        dm -= ab;
        if(ab > 0) push(side(d), 'block', ab, '🛡️ Khiên hấp thụ ' + ab + ' sát thương');
      }
      if(dm <= 0){ note = ''; return 0; }
      d.hp -= dm;
      const isCrit = (tag === 'crit');
      const text = LABEL[tag]
        ? LABEL[tag] + ' -' + dm
        : (isCrit ? '💥 Chí mạng! ' : '') + a.n + ' đánh -' + dm + note;
      note = '';
      push(side(a), isCrit ? 'crit' : 'hit', dm, text, LABEL[tag] ? 1 : (rr || 1));
      const th = hasSet(d, 'thorn');
      if(th && th.v && roll(th.v.ch) && a.hp > 0){
        const ref = Math.max(1, Math.round(dm * th.v.pct / 100));
        a.hp = Math.max(0, a.hp - ref);
        push(side(d), 'hit', ref, '↩ Phản đòn -' + ref);
      }
      const fr = hasSet(d, 'frost');
      if(fr && fr.v && roll(fr.v.ch) && d.hp > 0){ a.stn = 1; }
      return dm;
    };

    function checkRevive(c){
      if(c.hp > 0) return;
      // Hồi sinh (kỹ năng thú) — 1 lần mỗi trận
      if(kv(c, 14) && !c.skRevived){
        c.skRevived = true;
        c.hp = Math.max(1, Math.round(c.mx * kv(c, 14) / 100));
        push(side(c), 'heal', c.hp, '✨ Hồi sinh +' + c.hp + ' HP');
        return;
      }
      if(c.revived) return;
      const rv = hasSet(c, 'revive');
      if(rv && rv.v){
        c.revived = true;
        c.hp = Math.max(1, Math.round(c.mx * rv.v.pct / 100));
        push(side(c), 'heal', c.hp, '✨ Hồi sinh +' + c.hp + ' HP (Ngọc Hộ Mệnh)');
      }
    }

    const act = function(a, d){
      if(a.hp <= 0 || d.hp <= 0) return;
      if(a.stn){ a.stn = 0; push(side(a), 'stun', 0, a.n + ' bị choáng/đóng băng, mất lượt!'); return; }
      if(d.nextEvade){
        d.nextEvade = false;
        push(side(a), 'miss', 0, '☁️ ' + d.n + ' ẩn mình trong mây, đòn trượt!');
        return;
      }
      if(roll(d.eva)){
        push(side(a), 'miss', 0, d.n + ' né được đòn!');
        const ct = hasSet(d, 'counter');
        if(ct && ct.v && roll(ct.v.ch) && d.hp > 0){
          const cdm = Math.max(1, Math.round((d.atk + d.mag * 0.3) * 1.6 * 100 / (100 + a.def) * (ct.v.mul / 100)));
          deal(d, a, cdm, 'counter');
        }
        return;
      }
      let forceCrit = false;
      if(a.firstHit){
        const am = hasSet(a, 'ambush');
        if(am && am.v && roll(am.v.ch)) forceCrit = true;
        a.firstHit = false;
      }
      const cr = forceCrit || roll(a.crit + kv(a, 4));
      const ig = kv(a, 8) / 100;                                     // Xuyên giáp
      let dm = Math.max(1, Math.round((a.atk * lo(a) + a.mag * 0.3) * 1.6 * 100 / (100 + d.def * lo(d) * (1 - ig)) * a.r * (cr ? 1.5 + kv(a, 4) * 3 / 100 : 1)));
      if(cr){
        const st = hasSet(a, 'star');
        if(st && st.v && st.v.pct) dm = Math.round(dm * (1 + st.v.pct / 100));
      }
      if(kv(d, 2)){                                                   // Chắn đòn
        const cap = Math.round(d.mx * (60 - 40 * Math.min(1, d.e)) / 100);
        if(dm > cap){ dm = cap; note += ' · 🛡️ Chắn đòn'; }
      }
      if(a.r > 1) note += ' (khắc hệ ' + elem(d) + ')';
      else if(a.r < 1) note += ' (bị hệ ' + elem(d) + ' khắc)';
      const dealt = deal(a, d, dm, cr ? 'crit' : 'hit', a.r);

      if(kv(a, 12) && dealt > 0){                                     // Hút máu
        const heal = Math.min(a.mx - a.hp, Math.round(dealt * kv(a, 12) / 100));
        if(heal > 0){ a.hp += heal; push(side(a), 'heal', heal, '🩸 Hút máu +' + heal + ' HP'); }
      }
      if(kv(a, 3) && dealt > 0 && d.hp > 0 && roll(kv(a, 3))){        // Liên kích
        const x = Math.round(dealt * .5);
        d.hp -= x; push(side(a), 'hit', x, '⚡ Liên kích -' + x);
      }
      if(kv(d, 7) && dealt > 0){                                      // Phản đòn
        const x = Math.max(1, Math.round(dealt * kv(d, 7) / 100));
        a.hp -= x; push(side(d), 'hit', x, '↩ Phản đòn -' + x);
      }
      checkRevive(d); checkRevive(a);

      const wi = hasSet(a, 'wind');
      if(wi && wi.v && roll(wi.v.ch) && d.hp > 0){
        deal(a, d, Math.max(1, Math.round(dm * wi.v.pct / 100)), 'wind');
      }
      const thu = hasSet(a, 'thunder');
      if(thu && thu.v && roll(thu.v.ch) && d.hp > 0){
        deal(a, d, Math.max(1, Math.round(dm * (1 + thu.v.pct / 100))), 'thunder');
      }
      if(d.hp > 0 && a.hp > 0 && roll(a.stun * rs(d))){ d.stn = 1; }
    };

    const first = P.spd >= Q.spd ? P : Q;
    for(let r = 1; r <= 14; r++){
      if(P.hp <= 0 && Q.hp <= 0) break;
      act(first, first === P ? Q : P);
      checkRevive(P); checkRevive(Q);
      act(first === P ? Q : P, first);
      checkRevive(P); checkRevive(Q);

      // Thiêu đốt (kỹ năng)
      [[P, Q], [Q, P]].forEach(function(pr){
        const a = pr[0], d = pr[1];
        if(a.hp > 0 && d.hp > 0 && kv(a, 11)){
          const bd = Math.max(1, Math.round(a.atk * kv(a, 11) * rs(d) / 100));
          d.hp -= bd; push(side(a), 'hit', bd, '🔥 Thiêu đốt -' + bd);
          checkRevive(d);
        }
      });

      [P, Q].forEach(function(c){
        if(c.hp <= 0) return;
        const gr = hasSet(c, 'grove');
        if(gr && gr.v){
          let pct = gr.v.pct;
          if(c.hp / c.mx < 0.5) pct *= 2;
          const heal = Math.min(c.mx - c.hp, Math.round(c.mx * pct / 100));
          if(heal > 0){ c.hp += heal; push(side(c), 'heal', heal, c.n + ' Sinh Cơ +' + heal + ' HP'); }
        }
        if(c.regen){
          const heal = Math.min(c.mx - c.hp, Math.round(c.mx * c.regen / 100));
          if(heal > 0){ c.hp += heal; push(side(c), 'heal', heal, c.n + ' hồi sức +' + heal + ' HP'); }
        }
        const cl = hasSet(c, 'cloud');
        if(cl && cl.v && roll(cl.v.ch)) c.nextEvade = true;
      });
      [P, Q].forEach(function(c){
        const other = c === P ? Q : P;
        if(c.hp <= 0 || other.hp <= 0) return;
        const lv = hasSet(c, 'lava');
        if(lv && lv.v && roll(lv.v.ch)){
          const dm = Math.max(1, Math.round(c.atk * lv.v.pct / 100));
          other.hp = Math.max(0, other.hp - dm);
          push(side(c), 'hit', dm, LABEL.lava + ' -' + dm);
          checkRevive(other);
        }
      });
      if(P.hp <= 0 || Q.hp <= 0) break;
    }
    const win = Q.hp <= 0 || (P.hp > 0 && P.hp / P.mx > Q.hp / Q.mx);
    return { win: win, ev: ev, maxP: P.mx, maxM: Q.mx, shP: shP0, shM: shM0, first: first === P };
  }

  function makeNpcCard(){
    const lv = Math.max(1, Math.min(100, (typeof level==='number'?level:10) + Math.floor(Math.random()*5) - 2));
    const base = 8 + lv * 1.1;
    return {
      nick: NPC_NAMES[Math.floor(Math.random() * NPC_NAMES.length)],   // đổi tên theo loài ở dưới
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
      bl: (Object.keys(window.BL || {ho:1,vu:1,long:1,tuoc:1,lan:1,hu:1}))[Math.floor(Math.random()*6)],
      sp: Math.floor(Math.random()*17),
      st: Math.max(0, Math.min(9, Math.floor(lv/11))),
      pi: 1, up: 0, q: 1,
      eq: [],
      _npc: true
    };
  }
  function makeNpcCardNamed(){
    const c = makeNpcCard();
    try{ const nm = genOf(c.bl, c.sp).name; if(nm) c.nick = String(nm).slice(0,20); }catch(_){}
    return c;
  }

  /* =====================================================================
     GIAO DIỆN CHIẾN ĐẤU ĐẤU TRƯỜNG — dùng lại khung #mob + hiệu ứng của thám hiểm
     (06-mobs.js), chỉ thay: nền đấu trường riêng, đối thủ là thú của người chơi khác.
     Kết quả trận đã tính xong từ simArena; phần này chỉ "diễn lại" các sự kiện.
     ===================================================================== */
  let _arenaBgCv = null;
  function buildArenaBg(){
    const c = document.createElement('canvas'); c.width = 360; c.height = 250;
    const g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    // trời hoàng hôn
    const sky = g.createLinearGradient(0,0,0,150);
    sky.addColorStop(0,'#150d26'); sky.addColorStop(.6,'#3b2240'); sky.addColorStop(1,'#7a4a47');
    g.fillStyle = sky; g.fillRect(0,0,360,150);
    // vài ngôi sao
    g.fillStyle = '#f6e9e4';
    [[20,12],[70,28],[130,10],[200,22],[250,8],[310,26],[340,14],[100,44],[285,48]].forEach(function(p){ g.fillRect(p[0],p[1],2,2); });
    // tường đấu trường (3 tầng khán đài)
    for(let tier=0; tier<3; tier++){
      const y = 62 + tier*26;
      g.fillStyle = tier===0 ? '#3a2f3f' : tier===1 ? '#2f2636' : '#261e2c';
      g.fillRect(0,y,360,26);
      g.fillStyle = 'rgba(0,0,0,.25)';
      for(let x=0; x<360; x+=24){ g.fillRect(x, y, 2, 26); }
      g.fillStyle = 'rgba(255,255,255,.07)'; g.fillRect(0,y,360,2);
    }
    // vòm cổng
    g.fillStyle = '#120a16';
    [[30,106],[150,106],[270,106]].forEach(function(p){
      g.fillRect(p[0],p[1]+10,36,34); g.fillRect(p[0]+4,p[1]+4,28,6); g.fillRect(p[0]+10,p[1],16,4);
    });
    // đỉnh tường
    g.fillStyle = '#51405a'; g.fillRect(0,58,360,5);
    for(let x=0;x<360;x+=18){ g.fillRect(x,52,10,7); }
    // nền cát
    const sand = g.createLinearGradient(0,150,0,250);
    sand.addColorStop(0,'#9b7a4c'); sand.addColorStop(1,'#5d452a');
    g.fillStyle = sand; g.fillRect(0,150,360,100);
    g.fillStyle = '#6e5233'; g.fillRect(0,148,360,4);
    // vòng đấu
    g.strokeStyle = 'rgba(40,24,12,.55)'; g.lineWidth = 3;
    g.beginPath(); g.ellipse(180,222,150,26,0,0,7); g.stroke();
    g.strokeStyle = 'rgba(246,198,106,.35)'; g.lineWidth = 1;
    g.beginPath(); g.ellipse(180,222,120,19,0,0,7); g.stroke();
    // đốm cát
    g.fillStyle = 'rgba(0,0,0,.12)';
    for(let i=0;i<60;i++){ g.fillRect((i*83)%360, 156+((i*37)%90), 2, 1); }
    return c;
  }
  function arenaBg(g, tt){
    if(!_arenaBgCv) _arenaBgCv = buildArenaBg();
    g.drawImage(_arenaBgCv, 0, 0);
    // khán giả nhấp nhô
    for(let r=0;r<3;r++){
      for(let i=0;i<30;i++){
        const x = 6 + i*12 + (r%2)*5;
        const y = 80 + r*26 - Math.round(Math.abs(Math.sin(tt*2.2 + i*1.7 + r))*2);
        const col = ['#c9785a','#6aa7c9','#d9c36a','#8fcf8a','#b98fd9'][(i*3+r*2)%5];
        g.fillStyle = col; g.fillRect(x, y, 5, 5);
        g.fillStyle = '#2a1e2c'; g.fillRect(x, y+5, 5, 3);
      }
    }
    // đuốc hai bên
    [28, 332].forEach(function(x){
      g.fillStyle = '#4a3a2a'; g.fillRect(x-2, 126, 4, 26);
      const f = 6 + Math.round(Math.sin(tt*14 + x)*2);
      g.fillStyle = '#ff7b2e'; g.fillRect(x-4, 120-f/2, 8, 8+f/2);
      g.fillStyle = '#ffd24a'; g.fillRect(x-2, 122-f/3, 4, 5+f/3);
      const gl = g.createRadialGradient(x,126,2,x,126,46);
      gl.addColorStop(0,'rgba(255,170,70,.28)'); gl.addColorStop(1,'rgba(255,170,70,0)');
      g.fillStyle = gl; g.fillRect(x-46,80,92,92);
    });
  }

  // vẽ thú của đối thủ (đứng bên phải, quay mặt sang trái) — theo drawPet của 06-mobs.js
  /* bậc thú của thẻ: ưu tiên tính từ cấp (thẻ cũ có thể thiếu/sai trường st) */
  function cardStage(card){
    let st = Number(card && card.st);
    const lv = Math.floor(Number(card && card.lv) || 0);
    if(lv > 0 && typeof stageOf === 'function'){ try{ st = stageOf(lv); }catch(_){} }
    return Math.max(0, Math.min(9, Math.floor(st) || 0));
  }
  function drawOpp(g, card, cx, by, size, T, dx, al, gh){
    try{
      const {PET_DRAW_SCALE, PET_GROW_MAX, PET_FX} = window.TTGFX;
      const api = window.VanKiepSprites;
      const stage = cardStage(card);
      const im = api ? api.getStageImage(card.bl, card.sp, stage) : null;
      if(!im) return;
      const box = im.bb;
      const grow = PET_GROW_MAX * api.stageScale(stage);
      const drawSize = size * PET_DRAW_SCALE * grow, unit = drawSize / 128;
      const bob = Math.round(Math.sin(T*3 + 1) * 1.5 * PET_DRAW_SCALE), breathe = 1 + Math.sin(T*2.2 + 1) * .014;
      const bodyH = Math.max(box.h*unit, 30), bodyW = Math.max(box.w*unit, 24);
      if(gh){
        g.save(); g.imageSmoothingEnabled = false; g.translate(cx + dx*PET_DRAW_SCALE, by + bob); g.scale(1, breathe);
        g.drawImage(im, -(box.x+box.w/2)*unit, -(box.y+box.h)*unit, drawSize, drawSize); g.restore(); return;
      }
      g.fillStyle = 'rgba(0,0,0,.4)'; g.beginPath(); g.ellipse(cx, by+1, size*.36*PET_DRAW_SCALE*grow, 6*PET_DRAW_SCALE, 0, 0, 7); g.fill();
      const AX = (PET_FX && window.PETAURA && window.PETAURA.ok) ? window.PETAURA : null;
      const pi = Math.max(0, Math.min(4, Number(card.pi) || 0));
      if(AX){ try{ AX.back(g, cx, by, bodyW, bodyH, T, 'battle', stage, card.sp, pi, true, al); }catch(_){} }
      g.save(); g.globalAlpha = al; g.imageSmoothingEnabled = false;
      g.filter = 'drop-shadow(0 0 1px rgba(10,6,14,.9))';
      g.translate(cx + dx*PET_DRAW_SCALE, by + bob); g.scale(1, breathe);
      g.drawImage(im, -(box.x+box.w/2)*unit, -(box.y+box.h)*unit, drawSize, drawSize); g.restore();
      if(AX){ try{ AX.front(g, cx, by, bodyW, bodyH, T, 'battle', stage, card.sp, pi, true, al); }catch(_){} }
    }catch(_){}
  }

  /* diễn lại trận. R = kết quả simArena. Trả Promise khi trận kết thúc. */
  function arenaBattle(R, card, oppName, oppUid){
    return new Promise(function(resolve){
      const SP = (typeof window.BSPD === 'number' && window.BSPD > 0) ? window.BSPD : 1;
      const o = $('mob'), cvs = $('mob-c');
      if(!o || !cvs || !window.TTGFX || !window.TTGFX.drawPet){ console.warn('[arena] thiếu TTGFX (cần 06-mobs.js bản mới)'); resolve(); return; }
      const {drawPet,impact,fxDraw,fxTop,tintDraw,aura,paintUI,evTags,fxClass,fxElem,fxRecoil,lungeAt,FXS,FXRG,REG,BT0,BST,PET_DRAW_SCALE,PET_GROW_MAX,PET_FX} = window.TTGFX;
      const g = cvs.getContext('2d'), rb = $('mob-run');
      const n = R.ev.length, TE = (BT0 + n*BST) / SP;
      const pn = myNick();
      const ps = (typeof statsOf === 'function') ? statsOf(pet.bl, pet.pi, pet.base, level) : {spd:0};
      const oppBL = card.bl || 'ho', oppSP = Math.max(0, Math.min(16, Math.floor(Number(card.sp) || 0)));
      const RP = REG[pet.sp], RM = REG[oppSP];
      const HN = [fxElem((BL[pet.bl]||{}).h), fxElem((BL[oppBL]||{}).h)];
      const CL = R.ev.map(fxClass);
      const REDM = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
      let t0 = performance.now(), done = false, holdUntil = 0, lastF = t0, shAmp = 0, shDur = 1, shEnd = 0;
      const fired = {};

      o.style.display = 'block';
      rb.style.display = 'none';   // đấu trường: không cho bỏ qua, xem trọn trận
      $('mob-pn').textContent = String(pn).slice(0,14) + ' · Lv.' + level;
      $('mob-mn').textContent = String(oppName).slice(0,12) + ' · Lv.' + (card.lv || '?');
      paintUI(RP, RM);
      try{ $('mob-mh').parentNode.style.borderColor = RM[0]; }catch(_){}
      // Ô hệ cạnh thanh máu + nút Bỏ qua: dùng lại battleHudExtra của thám hiểm (10-drops-shop.js)
      try{
        if(typeof window.battleHudExtra === 'function') window.battleHudExtra({m: {bl: oppBL}, uid: oppUid || ''});
        const br = $('mob-pbar2'); if(br) br.innerHTML = '';   // hàng buff Exp/Xu không dùng trong đấu trường
      }catch(e){ console.warn('[arena] hud hệ', e); }

      function fin(){
        if(done) return; done = true;
        o.style.display = 'none'; rb.style.display = 'none'; rb.textContent = '🏃 Chạy';
        ['mob-pe','mob-me','mob-pbar2'].forEach(function(id){ const x = $(id); if(x) x.innerHTML = ''; });
        o.onclick = null; rb.onclick = null;
        resolve();
      }
      rb.onclick = null; o.onclick = null;

      (function L(){
        if(done) return;
        const T0 = performance.now();
        if(T0 < holdUntil){ t0 += T0 - lastF; lastF = T0; requestAnimationFrame(L); return; }
        lastF = T0;
        const T = (T0 - t0) / 1000, tt = T0 / 1000;
        let sx = 0, sy = 0;
        if(T0 < shEnd){ const k = (shEnd - T0) / shDur; sx = Math.round(Math.sin(T0*.11)*shAmp*k); sy = Math.round(Math.cos(T0*.15)*shAmp*.7*k); }
        g.clearRect(0,0,360,250); g.save(); g.translate(sx, sy);
        arenaBg(g, tt);
        let hp = R.maxP, mh = R.maxM, shp = R.shP, shm = R.shM,
            msg = 'Tốc: ' + pn + ' ' + Math.round(ps.spd) + ' · ' + oppName + ' → ' + (R.first ? pn : oppName) + ' ra đòn trước',
            dp = 0, dmx = 0, am = 1, fl = null, fx = null, mf = 0, pf = 0, gst = [], sf = 0;
        FXS.on = 0;
        R.ev.forEach(function(x, i){
          const s = (BT0 + i*BST) / SP, u = (T - s) / (BST / SP);
          if(u < 0) return;
          if(u >= .35){ hp = x.hp; mh = x.mh; shp = x.sp; shm = x.sm; }
          if(u < .9){
            msg = x.t;
            const dmg = x.k==='hit' || x.k==='crit', dot = /Thiêu đốt/.test(x.t), mis = x.k==='miss', pa = x.w==='p', ms = mis ? .6 : 1,
              cl = CL[i], rg = FXRG[HN[pa?0:1]] === 1, lu = !rg && cl !== 3 && cl !== 2,
              lg = dmg && !dot ? (lu ? lungeAt(u) : fxRecoil(u, cl)) : mis ? (lu ? lungeAt(u)*.6 : fxRecoil(u, 0)) : 0;
            if(pa) dp += lg; else dmx -= lg;
            if(dmg || mis){ FXS.on = 1; FXS.u = u; FXS.pa = pa; FXS.cl = cl; FXS.cr = x.k==='crit'; FXS.miss = mis; FXS.h = cl===2 ? 'Hỏa' : HN[pa?0:1]; FXS.s = pa ? pet.sp : oppSP; FXS.i = i; }
            if(lu && lg && u > .12 && u < .37) for(let k=1;k<=5;k++){ const off = lungeAt(u - k*.02)*ms; if(Math.abs(off - lg) > 3) gst.push({pa:pa, off:off, a:.6*(1-(k-1)/5)}); }
            if(mis){ const dd = 16*Math.sin(Math.PI*Math.max(0, Math.min(1, (u-.28)/.42))); if(pa) dmx += dd; else dp -= dd; }
            if(dmg && x.d && u >= .35){
              const hu = u - .35, big = x.k==='crit' ? 1.7 : x.r > 1 ? 1.3 : 1, sc = dot ? .35 : 1, fa = hu < .05 ? 1 : Math.max(0, 1 - (hu-.05)/.17),
                kb = 24*big*sc*Math.pow(Math.max(0, 1 - hu/.4), 2), jt = hu < .25 ? Math.sin(T*70)*4*big*sc*(1-hu/.25) : 0;
              if(!dot && (x.k==='crit' || x.r > 1)) sf = Math.max(sf, Math.max(0, 1 - hu/.12)*.5);
              if(pa){ mf = Math.max(mf, fa); dmx += kb + jt; } else { pf = Math.max(pf, fa); dp -= kb + jt; }
              if(!fired[i]){ fired[i] = 1; if(hu < .12 && !dot){ holdUntil = T0 + (x.k==='crit' ? 190 : x.r > 1 ? 130 : 90)/SP; if(!REDM){ shAmp = x.k==='crit' ? 14 : x.r > 1 ? 9 : 6; shDur = (x.k==='crit' ? 420 : 300)/SP; shEnd = T0 + shDur; } } }
            }
            if(u >= .35){
              const q = (u-.35)/.55, pp = x.w==='p';
              fx = {pp:pp, q:q, k:x.k, d:(x.k==='heal'||x.k==='block') ? 0 : x.d, r:x.r, i:i, h:/Thiêu đốt/.test(x.t) ? 'Hỏa' : BL[pp ? pet.bl : oppBL].h, s:pp ? pet.sp : oppSP, cl:CL[i]};
              if(x.k==='block') fl = {x:pp?90:270, y:130-q*40, t:'🛡️ '+x.d, c:'#8fd0ff', tags:[['KHIÊN HẤP THỤ','#8fd0ff']], q:q, big:1};
              else if(x.k==='heal') fl = {x:pp?90:270, y:130-q*40, t:x.d>0 ? '+'+x.d+' HP' : 'HỒI SỨC', c:'#72e4b0', tags:evTags(x), q:q, big:1};
              else if(x.d){
                const tags = evTags(x), targetH = BL[x.w==='p' ? oppBL : pet.bl].h;
                const EC = {Kim:'#f2d06a', Mộc:'#5be07a', Thủy:'#5bb8ff', Hỏa:'#ff6a3a', Thổ:'#d9a05a', Huyễn:'#c08aff'};
                const ec = EC[BL[pp ? pet.bl : oppBL].h] || '#fff';
                let c = '#fff';
                if(x.r > 1){ c = ec; tags.push(['KHẮC ' + targetH.toUpperCase() + ' ▲', ec]); }
                else if(x.r < 1){ c = '#9aa4b8'; tags.push(['BỊ ' + targetH.toUpperCase() + ' KHẮC ▼', '#9aa4b8']); }
                if(/Chắn đòn/.test(x.t)) tags.unshift(['🛡️ CHẮN ĐÒN', '#8fd0ff']);
                if(x.k==='crit') c = x.r > 1 ? ec : '#ffd24a';
                fl = {x:pp?270:90, y:130-q*55, t:'-'+x.d, c:c, tags:tags, q:q, big:x.k==='crit' || x.r > 1, ring:x.r > 1 ? ec : x.k==='crit' ? '#ffd24a' : null};
              }
              else if(x.k==='miss') fl = {x:x.w==='p'?270:90, y:130-q*40, t:/ẩn mình/.test(x.t) ? 'TRƯỢT!' : 'NÉ!', c:'#7fe8ff', tags:/ẩn mình/.test(x.t) ? [['VÂN ẨN','#c9d8ff']] : [], q:q, big:1};
              else if(x.k==='stun') fl = {x:pp?90:270, y:130-q*40, t:/đóng băng/.test(x.t) ? 'ĐÓNG BĂNG!' : 'CHOÁNG!', c:/đóng băng/.test(x.t) ? '#9fe4ff' : '#ffe45a', tags:[[/đóng băng/.test(x.t) ? '❄️' : '💫','#ffe45a']], q:q, big:1};
            }
          }
        });
        if(T >= TE){
          rb.style.display = 'none';
          msg = R.win ? '🏆 Chiến thắng!' : '💥 Bại trận...';
          if(R.win) am = Math.max(0, 1 - (T-TE)*1.2);
        }
        aura(g, RP, 0, 85, tt); aura(g, RM, 180, 272, tt);
        gst.forEach(function(q){
          if(q.pa) tintDraw(g, function(c){ drawPet(c, 85, 208, 120, tt, q.off, 1, true); }, RP[0], .75, q.a);
          else tintDraw(g, function(c){ drawOpp(c, card, 272, 208, 120, tt, -q.off, 1, true); }, RM[0], .75, q.a);
        });
        drawPet(g, 85, 208, 120, tt, dp, 1);
        drawOpp(g, card, 272, 208, 120, tt, dmx, am, false);
        if(pf > 0) tintDraw(g, function(c){ drawPet(c, 85, 208, 120, tt, dp, 1, true); }, '#ffffff', 1, pf);
        if(mf > 0) tintDraw(g, function(c){ drawOpp(c, card, 272, 208, 120, tt, dmx, 1, true); }, '#ffffff', 1, mf);
        if(fx) impact(g, fx, tt);
        try{ fxDraw(g, tt, dp, dmx); }catch(_){}
        g.restore();
        if(sf > 0){ g.save(); g.globalAlpha = sf; g.fillStyle = '#fff'; g.fillRect(0,0,360,250); g.restore(); }
        if(FXS.on && FXS.cr && !FXS.miss){ try{ fxTop(g, FXS.u, REDM); }catch(_){} }
        if(fl){
          g.save(); g.globalAlpha = Math.min(1, 2.2 - fl.q*1.6); g.textAlign = 'center';
          if(fl.ring){ g.strokeStyle = fl.ring; g.lineWidth = 3; g.globalAlpha *= .8; g.beginPath(); g.arc(fl.x, 150, 10 + fl.q*50, 0, 7); g.stroke(); g.globalAlpha = Math.min(1, 2.2 - fl.q*1.6); }
          g.font = 'bold ' + (fl.big ? 26 : 20) + 'px monospace'; g.lineWidth = 5; g.strokeStyle = '#160e1c';
          g.strokeText(fl.t, fl.x, fl.y); g.fillStyle = fl.c; g.fillText(fl.t, fl.x, fl.y);
          g.font = 'bold 12px monospace'; g.lineWidth = 3;
          fl.tags.forEach(function(tg, i){ const yy = fl.y - 24 - i*14; g.strokeText(tg[0], fl.x, yy); g.fillStyle = tg[1]; g.fillText(tg[0], fl.x, yy); });
          g.restore();
        }
        $('mob-ph').style.width = Math.round(hp / R.maxP * 100) + '%';
        $('mob-mh').style.width = Math.round(mh / R.maxM * 100) + '%';
        $('mob-pt').innerHTML = hp + '/' + R.maxP + '';
        $('mob-mt').innerHTML = mh + '/' + R.maxM + '';
        const a = $('mob-ps'), b = $('mob-ms');
        if(a) a.style.width = (R.shP > 0 ? Math.round(shp / R.shP * 100) : 0) + '%';
        if(b) b.style.width = (R.shM > 0 ? Math.round(shm / R.shM * 100) : 0) + '%';
        $('mob-r').textContent = msg;
        if(T > TE + 2.4/SP) fin(); else requestAnimationFrame(L);
      })();
    });
  }

  function startFight(targetUid, targetNick, targetFame, isNpc, vrow){
    if(fighting) return;
    try{ if(window.TTGFX && TTGFX.getBusy && TTGFX.getBusy()){ toast('⏳ Đang bận (thám hiểm?). Hãy dừng thám hiểm trước khi vào đấu trường.'); return; } }catch(_){}
    if(isGuest()){ toast('🔒 Khách chỉ xem bảng xếp hạng, hãy đăng nhập để khiêu chiến.'); return; }
    if(!hatched || !pet){ toast('🥚 Cần thú đã nở mới khiêu chiến.'); return; }
    if(!window.TTGSEASON || !TTGSEASON.useTicket){ toast('⚠️ Module mùa chưa sẵn sàng.'); return; }
    if(!TTGSEASON.useTicket()){
      toast('🎫 Hết vé Đấu trường. ' + (TTGSEASON.ticketsStr ? TTGSEASON.ticketsStr() : ''));
      return;
    }
    fighting = true;
    const seasonAtFight = curSeason();
    const myF = myDispFame();
    const oppF = Math.max(0, Math.floor(targetFame || 0));

    const runFight0 = function(card){
      const P = mkFighterFromMe();
      const Q = mkFighterFromCard(card, targetNick || (card && card.nick));
      const R = simArena(P, Q);
      const delta = calcFameDelta(myF, oppF, R.win);
      // BƯỚC 5: người bị đánh thua mất uy danh (không trừ quá số họ còn)
      let vLoss = 0;
      if(R.win && !isNpc && targetUid){
        vLoss = Math.min(victimLoss(myF, oppF), oppF);
      }

      // Kết quả được chốt NGAY (đóng game giữa trận cũng không né được thua)
      fame = Math.max(0, fame + delta);

      let winsAdd = 0, foesAdd = 0;
      if(R.win && !isNpc && targetUid){
        winsAdd = 1;
        if(!recentFight[targetUid]) foesAdd = 1;
      }
      if(targetUid){ recentFight[targetUid] = Date.now(); saveRecent(); }

      if(window.TTGSEASON && TTGSEASON.writeSeasonRank){
        try{
          TTGSEASON.writeSeasonRank({
            fame: fame,
            addWins: winsAdd,
            addFoes: foesAdd,
            lv: (typeof level === 'number' ? level : 1)
          }).then(function(res){
            if(res && !res.ok) toast('⚠️ Không ghi được bảng xếp hạng (' + esc(res.error) + '). Kiểm tra đã Publish Rules Realtime Database chưa.');
            else if(panelOpen) refreshTop();
          });
        }catch(e){ console.warn('[arena] ghi rank', e); }
      }
      try{ if(window.TTGSAVE && TTGSAVE.save) TTGSAVE.save(); }catch(_){}
      try{ if(typeof stats === 'function') stats(); }catch(_){}

      // BƯỚC 5: ghi nhật ký cho người bị thách đấu + trừ uy danh họ (chạy nền, không chặn trận)
      if(!isNpc && targetUid){
        sendDefenderResult(targetUid, R.win, vLoss, seasonAtFight).then(function(r){
          if(r && r.warn) toast(r.warn);
        });
      }

      const after = function(){
        try{ if(window.TTGFX) TTGFX.setBusy(false); }catch(_){}
        fighting = false;
        showResult({ win: R.win, name: Q.n, delta: delta, myFame: fame, isNpc: !!isNpc, vLoss: vLoss });
      };

      // chuyển sang màn chiến đấu (đóng bảng đấu trường trước)
      showPanel(false);
      try{ if(window.TTGFX) TTGFX.setBusy(true); }catch(_){}
      arenaBattle(R, card, Q.n, isNpc ? '' : targetUid).then(after).catch(function(e){
        console.error('[arena] battle', e);
        after();
      });
    };

    const runFight = function(card){
      try{ runFight0(card); }
      catch(e){
        console.error('[arena] lỗi trận', e);
        fighting = false;
        toast('⚠️ Lỗi khi đấu: ' + esc(e && e.message ? e.message : e));
      }
    };

    if(isNpc){
      runFight(makeNpcCardNamed());
    }else{
      getCard(targetUid).then(function(card){
        if(!card){
          toast('⚠️ Không đọc được thẻ đối thủ, dùng NPC tạm.');
          runFight(makeNpcCardNamed());
        }else{
          runFight(card);
        }
      });
    }
  }

  /* ---------- BƯỚC 5: KIỂM TRA ĐỐI THỦ TRƯỚC KHI TRỪ VÉ ---------- */
  function fmtAgo(ms){
    ms = Math.max(0, ms);
    const m = Math.floor(ms / 60000);
    if(m < 1) return 'vừa xong';
    if(m < 60) return m + ' phút trước';
    const h = Math.floor(m / 60);
    if(h < 24) return h + ' giờ trước';
    return Math.floor(h / 24) + ' ngày trước';
  }

  /* Đọc node đối thủ (đang được bảo vệ?) + mốc lần đánh gần nhất của mình vào họ (cùng cặp 1 giờ).
     Chưa trừ vé, nên bị từ chối thì không mất gì. */
  function precheck(vUid){
    return new Promise(function(resolve){
      const db = rtdb(), me = myUid();
      if(!db || !me){ resolve({ok:false, msg:'⚠️ Chưa kết nối máy chủ.'}); return; }
      const s = curSeason();
      Promise.all([
        db.ref('seasonRank/' + s + '/' + vUid).once('value'),
        db.ref('arenaLog/' + vUid + '/' + me + '/t').once('value')
      ]).then(function(r){
        const vn = r[0], lt = Number(r[1].val()) || 0;
        if(!vn.exists()){ resolve({ok:false, msg:'⚠️ Đối thủ không còn trong bảng xếp hạng mùa này.'}); return; }
        const v = vn.val() || {};
        const now = nowSrv();
        const prot = Number(v.prot) || 0;
        if(prot > now){ resolve({ok:false, msg:'🛡️ Đối thủ đang được bảo vệ, còn ' + fmtMs(prot - now) + '.'}); return; }
        if(lt && (now - lt) < PAIR_COOLDOWN_MS){
          resolve({ok:false, msg:'⏳ Bạn vừa thách đấu người này. Chờ ' + fmtMs(PAIR_COOLDOWN_MS - (now - lt)) + ' nữa.'}); return;
        }
        resolve({ok:true, row:{
          fame: Math.max(0, Math.floor(Number(v.fame) || 0)),
          lost: Math.max(0, Math.floor(Number(v.lost) || 0))
        }});
      }).catch(function(e){
        resolve({ok:false, msg:'⚠️ Không kiểm tra được đối thủ (' + esc((e && (e.code || e.message)) || e) + '). Đã Publish Rules Realtime Database bản mới chưa?'});
      });
    });
  }

  function doChallenge(targetUid, targetNick, targetFame, isNpc){
    if(fighting) return;
    if(window.TTGGUARD && TTGGUARD.locked()){ try{ TTGGUARD.say(); }catch(_){} return; }
    if(isNpc || !targetUid){ startFight(targetUid, targetNick, targetFame, isNpc, null); return; }
    if(isGuest()){ toast('🔒 Khách chỉ xem bảng xếp hạng, hãy đăng nhập để khiêu chiến.'); return; }
    fighting = true;      // khóa bấm đúp trong lúc kiểm tra
    precheck(targetUid).then(function(pc){
      fighting = false;
      if(!pc.ok){ toast(pc.msg); try{ if(panelOpen) refreshTop(); }catch(_){} return; }
      // dùng uy danh MỚI NHẤT của đối thủ (đã trừ lost), không dùng số cũ trong danh sách
      startFight(targetUid, targetNick, Math.max(0, pc.row.fame - pc.row.lost), false, pc.row);
    });
  }

  /* ---------- BƯỚC 5: GỬI KẾT QUẢ CHO NGƯỜI BỊ THÁCH ĐẤU ----------
     1) ghi arenaLog/{B}/{A}  (Rules: A chỉ ghi dưới tên mình, cùng cặp cách nhau >= 1 giờ)
     2) nếu A thắng và loss > 0: cộng seasonRank/{mùa}/{B}/lost (+ hit, prot, lg) trong VÀI GIÂY sau khi ghi nhật ký
        (Rules đối chiếu số trừ với nhật ký vừa ghi nên không trừ tùy tiện được)
     3) nếu A thua: B thủ thành công → xóa chuỗi "bị đánh liên tiếp" của B (hit = 0) */
  function sendDefenderResult(vUid, win, loss, season){
    const db = rtdb(), me = myUid();
    if(!db || !me || !vUid) return Promise.resolve({});
    const lref = db.ref('arenaLog/' + vUid + '/' + me);
    return lref.set({
      name: myNick(),
      result: win ? 'win' : 'lose',
      lost: win ? Math.max(0, Math.floor(loss)) : 0,
      season: season,
      t: firebase.database.ServerValue.TIMESTAMP
    }).then(function(){
      if(win && loss > 0){
        return lref.child('t').once('value').then(function(sn){
          return applyHit(db, vUid, me, season, loss, Number(sn.val()) || 0, 0);
        });
      }
      if(!win) return resetHit(db, vUid, season);
      return {};
    }).catch(function(e){
      console.warn('[arena] gửi kết quả cho người bị thách đấu lỗi', e);
      const code = String((e && (e.code || e.message)) || e);
      if(/PERMISSION_DENIED/i.test(code)) return { warn: '⚠️ Không ghi được nhật ký/trừ uy danh đối thủ (Rules từ chối). Đối thủ có thể vừa được bảo vệ, hoặc bạn đã đánh người này trong 1 giờ qua.' };
      return { warn: '⚠️ Không gửi được kết quả cho đối thủ (' + esc(code) + ').' };
    });
  }

  function applyHit(db, vUid, me, season, loss, logT, tries){
    const vref = db.ref('seasonRank/' + season + '/' + vUid);
    return vref.once('value').then(function(sn){
      if(!sn.exists()) return {};
      const v = sn.val() || {};
      const now = nowSrv();
      if((Number(v.prot) || 0) > now) return { warn: '🛡️ Đối thủ vừa được người khác đánh nên đang được bảo vệ, lần này không bị trừ uy danh.' };
      const curLost = Math.max(0, Math.floor(Number(v.lost) || 0));
      const curHit  = Math.max(0, Math.floor(Number(v.hit) || 0));
      const shield  = (curHit + 1 >= SHIELD_AFTER);
      const upd = {
        lost: curLost + loss,
        hit:  shield ? 0 : curHit + 1,
        prot: now + (shield ? SHIELD_MS : PROT_MS)
      };
      upd['lg/' + me] = logT;
      return vref.update(upd).then(function(){ return {}; }).catch(function(e){
        // thường do người khác vừa cộng lost cùng lúc → đọc lại và thử lần nữa
        if(tries < 2) return applyHit(db, vUid, me, season, loss, logT, tries + 1);
        throw e;
      });
    });
  }

  function resetHit(db, vUid, season){
    const href = db.ref('seasonRank/' + season + '/' + vUid + '/hit');
    return href.once('value').then(function(sn){
      if((Number(sn.val()) || 0) > 0) return href.set(0).then(function(){ return {}; });
      return {};
    });
  }

  /* ---------- BƯỚC 5: NHẬT KÝ BỊ THÁCH ĐẤU (mình là người bị đánh) ---------- */
  function seenKey(){ return 'ttg_arena_seen_' + (myUid() || ''); }
  function getSeen(){ try{ return Number(localStorage.getItem(seenKey())) || 0; }catch(_){ return 0; } }
  function setSeen(t){ try{ localStorage.setItem(seenKey(), String(t)); }catch(_){} }

  function updateBadge(){
    const btn = $('btn-arena');
    if(btn){
      let dot = $('ar-dot');
      if(!dot){
        dot = document.createElement('span');
        dot.id = 'ar-dot';
        dot.style.cssText = 'position:absolute;top:-6px;right:-6px;min-width:18px;height:18px;line-height:18px;padding:0 4px;border-radius:9px;background:#e34e48;color:#fff;font-size:11px;font-weight:700;text-align:center;box-sizing:border-box;pointer-events:none;display:none;z-index:3';
        if(getComputedStyle(btn).position === 'static') btn.style.position = 'relative';
        btn.appendChild(dot);
      }
      dot.textContent = unreadN > 9 ? '9+' : String(unreadN);
      dot.style.display = unreadN > 0 ? 'block' : 'none';
    }
    const lb = $('ar-btn-log');
    if(lb) lb.textContent = unreadN > 0 ? ('Nhật ký (' + unreadN + ')') : 'Nhật ký';
  }

  function stopLogListen(){
    if(logRef && logCb){ try{ logRef.off('value', logCb); }catch(_){} }
    logRef = null; logCb = null; logReady = false;
  }

  function startLogListen(){
    if(logRef) return;
    if(isGuest()) return;
    const db = rtdb(), uid = myUid();
    if(!db || !uid) return;
    logRef = db.ref('arenaLog/' + uid).orderByChild('t').limitToLast(LOG_KEEP);
    logCb = logRef.on('value', function(snap){
      const rows = [];
      snap.forEach(function(ch){
        const v = ch.val() || {};
        rows.push({
          uid: ch.key,
          name: String(v.name || '?').slice(0, 20),
          result: v.result === 'win' ? 'win' : 'lose',   // 'win' = NGƯỜI THÁCH ĐẤU thắng (mình thua)
          lost: Math.max(0, Math.floor(Number(v.lost) || 0)),
          season: Math.floor(Number(v.season) || 0),
          t: Number(v.t) || 0
        });
      });
      rows.sort(function(a,b){ return b.t - a.t; });
      logRows = rows;
      // lần tải đầu: chỉ đếm chưa đọc; các lần sau: báo mục mới
      if(logReady){
        rows.forEach(function(r){
          if(r.t > lastToastT){
            toast(r.result === 'win'
              ? ('⚔️ <b>' + esc(r.name) + '</b> thách đấu bạn và thắng' + (r.lost ? (', bạn mất <b>' + r.lost + '</b> uy danh') : '') + '.')
              : ('🛡️ Bạn thủ thành công trước <b>' + esc(r.name) + '</b>.'));
          }
        });
      }
      rows.forEach(function(r){ if(r.t > lastToastT) lastToastT = r.t; });
      const seen = getSeen();
      unreadN = rows.filter(function(r){ return r.t > seen; }).length;
      logReady = true;
      updateBadge();
      const sub = $('ar-sub');
      if(sub && sub.classList.contains('show') && $('ar-sub-title') && $('ar-sub-title').textContent === 'Nhật ký') openLog0(true);
    }, function(err){
      console.warn('[arena] nghe nhật ký lỗi', err);
    });
  }

  function openLog0(keepScroll){
    const sub = $('ar-sub'), title = $('ar-sub-title'), body = $('ar-sub-body');
    if(!sub || !body) return;
    title.textContent = 'Nhật ký';
    const cur = curSeason();
    let head = '';
    try{
      const pu = (window.TTGSEASON && TTGSEASON.myProtUntil) ? TTGSEASON.myProtUntil() : 0;
      if(pu) head = '<div style="padding:6px 8px;margin-bottom:6px;background:#1a3335;border:1px solid #72e4b0;border-radius:6px;font-size:13px;text-align:center">🛡️ Bạn đang được bảo vệ, còn <b>' + esc(fmtMs(pu - nowSrv())) + '</b> (không ai thách đấu được)</div>';
    }catch(_){}
    if(isGuest()){
      body.innerHTML = '<div class="empty">Khách không có nhật ký. Hãy đăng nhập.</div>';
    }else if(!logRows.length){
      body.innerHTML = head + '<div class="empty">Chưa có ai thách đấu bạn.<br><small>Thú của bạn vẫn đứng gác đấu trường cả khi bạn offline.</small></div>';
    }else{
      const now = nowSrv();
      body.innerHTML = head + logRows.map(function(r){
        const old = (r.season && r.season !== cur) ? ' <span style="color:#78864f">(mùa ' + r.season + ')</span>' : '';
        const txt = r.result === 'win'
          ? ('<b>' + esc(r.name) + '</b> thách đấu bạn · <span style="color:#e34e48">bạn THUA</span>' + (r.lost ? (', <b style="color:#f6c66a">-' + r.lost + '</b> uy danh') : ', không mất thêm uy danh'))
          : ('<b>' + esc(r.name) + '</b> thách đấu bạn · <span style="color:#72e4b0">bạn THỦ THÀNH CÔNG</span>');
        return '<div class="row" style="display:block;line-height:1.4"><div>' + txt + old + '</div>' +
          '<div style="font-size:12px;color:#b7bda9">' + esc(fmtAgo(now - r.t)) + '</div></div>';
      }).join('');
    }
    sub.classList.add('show');
    // mở nhật ký = đã đọc
    if(logRows.length){ setSeen(logRows[0].t); unreadN = 0; updateBadge(); }
  }

  function ensurePanel(){
    if($('ar-ov')) return;
    const css = document.createElement('style');
    css.id = 'ar-css';
    css.textContent =
      '#cv-ov{z-index:125 !important}'+
      '#ar-ov{position:fixed;inset:0;z-index:120;background:rgba(4,10,14,.95);display:none;align-items:stretch;justify-content:center;font-family:inherit}'+
      '#ar-ov.show{display:flex}'+
      '#ar-box{width:min(100vw,480px);height:100vh;height:100dvh;max-height:none;background:#14272d;border:3px solid #f6c66a;box-shadow:0 4px 0 #040a0e;display:flex;flex-direction:column;color:#f5edcf;font-size:15px;overflow:hidden;position:relative}'+
      '#ar-box .hd{display:flex;justify-content:space-between;align-items:center;padding:8px 10px;border-bottom:2px solid #78613a;color:#f6c66a;font-size:17px;flex-shrink:0}'+
      '#ar-box .hd button{width:auto;margin:0;padding:2px 10px;font-size:18px;background:#3b4a4f;border:2px solid #040a0e;color:#f5edcf;cursor:pointer}'+
      '#ar-body{flex:1;overflow-y:auto;padding:8px 10px;min-height:0}'+
      '#ar-podium{display:flex;gap:6px;justify-content:center;align-items:flex-end;margin-bottom:10px;padding-top:26px}'+
      '#ar-podium .slot{flex:1;max-width:120px;background:#0f1f24;border:2px solid #78613a;border-radius:6px;padding:6px 4px;text-align:center;cursor:pointer}'+
      '#ar-podium .slot.t1{border-color:#f6c66a;order:2}'+
      '#ar-podium .slot.t2{border-color:#c0c8d0;order:1;transform:scale(.92)}'+
      '#ar-podium .slot.t3{border-color:#cd7f32;order:3;transform:scale(.92)}'+
      '#ar-podium .slot canvas{width:72px;height:72px;image-rendering:pixelated;display:block;margin:0 auto 4px;background:#0b1a20;border:1px solid #3a4a44}'+
      '#ar-podium .slot .rn{font-size:15px;color:#f6c66a;font-weight:700;margin-top:3px;text-shadow:1px 1px 0 #071116}'+
      '#ar-podium .slot .nm{font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin:2px 0}'+
      '#ar-podium .slot .lv{font-size:11px;color:#72e4b0}'+
      '#ar-podium .slot .fm{font-size:13px;color:#f6c66a;font-weight:700}'+
      '#ar-podium .empty-slot{opacity:.45;pointer-events:none}'+
      '#ar-toprest{margin-bottom:8px}'+
      '#ar-toprest .tr{display:flex;align-items:center;gap:6px;padding:5px 4px;border-bottom:1px solid #2a3c42;font-size:14px;cursor:pointer}'+
      '#ar-toprest .tr .rk{min-width:22px;color:#f6c66a;font-weight:700}'+
      '#ar-toprest .tr .nm{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'+
      '#ar-toprest .tr .lv{color:#72e4b0;font-size:12px;min-width:38px}'+
      '#ar-toprest .tr .fm{color:#f6c66a;min-width:48px;text-align:right}'+
      '#ar-me{padding:6px 8px;background:#1a3335;border:1px solid #78613a;border-radius:6px;margin-bottom:8px;font-size:14px;text-align:center}'+
      '#ar-me b{color:#f6c66a}'+
      '#ar-actions{display:flex;gap:6px;padding:8px 10px;border-top:2px solid #78613a;flex-shrink:0}'+
      '#ar-actions button{flex:1;padding:8px 2px;font-size:12px;font-weight:700;cursor:pointer;background:#3b4a4f;border:2px solid #040a0e;color:#f5edcf;border-radius:4px}'+
      '#ar-actions button.pri{background:#1e5c45;border-color:#72e4b0;color:#e8fff4}'+
      '#ar-actions button:disabled{opacity:.45;cursor:not-allowed}'+
      '#ar-sub{display:none;position:absolute;inset:0;background:#14272d;z-index:2;flex-direction:column}'+
      '#ar-sub.show{display:flex}'+
      '#ar-sub .shd{display:flex;justify-content:space-between;align-items:center;padding:8px 10px;border-bottom:2px solid #78613a;color:#f6c66a;font-size:16px}'+
      '#ar-sub .shd button{width:auto;margin:0;padding:2px 10px;font-size:16px;background:#3b4a4f;border:2px solid #040a0e;color:#f5edcf;cursor:pointer}'+
      '#ar-sub .sbody{flex:1;overflow-y:auto;padding:8px 10px}'+
      '#ar-sub .row{display:flex;align-items:center;gap:6px;padding:7px 4px;border-bottom:1px solid #2a3c42;font-size:14px}'+
      '#ar-sub .row .nm{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'+
      '#ar-sub .row .lv{color:#72e4b0;font-size:12px;min-width:38px}'+
      '#ar-sub .row .fm{color:#f6c66a;min-width:48px;text-align:right}'+
      '#ar-sub .row button{width:auto;margin:0;padding:3px 8px;font-size:13px;cursor:pointer;background:#3b4a4f;border:2px solid #040a0e;color:#f5edcf}'+
      '#ar-sub .row button.go{background:#1e5c45;border-color:#72e4b0;color:#e8fff4}'+
      '#ar-sub table{width:100%;border-collapse:collapse;font-size:13px}'+
      '#ar-sub th,#ar-sub td{padding:5px 4px;border-bottom:1px solid #2a3c42;text-align:left}'+
      '#ar-sub th{color:#f6c66a}'+
      '#ar-sub .empty{padding:18px;text-align:center;color:#78864f}'+
      '#ar-toast{position:absolute;left:10px;right:10px;top:54px;z-index:5;display:none;padding:9px 12px;background:#3a1618;border:2px solid #e34e48;color:#ffe2df;font-size:14px;line-height:1.4;text-align:center;word-break:break-word}'+
      '#ar-toast.show{display:block}'+
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
        '<div class="hd"><span>⚔️ Đấu Trường</span><button type="button" id="ar-x">✕</button></div>'+
        '<div id="ar-toast"></div>'+
        '<div id="ar-body"></div>'+
        '<div id="ar-actions">'+
          '<button type="button" id="ar-btn-reward">Phần thưởng</button>'+
          '<button type="button" id="ar-btn-chal" class="pri">Khiêu chiến</button>'+
          '<button type="button" id="ar-btn-log">Nhật ký</button>'+
          '<button type="button" id="ar-btn-info">Thông tin mùa</button>'+
        '</div>'+
        '<div id="ar-sub">'+
          '<div class="shd"><span id="ar-sub-title">—</span><button type="button" id="ar-sub-back">←</button></div>'+
          '<div class="sbody" id="ar-sub-body"></div>'+
        '</div>'+
      '</div>';
    document.body.appendChild(ov);

    const res = document.createElement('div');
    res.id = 'ar-res';
    res.innerHTML = '<div class="box" id="ar-res-box"></div>';
    document.body.appendChild(res);

    $('ar-x').onclick = function(){ showPanel(false); };
    $('ar-sub-back').onclick = function(){ closeSub(); };
    $('ar-btn-reward').onclick = function(){ openRewards(); };
    $('ar-btn-chal').onclick = function(){ openChallenge(); };
    $('ar-btn-info').onclick = function(){ openSeasonInfo(); };
    $('ar-btn-log').onclick = function(){ openLog(); };
    updateBadge();
  }

  function refreshTop(){
    loadRankList(true).then(function(rows){
      if(rows && rows.length){
        topRows = rows;
        const uid = myUid();
        myRankNum = null;
        if(uid){ for(let i=0;i<rows.length;i++) if(rows[i].uid===uid){ myRankNum=i+1; break; } }
        if(panelOpen) renderMain();
      }
    });
  }

  function showPanel(v){
    ensurePanel();
    if(v){ try{ if(window.TTGSEASON && TTGSEASON.afterLogin) TTGSEASON.afterLogin(); }catch(e){ console.warn('[arena] afterLogin', e); } }
    panelOpen = !!v;
    if(v && !isGuest() && window.TTGSEASON && TTGSEASON.writeSeasonRank){
      // đảm bảo tên mình có trên bảng xếp hạng mùa này
      try{
        TTGSEASON.writeSeasonRank({ lv: (typeof level === 'number' ? level : 1) }).then(function(res){
          if(res && !res.ok) toast('⚠️ Không ghi được bảng xếp hạng (' + esc(res.error) + '). Kiểm tra đã Publish Rules Realtime Database chưa.');
          else if(panelOpen) refreshTop();
        });
      }catch(_){}
    }
    const ov = $('ar-ov');
    if(!ov) return;
    ov.classList.toggle('show', panelOpen);
    if(panelOpen){
      startTopListen();
      if(!topRows.length && listCache.rows.length) topRows = listCache.rows.slice();
      renderMain();
      loadRankList(true).then(function(rows){
        if(rows && rows.length){
          topRows = rows;
          const uid = myUid();
          myRankNum = null;
          if(uid){
            for(let i=0;i<rows.length;i++) if(rows[i].uid===uid){ myRankNum=i+1; break; }
          }
          if(panelOpen) renderMain();
        }
      });
    }else{
      stopTopListen();
      closeSub();
    }
  }

  function closeSub(){
    const s = $('ar-sub');
    if(s) s.classList.remove('show');
  }

  function petScene(x,api,bl,sp,st,pi,T){
    /* Cảnh thú: dùng lại ĐÚNG nền theo vùng (sceneDraw), bệ theo vùng (formation) và cỡ thú theo bậc của màn chính.
       Vẽ cảnh lên canvas chính rồi cắt vùng quanh thú (giống cách thám hiểm làm). */
    const im=api&&api.getStageImage(bl,sp,st);if(!im)return false;
    const mc=document.getElementById('cv'),R=128/180,OX=90,OY=48;   /* cắt khung 180x180 quanh thú (thú đứng ở 180,194 trên màn chính) */
    let sceneOk=false;
    try{
      if(mc&&typeof sceneDraw==='function'){
        const K=mc.width/360,mx=mc.getContext('2d');
        mx.save();mx.setTransform(K,0,0,K,0,0);
        sceneDraw(T,sp);
        mx.setTransform(K,0,0,K,0,0);
        if(typeof formation==='function')formation(T,sp);
        mx.restore();
        x.save();x.imageSmoothingEnabled=false;x.drawImage(mc,OX*K,OY*K,180*K,180*K,0,0,128,128);x.restore();sceneOk=true}
    }catch(e){}
    if(!sceneOk){x.fillStyle='#0b1a20';x.fillRect(0,0,128,128)}
    let size=84;
    try{size=PET_STAGE_MAX_SIZE*genOf(bl,sp).sz*api.stageScale(st)*R}catch(e){}   /* cỡ theo bậc: lên bậc thú lớn dần như màn chính */
    const by=(194-OY)*R+Math.sin(T*3.8)*1.7*R,bb=im.bb,bw=bb.w*size/128,bh=bb.h*size/128,
      AX=window.PETAURA&&window.PETAURA.ok?window.PETAURA:null;
    x.fillStyle='rgba(0,0,0,.42)';x.beginPath();x.ellipse(64,by+1,size*.38,5,0,0,7);x.fill();
    if(AX){try{AX.back(x,64,by,bw,bh,T,'main',st,sp,pi||0,true,1)}catch(_){}}
    const ok=api.drawStage(x,bl,sp,st,64,by,size);
    if(AX){try{AX.front(x,64,by,bw,bh,T,'main',st,sp,pi||0,true,1)}catch(_){}}
    return ok}
  
  function drawTopPet(canvas, card, T){
    if(!canvas || !card) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,128,128);
    try{
      const api = window.VanKiepSprites;
      const stage = cardStage(card);
      if(api && api.getStageImage(card.bl || 'ho', Math.floor(Number(card.sp) || 0), stage)){
        if(petScene(ctx, api, card.bl || 'ho', Math.floor(Number(card.sp) || 0), stage, Math.max(0, Math.min(4, Number(card.pi) || 0)), T || 0)) return;
      }
    }catch(_){}
    const icons = {ho:'🦊',vu:'🦅',long:'🐉',tuoc:'🐦',lan:'🦌',hu:'✨'};
    ctx.font = '48px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icons[card.bl] || '🐾', 64, 64);
  }

  /* vòng lặp vẽ động cho 3 ô top (hào quang chuyển động); tự dừng khi đóng bảng */
  let podList = [], podRaf = 0, podLast = 0;
  function podLoop(ts){
    podRaf = 0;
    if(!panelOpen) return;
    podList = podList.filter(function(p){ return p.cv.isConnected; });
    if(!podList.length) return;
    if(ts - podLast >= 55){
      podLast = ts;
      const t = ts / 1000;
      podList.forEach(function(p){ if(p.card) drawTopPet(p.cv, p.card, t); });
    }
    podRaf = requestAnimationFrame(podLoop);
  }
  function podStart(){ if(!podRaf) podRaf = requestAnimationFrame(podLoop); }

  function renderMain(){
    try{ renderMain0(); }catch(e){ console.error(e); const b=$('ar-body'); if(b) b.innerHTML='<div class="empty" style="color:#ff9a94">⚠️ Lỗi hiển thị: '+esc(e&&e.message?e.message:e)+'</div>'; }
  }
  function renderMain0(){
    const body = $('ar-body');
    if(!body) return;
    const seas = curSeason();
    const meF = myDispFame();
    const rankTxt = myRankNum ? ('Hạng <b>' + myRankNum + '</b>') : 'Chưa có hạng';
    let meShield = '';
    try{
      const pu = (window.TTGSEASON && TTGSEASON.myProtUntil) ? TTGSEASON.myProtUntil() : 0;
      if(pu) meShield = '<br><small style="color:#72e4b0">🛡️ Đang được bảo vệ, còn ' + esc(fmtMs(pu - nowSrv())) + '</small>';
    }catch(_){}
    let tk = '';
    try{ tk = (window.TTGSEASON && TTGSEASON.ticketsStr) ? TTGSEASON.ticketsStr() : ''; }catch(e){ tk = 'Vé: lỗi ' + (e && e.message); }

    let podiumHtml = '<div id="ar-podium">';
    for(let i=0;i<3;i++){
      const r = topRows[i];
      const cls = 'slot t'+(i+1) + (r ? '' : ' empty-slot');
      if(!r){
        podiumHtml += '<div class="'+cls+'"><div style="height:72px"></div><div class="nm">Trống</div><div class="rn">#'+(i+1)+'</div></div>';
      }else{
        podiumHtml += '<div class="'+cls+'" data-uid="'+esc(r.uid)+'" data-nick="'+esc(r.nick)+'">'+
          '<canvas width="128" height="128" data-i="'+i+'"></canvas>'+
          '<div class="nm">'+esc(r.nick)+'</div>'+
          '<div class="lv">Lv.'+r.lv+'</div>'+
          '<div class="fm">'+dispFame(r)+'</div>'+
          '<div class="rn">#'+(i+1)+'</div></div>';
      }
    }
    podiumHtml += '</div>';

    let rest = '<div id="ar-toprest">';
    for(let i=3;i<Math.min(10, topRows.length);i++){
      const r = topRows[i];
      rest += '<div class="tr" data-uid="'+esc(r.uid)+'" data-nick="'+esc(r.nick)+'">'+
        '<span class="rk">'+(i+1)+'</span>'+
        '<span class="nm">'+esc(r.nick)+'</span>'+
        '<span class="lv">Lv.'+r.lv+'</span>'+
        '<span class="fm">'+dispFame(r)+'</span></div>';
    }
    if(topRows.length < 4) rest += '<div class="empty">Chưa đủ người trong top</div>';
    rest += '</div>';

    body.innerHTML =
      podiumHtml +
      rest +
      '<div id="ar-me">Mùa <b>'+seas+'</b> · '+rankTxt+' · Uy danh <b>'+meF+'</b><br><small style="color:#b7bda9">'+esc(tk)+'</small>'+meShield+'</div>';

    body.querySelectorAll('[data-uid]').forEach(function(el){
      el.onclick = function(){
        const u = el.getAttribute('data-uid');
        const n = el.getAttribute('data-nick') || '';
        if(u && window.TTGVIEW && TTGVIEW.view) TTGVIEW.view(u, n);
      };
    });

    podList = [];
    body.querySelectorAll('#ar-podium canvas').forEach(function(cv){
      const i = Number(cv.getAttribute('data-i'));
      const r = topRows[i];
      if(!r) return;
      const ent = {cv: cv, card: null};
      podList.push(ent);
      if(r.uid === myUid() && typeof pet !== 'undefined' && pet){
        // thú của chính mình: lấy trực tiếp từ game, luôn đúng thú đang dùng
        ent.card = {bl: pet.bl, sp: pet.sp, pi: pet.pi, st: (typeof stageOf === 'function' && typeof level === 'number') ? stageOf(level) : 0};
        drawTopPet(cv, ent.card, 0); podStart();
      }else{
        getCard(r.uid).then(function(card){
          ent.card = card || {bl:'ho', sp:0, st:0};
          drawTopPet(cv, ent.card, 0); podStart();
        });
      }
    });

    const btnC = $('ar-btn-chal');
    if(btnC) btnC.disabled = isGuest();
  }

  function openRewards0(){
    const sub = $('ar-sub');
    const title = $('ar-sub-title');
    const body = $('ar-sub-body');
    if(!sub||!body) return;
    title.textContent = 'Phần thưởng mùa';
    let h = '<p style="font-size:13px;color:#b7bda9;margin:0 0 8px">Phát vào <b>Hộp thư</b> khi kết thúc mùa (tự động, sau 00:00 thứ Hai). Danh hiệu kèm đuôi « · Mùa N ».<br>Điều kiện nhận thưởng: thắng tối thiểu <b>'+((window.TTGCFG&&TTGCFG.MIN_WINS)||3)+'</b> trận với ít nhất <b>'+((window.TTGCFG&&TTGCFG.MIN_FOES)||2)+'</b> đối thủ khác nhau, thú đã nở.</p>';
    h += '<table><tr><th>Bậc</th><th>Xu</th><th>Hộp NL</th><th>Huyết mạch</th><th>Danh hiệu</th></tr>';
    REWARD_TABLE.forEach(function(r){
      h += '<tr><td>'+esc(r.rank)+'</td><td>'+r.xu+'</td><td>'+(r.box||'—')+'</td><td>'+(r.blood||'—')+'</td><td>'+esc(r.title)+'</td></tr>';
    });
    h += '</table>';
    h += '<p style="font-size:12px;color:#78864f;margin-top:8px">Hộp NL = hộp nguyên liệu chế trang bị (chọn vùng khi nhận). Huyết mạch = nguyên liệu nâng huyết mạch (Giọt Huyết Mạch, Thảo Dược, Tinh Hoa hệ thú).</p>';
    body.innerHTML = h;
    sub.classList.add('show');
  }

  function openChallenge0(){
    const sub = $('ar-sub');
    const title = $('ar-sub-title');
    const body = $('ar-sub-body');
    if(!sub||!body) return;
    title.textContent = 'Khiêu chiến';
    body.innerHTML = '<div class="empty">Đang tải danh sách gần uy danh...</div>';
    sub.classList.add('show');

    loadRankList(true).then(function(rows){
      const uid = myUid();
      const myF = myDispFame();
      const now = Date.now();
      let filtered = rows.filter(function(r){
        if(r.uid === uid) return false;
        if(recentFight[r.uid] && (now - recentFight[r.uid]) < PAIR_COOLDOWN_MS) return false;   // cùng cặp: 1 giờ
        if(r.prot && r.prot > nowSrv()) return false;                                            // đang được bảo vệ → không hiện
        return true;
      });
      filtered.sort(function(a,b){
        return Math.abs(dispFame(a)-myF) - Math.abs(dispFame(b)-myF);
      });
      const near = filtered.slice(0, NEAR_ABOVE + NEAR_BELOW);

      if(!near.length){
        body.innerHTML =
          '<div class="empty">Chưa có đối thủ phù hợp.<br>Bạn có thể đấu NPC để luyện.</div>'+
          '<div style="text-align:center;margin-top:10px"><button type="button" class="go" id="ar-npc" style="padding:8px 16px;background:#1e5c45;border:2px solid #72e4b0;color:#e8fff4;cursor:pointer">Đấu NPC</button></div>';
        const btn = $('ar-npc');
        if(btn) btn.onclick = function(){ closeSub(); doChallenge(null, 'NPC', myF, true); };
        return;
      }

      body.innerHTML = near.map(function(r){
        const df = dispFame(r);
        const can = !isGuest();
        return '<div class="row">'+
          '<span class="nm">'+esc(r.nick)+'</span>'+
          '<span class="lv">Lv.'+r.lv+'</span>'+
          '<span class="fm">'+df+'</span>'+
          '<button type="button" class="view" data-uid="'+esc(r.uid)+'" data-nick="'+esc(r.nick)+'">Xem</button>'+
          (can ? '<button type="button" class="go" data-uid="'+esc(r.uid)+'" data-nick="'+esc(r.nick)+'" data-fame="'+df+'">Khiêu chiến</button>' : '')+
          '</div>';
      }).join('');

      body.querySelectorAll('button.view').forEach(function(b){
        b.onclick = function(){
          const u = b.getAttribute('data-uid');
          const n = b.getAttribute('data-nick') || '';
          if(window.TTGVIEW && TTGVIEW.view) TTGVIEW.view(u, n);
        };
      });
      body.querySelectorAll('button.go').forEach(function(b){
        b.onclick = function(){
          const u = b.getAttribute('data-uid');
          const n = b.getAttribute('data-nick') || '';
          const f = Number(b.getAttribute('data-fame') || 0);
          closeSub();
          doChallenge(u, n, f, false);
        };
      });
    }).catch(function(e){
      console.error('[arena] khiêu chiến', e);
      body.innerHTML = '<div class="empty" style="color:#ff9a94">⚠️ Lỗi tải danh sách: ' + esc(e && e.message ? e.message : e) + '</div>';
    });
  }

  function openSeasonInfo0(){
    const sub = $('ar-sub');
    const title = $('ar-sub-title');
    const body = $('ar-sub-body');
    if(!sub||!body) return;
    title.textContent = 'Thông tin mùa';
    const seas = curSeason();
    const endVN = (window.TTGSEASON && TTGSEASON.seasonEndVN) ? TTGSEASON.seasonEndVN() : '—';
    const cd = (window.TTGSEASON && TTGSEASON.countdownStr) ? TTGSEASON.countdownStr() : '—';
    const meF = myDispFame();
    const rankTxt = myRankNum ? String(myRankNum) : '—';
    const tk = (window.TTGSEASON && TTGSEASON.getTickets) ? TTGSEASON.getTickets() : '?';
    const tkMax = (window.TTGSEASON && TTGSEASON.TICKET_MAX) || 10;
    const nextTk = (window.TTGSEASON && TTGSEASON.nextTicketIn) ? TTGSEASON.nextTicketIn() : '';

    body.innerHTML =
      '<div style="line-height:1.55;font-size:14px">'+
      '<div><b>Mùa hiện tại:</b> Mùa '+seas+'</div>'+
      '<div><b>Kết thúc:</b> '+esc(endVN)+' <small>(còn '+esc(cd)+')</small></div>'+
      '<div style="margin-top:6px"><b>Hạng của bạn:</b> '+rankTxt+'</div>'+
      '<div><b>Uy danh:</b> <span style="color:#f6c66a">'+meF+'</span></div>'+
      '<div><b>Vé:</b> '+tk+' / '+tkMax+(nextTk ? ' <small>(vé tiếp sau '+esc(fmtMs(nextTk))+')</small>' : '')+'</div>'+
      '<hr style="border:none;border-top:1px solid #2a3c42;margin:10px 0">'+
      '<div style="font-size:13px;color:#b7bda9">Khi mùa kết thúc:</div>'+
      '<ul style="margin:4px 0 0 18px;padding:0;font-size:13px;color:#b7bda9">'+
        '<li>Chốt hạng & phát thưởng vào <b>Hộp thư</b></li>'+
        '<li>Uy danh về 0, sang mùa mới đấu lại</li>'+
        '<li>Danh hiệu « · Mùa '+seas+' » gắn trên thẻ thú</li>'+
      '</ul></div>';
    sub.classList.add('show');
  }

  function safeOpen(name, fn){
    return function(){
      try{ fn(); }
      catch(e){
        console.error('[arena] ' + name, e);
        const sub = $('ar-sub'), body = $('ar-sub-body');
        if(sub && body){
          $('ar-sub-title').textContent = 'Lỗi';
          body.innerHTML = '<div class="empty" style="color:#ff9a94">⚠️ Không mở được: ' + esc(e && e.message ? e.message : e) + '</div>';
          sub.classList.add('show');
        }
      }
    };
  }
  const openRewards = safeOpen('Phần thưởng', openRewards0);
  const openChallenge = safeOpen('Khiêu chiến', openChallenge0);
  const openSeasonInfo = safeOpen('Thông tin mùa', openSeasonInfo0);
  const openLog = safeOpen('Nhật ký', openLog0);

  function showResult(o){
    ensurePanel();
    const box = $('ar-res-box');
    const res = $('ar-res');
    if(!box||!res) return;
    const sign = o.delta >= 0 ? ('+'+o.delta) : String(o.delta);
    box.innerHTML =
      '<div style="font-size:15px;color:#b7bda9;margin-bottom:6px">'+esc(o.name)+(o.isNpc?' (NPC)':'')+'</div>'+
      '<b class="'+(o.win?'win':'lose')+'">'+(o.win?'THẮNG':'THUA')+'</b>'+
      '<div style="margin-top:8px;font-size:16px">Uy danh <b style="color:#f6c66a">'+sign+'</b></div>'+
      ((o.win && !o.isNpc) ? ('<div style="font-size:13px;color:#b7bda9">'+(o.vLoss > 0 ? ('Đối thủ mất <b style="color:#e34e48">-'+o.vLoss+'</b> uy danh') : 'Đối thủ đã hết uy danh nên không mất thêm')+'</div>') : '')+
      '<div style="font-size:14px;color:#b7bda9">Hiện tại: '+o.myFame+(myRankNum?(' · Hạng '+myRankNum):'')+'</div>'+
      '<button type="button" id="ar-res-ok">Đóng</button>';
    res.classList.add('show');
    $('ar-res-ok').onclick = function(){ res.classList.remove('show'); showPanel(true); };
  }

  function start(){
    window.arena = function(){ showPanel(true); };
    const btn = $('btn-arena');
    if(btn){
      btn.onclick = function(){ window.arena(); };
    }
    try{
      if(typeof addExp === 'function' && !addExp._arenaWrapped){
        const _addExp = addExp;
        window.addExp = function(n){
          const lv0 = level;
          _addExp(n);
          if(level > lv0 && window.TTGSEASON && TTGSEASON.writeSeasonRank){
            TTGSEASON.writeSeasonRank({ lv: level });
          }
        };
        window.addExp._arenaWrapped = true;
      }
    }catch(_){}
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', start);
  }else{
    setTimeout(start, 0);
  }

  window.TTGARENA = {
    showPanel: showPanel,
    doChallenge: doChallenge,
    loadRankList: loadRankList,
    getCard: getCard,
    startLogListen: startLogListen,
    stopLogListen: stopLogListen,
    victimLoss: victimLoss,
    sendDefenderResult: sendDefenderResult,
    precheck: precheck,
    PAIR_COOLDOWN_MS: PAIR_COOLDOWN_MS,
    PROT_MS: PROT_MS,
    SHIELD_AFTER: SHIELD_AFTER,
    SHIELD_MS: SHIELD_MS,
    calcFameDelta: calcFameDelta,
    NEAR_ABOVE: NEAR_ABOVE,
    NEAR_BELOW: NEAR_BELOW,
    FAME_WIN_BASE: FAME_WIN_BASE,
    REWARD_TABLE: REWARD_TABLE,
    _test:{simArena:simArena, mkFighterFromMe:mkFighterFromMe, mkFighterFromCard:mkFighterFromCard, makeNpcCard:makeNpcCard}
  };

})();
