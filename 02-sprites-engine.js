
(() => {
  const FRAME_SIZE = 64;
  const FRAME_COUNT = 4;
  const STAGE_COUNT = 4;
  const SHEET_SIZE = FRAME_SIZE * FRAME_COUNT;
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
  const STAGE_NAMES = ["baby", "juvenile", "adult", "mythic"];
  const SCRIPT_URL = document.currentScript && document.currentScript.src
    ? document.currentScript.src
    : document.baseURI;
  const SPRITE_BASE = new URL("./sprites/", SCRIPT_URL);
  const imageRecords = new Map();
  const sheets = new Map();
  const stageGrowth = [0.42, 0.72, 1, 1.28];
  const frameBob = [0, -1, 0, 1];
  const frameSway = [0, 1, 0, -1];

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

  function pixel(ctx, x, y, width, height, color, alpha = 1) {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(width)), Math.max(1, Math.round(height)));
    ctx.globalAlpha = 1;
  }

  function diamond(ctx, x, y, size, color, dark, alpha = 1) {
    const rows = Math.max(2, Math.round(size));
    for (let row = 0; row < rows; row += 1) {
      const half = Math.max(1, Math.floor((row < rows / 2 ? row + 1 : rows - row) / 2));
      pixel(ctx, x - half, y + row, half * 2, 1, dark, alpha);
      if (half > 1) pixel(ctx, x - half + 1, y + row, half * 2 - 2, 1, color, alpha);
    }
  }

  function star(ctx, x, y, color, dark, size = 1, alpha = 1) {
    const unit = Math.max(1, Math.round(size));
    pixel(ctx, x - unit, y, unit * 3, unit, dark, alpha);
    pixel(ctx, x, y - unit, unit, unit * 3, dark, alpha);
    pixel(ctx, x, y, unit, unit, color, alpha);
  }

  function cloud(ctx, x, y, color, dark, scale = 1, alpha = 1) {
    const s = Math.max(1, Math.round(scale));
    pixel(ctx, x + s * 2, y, s * 3, s, dark, alpha);
    pixel(ctx, x, y + s, s * 8, s * 2, dark, alpha);
    pixel(ctx, x + s, y + s, s * 6, s, color, alpha);
    pixel(ctx, x + s * 2, y + s * 3, s * 5, s, dark, alpha);
  }

  function drawAgeBase(ctx, key, stage, adult, baby, frame) {
    const bob = frameBob[frame];
    const sway = frameSway[frame];
    ctx.imageSmoothingEnabled = false;

    if (stage === 0) {
      ctx.drawImage(baby, 0, 0, baby.naturalWidth || baby.width, baby.naturalHeight || baby.height, 10 + sway, 11 + bob, 44, 44);
      return;
    }

    if (stage === 1) {
      // Keep the juvenile base opaque and crisp; stage anatomy adds the growing features.
      ctx.drawImage(baby, 0, 0, baby.naturalWidth || baby.width, baby.naturalHeight || baby.height, 4 + sway, 7 + bob, 56, 54);
      return;
    }

    const size = stage === 3 ? 48 : 54;
    const x = Math.round((FRAME_SIZE - size) / 2 + sway);
    const y = stage === 3 ? 2 + bob : 5 + bob;
    const height = stage === 3 ? 60 : 57;
    ctx.drawImage(adult, 0, 0, adult.naturalWidth || adult.width, adult.naturalHeight || adult.height, x, y, size, height);
  }

  function drawBloodlineShape(ctx, key, color, dark, stage, frame) {
    const growth = stageGrowth[stage];
    const sway = frameSway[frame];
    const extra = stage === 0 ? 0.5 : stage === 1 ? 0.8 : stage === 2 ? 1 : 1.35;

    if (key === "ho") {
      for (let i = 0; i < 2 + stage; i += 1) {
        pixel(ctx, 31 + i * 5 + sway, 24 + (i % 2), 2, 6, dark, 0.9);
        pixel(ctx, 32 + i * 5 + sway, 24 + (i % 2), 1, 4, color);
      }
      pixel(ctx, 14, 19, 4 * growth, 3, color);
    } else if (key === "vu") {
      diamond(ctx, 41 + sway, 29, 9 * extra, color, dark, 0.82);
      pixel(ctx, 36, 34, 2, 5 * growth, color, 0.9);
      pixel(ctx, 44, 34, 2, 5 * growth, color, 0.9);
    } else if (key === "long") {
      const hornHeight = 4 + stage * 2;
      pixel(ctx, 19, 11 - hornHeight / 2, 3, hornHeight, dark);
      pixel(ctx, 20, 10 - hornHeight / 2, 1, hornHeight - 1, color);
      pixel(ctx, 11, 25 + sway, 8 * growth, 1, color, 0.9);
      pixel(ctx, 11, 28 + sway, 6 * growth, 1, color, 0.75);
    } else if (key === "tuoc") {
      const flap = frame === 1 ? -2 : frame === 3 ? 2 : 0;
      for (let i = 0; i < 2 + stage; i += 1) {
        const px = 44 + i * 2;
        pixel(ctx, px, 24 + flap + i * 3, 4, 2, dark, 0.92);
        pixel(ctx, px + 1, 24 + flap + i * 3, 2, 1, color);
      }
      pixel(ctx, 25, 8 - stage, 3, 5 + stage, color);
    } else if (key === "lan") {
      const horn = 3 + stage * 2;
      pixel(ctx, 21, 10 - horn, 2, horn + 3, dark);
      pixel(ctx, 22, 9 - horn, 1, horn + 2, color);
      pixel(ctx, 17, 14 - horn, 5, 2, color);
      pixel(ctx, 22, 16 - horn, 5, 2, color);
    } else if (key === "hu") {
      const tails = stage === 0 ? 1 : stage === 1 ? 2 : stage === 2 ? 4 : 6;
      for (let i = 0; i < tails; i += 1) {
        const tailX = 47 + i * 2;
        const tailY = 37 - i * 3 + sway * ((i % 2) + 1);
        pixel(ctx, tailX, tailY, 8 + stage, 2, dark, 0.82);
        pixel(ctx, tailX + 2, tailY - 1, 5 + stage, 1, color, 0.95);
      }
    }
  }

  function drawMaturityShape(ctx, key, color, dark, stage, frame) {
    if (stage === 0) return;
    const sway = frameSway[frame];

    if (key === "ho") {
      for (let i = 0; i < stage + 1; i += 1) {
        const y = 31 + i * 2 + sway;
        const inset = i * 3;
        pixel(ctx, 7 + inset, y, 5, 3, dark, 0.94);
        pixel(ctx, 9 + inset, y - 1, 3, 2, color);
        pixel(ctx, 52 - inset, y, 5, 3, dark, 0.94);
        pixel(ctx, 52 - inset, y - 1, 3, 2, color);
      }
    } else if (key === "vu") {
      for (let i = 0; i < stage + 1; i += 1) {
        const y = 31 + i * 3 + sway;
        pixel(ctx, 7 + i * 2, y, 5, 3, dark, 0.9);
        pixel(ctx, 8 + i * 2, y - 1, 3, 2, color);
        pixel(ctx, 52 - i * 2, y, 5, 3, dark, 0.9);
        pixel(ctx, 53 - i * 2, y - 1, 3, 2, color);
      }
    } else if (key === "long") {
      for (let i = 0; i < stage; i += 1) {
        const y = 26 + i * 3 + sway;
        pixel(ctx, 7, y, 9 + i * 2, 1, dark, 0.86);
        pixel(ctx, 48, y - 1, 9 + i * 2, 1, dark, 0.86);
        pixel(ctx, 8, y - 1, 7 + i * 2, 1, color, 0.9);
        pixel(ctx, 49, y - 2, 7 + i * 2, 1, color, 0.9);
      }
    } else if (key === "tuoc") {
      const flap = frame === 1 ? -1 : frame === 3 ? 1 : 0;
      for (let i = 0; i < stage + 1; i += 1) {
        const y = 23 + i * 3 + flap;
        const length = 5 + stage - i;
        pixel(ctx, 4 + i * 3, y, length, 2, dark, 0.88);
        pixel(ctx, 5 + i * 3, y - 1, Math.max(2, length - 2), 1, color);
        pixel(ctx, 55 - i * 3 - length, y, length, 2, dark, 0.88);
        pixel(ctx, 56 - i * 3 - length, y - 1, Math.max(2, length - 2), 1, color);
      }
    } else if (key === "lan") {
      for (let i = 0; i < stage; i += 1) {
        const branch = 16 + i * 3;
        const height = 3 + stage + i;
        pixel(ctx, branch, 10 - height, 2, height + 4, dark);
        pixel(ctx, branch + 1, 9 - height, 1, height + 3, color);
        pixel(ctx, 46 - i * 3, 10 - height, 2, height + 4, dark);
        pixel(ctx, 46 - i * 3, 9 - height, 1, height + 3, color);
      }
    }
  }

  function drawElementShape(ctx, element, stage, frame, keyIndex) {
    const { color, dark, form } = element;
    const growth = stageGrowth[stage];
    const sway = frameSway[frame];
    const phase = (frame + keyIndex) % 2;
    const alpha = stage === 0 ? 0.72 : 0.92;

    switch (form) {
      case "ice":
        diamond(ctx, 42 + sway, 18, 5 + stage * 2, color, dark, alpha);
        diamond(ctx, 48 + sway, 25, 3 + stage, color, dark, alpha);
        pixel(ctx, 28, 20, 2, 3 + stage, color);
        break;
      case "mist":
        cloud(ctx, 40 + sway, 19 + phase, color, dark, growth, 0.75);
        cloud(ctx, 8 - sway, 35 - phase, color, dark, growth * 0.75, 0.55);
        break;
      case "cloud":
        cloud(ctx, 42 + sway, 15 + phase, color, dark, growth, alpha);
        cloud(ctx, 7 - sway, 29 + phase, color, dark, growth * 0.8, 0.68);
        break;
      case "wind":
        for (let i = 0; i < 3; i += 1) {
          pixel(ctx, 42 + sway * (i + 1), 17 + i * 5, 11 - i * 2, 1, color, alpha - i * 0.15);
          pixel(ctx, 5 - sway, 43 + i * 3, 7 + i, 1, dark, 0.55);
        }
        break;
      case "bolt":
        pixel(ctx, 43 + sway, 15, 4, 3, color);
        pixel(ctx, 40 + sway, 18, 4, 3, dark);
        pixel(ctx, 44 + sway, 21, 4, 3, color);
        pixel(ctx, 41 + sway, 24, 3, 4, dark);
        break;
      case "moon":
        pixel(ctx, 43, 13, 3, 10, color, alpha);
        pixel(ctx, 46, 16, 3, 7, color, alpha);
        pixel(ctx, 47, 16, 2, 6, dark, 0.95);
        star(ctx, 38 + sway, 23, color, dark, 1, alpha);
        break;
      case "sun":
        for (let i = 0; i < 5; i += 1) {
          pixel(ctx, 35 + i * 3, 15 - (i % 2) * 2, 2, 5 + stage, color, alpha);
        }
        pixel(ctx, 38, 14, 7, 2, dark, 0.7);
        break;
      case "void":
        pixel(ctx, 42 + sway, 17, 8, 2, dark, 0.9);
        pixel(ctx, 46 + sway, 19, 6, 3, color, 0.65);
        pixel(ctx, 50 + sway, 22, 4, 3, dark, 0.8);
        star(ctx, 38, 27 + phase, color, dark, 1, 0.75);
        break;
      case "crystal":
        for (let i = 0; i < 2 + stage; i += 1) {
          diamond(ctx, 35 + i * 4 + sway, 23 - (i % 2) * 2, 4 + stage, color, dark, alpha);
        }
        break;
      case "gem":
        diamond(ctx, 30 + sway, 35, 7 + stage, color, dark, alpha);
        diamond(ctx, 46, 27 + phase, 4 + stage, color, dark, 0.9);
        break;
      case "leaf":
        for (let i = 0; i < 3 + stage; i += 1) {
          const x = 38 + i * 3 + sway;
          pixel(ctx, x, 17 + (i % 2) * 4, 2, 5, dark, alpha);
          pixel(ctx, x + 1, 17 + (i % 2) * 4, 4, 2, color, alpha);
          pixel(ctx, x + 2, 19 + (i % 2) * 4, 3, 2, color, alpha);
        }
        break;
      case "flame":
        pixel(ctx, 44 + sway, 33, 3, 7 + stage, dark, 0.9);
        pixel(ctx, 46 + sway, 29, 3, 7 + stage, color, alpha);
        pixel(ctx, 49 + sway, 26, 3, 7 + stage, dark, 0.85);
        pixel(ctx, 50 + sway, 24, 2, 4, color, alpha);
        break;
      case "shadow":
        for (let i = 0; i < 3 + stage; i += 1) {
          pixel(ctx, 32 + i * 4, 17 - (i % 2) * 2, 3, 7 + stage, dark, 0.95);
          pixel(ctx, 33 + i * 4, 18 - (i % 2) * 2, 1, 4 + stage, color, 0.8);
        }
        break;
      case "star":
        star(ctx, 45 + sway, 17 + phase, color, dark, 2, alpha);
        star(ctx, 36 - sway, 28 - phase, color, dark, 1, alpha);
        star(ctx, 51 + sway, 34, color, dark, 1, 0.78);
        break;
      case "feather":
        for (let i = 0; i < 3 + stage; i += 1) {
          pixel(ctx, 40 + i * 2 + sway, 18 + i * 3, 7 - i, 2, dark, 0.9);
          pixel(ctx, 41 + i * 2 + sway, 18 + i * 3, 5 - i, 1, color, alpha);
        }
        break;
      case "petal":
        diamond(ctx, 44 + sway, 18, 4 + stage, color, dark, alpha);
        diamond(ctx, 39, 22 + phase, 4 + stage, color, dark, 0.9);
        diamond(ctx, 49, 22 - phase, 4 + stage, color, dark, 0.9);
        pixel(ctx, 43, 24, 6, 2, dark, 0.8);
        break;
      case "crown":
        pixel(ctx, 39, 17, 12, 2, dark, 0.95);
        pixel(ctx, 40, 14 - stage, 2, 5 + stage, color);
        pixel(ctx, 44, 12 - stage, 2, 7 + stage, color);
        pixel(ctx, 48, 14 - stage, 2, 5 + stage, color);
        pixel(ctx, 41, 18, 8, 2, color);
        break;
    }
  }

  function drawIdleEffects(ctx, element, frame, keyIndex, stage) {
    const { color, dark, form } = element;
    const sway = frameSway[frame];
    const growth = stageGrowth[stage];
    const points = [
      [8 + ((frame + keyIndex) % 3), 18],
      [53 - ((frame + keyIndex + 1) % 4), 27 + (frame % 2) * 2],
      [14 + ((frame + 2) % 4), 46 - frame % 2],
    ];
    points.forEach(([x, y], index) => {
      const px = x + sway * (index % 2 ? -1 : 1);
      if (form === "cloud" || form === "mist") {
        cloud(ctx, px, y, color, dark, Math.max(1, growth * 0.6), 0.74);
      } else if (form === "flame" || form === "bolt" || form === "wind") {
        pixel(ctx, px, y, 2, 3 + (frame % 2), color, 0.84);
        pixel(ctx, px + 2, y - 2, 2, 2, dark, 0.78);
      } else {
        star(ctx, px, y, color, dark, index === frame % 3 ? 2 : 1, 0.86);
      }
    });
  }

  function drawFrame(ctx, key, elementIndex, stage, frame, adult, baby) {
    const element = ELEMENTS[elementIndex];
    const keyIndex = BLOODLINES.indexOf(key);
    ctx.clearRect(0, 0, FRAME_SIZE, FRAME_SIZE);
    ctx.imageSmoothingEnabled = false;
    ctx.save();
    ctx.translate(0, frameBob[frame]);
    drawAgeBase(ctx, key, stage, adult, baby, frame);

    ctx.save();
    ctx.globalCompositeOperation = "source-atop";
    ctx.globalAlpha = stage === 0 ? 0.12 : 0.16;
    ctx.fillStyle = element.color;
    ctx.fillRect(0, 0, FRAME_SIZE, FRAME_SIZE);
    ctx.restore();

    drawBloodlineShape(ctx, key, element.color, element.dark, stage, frame);
    drawMaturityShape(ctx, key, element.color, element.dark, stage, frame);
    drawElementShape(ctx, element, stage, frame, keyIndex);
    drawIdleEffects(ctx, element, frame, keyIndex, stage);
    ctx.restore();
  }

  function imageIsReady(record) {
    return record.image.complete && record.image.naturalWidth > 0;
  }

  // Ngưỡng alpha: >= SOLID_ALPHA thì thành đặc (255), thấp hơn thì xóa. Tăng số này để viền gọn hơn, giảm để giữ nhiều chi tiết mờ hơn.
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

  function getSheet(key, elementIndex) {
    if (!BLOODLINES.includes(key) || !Number.isInteger(elementIndex) || elementIndex < 0 || elementIndex >= ELEMENTS.length) {
      throw new Error("Unknown bloodline or element index");
    }

    const id = `${key}-${elementIndex}`;
    if (sheets.has(id)) return sheets.get(id);

    const adult = imageRecord(`${key}-${elementIndex}.png`);
    const baby = imageRecord(`baby-${key}.png`);
    if (!imageIsReady(adult) || !imageIsReady(baby)) return null;
    // Làm đặc ảnh thú: pixel bán trong suốt (viền mờ, hào quang) -> đặc hoặc xóa, để thú nét như quái.
    const adultSolid = solidify(adult.image);
    const babySolid = solidify(baby.image);

    const canvas = document.createElement("canvas");
    canvas.width = SHEET_SIZE;
    canvas.height = SHEET_SIZE;
    const ctx = canvas.getContext("2d", { alpha: true });
    ctx.imageSmoothingEnabled = false;

    for (let stage = 0; stage < STAGE_COUNT; stage += 1) {
      for (let frame = 0; frame < FRAME_COUNT; frame += 1) {
        ctx.save();
        ctx.translate(frame * FRAME_SIZE, stage * FRAME_SIZE);
        drawFrame(ctx, key, elementIndex, stage, frame, adultSolid, babySolid);
        ctx.restore();
      }
    }

    sheets.set(id, canvas);
    return canvas;
  }

  async function waitForSheet(key, elementIndex) {
    const existing = getSheet(key, elementIndex);
    if (existing) return existing;
    const adult = imageRecord(`${key}-${elementIndex}.png`);
    const baby = imageRecord(`baby-${key}.png`);
    await Promise.all([adult.promise, baby.promise]);
    const sheet = getSheet(key, elementIndex);
    if (!sheet) throw new Error(`Sprite sheet ${key}-${elementIndex} is not ready`);
    return sheet;
  }

  function frameRect(stage, frame) {
    return {
      sx: frame * FRAME_SIZE,
      sy: stage * FRAME_SIZE,
      sw: FRAME_SIZE,
      sh: FRAME_SIZE,
    };
  }

  async function buildAtlas(onProgress = () => {}) {
    const columns = 10;
    const count = BLOODLINES.length * ELEMENTS.length;
    const rows = Math.ceil(count / columns);
    const atlas = document.createElement("canvas");
    atlas.width = columns * SHEET_SIZE;
    atlas.height = rows * SHEET_SIZE;
    const ctx = atlas.getContext("2d", { alpha: true });
    ctx.imageSmoothingEnabled = false;
    const manifest = {
      format: "PNG sprite atlas; 10 columns of 4x4 sprite sheets",
      sheetWidth: SHEET_SIZE,
      sheetHeight: SHEET_SIZE,
      frameWidth: FRAME_SIZE,
      frameHeight: FRAME_SIZE,
      framesPerStage: FRAME_COUNT,
      stageRows: STAGE_COUNT,
      animation: ["idle-0", "idle-1", "idle-2", "idle-3"],
      stages: STAGE_NAMES,
      elements: ELEMENTS.map((element, index) => ({ index, name: element.name })),
      sprites: [],
    };

    let index = 0;
    for (const key of BLOODLINES) {
      for (let elementIndex = 0; elementIndex < ELEMENTS.length; elementIndex += 1) {
        const sheet = await waitForSheet(key, elementIndex);
        const column = index % columns;
        const row = Math.floor(index / columns);
        const x = column * SHEET_SIZE;
        const y = row * SHEET_SIZE;
        ctx.drawImage(sheet, x, y);
        manifest.sprites.push({
          id: `${key}-${elementIndex}`,
          bloodline: key,
          bloodlineName: BLOODLINE_NAMES[key],
          elementIndex,
          elementName: ELEMENTS[elementIndex].name,
          x,
          y,
          width: SHEET_SIZE,
          height: SHEET_SIZE,
        });
        index += 1;
        onProgress(index, count);
        if (index % 4 === 0) {
          await new Promise((resolve) => requestAnimationFrame(resolve));
        }
      }
    }

    return { canvas: atlas, manifest };
  }

  window.VanKiepSprites = {
    frameSize: FRAME_SIZE,
    frameCount: FRAME_COUNT,
    stageCount: STAGE_COUNT,
    getSheet,
    // Ảnh gốc 128x128 của thú trưởng thành (đã làm đặc) để vẽ trực tiếp, nét như quái. Trả về null nếu ảnh chưa tải xong.
    getAdultImage(key, elementIndex) {
      if (!BLOODLINES.includes(key) || !Number.isInteger(elementIndex) || elementIndex < 0 || elementIndex >= ELEMENTS.length) return null;
      const rec = imageRecord(`${key}-${elementIndex}.png`);
      return imageIsReady(rec) ? solidify(rec.image) : null;
    },
    waitForSheet,
    frameRect,
    buildAtlas,
    bloodlineNames: BLOODLINE_NAMES,
    elements: ELEMENTS.map(({ name }, index) => ({ name, index })),
    stages: STAGE_NAMES,
  };
})();

