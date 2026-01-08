/**
 * Goal Finder calculations for reverse SIP planning
 * Calculate the required monthly SIP to achieve a retirement corpus
 */

import { calculateRealRate } from './calculations';

/**
 * Calculate target corpus needed for sustainable withdrawals
 * @param {Object} params - Parameters for calculation
 * @returns {Object} Target corpus and related calculations
 */
export function calculateTargetCorpus({
  monthlyWithdrawalToday,
  expectedReturnPercent,
  inflationPercent,
  withdrawalGrowthPercent,  // Post-retirement spending growth
  yearsToRetirement,
  sustainForever = true,
  sustainYears = 30
}) {
  // Post-retirement rates
  const nominalReturn = expectedReturnPercent / 100;
  const withdrawalGrowth = withdrawalGrowthPercent / 100;
  
  // Calculate real rate using Fisher equation (return vs withdrawal growth)
  // This is the net rate after accounting for growing withdrawals
  const realRatePercent = ((1 + nominalReturn) / (1 + withdrawalGrowth) - 1) * 100;
  const realRate = realRatePercent / 100;
  
  // Inflate the withdrawal to retirement year value (using pre-retirement inflation)
  const inflationRate = inflationPercent / 100;
  const withdrawalAtRetirement = monthlyWithdrawalToday * Math.pow(1 + inflationRate, yearsToRetirement);
  const annualWithdrawal = withdrawalAtRetirement * 12;
  
  let targetCorpus;
  
  if (sustainForever) {
    // Perpetuity formula with growing payments: Corpus = Annual Withdrawal / (Real Rate)
    // Where Real Rate = (1 + return) / (1 + growth) - 1
    if (realRate <= 0) {
      // If real rate is zero or negative, perpetuity is impossible
      targetCorpus = Infinity;
    } else {
      targetCorpus = annualWithdrawal / realRate;
    }
  } else {
    // Growing annuity formula for X years
    if (Math.abs(realRate) < 0.0001) {
      // When real rate is near zero
      targetCorpus = annualWithdrawal * sustainYears;
    } else {
      // PV of growing annuity = PMT × [1 - ((1+g)/(1+r))^n] / (r-g)
      targetCorpus = annualWithdrawal * (1 - Math.pow(1 + realRate, -sustainYears)) / realRate;
    }
  }
  
  return {
    targetCorpus,
    realRatePercent,
    withdrawalAtRetirement,
    annualWithdrawal,
    withdrawalGrowthPercent,
    sustainForever,
    sustainYears
  };
}

/**
 * Calculate future value of lump sum + SIP with step-up
 * @param {Object} params - Parameters
 * @returns {number} Future value at end of accumulation
 */
export function calculateFutureValue({
  lumpSum,
  monthlySIP,
  stepUpPercent,
  expectedReturnPercent,
  years
}) {
  const monthlyRate = expectedReturnPercent / 100 / 12;
  const stepUpRate = stepUpPercent / 100;
  
  let balance = lumpSum;
  let currentSIP = monthlySIP;
  
  for (let year = 1; year <= years; year++) {
    for (let month = 1; month <= 12; month++) {
      balance = balance * (1 + monthlyRate) + currentSIP;
    }
    // Apply step-up for next year
    currentSIP = currentSIP * (1 + stepUpRate);
  }
  
  return balance;
}

/**
 * Solve for required starting SIP using binary search
 * @param {Object} params - Parameters for calculation
 * @returns {Object} Required SIP and calculation details
 */
