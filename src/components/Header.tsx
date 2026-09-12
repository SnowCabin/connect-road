import React from 'react';
import { Volume2, VolumeX, Lightbulb, RotateCcw, HelpCircle, Lock } from 'lucide-react';
import { sound } from '../utils/audio';

interface HeaderProps {
  connectedCount: number;
  totalTiles: number;
  correctTilesCount: number;
  moveCount: number;
  deadEndsCount: number;
  showHints: boolean;
  onToggleHints: () => void;
  onResetGame: () => void;
  onOpenHelp: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  connectedCount,
  totalTiles,
  correctTilesCount,
  moveCount,
  deadEndsCount,
  showHints,
  onToggleHints,
  onResetGame,
  onOpenHelp,
  soundEnabled,
  onToggleSound,
}) => {
  const percent = Math.round((connectedCount / totalTiles) * 100);

  return (
    <header
      id="game-header-bar"
      className="w-full bg-stone-900/90 border-b border-amber-800/40 px-3 py-2 sm:px-5 sm:py-2.5 backdrop-blur-md flex flex-wrap items-center justify-between gap-2 text-stone-100 shrink-0 select-none"
    >
      {/* 遊戲名稱與村長標誌 */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-lg shrink-0">
          👴
        </div>
        <div>
          <h1 className="text-sm sm:text-base font-bold text-amber-200 leading-tight">
            中興新村路網拼圖
          </h1>
        </div>
      </div>

      {/* 數據資訊 (接通進度、步數、提示鎖定數量) */}
      <div className="flex items-center gap-2 text-xs sm:text-sm">
        {/* 連通率膠囊 */}
        <div
          className="flex items-center gap-1.5 bg-stone-800/80 px-2.5 py-1 rounded-full border border-stone-700"
          title="當前與起點連通之街道圖塊比例"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-stone-300 text-[11px] sm:text-xs">路網:</span>
          <span className="font-bold text-emerald-300">{connectedCount}/{totalTiles}</span>
          <span className="text-[10px] text-stone-400">({percent}%)</span>
        </div>

        {/* 步數 */}
        <div className="bg-stone-800/80 px-2.5 py-1 rounded-full border border-stone-700 text-[11px] sm:text-xs">
          <span className="text-stone-400">步數: </span>
          <span className="font-bold text-amber-300">{moveCount}</span>
        </div>

        {/* 若開啟提示，顯示已鎖定正確方向的圖塊數量 */}
        {showHints && (
          <div
            className="bg-emerald-950/80 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-600/50 text-[11px] flex items-center gap-1 animate-pulse"
            title="已鎖定並標示之正確方向圖塊"
          >
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>已鎖定: <strong>{correctTilesCount}/{totalTiles}</strong></span>
          </div>
        )}
      </div>

      {/* 控制按鈕群 */}
      <div className="flex items-center gap-1.5">
        {/* 提示切換 */}
        <button
          onClick={onToggleHints}
          className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg border text-xs flex items-center gap-1 transition ${
            showHints
              ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500 shadow-sm shadow-emerald-900/40'
              : 'bg-stone-800 text-stone-300 border-stone-700 hover:text-white'
          }`}
          title={showHints ? '關閉提示模式' : '開啟提示：鎖定並標示所有已轉到正確方向的圖塊'}
          id="toggle-hint-btn"
        >
          <Lightbulb className={`w-3.5 h-3.5 ${showHints ? 'text-yellow-400' : ''}`} />
          <span className="hidden md:inline">{showHints ? '提示中' : '提示'}</span>
        </button>

        {/* 音效開關 */}
        <button
          onClick={onToggleSound}
          className="p-1.5 sm:px-2.5 sm:py-1 bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-lg text-stone-300 hover:text-white text-xs flex items-center gap-1 transition"
          title={soundEnabled ? '靜音' : '開啟音效'}
          id="toggle-sound-btn"
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-stone-500" />}
        </button>

        {/* 重置打亂 */}
        <button
          onClick={onResetGame}
          className="p-1.5 sm:px-2.5 sm:py-1 bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-lg text-stone-300 hover:text-white text-xs flex items-center gap-1 transition"
          title="重新打亂地圖"
          id="reset-game-btn"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden md:inline">重置</span>
        </button>

        {/* 遊戲規則 */}
        <button
          onClick={onOpenHelp}
          className="p-1.5 sm:px-2.5 sm:py-1 bg-amber-800/40 hover:bg-amber-700/50 border border-amber-600/40 rounded-lg text-amber-200 text-xs flex items-center gap-1 transition"
          title="查看遊戲規則"
          id="open-help-btn"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">說明</span>
        </button>
      </div>
    </header>
  );
};
