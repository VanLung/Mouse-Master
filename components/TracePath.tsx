
import React, { useRef, useState, useEffect } from 'react';
import { GameStats } from '../types';
import { speakText } from '../services/geminiService';
import { playSound } from '../services/audioService';
import { ArrowLeft, CheckCircle } from 'lucide-react';

interface TracePathProps {
  onFinish: (stats: Partial<GameStats>) => void;
  onBack: () => void;
}

const LEVELS = [
  // Horizontal Line
  { path: "M 100 300 L 700 300", name: "Straight Line" },
  // Diagonal
  { path: "M 100 500 L 700 100", name: "Up the Hill" },
  // Wave
  { path: "M 100 300 Q 250 100 400 300 T 700 300", name: "Wavy River" },
  // Loop
  { path: "M 150 400 C 150 100, 650 100, 650 400 S 150 700 150 400", name: "Big Loop" }
];

const TracePath: React.FC<TracePathProps> = ({ onFinish, onBack }) => {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isTracing, setIsTracing] = useState(false);
  const [completedPaths, setCompletedPaths] = useState(0);
  
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const cursorRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    speakText("Touch the blue dot and follow the line to the end!");
  }, []);

  useEffect(() => {
     setProgress(0);
     setIsTracing(false);
  }, [currentLevel]);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!svgRef.current || !pathRef.current) return;

    const svgRect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - svgRect.left;
    const y = e.clientY - svgRect.top;

    // Logic: Find closest point on path to mouse
    // This is computationally expensive to do perfectly, so we cheat.
    // We check if the mouse is close to the point at (current_progress + small_step)
    
    const pathLen = pathRef.current.getTotalLength();
    const currentPoint = pathRef.current.getPointAtLength(progress);
    
    // Check distance to current "head" of the trail
    const dist = Math.sqrt(Math.pow(x - currentPoint.x, 2) + Math.pow(y - currentPoint.y, 2));

    if (dist < 40) { // Tolerance radius
       if (!isTracing && progress === 0) {
           setIsTracing(true);
           playSound('slide');
       }
       
       if (isTracing) {
           // Try to advance progress
           const lookAhead = 10;
           const nextPoint = pathRef.current.getPointAtLength(Math.min(pathLen, progress + lookAhead));
           const distToNext = Math.sqrt(Math.pow(x - nextPoint.x, 2) + Math.pow(y - nextPoint.y, 2));
           
           if (distToNext < 40) {
               const newProg = Math.min(pathLen, progress + 5); // Speed limit
               setProgress(newProg);
               
               if (newProg >= pathLen - 5) {
                   handleLevelComplete();
               }
           }
       }
    } else if (isTracing) {
        // Lost the path?
        // Optional: Reset if too far. For kids, let's be forgiving, just stop progress.
    }
  };

  const handleLevelComplete = () => {
      setIsTracing(false);
      playSound('success');
      setCompletedPaths(prev => prev + 1);
      speakText("Perfect!");
      
      setTimeout(() => {
          if (currentLevel < LEVELS.length - 1) {
              setCurrentLevel(prev => prev + 1);
          } else {
              speakText("You are a tracing master!");
              onFinish({ pathsCompleted: completedPaths + 1 });
          }
      }, 1500);
  };

  const currentPathData = LEVELS[currentLevel].path;

  return (
    <div className="w-full h-screen bg-green-50 flex flex-col items-center justify-center relative touch-none">
       <div className="absolute top-4 left-4 z-10">
           <button onClick={onBack} className="bg-white p-3 rounded-full shadow-lg">
             <ArrowLeft />
           </button>
       </div>

       <h2 className="text-3xl font-bold text-green-700 mb-4 animate-bounce">
           {LEVELS[currentLevel].name}
       </h2>

       <div className="relative bg-white rounded-3xl shadow-xl p-4 border-4 border-green-200">
           <svg 
             ref={svgRef}
             width="800" 
             height="600" 
             className="cursor-crosshair bg-green-50/30 rounded-xl"
             onPointerMove={handlePointerMove}
             onPointerLeave={() => setIsTracing(false)}
            >
               {/* Background Track */}
               <path 
                 d={currentPathData} 
                 stroke="#e5e7eb" 
                 strokeWidth="40" 
                 strokeLinecap="round" 
                 fill="none" 
               />
               
               {/* Guide Line */}
               <path 
                 ref={pathRef}
                 d={currentPathData} 
                 stroke="#dcfce7" 
                 strokeWidth="10" 
                 strokeLinecap="round" 
                 strokeDasharray="20 20"
                 fill="none" 
               />

               {/* Progress Fill */}
               <path 
                 d={currentPathData} 
                 stroke="#22c55e" 
                 strokeWidth="30" 
                 strokeLinecap="round" 
                 fill="none" 
                 strokeDasharray={pathRef.current ? pathRef.current.getTotalLength() : 1000}
                 strokeDashoffset={pathRef.current ? pathRef.current.getTotalLength() - progress : 1000}
                 className="transition-all duration-75 ease-linear"
               />

               {/* The "Player" (Ladybug/Dot) */}
               {pathRef.current && (() => {
                   const p = pathRef.current.getPointAtLength(progress);
                   return (
                       <g transform={`translate(${p.x}, ${p.y})`}>
                           <circle r="25" fill="#ef4444" className="animate-pulse" />
                           <circle r="5" cx="-8" cy="-5" fill="black" />
                           <circle r="5" cx="8" cy="-5" fill="black" />
                           <path d="M -20 0 Q 0 20 20 0" stroke="black" fill="none" strokeWidth="2" />
                       </g>
                   );
               })()}

               {/* End Goal */}
               {pathRef.current && (() => {
                   const len = pathRef.current.getTotalLength();
                   const p = pathRef.current.getPointAtLength(len);
                   return (
                       <g transform={`translate(${p.x}, ${p.y})`}>
                           <CheckCircle size={48} className="text-green-600" />
                       </g>
                   );
               })()}

           </svg>
       </div>
       <p className="mt-6 text-gray-500 text-lg">Help the ladybug get to the finish!</p>
    </div>
  );
};

export default TracePath;