export function calculateRequiredSIP({
  currentLumpSum,
  targetCorpus,
  expectedReturnPercent,
  stepUpPercent,
  yearsToRetirement
}) {
  // Handle edge cases
  if (targetCorpus === Infinity) {
    return {
      requiredSIP: Infinity,
      isAchievable: false,
      message: "Real rate is zero or negative. Perpetual income not possible."
    };
  }
  
  // Calculate what lump sum alone grows to
  const lumpSumFV = calculateFutureValue({
    lumpSum: currentLumpSum,
    monthlySIP: 0,
    stepUpPercent: 0,
    expectedReturnPercent,
    years: yearsToRetirement
  });
  
  // If lump sum already exceeds target
  if (lumpSumFV >= targetCorpus) {
    return {
      requiredSIP: 0,
      isAchievable: true,
      surplus: lumpSumFV - targetCorpus,
      message: "Your current lump sum is sufficient! No additional SIP needed."
    };
  }
  
  // Binary search for required SIP
  let low = 0;
  let high = targetCorpus / 12; // Max reasonable SIP
  let requiredSIP = 0;
  const tolerance = 100; // ₹100 tolerance
  
  for (let i = 0; i < 100; i++) { // Max 100 iterations
    const mid = (low + high) / 2;
    
    const futureValue = calculateFutureValue({
      lumpSum: currentLumpSum,
      monthlySIP: mid,
      stepUpPercent,
      expectedReturnPercent,
      years: yearsToRetirement
    });
    
    if (Math.abs(futureValue - targetCorpus) < tolerance) {
      requiredSIP = mid;
      break;
    }
    
    if (futureValue < targetCorpus) {
      low = mid;
    } else {
      high = mid;
    }
    
    requiredSIP = mid;
  }
  
  // Verify the result
  const verifyFV = calculateFutureValue({
    lumpSum: currentLumpSum,
    monthlySIP: requiredSIP,
    stepUpPercent,
    expectedReturnPercent,
    years: yearsToRetirement
  });
  
  return {
    requiredSIP: Math.ceil(requiredSIP),
    isAchievable: true,
    projectedCorpus: verifyFV,
    gap: targetCorpus - lumpSumFV,
    lumpSumContribution: lumpSumFV,
    message: "SIP calculated successfully"
  };
}

/**
 * Main goal finder function combining all calculations
 * @param {Object} params - All input parameters
 * @returns {Object} Complete goal finder results
 */
export function findRetirementGoal({
  yearsToRetirement,
  currentLumpSum,
  monthlyWithdrawalToday,
  expectedReturnPercent,
  inflationPercent,
  withdrawalGrowthPercent = 6, // Post-retirement spending growth
  stepUpPercent = 0,
  sustainForever = true,
  sustainYears = 30
}) {
  // Step 1: Calculate target corpus
  const corpusResult = calculateTargetCorpus({
    monthlyWithdrawalToday,
    expectedReturnPercent,
    inflationPercent,
    withdrawalGrowthPercent,
    yearsToRetirement,
    sustainForever,
    sustainYears
  });
  
  // Step 2: Calculate required SIP
  const sipResult = calculateRequiredSIP({
    currentLumpSum,
    targetCorpus: corpusResult.targetCorpus,
    expectedReturnPercent,
    stepUpPercent,
    yearsToRetirement
  });
  
  // Step 3: Generate trajectory data for chart
  const trajectoryData = [];
  const monthlyRate = expectedReturnPercent / 100 / 12;
  const stepUpRate = stepUpPercent / 100;
  
  let currentBalance = currentLumpSum;
  let requiredBalance = currentLumpSum;
  let currentSIPAmount = sipResult.requiredSIP;
  
  trajectoryData.push({
    year: 0,
    current: currentLumpSum,
    required: currentLumpSum,
    target: corpusResult.targetCorpus
  });
  
  for (let year = 1; year <= yearsToRetirement; year++) {
    // Current trajectory (lump sum only)
    for (let m = 1; m <= 12; m++) {
      currentBalance = currentBalance * (1 + monthlyRate);
    }
    
    // Required trajectory (with SIP)
    for (let m = 1; m <= 12; m++) {
      requiredBalance = requiredBalance * (1 + monthlyRate) + currentSIPAmount;
    }
    currentSIPAmount = currentSIPAmount * (1 + stepUpRate);
    
    trajectoryData.push({
      year,
      current: currentBalance,
      required: requiredBalance,
      target: corpusResult.targetCorpus
    });
  }
  
  return {
    // Input summary
    inputs: {
      yearsToRetirement,
      currentLumpSum,
      monthlyWithdrawalToday,
      expectedReturnPercent,
      inflationPercent,
      withdrawalGrowthPercent,
      stepUpPercent,
      sustainForever,
      sustainYears
    },
    // Corpus calculation
    corpus: corpusResult,
    // SIP calculation
    sip: sipResult,
    // Chart data
    trajectoryData,
    // Export-ready params for main simulator
    exportParams: {
      accumulation: {
        initialLumpSum: currentLumpSum,
        baseMonthlySIP: sipResult.requiredSIP,
        annualStepUpPercent: stepUpPercent,
        expectedReturnPercent,
        durationYears: yearsToRetirement,
        inflationRatePercent: inflationPercent
      },
      distribution: {
        initialMonthlyWithdrawal: corpusResult.withdrawalAtRetirement,
        withdrawalGrowthPercent: withdrawalGrowthPercent,
        expectedReturnPercent,
        ongoingMonthlySIP: 0,
        sipStepUpPercent: 0
      }
    }
  };
}
