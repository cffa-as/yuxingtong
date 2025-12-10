import React, { useState, useEffect } from 'react';
import { Map, MessageSquare, Bell, CloudRain, Umbrella, Car, Navigation, AlertTriangle, ShieldCheck, Warehouse, Info, Menu, Activity, Droplets, Palette, Zap, CheckCircle2, Shirt, Sparkles, Plus, Trash2, CheckSquare, Square } from 'lucide-react';
import MapVisualizer from './components/MapVisualizer';
import ChatAssistant from './components/ChatAssistant';
import RainChart from './components/RainChart';
import UmbrellaDesigner from './components/UmbrellaDesigner';
import { AppTab, RouteOption, TravelChecklist, WeatherAlert } from './types';
import { generateTravelAdvice } from './services/geminiService';

interface CheckItem {
  id: string;
  text: string;
  checked: boolean;
  type: 'gear' | 'custom';
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.MAP);
  const [activeRoute, setActiveRoute] = useState<RouteOption | null>(null);
  const [checklistData, setChecklistData] = useState<TravelChecklist | null>(null);
  const [checkItems, setCheckItems] = useState<CheckItem[]>([]);
  const [newItemText, setNewItemText] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Map Layers / Features Toggles
  const [showShelters, setShowShelters] = useState(true); 
  const [showParking, setShowParking] = useState(false);
  const [showUmbrellas, setShowUmbrellas] = useState(false);
  const [showPickups, setShowPickups] = useState(false);

  // Simulated Weather Alerts
  const alerts: WeatherAlert[] = [
    { type: 'rain', severity: 'high', message: '未来15分钟市区有强降雨，建议暂避', location: '当前区域', timestamp: '刚刚' },
    { type: 'road_closure', severity: 'medium', message: '中山路低洼积水，已自动为您规避', location: '中山路', timestamp: '10分钟前' }
  ];

  useEffect(() => {
    const fetchAdvice = async () => {
      const advice = await generateTravelAdvice("暴雨, 18°C, 湿度90%", "市中心办公楼", "步行+地铁");
      setChecklistData(advice);
      // Initialize interactive list
      setCheckItems(advice.gear.map((item, idx) => ({
        id: `gear-${idx}`,
        text: item,
        checked: false,
        type: 'gear'
      })));
    };
    fetchAdvice();
  }, []);

  const handleRouteSelect = (route: RouteOption) => {
    setActiveRoute(route);
  };

  const toggleCheckItem = (id: string) => {
    setCheckItems(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const addCustomItem = () => {
    if (!newItemText.trim()) return;
    setCheckItems(prev => [...prev, {
      id: `custom-${Date.now()}`,
      text: newItemText,
      checked: false,
      type: 'custom'
    }]);
    setNewItemText('');
  };

  const removeCustomItem = (id: string) => {
    setCheckItems(prev => prev.filter(item => item.id !== id));
  };

  const completedCount = checkItems.filter(i => i.checked).length;
  const progress = checkItems.length > 0 ? (completedCount / checkItems.length) * 100 : 0;

  return (
    <div className="min-h-screen flex flex-col md:flex-row max-w-[1600px] mx-auto overflow-hidden md:p-6 gap-6 relative">
      
      {/* Mobile Header */}
      <header className="md:hidden p-4 glass-panel sticky top-0 z-50 flex items-center justify-between border-t-0 border-x-0 rounded-b-3xl">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-md">
             <CloudRain className="text-white w-6 h-6" />
           </div>
           <div>
              <h1 className="font-bold text-lg tracking-tight text-slate-900 leading-none">雨行通</h1>
              <p className="text-[10px] text-slate-500 font-medium">一站式雨天出行助手</p>
           </div>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 bg-white/50 rounded-lg">
             <Menu size={20} className="text-slate-600" />
        </button>
      </header>

      {/* Desktop Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-72 glass-panel rounded-3xl p-6 h-[calc(100vh-48px)] border border-white/60 shadow-xl shadow-slate-200/50">
        <div className="flex items-center gap-4 mb-12 px-2">
             {/* Logo Design */}
             <div className="relative group cursor-default">
                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl shadow-slate-300 transform group-hover:rotate-6 transition-transform duration-300">
                    <CloudRain className="text-white w-6 h-6" strokeWidth={2.5} />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-[3px] border-white flex items-center justify-center">
                    <Zap size={8} className="text-white fill-white" />
                </div>
             </div>
             <div>
                <h1 className="font-black text-2xl tracking-tighter text-slate-900 leading-none">雨行通</h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">RainGuard Pro</p>
             </div>
        </div>

        <nav className="space-y-3 flex-1">
            {[
              { id: AppTab.MAP, icon: Navigation, label: '避雨导航', color: 'text-blue-600' },
              { id: AppTab.STATUS, icon: Activity, label: '实时雨况', color: 'text-indigo-600' },
              { id: AppTab.CHAT, icon: MessageSquare, label: '行程助手', color: 'text-emerald-600' },
              { id: AppTab.ALERTS, icon: Bell, label: '备品清单', color: 'text-amber-600' },
              { id: AppTab.DIY, icon: Palette, label: '雨具 DIY', color: 'text-purple-600' }
            ].map((item) => (
              <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-bold text-sm text-left group ${activeTab === item.id ? 'bg-slate-900 text-white shadow-lg shadow-slate-300 scale-[1.02]' : 'text-slate-500 hover:bg-slate-100/80 hover:text-slate-900'}`}
              >
                  <item.icon size={20} className={`${activeTab === item.id ? 'text-white' : item.color} transition-colors`} strokeWidth={2.5} /> 
                  {item.label}
              </button>
            ))}
        </nav>

        <div className="mt-6">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center mb-2">
                     <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">当前定位</h4>
                     <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
                <div className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-1">
                    <Map size={14} className="text-slate-400"/> 市中心商业区
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-white px-2 py-1.5 rounded-lg border border-slate-100">
                   <Droplets size={12} className="text-blue-500" />
                   湿度 92%
                </div>
            </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-[calc(100vh-80px)] md:h-[calc(100vh-48px)] relative md:rounded-3xl overflow-hidden glass-panel border border-white/60 shadow-2xl shadow-slate-200/40">

        {/* --- MAP TAB --- */}
        {activeTab === AppTab.MAP && (
          <div className="h-full relative flex flex-col">
              <div className="absolute top-4 left-4 right-4 z-10 flex flex-col md:flex-row justify-between items-start pointer-events-none">
                 <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-white/50 pointer-events-auto mb-2 md:mb-0">
                    <span className="text-xs font-bold text-slate-600 flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                       智能路线规划中...
                    </span>
                 </div>
                 
                 {/* Floating Filter Controls */}
                 <div className="flex gap-2 pointer-events-auto overflow-x-auto max-w-full p-1 scrollbar-hide">
                      {[
                          { id: 'shelter', icon: Warehouse, label: '避雨点', state: showShelters, set: setShowShelters, activeClass: 'bg-emerald-600 text-white shadow-emerald-200' },
                          { id: 'parking', icon: ShieldCheck, label: '地库', state: showParking, set: setShowParking, activeClass: 'bg-blue-600 text-white shadow-blue-200' },
                          { id: 'umbrella', icon: Umbrella, label: '共享雨具', state: showUmbrellas, set: setShowUmbrellas, activeClass: 'bg-amber-500 text-white shadow-amber-200' },
                          { id: 'pickup', icon: Car, label: '无雨上车', state: showPickups, set: setShowPickups, activeClass: 'bg-purple-600 text-white shadow-purple-200' },
                      ].map((btn) => (
                          <button
                              key={btn.id}
                              onClick={() => btn.set(!btn.state)}
                              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all shadow-md border ${btn.state ? `${btn.activeClass} border-transparent` : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'}`}
                          >
                              <btn.icon size={14} />
                              {btn.label}
                          </button>
                      ))}
                 </div>
              </div>

              <div className="flex-1 w-full relative">
                 <MapVisualizer
                      activeRoute={activeRoute}
                      onSelectRoute={handleRouteSelect}
                      filters={{ showShelters, showParking, showUmbrellas, showPickups }}
                  />
              </div>

              {/* Route Details Slide-up Panel */}
              {activeRoute && (
                  <div className="absolute bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 animate-fade-in z-20">
                      <div className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/60">
                          <div className="flex justify-between items-start mb-4">
                              <div>
                                  <h3 className="font-bold text-slate-900 text-lg">{activeRoute.name}</h3>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                      {activeRoute.tags.map(tag => (
                                          <span key={tag} className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">
                                              {tag}
                                          </span>
                                      ))}
                                  </div>
                              </div>
                              <div className="text-right">
                                   <div className={`text-3xl font-black ${activeRoute.safetyScore > 80 ? 'text-emerald-500' : 'text-amber-500'}`}>{activeRoute.safetyScore}</div>
                                   <div className="text-[10px] text-slate-400 font-bold uppercase">安全分</div>
                              </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 mb-5">
                             <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                 <span className="text-xs text-slate-400 font-bold uppercase block mb-1">预计耗时</span>
                                 <span className="text-xl font-bold text-slate-800">{activeRoute.duration} <span className="text-xs font-medium text-slate-500">分钟</span></span>
                             </div>
                             <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                 <span className="text-xs text-slate-400 font-bold uppercase block mb-1">淋雨时间</span>
                                 <span className={`text-xl font-bold ${activeRoute.rainExposure < 5 ? 'text-emerald-600' : 'text-blue-600'}`}>{activeRoute.rainExposure} <span className="text-xs font-medium text-slate-500">分钟</span></span>
                             </div>
                          </div>

                          <button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2 text-sm">
                              <Navigation size={18} />
                              开始导航
                          </button>
                      </div>
                  </div>
              )}
          </div>
        )}

        {/* --- WEATHER STATUS TAB --- */}
        {activeTab === AppTab.STATUS && (
             <div className="flex-1 overflow-y-auto scrollbar-hide p-4 md:p-10 max-w-4xl mx-auto w-full">
                 <div className="mb-8">
                     <h2 className="text-2xl font-bold text-slate-800">实时雨况</h2>
                     <p className="text-slate-500 text-sm mt-1">基于雷达数据与官方预警</p>
                 </div>

                 <div className="space-y-6 animate-fade-in">
                    {/* Hero Status Card */}
                    <div className="relative rounded-[2.5rem] p-8 overflow-hidden border border-white/60 shadow-xl bg-gradient-to-br from-white/90 to-slate-50/80 backdrop-blur-xl group">
                         {/* Ambient Background Elements */}
                         <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-400/10 rounded-full blur-[60px] group-hover:bg-blue-400/20 transition-all duration-1000"></div>
                         <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-300/10 rounded-full blur-[50px]"></div>
                         
                         <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
                             <div>
                                 <div className="flex items-center gap-2 text-indigo-600 font-bold mb-2 text-xs uppercase tracking-widest">
                                    <Activity size={14} className="animate-pulse" /> 实时监测
                                 </div>
                                 <h3 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-2 tracking-tight">
                                   大雨倾盆
                                   <span className="text-base font-medium text-slate-500 ml-3 align-middle tracking-normal">需注意防滑</span>
                                 </h3>
                                 <p className="text-slate-600 max-w-md leading-relaxed font-medium mt-2">
                                     当前区域雨势较大，能见度低。未来 30 分钟降雨量预计增加 15%。
                                 </p>
                             </div>
                             <div className="text-right">
                                 <div className="text-6xl font-light text-slate-800">18°</div>
                                 <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-1">体感偏凉</div>
                             </div>
                         </div>
                         
                         <div className="relative border-t border-slate-200/50 pt-6">
                              <RainChart />
                         </div>
                    </div>

                    {/* Alert List */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">生效预警</h3>
                        {alerts.map((alert, idx) => (
                            <div key={idx} className="bg-white/80 p-5 rounded-2xl flex gap-4 items-center group border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                <div className={`p-3 rounded-xl flex-shrink-0 ${alert.severity === 'high' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
                                    <AlertTriangle size={24} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-800 text-lg">{alert.message}</h4>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 font-bold uppercase tracking-wider">
                                        <span>{alert.location || '全市范围'}</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                        <span>{alert.timestamp}</span>
                                    </div>
                                </div>
                                <div className="text-slate-300">
                                   <Info size={18} />
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>
             </div>
        )}

        {/* --- CHAT TAB --- */}
        {activeTab === AppTab.CHAT && (
             <div className="h-full flex flex-col bg-white/30">
                 <ChatAssistant />
             </div>
        )}

        {/* --- PREPS/ALERTS TAB (CHECKLIST) --- */}
        {activeTab === AppTab.ALERTS && (
             <div className="flex-1 overflow-y-auto scrollbar-hide p-4 md:p-10 max-w-5xl mx-auto w-full">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900">备品清单</h2>
                        <p className="text-slate-600 font-medium mt-1">AI 智能生成的个性化出行建议</p>
                    </div>
                    {checklistData && (
                        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
                             <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">准备进度</span>
                             <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                 <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
                             </div>
                             <span className="text-sm font-bold text-emerald-600">{Math.round(progress)}%</span>
                        </div>
                    )}
                </div>

                {checklistData ? (
                     <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fade-in">
                        
                        {/* Summary Card */}
                        <div className="md:col-span-12 bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px]"></div>
                             <div className="relative z-10">
                                 <h3 className="text-emerald-400 font-bold text-sm uppercase tracking-widest mb-3 flex items-center gap-2">
                                     <Sparkles size={16} /> 综合研判
                                 </h3>
                                 <p className="text-2xl md:text-3xl font-bold leading-tight mb-6 text-white">
                                     {checklistData.weatherSummary}
                                 </p>
                                 <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3 rounded-xl border border-white/10">
                                     <Shirt size={20} className="text-blue-300" />
                                     <span className="font-medium text-blue-50">
                                        建议穿着：{checklistData.clothingRecommendation}
                                     </span>
                                 </div>
                             </div>
                        </div>

                        {/* Interactive Gear List */}
                        <div className="md:col-span-7 space-y-4">
                             <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-lg">
                                <h4 className="font-black text-slate-800 text-xl mb-6 flex items-center justify-between">
                                    <span className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                                            <Umbrella size={24} /> 
                                        </div>
                                        随身物品
                                    </span>
                                </h4>
                                
                                <div className="space-y-2">
                                    {checkItems.map((item) => (
                                        <div 
                                          key={item.id} 
                                          onClick={() => toggleCheckItem(item.id)}
                                          className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${item.checked ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-sm'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${item.checked ? 'bg-blue-500 text-white' : 'bg-slate-100 text-transparent border border-slate-200'}`}>
                                                    <CheckSquare size={14} />
                                                </div>
                                                <span className={`font-bold text-lg transition-all ${item.checked ? 'text-slate-400 line-through decoration-2' : 'text-slate-800'}`}>
                                                    {item.text}
                                                </span>
                                            </div>
                                            {item.type === 'custom' && (
                                                <button 
                                                  onClick={(e) => { e.stopPropagation(); removeCustomItem(item.id); }}
                                                  className="p-2 text-slate-300 hover:text-red-400 hover:bg-red-50 rounded-full transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Add New Item */}
                                <div className="mt-4 flex gap-2">
                                    <input 
                                        type="text" 
                                        value={newItemText}
                                        onChange={(e) => setNewItemText(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && addCustomItem()}
                                        placeholder="添加自定义物品..."
                                        className="flex-1 px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 text-slate-700 font-medium placeholder-slate-400"
                                    />
                                    <button 
                                        onClick={addCustomItem}
                                        className="px-4 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                             </div>
                        </div>

                        {/* Safety Tips */}
                        <div className="md:col-span-5">
                            <div className="bg-amber-50 rounded-[2rem] p-8 border border-amber-100 shadow-lg h-full">
                                <h4 className="font-black text-slate-800 text-xl mb-6 flex items-center gap-3">
                                    <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
                                        <ShieldCheck size={24} />
                                    </div>
                                    安全注意
                                </h4>
                                <ul className="space-y-4">
                                    {checklistData.safetyTips.map((t, i) => (
                                        <li key={i} className="flex items-start gap-4 p-4 bg-white/60 rounded-2xl border border-amber-100/50 hover:bg-white transition-colors">
                                            <AlertTriangle size={20} className="text-amber-500 mt-0.5 flex-shrink-0"/>
                                            <span className="text-slate-800 font-bold text-sm leading-relaxed">{t}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                     </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 opacity-60">
                        <div className="w-10 h-10 border-4 border-slate-300 border-t-slate-800 rounded-full animate-spin mb-6"></div>
                        <p className="font-bold text-slate-500 text-lg">正在生成您的个性化建议...</p>
                    </div>
                )}
             </div>
        )}

        {/* --- DIY TAB --- */}
        {activeTab === AppTab.DIY && (
            <UmbrellaDesigner />
        )}

        {/* Mobile Bottom Nav */}
        <div className="md:hidden absolute bottom-0 left-0 right-0 glass-panel border-t border-white pb-safe z-50 rounded-t-3xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
            <div className="flex justify-between items-center px-6 py-2">
                {[
                  { id: AppTab.MAP, icon: Navigation, label: '导航' },
                  { id: AppTab.STATUS, icon: Activity, label: '雨况' },
                  { id: AppTab.CHAT, icon: MessageSquare, label: '助手' },
                  { id: AppTab.ALERTS, icon: Bell, label: '备品' },
                  { id: AppTab.DIY, icon: Palette, label: 'DIY' }
                ].map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`flex flex-col items-center p-2 transition-all duration-300 ${activeTab === item.id ? 'text-blue-600 -translate-y-2' : 'text-slate-400'}`}
                    >
                        <div className={`p-2 rounded-2xl mb-1 transition-all ${activeTab === item.id ? 'bg-white shadow-lg ring-1 ring-blue-50 text-blue-600' : ''}`}>
                             <item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                        </div>
                        <span className={`text-[10px] font-bold ${activeTab === item.id ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>{item.label}</span>
                    </button>
                ))}
            </div>
        </div>

      </main>
    </div>
  );
};

export default App;