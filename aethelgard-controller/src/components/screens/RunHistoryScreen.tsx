import React, { useState } from 'react';
import { HISTORICAL_BATCHES } from '../../data/mockData';
import { HistoricalBatch, ScreenId } from '../../types';

interface RunHistoryScreenProps {
  onNavigate: (screen: ScreenId) => void;
  onSelectBatch: (batch: HistoricalBatch) => void;
}

export const RunHistoryScreen: React.FC<RunHistoryScreenProps> = ({
  onNavigate,
  onSelectBatch,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSourcePair, setSelectedSourcePair] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleExportArchive = () => {
    const jsonStr = JSON.stringify(HISTORICAL_BATCHES, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Aethelgard_Historical_Ledger_Archive_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Cryptographic batch ledger archive exported (CSV/JSON).');
  };

  const filteredBatches = HISTORICAL_BATCHES.filter(batch => {
    const query = searchQuery.toLowerCase();
    const matchesQuery =
      batch.id.toLowerCase().includes(query) ||
      batch.name.toLowerCase().includes(query) ||
      batch.sourcePair.toLowerCase().includes(query) ||
      batch.pipeline.toLowerCase().includes(query);

    const matchesPair =
      selectedSourcePair === 'all' ||
      batch.sourcePair.toLowerCase().includes(selectedSourcePair.toLowerCase());

    return matchesQuery && matchesPair;
  });

  return (
    <div className="flex-1 flex flex-col bg-[#0e0e10] text-[#e5e1e4] p-4 md:p-8 overflow-y-auto">
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-[#1c1b1d] border border-[#f3be67] text-[#f3be67] px-4 py-2.5 shadow-2xl font-mono text-xs flex items-center space-x-2">
          <span className="material-symbols-outlined text-sm">verified</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto w-full space-y-8">
        {/* Header Section */}
        <div className="border-b border-[#27272a] pb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="font-mono text-[11px] text-[#9c8f7e] uppercase tracking-widest mb-1.5 flex items-center space-x-2">
                <span>06 // HISTORY / HISTORICAL BATCH ARCHIVE</span>
              </div>
              <h1 className="font-serif text-3xl md:text-4xl text-[#e5e1e4] font-medium tracking-tight">
                Run History &amp; Historical Batches
              </h1>
              <p className="font-sans text-xs md:text-sm text-[#a1a1aa] mt-2 max-w-3xl leading-relaxed">
                Permanent chronological ledger of autonomous multi-source reconciliation runs, past batch settlements, and invariant outcomes.
              </p>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <button
                onClick={handleExportArchive}
                className="px-3.5 py-2 border border-[#4f4537] text-[#f3be67] hover:bg-[#201f22] font-mono text-xs flex items-center space-x-2 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                <span>Export Ledger Archive (CSV/JSON)</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 TOP METRIC CARDS (IMAGE 16) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Metric 1 */}
          <div className="border border-[#27272a] bg-[#131315] p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[#9c8f7e] font-mono text-[11px] mb-2">
                <span className="uppercase tracking-wider">TOTAL BATCHES RUN</span>
                <span className="material-symbols-outlined text-[#f3be67] text-[18px]">format_list_bulleted</span>
              </div>
              <div className="font-mono text-3xl font-semibold text-[#e5e1e4] tracking-tight">
                148 <span className="text-lg font-normal text-[#9c8f7e]">runs</span>
              </div>
            </div>
            <div className="font-mono text-[11px] text-[#4eaa78] mt-4 flex items-center space-x-1">
              <span>↑</span>
              <span>+12 this calendar month</span>
            </div>
          </div>

          {/* Metric 2 */}
          <div className="border border-[#27272a] bg-[#131315] p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[#9c8f7e] font-mono text-[11px] mb-2">
                <span className="uppercase tracking-wider">TOTAL TXNS SCREENED</span>
                <span className="material-symbols-outlined text-[#f3be67] text-[18px]">account_balance</span>
              </div>
              <div className="font-mono text-3xl font-semibold text-[#e5e1e4] tracking-tight">
                1,482,920 <span className="text-sm font-normal text-[#9c8f7e]">TXNs</span>
              </div>
            </div>
            <div className="font-mono text-[11px] text-[#d3c4b2] mt-4">
              $184.2M gross volume
            </div>
          </div>

          {/* Metric 3 */}
          <div className="border border-[#27272a] bg-[#131315] p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[#9c8f7e] font-mono text-[11px] mb-2">
                <span className="uppercase tracking-wider">MEAN MATCH RATE</span>
                <span className="material-symbols-outlined text-[#f3be67] text-[18px]">verified</span>
              </div>
              <div className="font-mono text-3xl font-semibold text-[#e5e1e4] tracking-tight">
                99.984%
              </div>
            </div>
            <div className="font-mono text-[11px] text-[#a1a1aa] mt-4">
              Deterministic zero-leakage
            </div>
          </div>

          {/* Metric 4 */}
          <div className="border border-[#27272a] bg-[#131315] p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[#9c8f7e] font-mono text-[11px] mb-2">
                <span className="uppercase tracking-wider">MEAN RESOLUTION CADENCE</span>
                <span className="material-symbols-outlined text-[#f3be67] text-[18px]">speed</span>
              </div>
              <div className="font-mono text-3xl font-semibold text-[#e5e1e4] tracking-tight">
                4.2s
              </div>
            </div>
            <div className="font-mono text-[11px] text-[#a1a1aa] mt-4">
              Sub-second enclave execution
            </div>
          </div>
        </div>

        {/* TABLE FILTER & SEARCH STRIP */}
        <div className="border border-[#27272a] bg-[#131315] p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 font-mono text-[12px]">
          {/* Left search */}
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#71717a] text-sm">
              search
            </span>
            <input
              type="text"
              placeholder="Search by batch ID, source pair..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#0e0e10] border border-[#27272a] text-[#e5e1e4] placeholder-[#71717a] focus:outline-none focus:border-[#f3be67] text-xs"
            />
          </div>

          {/* Middle & Right Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Source Pairs Select */}
            <select
              value={selectedSourcePair}
              onChange={e => setSelectedSourcePair(e.target.value)}
              className="px-3 py-2 bg-[#0e0e10] border border-[#27272a] text-[#d3c4b2] text-xs focus:outline-none focus:border-[#f3be67] cursor-pointer"
            >
              <option value="all">All Source Pairs</option>
              <option value="NetSuite">NetSuite vs Stripe</option>
              <option value="SAP">SAP vs JPMC</option>
              <option value="Kyriba">Kyriba vs BNY Mellon</option>
              <option value="FIS">FIS vs Barclays</option>
            </select>

            {(searchQuery || selectedSourcePair !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSourcePair('all');
                  showToast('Filters reset.');
                }}
                className="px-3 py-2 border border-[#3f3f46] text-[#a1a1aa] hover:text-[#f3be67] hover:border-[#f3be67] text-xs transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* HISTORICAL BATCHES LEDGER TABLE (IMAGE 16 TABLE) */}
        <div className="border border-[#27272a] bg-[#131315]">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-[12px] border-collapse min-w-[850px]">
              <thead>
                <tr className="border-b border-[#27272a] bg-[#0e0e10] text-[#9c8f7e] text-[10px] uppercase tracking-wider">
                  <th className="py-3.5 px-6">Date &amp; UTC Time</th>
                  <th className="py-3.5 px-6">Batch ID / Name</th>
                  <th className="py-3.5 px-6">Batch Size &amp; Gross Volume</th>
                  <th className="py-3.5 px-6">Match Rate</th>
                  <th className="py-3.5 px-6 text-right">Exceptions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#27272a]/60">
                {filteredBatches.map(batch => (
                  <tr
                    key={batch.id}
                    onClick={() => onSelectBatch(batch)}
                    className="hover:bg-[#18181b] transition-colors cursor-pointer group"
                  >
                    {/* Col 1: Date */}
                    <td className="py-4 px-6 text-[#d3c4b2]">
                      <div>{batch.dateUtc.split(' ')[0]} {batch.dateUtc.split(' ')[1]}, {batch.dateUtc.split(' ')[2]}</div>
                      <div className="text-[10px] text-[#71717a]">{batch.dateUtc.split(' ')[3]} UTC</div>
                    </td>

                    {/* Col 2: Batch ID / Name */}
                    <td className="py-4 px-6">
                      <div className="text-[#e5e1e4] font-medium flex items-center space-x-2">
                        <span className="text-[#f3be67] font-semibold">{batch.id}</span>
                        <span>{batch.name}</span>
                      </div>
                      <div className="text-[10px] text-[#71717a] mt-0.5">
                        {batch.sha} · {batch.pipeline}
                      </div>
                    </td>

                    {/* Col 3: Size & Volume */}
                    <td className="py-4 px-6 text-[#e5e1e4]">
                      <div>
                        {batch.recordCount.toLocaleString()} records <span className="text-[#71717a]">/</span> <strong className="text-[#e5e1e4]">{batch.grossVolumeFormatted}</strong>
                      </div>
                    </td>

                    {/* Col 4: Match Rate Pill */}
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2 py-0.5 border border-[#4eaa78]/40 bg-[#4eaa78]/10 text-[#4eaa78] text-[11px] font-semibold">
                        {batch.matchRate.toFixed(2)}%
                      </span>
                    </td>

                    {/* Col 5: Exceptions Pill */}
                    <td className="py-4 px-6 text-right">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 border text-[11px] font-mono ${
                          batch.exceptionsCount > 0
                            ? 'border-[#f0be75]/40 bg-[#f0be75]/10 text-[#f0be75]'
                            : 'border-[#27272a] text-[#71717a]'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 bg-current mr-1.5 inline-block"></span>
                        <span>{batch.exceptionsCount} Exceptions</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
          <div className="px-6 py-4 border-t border-[#27272a] bg-[#18181b] flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-[#9c8f7e]">
            <div>
              Showing <strong className="text-[#e5e1e4]">1-10</strong> of <strong className="text-[#e5e1e4]">148</strong> historical runs
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="w-7 h-7 flex items-center justify-center border border-[#27272a] text-[#a1a1aa] hover:border-[#f3be67] hover:text-[#f3be67] disabled:opacity-30 cursor-pointer"
              >
                &lt;
              </button>
              <button
                onClick={() => setCurrentPage(1)}
                className={`w-7 h-7 flex items-center justify-center border cursor-pointer ${
                  currentPage === 1
                    ? 'border-[#f3be67] text-[#0e0e10] bg-[#f3be67] font-semibold'
                    : 'border-[#27272a] text-[#a1a1aa]'
                }`}
              >
                1
              </button>
              <button
                onClick={() => setCurrentPage(2)}
                className={`w-7 h-7 flex items-center justify-center border cursor-pointer ${
                  currentPage === 2
                    ? 'border-[#f3be67] text-[#0e0e10] bg-[#f3be67] font-semibold'
                    : 'border-[#27272a] text-[#a1a1aa]'
                }`}
              >
                2
              </button>
              <button
                onClick={() => setCurrentPage(3)}
                className={`w-7 h-7 flex items-center justify-center border cursor-pointer ${
                  currentPage === 3
                    ? 'border-[#f3be67] text-[#0e0e10] bg-[#f3be67] font-semibold'
                    : 'border-[#27272a] text-[#a1a1aa]'
                }`}
              >
                3
              </button>
              <span className="px-1 text-[#71717a]">...</span>
              <button
                onClick={() => setCurrentPage(15)}
                className={`w-7 h-7 flex items-center justify-center border cursor-pointer ${
                  currentPage === 15
                    ? 'border-[#f3be67] text-[#0e0e10] bg-[#f3be67] font-semibold'
                    : 'border-[#27272a] text-[#a1a1aa]'
                }`}
              >
                15
              </button>
              <button
                disabled={currentPage === 15}
                onClick={() => setCurrentPage(p => Math.min(15, p + 1))}
                className="w-7 h-7 flex items-center justify-center border border-[#27272a] text-[#a1a1aa] hover:border-[#f3be67] hover:text-[#f3be67] disabled:opacity-30 cursor-pointer"
              >
                &gt;
              </button>
            </div>

            <button
              onClick={() => showToast('Current page exported with cryptographically signed hashes.')}
              className="flex items-center space-x-1 text-[#e5e1e4] hover:text-[#f3be67] cursor-pointer"
            >
              <span>Export Page</span>
              <span className="material-symbols-outlined text-xs">download</span>
            </button>
          </div>
        </div>

        {/* BOTTOM VERIFICATION BAR (IMAGE 16) */}
        <div className="border border-[#27272a] bg-[#18181b] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono text-[11px] text-[#9c8f7e]">
          <div className="flex items-center space-x-2 text-[#e5e1e4]">
            <span className="w-1.5 h-1.5 bg-[#4eaa78] inline-block"></span>
            <span>
              LEDGER IMMUTABILITY VERIFIED // BLAKE3 HASH ROOT:{' '}
              <code className="text-[#f3be67]">0x7e889a02cb8...fc19</code>
            </span>
          </div>
          <div>
            LAST COLD SYNC: <span className="text-[#e5e1e4]">2025-02-28 14:10:45 UTC</span>
          </div>
        </div>
      </div>
    </div>
  );
};
