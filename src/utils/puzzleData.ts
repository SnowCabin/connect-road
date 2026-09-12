import { GAME_CONFIG } from '../config';
import { TileDefinition } from '../types';

/**
 * 中興新村 6*4 街道地圖基礎結構 (6 列 x 4 行，直排與橫排對調，總格數維持 24 格)
 * 基礎四向通道: [北, 東, 南, 西] (1 為有路，0 為無路)
 * 包含中興新村著名的「囊底路」(只有單向接通，端點以圓圈表示) 特色設計。
 * 
 * 參考中興新村特色：
 * - 第 0 列: 環山路頂端 (白髮老爺爺、綠蔭大道、紅瓦厝)
 * - 第 1 列: 光華一路、囊底路巷弄 (1,3)
 * - 第 2 列: 光華二路、囊底路社區 (2,0)
 * - 第 3 列: 光榮西路、囊底路巷弄 (3,3)
 * - 第 4 列: 中正路商圈、囊底路社區 (4,0)
 * - 第 5 列: 大草坪自行車道、育成聚落、囊底路巷弄 (5,3)
 */
const BASE_GRID_EXITS: [number, number, number, number][][] = [
  // Row 0
  [
    [0, 1, 1, 0], // (0,0) 東、南 (白髮老爺爺固定圖塊)
    [0, 1, 0, 1], // (0,1) 東、西
    [0, 1, 1, 1], // (0,2) 東、南、西
    [0, 0, 1, 1], // (0,3) 南、西
  ],
  // Row 1
  [
    [1, 1, 0, 0], // (1,0) 北、東
    [0, 1, 1, 1], // (1,1) 東、南、西
    [1, 0, 1, 1], // (1,2) 北、南、西
    [1, 0, 0, 0], // (1,3) 北 (囊底路：單向連通，端點圓圈)
  ],
  // Row 2
  [
    [0, 0, 1, 0], // (2,0) 南 (囊底路：單向連通，端點圓圈)
    [1, 1, 1, 0], // (2,1) 北、東、南
    [1, 1, 0, 1], // (2,2) 北、東、西
    [0, 0, 1, 1], // (2,3) 南、西
  ],
  // Row 3
  [
    [1, 1, 0, 0], // (3,0) 北、東
    [1, 1, 1, 1], // (3,1) 北、東、南、西 十字路
    [0, 0, 1, 1], // (3,2) 南、西
    [1, 0, 0, 0], // (3,3) 北 (囊底路：單向連通，端點圓圈)
  ],
  // Row 4
  [
    [0, 0, 1, 0], // (4,0) 南 (囊底路：單向連通，端點圓圈)
    [1, 1, 0, 0], // (4,1) 北、東
    [1, 1, 1, 1], // (4,2) 北、東、南、西 十字路
    [0, 0, 1, 1], // (4,3) 南、西
  ],
  // Row 5
  [
    [1, 1, 0, 0], // (5,0) 北、東
    [0, 1, 0, 1], // (5,1) 東、西
    [1, 0, 0, 1], // (5,2) 北、西
    [1, 0, 0, 0], // (5,3) 北 (囊底路：單向連通，端點圓圈)
  ],
];

// 各地塊的像素風特色景物佈局 (無文字標示，含更多綠樹、紅屋頂小房子與囊底路)
const SCENERY_TYPES: TileDefinition['sceneryType'][][] = [
  ['grandpa', 'avenue', 'houses_cluster', 'park'],
  ['houses_cluster', 'lane', 'single_house', 'cul_de_sac'],
  ['cul_de_sac', 'avenue', 'houses_cluster', 'park'],
  ['single_house', 'lane', 'houses_cluster', 'cul_de_sac'],
  ['cul_de_sac', 'houses_cluster', 'avenue', 'park'],
  ['houses_cluster', 'avenue', 'single_house', 'cul_de_sac'],
];

/**
 * 根據目前的旋轉步數計算當前的四向開口
 * 旋轉步數 r ∈ [0, 1, 2, 3] (順時針 90°)
 * 方向索引: 0:北, 1:東, 2:南, 3:西
 */
export function getCurrentExits(tile: TileDefinition): [number, number, number, number] {
  const r = (tile.rotation % 4 + 4) % 4;
  const base = tile.baseExits;
  // 順時針轉 90°: 新的北來自舊的西，新的東來自舊的北...
  return [
    base[(0 - r + 4) % 4], // N
    base[(1 - r + 4) % 4], // E
    base[(2 - r + 4) % 4], // S
    base[(3 - r + 4) % 4], // W
  ];
}

/**
 * 檢查圖塊當前是否已經轉到正確方向
 * 比對當前的四向開口與原始基準解法 baseExits
 */
export function isTileInCorrectOrientation(tile: TileDefinition): boolean {
  const cur = getCurrentExits(tile);
  const target = tile.baseExits;
  return (
    cur[0] === target[0] &&
    cur[1] === target[1] &&
    cur[2] === target[2] &&
    cur[3] === target[3]
  );
}

/**
 * 產生初始地圖網格
 */
