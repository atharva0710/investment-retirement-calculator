import { useState, useMemo } from 'react';
import { TableCells, InformationCircle } from '../layout/icons';
import { formatCurrency } from '../../utils/calculations';

export default function YearlyBreakdown({ data, transitionYear, showRealValues }) {
  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 10;

  const totalPages = Math.ceil(data.length / rowsPerPage);
  
  const paginatedData = useMemo(() => {
    const start = currentPage * rowsPerPage;
    return data.slice(start, start + rowsPerPage);
  }, [data, currentPage]);

  if (!data || data.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="text-surface-400">
          <TableCells className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p className="font-medium text-surface-300">Year-by-Year Breakdown</p>
          <p className="text-sm mt-2">Enter your investment details to see the yearly breakdown</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden animate-fade-in">
      <div className="p-5 border-b border-surface-700/40">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="section-title">
            <div className="p-2 bg-surface-700/50 rounded-lg">
              <TableCells className="w-5 h-5 text-surface-300" />
            </div>
            <span>Year-by-Year Breakdown</span>
          </div>
          
          {showRealValues && (
            <div className="flex items-center gap-2 text-xs text-primary-400 bg-primary-500/10 px-3 py-1.5 rounded-lg">
              <InformationCircle className="w-3.5 h-3.5" />
              <span>Showing values in Today&apos;s Money</span>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Year</th>
              <th className="text-right">Opening Balance</th>
              <th className="text-right">Contribution</th>
              <th className="text-right">Interest Earned</th>
              <th className="text-right">Withdrawal</th>
              <th className="text-center">Life Event</th>
              <th className="text-right">Closing Balance</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row) => {
              const isTransition = row.year === transitionYear;
              const isDistribution = row.phase === 'distribution';
              const hasLifeEvent = row.lifeEvent !== null;
              
              // Use real values if toggle is on
              const openingBalance = showRealValues ? row.openingBalance / row.inflationFactor : row.openingBalance;
              const contribution = showRealValues ? row.contribution / row.inflationFactor : row.contribution;
              const interestEarned = showRealValues ? row.interestEarned / row.inflationFactor : row.interestEarned;
              const withdrawal = showRealValues ? row.withdrawal / row.inflationFactor : row.withdrawal;
              const closingBalance = showRealValues ? row.closingBalance / row.inflationFactor : row.closingBalance;
              
              return (
                <tr 
                  key={row.year} 
                  className={`
                    ${isTransition ? 'phase-transition' : ''}
                    ${isDistribution && !isTransition ? 'bg-surface-800/30' : ''}
                    ${hasLifeEvent && !isTransition ? (row.lifeEvent.type === 'addition' ? 'bg-green-500/5' : 'bg-red-500/5') : ''}
                  `}
                >
                  <td className="font-medium">
                    <div className="flex items-center gap-2">
                      <span>Year {row.year}</span>
                      {isTransition && (
                        <span className="text-[10px] bg-primary-500/15 text-primary-400 px-1.5 py-0.5 rounded">
                          Transition
                        </span>
                      )}
                      {isDistribution && !isTransition && (
                        <span className="text-[10px] bg-surface-600/60 text-surface-400 px-1.5 py-0.5 rounded">
                          SWP
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="text-right currency">{formatCurrency(openingBalance)}</td>
                  <td className="text-right currency text-primary-400">
                    {contribution > 0 ? `+${formatCurrency(contribution)}` : '—'}
                  </td>
                  <td className="text-right currency text-green-400">
                    +{formatCurrency(interestEarned)}
                  </td>
                  <td className="text-right currency text-red-400">
                    {withdrawal > 0 ? `-${formatCurrency(withdrawal)}` : '—'}
                  </td>
                  <td className="text-center">
                    {hasLifeEvent ? (
                      <div className={`inline-flex flex-col items-center gap-0.5 px-2 py-1 rounded ${
                        row.lifeEvent.type === 'addition' 
                          ? 'bg-green-500/15 text-green-400' 
                          : 'bg-red-500/15 text-red-400'
                      }`}>
                        <span className="text-xs font-medium">{row.lifeEvent.label}</span>
                        <span className="text-[10px]">
                          {row.lifeEvent.type === 'addition' ? '+' : ''}{formatCurrency(row.lifeEvent.amount, true)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-surface-600">—</span>
                    )}
                  </td>
                  <td className="text-right currency font-semibold">
                    {formatCurrency(closingBalance)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-surface-700/40 flex items-center justify-between">
          <p className="text-sm text-surface-400">
            Showing {currentPage * rowsPerPage + 1} to {Math.min((currentPage + 1) * rowsPerPage, data.length)} of {data.length} years
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="btn-ghost px-3 py-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
              className="btn-ghost px-3 py-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
