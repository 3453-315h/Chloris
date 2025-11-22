
import React from 'react';
import { SimulationResult } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

interface VisualizationProps {
  data: SimulationResult;
}

export const TimelineChart: React.FC<VisualizationProps> = ({ data }) => {
  // Transform stage data for Gantt-like visualization
  const chartData = data.stages.map((stage, index) => ({
    name: stage.stage,
    duration: stage.durationDays,
    gdd: stage.accumulatedGDD,
    start: stage.startDate,
    index: index
  }));

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-xl dark:shadow-none">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-6">Growth Stage Progression & GDD Accumulation</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorGdd" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#538d69" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#538d69" stopOpacity={0}/>
              </linearGradient>
            </defs>
            {/* Updated colors to match Stone Palette (400 level) */}
            <XAxis dataKey="name" stroke="#a8a29e" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#a8a29e" fontSize={12} tickLine={false} axisLine={false} label={{ value: 'Accumulated GDD', angle: -90, position: 'insideLeft', fill: '#a8a29e' }}/>
            {/* Updated grid color to Stone 200/700 */}
            <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} className="dark:stroke-slate-700" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#292524', borderColor: '#44403c', color: '#fafaf9' }}
              itemStyle={{ color: '#538d69' }}
            />
            <Area type="monotone" dataKey="gdd" stroke="#538d69" fillOpacity={1} fill="url(#colorGdd)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const DLIChart: React.FC<VisualizationProps> = ({ data }) => {
    const dliData = data.stages.map(s => ({
        name: s.stage,
        req: s.requiredDLI
    }));

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-xl dark:shadow-none">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-6">Target Daily Light Integral (DLI) per Stage</h3>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dliData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} className="dark:stroke-slate-700" />
                <XAxis dataKey="name" stroke="#a8a29e" fontSize={10} tickLine={false} axisLine={false} interval={0} />
                <YAxis stroke="#a8a29e" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ backgroundColor: '#292524', borderColor: '#44403c', color: '#fafaf9' }}
                />
                <Bar dataKey="req" fill="#facc15" radius={[4, 4, 0, 0]}>
                    {dliData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.req > 40 ? '#ef4444' : '#facc15'} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
    );
}
