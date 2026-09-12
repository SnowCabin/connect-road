import { TileDefinition } from '../types';

/**
 * 畫布繪圖引擎：繪製中興新村像素風格街道、特色紅瓦屋舍、綠蔭與白髮老爺爺起點
 */

export interface DrawOptions {
  tileSize: number;
  hoveredCoord: { r: number; c: number } | null;
  connectedSet: Set<string>;
  showHints: boolean;
  isCorrect?: boolean;
  timeMs: number; // 用於微光與迷霧動態效果
  isWon: boolean;
}

/**
 * 繪製單一地塊
 */
export function drawTile(
  ctx: CanvasRenderingContext2D,
  tile: TileDefinition,
  opts: DrawOptions
) {
  const { tileSize, hoveredCoord, connectedSet, showHints, timeMs, isWon } = opts;
  const isConnected = connectedSet.has(`${tile.row},${tile.col}`) || isWon;
  const isHovered = hoveredCoord?.r === tile.row && hoveredCoord?.c === tile.col;
  const isCorrect = opts.isCorrect ?? false;
  const isLockedByHint = showHints && isCorrect && !isWon;
  const half = tileSize / 2;

  ctx.save();
  // 移至地塊中心點進行旋轉
  ctx.translate(tile.col * tileSize + half, tile.row * tileSize + half);

  // 1. 繪製草坪與庭園底色 (中興新村花園城市綠地)
  drawGround(ctx, half, tile.row, tile.col, isConnected);

  // 2. 進行圖塊平滑旋轉變形 (路網與景物隨之旋轉)
  ctx.save();
  const currentAngle = tile.animAngle !== undefined ? tile.animAngle : (tile.rotation * Math.PI) / 2;
  ctx.rotate(currentAngle);

  // 3. 繪製街道 (依 baseExits 繪製北、東、南、西通道)
  drawStreets(ctx, half, tile.baseExits, isConnected, timeMs);

  // 4. 繪製特色像素風景物 (紅瓦厝、圓環、綠樹、街燈)
  drawScenery(ctx, half, tile.sceneryType, tile.baseExits, timeMs);

  // 5. 若為起點 (白髮老爺爺)，在街道上方繪製老爺爺圖標
  if (tile.isFixed) {
    drawGrandpaAvatar(ctx, half, timeMs);
  }

  ctx.restore(); // 結束旋轉

  // 6. 繪製未接通時的飄渺迷霧效果 (符合「驅散迷霧」情境)
  if (!isConnected && !isWon) {
    drawFogOverlay(ctx, half, tile.row, tile.col, timeMs);
  }

  // 7. 若開啟「提示」，標示出所有已經轉到正確方向的圖塊 (翡翠綠高亮邊框與角標)
  if (isLockedByHint) {
    // 綠色鎖定光暈邊框
    ctx.strokeStyle = tile.isFixed ? '#f59e0b' : '#10b981';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(-half + 1.5, -half + 1.5, tileSize - 3, tileSize - 3);

    // 柔和綠色微光襯底
    ctx.fillStyle = tile.isFixed ? 'rgba(245, 158, 11, 0.12)' : 'rgba(16, 185, 129, 0.12)';
    ctx.fillRect(-half + 2, -half + 2, tileSize - 4, tileSize - 4);

    // 右上角鎖定標章 (非老爺爺圖塊，因為老爺爺自身已有鎖頭)
    if (!tile.isFixed) {
      drawCorrectLockedBadge(ctx, half);
    }
  }

  // 8. 懸停高亮外框與提示文字
  if (isHovered && !isWon) {
    if (tile.isFixed) {
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(-half + 1.5, -half + 1.5, tileSize - 3, tileSize - 3);
      drawLockBadge(ctx, half, '🔒 固定圖塊');
    } else if (isLockedByHint) {
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(-half + 1.5, -half + 1.5, tileSize - 3, tileSize - 3);
      drawLockBadge(ctx, half, '🔒 正確方向(已鎖定)');
    } else {
      ctx.strokeStyle = showHints ? '#f59e0b' : '#60a5fa';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(-half + 1.5, -half + 1.5, tileSize - 3, tileSize - 3);
      if (showHints) {
        drawRotateHintBadge(ctx, half);
      }
    }
  }

  // 9. 邊界輔助網格線
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
  ctx.lineWidth = 1;
  ctx.strokeRect(-half, -half, tileSize, tileSize);

  ctx.restore();
}

