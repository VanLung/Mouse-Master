import React from 'react';
import { Bot, Volume2 } from 'lucide-react';

interface GeminiGuideProps {
  message?: string;
}

const GeminiGuide: React.FC<GeminiGuideProps> = ({ message }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-end gap-3 pointer-events-none">
      {message && (
        <div className="bg-white p-4 rounded-2xl rounded-br-none shadow-xl border border-gray-100 mb-4 max-w-xs animate-bounce-slight">
          <p className="text-gray-700 font-medium text-lg leading-snug">{message}</p>
        </div>
      )}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-full shadow-lg flex items-center justify-center text-white relative">
        <Bot size={40} />
        <div className="absolute -top-1 -right-1 bg-green-400 w-4 h-4 rounded-full border-2 border-white animate-pulse"></div>
      </div>
    </div>
  );
};

export default GeminiGuide;
