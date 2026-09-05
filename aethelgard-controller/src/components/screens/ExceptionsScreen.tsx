import React, { useState } from 'react';
import { ScreenId } from '../../types';

interface ExceptionsScreenProps {
  onNavigate: (screen: ScreenId) => void;
  onOpenTerminal: () => void;
}

interface ExceptionRecord {
  id: string;
  batchId: string;
  category: 'Contractual Holdback' | 'FX Variance' | 'Settlement Float' | 'Gateway Fee' | 'Metadata Mismatch';
  title: string;
  sourceAEntity: string;
  sourceAAmount: number;
  sourceBEntity: string;
  sourceBAmount: number;
  delta: number;
  plainLanguageBrief: string;
  governanceClause: string;
  status: 'Pending Triage' | 'Reclassified' | 'Adjusted' | 'Released';
}

const INITIAL_EXCEPTIONS: ExceptionRecord[] = [
  {
    id: 'EXC-8842-01',
    batchId: '#8842-QC',
    category: 'Contractual Holdback',
    title: 'Apex Infrastructure Group — 10% Retainage Clause',
    sourceAEntity: 'Apex Infrastructure (NetSuite #INV-9901)',
    sourceAAmount: 500000.00,
    sourceBEntity: 'CHAPS-GB-099411 (Escrow Wire)',
    sourceBAmount: 450000.00,
    delta: -50000.00,
    plainLanguageBrief: 'Contract Master §4.2 dictates 10% retainage holdback pending final engineering handover inspection. Funds remain deposited in escrow account #9941.',
    governanceClause: 'PCAOB Standard AS 2401 // Sub-ledger Account 1450 Retainage Assets',
    status: 'Pending Triage',
  },
  {
    id: 'EXC-8842-02',
    batchId: '#8842-QC',
    category: 'FX Variance',
    title: 'Siemens Energy Global — EUR Spot Cross-Rate Slippage',
    sourceAEntity: 'NetSuite EUR Ledger GL 1010',
    sourceAAmount: 248310.22,
    sourceBEntity: 'TARGET2 EUR Clearing Wire',
    sourceBAmount: 248379.08,
    delta: 68.86,
    plainLanguageBrief: 'Realized spot FX rate shifted from 1.0821 (booking time) to 1.0824 (clearing time). Delta is within the allowable ±$100.00 tolerance window.',
    governanceClause: 'FASB ASC 830 // Foreign Currency Matters -> Route to GL 7100',
    status: 'Pending Triage',
  },
  {
    id: 'EXC-8842-03',
    batchId: '#8842-QC',
    category: 'Gateway Fee',
    title: 'Stripe Interchange Deduction Variance',
    sourceAEntity: 'NetSuite Merchant Receivable #INV-8832',
    sourceAAmount: 18450.00,
    sourceBEntity: 'Stripe Payout Batch #992',
    sourceBAmount: 18412.20,
    delta: -37.80,
    plainLanguageBrief: 'Interchange fee tier 2.1% was automatically assessed at card brand network level. Variance represents unbooked merchant processor commission.',
    governanceClause: 'Reclassifiable directly to GL 6410 Banking & Processing Fees',
    status: 'Pending Triage',
  },
  {
    id: 'EXC-8842-04',
    batchId: '#8842-QC',
    category: 'Settlement Float',
    title: 'Weekend ACH Fedwire Cutoff Delay',
    sourceAEntity: 'NetSuite Outbound Payroll Tranche',
    sourceAAmount: 320000.00,
    sourceBEntity: 'JPMC Clearing Wire ACH-331',
    sourceBAmount: 320000.00,
    delta: 0.00,
    plainLanguageBrief: 'Value dates differed by 27 hours across Sunday midnight maintenance window. Timing invariant satisfied after applying nanosecond temporal float window.',
    governanceClause: 'ISO 20022 Status CODE: ACSP (Accepted Settlement in Process)',
    status: 'Pending Triage',
  },
  {
    id: 'EXC-8842-05',
    batchId: '#8842-QC',
    category: 'Metadata Mismatch',
    title: 'Legal Entity Corporate Suffix Variation',
    sourceAEntity: 'BioHealth Solutions Inc.',
    sourceAAmount: 14280.00,
    sourceBEntity: 'BioHealth Solutions LLC [DBA]',
    sourceBAmount: 14280.00,
    delta: 0.00,
    plainLanguageBrief: 'Counterparty name in ERP general ledger incorporates Inc., while gateway statement descriptor uses LLC. Jaccard-Levenshtein similarity score is 0.94.',
    governanceClause: 'Taxonomy Dictionary Validated: EIN & LEI Matching Confirmed',
    status: 'Pending Triage',
  },
  {
    id: 'EXC-8842-06',
    batchId: '#8842-QC',
    category: 'Settlement Float',
    title: 'FedNow Micro-Deposit Routing Hold',
    sourceAEntity: 'NetSuite Custodial Top-Up #4410',
    sourceAAmount: 12500.00,
    sourceBEntity: 'FedNow Instant Settlement Fed#019',
    sourceBAmount: 12500.00,
    delta: 0.00,
    plainLanguageBrief: 'Anti-fraud velocity check temporarily held batch settlement for 3 minutes before automatic clearance. Full balance matched with zero delta.',
    governanceClause: 'Sanctions & AML Pre-Screen: SHA-256 Passed with Zero Flags',
    status: 'Pending Triage',
  },
];

