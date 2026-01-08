/**
 * Financial calculation utilities for the Investment & Retirement Simulator
 */

/**
 * Format number as Indian currency (₹)
 * @param {number} value - The number to format
 * @param {boolean} compact - Whether to use compact notation (Cr, L, K)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(value, compact = false) {
  if (value === null || value === undefined || isNaN(value)) return '₹0';
  
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  
  if (compact) {
    if (absValue >= 10000000) {
      return `${sign}₹${(absValue / 10000000).toFixed(2)} Cr`;
    } else if (absValue >= 100000) {
      return `${sign}₹${(absValue / 100000).toFixed(2)} L`;
    } else if (absValue >= 1000) {
      return `${sign}₹${(absValue / 1000).toFixed(2)} K`;
    }
  }
  
  return `${sign}₹${absValue.toLocaleString('en-IN', { 
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  })}`;
}

/**
 * Format percentage with specified decimals
 * @param {number} value - The percentage value
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage string
 */
export function formatPercentage(value, decimals = 1) {
  if (value === null || value === undefined || isNaN(value)) return '0%';
  return `${value.toFixed(decimals)}%`;
}

/**
 * Calculate real rate of return using exact Fisher Equation
 * Real Rate = (1 + nominal) / (1 + inflation) - 1
 * @param {number} nominalRatePercent - Nominal rate as percentage
 * @param {number} inflationRatePercent - Inflation rate as percentage
 * @returns {number} Real rate as percentage
 */
export function calculateRealRate(nominalRatePercent, inflationRatePercent) {
  const nominal = nominalRatePercent / 100;
  const inflation = inflationRatePercent / 100;
  const realRate = ((1 + nominal) / (1 + inflation)) - 1;
  return realRate * 100;
}

/**
 * Calculate the accumulation phase (Phase 1)
 * @param {Object} params - Accumulation parameters
 * @param {Array} lifeEvents - Array of life events [{year, amount, type, label}]
 * @returns {Object} Yearly breakdown and summary
 */
export function calculateAccumulationPhase({
  initialLumpSum = 0,
  baseMonthlySIP = 0,
  annualStepUpPercent = 0,
  expectedReturnPercent = 12,
  durationYears = 10,
  inflationRatePercent = 6
}, lifeEvents = []) {
  const monthlyRate = expectedReturnPercent / 100 / 12;
  const stepUpRate = annualStepUpPercent / 100;
  const inflationRate = inflationRatePercent / 100;
  
  const yearlyData = [];
  let balance = initialLumpSum;
  let totalInvested = initialLumpSum;
  let currentSIP = baseMonthlySIP;
  
  for (let year = 1; year <= durationYears; year++) {
    const openingBalance = balance;
    let yearlyContribution = 0;
    let yearlyInterest = 0;
    let lifeEventAmount = 0;
    let lifeEventLabel = null;
    let lifeEventType = null;
    
    // Apply life events at the start of the year
    const yearEvents = lifeEvents.filter(e => e.year === year);
    yearEvents.forEach(event => {
      if (event.type === 'addition') {
        balance += event.amount;
        totalInvested += event.amount;
        lifeEventAmount += event.amount;
      } else if (event.type === 'withdrawal') {
        balance = Math.max(0, balance - event.amount);
        lifeEventAmount -= event.amount;
      }
      lifeEventLabel = event.label;
      lifeEventType = event.type;
    });
    
    // Calculate monthly for this year
    for (let month = 1; month <= 12; month++) {
      const interestThisMonth = balance * monthlyRate;
      yearlyInterest += interestThisMonth;
      balance += interestThisMonth;
      balance += currentSIP;
      yearlyContribution += currentSIP;
    }
    
    totalInvested += yearlyContribution;
    
    // Calculate inflation-adjusted value
    const inflationFactor = Math.pow(1 + inflationRate, year);
    const realValue = balance / inflationFactor;
    
    yearlyData.push({
      year,
      phase: 'accumulation',
      openingBalance,
      contribution: yearlyContribution,
      interestEarned: yearlyInterest,
      withdrawal: 0,
      closingBalance: balance,
      totalInvested,
      sipAmount: currentSIP,
      realValue,
      inflationFactor,
      lifeEvent: lifeEventAmount !== 0 ? { amount: lifeEventAmount, label: lifeEventLabel, type: lifeEventType } : null
    });
    
    // Apply step-up for next year
    currentSIP = currentSIP * (1 + stepUpRate);
  }
  
  const finalCorpus = balance;
  const totalGains = finalCorpus - totalInvested;
  const inflationAdjustedCorpus = finalCorpus / Math.pow(1 + inflationRate, durationYears);
  const wealthMultiplier = totalInvested > 0 ? finalCorpus / totalInvested : 0;
  
  return {
    yearlyData,
    summary: {
      totalInvested,
      finalCorpus,
      totalGains,
      inflationAdjustedCorpus,
      wealthMultiplier,
      durationYears
    }
  };
}

