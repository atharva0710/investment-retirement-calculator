import { Wallet, TrendingUp, Clock, Calculator } from '../layout/icons';

export default function AccumulationForm({ values, onChange }) {
  const handleChange = (field) => (e) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
    onChange({ ...values, [field]: value });
  };

  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Initial Lump Sum */}
        <div className="space-y-2">
          <label className="input-label flex items-center gap-2">
            <Wallet className="w-4 h-4 text-surface-400" />
            Initial Lump Sum
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 text-sm">₹</span>
            <input
              type="number"
              className="input-field pl-8"
              placeholder="0"
              value={values.initialLumpSum || ''}
              onChange={handleChange('initialLumpSum')}
              min="0"
              step="10000"
            />
          </div>
          <p className="text-xs text-surface-500">One-time seed capital</p>
        </div>

        {/* Base Monthly SIP */}
        <div className="space-y-2">
          <label className="input-label flex items-center gap-2">
            <Calculator className="w-4 h-4 text-surface-400" />
            Base Monthly SIP
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 text-sm">₹</span>
            <input
              type="number"
              className="input-field pl-8"
              placeholder="10000"
              value={values.baseMonthlySIP || ''}
              onChange={handleChange('baseMonthlySIP')}
              min="0"
              step="1000"
            />
          </div>
          <p className="text-xs text-surface-500">Monthly investment amount</p>
        </div>

        {/* Annual Step-Up */}
        <div className="space-y-2">
          <label className="input-label flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-surface-400" />
            Annual Step-Up
          </label>
          <div className="relative">
            <input
              type="number"
              className="input-field pr-10"
              placeholder="10"
              value={values.annualStepUpPercent || ''}
              onChange={handleChange('annualStepUpPercent')}
              min="0"
              max="50"
              step="1"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 text-sm">%</span>
          </div>
          <p className="text-xs text-surface-500">Yearly SIP increase rate</p>
        </div>

        {/* Expected Return */}
        <div className="space-y-2">
          <label className="input-label flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-surface-400" />
            Expected Return (p.a.)
          </label>
          <div className="relative">
            <input
              type="number"
              className="input-field pr-10"
              placeholder="12"
              value={values.expectedReturnPercent || ''}
              onChange={handleChange('expectedReturnPercent')}
              min="0"
              max="30"
              step="0.5"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 text-sm">%</span>
          </div>
          <p className="text-xs text-surface-500">Expected annual growth rate</p>
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <label className="input-label flex items-center gap-2">
            <Clock className="w-4 h-4 text-surface-400" />
            Duration
          </label>
          <div className="relative">
            <input
              type="number"
              className="input-field pr-16"
              placeholder="20"
              value={values.durationYears || ''}
              onChange={handleChange('durationYears')}
              min="1"
              max="50"
              step="1"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 text-sm">years</span>
          </div>
          <p className="text-xs text-surface-500">Investment horizon</p>
        </div>

        {/* Inflation Rate */}
        <div className="space-y-2">
          <label className="input-label flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-surface-400" />
            Inflation Rate
          </label>
          <div className="relative">
            <input
              type="number"
              className="input-field pr-10"
              placeholder="6"
              value={values.inflationRatePercent || ''}
              onChange={handleChange('inflationRatePercent')}
              min="0"
              max="15"
              step="0.5"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 text-sm">%</span>
          </div>
          <p className="text-xs text-surface-500">For purchasing power calculation</p>
        </div>
      </div>
    </div>
  );
}
