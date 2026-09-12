import React, { useRef, useEffect, useState, useCallback } from 'react';
import { TileDefinition } from '../types';
import { GAME_CONFIG } from '../config';
import { drawTile } from '../utils/tileDrawer';
import { isTileInCorrectOrientation } from '../utils/puzzleData';
import { sound } from '../utils/audio';

interface GameCanvasProps {
  grid: TileDefinition[][];
  connectedSet: Set<string>;
  isWon: boolean;
  showHints: boolean;
  onRotateTile: (row: number, col: number) => void;
  onGrandpaClick: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  grid,
  connectedSet,
  isWon,
  showHints,
  onRotateTile,
  onGrandpaClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 當前畫布格點大小（依據容器寬度自適應）
  const [tileSize, setTileSize] = useState<number>(GAME_CONFIG.TILE_PIXEL_SIZE);
  const [hoveredCoord, setHoveredCoord] = useState<{ r: number; c: number } | null>(null);

  // 動畫旋轉狀態追蹤器 (記錄每個圖塊正在進行的旋轉插值)
  const animAnglesRef = useRef<Map<string, { current: number; target: number }>>(new Map());

  // 1. 監聽容器尺寸變化，讓畫布自適應 Google Sites 內嵌寬度
  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      const containerW = containerRef.current.clientWidth;
      const containerH = containerRef.current.clientHeight || (containerW * 6) / 4;

      const cols = GAME_CONFIG.GRID_COLS;
      const rows = GAME_CONFIG.GRID_ROWS;

      // 預留適當邊距
      const availableW = Math.max(containerW - 16, 240);
      const availableH = Math.max(containerH - 16, 240);

      const sizeByWidth = Math.floor(availableW / cols);
      const sizeByHeight = Math.floor(availableH / rows);

      const calculatedSize = Math.max(Math.min(sizeByWidth, sizeByHeight, 105), 40);
      setTileSize(calculatedSize);
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    window.addEventListener('resize', updateSize);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  // 2. 同步目前 grid 旋轉步數至動畫目標角度
  useEffect(() => {
    grid.forEach(row => {
      row.forEach(tile => {
        const key = `${tile.row},${tile.col}`;
        const targetAngle = (tile.rotation * Math.PI) / 2;
        const existing = animAnglesRef.current.get(key);

        if (!existing) {
          animAnglesRef.current.set(key, { current: targetAngle, target: targetAngle });
        } else {
          // 當玩家點擊旋轉時，平滑推進角度
          existing.target = targetAngle;
          // 若目標角度大幅跨越，平滑化
          if (existing.target < existing.current) {
            existing.current -= Math.PI * 2;
          }
        }
      });
    });
  }, [grid]);

  // 3. Canvas 主繪圖與動畫迴圈 (requestAnimationFrame)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = (timeMs: number) => {
      const rows = GAME_CONFIG.GRID_ROWS;
      const cols = GAME_CONFIG.GRID_COLS;
      const width = cols * tileSize;
      const height = rows * tileSize;

      // 高解析螢幕適配 (Retina)
      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // 清空畫布
      ctx.clearRect(0, 0, width, height);

      // 插值平滑旋轉角度
      grid.forEach(row => {
        row.forEach(tile => {
          const key = `${tile.row},${tile.col}`;
          const anim = animAnglesRef.current.get(key);
          if (anim) {
            const diff = anim.target - anim.current;
            if (Math.abs(diff) > 0.005) {
              anim.current += diff * 0.28; // 平滑緩動
            } else {
              anim.current = anim.target;
            }
            tile.animAngle = anim.current;
          }

          // 判斷該圖塊當前是否已經轉到正確方向
          const isCorrect = isTileInCorrectOrientation(tile);

          // 繪製地塊
          drawTile(ctx, tile, {
            tileSize,
            hoveredCoord,
            connectedSet,
            showHints,
            isCorrect,
            timeMs,
            isWon,
          });
        });
      });

      // 通關時繪製全景金色粒子慶祝微光
      if (isWon) {
        drawCelebrationGlow(ctx, width, height, timeMs);
      }

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [grid, tileSize, hoveredCoord, connectedSet, showHints, isWon]);

  // 4. 通關時的金光流淌效果
  const drawCelebrationGlow = (ctx: CanvasRenderingContext2D, w: number, h: number, timeMs: number) => {
    ctx.save();
    const count = 18;
    for (let i = 0; i < count; i++) {
      const angle = (timeMs / 800 + i * (Math.PI / 9)) % (Math.PI * 2);
      const px = (Math.sin(angle * 1.5 + i) * 0.5 + 0.5) * w;
      const py = (Math.cos(angle * 1.2 + i * 2) * 0.5 + 0.5) * h;
      const r = (Math.sin(timeMs / 200 + i) * 0.5 + 0.5) * 4 + 2;

      ctx.fillStyle = i % 2 === 0 ? 'rgba(254, 240, 138, 0.75)' : 'rgba(234, 179, 8, 0.65)';
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

  // 5. 點擊與觸控處理
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (isWon) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const c = Math.floor(clickX / tileSize);
      const r = Math.floor(clickY / tileSize);

      if (r >= 0 && r < GAME_CONFIG.GRID_ROWS && c >= 0 && c < GAME_CONFIG.GRID_COLS) {
        const targetTile = grid[r][c];
        const isCorrect = isTileInCorrectOrientation(targetTile);

        if (targetTile.isFixed) {
          sound.playFixed();
          onGrandpaClick();
        } else if (showHints && isCorrect) {
          // 點提示時：鎖定已轉到正確方向的圖塊，點擊不旋轉並給予鎖定提示反饋
          sound.playFixed();
        } else {
          sound.playRotate();
          onRotateTile(r, c);
        }
      }
    },
    [grid, tileSize, isWon, showHints, onRotateTile, onGrandpaClick]
  );

  // 6. 滑鼠移動懸停
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const moveX = e.clientX - rect.left;
      const moveY = e.clientY - rect.top;

      const c = Math.floor(moveX / tileSize);
      const r = Math.floor(moveY / tileSize);

      if (r >= 0 && r < GAME_CONFIG.GRID_ROWS && c >= 0 && c < GAME_CONFIG.GRID_COLS) {
        setHoveredCoord({ r, c });
      } else {
        setHoveredCoord(null);
      }
    },
    [tileSize]
  );

  const handlePointerLeave = useCallback(() => {
    setHoveredCoord(null);
  }, []);

  // 判斷懸停中的圖塊是否已被鎖定 (老爺爺固定圖塊 或 提示中已轉對方向的圖塊)
  const isHoveredTileLocked =
    hoveredCoord !== null &&
    (grid[hoveredCoord.r][hoveredCoord.c].isFixed ||
      (showHints && isTileInCorrectOrientation(grid[hoveredCoord.r][hoveredCoord.c])));

  return (
    <div
      ref={containerRef}
      className="relative w-full flex-1 flex items-center justify-center p-2 select-none overflow-hidden"
      id="game-canvas-container"
    >
      <div className="relative p-2 rounded-2xl bg-amber-950/20 border-4 border-amber-800/40 shadow-2xl backdrop-blur-xs flex items-center justify-center">
        <canvas
          ref={canvasRef}
          id="game-canvas-element"
          className={`rounded-xl shadow-inner touch-none transition-all ${
            isWon
              ? 'cursor-default'
              : isHoveredTileLocked
              ? 'cursor-not-allowed'
              : 'cursor-pointer'
          }`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
        />
      </div>
    </div>
  );
};
