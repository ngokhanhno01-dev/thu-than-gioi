#!/usr/bin/env node
/* ===== finalize-season.js — CHỐT MÙA ĐẤU TRƯỜNG (chạy bằng GitHub Actions, dùng Firebase Admin SDK) =====
   Việc làm:
     1) Ghi "lịch mùa" seasonCal/{n} = {b, e} lên Realtime Database (Rules dùng để biết mùa hiện tại).
     2) Tìm các mùa ĐÃ KẾT THÚC mà chưa chốt → đọc seasonRank/{mùa} → xếp hạng → ghi:
          seasonResult/{mùa}/{uid}, titles/{uid}/{mùa}, mail/{uid}/s{mùa}_reward (thư thưởng)
        Mỗi người ghi bằng MỘT lệnh nguyên tử (cả 3 nơi cùng lúc hoặc không gì cả) → chạy lại KHÔNG phát đôi.
     3) Dọn dữ liệu cũ (thư cũ, nhật ký thách đấu cũ, bảng xếp hạng mùa cũ, báo cáo cũ).
   KHÔNG sửa bản lưu của ai. Hằng số lấy từ ../season-config.js (dùng chung với game).

   Cách chạy (xem HUONG-DAN-BUOC-6.md):  node finalize-season.js [--dry-run] [--season N] [--approve uid1,uid2]
   Biến môi trường:  FIREBASE_SERVICE_ACCOUNT (nội dung JSON khóa dịch vụ), FIREBASE_DATABASE_URL */
'use strict';
const fs = require('fs');
const path = require('path');
const CFG = require('../season-config.js');

const DAY = 24 * 3600 * 1000;
const REPORTS_KEEP_DAYS = 30;
const WRITE_BATCH = 100;           // số người ghi mỗi đợt
const FAME_SLACK = 60;             // dư cho trần uy danh (làm tròn, Danh vọng...)

/* ---------- Đọc tham số ---------- */
function parseArgs(argv){
  const a = { dry: false, season: 0, approve: [] };
  for(let i = 0; i < argv.length; i++){
    const x = argv[i];
    if(x === '--dry-run' || x === '--dry') a.dry = true;
    else if(x === '--season') a.season = Math.floor(Number(argv[++i]) || 0);
    else if(x === '--approve') a.approve = String(argv[++i] || '').split(',').map(s => s.trim()).filter(Boolean);
  }
  if(String(process.env.DRY_RUN || '').toLowerCase() === 'true') a.dry = true;
  if(!a.season && process.env.SEASON_INPUT) a.season = Math.floor(Number(process.env.SEASON_INPUT) || 0);
  if(process.env.APPROVE_INPUT) a.approve = a.approve.concat(String(process.env.APPROVE_INPUT).split(',').map(s => s.trim()).filter(Boolean));
  return a;
}

function readJsonSafe(file, dflt){
  try{ return JSON.parse(fs.readFileSync(path.join(__dirname, file), 'utf8')); }
  catch(e){ if(e.code !== 'ENOENT') console.warn('[cảnh báo] không đọc được ' + file + ': ' + e.message); return dflt; }
}

/* ====================================================================================
   LÕI TÍNH TOÁN (thuần, không đụng mạng) — để kiểm thử được
   rows: [{uid, nick, fame, lost, lv, wins, foes, t}]
   ctx : {season, banned:Set, exclude:Set, approve:Set, repCount:{uid:n}, flagged:Set, hatched:Set|null}
   Trả : {ranked:[{rank, tier, ...}], held:[{...,why:[]}], skipped:[{uid,nick,why}]}
   ==================================================================================== */
