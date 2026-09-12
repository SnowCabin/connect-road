/**
 * =========================================================================
 * 遊戲設定與外部圖片資源配置 (Game Configuration & Image Assets)
 * =========================================================================
 * 
 * 【如何替換過關圖片 (地雷復-01.png)】：
 * 1. 本地檔案替換法：
 *    - 將您上傳的「地雷復-01.png」更名為「dileifu.png」放入專案的 public/assets/ 資料夾下
 *    - 或者將 VICTORY_IMAGE_URL 修改為 "/地雷復-01.png"（只要把圖片放到 public/ 根目錄即可）
 * 2. 外部網址替換法：
 *    - 直接將 VICTORY_IMAGE_URL 替換為圖片的公開連結 (如 Imgur、Google Drive 公開圖床等)
 * =========================================================================
 */

export const getAssetUrl = (path: string): string => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const base = import.meta.env.BASE_URL || './';
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  return `${cleanBase}${cleanPath}`;
};

export const GAME_CONFIG = {
  // 過關圖片預設路徑 (會自動搭配 GitHub Pages /connect-road/ 子目錄)
  VICTORY_IMAGE_URL: '地雷復-01.png',
  VICTORY_IMAGE_FALLBACK: 'assets/dileifu.svg',

  // 過關標題文字（指定規格）
  VICTORY_TITLE: '成功驅散迷霧，卦靈現身',

  // popworld 提示文字（指定規格）
  VICTORY_POPWORLD_HINT: '請開啟popworld點「輸入答案」按鈕後，將鏡頭對準這個圖片，辨識成功，即可過關。',

  // 地圖網格規格：6 列 x 4 行 (6*4 直排與橫排對調)
  GRID_ROWS: 6,
  GRID_COLS: 4,

  // 老爺爺圖塊座標 (列, 行)
  // 設在 (0, 0) 為固定圖塊，不可轉動
  START_TILE: {
    row: 0,
    col: 0,
  },

  // 畫布基礎格點尺寸 (像素)
  TILE_PIXEL_SIZE: 90,

  // 動畫旋轉時長 (毫秒)
  ROTATION_ANIM_DURATION: 140,
};
