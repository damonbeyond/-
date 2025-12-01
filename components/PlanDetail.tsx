import React from 'react';
import { TravelPlan } from '../types';
import CostChart from './CostChart';
import { MapPin, Clock, Camera, Sun, Moon, Star, Utensils, Bus } from 'lucide-react';

interface PlanDetailProps {
  plan: TravelPlan;
  onBack: () => void;
}

const PlanDetail: React.FC<PlanDetailProps> = ({ plan, onBack }) => {
  const getIcon = (type: string) => {
    switch(type) {
      case 'scenic': return <Camera className="text-purple-500" size={18} />;
      case 'food': return <Utensils className="text-orange-500" size={18} />;
      case 'transport': return <Bus className="text-blue-500" size={18} />;
      default: return <MapPin className="text-teal-500" size={18} />;
    }
  };

  return (
    <div className="animate-fade-in pb-20">
      <button 
        onClick={onBack}
        className="mb-6 text-sm font-medium text-gray-500 hover:text-gray-800 flex items-center gap-1 transition-colors"
      >
        ← 返回方案列表
      </button>

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{plan.title}</h1>
            <p className="text-gray-600 mb-4">{plan.description}</p>
            <div className="flex gap-2 flex-wrap">
              {plan.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-medium">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
          <div className="text-right">
             <div className="text-2xl font-bold text-teal-700">
               {plan.cost.currency} {plan.cost.total.toLocaleString()}
             </div>
             <div className="text-sm text-gray-500">预估总费用</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Itinerary */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Clock size={20} /> 行程安排
          </h2>
          
          {plan.itinerary.map((day) => (
            <div key={day.day} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex justify-between items-center">
                <span className="font-bold text-gray-800">Day {day.day}</span>
                <span className="text-sm text-gray-500 truncate max-w-[70%]">{day.summary}</span>
              </div>
              <div className="p-6">
                <div className="relative border-l-2 border-gray-200 ml-3 space-y-8">
                  {day.activities.map((act, idx) => (
                    <div key={idx} className="relative pl-8">
                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-teal-500"></div>
                      <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
                        <span className="text-xs font-mono text-gray-400 mt-1 min-w-[50px]">{act.time}</span>
                        <div>
                          <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                            {getIcon(act.type)}
                            {act.location}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1 leading-relaxed">{act.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Highlights & Cost */}
        <div className="space-y-6">
           {/* Scenic Highlights */}
           <div className="bg-gradient-to-br from-indigo-900 to-purple-800 rounded-xl p-6 text-white shadow-lg">
             <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
               <Star className="text-yellow-400" /> 特色打卡
             </h3>
             <ul className="space-y-3">
               {plan.scenicHighlights.map((spot, i) => (
                 <li key={i} className="flex items-center gap-3 bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                    {spot.includes('日出') || spot.includes('Sunrise') ? <Sun size={16} className="text-orange-300" /> :
                     spot.includes('日落') || spot.includes('Sunset') ? <Moon size={16} className="text-pink-300" /> :
                     <Camera size={16} className="text-blue-300" />}
                    <span className="text-sm font-medium">{spot}</span>
                 </li>
               ))}
               {plan.scenicHighlights.length === 0 && (
                 <li className="text-sm opacity-75 italic">暂无特别标注的景观</li>
               )}
             </ul>
           </div>

           {/* Cost Chart */}
           <CostChart cost={plan.cost} />
        </div>
      </div>
    </div>
  );
};

export default PlanDetail;