/**
 * 繪製草坪與花園土地基底
 */
function drawGround(
  ctx: CanvasRenderingContext2D,
  half: number,
  row: number,
  col: number,
  isConnected: boolean
) {
  // 草坪綠底 (已連通較為明亮生動)
  ctx.fillStyle = isConnected ? '#7fb85e' : '#6e9f54';
  ctx.fillRect(-half, -half, half * 2, half * 2);

  // 像素風點綴小草與碎花
  const seed = (row * 13 + col * 29) % 7;
  ctx.fillStyle = isConnected ? '#94ca73' : '#5e8947';
  ctx.fillRect(-half + 6 + (seed * 3) % 15, -half + 8 + (seed * 5) % 15, 3, 3);
  ctx.fillRect(half - 12 - (seed * 4) % 15, half - 12 - (seed * 2) % 15, 3, 3);

  // 小黃花
  if (seed % 2 === 0) {
    ctx.fillStyle = '#fde047';
    ctx.fillRect(-half + 10 + (seed * 7) % 20, half - 16, 2.5, 2.5);
  }
}

/**
 * 繪製街道路網
 * 像素化柏油/米白石子路 (中興新村特色路面色調)，邊緣有緣石
 */
/**
 * 繪製街道路網
 * 像素化柏油/米白石子路 (中興新村特色路面色調)，邊緣有緣石
 * 支援特色「囊底路」設計 (單向接通，端點以圓圈迴車道表示)
 */
