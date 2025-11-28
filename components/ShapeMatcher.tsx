
import React, { useState, useEffect, useRef } from 'react';
import { DragItem, GameStats } from '../types';
import { speakText } from '../services/geminiService';
import { playSound } from '../services/audioService';
import { Star, Square, Triangle, Circle, Heart, Diamond, ArrowLeft } from 'lucide-react';

interface ShapeMatcherProps {
  onFinish: (stats: Partial<GameStats>) => void;
  onBack: () => void;
}

const ALL_SHAPES = [
  { type: 'circle' as const, color: 'text-red-500', bg: 'bg-red-100', border: 'border-red-300', icon: Circle },
  { type: 'square' as const, color: 'text-blue-500', bg: 'bg-blue-100', border: 'border-blue-300', icon: Square },
  { type: 'triangle' as const, color: 'text-green-500', bg: 'bg-green-100', border: 'border-green-300', icon: Triangle },
  { type: 'star' as const, color: 'text-yellow-500', bg: 'bg-yellow-100', border: 'border-yellow-300', icon: Star },
  { type: 'heart' as const, color: 'text-pink-500', bg: 'bg-pink-100', border: 'border-pink-300', icon: Heart },
  { type: 'diamond' as const, color: 'text-purple-500', bg: 'bg-purple-100', border: 'border-purple-300', icon: Diamond },
];

