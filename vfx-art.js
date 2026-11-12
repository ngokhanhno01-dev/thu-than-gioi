/* Hiệu ứng hình ảnh thay thế từ bộ sprite được chọn lọc.
   Chỉ xử lý vẽ canvas; không thay đổi sát thương, lượt đánh hay dữ liệu lưu. */
(() => {
  'use strict';

  const ROOT = 'vfx/';
  const images = Object.create(null);
  const reducedMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const pad = n => String(n).padStart(2, '0');

  function image(path) {
    let img = images[path];
    if (!img) {
      img = new Image();
      img.src = ROOT + path;
      images[path] = img;
    }
    return img.complete && img.naturalWidth > 0 ? img : null;
  }

  function drawFit(ctx, path, x, y, maxW, maxH, alpha = 1, flip = false, blend = 'lighter') {
    const img = image(path);
    if (!img) return false;
    const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight);
    const w = img.naturalWidth * scale, h = img.naturalHeight * scale;
    ctx.save();
    ctx.globalAlpha *= clamp(alpha, 0, 1);
    ctx.globalCompositeOperation = blend;
    ctx.translate(x, y);
    if (flip) ctx.scale(-1, 1);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
    return true;
  }

  function drawProgress(ctx, prefix, start, count, progress, x, y, w, h, alpha = 1, flip = false, padFrames = true) {
    const p = reducedMotion ? .5 : clamp(progress, 0, .9999);
    const n = start + Math.floor(p * count);
    const name = prefix + (padFrames ? pad(n) : n) + '.png';
    return drawFit(ctx, name, x, y, w, h, alpha, flip);
  }

  function drawLoop(ctx, prefix, count, time, fps, x, y, w, h, alpha = 1, start = 1, padFrames = true) {
    const step = reducedMotion ? Math.floor(count / 2) : Math.floor(time * fps) % count;
    const n = start + step;
    return drawFit(ctx, prefix + (padFrames ? pad(n) : n) + '.png', x, y, w, h, alpha);
  }

  function targetX(attackerIsPet) { return attackerIsPet ? 272 : 90; }
  function sourceX(attackerIsPet, dp, dmx) { return attackerIsPet ? 85 + dp * .84 : 272 + dmx * .78; }
  function fromX(attackerIsPet, dp, dmx) { return attackerIsPet ? 272 + dmx * .78 : 90 + dp * .84; }
  function colorForStat(stat) {
    return ({ atk: '#ff895d', def: '#75caff', crit: '#ffe36e', eva: '#d5a4ff',
      regen: '#7ee6a6', spd: '#9fe4ff', mag: '#73caff' })[stat] || '#92d9ff';
  }

  function drawBattleZone(ctx, zone, time, x = 272, groundY = 208) {
    let data = null;
    try {
      if (typeof VAN_KIEP_ZONES !== 'undefined') data = VAN_KIEP_ZONES[zone];
    } catch (_) {}
    const stat = data && data.buff && data.buff.stat;
    if (!stat) return false;

    const color = colorForStat(stat);
    ctx.save();
    ctx.globalAlpha = .36 + Math.sin(time * 2.2) * .04;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.ellipse(x, groundY, 45 + Math.sin(time * 1.7) * 3, 10, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = .13;
    const halo = ctx.createRadialGradient(x, groundY - 6, 2, x, groundY - 6, 48);
    halo.addColorStop(0, color);
    halo.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.ellipse(x, groundY - 6, 48, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (stat === 'atk') {
      drawLoop(ctx, 'area/ground-flame-', 9, time, 8, x, groundY - 18, 57, 48, .43);
    } else if (stat === 'def') {
      drawFit(ctx, 'area/dome-shield.png', x, groundY - 39, 104, 104, .19);
    } else {
      const art = ({
        crit: 'area/lightning-ground.png',
        eva: 'area/dodge-dome.png',
        regen: 'status/revive-orb.png',
        spd: 'area/energy-blue.png',
        mag: 'area/magic-dome.png'
      })[stat] || 'area/energy-blue.png';
      drawFit(ctx, art, x, groundY - 35, 52, 46, .34 + Math.sin(time * 2.4) * .05);
    }
    return true;
  }

  const SET_AURA = {
    frost: 'blue', mist: 'blue', cloud: 'pink', wind: 'jade', thunder: 'gold',
    counter: 'blue', sun: 'gold', shield: 'blue', thorn: 'gold', revive: 'jade',
    grove: 'jade', lava: 'red', ambush: 'pink', star: 'gold', first: 'jade',
    weaken: 'pink', judge: 'gold'
  };

  function getMainSet() {
    try {
      const sets = window.EQFX && window.EQFX.visualSets ? window.EQFX.visualSets() : [];
      return sets.slice().sort((a, b) => (b.count - a.count) || (Number(b.full) - Number(a.full)))[0] || null;
    } catch (_) { return null; }
  }

  function drawGearAura(ctx, x, baseline, time, color, alpha = .68) {
    return drawLoop(ctx, 'gear/aura-' + color + '-', 4, time, 6, x, baseline - 48, 82, 104, alpha, 1, false);
  }

  function drawSetAura(ctx, x, baseline, time) {
    const set = getMainSet();
    if (!set) return false;
    const color = SET_AURA[set.key] || 'jade';
    return drawGearAura(ctx, x, baseline, time, color, set.full ? .82 : .62);
  }

  function drawDefiance(ctx, x, baseline, time, active) {
    if (!active) return false;
    const pulse = .62 + Math.sin(time * 8) * .12;
    const didDraw = drawGearAura(ctx, x, baseline, time, 'red', pulse);
    drawFit(ctx, 'status/critical-flare.png', x, baseline - 99, 56, 24, pulse * .5);
    return didDraw;
  }

  function drawAttack(ctx, state, time, dp, dmx) {
    if (!state || !state.on) return false;
    const u = state.u, petSide = state.pa, dir = petSide ? 1 : -1;
    const sx = sourceX(petSide, dp, dmx), tx = targetX(petSide), ty = 150;
    const mx = sx + dir * (petSide ? 30 : 40), my = petSide ? 180 : 164;
    const progress = clamp((u - .26) / .29, 0, .9999);
    const flip = !petSide;

    if (state.cl === 2) return true; // Lửa được vẽ ở drawImpact theo thời lượng đốt.

    if (state.cl === 3) {
      if (u < .24 || u > .7) return true;
      const p = clamp((u - .24) / .46, 0, .9999);
      const ok = drawProgress(ctx, 'melee/slash-purple-', 1, 28, p, tx, ty, 92, 82, state.cr ? 1 : .82, flip);
      if (state.cr) drawFit(ctx, 'status/critical-flare.png', tx, ty, 88, 36, .72);
      return ok;
    }

    const ranged = ['Hỏa', 'Thủy', 'Huyễn', 'Mộc'].includes(state.h);
    if (!ranged) {
      if (u < .24 || u > .69) return true;
      const ok = drawProgress(ctx, 'melee/slash-blue-', 1, 28, progress, tx, ty, state.cr ? 104 : 88, state.cr ? 84 : 72, .94, flip);
      if (state.cr && u >= .32) drawFit(ctx, 'status/critical-flare.png', tx, ty, 96, 36, .7);
      return ok;
    }

    if (u < .2) {
      const orb = state.h === 'Hỏa' ? 'status/critical-flare.png'
        : state.h === 'Thủy' ? 'area/energy-blue.png'
        : state.h === 'Mộc' ? 'status/revive-orb.png' : 'area/magic-dome.png';
      return drawFit(ctx, orb, mx, my, 34, 34, .65 + Math.sin(time * 12) * .12);
    }
    if (u < .36) {
      const p = clamp((u - .2) / .16, 0, 1);
      const x = mx + (tx - mx) * p, y = my + (ty - 26 - my) * p;
      const projectileNo = ((state.s * 7 + Math.floor(state.i / 3)) % 12) + 1;
      const ok = drawFit(ctx, 'ranged/projectile-' + pad(projectileNo) + '.png', x, y, 92, 44, 1, flip);
      if (ok && p > .22) drawFit(ctx, 'ranged/projectile-' + pad(projectileNo) + '.png', x - dir * 17, y + 4, 62, 30, .28, flip);
      return ok;
    }
    return true;
  }

  function drawImpact(ctx, fx, time) {
    if (!fx) return false;
    const q = clamp(fx.q || 0, 0, 1);
    const attackerIsPet = !!fx.pp;
    const x = targetX(attackerIsPet), y = 150;
    const actorX = attackerIsPet ? 90 : 270;
    const fade = Math.max(0, 1 - q);

    if (fx.k === 'block') {
      const shieldX = actorX;
      const ok = drawFit(ctx, 'area/dome-shield.png', shieldX, y + 8, 116, 116, .48 * fade);
      drawFit(ctx, 'area/shield-orb.png', shieldX, y - 28, 36, 58, .56 * fade);
      return ok;
    }

    if (fx.k === 'miss') {
      const dodgeX = x;
      const ok = drawProgress(ctx, 'melee/slash-blue-', 1, 28, q, dodgeX, y, 82, 66, .68 * fade, !attackerIsPet);
      drawFit(ctx, 'area/dodge-dome.png', dodgeX, y - 25, 54, 40, .24 * fade);
      return ok;
    }

    if (fx.k === 'stun') {
      const frozen = /đóng băng/i.test(fx.t || '');
      const centerX = actorX;
      if (frozen) {
        const wobble = Math.sin(time * 7) * 3;
        const ok = drawFit(ctx, 'status/ice-wave.png', centerX, y + 4, 74, 50, .48 * fade);
        drawFit(ctx, 'status/ice-star.png', centerX + wobble, y - 24, 50, 52, .72 * fade);
        return ok;
      }
      return drawFit(ctx, 'area/magic-dome.png', centerX, y - 20, 56, 48, .5 * fade);
    }

    if (fx.k === 'heal') {
      const revive = /hồi sinh/i.test(fx.t || '');
      const ok = drawFit(ctx, revive ? 'status/revive-orb.png' : 'area/energy-blue.png',
        actorX, y - 25, 64 + q * 22, 60 + q * 20, (revive ? .86 : .56) * fade);
      if (revive) drawFit(ctx, 'area/dome-shield.png', actorX, y + 4, 96 + q * 24, 96 + q * 24, .27 * fade);
      return ok;
    }

    if (fx.cl === 2 || /Thiêu đốt|Dung Nham/i.test(fx.t || '')) {
      return drawLoop(ctx, 'status/burn-flame-', 9, time, 12, x, y + 42, 58, 64, .82 * fade, 14);
    }

    if (fx.k === 'crit') {
      const ok = drawFit(ctx, 'status/critical-flare.png', x, y, 126, 42, .9 * fade);
      drawFit(ctx, 'status/meteor.png', x, y - 3, 74 + q * 22, 66 + q * 18, .62 * fade);
      return ok;
    }

    if (fx.k === 'hit' && fx.d > 0) {
      const ok = drawFit(ctx, 'status/impact-burst.png', x, y, 72 + q * 26, 72 + q * 26, .76 * fade);
      if (fx.r > 1) drawFit(ctx, 'status/critical-flare.png', x, y, 96, 32, .4 * fade);
      return ok;
    }

    return false;
  }

  // Bắt đầu tải sprite ngay sau khi trang game mở.
  [
    'area/dome-shield.png', 'area/energy-blue.png', 'area/shield-orb.png',
    'area/dodge-dome.png', 'area/magic-dome.png', 'area/lightning-ground.png',
    'status/revive-orb.png', 'status/ice-star.png', 'status/ice-wave.png',
    'status/critical-flare.png', 'status/meteor.png', 'status/impact-burst.png',
    ...Array.from({ length: 9 }, (_, i) => 'area/ground-flame-' + pad(i + 1) + '.png'),
    ...Array.from({ length: 9 }, (_, i) => 'status/burn-flame-' + pad(i + 14) + '.png'),
    ...Array.from({ length: 28 }, (_, i) => 'melee/slash-blue-' + pad(i + 1) + '.png'),
    ...Array.from({ length: 28 }, (_, i) => 'melee/slash-purple-' + pad(i + 1) + '.png'),
    ...Array.from({ length: 12 }, (_, i) => 'ranged/projectile-' + pad(i + 1) + '.png'),
    ...['jade', 'blue', 'gold', 'red', 'pink'].flatMap(color =>
      Array.from({ length: 4 }, (_, i) => 'gear/aura-' + color + '-' + (i + 1) + '.png'))
  ].forEach(image);

  window.TTGFXART = { drawBattleZone, drawSetAura, drawDefiance, drawAttack, drawImpact };
})();
