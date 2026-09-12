/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { GameCanvas } from './components/GameCanvas';
import { VictoryModal } from './components/VictoryModal';
import { GrandpaDialog } from './components/GrandpaDialog';
import { EmbedHelpModal } from './components/EmbedHelpModal';
import {
  createInitialGrid,
  shuffleGrid,
  evaluateNetwork,
  isTileInCorrectOrientation,
} from './utils/puzzleData';
import { sound } from './utils/audio';
import { TileDefinition } from './types';
import { Sparkles } from 'lucide-react';

export default function App() {
  // 1. 地圖網格狀態 (4*6)
  const [grid, setGrid] = useState<TileDefinition[][]>(() => {
    const base = createInitialGrid();
    return shuffleGrid(base);
  });

  // 2. 遊戲進度與計數狀態
  const [moveCount, setMoveCount] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(() => Date.now());
  const [timeSpentSec, setTimeSpentSec] = useState<number>(0);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [showHints, setShowHints] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // 3. 彈窗狀態
  const [isGrandpaDialogOpen, setIsGrandpaDialogOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

  // 4. 計算路網連通性
  const networkStatus = useMemo(() => {
    return evaluateNetwork(grid);
  }, [grid]);

  // 4.1 計算目前已轉到正確方向的圖塊數量 (包含老爺爺固定起點)
  const correctTilesCount = useMemo(() => {
    let count = 0;
    grid.forEach(row => {
      row.forEach(tile => {
        if (isTileInCorrectOrientation(tile)) {
          count++;
        }
      });
    });
    return count;
  }, [grid]);

  // 5. 計時器 (過關時暫停)
  useEffect(() => {
    if (isWon) return;
    const interval = setInterval(() => {
      setTimeSpentSec(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isWon, startTime]);

  // 6. 監聽是否達成通關條件
  useEffect(() => {
    if (!isWon && networkStatus.isWon) {
      setIsWon(true);
      sound.playVictory();
    }
  }, [networkStatus.isWon, isWon]);

  // 7. 點擊旋轉圖塊
  const handleRotateTile = useCallback(
    (r: number, c: number) => {
      if (isWon) return;

      setGrid(prev => {
        const next = prev.map(row => row.map(tile => ({ ...tile })));
        const target = next[r][c];
        if (target.isFixed) return prev;

        // 若開啟提示，鎖定已轉到正確方向的圖塊
        if (showHints && isTileInCorrectOrientation(target)) {
          return prev;
        }

        const prevConnectedCount = networkStatus.connectedSet.size;

        target.rotation = (target.rotation + 1) % 4;

        // 重新檢查連通性以播放音效
        const newStatus = evaluateNetwork(next);
        if (!newStatus.isWon && newStatus.connectedSet.size > prevConnectedCount) {
          sound.playConnect();
        }

        return next;
      });

      setMoveCount(prev => prev + 1);
    },
    [isWon, showHints, networkStatus.connectedSet.size]
  );

  // 8. 重新打亂洗牌
  const handleResetGame = useCallback(() => {
    const base = createInitialGrid();
    const shuffled = shuffleGrid(base);
    setGrid(shuffled);
    setMoveCount(0);
    setStartTime(Date.now());
    setTimeSpentSec(0);
    setIsWon(false);
  }, []);

  // 9. 一鍵通關 / 測試驗證輔助功能 (方便使用者或關卡測試時立即預覽過關畫面)
  const handleInstantSolve = useCallback(() => {
    const solved = createInitialGrid();
    setGrid(solved);
    setIsWon(true);
    sound.playVictory();
  }, []);

  // 10. 音效開關切換
  const handleToggleSound = useCallback(() => {
    const state = sound.toggleSound();
    setSoundEnabled(state);
  }, []);

  // 11. 提示開關切換 (播放提示音並鎖定標示正確圖塊)
  const handleToggleHints = useCallback(() => {
    setShowHints(prev => {
      const next = !prev;
      if (next) {
        sound.playHint();
      }
      return next;
    });
  }, []);

  return (
    <div
      id="app-root-container"
      className="w-full h-screen flex flex-col bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 text-stone-100 overflow-hidden font-sans select-none"
    >
      {/* 頂部導覽與數據列 */}
      <Header
        connectedCount={networkStatus.connectedSet.size}
        totalTiles={networkStatus.totalTiles}
        correctTilesCount={correctTilesCount}
        moveCount={moveCount}
        deadEndsCount={networkStatus.deadEndsCount}
        showHints={showHints}
        onToggleHints={handleToggleHints}
        onResetGame={handleResetGame}
        onOpenHelp={() => setIsHelpOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
      />

      {/* 核心 HTML5 Canvas 遊戲區 */}
      <main className="flex-1 w-full flex flex-col items-center justify-center relative overflow-hidden">
        {/* 背景裝飾像素網紋 */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* 遊戲 Canvas 元件 */}
        <GameCanvas
          grid={grid}
          connectedSet={networkStatus.connectedSet}
          isWon={isWon}
          showHints={showHints}
          onRotateTile={handleRotateTile}
          onGrandpaClick={() => setIsGrandpaDialogOpen(true)}
        />

        {/* 底部操作提示 */}
        <footer className="w-full py-1.5 px-3 bg-stone-950/70 border-t border-stone-800/60 text-center flex items-center justify-center text-[11px] text-stone-400 shrink-0">
          <span className="hidden sm:inline">
            💡 點擊圖塊轉動街道，使全村交通相連且<strong>無死路</strong>，即可驅散迷霧！
          </span>
          <span className="sm:hidden text-[10px]">
            點擊轉動街道，接通全路網！
          </span>
        </footer>
      </main>

      {/* 過關畫面 (指定標題、popworld提示文字、地雷復圖卡) */}
      <VictoryModal
        isOpen={isWon}
        moveCount={moveCount}
        timeSpentSec={timeSpentSec}
        onPlayAgain={handleResetGame}
      />

      {/* 白髮老爺爺起點圖塊點擊對話框 */}
      <GrandpaDialog
        isOpen={isGrandpaDialogOpen}
        onClose={() => setIsGrandpaDialogOpen(false)}
      />

      {/* 遊戲規則彈窗 */}
      <EmbedHelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}