export const ExceptionsScreen: React.FC<ExceptionsScreenProps> = ({
  onNavigate,
  onOpenTerminal,
}) => {
  const [exceptions, setExceptions] = useState<ExceptionRecord[]>(INITIAL_EXCEPTIONS);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleResolve = (id: string, actionType: 'Reclassified' | 'Adjusted' | 'Released') => {
    setExceptions(prev =>
      prev.map(item => (item.id === id ? { ...item, status: actionType } : item))
    );
    showNotification(`Exception ${id} successfully resolved: ${actionType}. Auditable journal signed.`);
  };

  const pendingCount = exceptions.filter(e => e.status === 'Pending Triage').length;
  const filteredExceptions = exceptions.filter(e => {
    if (activeCategory === 'all') return true;
    return e.category === activeCategory;
  });

  return (
    <div className="flex-1 flex flex-col bg-[#0e0e10] text-[#e5e1e4] p-4 md:p-8 overflow-y-auto">
      {notification && (
        <div className="fixed top-20 right-8 z-50 bg-[#1c1b1d] border border-[#f3be67] text-[#f3be67] px-4 py-2.5 shadow-2xl font-mono text-xs flex items-center space-x-2">
          <span className="material-symbols-outlined text-sm">verified</span>
          <span>{notification}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="border-b border-[#27272a] pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="font-mono text-[11px] text-[#9c8f7e] uppercase tracking-widest mb-1.5 flex items-center space-x-2">
              <span className="w-1.5 h-1.5 bg-[#f0be75] inline-block"></span>
              <span>04 // EXCEPTIONS TRIAGE &amp; PLAIN-LANGUAGE EXPLANATION</span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl text-[#e5e1e4] font-medium tracking-tight">
              Deterministic Exceptions Desk
            </h1>
            <p className="font-sans text-xs md:text-sm text-[#a1a1aa] mt-2 max-w-3xl leading-relaxed">
              Every variance is quantified to the exact penny and explained in audit-defensible plain language. No arbitrary suspense write-offs.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <div className="px-3.5 py-2 bg-[#1c1b1d] border border-[#4f4537] text-[#f0be75] font-mono text-xs">
              Pending Exceptions: <strong className="text-[#e5e1e4]">{pendingCount}</strong>
            </div>
            <button
              onClick={() => {
                setExceptions(prev => prev.map(e => ({ ...e, status: 'Reclassified' })));
                showNotification('All pending exceptions auto-reclassified under Big-4 pre-approved rules.');
              }}
              className="px-4 py-2 bg-[#d4a24e] hover:bg-[#f3be67] text-[#0e0e10] font-semibold text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
            >
              Batch Approve All Memos
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#27272a] pb-4 font-mono text-xs">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 border transition-colors cursor-pointer ${
              activeCategory === 'all'
                ? 'border-[#f3be67] text-[#f3be67] bg-[#201f22]'
                : 'border-[#27272a] text-[#a1a1aa] hover:text-[#e5e1e4]'
            }`}
          >
            All Categories ({exceptions.length})
          </button>
          <button
            onClick={() => setActiveCategory('Contractual Holdback')}
            className={`px-3 py-1.5 border transition-colors cursor-pointer ${
              activeCategory === 'Contractual Holdback'
                ? 'border-[#f3be67] text-[#f3be67] bg-[#201f22]'
                : 'border-[#27272a] text-[#a1a1aa] hover:text-[#e5e1e4]'
            }`}
          >
            Contractual Holdbacks
          </button>
          <button
            onClick={() => setActiveCategory('FX Variance')}
            className={`px-3 py-1.5 border transition-colors cursor-pointer ${
              activeCategory === 'FX Variance'
                ? 'border-[#f3be67] text-[#f3be67] bg-[#201f22]'
                : 'border-[#27272a] text-[#a1a1aa] hover:text-[#e5e1e4]'
            }`}
          >
            FX Variances
          </button>
          <button
            onClick={() => setActiveCategory('Gateway Fee')}
            className={`px-3 py-1.5 border transition-colors cursor-pointer ${
              activeCategory === 'Gateway Fee'
                ? 'border-[#f3be67] text-[#f3be67] bg-[#201f22]'
                : 'border-[#27272a] text-[#a1a1aa] hover:text-[#e5e1e4]'
            }`}
          >
            Gateway Fees
          </button>
          <button
            onClick={() => setActiveCategory('Settlement Float')}
            className={`px-3 py-1.5 border transition-colors cursor-pointer ${
              activeCategory === 'Settlement Float'
                ? 'border-[#f3be67] text-[#f3be67] bg-[#201f22]'
                : 'border-[#27272a] text-[#a1a1aa] hover:text-[#e5e1e4]'
            }`}
          >
            Settlement Float
          </button>
        </div>

        {/* Exceptions Cards List */}
        <div className="space-y-4">
          {filteredExceptions.map(exc => (
            <div
              key={exc.id}
              className={`border p-6 transition-all ${
                exc.status === 'Pending Triage'
                  ? 'border-[#4f4537] bg-[#131315]'
                  : 'border-[#27272a] bg-[#131315]/60 opacity-80'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
                    <span className="text-[#f3be67] font-semibold">{exc.id}</span>
                    <span className="text-[#71717a]">·</span>
                    <span className="text-[#a1a1aa]">{exc.batchId}</span>
                    <span className="text-[#71717a]">·</span>
                    <span className="px-2 py-0.2 bg-[#201f22] border border-[#3f3f46] text-[#d4a24e]">
                      {exc.category}
                    </span>
                    <span
                      className={`px-2 py-0.2 text-[10px] border font-mono ${
                        exc.status === 'Pending Triage'
                          ? 'border-[#f0be75] text-[#f0be75] bg-[#2a2a2c]'
                          : 'border-[#4eaa78] text-[#4eaa78] bg-[#1c1b1d]'
                      }`}
                    >
                      {exc.status}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl text-[#e5e1e4] font-medium">
                    {exc.title}
                  </h3>

                  {/* Amounts Comparison Box */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 border border-[#27272a] bg-[#0e0e10] font-mono text-xs">
                    <div>
                      <div className="text-[10px] text-[#71717a] uppercase">Source A (ERP)</div>
                      <div className="text-[#e5e1e4] font-medium mt-0.5">
                        ${exc.sourceAAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-[10px] text-[#a1a1aa] truncate">{exc.sourceAEntity}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#71717a] uppercase">Source B (Settlement)</div>
                      <div className="text-[#e5e1e4] font-medium mt-0.5">
                        ${exc.sourceBAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-[10px] text-[#a1a1aa] truncate">{exc.sourceBEntity}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#71717a] uppercase">Calculated Delta</div>
                      <div
                        className={`font-semibold mt-0.5 ${
                          exc.delta === 0
                            ? 'text-[#f3be67]'
                            : exc.delta > 0
                            ? 'text-[#4eaa78]'
                            : 'text-[#f0be75]'
                        }`}
                      >
                        {exc.delta === 0
                          ? '$0.00 (Timing/Name drift)'
                          : exc.delta > 0
                          ? `+$${exc.delta.toFixed(2)}`
                          : `-$${Math.abs(exc.delta).toFixed(2)}`}
                      </div>
                      <div className="text-[10px] text-[#9c8f7e]">Exact Penny Calculated</div>
                    </div>
                  </div>

                  {/* Plain Language CPA Brief */}
                  <div className="p-3 bg-[#18181b] border-l-2 border-[#f3be67] text-xs font-sans text-[#d3c4b2] leading-relaxed">
                    <strong className="text-[#f3be67] font-mono text-[10px] uppercase block mb-1">
                      Deterministic Explanation:
                    </strong>
                    {exc.plainLanguageBrief}
                  </div>

                  <div className="font-mono text-[11px] text-[#9c8f7e] flex items-center space-x-2">
                    <span className="material-symbols-outlined text-xs text-[#f3be67]">policy</span>
                    <span>{exc.governanceClause}</span>
                  </div>
                </div>

                {/* Actions Right */}
                <div className="flex flex-col space-y-2 shrink-0 lg:w-48 pt-2">
                  {exc.status === 'Pending Triage' ? (
                    <>
                      {exc.category === 'Contractual Holdback' && (
                        <button
                          onClick={() => handleResolve(exc.id, 'Reclassified')}
                          className="px-3 py-2 bg-[#d4a24e] hover:bg-[#f3be67] text-[#0e0e10] font-semibold text-xs font-mono transition-colors cursor-pointer text-center"
                        >
                          Post Reclass (GL 1450)
                        </button>
                      )}
                      {exc.category === 'FX Variance' && (
                        <button
                          onClick={() => handleResolve(exc.id, 'Adjusted')}
                          className="px-3 py-2 bg-[#d4a24e] hover:bg-[#f3be67] text-[#0e0e10] font-semibold text-xs font-mono transition-colors cursor-pointer text-center"
                        >
                          Auto-Adjust (GL 7100)
                        </button>
                      )}
                      {exc.category === 'Gateway Fee' && (
                        <button
                          onClick={() => handleResolve(exc.id, 'Adjusted')}
                          className="px-3 py-2 bg-[#d4a24e] hover:bg-[#f3be67] text-[#0e0e10] font-semibold text-xs font-mono transition-colors cursor-pointer text-center"
                        >
                          Book Fee (GL 6410)
                        </button>
                      )}
                      {(exc.category === 'Settlement Float' || exc.category === 'Metadata Mismatch') && (
                        <button
                          onClick={() => handleResolve(exc.id, 'Released')}
                          className="px-3 py-2 bg-[#d4a24e] hover:bg-[#f3be67] text-[#0e0e10] font-semibold text-xs font-mono transition-colors cursor-pointer text-center"
                        >
                          Verify &amp; Clear Hold
                        </button>
                      )}
                      <button
                        onClick={() => handleResolve(exc.id, 'Reclassified')}
                        className="px-3 py-1.5 border border-[#3f3f46] hover:border-[#9c8f7e] text-[#d3c4b2] text-xs font-mono transition-colors cursor-pointer"
                      >
                        Override &amp; Sign
                      </button>
                    </>
                  ) : (
                    <div className="px-3 py-2 bg-[#1c1b1d] border border-[#4eaa78]/40 text-[#4eaa78] font-mono text-xs text-center flex items-center justify-center space-x-1">
                      <span className="material-symbols-outlined text-sm">check</span>
                      <span>Audit Sealed</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
