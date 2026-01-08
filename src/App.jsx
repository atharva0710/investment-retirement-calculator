import { useState, useMemo } from 'react';
import Header from './components/layout/Header';
import TabNavigation from './components/layout/TabNavigation';
import AccumulationForm from './components/forms/AccumulationForm';
import DistributionForm from './components/forms/DistributionForm';
import LifeEventsForm from './components/forms/LifeEventsForm';
import PortfolioChart from './components/charts/PortfolioChart';
import WealthBreakdown from './components/charts/WealthBreakdown';
import MonteCarloResults from './components/charts/MonteCarloResults';
import YearlyBreakdown from './components/tables/YearlyBreakdown';
import GoalFinderTab from './components/goalfinder/GoalFinderTab';
import { 
  calculateFullSimulation, 
  formatCurrency 
} from './utils/calculations';
import { Wallet, TrendingUp, Clock, Sparkles, BankNotes } from './components/layout/icons';

// Default values for inputs
const defaultAccumulation = {
  initialLumpSum: 500000,
  baseMonthlySIP: 25000,
  annualStepUpPercent: 10,
  expectedReturnPercent: 12,
  durationYears: 20,
  inflationRatePercent: 6
};

const defaultDistribution = {
  initialMonthlyWithdrawal: 100000,
  withdrawalGrowthPercent: 5,
  ongoingMonthlySIP: 0,
  sipStepUpPercent: 0,
  expectedReturnPercent: 8
};

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="toggle-switch"
      data-checked={checked}
    >
      <span className="toggle-knob" />
    </button>
  );
}

