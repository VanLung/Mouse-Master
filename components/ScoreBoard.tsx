
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { GameStats } from '../types';
import { RotateCcw, Home } from 'lucide-react';
import { playSound } from '../services/audioService';

interface ScoreBoardProps {
  stats: GameStats;
  onRestart: () => void;
  onHome: () => void;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ stats, onRestart, onHome }) => {
  React.useEffect(() => {
    playSound('success');
  }, []);

  const data = [
    { name: 'Bubbles', value: stats.bubblesPopped, color: '#3b82f6' },
    { name: 'Shapes', value: stats.shapesMatched, color: '#10b981' },
    { name: 'Lines', value: stats.pathsCompleted, color: '#ec4899' },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-8 animate-fade-in">
      <h1 className="text-4xl md:text-5xl font-black text-purple-600 mb-2 animate-bounce">Good Job!</h1>
      <p className="text-2xl text-gray-500 mb-8 font-medium">You are amazing!</p>

      <div className="w-full max-w-2xl h-80 bg-gray-50 rounded-3xl p-6 shadow-inner mb-8 border border-gray-100">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 16, fontWeight: 'bold'}} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
            <Tooltip 
                cursor={{fill: 'transparent'}}
                contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}}
            />
            <Bar dataKey="value" radius={[12, 12, 0, 0]} animationDuration={1000}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex gap-6">
        <button 
            onClick={onRestart}
            className="flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white text-xl font-bold py-4 px-10 rounded-full shadow-[0_4px_0_#15803d] active:shadow-none active:translate-y-1 transition-all"
        >
            <RotateCcw size={28} />
            Play Again
        </button>
        <button 
            onClick={onHome}
            className="flex items-center gap-3 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xl font-bold py-4 px-10 rounded-full shadow-[0_4px_0_#d1d5db] active:shadow-none active:translate-y-1 transition-all"
        >
            <Home size={28} />
            Menu
        </button>
      </div>
    </div>
  );
};

export default ScoreBoard;
