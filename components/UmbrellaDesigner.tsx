import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Palette, Share2, Sparkles, Eraser, Brush, MapPin, Calendar, Cloud, Download, X, RefreshCw, ZoomIn, ZoomOut, Maximize, Plus } from 'lucide-react';

// --- TYPES & CONSTANTS ---

interface ColorOption {
  id: string;
  hex: string;
  name: string;
}

interface PatternOption {
  id: string;
  name: string;
}

const PRESET_COLORS: ColorOption[] = [
  { id: 'classic-black', hex: '#1e293b', name: '经典黑' },
  { id: 'navy-blue', hex: '#1e40af', name: '深海蓝' },
  { id: 'emerald', hex: '#059669', name: '翡翠绿' },
  { id: 'amber', hex: '#d97706', name: '落日黄' },
  { id: 'rose', hex: '#be123c', name: '玫瑰红' },
  { id: 'purple', hex: '#7e22ce', name: '极光紫' },
  { id: 'white', hex: '#f1f5f9', name: '云朵白' },
];

const PATTERNS: PatternOption[] = [
  { id: 'none', name: '纯色' },
  { id: 'dots', name: '波点' },
  { id: 'stripes', name: '条纹' },
  { id: 'grid', name: '格纹' },
];

const BRUSH_COLORS = [
  '#ffffff', '#000000', '#f43f5e', '#fbbf24', '#34d399', '#3b82f6', '#a855f7'
];

// Better Eraser Cursor
const ERASER_CURSOR = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="white" stroke="black" stroke-width="2"><path d="M18 18H7L3.5 14.5C2.5 13.5 2.5 12 3.5 11L11 3.5L20 12.5L18 18Z" fill="%23f8fafc" stroke="%23334155" stroke-width="1.5"/><rect x="7" y="10" width="8" height="8" rx="1" fill="%23e2e8f0" opacity="0.5"/></svg>') 0 20, auto`;


// --- SUB-COMPONENTS ---