function drawStreets(
  ctx: CanvasRenderingContext2D,
  half: number,
  exits: [number, number, number, number],
  isConnected: boolean,
  timeMs: number
) {
  const [n, e, s, w] = exits;
  const roadWidth = half * 0.72; // 路寬
  const roadHalf = roadWidth / 2;
  const curbOffset = 3;
  const exitSum = n + e + s + w;
  const isCulDeSac = exitSum === 1;

  // 緣石路肩顏色
  ctx.fillStyle = isConnected ? '#d6c8b4' : '#b2a492';

  if (isCulDeSac) {
    // === 囊底路 (Cul-de-sac) 設計：單向進入，端點以圓圈迴車道表示 ===
    // 1. 緣石路肩基底
    if (n) ctx.fillRect(-roadHalf - curbOffset, -half, roadWidth + curbOffset * 2, half);
    if (e) ctx.fillRect(0, -roadHalf - curbOffset, half, roadWidth + curbOffset * 2);
    if (s) ctx.fillRect(-roadHalf - curbOffset, 0, roadWidth + curbOffset * 2, half);
    if (w) ctx.fillRect(-half, -roadHalf - curbOffset, half, roadWidth + curbOffset * 2);

    // 囊底路端點圓圈緣石外圈
    const circleR = roadHalf + curbOffset + 4;
    ctx.beginPath();
    ctx.arc(0, 0, circleR, 0, Math.PI * 2);
    ctx.fill();

    // 2. 道路主體 (米白石子柏油)
    ctx.fillStyle = isConnected ? '#f4ece1' : '#dfd4c4';
    if (n) ctx.fillRect(-roadHalf, -half, roadWidth, half);
    if (e) ctx.fillRect(0, -roadHalf, half, roadWidth);
    if (s) ctx.fillRect(-roadHalf, 0, roadWidth, half);
    if (w) ctx.fillRect(-half, -roadHalf, half, roadWidth);

    // 囊底路端點圓圈路面
    ctx.beginPath();
    ctx.arc(0, 0, roadHalf + 4, 0, Math.PI * 2);
    ctx.fill();

    // 3. 囊底迴車圓圈中心綠島與小景 (中興新村特色植栽槽)
    ctx.fillStyle = isConnected ? '#659c47' : '#57843d';
    ctx.beginPath();
    ctx.arc(0, 0, roadHalf * 0.44, 0, Math.PI * 2);
    ctx.fill();

    // 中心小灌木或花台
    ctx.fillStyle = isConnected ? '#3e893e' : '#2f6930';
    ctx.beginPath();
    ctx.arc(0, 0, roadHalf * 0.28, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = isConnected ? '#fde047' : '#e5e7eb';
    ctx.fillRect(-1, -1, 2, 2);

    // 4. 道路中心導引標線 (到迴車圓圈邊緣停止)
    ctx.fillStyle = isConnected ? '#e2a93b' : '#baa892';
    const dashW = 2.5;
    const dashL = 6;
    if (n) ctx.fillRect(-dashW / 2, -half + 5, dashW, dashL);
    if (s) ctx.fillRect(-dashW / 2, half - 11, dashW, dashL);
    if (e) ctx.fillRect(half - 11, -dashW / 2, dashL, dashW);
    if (w) ctx.fillRect(-half + 5, -dashW / 2, dashL, dashW);
  } else {
    // === 一般雙向/十字/三叉/轉角道路 ===
    // 繪製路基 (含路肩擴展)
    ctx.fillRect(-roadHalf - curbOffset, -roadHalf - curbOffset, roadWidth + curbOffset * 2, roadWidth + curbOffset * 2);
    if (n) ctx.fillRect(-roadHalf - curbOffset, -half, roadWidth + curbOffset * 2, half);
    if (e) ctx.fillRect(0, -roadHalf - curbOffset, half, roadWidth + curbOffset * 2);
    if (s) ctx.fillRect(-roadHalf - curbOffset, 0, roadWidth + curbOffset * 2, half);
    if (w) ctx.fillRect(-half, -roadHalf - curbOffset, half, roadWidth + curbOffset * 2);

    // 道路主體 (米白/溫潤淺灰石子柏油)
    ctx.fillStyle = isConnected ? '#f4ece1' : '#dfd4c4';
    ctx.fillRect(-roadHalf, -roadHalf, roadWidth, roadWidth);
    if (n) ctx.fillRect(-roadHalf, -half, roadWidth, half);
    if (e) ctx.fillRect(0, -roadHalf, half, roadWidth);
    if (s) ctx.fillRect(-roadHalf, 0, roadWidth, half);
    if (w) ctx.fillRect(-half, -roadHalf, half, roadWidth);

    // 道路中心標線 (虛線)
    ctx.fillStyle = isConnected ? '#e2a93b' : '#baa892';
    const dashW = 3;
    const dashL = 7;

    if (n) {
      ctx.fillRect(-dashW / 2, -half + 4, dashW, dashL);
      ctx.fillRect(-dashW / 2, -half + 18, dashW, dashL);
    }
    if (s) {
      ctx.fillRect(-dashW / 2, half - 11, dashW, dashL);
      ctx.fillRect(-dashW / 2, half - 25, dashW, dashL);
    }
    if (e) {
      ctx.fillRect(half - 11, -dashW / 2, dashL, dashW);
      ctx.fillRect(half - 25, -dashW / 2, dashL, dashW);
    }
    if (w) {
      ctx.fillRect(-half + 4, -dashW / 2, dashL, dashW);
      ctx.fillRect(-half + 18, -dashW / 2, dashL, dashW);
    }
  }
}

/**
 * 繪製特色像素風景物 (紅瓦小房子、豐富綠樹、路燈、囊底路庭院)
 * 依照需求：增加綠樹與紅屋頂小房子，並移除動態橘點與奇怪水池圓圈
 */
function drawScenery(
  ctx: CanvasRenderingContext2D,
  half: number,
  type: TileDefinition['sceneryType'],
  exits: [number, number, number, number],
  timeMs: number
) {
  const [n, e, s, w] = exits;

  switch (type) {
    case 'cul_de_sac':
      // 囊底路社區：環繞囊底迴車圓圈的紅屋頂小房子與多棵林蔭綠樹
      if (!n && !w) drawRedRoofHouse(ctx, -half + 6, -half + 6, 20, 15);
      if (!s && !e) drawTree(ctx, half - 14, half - 14, 11);
      if (!n && !e) drawTree(ctx, half - 14, -half + 12, 10);
      if (!s && !w) drawTree(ctx, -half + 12, half - 14, 10);
      break;

    case 'houses_cluster':
      // 雙棟紅屋頂小房子聚落，搭配庭園綠樹
      if (!n && !w) drawRedRoofHouse(ctx, -half + 6, -half + 6, 22, 16);
      if (!s && !e) drawRedRoofHouse(ctx, half - 28, half - 22, 22, 16);
      if (!n && !e) drawTree(ctx, half - 14, -half + 12, 11);
      if (!s && !w) drawTree(ctx, -half + 12, half - 14, 10);
      break;

    case 'single_house':
      // 單棟紅屋頂小房子與多棵樟樹庭院
      if (!s && !w) {
        drawRedRoofHouse(ctx, -half + 6, half - 24, 24, 17);
        drawTree(ctx, half - 16, -half + 12, 11);
        drawTree(ctx, half - 14, half - 14, 9);
      } else if (!n && !e) {
        drawRedRoofHouse(ctx, half - 30, -half + 6, 24, 17);
        drawTree(ctx, -half + 12, half - 16, 11);
        drawTree(ctx, -half + 14, -half + 12, 9);
      } else {
        drawRedRoofHouse(ctx, -half + 6, -half + 6, 20, 15);
        drawTree(ctx, half - 14, half - 14, 11);
      }
      break;

    case 'park':
      // 綠蔭公園：多棵不同高度的大樟樹與花草
      if (!n && !w) drawTree(ctx, -half + 12, -half + 12, 13);
      if (!s && !e) drawTree(ctx, half - 14, half - 14, 12);
      if (!n && !e) drawTree(ctx, half - 14, -half + 12, 11);
      if (!s && !w) drawTree(ctx, -half + 12, half - 14, 11);
      break;

    case 'market_corner':
      // 市場角落：紅屋頂小房子與市集綠樹
      if (!n && !e) {
        drawRedRoofHouse(ctx, half - 28, -half + 6, 22, 16);
        drawTree(ctx, -half + 12, -half + 12, 10);
      } else if (!s && !w) {
        drawRedRoofHouse(ctx, -half + 6, half - 22, 22, 16);
        drawTree(ctx, half - 14, half - 14, 10);
      }
      break;

    case 'avenue':
      // 林蔭大道：兩側綠樹成蔭，並穿插一棟精緻紅屋頂小舍
      if (!n && !w) drawTree(ctx, -half + 12, -half + 12, 11);
      if (!s && !e) drawRedRoofHouse(ctx, half - 26, half - 20, 20, 15);
      if (!n && !e) drawTree(ctx, half - 14, -half + 12, 10);
      if (!s && !w) drawTree(ctx, -half + 12, half - 14, 10);
      break;

    case 'lane':
    default:
      // 靜謐巷道：路邊有樟樹與小巧路燈
      if (!n && !w) drawTree(ctx, -half + 12, -half + 12, 11);
      if (!s && !e) drawTree(ctx, half - 14, half - 14, 10);
      if (!n && !e) drawLampPost(ctx, half - 12, -half + 14);
      if (!s && !w) drawRedRoofHouse(ctx, -half + 6, half - 22, 20, 15);
      break;
  }
}

/**
 * 繪製中興新村經典斜屋頂紅瓦厝 (像素風)
 */
function drawRedRoofHouse(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  // 屋頂 (磚紅色梯形)
  ctx.fillStyle = '#b93e26'; // 紅瓦主色
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y);
  ctx.lineTo(x + w, y + h * 0.55);
  ctx.lineTo(x, y + h * 0.55);
  ctx.closePath();
  ctx.fill();

  // 屋脊陰影
  ctx.fillStyle = '#8f2916';
  ctx.fillRect(x + 2, y + h * 0.5, w - 4, 2);

  // 牆身 (米白洗石子)
  ctx.fillStyle = '#f8f4ec';
  ctx.fillRect(x + 2, y + h * 0.55, w - 4, h * 0.45);

  // 藍色木窗
  ctx.fillStyle = '#3b82f6';
  ctx.fillRect(x + 5, y + h * 0.65, 5, 4);
  ctx.fillRect(x + w - 10, y + h * 0.65, 5, 4);

  // 小門
  ctx.fillStyle = '#92400e';
  ctx.fillRect(x + w / 2 - 2, y + h * 0.68, 4, 6);
}

