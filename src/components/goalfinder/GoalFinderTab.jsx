import { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { findRetirementGoal } from '../../utils/goalFinder';
import { formatCurrency } from '../../utils/calculations';
import { Target, TrendingUp, Calculator, Wallet, Clock, Sparkles, InformationCircle } from '../layout/icons';

// Info tooltip component
function InfoTip({ text }) {
  return (
    <div className="group relative inline-block ml-1">
      <InformationCircle className="w-3.5 h-3.5 text-surface-500 hover:text-surface-300 cursor-help" />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
        <div className="bg-surface-700 text-surface-200 text-xs rounded-lg px-3 py-2 max-w-xs whitespace-normal shadow-xl border border-surface-600">
          {text}
        </div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-surface-700" />
      </div>
    </div>
  );
}

// Custom tooltip for the gap chart
function GapChartTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-surface-800 border border-surface-700/60 rounded-xl p-4 shadow-lg">
      <p className="text-sm font-semibold text-surface-200 mb-2">Year {label}</p>
      <div className="space-y-1.5 text-xs">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-surface-400">{entry.name}</span>
            </div>
            <span className="font-medium text-surface-200">
              {formatCurrency(entry.value, true)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function GoalFinderTab({ onExportToSimulator }) {
  // Input state
  const [inputs, setInputs] = useState({
    yearsToRetirement: 20,
    currentLumpSum: 500000,
    monthlyWithdrawalToday: 100000,
    expectedReturnPercent: 12,
    inflationPercent: 6,
    withdrawalGrowthPercent: 6,  // Post-retirement spending growth
    stepUpPercent: 10,
    sustainForever: true,
    sustainYears: 30
  });

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  // Calculate results
  const result = useMemo(() => {
    return findRetirementGoal(inputs);
  }, [inputs]);

  const formatYAxis = (value) => {
    if (value >= 10000000) return `${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value;
  };

  const handleExport = () => {
    if (onExportToSimulator) {
      onExportToSimulator(result.exportParams);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header with explanation */}
      <div className="glass-card p-6">
        <div className="section-title mb-3">
          <div className="p-2 bg-amber-500/20 rounded-lg">
            <Target className="w-5 h-5 text-amber-400" />
          </div>
          <span>Retirement Goal Finder</span>
        </div>
        <p className="text-surface-400 text-sm mb-4">
          <strong>What this does:</strong> Calculates how much you need to invest monthly (SIP) to build 
          a corpus that can sustain your desired retirement lifestyle.
        </p>
        <div className="bg-surface-700/40 rounded-lg p-4 text-xs text-surface-400">
          <p className="font-medium text-surface-300 mb-2">💡 How it works:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>You tell us how much you want to spend monthly in retirement <span className="text-primary-400">(in today's rupees)</span></li>
            <li>We calculate the corpus needed at retirement to sustain that spending</li>
            <li>We find the starting SIP that grows your current savings to that target</li>
          </ol>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="glass-card p-6 space-y-5">
          <h3 className="font-medium text-surface-200 flex items-center gap-2 border-b border-surface-700/50 pb-3">
            <Calculator className="w-4 h-4 text-primary-400" />
            Your Inputs
          </h3>

          {/* Years to Retirement */}
          <div className="space-y-2">
            <label className="input-label flex items-center gap-1">
              <Clock className="w-4 h-4 text-primary-400" />
              Years Until Retirement
              <InfoTip text="How many years from now do you plan to retire? This is your investment horizon." />
            </label>
            <input
              type="number"
              className="input-field"
              placeholder="e.g., 20"
              value={inputs.yearsToRetirement || ''}
              onChange={handleChange('yearsToRetirement')}
              min="1"
              max="50"
            />
            <p className="text-xs text-surface-500">
              Your SIP will grow over this period
            </p>
          </div>

          {/* Current Lump Sum */}
          <div className="space-y-2">
            <label className="input-label flex items-center gap-1">
              <Wallet className="w-4 h-4 text-primary-400" />
              Current Savings (Lump Sum)
              <InfoTip text="How much money do you already have saved/invested? Enter 0 if starting fresh." />
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400">₹</span>
              <input
                type="number"
                className="input-field pl-8"
                placeholder="e.g., 500000"
                value={inputs.currentLumpSum || ''}
                onChange={handleChange('currentLumpSum')}
                min="0"
              />
            </div>
            <p className="text-xs text-surface-500">
              This will also grow with your SIP
            </p>
          </div>

          {/* Desired Monthly Withdrawal */}
          <div className="space-y-2 p-4 bg-accent-500/10 rounded-xl border border-accent-500/20">
            <label className="input-label flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-accent-400" />
              Monthly Spending in Retirement
              <InfoTip text="How much do you want to spend per month in retirement? Enter in TODAY'S rupees - we'll automatically adjust for inflation." />
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400">₹</span>
              <input
                type="number"
                className="input-field pl-8 border-accent-500/30"
                placeholder="e.g., 100000"
                value={inputs.monthlyWithdrawalToday || ''}
                onChange={handleChange('monthlyWithdrawalToday')}
                min="0"
              />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] bg-accent-500/20 text-accent-400 px-2 py-1 rounded">
                💡 Enter in today's ₹
              </span>
              <span className="text-xs text-surface-500">
                → Will be ₹{formatCurrency(result.corpus.withdrawalAtRetirement, true).replace('₹', '')}/mo at retirement
              </span>
            </div>
          </div>

          {/* Expected Return & Inflation */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="input-label flex items-center gap-1">
                Expected Return
                <InfoTip text="Expected annual return on your investments. Equity mutual funds typically give 10-14% over long term." />
              </label>
              <div className="relative">
                <input
                  type="number"
                  className="input-field pr-8"
                  placeholder="12"
                  value={inputs.expectedReturnPercent || ''}
                  onChange={handleChange('expectedReturnPercent')}
                  min="1"
                  max="25"
                  step="0.5"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400">%</span>
              </div>
              <p className="text-xs text-surface-500">Per year</p>
            </div>
            <div className="space-y-2">
              <label className="input-label flex items-center gap-1">
                Inflation Rate
                <InfoTip text="Expected annual inflation. India averages 5-7% historically. Higher inflation means you need more corpus." />
              </label>
              <div className="relative">
                <input
                  type="number"
                  className="input-field pr-8"
                  placeholder="6"
                  value={inputs.inflationPercent || ''}
                  onChange={handleChange('inflationPercent')}
                  min="1"
                  max="15"
                  step="0.5"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400">%</span>
              </div>
              <p className="text-xs text-surface-500">Per year</p>
            </div>
          </div>

          {/* SIP Step-Up */}
          <div className="space-y-2">
            <label className="input-label flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-primary-400" />
              Annual SIP Increase (Pre-Retirement)
              <InfoTip text="Will you increase your SIP every year? E.g., 10% means if you start with ₹25K SIP, next year it's ₹27.5K, then ₹30.25K, etc." />
            </label>
            <div className="relative">
              <input
                type="number"
                className="input-field pr-8"
                placeholder="10"
                value={inputs.stepUpPercent || ''}
                onChange={handleChange('stepUpPercent')}
                min="0"
                max="25"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400">%</span>
            </div>
            <p className="text-xs text-surface-500">
              Higher step-up = lower starting SIP needed
            </p>
          </div>

          {/* Post-Retirement Spending Growth */}
          <div className="space-y-2 p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
            <label className="input-label flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              Annual Spending Increase (Post-Retirement)
              <InfoTip text="How much will your monthly spending increase each year AFTER retirement? This is typically set equal to or slightly below inflation. Higher growth requires a larger corpus." />
            </label>
            <div className="relative">
              <input
                type="number"
                className="input-field pr-8 border-amber-500/30"
                placeholder="6"
                value={inputs.withdrawalGrowthPercent || ''}
                onChange={handleChange('withdrawalGrowthPercent')}
                min="0"
                max="15"
                step="0.5"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400">%</span>
            </div>
            <p className="text-xs text-surface-500">
              💡 Year 1: ₹{formatCurrency(result.corpus.withdrawalAtRetirement, true).replace('₹', '')}/mo → Year 2: ₹{formatCurrency(result.corpus.withdrawalAtRetirement * (1 + inputs.withdrawalGrowthPercent/100), true).replace('₹', '')}/mo
            </p>
          </div>

          {/* Sustainability Toggle */}
          <div className="space-y-3 p-4 bg-surface-700/30 rounded-xl">
            <label className="input-label flex items-center gap-1">
              How Long Should Your Money Last?
              <InfoTip text="'Forever' means your corpus never depletes (perpetuity). 'X Years' means it will be fully spent by that time." />
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setInputs(prev => ({ ...prev, sustainForever: true }))}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                  inputs.sustainForever 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-surface-600/50 text-surface-400 hover:bg-surface-600'
                }`}
              >
                ∞ Forever
              </button>
              <button
                type="button"
                onClick={() => setInputs(prev => ({ ...prev, sustainForever: false }))}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                  !inputs.sustainForever 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-surface-600/50 text-surface-400 hover:bg-surface-600'
                }`}
              >
                Fixed Years
              </button>
            </div>
            <p className="text-xs text-surface-500">
              {inputs.sustainForever 
                ? "Corpus generates returns that cover withdrawals indefinitely" 
                : "Corpus will be fully withdrawn over the specified period"}
            </p>
            
            {!inputs.sustainForever && (
              <div className="mt-3">
                <label className="text-xs text-surface-400">Number of years in retirement</label>
                <input
                  type="number"
                  className="input-field mt-1"
                  placeholder="30"
                  value={inputs.sustainYears || ''}
                  onChange={handleChange('sustainYears')}
                  min="5"
                  max="50"
                />
              </div>
            )}
          </div>
        </div>

        {/* Results Card */}
        <div className="space-y-6">
          {/* Magic Number */}
          <div className="glass-card p-6 bg-primary-500/10 border border-primary-500/20">
            <h3 className="text-sm text-surface-400 mb-1 flex items-center gap-1">
              Your Required Monthly SIP
              <InfoTip text="This is the starting SIP amount you need to invest each month. If you set a step-up, this will increase annually." />
            </h3>
            
            {result.sip.isAchievable ? (
              <>
                <div className="text-4xl font-bold gradient-text mb-1">
                  {result.sip.requiredSIP === 0 
                    ? "₹0 /month" 
                    : `${formatCurrency(result.sip.requiredSIP, false)}/month`}
                </div>
                <p className="text-surface-400 text-sm">
                  {result.sip.requiredSIP === 0 
                    ? "🎉 Your current savings are already sufficient!" 
                    : inputs.stepUpPercent > 0 
                      ? `Starting amount (increases ${inputs.stepUpPercent}% each year)`
                      : "Fixed amount every month"}
                </p>
              </>
            ) : (
              <div className="text-xl font-bold text-red-400">
                Not Achievable
                <p className="text-sm font-normal text-surface-400 mt-1">
                  {result.sip.message}
                </p>
              </div>
            )}
          </div>

          {/* Key Metrics with explanations */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-surface-300">Calculation Breakdown</h4>
            
            <div className="glass-card p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-surface-400 mb-0.5">Target Corpus at Retirement</p>
                  <p className="text-lg font-bold text-surface-100">
                    {result.corpus.targetCorpus === Infinity 
                      ? "∞" 
                      : formatCurrency(result.corpus.targetCorpus, true)}
                  </p>
                </div>
                <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-1 rounded">
                  Nominal ₹
                </span>
              </div>
              <p className="text-xs text-surface-500 mt-1">
                The total amount you need at Year {inputs.yearsToRetirement} to fund retirement
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="glass-card p-3">
                <p className="text-xs text-surface-400 mb-0.5">Net Rate (Return vs Growth)</p>
                <p className="text-lg font-bold text-accent-400">
                  {result.corpus.realRatePercent.toFixed(2)}%
                </p>
                <p className="text-[10px] text-surface-500">
                  ({inputs.expectedReturnPercent}% return - {inputs.withdrawalGrowthPercent}% spending growth)
                </p>
              </div>
              <div className="glass-card p-3">
                <p className="text-xs text-surface-400 mb-0.5">Monthly at Retirement</p>
                <p className="text-lg font-bold text-surface-100">
                  {formatCurrency(result.corpus.withdrawalAtRetirement, true)}
                </p>
                <p className="text-[10px] text-surface-500">
                  Your ₹{(inputs.monthlyWithdrawalToday/1000).toFixed(0)}K today → inflated
                </p>
              </div>
            </div>

            {result.sip.gap > 0 && (
              <div className="glass-card p-4 bg-amber-500/10 border border-amber-500/20">
                <p className="text-xs text-amber-400 mb-0.5">Gap to Fill with SIP</p>
                <p className="text-lg font-bold text-amber-400">
                  {formatCurrency(result.sip.gap, true)}
                </p>
                <p className="text-xs text-surface-500 mt-1">
                  Your lump sum grows to {formatCurrency(result.sip.lumpSumContribution, true)}, 
                  you need {formatCurrency(result.corpus.targetCorpus, true)}
                </p>
              </div>
            )}
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={!result.sip.isAchievable || result.sip.requiredSIP === 0}
            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Export & See Full Breakdown</span>
          </button>
          <p className="text-xs text-center text-surface-500">
            Populates the main simulator with these values for detailed year-by-year view
          </p>
        </div>
      </div>

      {/* Gap Chart */}
      <div className="glass-card p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-medium text-surface-200">Your Wealth Journey</h3>
            <p className="text-sm text-surface-400 mt-1">
              Red = if you only keep your lump sum | Green = with the recommended SIP
            </p>
          </div>
          <span className="text-[10px] bg-surface-600 text-surface-300 px-2 py-1 rounded">
            Nominal values
          </span>
        </div>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={result.trajectoryData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
              <defs>
                <linearGradient id="currentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="requiredGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              
              <XAxis 
                dataKey="year" 
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={{ stroke: '#334155' }}
                label={{ value: 'Years', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 10 }}
              />
              
              <YAxis 
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={{ stroke: '#334155' }}
                tickFormatter={formatYAxis}
              />
              
              <Tooltip content={<GapChartTooltip />} />
              
              {/* Target line */}
              <ReferenceLine 
                y={result.corpus.targetCorpus} 
                stroke="#f59e0b"
                strokeDasharray="5 5"
                strokeWidth={2}
                label={{
                  value: `Target: ${formatCurrency(result.corpus.targetCorpus, true)}`,
                  position: 'right',
                  fill: '#f59e0b',
                  fontSize: 10
                }}
              />
              
              {/* Current trajectory (lump sum only) */}
              <Area
                type="monotone"
                dataKey="current"
                name="Without SIP"
                stroke="#ef4444"
                strokeWidth={2}
                fill="url(#currentGradient)"
                dot={false}
              />
              
              {/* Required trajectory (with SIP) */}
              <Area
                type="monotone"
                dataKey="required"
                name="With Recommended SIP"
                stroke="#22c55e"
                strokeWidth={2}
                fill="url(#requiredGradient)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 mt-3 text-xs text-surface-400">
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-red-500 rounded" />
            <span>Without SIP (lump sum only)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-green-500 rounded" />
            <span>With Recommended SIP</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-amber-500 rounded border-dashed border border-amber-500" />
            <span>Target Corpus</span>
          </div>
        </div>
      </div>
    </div>
  );
}
