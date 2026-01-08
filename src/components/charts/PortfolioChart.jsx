import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend
} from 'recharts';
import { ChartBar } from '../layout/icons';
import { formatCurrency } from '../../utils/calculations';

// Custom tooltip component - refined
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const isDistribution = data.phase === 'distribution';
  const lifeEvent = data.lifeEvent;
  const realValue = data.realValue;
  const nominalValue = data.portfolioValue || payload.find(p => p.dataKey === 'portfolioValue')?.value;

  return (
    <div className="bg-surface-800 border border-surface-700/60 rounded-xl p-4 shadow-lg">
      <p className="text-sm font-semibold text-surface-100 mb-2">
        Year {label} {isDistribution && <span className="text-primary-400 font-normal">(SWP Phase)</span>}
      </p>
      <div className="space-y-1.5">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div 
                className="w-2.5 h-2.5 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs text-surface-400">{entry.name}</span>
            </div>
            <span className="text-sm font-medium text-surface-100">
              {formatCurrency(entry.value, true)}
            </span>
          </div>
        ))}
        
        {/* Show inflation-adjusted value */}
        {realValue && nominalValue && realValue !== nominalValue && (
          <div className="mt-2 pt-2 border-t border-surface-700/50">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-primary-400">In Today's Money</span>
              <span className="text-sm font-medium text-primary-400">
                {formatCurrency(realValue, true)}
              </span>
            </div>
            <p className="text-[10px] text-surface-500 mt-1">
              Purchasing power after inflation
            </p>
          </div>
        )}
        
        {lifeEvent && (
          <div className={`mt-2 pt-2 border-t border-surface-700/50 flex items-center justify-between gap-4`}>
            <span className={`text-xs font-medium ${lifeEvent.type === 'addition' ? 'text-green-400' : 'text-red-400'}`}>
              {lifeEvent.type === 'addition' ? '↑' : '↓'} {lifeEvent.label}
            </span>
            <span className={`text-sm font-medium ${lifeEvent.type === 'addition' ? 'text-green-400' : 'text-red-400'}`}>
              {lifeEvent.type === 'addition' ? '+' : ''}{formatCurrency(lifeEvent.amount, true)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PortfolioChart({ data, transitionYear, showRealValues, inflationRate = 0.06 }) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data.map(row => {
      // Calculate inflation factor for this year
      const inflationFactor = Math.pow(1 + inflationRate, row.year);
      
      return {
        ...row,
        portfolioValue: showRealValues ? row.realValue : row.portfolioValue,
        // Also adjust totalInvested when showing real values
        displayTotalInvested: showRealValues 
          ? row.totalInvested / inflationFactor 
          : row.totalInvested
      };
    });
  }, [data, showRealValues, inflationRate]);

  const maxValue = useMemo(() => {
    if (!chartData.length) return 0;
    return Math.max(...chartData.map(d => Math.max(d.portfolioValue || 0, d.displayTotalInvested || 0)));
  }, [chartData]);

  const formatYAxis = (value) => {
    if (value >= 10000000) return `${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value;
  };

  if (!chartData || chartData.length === 0) {
    return (
      <div className="glass-card p-8 chart-container flex items-center justify-center">
        <div className="text-center text-surface-400">
          <ChartBar className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p className="text-lg font-medium text-surface-300">Portfolio Growth Chart</p>
          <p className="text-sm mt-2">Enter your investment details to visualize growth</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 animate-fade-in">
      <div className="section-title mb-5">
        <div className="p-2 bg-surface-700/50 rounded-lg">
          <ChartBar className="w-5 h-5 text-surface-300" />
        </div>
        <span>Portfolio Growth Over Time</span>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <defs>
              <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="investedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#64748b" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#64748b" stopOpacity={0} />
              </linearGradient>
            </defs>
            
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#334155" 
              vertical={false}
            />
            
            <XAxis 
              dataKey="year" 
              stroke="#475569"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              axisLine={{ stroke: '#334155' }}
              tickLine={{ stroke: '#334155' }}
              label={{ 
                value: 'Years', 
                position: 'insideBottom', 
                offset: -10,
                fill: '#64748b',
                fontSize: 11
              }}
            />
            
            <YAxis 
              stroke="#475569"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              axisLine={{ stroke: '#334155' }}
              tickLine={{ stroke: '#334155' }}
              tickFormatter={formatYAxis}
              domain={[0, maxValue * 1.1]}
              label={{ 
                value: '₹ Value', 
                angle: -90, 
                position: 'insideLeft',
                fill: '#64748b',
                fontSize: 11
              }}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            <Legend 
              wrapperStyle={{ paddingTop: '16px' }}
              formatter={(value) => (
                <span className="text-sm text-surface-300">{value}</span>
              )}
            />

            {/* Phase Transition Reference Line */}
            {transitionYear && (
              <ReferenceLine 
                x={transitionYear} 
                stroke="#f59e0b"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                label={{
                  value: 'SWP Starts',
                  position: 'top',
                  fill: '#f59e0b',
                  fontSize: 10,
                  fontWeight: 500
                }}
              />
            )}
            
            <Area
              type="monotone"
              dataKey="displayTotalInvested"
              name="Total Invested"
              stroke="#64748b"
              strokeWidth={1.5}
              fill="url(#investedGradient)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, fill: '#64748b' }}
            />
            
            <Area
              type="monotone"
              dataKey="portfolioValue"
              name="Portfolio Value"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#portfolioGradient)"
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, fill: '#10b981' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend explanation */}
      <div className="mt-4 flex flex-wrap gap-4 justify-center text-xs text-surface-400">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-surface-500 rounded" />
          <span>Total Invested</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-primary-500 rounded" />
          <span>Portfolio Value</span>
        </div>
        {transitionYear && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 border-dashed border border-amber-500" />
            <span>Phase Transition</span>
          </div>
        )}
      </div>
    </div>
  );
}