/**
 * Calculate the distribution phase (Phase 2 - SWP)
 * @param {Object} params - Distribution parameters
 * @param {number} startingCorpus - Corpus from accumulation phase
 * @param {number} accumulationYears - Years completed in accumulation
 * @param {number} inflationRatePercent - Inflation rate for real value calculation
 * @param {Array} lifeEvents - Array of life events [{year, amount, type, label}]
 * @returns {Object} Yearly breakdown and survival analysis
 */
export function calculateDistributionPhase({
  initialMonthlyWithdrawal = 0,
  withdrawalGrowthPercent = 0,
  ongoingMonthlySIP = 0,
  sipStepUpPercent = 0,
  expectedReturnPercent = 8,
  maxYears = 50
}, startingCorpus, accumulationYears = 0, inflationRatePercent = 6, lifeEvents = []) {
  if (startingCorpus <= 0 || initialMonthlyWithdrawal <= 0) {
    return { yearlyData: [], survivalPeriod: { years: 0, months: 0, isForever: false } };
  }
  
  const monthlyRate = expectedReturnPercent / 100 / 12;
  const withdrawalGrowthRate = withdrawalGrowthPercent / 100;
  const sipStepUpRate = sipStepUpPercent / 100;
  const inflationRate = inflationRatePercent / 100;
  
  const yearlyData = [];
  let balance = startingCorpus;
  let currentWithdrawal = initialMonthlyWithdrawal;
  let currentSIP = ongoingMonthlySIP;
  let totalWithdrawn = 0;
  let totalContributed = 0;
  let survivalMonths = 0;
  let isForever = false;
  
  for (let year = 1; year <= maxYears; year++) {
    const absoluteYear = accumulationYears + year;
    const openingBalance = balance;
    let yearlyWithdrawal = 0;
    let yearlyContribution = 0;
    let yearlyInterest = 0;
    let monthsThisYear = 0;
    let lifeEventAmount = 0;
    let lifeEventLabel = null;
    let lifeEventType = null;
    
    // Apply life events at the start of the year
    const yearEvents = lifeEvents.filter(e => e.year === absoluteYear);
    yearEvents.forEach(event => {
      if (event.type === 'addition') {
        balance += event.amount;
        totalContributed += event.amount;
        lifeEventAmount += event.amount;
      } else if (event.type === 'withdrawal') {
        balance = Math.max(0, balance - event.amount);
        lifeEventAmount -= event.amount;
      }
      lifeEventLabel = event.label;
      lifeEventType = event.type;
    });
    
    for (let month = 1; month <= 12; month++) {
      if (balance <= 0) break;
      
      // Apply interest
      const interestThisMonth = balance * monthlyRate;
      yearlyInterest += interestThisMonth;
      balance += interestThisMonth;
      
      // Add ongoing SIP
      balance += currentSIP;
      yearlyContribution += currentSIP;
      
      // Subtract withdrawal
      const withdrawalAmount = Math.min(currentWithdrawal, balance);
      balance -= withdrawalAmount;
      yearlyWithdrawal += withdrawalAmount;
      
      monthsThisYear++;
      survivalMonths++;
      
      if (balance <= 0) {
        balance = 0;
        break;
      }
    }
    
    totalWithdrawn += yearlyWithdrawal;
    totalContributed += yearlyContribution;
    
    // Calculate real value
    const inflationFactor = Math.pow(1 + inflationRate, absoluteYear);
    const realValue = balance / inflationFactor;
    
    yearlyData.push({
      year: absoluteYear,
      phase: 'distribution',
      openingBalance,
      contribution: yearlyContribution,
      interestEarned: yearlyInterest,
      withdrawal: yearlyWithdrawal,
      closingBalance: balance,
      totalInvested: totalContributed,
      withdrawalAmount: currentWithdrawal,
      realValue,
      inflationFactor,
      lifeEvent: lifeEventAmount !== 0 ? { amount: lifeEventAmount, label: lifeEventLabel, type: lifeEventType } : null
    });
    
    if (balance <= 0) break;
    
    // Check if corpus is growing (withdrawal rate < return rate)
    // Removed premature check. We now check at the end of simulation.
    // if (year > 5 && yearlyInterest > yearlyWithdrawal) {
    //   isForever = true;
    //   // Continue for a few more years to show the trend
    //   if (year >= 30) break;
    // }
    
    // Apply withdrawal growth for next year
    currentWithdrawal = currentWithdrawal * (1 + withdrawalGrowthRate);
    
    // Apply SIP step-up for next year
    currentSIP = currentSIP * (1 + sipStepUpRate);
  }
  
  // If loop completed maxYears and we still have balance, it's considered 'Forever'
  if (balance > 0 && survivalMonths >= maxYears * 12) {
    isForever = true;
  }
  
  const survivalYears = Math.floor(survivalMonths / 12);
  const remainingMonths = survivalMonths % 12;
  
  return {
    yearlyData,
    survivalPeriod: {
      years: survivalYears,
      months: remainingMonths,
      totalMonths: survivalMonths,
      isForever
    },
    summary: {
      totalWithdrawn,
      totalContributed,
      finalBalance: balance
    }
  };
}

