
(() => {
  const BLOODLINES = ["ho", "vu", "long", "tuoc", "lan", "hu"];
  const BLOODLINE_NAMES = {
    ho: "Bạch Hổ",
    vu: "Huyền Vũ",
    long: "Thanh Long",
    tuoc: "Chu Tước",
    lan: "Kỳ Lân",
    hu: "Cửu Vĩ Hồ",
  };
  const ELEMENTS = [
    { name: "Tuyết", color: "#dff4ff", dark: "#347b9a", form: "ice" },
    { name: "Sương", color: "#cfe6e0", dark: "#508b83", form: "mist" },
    { name: "Vân", color: "#e9e0ff", dark: "#8069ac", form: "cloud" },
    { name: "Phong", color: "#c8ffe0", dark: "#34835d", form: "wind" },
    { name: "Lôi", color: "#ffe86a", dark: "#a67810", form: "bolt" },
    { name: "Nguyệt", color: "#d8d8ff", dark: "#646bb2", form: "moon" },
    { name: "Dương", color: "#ffd28a", dark: "#a95827", form: "sun" },
    { name: "Huyền", color: "#8c8cae", dark: "#37364f", form: "void" },
    { name: "Kim", color: "#ffd24a", dark: "#94620e", form: "crystal" },
    { name: "Ngọc", color: "#a8ffd8", dark: "#31816b", form: "gem" },
    { name: "Thanh", color: "#7affc0", dark: "#267b4e", form: "leaf" },
    { name: "Xích", color: "#ff7a6a", dark: "#aa3027", form: "flame" },
    { name: "Hắc", color: "#927795", dark: "#35243d", form: "shadow" },
    { name: "Tử", color: "#c06aff", dark: "#67318f", form: "star" },
    { name: "Thiên", color: "#aee0ff", dark: "#4b85a6", form: "feather" },
    { name: "Linh", color: "#ffd0f0", dark: "#a44b84", form: "petal" },
    { name: "Thần", color: "#fff2a0", dark: "#a77a22", form: "crown" },
  ];
  /* ===== 10 BẬC: mỗi bậc = 10 cấp. Mỗi bậc là bản "giảm chi tiết" của CHÍNH ảnh trưởng thành (không còn ảnh baby riêng) =====
     Muốn chỉnh độ thô / độ nhỏ của thú con: chỉ cần sửa 3 mảng bên dưới.
       STAGE_BLOCK : cỡ khối pixel (1 = nguyên gốc, 4 = rất thô)
       STAGE_COLORS: số màu tối đa (0 = đủ màu gốc)
       STAGE_SCALE : kích thước tương đối so với bậc 10 (bậc 10 = 1) */
  const STAGE_NAMES = ["Sơ Sinh", "Ấu Thú", "Thiếu Thú", "Linh Thú", "Yêu Thú", "Hung Thú", "Trưởng Thú", "Đại Thú", "Chí Tôn", "Thần Thú"];
  const STAGE_COUNT = STAGE_NAMES.length;
  const STAGE_BLOCK = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];
  const STAGE_COLORS = [4, 5, 6, 8, 10, 12, 16, 22, 32, 0];
  const STAGE_SCALE = STAGE_BLOCK.map((_, i) => 0.3 + 0.7 * Math.pow(i / (STAGE_COUNT - 1), 0.8));
  const SCRIPT_URL = document.currentScript && document.currentScript.src
    ? document.currentScript.src
    : document.baseURI;
  const SPRITE_BASE = new URL("./sprites/", SCRIPT_URL);
  const imageRecords = new Map();
  const stageCache = new Map();

  function imageRecord(path) {
    if (!imageRecords.has(path)) {
      const image = new Image();
      const record = {
        image,
        promise: new Promise((resolve, reject) => {
          image.onload = () => resolve(image);
          image.onerror = () => reject(new Error(`Could not load sprite: ${path}`));
        }),
      };
      const assetKey = path.replace(/\.png$/i, "");
      const embeddedAsset = window.VAN_KIEP_ASSETS && window.VAN_KIEP_ASSETS[assetKey];
      image.src = embeddedAsset || new URL(path, SPRITE_BASE).href;
      imageRecords.set(path, record);
    }
    return imageRecords.get(path);
  }

  function imageIsReady(record) {
    return record.image.complete && record.image.naturalWidth > 0;
  }

  function validPet(key, elementIndex) {
    return BLOODLINES.includes(key) && Number.isInteger(elementIndex) && elementIndex >= 0 && elementIndex < ELEMENTS.length;
  }

  // Ngưỡng alpha: >= SOLID_ALPHA thì thành đặc (255), thấp hơn thì xóa -> viền gọn, nét như quái.
  const SOLID_ALPHA = 110;
  const solidCache = new WeakMap();
  function solidify(image) {
    if (solidCache.has(image)) return solidCache.get(image);
    let out = image;
    try {
      const w = image.naturalWidth || image.width, h = image.naturalHeight || image.height;
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      const cx = c.getContext("2d", { willReadFrequently: true });
      cx.imageSmoothingEnabled = false;
      cx.drawImage(image, 0, 0);
      const data = cx.getImageData(0, 0, w, h), d = data.data;
      for (let i = 3; i < d.length; i += 4) d[i] = d[i] >= SOLID_ALPHA ? 255 : 0;
      cx.putImageData(data, 0, 0);
      out = c;
    } catch (e) { out = image; }
    solidCache.set(image, out);
    return out;
  }

  // Gom màu bằng k-means (k màu) trên các ô pixel: thú con ít màu hơn, thú lớn nhiều màu hơn.
  function quantize(cells, k) {
    const lum = cells.map(p => 0.3 * p[2] + 0.59 * p[3] + 0.11 * p[4]);
    const order = cells.map((_, i) => i).sort((a, b) => lum[a] - lum[b]);
    let centers = [];
    for (let j = 0; j < k; j += 1) {
      const p = cells[order[Math.floor((j + 0.5) * cells.length / k)]];
      centers.push([p[2], p[3], p[4]]);
    }
    const assign = new Array(cells.length);
    for (let iter = 0; iter < 6; iter += 1) {
      cells.forEach((p, i) => {
        let best = 0, bestD = 1e9;
        centers.forEach((q, j) => {
          const e = (p[2] - q[0]) ** 2 + (p[3] - q[1]) ** 2 + (p[4] - q[2]) ** 2;
          if (e < bestD) { bestD = e; best = j; }
        });
        assign[i] = best;
      });
      const sums = centers.map(() => [0, 0, 0, 0]);
      cells.forEach((p, i) => { const s = sums[assign[i]]; s[0] += p[2]; s[1] += p[3]; s[2] += p[4]; s[3] += 1; });
      centers = centers.map((q, j) => sums[j][3] ? [sums[j][0] / sums[j][3], sums[j][1] / sums[j][3], sums[j][2] / sums[j][3]] : q);
    }
    cells.forEach((p, i) => { const q = centers[assign[i]]; p[2] = q[0]; p[3] = q[1]; p[4] = q[2]; });
  }

  // Giảm chi tiết ảnh trưởng thành 128x128: gộp khối pixel b x b, giảm còn k màu. Trả canvas 128x128 có thuộc tính .bb (khung chứa thú).
  function reduceImage(src, b, k) {
    const W = 128;
    const out = document.createElement("canvas");
    out.width = out.height = W;
    const ox = out.getContext("2d");
    ox.imageSmoothingEnabled = false;
    try {
      const sc = document.createElement("canvas");
      sc.width = sc.height = W;
      const sx = sc.getContext("2d", { willReadFrequently: true });
      sx.imageSmoothingEnabled = false;
      sx.drawImage(src, 0, 0, W, W);
      const d = sx.getImageData(0, 0, W, W).data;
      const g = Math.ceil(W / b), cells = [];
      let x0 = W, y0 = W, x1 = 0, y1 = 0;
      for (let gy = 0; gy < g; gy += 1) {
        for (let gx = 0; gx < g; gx += 1) {
          let r = 0, gr = 0, bl = 0, n = 0, tot = 0;
          for (let y = gy * b; y < Math.min(W, gy * b + b); y += 1) {
            for (let x = gx * b; x < Math.min(W, gx * b + b); x += 1) {
              tot += 1;
              const i = (y * W + x) * 4;
              if (d[i + 3]) { r += d[i]; gr += d[i + 1]; bl += d[i + 2]; n += 1; }
            }
          }
          if (n && n / tot >= 0.5) {
            cells.push([gx, gy, r / n, gr / n, bl / n]);
            x0 = Math.min(x0, gx * b); y0 = Math.min(y0, gy * b);
            x1 = Math.max(x1, Math.min(W, gx * b + b)); y1 = Math.max(y1, Math.min(W, gy * b + b));
          }
        }
      }
      if (k > 0 && cells.length > k) quantize(cells, k);
      for (const c of cells) {
        ox.fillStyle = "rgb(" + Math.round(c[2]) + "," + Math.round(c[3]) + "," + Math.round(c[4]) + ")";
        ox.fillRect(c[0] * b, c[1] * b, b, b);
      }
      out.bb = cells.length ? { x: x0, y: y0, w: x1 - x0, h: y1 - y0 } : { x: 0, y: 0, w: W, h: W };
    } catch (e) {
      // Trình duyệt chặn đọc pixel (vd. mở file://): vẽ nguyên ảnh gốc, vẫn thu nhỏ theo bậc.
      ox.drawImage(src, 0, 0, W, W);
      out.bb = { x: 0, y: 0, w: W, h: W };
    }
    return out;
  }

  // Ảnh thú ở bậc `stage` (0..9). Trả null nếu ảnh gốc chưa tải xong (gọi lại ở khung hình sau).
  function getStageImage(key, elementIndex, stage) {
    if (!validPet(key, elementIndex)) return null;
    const s = Math.max(0, Math.min(STAGE_COUNT - 1, stage | 0));
    const id = key + "-" + elementIndex + "-" + s;
    if (stageCache.has(id)) return stageCache.get(id);
    const rec = imageRecord(`${key}-${elementIndex}.png`);
    if (!imageIsReady(rec)) return null;
    const out = reduceImage(solidify(rec.image), STAGE_BLOCK[s], STAGE_COLORS[s]);
    stageCache.set(id, out);
    return out;
  }

  // Vẽ thú: chân đặt tại (cx, by), `size` = cạnh khung 128px sau khi phóng (đã nhân kích thước bậc nếu cần). Trả false nếu ảnh chưa sẵn sàng.
  function drawStage(ctx, key, elementIndex, stage, cx, by, size) {
    const im = getStageImage(key, elementIndex, stage);
    if (!im) return false;
    const u = size / 128, bb = im.bb;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(im, bb.x, bb.y, bb.w, bb.h, Math.round(cx - bb.w * u / 2), Math.round(by - bb.h * u), Math.max(1, Math.round(bb.w * u)), Math.max(1, Math.round(bb.h * u)));
    ctx.restore();
    return true;
  }

  // Vẽ thú nằm GIỮA điểm (cx, cy) cả ngang lẫn dọc: dùng cho ảnh chân dung trong vòng (Huyết mạch, Trang bị).
  function drawStageCentered(ctx, key, elementIndex, stage, cx, cy, size) {
    const im = getStageImage(key, elementIndex, stage);
    if (!im) return false;
    const u = size / 128, bb = im.bb;
    const w = Math.max(1, Math.round(bb.w * u)), h = Math.max(1, Math.round(bb.h * u));
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(im, bb.x, bb.y, bb.w, bb.h, Math.round(cx - w / 2), Math.round(cy - h / 2), w, h);
    ctx.restore();
    return true;
  }

  function stageScale(stage) {
    return STAGE_SCALE[Math.max(0, Math.min(STAGE_COUNT - 1, stage | 0))];
  }

  function getAdultImage(key, elementIndex) {
    if (!validPet(key, elementIndex)) return null;
    const rec = imageRecord(`${key}-${elementIndex}.png`);
    return imageIsReady(rec) ? solidify(rec.image) : null;
  }

  async function waitForSheet(key, elementIndex) {
    if (!validPet(key, elementIndex)) throw new Error("Unknown bloodline or element index");
    const rec = imageRecord(`${key}-${elementIndex}.png`);
    await rec.promise;
    return solidify(rec.image);
  }

  window.VanKiepSprites = {
    stageCount: STAGE_COUNT,
    stages: STAGE_NAMES,
    stageScale,
    getStageImage,
    drawStage,
    drawStageCentered,
    getAdultImage,
    // Giữ tên cũ để 10-drops-shop.js (preload / chờ ảnh) vẫn chạy: trả ảnh gốc khi đã tải xong, null nếu chưa.
    getSheet(key, elementIndex) {
      if (!validPet(key, elementIndex)) throw new Error("Unknown bloodline or element index");
      return getAdultImage(key, elementIndex);
    },
    waitForSheet,
    bloodlineNames: BLOODLINE_NAMES,
    elements: ELEMENTS.map(({ name, color, dark, form }, index) => ({ name, index, color, dark, form })),
  };
})();
