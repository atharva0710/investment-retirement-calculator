# Investment & Retirement Simulator

A comprehensive financial modeling web application that simulates a two-phase investment lifecycle with Monte Carlo analysis.

## ✨ Features

### 📈 Phase 1: Accumulation
- **Lump Sum Investment**: One-time seed capital
- **Monthly SIP with Step-Up**: Annual percentage increase in SIP amount
- **Expected Returns**: Annualized growth rate with monthly compounding
- **Inflation Tracking**: Calculate purchasing power of future values

### 📉 Phase 2: Distribution (SWP)
- **Systematic Withdrawal Plan**: Monthly withdrawals during retirement
- **Withdrawal Growth**: Annual increase to match inflation
- **Ongoing SIP**: Continue investing during retirement
- **SIP Step-Up in Retirement**: Annual increase in ongoing SIP
- **Longevity Analysis**: Calculate corpus survival period

### 🎯 Life Events
- **Lump Sum Additions**: Bonus, inheritance, gifts
- **Lump Sum Withdrawals**: House, car, wedding, education
- Events applied at specified years with visual markers

### 🎲 Monte Carlo Simulation
- **100 Randomized Scenarios**: Simulate market volatility
- **Success Probability**: Chance your plan survives retirement
- **Adjustable Volatility**: 1-15% market uncertainty
- **Target Survival Years**: 10-50 year retirement horizon
- **Confidence Band Chart**: 10th to 90th percentile outcomes

### 📊 Visualizations
- **Area Chart**: Portfolio Value vs Total Invested over time
- **Phase Transition Marker**: Clear indicator when SWP starts
- **Confidence Band**: Monte Carlo percentile visualization
- **Donut Chart**: Principal Invested vs Wealth Gained
- **Data Table**: Year-by-year breakdown with life event column

### 🔢 Today's Money (Inflation Adjustment)
When toggle is ON, **ALL values** display in today's purchasing power:
- Summary stat cards (Total Invested, Final Corpus, Wealth Gained)
- Portfolio chart (both lines)
- Wealth breakdown pie chart
- Yearly breakdown table
- Distribution inputs are inflated to future values for accurate calculation

Uses the **exact Fisher Equation**: `Real Rate = (1 + nominal) / (1 + inflation) - 1`

### 🗂️ Tabbed Interface
Content organized into 3 tabs to reduce scrolling:
| Tab | Contents |
|-----|----------|
| 📝 Input | Accumulation, Distribution, Life Events forms |
| 📊 Analysis | Charts, Monte Carlo, Distribution Summary |
| 📋 Details | Yearly Breakdown Table |

## 🛠️ Tech Stack

- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS with glassmorphism design
- **Charts**: Recharts
- **State**: React Hooks (useState, useMemo)

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Header.jsx
│   │   ├── TabNavigation.jsx
│   │   └── icons.jsx
│   ├── forms/
│   │   ├── AccumulationForm.jsx
│   │   ├── DistributionForm.jsx
│   │   └── LifeEventsForm.jsx
│   ├── charts/
│   │   ├── PortfolioChart.jsx
│   │   ├── WealthBreakdown.jsx
│   │   └── MonteCarloResults.jsx
│   └── tables/
│       └── YearlyBreakdown.jsx
├── utils/
│   ├── calculations.js
│   └── monteCarloSimulation.js
├── App.jsx
├── index.css
└── main.jsx
```

## 📐 Financial Formulas

### SIP with Step-Up (Accumulation)
```
For each year:
  sipAmount = baseSIP × (1 + stepUpRate)^year
  For each month:
    balance = balance × (1 + monthlyRate) + sipAmount
```

### SWP with Ongoing SIP (Distribution)
```
For each month:
  balance = balance × (1 + monthlyRate)
  balance += ongoingSIP
  balance -= withdrawal
  
Annual step-ups:
  withdrawal = withdrawal × (1 + withdrawalGrowthRate)
  ongoingSIP = ongoingSIP × (1 + sipStepUpRate)
```

### Fisher Equation (Real Rate)
```
realRate = ((1 + nominalRate) / (1 + inflationRate)) - 1
```

### Monte Carlo Simulation
```
For each of 100 simulations:
  For each year:
    randomReturn = baseReturn + normalRandom() × volatility
  Track if corpus survives target years

Success Rate = (Successful Runs / 100) × 100%
```

### Withdrawal Rate
```
Initial Withdrawal Rate = (Monthly Withdrawal × 12) / Final Corpus × 100
```

## 📄 License

MIT
