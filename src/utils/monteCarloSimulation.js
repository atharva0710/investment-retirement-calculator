/**
 * Monte Carlo Simulation for Retirement Planning
 * Runs multiple simulations with randomized returns to calculate probability of success
 */

/**
 * Generate a random return using Box-Muller transform for normal distribution
 * @param {number} mean - Expected return (e.g., 0.12 for 12%)
 * @param {number} stdDev - Volatility/standard deviation (e.g., 0.05 for 5%)
 * @returns {number} Random return
 */
function randomNormalReturn(mean, stdDev) {
  // Box-Muller transform for normal distribution
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * stdDev;
}

/**
 * Run a single simulation of the retirement plan
 * @param {Object} accumulationParams - Phase 1 parameters
 * @param {Object} distributionParams - Phase 2 parameters
 * @param {number} volatility - Standard deviation of returns (e.g., 0.05)
 * @param {number} targetSurvivalYears - Target years for retirement
 * @returns {Object} Simulation result with yearly balances and success status
 */
function runSingleSimulation(accumulationParams, distributionParams, volatility, targetSurvivalYears) {
  const {
    initialLumpSum,
    baseMonthlySIP,
    annualStepUpPercent,
    expectedReturnPercent,
    durationYears
  } = accumulationParams;

  const {
    initialMonthlyWithdrawal,
    withdrawalGrowthPercent,
    ongoingMonthlySIP,
    sipStepUpPercent,
    expectedReturnPercent: distReturnPercent
  } = distributionParams;

  const stepUpRate = annualStepUpPercent / 100;
  const withdrawalGrowthRate = withdrawalGrowthPercent / 100;
  const distSipStepUpRate = (sipStepUpPercent || 0) / 100;
  
  const yearlyBalances = [];
  let balance = initialLumpSum;
  let currentSIP = baseMonthlySIP;

  // Accumulation Phase
  for (let year = 1; year <= durationYears; year++) {
    // Random return for this year
    const annualReturn = randomNormalReturn(expectedReturnPercent / 100, volatility);
    const monthlyRate = Math.max(0, annualReturn) / 12; // Prevent negative monthly rates

    for (let month = 1; month <= 12; month++) {
      balance = balance * (1 + monthlyRate) + currentSIP;
    }
    
    yearlyBalances.push({
      year,
      phase: 'accumulation',
      balance,
      annualReturn: annualReturn * 100
    });

    currentSIP = currentSIP * (1 + stepUpRate);
  }

  const corpusAtRetirement = balance;

  // Distribution Phase
  let currentWithdrawal = initialMonthlyWithdrawal;
  let currentDistSIP = ongoingMonthlySIP || 0;
  let survivalYears = 0;
  let survived = true;

  for (let year = 1; year <= targetSurvivalYears; year++) {
    const absoluteYear = durationYears + year;
    
    // Random return for distribution phase
    const annualReturn = randomNormalReturn(distReturnPercent / 100, volatility);
    const monthlyRate = annualReturn / 12;

    for (let month = 1; month <= 12; month++) {
      if (balance <= 0) {
        survived = false;
        break;
      }

      balance = balance * (1 + monthlyRate);
      balance += currentDistSIP;
      balance -= currentWithdrawal;

      if (balance <= 0) {
        balance = 0;
        survived = false;
        break;
      }
    }

    yearlyBalances.push({
      year: absoluteYear,
      phase: 'distribution',
      balance: Math.max(0, balance),
      annualReturn: annualReturn * 100
    });

    if (!survived) {
      survivalYears = year - 1;
      break;
    }

    survivalYears = year;
    currentWithdrawal = currentWithdrawal * (1 + withdrawalGrowthRate);
    currentDistSIP = currentDistSIP * (1 + distSipStepUpRate);
  }

  return {
    yearlyBalances,
    corpusAtRetirement,
    finalBalance: balance,
    survivalYears,
    survived: survived && balance > 0,
    targetYears: targetSurvivalYears
  };
}

/**
 * Run Monte Carlo simulation with multiple scenarios
 * @param {Object} accumulationParams - Phase 1 parameters
 * @param {Object} distributionParams - Phase 2 parameters
 * @param {Object} options - Simulation options
 * @returns {Object} Aggregated results with success rate and percentiles
 */
export function runMonteCarloSimulation(
  accumulationParams,
  distributionParams,
  options = {}
) {
  const {
    numSimulations = 100,
    volatility = 0.05, // 5% standard deviation
    targetSurvivalYears = 30
  } = options;

  const results = [];
  
  for (let i = 0; i < numSimulations; i++) {
    const result = runSingleSimulation(
      accumulationParams,
      distributionParams,
      volatility,
      targetSurvivalYears
    );
    results.push(result);
  }

  // Calculate success rate
  const successfulRuns = results.filter(r => r.survived).length;
  const successRate = (successfulRuns / numSimulations) * 100;

  // Calculate percentiles for each year
  const totalYears = accumulationParams.durationYears + targetSurvivalYears;
  const percentileData = [];

  for (let yearIdx = 0; yearIdx < totalYears; yearIdx++) {
    const balancesAtYear = results
      .map(r => r.yearlyBalances[yearIdx]?.balance || 0)
      .sort((a, b) => a - b);

    const p10Index = Math.floor(numSimulations * 0.1);
    const p25Index = Math.floor(numSimulations * 0.25);
    const p50Index = Math.floor(numSimulations * 0.5);
    const p75Index = Math.floor(numSimulations * 0.75);
    const p90Index = Math.floor(numSimulations * 0.9);

    const yearNum = yearIdx + 1;
    const phase = yearNum <= accumulationParams.durationYears ? 'accumulation' : 'distribution';

    percentileData.push({
      year: yearNum,
      phase,
      p10: balancesAtYear[p10Index] || 0,
      p25: balancesAtYear[p25Index] || 0,
      p50: balancesAtYear[p50Index] || 0, // Median
      p75: balancesAtYear[p75Index] || 0,
      p90: balancesAtYear[p90Index] || 0,
      min: balancesAtYear[0] || 0,
      max: balancesAtYear[numSimulations - 1] || 0
    });
  }

  // Calculate average survival years for failed runs
  const failedRuns = results.filter(r => !r.survived);
  const avgFailedSurvival = failedRuns.length > 0
    ? failedRuns.reduce((sum, r) => sum + r.survivalYears, 0) / failedRuns.length
    : targetSurvivalYears;

  // Calculate corpus at retirement statistics
  const corpusValues = results.map(r => r.corpusAtRetirement).sort((a, b) => a - b);
  const corpusP10 = corpusValues[Math.floor(numSimulations * 0.1)];
  const corpusP50 = corpusValues[Math.floor(numSimulations * 0.5)];
  const corpusP90 = corpusValues[Math.floor(numSimulations * 0.9)];

  return {
    successRate,
    numSimulations,
    successfulRuns,
    failedRuns: numSimulations - successfulRuns,
    targetSurvivalYears,
    avgFailedSurvival: Math.round(avgFailedSurvival * 10) / 10,
    percentileData,
    corpusStats: {
      p10: corpusP10,
      p50: corpusP50,
      p90: corpusP90
    },
    volatility: volatility * 100
  };
}