function computeSeason(rows, ctx){
  const endMs = CFG.seasonEnd(ctx.season);
  const ceiling = CFG.fameCeiling(ctx.season, endMs) + FAME_SLACK;
  const skipped = [], pool = [], held = [];

  for(const r of rows){
    const fame = Math.max(0, Math.floor(Number(r.fame) || 0));
    const lost = Math.max(0, Math.floor(Number(r.lost) || 0));
    const e = {
      uid: r.uid, nick: String(r.nick || '').slice(0, 20), lv: Number(r.lv) || 1,
      wins: Math.max(0, Math.floor(Number(r.wins) || 0)), foes: Math.max(0, Math.floor(Number(r.foes) || 0)),
      gross: fame, lost: lost, net: Math.max(0, fame - lost), t: Number(r.t) || 0
    };
    if(ctx.banned.has(e.uid))  { skipped.push({ uid: e.uid, nick: e.nick, why: 'bị khóa (banned)' }); continue; }
    if(ctx.exclude.has(e.uid)) { skipped.push({ uid: e.uid, nick: e.nick, why: 'nằm trong danh sách loại' }); continue; }
    if(e.wins < CFG.MIN_WINS)  { skipped.push({ uid: e.uid, nick: e.nick, why: 'chưa đủ ' + CFG.MIN_WINS + ' trận thắng (có ' + e.wins + ')' }); continue; }
    if(e.foes < CFG.MIN_FOES)  { skipped.push({ uid: e.uid, nick: e.nick, why: 'chưa đủ ' + CFG.MIN_FOES + ' đối thủ khác nhau (có ' + e.foes + ')' }); continue; }
    if(e.net < CFG.MIN_FAME)   { skipped.push({ uid: e.uid, nick: e.nick, why: 'uy danh dưới ' + CFG.MIN_FAME + ' (có ' + e.net + ')' }); continue; }
    if(ctx.hatched && !ctx.hatched.has(e.uid)) { skipped.push({ uid: e.uid, nick: e.nick, why: 'chưa có thẻ thú (thú chưa nở)' }); continue; }

    /* dấu hiệu đáng ngờ */
    const why = [];
    if(e.wins >= CFG.SUS_WINS_MIN && e.foes <= CFG.SUS_FOES_MAX) why.push('thắng ' + e.wins + ' trận nhưng chỉ với ' + e.foes + ' đối thủ khác nhau (nghi nuôi tài khoản)');
    if(e.foes > e.wins) why.push('số đối thủ (' + e.foes + ') lớn hơn số trận thắng (' + e.wins + ') — số liệu bất thường');
    if(e.gross > ceiling + e.lost) why.push('uy danh ' + e.gross + ' vượt trần lý thuyết ' + (ceiling + e.lost) + ' của mùa');
    const rc = ctx.repCount[e.uid] || 0;
    if(rc >= CFG.SUS_REPORTS) why.push(rc + ' người khác nhau báo cáo gian lận');
    if(ctx.flagged.has(e.uid)) why.push('máy của người này đã tự báo phát hiện dữ liệu bất thường (flags)');
    e.why = why;

    if(why.length && !ctx.approve.has(e.uid)) held.push(e);
    else pool.push(e);
  }

  /* xếp hạng: uy danh ↓, rồi nhiều đối thủ khác nhau ↓, nhiều trận thắng ↓, đạt sớm hơn ↑, uid */
  pool.sort((a, b) => (b.net - a.net) || (b.foes - a.foes) || (b.wins - a.wins) || (a.t - b.t) || (a.uid < b.uid ? -1 : 1));
  const ranked = pool.map((e, i) => {
    const rank = i + 1;
    const tier = CFG.tierForRank(rank) || CFG.tierJoin();
    return Object.assign({}, e, { rank: rank, tier: tier });
  });
  held.sort((a, b) => b.net - a.net);
  return { ranked: ranked, held: held, skipped: skipped };
}

/* Nội dung thư thưởng (khớp 24-mail.js) */
function buildMail(entry, season, nowMs){
  const t = entry.tier;
  const rewards = {};
  if(t.xu) rewards.gold = t.xu;
  if(t.box) { rewards.chooseZone = true; rewards.boxes = t.box; }
  if(t.blood && (t.blood.huyet || t.blood.thuoc || t.blood.tinh)) rewards.blood = { huyet: t.blood.huyet, thuoc: t.blood.thuoc, tinh: t.blood.tinh };
  if(t.title) rewards.title = CFG.titleText(t.title, season);
  const lines = ['Mùa ' + season + ' đã kết thúc. Bạn đứng hạng ' + entry.rank + ' với ' + entry.net + ' uy danh.'];
  lines.push('Phần thưởng: ' + CFG.rewardText(t) + '.');
  if(t.title) lines.push('Danh hiệu "' + CFG.titleText(t.title, season) + '" đã được trao (xem trên thẻ thú của bạn).');
  if(t.box) lines.push('Khi nhận, hãy chọn VÙNG cho hộp nguyên liệu.');
  return {
    type: 'season',
    title: 'Thưởng Mùa ' + season + ' · ' + (t.id === 'join' ? 'Tham gia' : 'Hạng ' + entry.rank),
    body: lines.join(' '),
    season: season,
    rewards: rewards,
    claimed: false,
    t: nowMs
  };
}

