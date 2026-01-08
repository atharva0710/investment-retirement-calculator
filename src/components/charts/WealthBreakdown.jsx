import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { Sparkles } from '../layout/icons';
import { formatCurrency } from '../../utils/calculations';

const COLORS = ['#64748b', '#10b981'];

// Custom tooltip
function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0];
  return (
    <div className="bg-surface-800 border border-surface-700/60 rounded-xl p-4 shadow-lg">
      <div className="flex items-center gap-3">
        <div 
          className="w-3 h-3 rounded-full" 
          style={{ backgroundColor: data.payload.fill }}
        />
        <div>
          <p className="text-sm font-medium text-surface-200">{data.name}</p>
          <p className="text-lg font-bold text-surface-100">
            {formatCurrency(data.value, true)}
          </p>
          <p className="text-xs text-surface-400">
            {data.payload.percentage.toFixed(1)}% of total
          </p>
        </div>
      </div>
    </div>
  );
}

export default function WealthBreakdown({ totalInvested, totalGains, showRealValues }) {
  const data = useMemo(() => {
    if (!totalInvested && !totalGains) return [];
    
    const total = totalInvested + totalGains;
    return [
      { 
        name: 'Principal Invested', 
        value: totalInvested, 
        percentage: (totalInvested / total) * 100 
      },
      { 
        name: 'Wealth Gained', 
        value: totalGains, 
        percentage: (totalGains / total) * 100 
      }
    ];
  }, [totalInvested, totalGains]);

  const totalValue = totalInvested + totalGains;
  const multiplier = totalInvested > 0 ? totalValue / totalInvested : 0;

  if (!data.length || totalValue === 0) {
    return (
      <div className="glass-card p-8 h-[350px] flex items-center justify-center">
        <div className="text-center text-surface-400">
          <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p className="font-medium text-surface-300">Wealth Breakdown</p>
          <p className="text-sm mt-2">Enter details to see breakdown</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 animate-fade-in">
      <div className="section-title mb-4">
        <div className="p-2 bg-surface-700/50 rounded-lg">
          <Sparkles className="w-5 h-5 text-surface-300" />
        </div>
        <span>Wealth Composition</span>
      </div>

      <p className="text-sm text-surface-400 mb-4">
        At peak corpus (end of accumulation)
      </p>

      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index]} 
                  stroke="transparent"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Stats below the chart */}
      <div className="grid grid-cols-2 gap-3 mt-3">
        <div className="text-center p-3 bg-surface-700/40 rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-2.5 h-2.5 rounded-full bg-surface-500" />
            <span className="text-xs text-surface-400">Principal</span>
          </div>
          <p className="text-base font-bold text-surface-100">
            {formatCurrency(totalInvested, true)}
          </p>
          <p className="text-xs text-surface-500">{data[0]?.percentage.toFixed(1)}%</p>
        </div>
        
        <div className="text-center p-3 bg-surface-700/40 rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />
            <span className="text-xs text-surface-400">Gains</span>
          </div>
          <p className="text-base font-bold text-primary-400">
            {formatCurrency(totalGains, true)}
          </p>
          <p className="text-xs text-surface-500">{data[1]?.percentage.toFixed(1)}%</p>
        </div>
      </div>

      {/* Wealth multiplier highlight */}
      <div className="mt-4 p-3 bg-surface-700/40 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm text-surface-300">Wealth Multiplier</span>
          <span className="text-xl font-bold text-primary-400">
            {multiplier.toFixed(2)}x
          </span>
        </div>
        <p className="text-xs text-surface-500 mt-1">
          Your money grew {multiplier.toFixed(2)} times
        </p>
      </div>
    </div>
  );
}