/**
 * 繪製像素大綠樹 (樟樹/菩提樹)
 */
function drawTree(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  // 樹幹
  ctx.fillStyle = '#78350f';
  ctx.fillRect(cx - 2, cy + r - 3, 4, 7);

  // 樹冠陰影
  ctx.fillStyle = '#265828';
  ctx.beginPath();
  ctx.arc(cx, cy + 2, r, 0, Math.PI * 2);
  ctx.fill();

  // 樹冠主綠
  ctx.fillStyle = '#3e893e';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // 樹頂陽光高光
  ctx.fillStyle = '#65a754';
  ctx.beginPath();
  ctx.arc(cx - 2, cy - 2, r * 0.55, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * 繪製市場小攤棚
 */
function drawMarketStall(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // 條紋遮雨棚 (橘白相間)
  ctx.fillStyle = '#ea580c';
  ctx.fillRect(x, y, 20, 10);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + 4, y, 4, 10);
  ctx.fillRect(x + 12, y, 4, 10);

  // 櫃檯木架
  ctx.fillStyle = '#b45309';
  ctx.fillRect(x + 1, y + 10, 18, 7);
}

/**
 * 繪製復古路燈
 */
function drawLampPost(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // 燈桿
  ctx.fillStyle = '#374151';
  ctx.fillRect(x, y, 2, 10);
  // 暖黃燈泡
  ctx.fillStyle = '#fde047';
  ctx.fillRect(x - 2, y - 2, 6, 4);
}

/**
 * 繪製圖塊上的「白髮老爺爺」頭像 (像素風格)
 * 慈祥白髮老爺爺：白髮梳理整齊、親切和藹微笑眼神（無墨鏡眼鏡、無鬍子）、身著藍綠色襯衫
 * 依指示：移除「起點」標籤文字與眼鏡/鬍子
 */
function drawGrandpaAvatar(ctx: CanvasRenderingContext2D, half: number, timeMs: number) {
  ctx.save();
  ctx.translate(0, 0);

  // 1. 金色發光圓底徽章 (凸顯長者身分)
  const pulse = Math.sin(timeMs / 300) * 1.5;
  ctx.fillStyle = 'rgba(234, 179, 8, 0.35)';
  ctx.beginPath();
  ctx.arc(0, 0, 20 + pulse, 0, Math.PI * 2);
  ctx.fill();

  // 內圈底金
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(0, 0, 18, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fef3c7';
  ctx.beginPath();
  ctx.arc(0, 0, 16, 0, Math.PI * 2);
  ctx.fill();

  // 2. 老爺爺白髮與頭部像素特徵
  // 白髮包覆 (整齊茂密的銀白長者髮型)
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(-10, -11, 20, 15);
  ctx.fillRect(-11, -8, 22, 12);

  // 額頭與兩側銀白鬢角高光
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-8, -11, 16, 4);
  ctx.fillRect(-11, -6, 3, 7);
  ctx.fillRect(8, -6, 3, 7);

  // 臉部膚色
  ctx.fillStyle = '#fed7aa';
  ctx.fillRect(-7, -7, 14, 13);

  // 慈祥微笑雙眼 (無墨鏡、無眼鏡)
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-4, -4, 2, 2.5);
  ctx.fillRect(3, -4, 2, 2.5);

  // 溫和白眉毛
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-5, -7, 3.5, 1.5);
  ctx.fillRect(2.5, -7, 3.5, 1.5);

  // 溫和好氣色粉嫩臉頰
  ctx.fillStyle = 'rgba(251, 113, 133, 0.45)';
  ctx.fillRect(-6, -1, 2.5, 2);
  ctx.fillRect(4, -1, 2.5, 2);

  // 親切微笑嘴角 (無鬍子、乾淨下巴)
  ctx.fillStyle = '#be123c';
  ctx.fillRect(-2, 2, 4, 1.5);
  ctx.fillRect(-1, 3, 2, 1);

  // 3. 藍綠色襯衫 (Teal / Blue-Green Shirt)
  ctx.fillStyle = '#0d9488'; // teal-600 藍綠色主體
  ctx.fillRect(-9, 7, 18, 8);

  // 藍綠色襯衫衣領
  ctx.fillStyle = '#14b8a6'; // teal-500
  ctx.beginPath();
  ctx.moveTo(-5, 7);
  ctx.lineTo(0, 11);
  ctx.lineTo(5, 7);
  ctx.closePath();
  ctx.fill();

  // 襯衫領口白鈕扣細節
  ctx.fillStyle = '#f0fdfa';
  ctx.fillRect(-1, 8, 2, 2);
  ctx.fillRect(-1, 12, 2, 2);

  // 4. 右上方小鎖頭 (提示不可旋轉)
  ctx.fillStyle = '#d97706';
  ctx.fillRect(10, -15, 6, 6);
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(13, -15, 2.2, Math.PI, 0);
  ctx.stroke();

  // (備註：依照指示已移除原本的「起點」文字標籤)

  ctx.restore();
}

