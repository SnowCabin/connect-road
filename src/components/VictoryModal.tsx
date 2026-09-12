import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Camera, RotateCcw, Download } from 'lucide-react';
import { GAME_CONFIG, getAssetUrl } from '../config';

interface VictoryModalProps {
  isOpen: boolean;
  moveCount: number;
  timeSpentSec: number;
  onPlayAgain: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  moveCount,
  timeSpentSec,
  onPlayAgain,
}) => {
  // 自動適配 GitHub Pages 子路徑，並依序嘗試載入候選圖檔
  const candidateUrls = [
    getAssetUrl('地雷復-01.png'),
    getAssetUrl(encodeURI('地雷復-01.png')),
    getAssetUrl('assets/dileifu.png'),
    getAssetUrl('assets/dileifu.svg'),
  ];

  const [currentUrlIndex, setCurrentUrlIndex] = useState<number>(0);

  if (!isOpen) return null;

  const currentImageUrl = candidateUrls[currentUrlIndex] || getAssetUrl(GAME_CONFIG.VICTORY_IMAGE_FALLBACK);

  const handleImageError = () => {
    if (currentUrlIndex < candidateUrls.length - 1) {
      setCurrentUrlIndex(prev => prev + 1);
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m > 0 ? `${m}分` : ''}${s}秒`;
  };

  return (
    <AnimatePresence>
      <div
        id="victory-modal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md overflow-y-auto"
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg my-auto bg-gradient-to-b from-amber-950 via-stone-900 to-amber-950 text-amber-50 rounded-2xl p-4 sm:p-6 shadow-2xl border-2 border-amber-500/50 flex flex-col items-center text-center"
          id="victory-modal-card"
        >
          {/* 金色光芒微光裝飾 */}
          <div className="absolute -top-6 bg-gradient-to-r from-amber-400 to-yellow-300 text-stone-950 font-bold px-4 py-1 rounded-full shadow-lg flex items-center gap-1.5 text-xs sm:text-sm tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-900 animate-spin" />
            <span>迷霧散去・路網貫通</span>
          </div>

          {/* 過關主標題 (指定文案) */}
          <h2
            id="victory-main-title"
            className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 mt-2 mb-2 tracking-wide"
          >
            {GAME_CONFIG.VICTORY_TITLE}
          </h2>

          {/* 成績數據 */}
          <div className="flex items-center gap-4 text-xs sm:text-sm text-amber-200/80 mb-3 bg-amber-900/30 px-3 py-1 rounded-lg border border-amber-500/20">
            <span>步數：<strong className="text-amber-300">{moveCount}</strong> 次</span>
            <span>耗時：<strong className="text-amber-300">{formatTime(timeSpentSec)}</strong></span>
          </div>

          {/* popworld 重要提示區塊 (指定文案) */}
          <div
            id="popworld-instruction-box"
            className="w-full bg-amber-500/15 border-2 border-amber-400/60 rounded-xl p-3 mb-4 text-left flex items-start gap-2.5 shadow-inner"
          >
            <div className="p-1.5 bg-amber-400 text-stone-950 rounded-lg shrink-0 mt-0.5">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-0.5">
                Popworld AR 辨識指引
              </div>
              <p className="text-xs sm:text-sm text-amber-100 font-medium leading-relaxed">
                {GAME_CONFIG.VICTORY_POPWORLD_HINT}
              </p>
            </div>
          </div>

          {/* 地雷復 卡片圖片展示區 (供相機對準辨識) */}
          <div
            id="dileifu-card-container"
            className="relative group bg-white rounded-xl p-2 sm:p-2.5 shadow-2xl border-4 border-amber-400/80 max-w-[280px] sm:max-w-[310px] w-full transition-transform hover:scale-[1.01]"
          >
            <img
              src={currentImageUrl}
              alt="地雷復 卦靈圖"
              onError={handleImageError}
              className="w-full h-auto object-contain rounded-lg shadow-sm select-none"
              id="dileifu-victory-image"
            />
            {/* 掃描對焦輔助框視覺 */}
            <div className="absolute inset-2 pointer-events-none border border-amber-500/30 rounded-lg flex flex-col justify-between p-2">
              <div className="flex justify-between">
                <span className="w-3 h-3 border-t-2 border-l-2 border-amber-500"></span>
                <span className="w-3 h-3 border-t-2 border-r-2 border-amber-500"></span>
              </div>
              <div className="flex justify-between">
                <span className="w-3 h-3 border-b-2 border-l-2 border-amber-500"></span>
                <span className="w-3 h-3 border-b-2 border-r-2 border-amber-500"></span>
              </div>
            </div>
          </div>

          {/* 操作按鈕群（已移除開發者設定按鈕，保護隱私） */}
          <div className="w-full flex items-center justify-center gap-3 mt-4">
            <button
              onClick={onPlayAgain}
              className="flex-1 py-2.5 px-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
              id="victory-play-again-btn"
            >
              <RotateCcw className="w-4 h-4" />
              <span>再玩一次</span>
            </button>

            <a
              href={currentImageUrl}
              download="地雷復-卦靈圖.png"
              target="_blank"
              rel="noreferrer"
              className="py-2.5 px-4 bg-stone-800 hover:bg-stone-700 text-amber-200 border border-amber-500/30 font-medium rounded-xl shadow transition-all active:scale-95 flex items-center justify-center gap-1.5 text-xs sm:text-sm"
              title="另存圖片"
              id="victory-download-btn"
            >
              <Download className="w-4 h-4" />
              <span>另存圖檔</span>
            </a>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