const ShapeMatcher: React.FC<ShapeMatcherProps> = ({ onFinish, onBack }) => {
  const [items, setItems] = useState<DragItem[]>([]);
  const [targets, setTargets] = useState<DragItem[]>([]);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [matches, setMatches] = useState(0);
  const [level, setLevel] = useState(1);
  const [pointerPos, setPointerPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    speakText("Help the shapes find their homes!");
    setupLevel(1);
  }, []);

  const setupLevel = (lvl: number) => {
    // Increase difficulty: Level 1 = 3 shapes, Level 2 = 4 shapes, Level 3+ = 5 shapes
    const count = Math.min(3 + Math.floor((lvl - 1) / 2), 5);
    
    // Pick random unique shapes
    const shuffledShapes = [...ALL_SHAPES].sort(() => Math.random() - 0.5).slice(0, count);

    const newItems: DragItem[] = shuffledShapes.map((shape, i) => ({
      id: `item-${shape.type}-${lvl}`,
      type: shape.type,
      color: shape.color,
      x: 0, y: 0, // Position handled by flex layout now for simplicity
      isMatched: false
    }));

    const newTargets: DragItem[] = shuffledShapes.map((shape, i) => ({
      id: `target-${shape.type}-${lvl}`,
      type: shape.type,
      color: shape.bg,
      x: 0, y: 0,
      isMatched: false
    }));

    setItems(newItems.sort(() => Math.random() - 0.5));
    setTargets(newTargets);
  };

  const handlePointerDown = (e: React.PointerEvent, id: string) => {
    const item = items.find(i => i.id === id);
    if (!item || item.isMatched) return;

    playSound('slide');
    setDraggedId(id);
    setPointerPos({ x: e.clientX, y: e.clientY });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggedId) return;
    setPointerPos({ x: e.clientX, y: e.clientY });
  };

  const handlePointerUp = (e: React.PointerEvent, id: string) => {
    if (!draggedId) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    
    const droppedItem = items.find(i => i.id === id);
    if (!droppedItem) {
        setDraggedId(null);
        return;
    }

    const validTarget = targets.find(t => {
       const targetEl = document.getElementById(t.id);
       if (!targetEl) return false;
       const rect = targetEl.getBoundingClientRect();
       return (
           e.clientX >= rect.left && e.clientX <= rect.right &&
           e.clientY >= rect.top && e.clientY <= rect.bottom &&
           t.type === droppedItem.type
       );
    });

    if (validTarget) {
        playSound('success');
        const newItems = items.map(item => item.id === id ? { ...item, isMatched: true } : item);
        setItems(newItems);
        setMatches(m => m + 1);
        
        // Check if level complete
        if (newItems.every(i => i.isMatched)) {
            speakText("Yay! You did it!");
            setTimeout(() => {
                const nextLevel = level + 1;
                setLevel(nextLevel);
                setupLevel(nextLevel);
            }, 1500);
        }
    } else {
        // Snap back
    }
    setDraggedId(null);
  };

  return (
    <div 
        ref={containerRef}
        className="w-full h-screen relative bg-indigo-50 flex flex-col items-center justify-between p-4 touch-none overflow-hidden"
    >
      <div className="w-full flex justify-between items-center mb-4">
          <button onClick={onBack} className="bg-white p-3 rounded-full shadow hover:bg-gray-100">
             <ArrowLeft />
          </button>
          <div className="bg-white px-6 py-2 rounded-full shadow font-bold text-indigo-600 text-xl">
             Level {level}
          </div>
          <div className="w-10"></div>
      </div>
      
      {/* Targets (Homes) */}
      <div className="flex flex-wrap gap-4 md:gap-8 justify-center w-full max-w-4xl p-4 bg-white/50 rounded-3xl shadow-sm">
        {targets.map((target) => {
           const shapeDef = ALL_SHAPES.find(s => s.type === target.type)!;
           const ShapeIcon = shapeDef.icon;
           const isMatched = items.find(i => i.type === target.type && i.isMatched);
           
           return (
            <div
                key={target.id}
                id={target.id}
                className={`w-24 h-24 md:w-32 md:h-32 rounded-2xl border-4 border-dashed flex items-center justify-center transition-all duration-500
                    ${isMatched ? 'border-green-500 bg-green-100 scale-105 shadow-[0_0_20px_rgba(34,197,94,0.5)]' : `${shapeDef.border} ${shapeDef.bg} opacity-70`}`}
            >
                {isMatched ? (
                    <ShapeIcon size={60} className="text-green-600 animate-bounce-slight" />
                ) : (
                    <ShapeIcon size={48} className="text-gray-400 opacity-40" />
                )}
            </div>
           );
        })}
      </div>

      {/* Draggable Items */}
      <div className="flex flex-wrap gap-6 justify-center w-full h-48 items-center">
        {items.map((item) => {
            if (item.isMatched) return null; // Remove from bottom row if matched
            
            const isDragging = draggedId === item.id;
            const shapeDef = ALL_SHAPES.find(s => s.type === item.type)!;
            const ShapeIcon = shapeDef.icon;

            const style: React.CSSProperties = isDragging ? {
                position: 'fixed',
                left: pointerPos.x,
                top: pointerPos.y,
                transform: 'translate(-50%, -50%) scale(1.2)',
                zIndex: 1000,
                pointerEvents: 'none'
            } : {};

            return (
                <div
                    key={item.id}
                    onPointerDown={(e) => handlePointerDown(e, item.id)}
                    onPointerMove={handlePointerMove}
                    onPointerUp={(e) => handlePointerUp(e, item.id)}
                    className={`w-24 h-24 cursor-grab active:cursor-grabbing flex items-center justify-center bg-white rounded-2xl shadow-[0_8px_0_rgb(0,0,0,0.1)] border-2 border-gray-100 transition-all hover:-translate-y-1 hover:shadow-xl`}
                    style={isDragging ? {opacity: 0} : undefined}
                >
                     <div style={style}>
                         <div className={`w-24 h-24 flex items-center justify-center bg-white rounded-2xl shadow-lg ${isDragging ? 'shadow-2xl ring-4 ring-yellow-400' : ''}`}>
                             <ShapeIcon size={56} className={shapeDef.color} />
                         </div>
                     </div>
                </div>
            );
        })}
      </div>
      
      {/* End Button */}
      <button 
        onClick={() => onFinish({ shapesMatched: matches })}
        className="mt-4 text-gray-400 hover:text-gray-600 font-medium text-sm underline"
      >
        I'm done playing
      </button>
    </div>
  );
};

export default ShapeMatcher;