// Enhanced Stat Components
function HeroStatCard({ label, value, subValue, trend }) {
  return (
    <div className="relative overflow-hidden glass-card p-8 flex flex-col justify-center h-full group">
      <div className="absolute top-0 right-0 p-32 bg-primary-500/10 blur-3xl rounded-full translate-x-12 -translate-y-12 group-hover:bg-primary-500/20 transition-colors duration-500" />
      
      <div className="relative z-10">
        <span className="text-surface-400 font-medium tracking-wide uppercase text-sm mb-2 block">{label}</span>
        <div className="text-5xl md:text-6xl font-bold text-white tracking-tight mb-3">
          {value}
        </div>
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded-lg bg-primary-500/20 text-primary-400 text-sm font-semibold border border-primary-500/20">
            {trend}
          </span>
          <span className="text-surface-400 text-sm">{subValue}</span>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, subValue, className = '' }) {
  return (
    <div className={`glass-card-light p-6 flex flex-col justify-between group hover:bg-surface-800/60 hover:-translate-y-1 transition-all duration-300 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <span className="text-surface-400 font-medium tracking-wide text-sm">{label}</span>
        <div className="p-2 bg-surface-700/50 rounded-lg group-hover:bg-surface-700 transition-colors">
          <Icon className="w-5 h-5 text-primary-400" />
        </div>
      </div>
      <div>
        <div className="text-2xl font-bold text-white mb-1">{value}</div>
        {subValue && <div className="text-xs text-surface-500">{subValue}</div>}
      </div>
    </div>
  );
}

export default function App() {
  const [accumulationParams, setAccumulationParams] = useState(defaultAccumulation);
  const [distributionParams, setDistributionParams] = useState(defaultDistribution);
  const [lifeEvents, setLifeEvents] = useState([]);
  const [showRealValues, setShowRealValues] = useState(false);
  const [activeTab, setActiveTab] = useState('input');

  // Calculate max year for life events (accumulation + potential distribution)
  const maxEventYear = accumulationParams.durationYears + 30;

  // Calculate inflation factor for distribution phase inputs
  const distributionInflationFactor = Math.pow(
    1 + accumulationParams.inflationRatePercent / 100,
    accumulationParams.durationYears
  );

  // Calculate everything based on inputs
  const simulation = useMemo(() => {
    // When "Today's Money" is on, inflate distribution inputs to future values
    let adjustedDistribution = distributionParams;
    
    if (showRealValues) {
      adjustedDistribution = {
        ...distributionParams,
        initialMonthlyWithdrawal: distributionParams.initialMonthlyWithdrawal * distributionInflationFactor,
        ongoingMonthlySIP: distributionParams.ongoingMonthlySIP * distributionInflationFactor,
      };
    }
    
    return calculateFullSimulation(accumulationParams, adjustedDistribution, lifeEvents);
  }, [accumulationParams, distributionParams, lifeEvents, showRealValues, distributionInflationFactor]);

  const { accumulation, distribution, chartData, peakYear, survivalPeriod } = simulation;
  
  // Check if distribution phase is properly configured
  const hasDistribution = distributionParams.initialMonthlyWithdrawal > 0;

  // Format survival period
  const survivalDisplay = useMemo(() => {
    if (!hasDistribution) return '—';
    if (survivalPeriod.isForever) return '∞ Forever';
    if (survivalPeriod.years === 0 && survivalPeriod.months === 0) return '—';
    
    const years = survivalPeriod.years;
    const months = survivalPeriod.months;
    
    if (years === 0) return `${months} months`;
    if (months === 0) return `${years} years`;
    return `${years}y ${months}m`;
  }, [survivalPeriod, hasDistribution]);

  return (
    <div className="min-h-screen pb-12 bg-surface-950 text-surface-100 font-sans selection:bg-primary-500/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-900/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-8 relative z-10">
        {/* Unified Top Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <Header />
          
          <div className="flex items-center gap-6 bg-surface-900/40 p-2 pl-4 pr-2 rounded-2xl border border-white/5 backdrop-blur-md">
             {/* Integrated Toggle */}
            <div className="flex items-center gap-3 mr-2">
              <span className={`text-xs font-medium uppercase tracking-wider ${showRealValues ? 'text-accent-400' : 'text-surface-400'}`}>
                {showRealValues ? "Real Value (Today's ₹)" : "Nominal Value"}
              </span>
              <Toggle checked={showRealValues} onChange={setShowRealValues} />
            </div>
            
            <div className="h-8 w-px bg-white/10" />
            
            <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        </div>
        
        <main className="animate-fade-in">
          {/* Hero KPI Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            {/* Hero Card takes 1/3 or full on mobile - actually let's give it prominence */}
            <div className="lg:col-span-1 h-full min-h-[200px]">
               <HeroStatCard 
                label="Projected Corpus"
                value={formatCurrency(
                  showRealValues 
                    ? accumulation.summary.inflationAdjustedCorpus 
                    : accumulation.summary.finalCorpus, 
                  true
                )}
                trend={`${accumulation.summary.wealthMultiplier.toFixed(2)}x Growth`}
                subValue={showRealValues ? "In today's purchasing power" : "Future value estimation"}
              />
            </div>

            {/* Secondary KPIs Grid */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6">
               <StatCard 
                icon={Wallet}
                label="Total Invested"
                value={formatCurrency(
                  showRealValues 
                    ? accumulation.summary.totalInvested / Math.pow(1 + accumulationParams.inflationRatePercent / 100, accumulationParams.durationYears)
                    : accumulation.summary.totalInvested, 
                  true
                )}
                subValue={`Principal Amount`}
              />
              <StatCard 
                icon={Sparkles}
                label="Wealth Gained"
                value={formatCurrency(
                  showRealValues 
                    ? accumulation.summary.totalGains / Math.pow(1 + accumulationParams.inflationRatePercent / 100, accumulationParams.durationYears)
                    : accumulation.summary.totalGains, 
                  true
                )}
                subValue={`${((accumulation.summary.totalGains / accumulation.summary.totalInvested) * 100).toFixed(0)}% Returns`}
              />
              <StatCard 
                icon={Clock}
                label="Est. Survival"
                value={survivalDisplay}
                subValue={hasDistribution ? "Based on withdrawal rate" : "Configure withdrawl"}
              />
               {/* Note: I only have 3 slots here. The 4th stat "Wealth Gained" is good. "Corpus Survival" is good. 
                   Wait, I have 4 stats in original: Invested, Final, Gained, Survival.
                   I used Final as Hero.
                   So I need 3 secondary.
                   1. Invested
                   2. Gained
                   3. Survival
                   Perfect.
               */}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'input' && (
            <div className="animate-slide-up space-y-8">
              {/* Timeline Container */}
              <div className="glass-panel p-1">
                <div className="grid lg:grid-cols-2 gap-0 relative">
                  
                  {/* Accumulation Phase */}
                  <div className="p-6 lg:p-8 relative">
                    <div className="absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent hidden lg:block" />
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-primary-500/10 rounded-lg text-primary-400">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-semibold text-white">Accumulation Phase</h3>
                    </div>
                    <AccumulationForm 
                      values={accumulationParams} 
                      onChange={setAccumulationParams} 
                    />
                  </div>

                  {/* Distribution Phase */}
                  <div className="p-6 lg:p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-accent-500/10 rounded-lg text-accent-400">
                         <BankNotes className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-semibold text-white">Distribution Phase</h3>
                    </div>
                    <DistributionForm 
                      values={distributionParams} 
                      onChange={setDistributionParams}
                      disabled={accumulation.summary.finalCorpus <= 0}
                      showRealValues={showRealValues}
                    />
                  </div>
                  
                  {/* Connector Icon (Desktop) */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:flex items-center justify-center w-10 h-10 bg-surface-900 border border-white/10 rounded-full shadow-xl z-10 text-surface-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>

                </div>
              </div>

              {/* Life Events */}
              <div className="glass-panel p-6 lg:p-8">
                 <div className="section-title">Life Events</div>
                 <LifeEventsForm 
                  events={lifeEvents}
                  onChange={setLifeEvents}
                  maxYear={maxEventYear}
                />
              </div>
            </div>
          )}

        {activeTab === 'analysis' && (
          <div className="animate-fade-in">
            {/* Charts Section */}
            <div className="grid lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2">
                <PortfolioChart 
                  data={chartData} 
                  transitionYear={hasDistribution ? peakYear : null}
                  showRealValues={showRealValues}
                  inflationRate={accumulationParams.inflationRatePercent / 100}
                />
              </div>
              <div>
                <WealthBreakdown 
                  totalInvested={showRealValues 
                    ? accumulation.summary.totalInvested / Math.pow(1 + accumulationParams.inflationRatePercent / 100, accumulationParams.durationYears)
                    : accumulation.summary.totalInvested
                  }
                  totalGains={showRealValues 
                    ? accumulation.summary.totalGains / Math.pow(1 + accumulationParams.inflationRatePercent / 100, accumulationParams.durationYears)
                    : accumulation.summary.totalGains
                  }
                  showRealValues={showRealValues}
                />
              </div>
            </div>

            {/* Monte Carlo Analysis */}
            {hasDistribution && (
              <MonteCarloResults
                accumulationParams={accumulationParams}
                distributionParams={showRealValues ? {
                  ...distributionParams,
                  initialMonthlyWithdrawal: distributionParams.initialMonthlyWithdrawal * distributionInflationFactor,
                  ongoingMonthlySIP: distributionParams.ongoingMonthlySIP * distributionInflationFactor,
                } : distributionParams}
              />
            )}

            {/* Distribution Summary */}
            {hasDistribution && distribution.yearlyData.length > 0 && (
              <div className="mt-6 glass-card p-6">
                <div className="section-title mb-4">
                  <div className="p-2 bg-accent-500/15 rounded-lg">
                    <BankNotes className="w-5 h-5 text-accent-400" />
                  </div>
                  <span>Distribution Phase Summary</span>
                </div>
                
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="p-4 bg-surface-700/40 rounded-lg">
                    <p className="text-sm text-surface-400 mb-1">Total Withdrawn</p>
                    <p className="text-xl font-bold text-surface-100">
                      {formatCurrency(distribution.summary.totalWithdrawn, true)}
                    </p>
                  </div>
                  <div className="p-4 bg-surface-700/40 rounded-lg">
                    <p className="text-sm text-surface-400 mb-1">Final Balance</p>
                    <p className={`text-xl font-bold ${distribution.summary.finalBalance > 0 ? 'text-primary-400' : 'text-red-400'}`}>
                      {formatCurrency(distribution.summary.finalBalance, true)}
                    </p>
                  </div>
                  <div className="p-4 bg-surface-700/40 rounded-lg">
                    <p className="text-sm text-surface-400 mb-1">Withdrawal Rate</p>
                    <p className="text-xl font-bold text-surface-100">
                      {((distributionParams.initialMonthlyWithdrawal * 12 / accumulation.summary.finalCorpus) * 100).toFixed(2)}%
                    </p>
                    <p className="text-xs text-surface-500">Annual (initial)</p>
                  </div>
                </div>

                {survivalPeriod.isForever && (
                  <div className="mt-4 p-3 bg-primary-500/10 rounded-lg border border-primary-500/20">
                    <p className="text-sm text-primary-400">
                      Your corpus is likely to last indefinitely at this withdrawal rate.
                    </p>
                  </div>
                )}

                {!survivalPeriod.isForever && survivalPeriod.years < 20 && survivalPeriod.years > 0 && (
                  <div className="mt-4 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                    <p className="text-sm text-amber-400">
                      Your corpus may deplete in {survivalPeriod.years} years. Consider adjusting your withdrawal.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'details' && (
          <div className="animate-fade-in">
            <YearlyBreakdown 
              data={[...accumulation.yearlyData, ...(hasDistribution ? distribution.yearlyData : [])]}
              transitionYear={peakYear}
              showRealValues={showRealValues}
            />
          </div>
        )}

        {activeTab === 'goal' && (
          <GoalFinderTab 
            onExportToSimulator={(params) => {
              setAccumulationParams(params.accumulation);
              setDistributionParams(params.distribution);
              setActiveTab('input');
            }}
          />
        )}

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-surface-500">
          <p>
            This simulator provides estimates for educational purposes only. 
            Actual returns may vary. Consult a financial advisor.
          </p>
        </footer>
      </main>
      </div>
    </div>
  );
}
