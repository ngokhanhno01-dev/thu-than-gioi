/* ===== 26-arena.js — Bước 3+4: Đối thủ bóng, Khiêu Chiến, mô phỏng full set, GIAO DIỆN ĐẤU TRƯỜNG
   Nạp SAU 25-season.js (TTGSEASON) và 23-view.js (TTGVIEW / drawPet).
   Uy danh CHỈ thay đổi ở đây. Nguồn cũ (thám hiểm / Linh Đan / Linh Quả) đã tắt ở 05-hatch.js.
   Attacker cộng lost + arenaLog = Bước 5.
*/
(function(){
  'use strict';

  /* ---------- HẰNG SỐ ---------- */
  const NEAR_ABOVE = 5;
  const NEAR_BELOW = 5;
  const RECENT_MS  = 5 * 60 * 1000;
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

  const REWARD_TABLE = [
    {rank:'Hạng 1',      title:'Chí Tôn Đấu Trường', xu:5000, box:3, blood:5, note:'Danh hiệu + phần thưởng cao nhất'},
    {rank:'Hạng 2',      title:'Vô Địch Đấu Trường', xu:3000, box:2, blood:3, note:'Danh hiệu'},
    {rank:'Hạng 3',      title:'Cao Thủ Đấu Trường', xu:2000, box:2, blood:2, note:'Danh hiệu'},
    {rank:'Hạng 4–10',   title:'—',                  xu:800,  box:1, blood:1, note:'Chỉ phần thưởng'},
    {rank:'Hạng 11–30',  title:'—',                  xu:300,  box:0, blood:0, note:'Xu khuyến khích'},
    {rank:'Tham gia',    title:'—',                  xu:100,  box:0, blood:0, note:'Đủ trận + đối thủ khác nhau'}
  ];

  const NPC_NAMES = ['Hắc Phong Lang','Thanh Mộc Hổ','Lôi Vân Điểu','Huyết Ảnh Xà','Kim Sơn Khải'];

  let cardCache = {};
  let listCache = {t:0, rows:[]};
  let recentFight = {};
  let panelOpen = false;
  let busy = false;
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
      if(window.TTGNET && TTGNET.me && TTGNET.me.name) return String(TTGNET.me.name).slice(0,20);
      if(typeof nick === 'string') return nick.slice(0,20);
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
            t: Number(v.t) || 0
          });
        });
        rows.sort(function(a,b){ return dispFame(b) - dispFame(a); });
        listCache = {t: Date.now(), rows: rows};
        resolve(rows.slice());
      }, function(){ resolve([]); });
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
          t: Number(v.t) || 0
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
    });
  }
  function stopTopListen(){
    if(rankListener && rtdb()){
      try{ rtdb().ref('seasonRank/' + curSeason()).off('value', rankListener); }catch(_){}
    }
    rankListener = null;
  }

  function calcFameDelta(myF, oppF, win){
    let d;
    if(win){
      const diff = oppF - myF;
      d = FAME_WIN_BASE + Math.round(diff / FAME_DIFF_DIV);
      d = Math.max(FAME_WIN_MIN, Math.min(FAME_WIN_MAX, d));
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

  function countSetsFromEq(eqArr){
    const cnt = {};
    if(!Array.isArray(eqArr)) return cnt;
    eqArr.forEach(function(it){
      if(!it || it.z == null) return;
      const z = Math.floor(Number(it.z));
      if(z >= 0 && z < 17) cnt[z] = (cnt[z] || 0) + 1;
    });
    return cnt;
  }
  function activeSetBuffs(cnt){
    const out = [];
    if(typeof EQ_SETS === 'undefined' || !EQ_SETS) return out;
    Object.keys(cnt).forEach(function(z){
      const n = cnt[z];
      if(n < 2) return;
      const S = EQ_SETS[z];
      if(!S) return;
      const level = n >= 4 ? 4 : 2;
      const v = level === 4 ? (S.v4 || S.v2) : S.v2;
      out.push({k: S.k, level: level, v: v, name: S.name, i: S.i});
    });
    return out;
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
      shield: 0, revived: false, nextEvade: false, firstHit: true
    };
  }
  function mkFighterFromCard(card, nameFallback){
    const st = (card && card.stats) || {};
    const eqArr = (card && Array.isArray(card.eq)) ? card.eq : [];
    const sets = activeSetBuffs(countSetsFromEq(eqArr));
    const hp = Math.max(1, Math.round(Number(st.hp) || 80));
    return {
      n: String((card && card.nick) || nameFallback || 'Đối thủ').slice(0,20),
      hp: hp, mx: hp,
      atk: Math.max(1, Math.round(Number(st.atk) || 15)),
      def: Math.max(0, Math.round(Number(st.def) || 8)),
      spd: Math.max(1, Math.round(Number(st.spd) || 12)),
      mag: Math.max(0, Math.round(Number(st.mag) || 8)),
      eva: +st.eva || 5, stun: +st.stun || 3, regen: +st.regen || 1, crit: +st.crit || 6,
      r: 1, stn: 0, sets: sets,
      shield: 0, revived: false, nextEvade: false, firstHit: true
    };
  }

  function hasSet(c, key){
    for(let i=0;i<c.sets.length;i++) if(c.sets[i].k === key) return c.sets[i];
    return null;
  }
  function roll(pct){ return Math.random() * 100 < pct; }

  function simArena(P, Q){
    const ev = [];
    const push = function(w, k, d, t){
      ev.push({w:w, k:k, d:d, t:t, hp:Math.max(0,P.hp), mh:Math.max(0,Q.hp)});
    };

    [P, Q].forEach(function(c){
      const sh = hasSet(c, 'shield');
      if(sh && sh.v && sh.v.pct){
        c.shield = Math.round(c.mx * sh.v.pct / 100);
        if(c.shield > 0) push(c===P?'p':'m', 'shield', c.shield, c.n + ' nhận khiên ' + c.shield);
      }
    });

    const deal = function(a, d, baseDm, tag){
      let dm = baseDm;
      const mist = hasSet(d, 'mist');
      if(mist && mist.v && roll(mist.v.ch)){
        dm = Math.max(1, Math.round(dm * 0.5));
        push(a===P?'p':'m', 'mist', dm, d.n + ' Sương Tán, chỉ nhận nửa');
      }
      const sun = hasSet(a, 'sun');
      if(sun && sun.v && d.hp / d.mx > 0.6){
        dm = Math.round(dm * (1 + sun.v.pct / 100));
      }
      if(d.shield > 0){
        const ab = Math.min(d.shield, dm);
        d.shield -= ab;
        dm -= ab;
        if(ab > 0) push(a===P?'p':'m', 'block', ab, d.n + ' khiên chặn ' + ab);
      }
      if(dm <= 0) return 0;
      d.hp -= dm;
      push(a===P?'p':'m', tag || 'hit', dm, a.n + ' gây ' + dm);
      const th = hasSet(d, 'thorn');
      if(th && th.v && roll(th.v.ch) && a.hp > 0){
        const ref = Math.max(1, Math.round(dm * th.v.pct / 100));
        a.hp = Math.max(0, a.hp - ref);
        push(d===P?'p':'m', 'thorn', ref, d.n + ' phản ' + ref);
      }
      const fr = hasSet(d, 'frost');
      if(fr && fr.v && roll(fr.v.ch) && d.hp > 0){
        a.stn = 1;
        push(d===P?'p':'m', 'frost', 0, a.n + ' bị đóng băng');
      }
      return dm;
    };

    const act = function(a, d){
      if(a.hp <= 0 || d.hp <= 0) return;
      if(a.stn){ a.stn = 0; push(a===P?'p':'m', 'stun', 0, a.n + ' bị choáng/đóng băng, bỏ lượt'); return; }
      if(d.nextEvade){
        d.nextEvade = false;
        push(a===P?'p':'m', 'miss', 0, a.n + ' đánh trượt (Vân Ẩn)');
        return;
      }
      if(roll(d.eva)){
        push(a===P?'p':'m', 'miss', 0, a.n + ' đánh trượt (né)');
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
      const cr = forceCrit || roll(a.crit);
      let dm = Math.max(1, Math.round((a.atk + a.mag * 0.3) * 1.6 * 100 / (100 + d.def) * a.r * (cr ? 1.5 : 1)));
      if(cr){
        const st = hasSet(a, 'star');
        if(st && st.v && st.v.pct){
          dm = Math.round(dm * (1 + st.v.pct / 100));
        }
      }
      deal(a, d, dm, cr ? 'crit' : 'hit');
      const wi = hasSet(a, 'wind');
      if(wi && wi.v && roll(wi.v.ch) && d.hp > 0){
        const extra = Math.max(1, Math.round(dm * wi.v.pct / 100));
        deal(a, d, extra, 'wind');
      }
      const thu = hasSet(a, 'thunder');
      if(thu && thu.v && roll(thu.v.ch) && d.hp > 0){
        const extra = Math.max(1, Math.round(dm * (1 + thu.v.pct / 100)));
        deal(a, d, extra, 'thunder');
      }
      if(d.hp > 0 && roll(a.stun)){ d.stn = 1; push(a===P?'p':'m', 'stun', 0, d.n + ' bị choáng'); }
    };

    function checkRevive(c){
      if(c.hp > 0 || c.revived) return;
      const rv = hasSet(c, 'revive');
      if(rv && rv.v){
        c.revived = true;
        c.hp = Math.max(1, Math.round(c.mx * rv.v.pct / 100));
        push(c===P?'p':'m', 'revive', c.hp, c.n + ' hồi sinh với ' + c.hp + ' HP');
      }
    }

    const first = P.spd >= Q.spd ? P : Q;
    for(let r = 1; r <= 14; r++){
      if(P.hp <= 0 && Q.hp <= 0) break;
      act(first, first === P ? Q : P);
      checkRevive(P); checkRevive(Q);
      act(first === P ? Q : P, first);
      checkRevive(P); checkRevive(Q);

      [P, Q].forEach(function(c){
        if(c.hp <= 0) return;
        const gr = hasSet(c, 'grove');
        if(gr && gr.v){
          let pct = gr.v.pct;
          if(c.hp / c.mx < 0.5) pct *= 2;
          const heal = Math.min(c.mx - c.hp, Math.round(c.mx * pct / 100));
          if(heal > 0){ c.hp += heal; push(c===P?'p':'m', 'heal', heal, c.n + ' Sinh Cơ +' + heal); }
        }
        if(c.regen){
          const heal = Math.min(c.mx - c.hp, Math.round(c.mx * c.regen / 100));
          if(heal > 0){ c.hp += heal; push(c===P?'p':'m', 'heal', heal, c.n + ' hồi +' + heal); }
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
          push(c===P?'p':'m', 'lava', dm, c.n + ' Dung Nham -' + dm);
          checkRevive(other);
        }
      });
      if(P.hp <= 0 || Q.hp <= 0) break;
    }
    const win = Q.hp <= 0 || (P.hp > 0 && (Q.hp <= 0 || P.hp / P.mx >= Q.hp / Q.mx));
    return { win: win, ev: ev, maxP: P.mx, maxM: Q.mx };
  }

  function makeNpcCard(){
    const lv = Math.max(1, Math.min(100, (typeof level==='number'?level:10) + Math.floor(Math.random()*5) - 2));
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
      eq: [],
      _npc: true
    };
  }

  function doChallenge(targetUid, targetNick, targetFame, isNpc){
    if(busy) return;
    if(isGuest()){ toast('🔒 Khách chỉ xem bảng xếp hạng, hãy đăng nhập để khiêu chiến.'); return; }
    if(!hatched || !pet){ toast('🥚 Cần thú đã nở mới khiêu chiến.'); return; }
    if(!window.TTGSEASON || !TTGSEASON.useTicket){ toast('⚠️ Module mùa chưa sẵn sàng.'); return; }
    if(!TTGSEASON.useTicket()){
      toast('🎫 Hết vé Đấu trường. ' + (TTGSEASON.ticketsStr ? TTGSEASON.ticketsStr() : ''));
      return;
    }
    busy = true;
    const myF = myDispFame();
    const oppF = Math.max(0, Math.floor(targetFame || 0));

    const runFight0 = function(card){
      const P = mkFighterFromMe();
      const Q = mkFighterFromCard(card, targetNick || (card && card.nick));
      const R = simArena(P, Q);
      const delta = calcFameDelta(myF, oppF, R.win);

      fame = Math.max(0, fame + delta);

      let winsAdd = 0, foesAdd = 0;
      if(R.win && !isNpc && targetUid){
        winsAdd = 1;
        if(!recentFight[targetUid]) foesAdd = 1;
      }
      if(targetUid) recentFight[targetUid] = Date.now();

      if(window.TTGSEASON && TTGSEASON.writeSeasonRank){
        try{
          TTGSEASON.writeSeasonRank({
            fame: fame,
            wins: winsAdd || undefined,
            foes: foesAdd || undefined,
            lv: (typeof level === 'number' ? level : 1)
          });
        }catch(e){ console.warn('[arena] ghi rank', e); }
      }
      try{ if(window.TTGSAVE && TTGSAVE.save) TTGSAVE.save(); }catch(_){}
      try{ if(typeof stats === 'function') stats(); }catch(_){}

      showResult({
        win: R.win,
        name: Q.n,
        delta: delta,
        myFame: fame,
        isNpc: !!isNpc
      });
      busy = false;
      if(panelOpen) renderMain();
    };

    const runFight = function(card){
      try{ runFight0(card); }
      catch(e){
        console.error('[arena] lỗi trận', e);
        busy = false;
        toast('⚠️ Lỗi khi đấu: ' + esc(e && e.message ? e.message : e));
      }
    };

    if(isNpc){
      runFight(makeNpcCard());
    }else{
      getCard(targetUid).then(function(card){
        if(!card){
          toast('⚠️ Không đọc được thẻ đối thủ, dùng NPC tạm.');
          runFight(makeNpcCard());
        }else{
          runFight(card);
        }
      });
    }
  }

  function ensurePanel(){
    if($('ar-ov')) return;
    const css = document.createElement('style');
    css.id = 'ar-css';
    css.textContent =
      '#ar-ov{position:fixed;inset:0;z-index:120;background:rgba(4,10,14,.95);display:none;align-items:stretch;justify-content:center;font-family:inherit}'+
      '#ar-ov.show{display:flex}'+
      '#ar-box{width:min(100vw,480px);height:100vh;height:100dvh;max-height:none;background:#14272d;border:3px solid #f6c66a;box-shadow:0 4px 0 #040a0e;display:flex;flex-direction:column;color:#f5edcf;font-size:15px;overflow:hidden;position:relative}'+
      '#ar-box .hd{display:flex;justify-content:space-between;align-items:center;padding:8px 10px;border-bottom:2px solid #78613a;color:#f6c66a;font-size:17px;flex-shrink:0}'+
      '#ar-box .hd button{width:auto;margin:0;padding:2px 10px;font-size:18px;background:#3b4a4f;border:2px solid #040a0e;color:#f5edcf;cursor:pointer}'+
      '#ar-body{flex:1;overflow-y:auto;padding:8px 10px;min-height:0}'+
      '#ar-podium{display:flex;gap:6px;justify-content:center;align-items:flex-end;margin-bottom:10px}'+
      '#ar-podium .slot{flex:1;max-width:120px;background:#0f1f24;border:2px solid #78613a;border-radius:6px;padding:6px 4px;text-align:center;cursor:pointer}'+
      '#ar-podium .slot.t1{border-color:#f6c66a;order:2}'+
      '#ar-podium .slot.t2{border-color:#c0c8d0;order:1;transform:scale(.92)}'+
      '#ar-podium .slot.t3{border-color:#cd7f32;order:3;transform:scale(.92)}'+
      '#ar-podium .slot canvas{width:72px;height:72px;image-rendering:pixelated;display:block;margin:0 auto 4px;background:#0b1a20;border:1px solid #3a4a44}'+
      '#ar-podium .slot .rn{font-size:12px;color:#f6c66a;font-weight:700}'+
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
      '#ar-actions button{flex:1;padding:8px 4px;font-size:13px;font-weight:700;cursor:pointer;background:#3b4a4f;border:2px solid #040a0e;color:#f5edcf;border-radius:4px}'+
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
  }

  function showPanel(v){
    ensurePanel();
    if(v){ try{ if(window.TTGSEASON && TTGSEASON.afterLogin) TTGSEASON.afterLogin(); }catch(e){ console.warn('[arena] afterLogin', e); } }
    panelOpen = !!v;
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

  function drawTopPet(canvas, card){
    if(!canvas || !card) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,128,128);
    try{
      const bl = card.bl || 'ho';
      const sp = Math.floor(Number(card.sp) || 0);
      const st = Math.floor(Number(card.st) || 0);
      const api = window.Sprites || window.SPRITE || window.TTGSPRITE;
      if(api && typeof api.drawStageCentered === 'function'){
        api.drawStageCentered(ctx, bl, sp, st, 64, 64, 128);
        return;
      }
    }catch(_){}
    const icons = {ho:'🦊',vu:'🦅',long:'🐉',tuoc:'🐦',lan:'🦌',hu:'✨'};
    ctx.fillStyle = '#0b1a20';
    ctx.fillRect(0,0,128,128);
    ctx.font = '48px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icons[card.bl] || '🐾', 64, 64);
  }

  function renderMain(){
    try{ renderMain0(); }catch(e){ console.error(e); const b=$('ar-body'); if(b) b.innerHTML='<div class="empty" style="color:#ff9a94">⚠️ Lỗi hiển thị: '+esc(e&&e.message?e.message:e)+'</div>'; }
  }
  function renderMain0(){
    const body = $('ar-body');
    if(!body) return;
    const seas = curSeason();
    const meF = myDispFame();
    const rankTxt = myRankNum ? ('Hạng <b>' + myRankNum + '</b>') : 'Chưa có hạng';
    let tk = '';
    try{ tk = (window.TTGSEASON && TTGSEASON.ticketsStr) ? TTGSEASON.ticketsStr() : ''; }catch(e){ tk = 'Vé: lỗi ' + (e && e.message); }

    let podiumHtml = '<div id="ar-podium">';
    for(let i=0;i<3;i++){
      const r = topRows[i];
      const cls = 'slot t'+(i+1) + (r ? '' : ' empty-slot');
      if(!r){
        podiumHtml += '<div class="'+cls+'"><div class="rn">#'+(i+1)+'</div><div style="height:72px"></div><div class="nm">Trống</div></div>';
      }else{
        podiumHtml += '<div class="'+cls+'" data-uid="'+esc(r.uid)+'" data-nick="'+esc(r.nick)+'">'+
          '<div class="rn">#'+(i+1)+'</div>'+
          '<canvas width="128" height="128" data-i="'+i+'"></canvas>'+
          '<div class="nm">'+esc(r.nick)+'</div>'+
          '<div class="lv">Lv.'+r.lv+'</div>'+
          '<div class="fm">'+dispFame(r)+'</div></div>';
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
      '<div id="ar-me">Mùa <b>'+seas+'</b> · '+rankTxt+' · Uy danh <b>'+meF+'</b><br><small style="color:#b7bda9">'+esc(tk)+'</small></div>';

    body.querySelectorAll('[data-uid]').forEach(function(el){
      el.onclick = function(){
        const u = el.getAttribute('data-uid');
        const n = el.getAttribute('data-nick') || '';
        if(u && window.TTGVIEW && TTGVIEW.view) TTGVIEW.view(u, n);
      };
    });

    body.querySelectorAll('#ar-podium canvas').forEach(function(cv){
      const i = Number(cv.getAttribute('data-i'));
      const r = topRows[i];
      if(!r) return;
      getCard(r.uid).then(function(card){
        drawTopPet(cv, card || {bl:'ho', sp:0, st:0});
      });
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
    let h = '<p style="font-size:13px;color:#b7bda9;margin:0 0 8px">Phát vào <b>Hộp thư</b> khi kết thúc mùa. Danh hiệu kèm đuôi « · Mùa N ». Số liệu đề xuất, chốt ở Bước 6.</p>';
    h += '<table><tr><th>Bậc</th><th>Xu</th><th>Rương</th><th>Huyết</th><th>Danh hiệu</th></tr>';
    REWARD_TABLE.forEach(function(r){
      h += '<tr><td>'+esc(r.rank)+'</td><td>'+r.xu+'</td><td>'+(r.box||'—')+'</td><td>'+(r.blood||'—')+'</td><td>'+esc(r.title)+'</td></tr>';
    });
    h += '</table>';
    h += '<p style="font-size:12px;color:#78864f;margin-top:8px">Rương = hộp nguyên liệu chế trang bị (chọn vùng khi nhận). Huyết = nguyên liệu nâng huyết mạch.</p>';
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
        if(recentFight[r.uid] && (now - recentFight[r.uid]) < RECENT_MS) return false;
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
      '<div style="font-size:14px;color:#b7bda9">Hiện tại: '+o.myFame+(myRankNum?(' · Hạng '+myRankNum):'')+'</div>'+
      '<button type="button" id="ar-res-ok">Đóng</button>';
    res.classList.add('show');
    $('ar-res-ok').onclick = function(){ res.classList.remove('show'); };
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
    calcFameDelta: calcFameDelta,
    NEAR_ABOVE: NEAR_ABOVE,
    NEAR_BELOW: NEAR_BELOW,
    FAME_WIN_BASE: FAME_WIN_BASE,
    REWARD_TABLE: REWARD_TABLE
  };

})();
