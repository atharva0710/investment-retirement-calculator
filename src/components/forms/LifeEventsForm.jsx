import { useState } from 'react';
import { Sparkles, TrendingUp, ArrowTrendingDown } from '../layout/icons';
import { formatCurrency } from '../../utils/calculations';

// Preset event labels
const PRESETS = {
  withdrawal: ['House', 'Car', 'Wedding', 'Education', 'Medical', 'Travel', 'Other'],
  addition: ['Bonus', 'Inheritance', 'Gift', 'Sale Proceeds', 'Insurance', 'Other']
};

function PlusIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function TrashIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

export default function LifeEventsForm({ events, onChange, maxYear }) {
  const addEvent = (type) => {
    const newEvent = {
      id: Date.now(),
      year: Math.min(10, maxYear),
      amount: type === 'withdrawal' ? 2000000 : 500000,
      type,
      label: type === 'withdrawal' ? 'House' : 'Bonus'
    };
    onChange([...events, newEvent]);
  };

  const updateEvent = (id, field, value) => {
    onChange(events.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const removeEvent = (id) => {
    onChange(events.filter(e => e.id !== id));
  };

  const withdrawalEvents = events.filter(e => e.type === 'withdrawal');
  const additionEvents = events.filter(e => e.type === 'addition');

  const totalWithdrawals = withdrawalEvents.reduce((sum, e) => sum + e.amount, 0);
  const totalAdditions = additionEvents.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="glass-card p-6 md:p-8 animate-fade-in">
      <div className="section-title mb-4">
        <div className="p-2 bg-amber-500/20 rounded-lg">
          <Sparkles className="w-5 h-5 text-amber-400" />
        </div>
        <span>Life Events</span>
      </div>
      
      <p className="text-surface-400 text-sm mb-6">
        Add major financial events like house purchase, inheritance, bonuses, etc.
      </p>

      {/* Summary Stats */}
      {events.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-xs text-red-400 mb-1">Total Withdrawals</p>
            <p className="text-lg font-bold text-red-400">
              {formatCurrency(totalWithdrawals, true)}
            </p>
            <p className="text-xs text-surface-500">{withdrawalEvents.length} event(s)</p>
          </div>
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
            <p className="text-xs text-green-400 mb-1">Total Additions</p>
            <p className="text-lg font-bold text-green-400">
              {formatCurrency(totalAdditions, true)}
            </p>
            <p className="text-xs text-surface-500">{additionEvents.length} event(s)</p>
          </div>
        </div>
      )}

      {/* Event List */}
      <div className="space-y-3 mb-6">
        {events.length === 0 ? (
          <div className="text-center py-6 bg-surface-700/20 rounded-xl border border-dashed border-surface-600/50">
            <Sparkles className="w-8 h-8 mx-auto mb-2 text-surface-500" />
            <p className="text-surface-400 text-sm">No life events added yet</p>
            <p className="text-surface-500 text-xs mt-1">Add events using the buttons below</p>
          </div>
        ) : (
          events.map((event) => (
            <div 
              key={event.id}
              className={`p-4 rounded-xl border ${
                event.type === 'withdrawal' 
                  ? 'bg-red-500/5 border-red-500/20' 
                  : 'bg-green-500/5 border-green-500/20'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Type Icon */}
                <div className={`p-2 rounded-lg ${
                  event.type === 'withdrawal' ? 'bg-red-500/20' : 'bg-green-500/20'
                }`}>
                  {event.type === 'withdrawal' 
                    ? <ArrowTrendingDown className="w-4 h-4 text-red-400" />
                    : <TrendingUp className="w-4 h-4 text-green-400" />
                  }
                </div>

                {/* Event Details */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Year */}
                  <div>
                    <label className="text-xs text-surface-400 mb-1 block">Year</label>
                    <select
                      value={event.year}
                      onChange={(e) => updateEvent(event.id, 'year', parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-surface-800/60 border border-surface-600/50 rounded-lg text-sm text-surface-200 focus:outline-none focus:ring-1 focus:ring-accent-500/50"
                    >
                      {Array.from({ length: maxYear }, (_, i) => i + 1).map(year => (
                        <option key={year} value={year}>Year {year}</option>
                      ))}
                    </select>
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="text-xs text-surface-400 mb-1 block">Amount</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 text-sm">₹</span>
                      <input
                        type="number"
                        value={event.amount}
                        onChange={(e) => updateEvent(event.id, 'amount', Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full pl-7 pr-3 py-2 bg-surface-800/60 border border-surface-600/50 rounded-lg text-sm text-surface-200 focus:outline-none focus:ring-1 focus:ring-accent-500/50"
                        min="0"
                        step="100000"
                      />
                    </div>
                  </div>

                  {/* Label */}
                  <div>
                    <label className="text-xs text-surface-400 mb-1 block">Label</label>
                    <select
                      value={event.label}
                      onChange={(e) => updateEvent(event.id, 'label', e.target.value)}
                      className="w-full px-3 py-2 bg-surface-800/60 border border-surface-600/50 rounded-lg text-sm text-surface-200 focus:outline-none focus:ring-1 focus:ring-accent-500/50"
                    >
                      {PRESETS[event.type].map(label => (
                        <option key={label} value={label}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => removeEvent(event.id)}
                  className="p-2 text-surface-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Remove event"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => addEvent('withdrawal')}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors text-sm font-medium"
        >
          <ArrowTrendingDown className="w-4 h-4" />
          Add Withdrawal
        </button>
        <button
          onClick={() => addEvent('addition')}
          className="flex items-center gap-2 px-4 py-2.5 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl hover:bg-green-500/20 transition-colors text-sm font-medium"
        >
          <PlusIcon className="w-4 h-4" />
          Add Lump Sum
        </button>
      </div>

      {/* Info Note */}
      <p className="mt-4 text-xs text-surface-500">
        💡 Events are applied at the start of each specified year
      </p>
    </div>
  );
}
