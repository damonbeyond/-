import React, { useState, useEffect } from 'react';
import { generateTravelPlans } from './services/geminiService';
import { TravelPlan, ScenarioType, AIResponse, GroundingSource } from './types';
import PlanDetail from './components/PlanDetail';
import SafetyModal from './components/SafetyModal';
import { Search, Map, Sun, Moon, Star, Loader2, Compass } from 'lucide-react';

function App() {
  const [destination, setDestination] = useState('');
  const [selectedScenarios, setSelectedScenarios] = useState<ScenarioType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<AIResponse | null>(null);
  const [activePlan, setActivePlan] = useState<TravelPlan | null>(null);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<TravelPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | undefined>(undefined);

  // Get user location for better grounding
  useEffect(() => {
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
              (position) => {
                  setUserLocation({
                      lat: position.coords.latitude,
                      lng: position.coords.longitude
                  });
              },
              (err) => console.log("Geolocation permission denied or error", err)
          );
      }
  }, []);

  const toggleScenario = (scenario: ScenarioType) => {
    setSelectedScenarios(prev => 
      prev.includes(scenario) 
        ? prev.filter(s => s !== scenario)
        : [...prev, scenario]
    );
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) return;

    setIsLoading(true);
    setError(null);
    setApiResponse(null);
    setActivePlan(null);

    try {
      const data = await generateTravelPlans(destination, selectedScenarios, userLocation);
      setApiResponse(data);
    } catch (err: any) {
      setError(err.message || "生成计划时遇到问题，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPlan = (plan: TravelPlan) => {
    // Check for alerts first
    if (plan.alerts && plan.alerts.length > 0) {
      setPendingPlan(plan);
      setShowSafetyModal(true);
    } else {
      setActivePlan(plan);
    }
  };

  const handleSafetyConfirm = () => {
    setShowSafetyModal(false);
    if (pendingPlan) {
      setActivePlan(pendingPlan);
      setPendingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-teal-200">
      
      {/* Navigation / Header */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Compass className="text-teal-600" size={28} />
                <span className="text-xl font-bold tracking-tight text-gray-900">OrbitTravel</span>
            </div>
            {activePlan && (
                <button onClick={() => setActivePlan(null)} className="text-sm font-medium text-gray-500 hover:text-teal-600">
                    新建搜索
                </button>
            )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Search & Hero Section (Only show if no plan selected) */}
        {!activePlan && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] transition-all duration-500">
            <div className="text-center mb-10 max-w-2xl">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
                探索世界的<span className="text-teal-600">独特角落</span>
              </h1>
              <p className="text-lg text-gray-600">
                输入目的地，为您定制结合日出、星空与当地特色的完美旅程。
                实时计算交通食宿，全程无忧。
              </p>
            </div>

            <form onSubmit={handleSearch} className="w-full max-w-2xl space-y-6">
              <div className="relative group">
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="你想去哪里？(例如：西藏林芝, 冰岛, 京都)"
                  className="w-full h-16 px-6 text-lg rounded-full border-2 border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all shadow-sm group-hover:shadow-md"
                  disabled={isLoading}
                />
                <button 
                    type="submit"
                    disabled={isLoading}
                    className="absolute right-2 top-2 h-12 w-12 bg-teal-600 text-white rounded-full flex items-center justify-center hover:bg-teal-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : <Search />}
                </button>
              </div>

              <div className="flex flex-wrap justify-center gap-4">
                {[
                  { type: ScenarioType.SUNRISE, icon: <Sun size={18} />, label: '追日出' },
                  { type: ScenarioType.SUNSET, icon: <Moon size={18} />, label: '看日落' },
                  { type: ScenarioType.STARS, icon: <Star size={18} />, label: '观星空' },
                ].map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => toggleScenario(item.type)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all border
                      ${selectedScenarios.includes(item.type)
                        ? 'bg-teal-600 text-white border-teal-600 shadow-md transform scale-105'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300 hover:bg-teal-50'
                      }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </div>
            </form>

            {error && (
                <div className="mt-8 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 max-w-lg text-center animate-pulse">
                    {error}
                </div>
            )}
          </div>
        )}

        {/* Results Section */}
        {!activePlan && apiResponse && !isLoading && (
            <div className="animate-fade-in-up">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">为您生成的 3 个精选方案</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {apiResponse.plans.map((plan) => (
                        <div 
                            key={plan.id} 
                            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all border border-gray-100 flex flex-col cursor-pointer group hover:-translate-y-1"
                            onClick={() => handleSelectPlan(plan)}
                        >
                            <div className="mb-4">
                                <div className="flex gap-2 mb-3">
                                    {plan.tags.slice(0, 2).map(tag => (
                                        <span key={tag} className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-md uppercase tracking-wider">{tag}</span>
                                    ))}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-teal-600 transition-colors">{plan.title}</h3>
                                <p className="text-gray-500 text-sm mt-2 line-clamp-3">{plan.description}</p>
                            </div>
                            
                            <div className="mt-auto pt-4 border-t border-gray-100">
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-1 text-gray-600">
                                        <Map size={16} />
                                        <span>{plan.duration}</span>
                                    </div>
                                    <div className="font-bold text-gray-900">
                                        {plan.cost.currency} {plan.cost.total.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Grounding Sources */}
                {apiResponse.groundingSources.length > 0 && (
                    <div className="mt-12 pt-6 border-t border-gray-200">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">数据来源 (真实可追溯)</p>
                        <div className="flex flex-wrap gap-x-6 gap-y-2">
                            {apiResponse.groundingSources.map((source, idx) => (
                                <a 
                                    key={idx} 
                                    href={source.uri} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="text-xs text-teal-600 hover:underline truncate max-w-xs flex items-center gap-1"
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                                    {source.title}
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )}

        {/* Detail View */}
        {activePlan && (
            <PlanDetail 
                plan={activePlan} 
                onBack={() => setActivePlan(null)} 
            />
        )}

        {/* Modals */}
        <SafetyModal 
            isOpen={showSafetyModal}
            alerts={pendingPlan?.alerts || []}
            onConfirm={handleSafetyConfirm}
        />

      </main>
    </div>
  );
}

export default App;