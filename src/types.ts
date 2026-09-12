/**
 * 中興新村路網拼圖 - 型別定義
 */

// 四個方向的定義 [北, 東, 南, 西]
export type Direction = 0 | 1 | 2 | 3; // 0: 北(N), 1: 東(E), 2: 南(S), 3: 西(W)

export interface TileDefinition {
  id: number;
  row: number;
  col: number;
  // 原始解法狀態下的四向出入口 [北, 東, 南, 西] (1 為有路，0 為無路)
  baseExits: [number, number, number, number];
  // 目前順時針轉動的步數 (0: 0°, 1: 90°, 2: 180°, 3: 270°)
  rotation: number;
  // 是否為不可轉動的初始圖塊 (白髮老爺爺起點)
  isFixed: boolean;
  // 該地塊的特殊景物主題 (紅瓦厝、囊底路、林蔭大道、綠坪公園等)
  sceneryType: 'grandpa' | 'cul_de_sac' | 'houses_cluster' | 'single_house' | 'park' | 'market_corner' | 'avenue' | 'lane';
  // 當前動畫旋轉角度 (用於平滑旋轉動畫，單位: 弧度)
  animAngle?: number;
}

export interface GameState {
  grid: TileDefinition[][];
  moveCount: number;
  startTime: number;
  isWon: boolean;
  connectedCount: number; // 當前與起點接通的圖塊數量
  totalTiles: number;     // 24 (4*6)
  deadEndsCount: number;  // 目前未對齊/落單的死路數量
}