export function createInitialGrid(): TileDefinition[][] {
  const rows = GAME_CONFIG.GRID_ROWS;
  const cols = GAME_CONFIG.GRID_COLS;
  const startRow = GAME_CONFIG.START_TILE.row;
  const startCol = GAME_CONFIG.START_TILE.col;

  const grid: TileDefinition[][] = [];
  let idCounter = 0;

  for (let r = 0; r < rows; r++) {
    const rowList: TileDefinition[] = [];
    for (let c = 0; c < cols; c++) {
      const isFixed = r === startRow && c === startCol;
      rowList.push({
        id: idCounter++,
        row: r,
        col: c,
        baseExits: BASE_GRID_EXITS[r][c],
        rotation: 0,
        isFixed,
        sceneryType: isFixed ? 'grandpa' : SCENERY_TYPES[r][c],
        animAngle: 0,
      });
    }
    grid.push(rowList);
  }

  return grid;
}

/**
 * 隨機打亂地圖 (初始圖塊不可轉動，其餘隨機旋轉 1~3 次 90 度)
 */
export function shuffleGrid(grid: TileDefinition[][]): TileDefinition[][] {
  const newGrid = grid.map(row =>
    row.map(tile => {
      if (tile.isFixed) {
        return { ...tile, rotation: 0, animAngle: 0 };
      }
      // 隨機旋轉 1, 2, 或 3 次
      const rot = Math.floor(Math.random() * 3) + 1;
      return {
        ...tile,
        rotation: rot,
        animAngle: (rot * Math.PI) / 2,
      };
    })
  );

  // 確保打亂後不會剛好是已通關狀態
  const status = evaluateNetwork(newGrid);
  if (status.isWon) {
    // 若極小機率剛好已通關，隨機轉動一個圖塊
    const targetTile = newGrid[1][1];
    targetTile.rotation = (targetTile.rotation + 1) % 4;
    targetTile.animAngle = (targetTile.rotation * Math.PI) / 2;
  }

  return newGrid;
}

/**
 * 評估路網連通性與死路數量
 * 1. 從 (0,0) 白髮老爺爺起點開始進行廣度優先搜尋 (BFS)，找出所有連通的圖塊
 * 2. 檢查所有邊緣與相鄰接點是否皆完全對齊（無落單、死路、碰壁）
 * 3. 若所有圖塊皆連通且死路數為 0，則過關！
 */
export function evaluateNetwork(grid: TileDefinition[][]): {
  connectedSet: Set<string>; // 座標字串 "r,c"
  deadEndsCount: number;
  isWon: boolean;
  totalTiles: number;
} {
  const rows = grid.length;
  const cols = grid[0].length;
  const totalTiles = rows * cols;

  // 計算每個圖塊目前的四向出入口
  const currentExits: [number, number, number, number][][] = grid.map(row =>
    row.map(tile => getCurrentExits(tile))
  );

  // 1. 計算死路 (未對應之開口)
  let deadEndsCount = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const [n, e, s, w] = currentExits[r][c];

      // 北方檢查
      if (n) {
        if (r === 0 || !currentExits[r - 1][c][2]) deadEndsCount++;
      }
      // 東方檢查
      if (e) {
        if (c === cols - 1 || !currentExits[r][c + 1][3]) deadEndsCount++;
      }
      // 南方檢查
      if (s) {
        if (r === rows - 1 || !currentExits[r + 1][c][0]) deadEndsCount++;
      }
      // 西方檢查
      if (w) {
        if (c === 0 || !currentExits[r][c - 1][1]) deadEndsCount++;
      }
    }
  }

  // 2. 從老爺爺起點 BFS 連通範圍
  const startR = GAME_CONFIG.START_TILE.row;
  const startC = GAME_CONFIG.START_TILE.col;
  const connectedSet = new Set<string>();

  const queue: [number, number][] = [[startR, startC]];
  connectedSet.add(`${startR},${startC}`);

  while (queue.length > 0) {
    const [r, c] = queue.shift()!;
    const [n, e, s, w] = currentExits[r][c];

    // 往北連通
    if (n && r > 0 && currentExits[r - 1][c][2]) {
      const key = `${r - 1},${c}`;
      if (!connectedSet.has(key)) {
        connectedSet.add(key);
        queue.push([r - 1, c]);
      }
    }
    // 往東連通
    if (e && c < cols - 1 && currentExits[r][c + 1][3]) {
      const key = `${r},${c + 1}`;
      if (!connectedSet.has(key)) {
        connectedSet.add(key);
        queue.push([r, c + 1]);
      }
    }
    // 往南連通
    if (s && r < rows - 1 && currentExits[r + 1][c][0]) {
      const key = `${r + 1},${c}`;
      if (!connectedSet.has(key)) {
        connectedSet.add(key);
        queue.push([r + 1, c]);
      }
    }
    // 往西連通
    if (w && c > 0 && currentExits[r][c - 1][1]) {
      const key = `${r},${c - 1}`;
      if (!connectedSet.has(key)) {
        connectedSet.add(key);
        queue.push([r, c - 1]);
      }
    }
  }

  const isWon = deadEndsCount === 0 && connectedSet.size === totalTiles;

  return {
    connectedSet,
    deadEndsCount,
    isWon,
    totalTiles,
  };
}