// A stable visual component to prevent re-renders from destroying the canvas state
const UmbrellaVisual: React.FC<{
  color: string;
  patternId: string;
  isDrawingMode: boolean;
  activeTool: 'brush' | 'eraser';
  brushColor: string;
  brushSize: number;
  zoom: number;
  drawingData: string | null;
  onSaveDrawing: (data: string) => void;
  isPosterMode?: boolean;
}> = ({ color, patternId, isDrawingMode, activeTool, brushColor, brushSize, zoom, drawingData, onSaveDrawing, isPosterMode = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Restore drawing data when canvas mounts or data changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && drawingData) {
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        // Always draw existing data with source-over
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(img, 0, 0);
        ctx.restore();
      };
      img.src = drawingData;
    }
  }, [drawingData]);

  // Initial setup for resolution
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
       // We keep internal resolution high (800x800) for quality, displayed at CSS size
       if (canvas.width !== 800) {
           canvas.width = 800;
           canvas.height = 800;
       }
    }
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    // Calculate position relative to the element
    const x = (clientX - rect.left);
    const y = (clientY - rect.top);

    // Map to internal canvas resolution (800x800)
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: x * scaleX,
      y: y * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawingMode) return;
    setIsDrawing(true);
    const coords = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
      
      // Configure tool
      if (activeTool === 'eraser') {
          ctx.globalCompositeOperation = 'destination-out';
          ctx.lineWidth = brushSize * 4; // Eraser slightly larger
      } else {
          ctx.globalCompositeOperation = 'source-over';
          ctx.strokeStyle = brushColor;
          ctx.lineWidth = brushSize * 2;
      }
      
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !isDrawingMode) return;
    e.preventDefault(); // Prevent scrolling on touch
    const coords = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) ctx.closePath();
      // Save state
      if (canvasRef.current) {
        onSaveDrawing(canvasRef.current.toDataURL());
      }
    }
  };

  return (
    <div 
      className={`relative transition-transform duration-200 ease-out origin-center select-none ${isPosterMode ? 'w-full h-full' : 'w-[400px] h-[400px]'}`}
      style={{ transform: isPosterMode ? 'none' : `scale(${zoom})` }}
    >
      <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
        <defs>
            {/* SVG Patterns Definitions */}
            <pattern id="pattern-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="white" fillOpacity="0.4" />
                <circle cx="12" cy="12" r="1.5" fill="white" fillOpacity="0.4" />
            </pattern>
            <pattern id="pattern-stripes" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <rect x="0" y="0" width="2" height="20" fill="white" fillOpacity="0.3" />
            </pattern>
            <pattern id="pattern-grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                 <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="1" strokeOpacity="0.3"/>
            </pattern>
            
            {/* Main Clipping Path for Canopy */}
            <clipPath id="canopyClip">
                <path d="M 10 100 Q 100 0 190 100 Q 145 90 100 100 Q 55 90 10 100 Z" />
            </clipPath>
        </defs>

        {/* Umbrella Shaft - Darkened for visibility */}
        <rect x="98" y="90" width="4" height="100" fill="#1e293b" />
        <path d="M 98 185 Q 98 200 85 200" fill="none" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />

        {/* Base Color */}
        <path d="M 10 100 Q 100 0 190 100 Q 145 90 100 100 Q 55 90 10 100 Z" fill={color} />
        
        {/* Pattern Overlay */}
        {patternId !== 'none' && (
            <path 
                d="M 10 100 Q 100 0 190 100 Q 145 90 100 100 Q 55 90 10 100 Z" 
                fill={`url(#pattern-${patternId})`} 
                className="pointer-events-none"
            />
        )}
        
        {/* Glossy Highlight */}
        <path d="M 10 100 Q 100 0 190 100 Q 145 90 100 100 Q 55 90 10 100 Z" fill="url(#highlight)" opacity="0.15" className="pointer-events-none"/>
        <linearGradient id="highlight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="0.9"/>
            <stop offset="100%" stopColor="white" stopOpacity="0"/>
        </linearGradient>
      </svg>
      
      {/* Interactive Drawing Canvas */}
      <div 
        className="absolute inset-0 w-full h-full z-10"
        style={{ 
             clipPath: 'path("M 5% 50% Q 50% 0% 95% 50% Q 72.5% 45% 50% 50% Q 27.5% 45% 5% 50% Z")',
             cursor: isDrawingMode ? (activeTool === 'eraser' ? ERASER_CURSOR : 'crosshair') : 'default'
        }}
      >
          <canvas 
            ref={canvasRef}
            className={`w-full h-full ${!isDrawingMode ? 'pointer-events-none' : ''}`}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
      </div>
    </div>
  );
};


// --- MAIN COMPONENT ---

