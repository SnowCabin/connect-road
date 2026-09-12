import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, Compass, RotateCw, Lock, CircleDot, Lightbulb, Trophy } from 'lucide-react';

interface EmbedHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmbedHelpModal: React.FC<EmbedHelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        id="rules-help-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative max-w-lg w-full bg-stone-900 border-2 border-amber-600/60 rounded-2xl p-5 text-stone-100 shadow-2xl space-y-4 my-auto"
          id="rules-help-card"
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition"
            aria-label="關閉"
          >
            <X className="w-5 h-5" />
          </button>

          {/* 標題 */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-amber-200 leading-tight">
                中興新村路網拼圖・遊戲規則
              </h3>
              <p className="text-[11px] text-stone-400">接通花園城鎮路網，驅散迷霧召喚卦靈</p>
            </div>
          </div>

          {/* 規則詳細條列 */}
          <div className="space-y-2.5 text-xs sm:text-sm text-stone-200 bg-stone-950/70 p-4 rounded-xl border border-stone-800 leading-relaxed">
            <div className="flex items-start gap-2.5">
              <RotateCw className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-300">旋轉街道圖塊：</strong>
                <span>點擊任意地塊即可順時針旋轉 90 度，調整道路走向。</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-300">固定圖塊：</strong>
                <span>左上角白髮老爺爺圖塊為固定圖塊，不可旋轉。</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CircleDot className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-teal-300">特色囊底路：</strong>
                <span>中興新村經典規劃！僅單向連通，端點設有圓圈迴車道，端點處無需再對接其他道路。</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Lightbulb className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-yellow-300">提示功能：</strong>
                <span>點擊右上角<strong>「提示」</strong>，系統會自動<strong>鎖定並標示所有已轉到正確方向的圖塊</strong>，避免誤觸轉動，助您專注解謎。</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Trophy className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-emerald-300">通關與 Popworld 辨識：</strong>
                <span>當全村 24 格道路完全連通且<strong>無任何死路</strong>時，迷霧將全數驅散，並現身<strong>「地雷復」</strong>卦靈圖卡！開啟 Popworld 點「輸入答案」，將鏡頭對準圖卡辨識即可過關。</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 bg-amber-700 hover:bg-amber-600 text-stone-950 font-bold rounded-xl text-xs sm:text-sm transition shadow-md hover:shadow-amber-700/30"
          >
            我瞭解了，開始挑戰！
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
