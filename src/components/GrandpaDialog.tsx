import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, X } from 'lucide-react';

interface GrandpaDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GrandpaDialog: React.FC<GrandpaDialogProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        id="grandpa-dialog-overlay"
        className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 10 }}
          onClick={(e) => e.stopPropagation()}
          className="relative max-w-sm w-full bg-stone-900 border-2 border-amber-500/80 rounded-2xl p-4 shadow-2xl text-stone-100 flex flex-col gap-3"
          id="grandpa-dialog-card"
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-200 border-2 border-amber-500 flex items-center justify-center text-2xl shadow-inner shrink-0">
              👴
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-amber-300 text-sm sm:text-base">
                <span>中興新村・白髮老爺爺</span>
                <span className="inline-flex items-center gap-0.5 text-[10px] bg-amber-900/60 text-amber-200 px-1.5 py-0.5 rounded-full border border-amber-500/40">
                  <Lock className="w-2.5 h-2.5" /> 固定圖塊
                </span>
              </div>
              <div className="text-xs text-stone-400">村長引路導引</div>
            </div>
          </div>

          <div className="bg-stone-950/60 rounded-xl p-3 border border-stone-800 text-xs sm:text-sm text-stone-200 leading-relaxed">
            「歡迎來到美麗的中興新村！老夫這座<strong>圖塊是固定的</strong>，不可旋轉喔！請輕觸點擊其他各處街道圖塊進行轉動，將全村道路接通，包含特別的囊底路迴車道，確保<strong>沒有死路</strong>，就能驅散迷霧，召喚卦靈現身！」
          </div>

          <button
            onClick={onClose}
            className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs rounded-xl shadow transition"
          >
            我知道了，繼續拼圖！
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