const UmbrellaDesigner: React.FC = () => {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<'design' | 'paint' | 'share'>('design');
  
  // Design State
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[1].hex);
  const [selectedPattern, setSelectedPattern] = useState(PATTERNS[0]);
  const [customColors, setCustomColors] = useState<string[]>([]);

  // Paint State
  const [activeTool, setActiveTool] = useState<'brush' | 'eraser'>('brush');
  const [brushColor, setBrushColor] = useState('#ffffff');
  const [brushSize, setBrushSize] = useState(3);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [drawingData, setDrawingData] = useState<string | null>(null);

  // Poster State
  const [showPosterModal, setShowPosterModal] = useState(false);
  const [posterOptions, setPosterOptions] = useState({
    showTime: true,
    showLocation: true,
    showWeather: true
  });

  const handleAddCustomColor = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newColor = e.target.value;
      setSelectedColor(newColor);
      if (!customColors.includes(newColor) && !PRESET_COLORS.some(c => c.hex === newColor)) {
          setCustomColors(prev => [newColor, ...prev].slice(0, 5)); // Keep last 5
      }
  };

  const handleClearCanvas = () => {
      if (confirm('确定要清空所有涂鸦吗？')) {
          setDrawingData(null);
      }
  };

  return (
    <div className="h-full w-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in relative">
      
      {/* Header with Slogan */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold mb-2 border border-slate-200 shadow-sm">
             <Sparkles size={12} className="text-purple-600" />
             <span>雨天信号不好？等雨停无聊？来一起DIY专属雨伞吧</span>
           </div>
           <h2 className="text-2xl font-black text-slate-800">DIY 专属雨伞</h2>
        </div>
        
        {/* Step Indicator */}
        <div className="flex bg-white backdrop-blur rounded-xl p-1 gap-1 border border-slate-200 shadow-sm">
           {['design', 'paint', 'share'].map((t) => (
             <button
               key={t}
               onClick={() => setActiveTab(t as any)}
               className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all flex items-center gap-2 ${activeTab === t ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
             >
               {t === 'design' && <Palette size={14}/>}
               {t === 'paint' && <Brush size={14}/>}
               {t === 'share' && <Share2 size={14}/>}
               <span className="hidden md:inline">{t === 'design' ? '设计外观' : t === 'paint' ? '创意涂鸦' : '生成海报'}</span>
             </button>
           ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
        
        {/* LEFT: Canvas Area */}
        <div className="flex-1 glass-panel rounded-3xl relative flex flex-col items-center justify-center bg-slate-50/50 overflow-hidden group border border-white/60">
           {/* Background Grid */}
           <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
           
           {/* Zoom Controls */}
           <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-20">
              <button onClick={() => setZoomLevel(z => Math.min(z + 0.1, 2))} className="p-2 bg-white rounded-lg shadow-sm text-slate-800 hover:bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors"><ZoomIn size={18}/></button>
              <button onClick={() => setZoomLevel(1)} className="p-2 bg-white rounded-lg shadow-sm text-slate-800 hover:bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors"><Maximize size={18}/></button>
              <button onClick={() => setZoomLevel(z => Math.max(z - 0.1, 0.5))} className="p-2 bg-white rounded-lg shadow-sm text-slate-800 hover:bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors"><ZoomOut size={18}/></button>
           </div>

           {/* The Umbrella Visual */}
           <div className="relative z-10 p-10">
               <UmbrellaVisual 
                  color={selectedColor}
                  patternId={selectedPattern.id}
                  isDrawingMode={activeTab === 'paint'}
                  activeTool={activeTool}
                  brushColor={brushColor}
                  brushSize={brushSize}
                  zoom={zoomLevel}
                  drawingData={drawingData}
                  onSaveDrawing={setDrawingData}
               />
           </div>

           {/* Current Status Label */}
           <div className="absolute top-6 left-6 pointer-events-none">
               <h3 className="text-xl font-black text-slate-900/20 tracking-tight select-none">
                  {selectedPattern.name} <br/> 
                  <span className="text-4xl opacity-50">{PRESET_COLORS.find(c => c.hex === selectedColor)?.name || '自定义色'}</span>
               </h3>
           </div>
        </div>

        {/* RIGHT: Controls Panel */}
        <div className="w-full md:w-80 flex flex-col gap-4 animate-fade-in h-[40vh] md:h-auto overflow-y-auto scrollbar-hide">
           
           {/* TAB 1: DESIGN */}
           {activeTab === 'design' && (
             <>
               <div className="bg-white/80 p-5 rounded-2xl border border-white/60 shadow-sm">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-3 flex items-center gap-2">
                    <Palette size={14}/> 伞面底色
                  </span>
                  <div className="flex flex-wrap gap-3">
                     {/* Preset Colors */}
                     {PRESET_COLORS.map(c => (
                         <button 
                           key={c.id} 
                           onClick={() => setSelectedColor(c.hex)}
                           className={`w-9 h-9 rounded-full border-2 transition-transform hover:scale-110 shadow-sm ${selectedColor === c.hex ? 'border-slate-800 scale-110 ring-2 ring-slate-200' : 'border-slate-100'}`}
                           style={{ backgroundColor: c.hex }}
                           title={c.name}
                         />
                     ))}
                     
                     {/* Custom Colors History */}
                     {customColors.map((c, i) => (
                         <button 
                           key={i} 
                           onClick={() => setSelectedColor(c)}
                           className={`w-9 h-9 rounded-full border-2 transition-transform hover:scale-110 shadow-sm ${selectedColor === c ? 'border-slate-800 scale-110 ring-2 ring-slate-200' : 'border-slate-100'}`}
                           style={{ backgroundColor: c }}
                         />
                     ))}

                     {/* Color Picker Trigger */}
                     <label className="w-9 h-9 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-slate-500 hover:bg-slate-50 transition-colors">
                        <Plus size={16} className="text-slate-600"/>
                        <input type="color" className="opacity-0 w-0 h-0 absolute" onChange={handleAddCustomColor} />
                     </label>
                  </div>
               </div>

               <div className="bg-white/80 p-5 rounded-2xl border border-white/60 shadow-sm">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-3">纹理风格</span>
                  <div className="grid grid-cols-2 gap-2">
                     {PATTERNS.map(p => (
                         <button 
                           key={p.id} 
                           onClick={() => setSelectedPattern(p)}
                           className={`px-3 py-3 rounded-xl text-xs font-bold text-left border transition-all ${selectedPattern.id === p.id ? 'bg-slate-800 text-white border-slate-800 shadow-lg shadow-slate-200' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:text-slate-900'}`}
                         >
                           {p.name}
                         </button>
                     ))}
                  </div>
               </div>
               
               <button onClick={() => setActiveTab('paint')} className="mt-auto py-3.5 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-slate-200 hover:scale-[1.02] transition-transform">
                  下一步：去涂鸦 <Brush size={16}/>
               </button>
             </>
           )}

           {/* TAB 2: PAINT */}
           {activeTab === 'paint' && (
             <>
               <div className="bg-white/80 p-5 rounded-2xl border border-white/60 shadow-sm">
                   <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-3">工具选择</span>
                   <div className="flex gap-2">
                       <button 
                          onClick={() => setActiveTool('brush')}
                          className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 text-sm font-bold border ${activeTool === 'brush' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
                       >
                          <Brush size={16}/> 画笔
                       </button>
                       <button 
                          onClick={() => setActiveTool('eraser')}
                          className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 text-sm font-bold border ${activeTool === 'eraser' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
                       >
                          <Eraser size={16}/> 橡皮擦
                       </button>
                   </div>
               </div>

               {activeTool === 'brush' && (
                <div className="bg-white/80 p-5 rounded-2xl border border-white/60 shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                            颜色
                        </span>
                        <label className="text-xs text-blue-700 font-bold cursor-pointer hover:underline flex items-center gap-1">
                            <Plus size={10} /> 自定义
                            <input type="color" className="opacity-0 w-0 h-0 absolute" onChange={(e) => setBrushColor(e.target.value)} />
                        </label>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {BRUSH_COLORS.map(c => (
                            <button 
                            key={c} 
                            onClick={() => setBrushColor(c)}
                            className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${brushColor === c ? 'border-slate-800 scale-110 ring-2 ring-slate-200' : 'border-slate-200'}`}
                            style={{ backgroundColor: c }}
                            />
                        ))}
                        {!BRUSH_COLORS.includes(brushColor) && (
                            <div className="w-8 h-8 rounded-full border-2 border-slate-800 ring-2 ring-slate-200" style={{backgroundColor: brushColor}}></div>
                        )}
                    </div>
                </div>
               )}

               <div className="bg-white/80 p-5 rounded-2xl border border-white/60 shadow-sm">
                   <div className="flex justify-between mb-2">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">{activeTool === 'brush' ? '笔触粗细' : '橡皮大小'}</span>
                      <span className="text-xs font-bold text-slate-900">{brushSize}px</span>
                   </div>
                   <input 
                      type="range" 
                      min="1" max="20" 
                      value={brushSize} 
                      onChange={(e) => setBrushSize(parseInt(e.target.value))}
                      className="w-full accent-slate-800 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                   />
               </div>

               <button 
                  onClick={handleClearCanvas}
                  className="py-3 px-4 bg-white border border-slate-200 text-red-500 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-50 hover:border-red-200 transition-colors"
               >
                  <RefreshCw size={16}/> 清空画布
               </button>

               <button onClick={() => setActiveTab('share')} className="mt-auto py-3.5 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-slate-200 hover:scale-[1.02] transition-transform">
                  完成：生成海报 <Share2 size={16}/>
               </button>
             </>
           )}

           {/* TAB 3: SHARE */}
           {activeTab === 'share' && (
             <>
               <div className="bg-white/80 p-5 rounded-2xl border border-white/60 shadow-sm space-y-4">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">海报元素</span>
                  
                  <label className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-blue-300 transition-colors">
                     <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${posterOptions.showTime ? 'bg-blue-500 border-blue-500' : 'border-slate-300'}`}>
                        {posterOptions.showTime && <div className="w-2 h-2 bg-white rounded-full" />}
                     </div>
                     <input type="checkbox" className="hidden" checked={posterOptions.showTime} onChange={() => setPosterOptions(p => ({...p, showTime: !p.showTime}))} />
                     <Calendar size={16} className="text-slate-500"/>
                     <span className="text-sm font-bold text-slate-700">当前时间</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-emerald-300 transition-colors">
                     <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${posterOptions.showLocation ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`}>
                        {posterOptions.showLocation && <div className="w-2 h-2 bg-white rounded-full" />}
                     </div>
                     <input type="checkbox" className="hidden" checked={posterOptions.showLocation} onChange={() => setPosterOptions(p => ({...p, showLocation: !p.showLocation}))} />
                     <MapPin size={16} className="text-slate-500"/>
                     <span className="text-sm font-bold text-slate-700">地点打卡</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-amber-300 transition-colors">
                     <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${posterOptions.showWeather ? 'bg-amber-500 border-amber-500' : 'border-slate-300'}`}>
                        {posterOptions.showWeather && <div className="w-2 h-2 bg-white rounded-full" />}
                     </div>
                     <input type="checkbox" className="hidden" checked={posterOptions.showWeather} onChange={() => setPosterOptions(p => ({...p, showWeather: !p.showWeather}))} />
                     <Cloud size={16} className="text-slate-500"/>
                     <span className="text-sm font-bold text-slate-700">实时天气</span>
                  </label>
               </div>

               <button 
                  onClick={() => setShowPosterModal(true)}
                  className="mt-auto py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-200 hover:scale-[1.02] transition-transform"
               >
                  <Sparkles size={18} className="animate-pulse"/> 生成高清海报
               </button>
             </>
           )}

        </div>
      </div>

      {/* Poster Modal */}
      {showPosterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
           <div className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-sm w-full relative">
              <button 
                onClick={() => setShowPosterModal(false)}
                className="absolute top-4 right-4 z-20 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white backdrop-blur-md transition-colors"
              >
                <X size={20} />
              </button>

              {/* The Poster Content */}
              <div className="relative h-[550px] flex flex-col bg-slate-800">
                 {/* Background */}
                 <div className="absolute inset-0">
                    <img 
                      src="https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=800&q=80" 
                      className="w-full h-full object-cover opacity-50" 
                      alt="rainy background"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
                 </div>
                 
                 {/* Umbrella Container - Scaled Up for Poster (Scale 115) */}
                 <div className="relative z-10 flex-1 flex items-center justify-center pt-8">
                     <div className="relative scale-115 drop-shadow-2xl filter brightness-110">
                         <UmbrellaVisual 
                            color={selectedColor}
                            patternId={selectedPattern.id}
                            isDrawingMode={false} // Read-only
                            activeTool="brush"
                            brushColor={brushColor}
                            brushSize={brushSize}
                            zoom={1}
                            drawingData={drawingData}
                            onSaveDrawing={() => {}}
                            isPosterMode={true}
                         />
                     </div>
                 </div>

                 {/* Info Text */}
                 <div className="relative z-10 p-8 pt-4 text-white space-y-4">
                     <div className="space-y-1">
                        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest">
                           <Sparkles size={12}/>
                           RainGuard Design
                        </div>
                        <h2 className="text-2xl font-bold leading-tight font-serif italic">
                           "下雨天，<br/>也不要淋湿心情。"
                        </h2>
                     </div>

                     <div className="space-y-2 pt-4 border-t border-white/10">
                        {posterOptions.showTime && (
                           <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                              <Calendar size={14} className="text-white"/>
                              <span>5月20日 14:30</span>
                           </div>
                        )}
                        {posterOptions.showLocation && (
                           <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                              <MapPin size={14} className="text-white" />
                              <span>我在 <b>市中心商业区</b></span>
                           </div>
                        )}
                        {posterOptions.showWeather && (
                           <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                              <Cloud size={14} className="text-white" />
                              <span>大雨 18°C · 湿度 92%</span>
                           </div>
                        )}
                     </div>
                 </div>
              </div>

              {/* Actions */}
              <div className="p-4 bg-slate-50 flex gap-3">
                 <button className="flex-1 py-3 bg-slate-900 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                    <Download size={18} /> 保存到相册
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default UmbrellaDesigner;