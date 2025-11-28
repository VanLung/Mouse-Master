
import React, { useState } from 'react';
import { GameType, GameStats } from './types';
import BubblePopper from './components/BubblePopper';
import ShapeMatcher from './components/ShapeMatcher';
import TracePath from './components/TracePath';
import ScoreBoard from './components/ScoreBoard';
import GeminiGuide from './components/GeminiGuide';
import { speakText } from './services/geminiService';
import { MousePointer2, Move, PenTool, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<GameType>(GameType.MENU);
  const [stats, setStats] = useState<GameStats>({
    bubblesPopped: 0,
    shapesMatched: 0,
    pathsCompleted: 0,
    accuracy: 100,
    playTimeSeconds: 0
  });

  const handleGameFinish = (newStats: Partial<GameStats>) => {
    setStats(prev => ({ ...prev, ...newStats }));
    setCurrentScreen(GameType.STATS);
    speakText("Wow! Look at your score!");
  };

  const handleStartGame = (type: GameType) => {
    // Reset specific stats for the session
    if (type === GameType.BUBBLE_POP) setStats(prev => ({ ...prev, bubblesPopped: 0 }));
    if (type === GameType.SHAPE_MATCH) setStats(prev => ({ ...prev, shapesMatched: 0 }));
    if (type === GameType.TRACE_PATH) setStats(prev => ({ ...prev, pathsCompleted: 0 }));
    
    setCurrentScreen(type);
  };

  const MenuScreen = () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fdf2f8] p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-10 right-10 w-32 h-32 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-32 h-32 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="text-center mb-10 z-10">
        <div className="inline-block relative">
            <h1 className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 mb-2 drop-shadow-sm">
                Mouse Master
            </h1>
            <Sparkles className="absolute -top-4 -right-8 text-yellow-400 w-12 h-12 animate-pulse" />
        </div>
        <p className="text-2xl text-gray-500 font-medium font-sans">Fun computer games for class!</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl z-10">
        
        {/* Card 1: Clicking */}
        <button
          onClick={() => handleStartGame(GameType.BUBBLE_POP)}
          className="group relative bg-white p-6 rounded-[2rem] shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-b-8 border-blue-200 hover:border-blue-300 active:border-b-0 active:translate-y-1"
        >
          <div className="absolute -top-4 -right-4 bg-blue-500 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
             <MousePointer2 size={24} />
          </div>
          <div className="flex flex-col items-center">
            <div className="w-full aspect-square bg-blue-50 rounded-2xl flex items-center justify-center mb-4 overflow-hidden group-hover:bg-blue-100 transition-colors">
               <div className="w-24 h-24 bg-gradient-to-tr from-blue-400 to-cyan-300 rounded-full shadow-lg group-hover:scale-110 transition-transform duration-500"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Bubble Pop</h2>
            <p className="text-gray-500">Practice Clicking</p>
          </div>
        </button>

        {/* Card 2: Dragging */}
        <button
          onClick={() => handleStartGame(GameType.SHAPE_MATCH)}
          className="group relative bg-white p-6 rounded-[2rem] shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-b-8 border-green-200 hover:border-green-300 active:border-b-0 active:translate-y-1"
        >
          <div className="absolute -top-4 -right-4 bg-green-500 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
             <Move size={24} />
          </div>
          <div className="flex flex-col items-center">
            <div className="w-full aspect-square bg-green-50 rounded-2xl flex items-center justify-center mb-4 overflow-hidden group-hover:bg-green-100 transition-colors">
               <div className="w-20 h-20 border-4 border-dashed border-green-500 rounded-xl group-hover:rotate-12 transition-transform duration-500"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Shape Match</h2>
            <p className="text-gray-500">Practice Dragging</p>
          </div>
        </button>

        {/* Card 3: Moving/Tracing */}
        <button
          onClick={() => handleStartGame(GameType.TRACE_PATH)}
          className="group relative bg-white p-6 rounded-[2rem] shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-b-8 border-pink-200 hover:border-pink-300 active:border-b-0 active:translate-y-1"
        >
          <div className="absolute -top-4 -right-4 bg-pink-500 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
             <PenTool size={24} />
          </div>
          <div className="flex flex-col items-center">
            <div className="w-full aspect-square bg-pink-50 rounded-2xl flex items-center justify-center mb-4 overflow-hidden group-hover:bg-pink-100 transition-colors">
               <svg className="w-24 h-24 text-pink-400 group-hover:scale-110 transition-transform duration-500" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round">
                  <path d="M 20 50 Q 50 20 80 50" className="group-hover:stroke-pink-600 transition-colors" />
               </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Trace Lines</h2>
            <p className="text-gray-500">Practice Moving</p>
          </div>
        </button>

      </div>
    </div>
  );

  return (
    <div className="min-h-screen font-sans text-gray-900 select-none">
      {currentScreen === GameType.MENU && <MenuScreen />}
      
      {currentScreen === GameType.BUBBLE_POP && (
        <BubblePopper onFinish={handleGameFinish} onBack={() => setCurrentScreen(GameType.MENU)} />
      )}
      
      {currentScreen === GameType.SHAPE_MATCH && (
        <ShapeMatcher onFinish={handleGameFinish} onBack={() => setCurrentScreen(GameType.MENU)} />
      )}

      {currentScreen === GameType.TRACE_PATH && (
        <TracePath onFinish={handleGameFinish} onBack={() => setCurrentScreen(GameType.MENU)} />
      )}
      
      {currentScreen === GameType.STATS && (
        <ScoreBoard 
            stats={stats} 
            onRestart={() => setCurrentScreen(GameType.MENU)} 
            onHome={() => setCurrentScreen(GameType.MENU)}
        />
      )}

      <GeminiGuide message={currentScreen === GameType.MENU ? "Hi! Pick a game to start!" : undefined} />
    </div>
  );
};

export default App;