/**
 * Combine accumulation and distribution phases
 * @param {Object} accumulationParams - Phase 1 parameters
 * @param {Object} distributionParams - Phase 2 parameters
 * @param {Array} lifeEvents - Array of life events [{year, amount, type, label}]
 * @returns {Object} Combined data for charts and tables
 */
export function calculateFullSimulation(accumulationParams, distributionParams, lifeEvents = []) {
  // Split life events by phase
  const accumulationEvents = lifeEvents.filter(e => e.year <= accumulationParams.durationYears);
  const distributionEvents = lifeEvents.filter(e => e.year > accumulationParams.durationYears);
  
  const accumulation = calculateAccumulationPhase(accumulationParams, accumulationEvents);
  
  const distribution = calculateDistributionPhase(
    distributionParams,
    accumulation.summary.finalCorpus,
    accumulationParams.durationYears,
    accumulationParams.inflationRatePercent,
    distributionEvents
  );
  
  // Combine yearly data
  const combinedData = [
    ...accumulation.yearlyData,
    ...distribution.yearlyData
  ];
  
  // Create chart data
  const chartData = [
    {
      year: 0,
      totalInvested: accumulationParams.initialLumpSum,
      portfolioValue: accumulationParams.initialLumpSum,
      phase: 'accumulation',
      lifeEvent: null
    },
    ...combinedData.map(row => ({
      year: row.year,
      totalInvested: row.phase === 'accumulation' ? row.totalInvested : accumulation.summary.totalInvested,
      portfolioValue: row.closingBalance,
      realValue: row.realValue,
      phase: row.phase,
      lifeEvent: row.lifeEvent
    }))
  ];
  
  // Peak corpus (transition point)
  const peakCorpus = accumulation.summary.finalCorpus;
  const peakYear = accumulationParams.durationYears;
  
  return {
    accumulation,
    distribution,
    combinedData,
    chartData,
    peakCorpus,
    peakYear,
    survivalPeriod: distribution.survivalPeriod,
    lifeEvents
  };
}

/**
 * Adjust values for inflation (show in "Today's Money")
 * @param {Array} data - Array of yearly data
 * @param {number} inflationRate - Annual inflation rate (as decimal)
 * @returns {Array} Data with real values
 */
export function adjustForInflation(data, inflationRate) {
  return data.map((row, index) => ({
    ...row,
    adjustedClosingBalance: row.closingBalance / Math.pow(1 + inflationRate, row.year),
    adjustedWithdrawal: row.withdrawal / Math.pow(1 + inflationRate, row.year)
  }));
}