/* ====================================================================================
   PHẦN CHẠY THẬT (cần mạng + khóa dịch vụ)
   ==================================================================================== */
async function main(){
  const args = parseArgs(process.argv.slice(2));
  const log = (...m) => console.log(...m);
  log('==== CHỐT MÙA ĐẤU TRƯỜNG ' + (args.dry ? '[CHẠY THỬ - KHÔNG GHI GÌ]' : '[CHẠY THẬT]') + ' ====');

  const saRaw = process.env.FIREBASE_SERVICE_ACCOUNT;
  const dbUrl = process.env.FIREBASE_DATABASE_URL;
  if(!saRaw || !dbUrl){
    console.error('THIẾU bí mật FIREBASE_SERVICE_ACCOUNT hoặc FIREBASE_DATABASE_URL. Xem mục "Tạo khóa" trong HUONG-DAN-BUOC-6.md.');
    process.exit(2);
  }
  let sa;
  try{ sa = JSON.parse(saRaw); }catch(_){ console.error('FIREBASE_SERVICE_ACCOUNT không phải JSON hợp lệ (dán lại TOÀN BỘ nội dung file khóa, từ { đến }).'); process.exit(2); }

  const admin = require('firebase-admin');
  admin.initializeApp({ credential: admin.credential.cert(sa), databaseURL: dbUrl });
  const rdb = admin.database();
  const fsdb = admin.firestore();
  const now = Date.now();
  const curSeason = CFG.seasonAt(now);
  log('Giờ chạy: ' + new Date(now).toISOString() + ' · Mùa hiện tại: ' + curSeason);

  /* ---- 1) Lịch mùa ---- */
  const calSnap = await rdb.ref('seasonCal').once('value');
  const cal = calSnap.val() || {};
  const calUp = {};
  for(let s = 1; s <= CFG.CALENDAR_SEASONS; s++){
    const c = cal[s];
    if(!c || c.b !== CFG.seasonBegin(s) || c.e !== CFG.seasonEnd(s)) calUp['seasonCal/' + s] = { b: CFG.seasonBegin(s), e: CFG.seasonEnd(s) };
  }
  const calN = Object.keys(calUp).length;
  log('Lịch mùa: cần ghi/sửa ' + calN + ' mùa (tổng ' + CFG.CALENDAR_SEASONS + ').');
  if(calN && !args.dry) await rdb.ref().update(calUp);

  /* ---- 2) Mùa cần chốt ---- */
  const metaSnap = await rdb.ref('seasonMeta').once('value');
  const meta = metaSnap.val() || {};
  let todo = [];
  if(args.season){
    if(args.season >= curSeason){ console.error('Mùa ' + args.season + ' chưa kết thúc (mùa hiện tại là ' + curSeason + ').'); process.exit(1); }
    todo = [args.season];
  }else{
    for(let s = Math.max(1, curSeason - 4); s < curSeason; s++) if(!(meta[s] && meta[s].done)) todo.push(s);
  }
  log('Mùa cần chốt: ' + (todo.length ? todo.join(', ') : '(không có)'));

  const banJson = readJsonSafe('banned.json', { uids: [] });
  const ovr = readJsonSafe('season-overrides.json', { exclude: [], approve: [] });
  const banned = new Set((banJson.uids || []).filter(Boolean));
  try{ const b = (await rdb.ref('banned').once('value')).val() || {}; Object.keys(b).forEach(u => banned.add(u)); }catch(e){ console.warn('không đọc được banned/', e.message); }
  const exclude = new Set((ovr.exclude || []).filter(Boolean));
  const approve = new Set((ovr.approve || []).concat(args.approve).filter(Boolean));

  let hadError = false;
  for(const season of todo){
    try{ await finalizeOne(season); }
    catch(e){ hadError = true; console.error('LỖI khi chốt mùa ' + season + ':', e && e.stack || e); }
  }

  async function finalizeOne(season){
    log('\n---------- MÙA ' + season + ' ----------');
    const rkSnap = await rdb.ref('seasonRank/' + season).once('value');
    const rk = rkSnap.val() || {};
    const rows = Object.keys(rk).map(uid => Object.assign({ uid: uid }, rk[uid]));
    log('Số người có tên trên bảng: ' + rows.length);

    /* báo cáo gian lận (đọc 1 lần): đếm số người KHÁC NHAU báo cáo mỗi uid, bỏ người báo cáo hàng loạt */
    const repSnap = await rdb.ref('reports').once('value');
    const reps = repSnap.val() || {};
    const reporterLoad = {};
    Object.keys(reps).forEach(tg => Object.keys(reps[tg] || {}).forEach(rp => { reporterLoad[rp] = (reporterLoad[rp] || 0) + 1; }));
    const repCount = {};
    Object.keys(reps).forEach(tg => {
      repCount[tg] = Object.keys(reps[tg] || {}).filter(rp => reporterLoad[rp] < CFG.SUS_REP_MASS).length;
    });

    let flagged = new Set();
    try{ const f = (await rdb.ref('flags').once('value')).val() || {}; Object.keys(f).forEach(u => flagged.add(u)); }catch(_){}

    /* "thú đã nở" = có thẻ thú trên Firestore. Chỉ kiểm tra những người đã đủ điều kiện trận/đối thủ/uy danh. */
    const prelim = computeSeason(rows, { season: season, banned: banned, exclude: exclude, approve: approve, repCount: repCount, flagged: flagged, hatched: null });
    const cand = prelim.ranked.concat(prelim.held).map(e => e.uid);
    const hatched = new Set();
    for(let i = 0; i < cand.length; i += 300){
      const refs = cand.slice(i, i + 300).map(u => fsdb.collection('cards').doc(u));
      const docs = await fsdb.getAll(...refs);
      docs.forEach(d => { if(d.exists) hatched.add(d.id); });
    }
    log('Đủ điều kiện sơ bộ: ' + cand.length + ' · có thẻ thú (đã nở): ' + hatched.size);

    const res = computeSeason(rows, { season: season, banned: banned, exclude: exclude, approve: approve, repCount: repCount, flagged: flagged, hatched: hatched });

    /* ---- in kết quả ---- */
    log('\nBẢNG XẾP HẠNG CHỐT (' + res.ranked.length + ' người nhận thưởng):');
    res.ranked.slice(0, 40).forEach(e => log('  #' + String(e.rank).padEnd(3) + ' ' + e.nick.padEnd(20) + ' uy danh ' + String(e.net).padEnd(6) + ' thắng ' + e.wins + '/' + e.foes + ' đối thủ → ' + e.tier.name));
    if(res.ranked.length > 40) log('  ... và ' + (res.ranked.length - 40) + ' người nữa (bậc Tham gia).');
    if(res.held.length){
      log('\n⚠️ ĐANG GIỮ LẠI ' + res.held.length + ' NGƯỜI ĐÁNG NGỜ (KHÔNG phát thưởng, chờ bạn quyết định):');
      res.held.forEach(e => {
        log('  - uid ' + e.uid + ' · ' + e.nick + ' · uy danh ' + e.net + ' · thắng ' + e.wins + '/' + e.foes + ' đối thủ');
        e.why.forEach(w => log('      • ' + w));
        console.log('::warning title=Giữ lại người đáng ngờ::Mùa ' + season + ' · ' + e.nick + ' (' + e.uid + '): ' + e.why.join('; '));
      });
      log('  Cách xử lý: nếu họ trong sạch → thêm uid vào "approve" (file season-overrides.json hoặc ô approve khi chạy tay) rồi chạy lại với số mùa ' + season + '. Nếu gian lận → thêm vào "exclude" hoặc banned.json (và khóa ở Rules).');
    }
    if(res.skipped.length){
      log('\nKHÔNG ĐỦ ĐIỀU KIỆN (' + res.skipped.length + ' người) — vài dòng đầu:');
      res.skipped.slice(0, 15).forEach(s => log('  - ' + s.nick + ' (' + s.uid.slice(0, 8) + '…): ' + s.why));
    }

    if(args.dry){ log('\n[CHẠY THỬ] Không ghi gì lên Firebase.'); return; }

    /* ---- ghi: mỗi người 1 lệnh nguyên tử; bỏ qua người đã có seasonResult (idempotent) ---- */
    const doneSnap = await rdb.ref('seasonResult/' + season).once('value');
    const already = doneSnap.val() || {};
    const todoUsers = res.ranked.filter(e => !already[e.uid]);
    log('\nĐã có kết quả từ trước: ' + (res.ranked.length - todoUsers.length) + ' người (bỏ qua, không phát đôi). Sẽ ghi mới: ' + todoUsers.length + ' người.');

    let wrote = 0;
    for(let i = 0; i < todoUsers.length; i += WRITE_BATCH){
      const part = todoUsers.slice(i, i + WRITE_BATCH);
      await Promise.all(part.map(e => {
        const up = {};
        up['seasonResult/' + season + '/' + e.uid] = { rank: e.rank, fame: e.net, tier: e.tier.id, nick: e.nick };
        if(e.tier.title) up['titles/' + e.uid + '/' + season] = e.tier.title;
        up['mail/' + e.uid + '/s' + season + '_reward'] = buildMail(e, season, now);
        return rdb.ref().update(up).then(() => { wrote++; });
      }));
    }
    log('Đã ghi ' + wrote + ' người.');

    /* người bị giữ: lưu vết để bạn tra lại (game không đọc node này) */
    for(const e of res.held){
      await rdb.ref('seasonHold/' + season + '/' + e.uid).set({ nick: e.nick, fame: e.net, wins: e.wins, foes: e.foes, why: e.why.join('; ').slice(0, 300), t: now });
    }
    await rdb.ref('seasonMeta/' + season).set({ done: true, t: now, ranked: res.ranked.length, held: res.held.length, skipped: res.skipped.length });
    log('✅ Đã chốt Mùa ' + season + '.');
  }

  /* ---- 3) Dọn dữ liệu cũ ---- */
  log('\n---------- DỌN DỮ LIỆU CŨ ----------');
  await cleanup(rdb, args.dry, now, curSeason, meta, log);

  log('\n==== XONG ' + (hadError ? '(CÓ LỖI, xem phía trên)' : '(không lỗi)') + ' ====');
  await Promise.all([admin.app().delete()]).catch(() => {});
  if(hadError) process.exit(1);
}

