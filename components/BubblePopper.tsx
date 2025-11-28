
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { GameStats } from '../types';
import { speakText } from '../services/geminiService';
import { playSound } from '../services/audioService';
import { ArrowLeft } from 'lucide-react';

interface BubblePopperProps {
  onFinish: (stats: Partial<GameStats>) => void;
  onBack: () => void;
}

interface BubbleNode extends d3.SimulationNodeDatum {
  r: number;
  color: string;
  id: number;
  type: 'normal' | 'golden';
  x?: number;
  y?: number;
}

const BubblePopper: React.FC<BubblePopperProps> = ({ onFinish, onBack }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45); // Increased time
  
  // Use refs for D3 mutable state to avoid closure staleness
  const simulationRef = useRef<d3.Simulation<BubbleNode, undefined> | null>(null);
  const nodesRef = useRef<BubbleNode[]>([]);
  const scoreRef = useRef(0);

  useEffect(() => {
    speakText("Pop the bubbles! Find the Golden bubbles for extra points!");
  }, []);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      playSound('success');
      onFinish({ bubblesPopped: scoreRef.current });
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onFinish]);

  // Game Logic
  useEffect(() => {
    if (!svgRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .style("background", "radial-gradient(circle, #e0f7fa 0%, #b2ebf2 100%)");

    // Define Gradients
    const defs = svg.append("defs");
    
    // Normal Bubble Gradient
    const bubbleGrad = defs.append("radialGradient")
      .attr("id", "bubbleGrad")
      .attr("cx", "30%")
      .attr("cy", "30%");
    bubbleGrad.append("stop").attr("offset", "0%").attr("stop-color", "rgba(255,255,255,0.8)");
    bubbleGrad.append("stop").attr("offset", "80%").attr("stop-color", "rgba(255,255,255,0.1)");
    bubbleGrad.append("stop").attr("offset", "100%").attr("stop-color", "rgba(255,255,255,0)");

    // Golden Bubble Gradient
    const goldGrad = defs.append("radialGradient")
        .attr("id", "goldGrad")
        .attr("cx", "30%")
        .attr("cy", "30%");
    goldGrad.append("stop").attr("offset", "0%").attr("stop-color", "#fff");
    goldGrad.append("stop").attr("offset", "50%").attr("stop-color", "#fbbf24");
    goldGrad.append("stop").attr("offset", "100%").attr("stop-color", "#d97706");

    const colors = ["#ef4444", "#3b82f6", "#22c55e", "#a855f7", "#ec4899"];

    // Initial Bubbles
    const spawnBubble = (forceType?: 'golden' | 'normal') => {
        const isGolden = forceType === 'golden' || Math.random() > 0.9;
        return {
            r: isGolden ? 50 : Math.random() * 25 + 35,
            x: Math.random() * width,
            y: height + 60, // Start below screen
            color: isGolden ? "url(#goldGrad)" : colors[Math.floor(Math.random() * colors.length)],
            id: Date.now() + Math.random(),
            type: isGolden ? 'golden' : 'normal'
        } as BubbleNode;
    };

    nodesRef.current = Array.from({ length: 12 }, () => spawnBubble());

    simulationRef.current = d3.forceSimulation<BubbleNode>(nodesRef.current)
      .force("x", d3.forceX(width / 2).strength(0.005)) // Very gentle centering
      .force("y", d3.forceY(height / 3).strength(0.05)) // Float up
      .force("collide", d3.forceCollide().radius((d) => d.r + 5).strength(0.5))
      .force("charge", d3.forceManyBody().strength(-10))
      .on("tick", ticked);

    function ticked() {
      const u = svg.selectAll<SVGGElement, BubbleNode>(".bubble-group")
        .data(nodesRef.current, (d) => d.id);

      // ENTER
      const enter = u.enter()
        .append("g")
        .attr("class", "bubble-group")
        .attr("cursor", "pointer")
        .call(d3.drag<SVGGElement, BubbleNode>() // Allow dragging a bit before pop for fun
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended)
        )
        .on("click", (event, d) => popBubble(d));

      // Main colored circle
      enter.append("circle")
        .attr("r", 0)
        .attr("fill", (d) => d.type === 'golden' ? "url(#goldGrad)" : d.color)
        .attr("opacity", 0.7)
        .transition().duration(800).ease(d3.easeElasticOut)
        .attr("r", (d) => d.r);

      // Shine effect (reflection)
      enter.append("circle")
        .attr("r", (d) => d.r)
        .attr("fill", "url(#bubbleGrad)");

      // Shine highlight dot
      enter.append("ellipse")
        .attr("cx", (d) => -d.r * 0.3)
        .attr("cy", (d) => -d.r * 0.3)
        .attr("rx", (d) => d.r * 0.2)
        .attr("ry", (d) => d.r * 0.1)
        .attr("transform", "rotate(-45)")
        .attr("fill", "white")
        .attr("opacity", 0.6);

      // UPDATE
      u.merge(enter as any)
        .attr("transform", (d) => `translate(${d.x},${d.y})`);

      // EXIT
      u.exit()
        .transition().duration(200)
        .attr("transform", (d: any) => `translate(${d.x},${d.y}) scale(0)`)
        .remove();
    }

    // Drag behavior (Physics interaction)
    function dragstarted(event: any, d: any) {
        if (!event.active) simulationRef.current?.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }
    function dragged(event: any, d: any) {
        d.fx = event.x;
        d.fy = event.y;
    }
    function dragended(event: any, d: any) {
        if (!event.active) simulationRef.current?.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    function popBubble(target: BubbleNode) {
        playSound('pop');
        
        // Remove from data
        nodesRef.current = nodesRef.current.filter(n => n.id !== target.id);
        
        // Update Score
        const points = target.type === 'golden' ? 5 : 1;
        setScore(prev => {
            const newScore = prev + points;
            scoreRef.current = newScore;
            return newScore;
        });

        // Add Floating Text Effect using D3
        const text = svg.append("text")
            .attr("x", target.x!)
            .attr("y", target.y!)
            .attr("text-anchor", "middle")
            .attr("font-size", "30px")
            .attr("font-weight", "bold")
            .attr("fill", target.type === 'golden' ? "#d97706" : "#1e40af")
            .text(`+${points}`);
        
        text.transition().duration(800)
            .attr("y", target.y! - 50)
            .style("opacity", 0)
            .remove();

        // Respawn logic: Always keep some bubbles on screen
        const toAdd = Math.random() > 0.7 ? 2 : 1;
        for(let i=0; i<toAdd; i++) {
             nodesRef.current.push(spawnBubble());
        }

        // Apply changes
        simulationRef.current?.nodes(nodesRef.current);
        simulationRef.current?.alpha(0.5).restart();
    }

    return () => {
        simulationRef.current?.stop();
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-blue-50">
      {/* HUD */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start pointer-events-none z-10">
        <div className="flex gap-4">
             <div className="bg-white/90 backdrop-blur border-b-4 border-blue-300 p-4 rounded-2xl shadow-lg">
                <span className="text-sm text-gray-500 font-bold block">SCORE</span>
                <span className="text-4xl font-black text-blue-600">{score}</span>
             </div>
        </div>
        
        <div className="bg-white/90 backdrop-blur border-b-4 border-yellow-300 p-4 rounded-2xl shadow-lg">
            <span className="text-sm text-gray-500 font-bold block">TIME</span>
            <span className={`text-4xl font-black ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-yellow-600'}`}>
                {timeLeft}
            </span>
        </div>
      </div>

      <button 
        onClick={onBack}
        className="absolute bottom-4 left-4 z-20 bg-white p-3 rounded-full shadow-lg border border-gray-200 hover:bg-gray-100 active:scale-95 transition"
      >
        <ArrowLeft className="text-gray-600" />
      </button>

      <svg ref={svgRef} className="block w-full h-full" />
    </div>
  );
};

export default BubblePopper;
