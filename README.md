# Investment & Retirement Simulator

A professional-grade financial modeling application designed to simulate long-term investment lifecycles, retirement distribution phases, and market volatility through Monte Carlo analysis.

## Core Capabilities

### Accumulation Phase (Investment)

- **Lump Sum Initial Investment**: Model one-time seed capital entry.
- **Systematic Investment Plan (SIP)**: Monthly contributions with automated annual step-up percentages.
- **Compounding Growth**: Annualized growth rates calculated with monthly compounding intervals.
- **Inflation Tracking**: Integrated inflation adjustments to project future values in contemporary purchasing power.

### Distribution Phase (Withdrawal)

- **Systematic Withdrawal Plan (SWP)**: Controlled monthly withdrawals during retirement years.
- **Inflation-Adjusted Withdrawals**: Automated annual increases to withdrawal amounts to preserve purchasing power.
- **Hybrid Strategy**: Capability to continue SIP contributions during the distribution phase.
- **Longevity Analysis**: Quantitative calculation of corpus survival probability and duration.

### Strategic Life Events

- **Capital Additions**: Model external inflows such as bonuses, inheritances, or gifts.
- **Capital Outflows**: Integrate large-scale expenditures like real estate purchases, education, or weddings.
- **Timeline Precision**: Events are applied at specific yearly intervals with dedicated visual indicators.

## Analytical Features

### Monte Carlo Simulation

- **Volatilty Modeling**: 100-run randomized simulations to account for market uncertainty.
- **Success Probability**: Statistical calculation of plan survival over various retirement horizons.
- **Adjustable Standard Deviation**: Customizable volatility parameters (1-15%) for stress-testing.
- **Confidence Intervals**: Visualization of 10th, 50th (median), and 90th percentile outcomes.

### Professional Visualizations

- **Performance Tracking**: Comparative area charts showing Portfolio Value vs. Total Principal.
- **Phase Delimitation**: Clear visual markers for the transition between accumulation and distribution.
- **Portfolio Composition**: Donut charts illustrating the ratio of principal invested to total wealth gained.
- **Detailed Ledgers**: Year-by-year data breakdown in tabular format.

### Inflation Accounting (Fisher Equation)

The application utilizes the exact Fisher Equation to adjust for inflation:
`Real Rate = (1 + nominal) / (1 + inflation) - 1`

When the inflation-adjustment toggle is enabled:

- Summary statistics reflect contemporary purchasing power.
- Charts and tables auto-recalculate all historical and projected values.
- Distribution inputs are dynamically inflated to maintain real-world accuracy.

## Technical Specifications

### Tech Stack

- **Frontend Framework**: React 18
- **Build Tooling**: Vite
- **Styling**: Tailwind CSS
- **Data Visualization**: Recharts
- **State Management**: Optimized React Hooks (useState, useMemo)

### Installation and Deployment

```bash
# Install project dependencies
npm install

# Launch development environment
npm run dev

# Generate production build
npm run build
```

## Directory Structure

```
src/
├── components/          # UI Components
│   ├── layout/          # Navigation, Header, and Icons
│   ├── forms/           # Input modules for financial parameters
│   ├── charts/          # Recharts implementation modules
│   └── tables/          # Data visualization components
├── utils/               # Logic and mathematical kernels
│   ├── calculations.js  # Core financial engines
│   └── monteCarloSimulation.js
├── App.jsx              # Main application entry
├── index.css            # Global styles
└── main.jsx             # React initialization
```

## Mathematical Models

### SIP with Periodic Step-Up

For each year:
`Annual SIP = Base SIP * (1 + Step-up Rate)^year`
Compounded monthly:
`Balance = (Balance * (1 + Monthly Rate)) + Monthly SIP`

### SWP with Continuing Investment

For each month:
`Balance = (Balance * (1 + Monthly Rate)) + Ongoing SIP - Monthly Withdrawal`
Annualized adjustments:
`Withdrawal_New = Withdrawal_Current * (1 + Inflation Rate)`

### Monte Carlo Engine

For each iteration:
`Annual Return = Base Return + (Standard Deviation * Normal Random Distribution)`
Success metrics are aggregated across 100 distinct paths to determine the probability of corpus survival.

## License

Distributed under the MIT License.