async function cleanup(rdb, dry, now, curSeason, meta, log){
  const del = {};
  /* thư cũ */
  const mailSnap = await rdb.ref('mail').once('value');
  const mails = mailSnap.val() || {};
  let nm = 0;
  Object.keys(mails).forEach(uid => Object.keys(mails[uid] || {}).forEach(mid => {
    const m = mails[uid][mid] || {};
    const t = Number(m.t) || 0;
    if(!t) return;
    const limitDays = m.claimed ? CFG.MAIL_CLAIMED_HIDE_DAYS + 7 : CFG.MAIL_KEEP_DAYS + 7;
    if(now - t > limitDays * DAY){ del['mail/' + uid + '/' + mid] = null; nm++; }
  }));
  /* nhật ký thách đấu cũ */
  const alSnap = await rdb.ref('arenaLog').once('value');
  const al = alSnap.val() || {};
  let na = 0;
  Object.keys(al).forEach(d => Object.keys(al[d] || {}).forEach(a => {
    const t = Number((al[d][a] || {}).t) || 0;
    if(t && now - t > CFG.ARENALOG_KEEP_DAYS * DAY){ del['arenaLog/' + d + '/' + a] = null; na++; }
  }));
  /* báo cáo cũ */
  const rpSnap = await rdb.ref('reports').once('value');
  const rp = rpSnap.val() || {};
  let nr = 0;
  Object.keys(rp).forEach(tg => Object.keys(rp[tg] || {}).forEach(rep => {
    const t = Number((rp[tg][rep] || {}).t) || 0;
    if(t && now - t > REPORTS_KEEP_DAYS * DAY){ del['reports/' + tg + '/' + rep] = null; nr++; }
  }));
  /* bảng xếp hạng mùa cũ: chỉ xóa mùa ĐÃ CHỐT (seasonMeta.done) và cũ hơn SEASON_RANK_KEEP mùa */
  let ns = 0;
  Object.keys(meta).forEach(k => {
    const sn = Number(k);
    if(sn > 0 && sn <= curSeason - CFG.SEASON_RANK_KEEP && meta[k] && meta[k].done){ del['seasonRank/' + sn] = null; del['seasonHold/' + sn] = null; ns++; }
  });
  log('Sẽ xóa: ' + nm + ' thư cũ · ' + na + ' nhật ký thách đấu cũ · ' + nr + ' báo cáo cũ · ' + ns + ' bảng xếp hạng mùa cũ.');
  if(dry){ log('[CHẠY THỬ] Không xóa gì.'); return; }
  const keys = Object.keys(del);
  for(let i = 0; i < keys.length; i += 400){
    const part = {};
    keys.slice(i, i + 400).forEach(k => { part[k] = null; });
    await rdb.ref().update(part);
  }
}

module.exports = { computeSeason, buildMail, parseArgs, main };
if(require.main === module){
  main().catch(e => { console.error('LỖI KHÔNG LƯỜNG TRƯỚC:', e && e.stack || e); process.exit(1); });
}
