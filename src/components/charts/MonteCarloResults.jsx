import { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Line,
  ComposedChart
} from 'recharts';
import { runMonteCarloSimulation } from '../../utils/monteCarloSimulation';
import { formatCurrency } from '../../utils/calculations';

// Custom tooltip
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  
  return (
    <div className="bg-surface-800/95 backdrop-blur-xl border border-surface-600/50 rounded-xl p-4 shadow-2xl">
      <p className="text-sm font-semibold text-surface-200 mb-2">
        Year {label} <span className="text-surface-400">({data.phase})</span>
      </p>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between gap-4">
          <span className="text-surface-400">90th Percentile:</span>
          <span className="text-green-400">{formatCurrency(data.p90, true)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-surface-400">Median (50th):</span>
          <span className="text-accent-400 font-medium">{formatCurrency(data.p50, true)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-surface-400">10th Percentile:</span>
          <span className="text-red-400">{formatCurrency(data.p10, true)}</span>
        </div>
      </div>
    </div>
  );
}

// Success gauge component
function SuccessGauge({ successRate }) {
  const getColor = () => {
    if (successRate >= 90) return 'text-green-400';
    if (successRate >= 75) return 'text-primary-400';
    if (successRate >= 50) return 'text-amber-400';
    return 'text-red-400';
  };

  const getBgColor = () => {
    if (successRate >= 90) return 'bg-green-500/20 border-green-500/30';
    if (successRate >= 75) return 'bg-primary-500/20 border-primary-500/30';
    if (successRate >= 50) return 'bg-amber-500/20 border-amber-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  const getMessage = () => {
    if (successRate >= 90) return 'Excellent! Your plan is very robust.';
    if (successRate >= 75) return 'Good chance of success with some risk.';
    if (successRate >= 50) return 'Moderate risk. Consider adjustments.';
    return 'High risk of running out of money.';
  };

  return (
    <div className={`p-6 rounded-2xl border ${getBgColor()}`}>
      <div className="flex items-center gap-6">
        <div className="text-center">
          <div className={`text-4xl font-bold ${getColor()}`}>
            {successRate.toFixed(0)}%
          </div>
          <div className="text-xs text-surface-400 mt-1">Success Rate</div>
        </div>
        <div className="flex-1">
          <p className={`text-sm font-medium ${getColor()}`}>{getMessage()}</p>
          <p className="text-xs text-surface-500 mt-1">
            Based on 100 market simulations
          </p>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="mt-4 h-2 bg-surface-700 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${
            successRate >= 90 ? 'bg-green-500' :
            successRate >= 75 ? 'bg-primary-500' :
            successRate >= 50 ? 'bg-amber-500' : 'bg-red-500'
          }`}
          style={{ width: `${successRate}%` }}
        />
      </div>
    </div>
  );
}

export default function MonteCarloResults({ accumulationParams, distributionParams }) {
  const [enabled, setEnabled] = useState(false);
  const [volatility, setVolatility] = useState(5);
  const [targetYears, setTargetYears] = useState(30);

  // Run simulation when enabled
  const simulation = useMemo(() => {
    if (!enabled) return null;
    
    return runMonteCarloSimulation(
      accumulationParams,
      distributionParams,
      {
        numSimulations: 100,
        volatility: volatility / 100,
        targetSurvivalYears: targetYears
      }
    );
  }, [enabled, accumulationParams, distributionParams, volatility, targetYears]);

  const formatYAxis = (value) => {
    if (value >= 10000000) return `${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value;
  };

  return (
    <div className="glass-card p-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="section-title">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <span>Monte Carlo Analysis</span>
        </div>
        
        <button
          onClick={() => setEnabled(!enabled)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            enabled 
              ? 'bg-purple-500 text-white' 
              : 'bg-surface-700 text-surface-300 hover:bg-surface-600'
          }`}
        >
          {enabled ? 'Simulation Active' : 'Run Simulation'}
        </button>
      </div>

      {!enabled ? (
        <div className="text-center py-8 bg-surface-700/20 rounded-xl border border-dashed border-surface-600/50">
          <svg className="w-12 h-12 mx-auto mb-3 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
              d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <p className="text-surface-400 text-sm">Click "Run Simulation" to analyze market volatility impact</p>
          <p className="text-surface-500 text-xs mt-1">Runs 100 scenarios with randomized annual returns</p>
        </div>
      ) : simulation ? (
        <div className="space-y-6">
          {/* Controls */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-surface-800/40 rounded-xl">
            <div>
              <label className="text-xs text-surface-400 mb-1 block">Market Volatility (σ)</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="1"
                  max="15"
                  value={volatility}
                  onChange={(e) => setVolatility(parseInt(e.target.value))}
                  className="flex-1 accent-purple-500"
                />
                <span className="text-sm font-medium text-surface-200 w-10 text-right">{volatility}%</span>
              </div>
              <p className="text-[10px] text-surface-500 mt-1">Higher = more market uncertainty</p>
            </div>
            <div>
              <label className="text-xs text-surface-400 mb-1 block">Target Survival (Years)</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="10"
                  max="50"
                  step="5"
                  value={targetYears}
                  onChange={(e) => setTargetYears(parseInt(e.target.value))}
                  className="flex-1 accent-purple-500"
                />
                <span className="text-sm font-medium text-surface-200 w-10 text-right">{targetYears}y</span>
              </div>
              <p className="text-[10px] text-surface-500 mt-1">How long should retirement last?</p>
            </div>
          </div>

          {/* Success Gauge */}
          <SuccessGauge successRate={simulation.successRate} />

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-surface-700/30 rounded-xl text-center">
              <p className="text-xs text-surface-400 mb-1">Corpus at Retirement</p>
              <p className="text-sm font-bold text-surface-200">{formatCurrency(simulation.corpusStats.p50, true)}</p>
              <p className="text-[10px] text-surface-500">Median</p>
            </div>
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-center">
              <p className="text-xs text-green-400 mb-1">Best Case (90th)</p>
              <p className="text-sm font-bold text-green-400">{formatCurrency(simulation.corpusStats.p90, true)}</p>
              <p className="text-[10px] text-surface-500">Good market</p>
            </div>
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
              <p className="text-xs text-red-400 mb-1">Worst Case (10th)</p>
              <p className="text-sm font-bold text-red-400">{formatCurrency(simulation.corpusStats.p10, true)}</p>
              <p className="text-[10px] text-surface-500">Bad market</p>
            </div>
          </div>

          {/* Confidence Band Chart */}
          <div>
            <h4 className="text-sm font-medium text-surface-300 mb-3">Confidence Band (10th - 90th Percentile)</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={simulation.percentileData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                  <defs>
                    <linearGradient id="confidenceBand" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  
                  <XAxis 
                    dataKey="year" 
                    stroke="#64748b"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    axisLine={{ stroke: '#334155' }}
                  />
                  
                  <YAxis 
                    stroke="#64748b"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    axisLine={{ stroke: '#334155' }}
                    tickFormatter={formatYAxis}
                  />
                  
                  <Tooltip content={<CustomTooltip />} />
                  
                  {/* Transition line */}
                  <ReferenceLine 
                    x={accumulationParams.durationYears} 
                    stroke="#f59e0b"
                    strokeDasharray="5 5"
                    strokeWidth={1}
                  />

                  {/* Confidence band (10th to 90th) */}
                  <Area
                    type="monotone"
                    dataKey="p90"
                    stroke="none"
                    fill="url(#confidenceBand)"
                  />
                  <Area
                    type="monotone"
                    dataKey="p10"
                    stroke="none"
                    fill="#0f172a"
                  />

                  {/* Median line */}
                  <Line
                    type="monotone"
                    dataKey="p50"
                    stroke="#a855f7"
                    strokeWidth={2}
                    dot={false}
                  />
                  
                  {/* 10th percentile line */}
                  <Line
                    type="monotone"
                    dataKey="p10"
                    stroke="#ef4444"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    dot={false}
                  />
                  
                  {/* 90th percentile line */}
                  <Line
                    type="monotone"
                    dataKey="p90"
                    stroke="#22c55e"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 mt-3 text-xs text-surface-400">
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-purple-500 rounded" />
                <span>Median (50th)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-green-500 rounded border-dashed" />
                <span>90th Percentile</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-red-500 rounded border-dashed" />
                <span>10th Percentile</span>
              </div>
            </div>
          </div>

          {/* Info note */}
          <p className="text-xs text-surface-500 text-center">
            💡 Based on {simulation.numSimulations} simulations with ±{simulation.volatility}% annual return volatility
          </p>
        </div>
      ) : null}
    </div>
  );
}
