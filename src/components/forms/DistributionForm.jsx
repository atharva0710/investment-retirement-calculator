import { ArrowTrendingDown, BankNotes, TrendingUp, Calculator } from '../layout/icons';

export default function DistributionForm({ values, onChange, disabled, showRealValues }) {
  const handleChange = (field) => (e) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
    onChange({ ...values, [field]: value });
  };

  // Indicator for fields that get inflation-adjusted
  const RealValueBadge = () => showRealValues ? (
    <span className="text-[10px] bg-primary-500/15 text-primary-400 px-1.5 py-0.5 rounded ml-auto">
      Today's ₹
    </span>
  ) : null;

  return (
    <div className={`animate-fade-in ${disabled ? 'opacity-60' : ''}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Initial Monthly Withdrawal */}
        <div className="space-y-2">
          <label className="input-label flex items-center gap-2">
            <BankNotes className="w-4 h-4 text-surface-400" />
            Initial Monthly Withdrawal
            <RealValueBadge />
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 text-sm">₹</span>
            <input
              type="number"
              className="input-field pl-8"
              placeholder="50000"
              value={values.initialMonthlyWithdrawal || ''}
              onChange={handleChange('initialMonthlyWithdrawal')}
              min="0"
              step="5000"
              disabled={disabled}
            />
          </div>
          <p className="text-xs text-surface-500">Monthly withdrawal at retirement start</p>
        </div>

        {/* Withdrawal Growth */}
        <div className="space-y-2">
          <label className="input-label flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-surface-400" />
            Withdrawal Growth
          </label>
          <div className="relative">
            <input
              type="number"
              className="input-field pr-10"
              placeholder="5"
              value={values.withdrawalGrowthPercent || ''}
              onChange={handleChange('withdrawalGrowthPercent')}
              min="0"
              max="15"
              step="0.5"
              disabled={disabled}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 text-sm">%</span>
          </div>
          <p className="text-xs text-surface-500">Annual increase to match inflation</p>
        </div>

        {/* Ongoing SIP */}
        <div className="space-y-2">
          <label className="input-label flex items-center gap-2">
            <Calculator className="w-4 h-4 text-surface-400" />
            Ongoing SIP (Optional)
            <RealValueBadge />
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 text-sm">₹</span>
            <input
              type="number"
              className="input-field pl-8"
              placeholder="0"
              value={values.ongoingMonthlySIP || ''}
              onChange={handleChange('ongoingMonthlySIP')}
              min="0"
              step="1000"
              disabled={disabled}
            />
          </div>
          <p className="text-xs text-surface-500">Continue investing during retirement</p>
        </div>

        {/* SIP Step-Up during Distribution */}
        <div className="space-y-2">
          <label className="input-label flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-surface-400" />
            SIP Annual Step-Up
          </label>
          <div className="relative">
            <input
              type="number"
              className="input-field pr-10"
              placeholder="0"
              value={values.sipStepUpPercent || ''}
              onChange={handleChange('sipStepUpPercent')}
              min="0"
              max="25"
              step="1"
              disabled={disabled || !values.ongoingMonthlySIP}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 text-sm">%</span>
          </div>
          <p className="text-xs text-surface-500">Yearly increase in ongoing SIP</p>
        </div>

        {/* Expected Return during Distribution */}
        <div className="space-y-2 md:col-span-2">
          <label className="input-label flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-surface-400" />
            Expected Return (p.a.)
          </label>
          <div className="relative">
            <input
              type="number"
              className="input-field pr-10"
              placeholder="8"
              value={values.expectedReturnPercent || ''}
              onChange={handleChange('expectedReturnPercent')}
              min="0"
              max="20"
              step="0.5"
              disabled={disabled}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 text-sm">%</span>
          </div>
          <p className="text-xs text-surface-500">Conservative return during retirement</p>
        </div>
      </div>

      {disabled && (
        <div className="mt-5 p-3 bg-surface-700/40 rounded-lg border border-surface-600/30">
          <p className="text-xs text-surface-400 text-center">
            Complete Phase 1 inputs to enable distribution planning
          </p>
        </div>
      )}
    </div>
  );
}
