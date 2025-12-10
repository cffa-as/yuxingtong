import React, { useState } from 'react';
import { ShieldCheck, Warehouse, Umbrella, Car, AlertOctagon, Navigation } from 'lucide-react';
import { RouteOption, Poi } from '../types';

interface MapVisualizerProps {
  activeRoute: RouteOption | null;
  onSelectRoute: (route: RouteOption) => void;
  filters: {
    showShelters: boolean;
    showParking: boolean;
    showUmbrellas: boolean;
    showPickups: boolean;
  };
}

const MOCK_POIS: Poi[] = [
  { id: 'p1', type: 'shelter', name: '万达广场连廊', distance: '100m', status: '开放中', lat: 30, lng: 40 },
  { id: 'p2', type: 'parking', name: '中心大厦地下库', distance: '250m', status: '剩余12位', lat: 60, lng: 70 },
  { id: 'p3', type: 'umbrella', name: '地铁口C出口', distance: '50m', status: '可借5把', lat: 20, lng: 80 },
  { id: 'p4', type: 'pickup', name: '凯悦酒店有顶落客区', distance: '150m', status: '干燥', lat: 45, lng: 25 },
  { id: 'p5', type: 'flood_risk', name: '积水路段', distance: '500m', status: '深30cm', lat: 70, lng: 50 },
];

const MapVisualizer: React.FC<MapVisualizerProps> = ({ activeRoute, onSelectRoute, filters }) => {
  const [userPos] = useState({ x: 20, y: 80 });
  const [destPos] = useState({ x: 80, y: 20 });

  return (
    <div className="relative w-full h-full bg-slate-50/50 rounded-3xl overflow-hidden border border-white/60 shadow-inner group">
      {/* Background Map Grid - Light Theme */}
      <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          backgroundColor: '#f8fafc'
      }}></div>

      {/* Stylized River/Road decorations */}
      <div className="absolute top-0 right-0 w-2/3 h-full bg-blue-50/40 -skew-x-12 blur-2xl"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-full bg-indigo-50/40 skew-x-12 blur-2xl"></div>

      {/* SVG Layer */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
           <pattern id="rainPattern" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="6" stroke="#3b82f6" strokeWidth="1.5" strokeOpacity="0.2" />
           </pattern>
           <filter id="dropshadow" height="130%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
              <feOffset dx="2" dy="2" result="offsetblur"/>
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.2"/>
              </feComponentTransfer>
              <feMerge> 
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/> 
              </feMerge>
            </filter>
        </defs>

        {/* Rain Cloud Zones */}
        <circle cx="50%" cy="40%" r="120" fill="url(#rainPattern)" className="animate-pulse opacity-60" />
        <circle cx="85%" cy="85%" r="90" fill="url(#rainPattern)" className="opacity-60" />

        {/* Routes */}
        {/* Route 1: Direct (Wet) */}
        <path
          d={`M ${userPos.x}% ${userPos.y}% Q 50% 50% ${destPos.x}% ${destPos.y}%`}
          fill="none"
          stroke={activeRoute?.id === 'fastest' ? '#f43f5e' : '#cbd5e1'}
          strokeWidth={activeRoute?.id === 'fastest' ? "5" : "3"}
          strokeDasharray="8,8"
          strokeLinecap="round"
          className="transition-all duration-500 ease-in-out"
          filter="url(#dropshadow)"
        />

        {/* Route 2: Safe (Least Rain) */}
        <path
          d={`M ${userPos.x}% ${userPos.y}% Q 20% 40% 40% 30% T ${destPos.x}% ${destPos.y}%`}
          fill="none"
          stroke={activeRoute?.id === 'least_rain' ? '#10b981' : '#cbd5e1'}
          strokeWidth={activeRoute?.id === 'least_rain' ? "6" : "4"}
          strokeLinecap="round"
          className="transition-all duration-500 ease-in-out"
          filter="url(#dropshadow)"
        />

        {/* User & Destination */}
        <circle cx={`${userPos.x}%`} cy={`${userPos.y}%`} r="8" fill="#3b82f6" stroke="white" strokeWidth="3" filter="url(#dropshadow)" />
        <circle cx={`${destPos.x}%`} cy={`${destPos.y}%`} r="8" fill="#f43f5e" stroke="white" strokeWidth="3" filter="url(#dropshadow)" />
      </svg>

      {/* Interactive Elements Overlay */}
      <div className="absolute inset-0 pointer-events-auto">
        {/* POI Markers */}
        {MOCK_POIS.map(poi => {
            if (poi.type === 'shelter' && !filters.showShelters) return null;
            if (poi.type === 'parking' && !filters.showParking) return null;
            if (poi.type === 'umbrella' && !filters.showUmbrellas) return null;
            if (poi.type === 'pickup' && !filters.showPickups) return null;

            return (
                <div
                    key={poi.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-lg border border-slate-100 cursor-pointer hover:scale-110 transition-transform group/poi z-20"
                    style={{ left: `${poi.lat}%`, top: `${poi.lng}%` }}
                >
                   {/* Tooltip */}
                   <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover/poi:opacity-100 transition-opacity pointer-events-none z-30">
                     <p className="font-bold">{poi.name}</p>
                     <p className="text-slate-300 text-[10px]">{poi.status}</p>
                     <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-slate-800"></div>
                   </div>

                    {poi.type === 'shelter' && <Warehouse className="w-4 h-4 text-emerald-500" />}
                    {poi.type === 'parking' && <ShieldCheck className="w-4 h-4 text-blue-500" />}
                    {poi.type === 'umbrella' && <Umbrella className="w-4 h-4 text-amber-500" />}
                    {poi.type === 'pickup' && <Car className="w-4 h-4 text-purple-500" />}
                    {poi.type === 'flood_risk' && <AlertOctagon className="w-4 h-4 text-red-500 animate-bounce" />}
                </div>
            )
        })}

        {/* Route Selection Buttons */}
        <button
            onClick={() => onSelectRoute({ id: 'fastest', name: '最快路线 (淋雨)', duration: 15, rainExposure: 15, isSheltered: false, safetyScore: 45, type: 'fastest', tags: ['涉水风险'] })}
            className={`absolute top-[45%] left-[45%] glass-panel px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${activeRoute?.id === 'fastest' ? 'border-red-400 text-red-600 scale-105 shadow-red-200 ring-1 ring-red-100' : 'border-white/50 text-slate-400 hover:text-slate-600'}`}
        >
            <div className="flex flex-col items-center">
              <span>15分钟 (高暴露)</span>
            </div>
        </button>

        <button
            onClick={() => onSelectRoute({ id: 'least_rain', name: '避雨路线 (推荐)', duration: 22, rainExposure: 2, isSheltered: true, safetyScore: 95, type: 'least_rain', tags: ['地下通道', '商场连廊'] })}
            className={`absolute top-[25%] left-[25%] glass-panel px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${activeRoute?.id === 'least_rain' ? 'border-emerald-400 text-emerald-600 scale-105 shadow-emerald-200 ring-1 ring-emerald-100' : 'border-white/50 text-slate-400 hover:text-slate-600'}`}
        >
             <div className="flex flex-col items-center">
              <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  干爽 22分钟
              </span>
             </div>
        </button>
      </div>
    </div>
  );
};

export default MapVisualizer;