/**
 * 繪製鎖定徽章 (當使用者懸停在固定圖塊或正確方向圖塊上時)
 */
function drawLockBadge(ctx: CanvasRenderingContext2D, half: number, text: string = '🔒 固定圖塊') {
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(-half + 3, half - 18, half * 2 - 6, 15);
  ctx.fillStyle = text.includes('正確') ? '#86efac' : '#fef08a';
  ctx.font = 'bold 9px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 0, half - 10.5);
  ctx.restore();
}

/**
 * 繪製未就位圖塊懸停時的旋轉提醒徽章
 */
function drawRotateHintBadge(ctx: CanvasRenderingContext2D, half: number) {
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
  ctx.fillRect(-half + 3, half - 18, half * 2 - 6, 15);
  ctx.fillStyle = '#fde047';
  ctx.font = 'bold 9px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🔄 點擊旋轉對齊', 0, half - 10.5);
  ctx.restore();
}

/**
 * 繪製右上角「已鎖定正確方向」小角標
 */
function drawCorrectLockedBadge(ctx: CanvasRenderingContext2D, half: number) {
  ctx.save();
  const bx = half - 14;
  const by = -half + 5;

  // 綠色底徽章
  ctx.fillStyle = '#059669';
  ctx.strokeStyle = '#34d399';
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.arc(bx + 4.5, by + 4.5, 5.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 白色鎖定與正確打勾符號 (簡潔像素風格)
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 8px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('✓', bx + 4.5, by + 5);

  ctx.restore();
}

/**
 * 繪製未接通時的飄渺迷霧覆蓋層 (增強「驅散迷霧」的成就感)
 */
function drawFogOverlay(
  ctx: CanvasRenderingContext2D,
  half: number,
  row: number,
  col: number,
  timeMs: number
) {
  ctx.save();
  const speed = timeMs / 1400;
  const driftX = Math.sin(speed + row * 1.5) * 6;
  const driftY = Math.cos(speed + col * 1.5) * 6;

  // 半透明青白迷霧
  ctx.fillStyle = 'rgba(226, 232, 240, 0.45)';
  ctx.fillRect(-half, -half, half * 2, half * 2);

  // 迷霧雲絮
  ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
  ctx.beginPath();
  ctx.arc(-half * 0.3 + driftX, -half * 0.3 + driftY, half * 0.5, 0, Math.PI * 2);
  ctx.arc(half * 0.3 - driftX, half * 0.3 - driftY, half * 0.55, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
