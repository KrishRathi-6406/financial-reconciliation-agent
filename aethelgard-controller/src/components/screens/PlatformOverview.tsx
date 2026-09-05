import React, { useState } from 'react';
import { INITIAL_LEDGER_ROWS } from '../../data/mockData';
import { LedgerTransaction, ScreenId } from '../../types';

interface PlatformOverviewProps {
  onNavigate: (screen: ScreenId) => void;
  onOpenNewIngestion: () => void;
  onOpenTerminal: () => void;
}

export const PlatformOverview: React.FC<PlatformOverviewProps> = ({
  onNavigate,
  onOpenNewIngestion,
  onOpenTerminal,
}) => {
  const [ledgerRows, setLedgerRows] = useState<LedgerTransaction[]>(INITIAL_LEDGER_ROWS);
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'concordant' | 'exceptions'>('all');
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handlePostReclass = (id: string) => {
    setLedgerRows(prev =>
      prev.map(row => {
        if (row.id === id) {
          return {
            ...row,
            status: 'concordant',
            statusLabel: 'Reclassified (§4.2 Escrow Journal Posted)',
            statusNote: 'Approved under CPA delegated authority. Transferred to GL 1450.',
            actionRequired: 'verified',
          };
        }
        return row;
      })
    );
    showNotification('Reclassification journal posted to NetSuite GL 1450 (Escrow Retainage). Status: Concordant.');
  };

  const handleAutoAdjust = (id: string) => {
    setLedgerRows(prev =>
      prev.map(row => {
        if (row.id === id) {
          return {
            ...row,
            status: 'concordant',
            statusLabel: 'Adjusted // Realized FX Variance Cleared',
            statusNote: 'Offset $68.86 booked to GL 7100 Realized Currency Gain.',
            actionRequired: 'verified',
          };
        }
        return row;
      })
    );
    showNotification('Offset booked to GL 7100 Realized Currency Gain. Balance delta reconciled to $0.00.');
  };

  const handleExportAuditPack = () => {
    const jsonStr = JSON.stringify(ledgerRows, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Aethelgard_Audit_Pack_RUN-2024-Q3-0949.json';
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Audit Pack XBRL/JSON downloaded with hardware enclave signature.');
  };

  const filteredRows = ledgerRows.filter(r => {
    if (activeTabFilter === 'concordant') return r.status === 'concordant';
    if (activeTabFilter === 'exceptions') return r.status !== 'concordant';
    return true;
  });

  return (
    <div className="flex-1 flex flex-col bg-[#0e0e10] text-[#e5e1e4]">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#201f22] border border-[#f3be67] text-[#f3be67] px-4 py-3 shadow-2xl font-mono text-xs flex items-center space-x-3 animate-fade-in">
          <span className="material-symbols-outlined text-sm">verified</span>
          <span>{notification}</span>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="relative border-b border-[#27272a] bg-[#0e0e10] grid-lines overflow-hidden py-16 md:py-24 px-4 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 border border-[#4f4537] bg-[#1c1b1d] mb-8">
            <span className="material-symbols-outlined text-[#f3be67] text-[15px]">verified_user</span>
            <span className="font-mono text-[11px] text-[#f3be67] uppercase tracking-widest font-medium">
              Autonomous Financial Intelligence // Continuous Close Protocol
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#e5e1e4] max-w-5xl tracking-tight mb-6 leading-tight">
            Run the books and the <span className="italic text-[#f3be67]">cash position</span> with mathematical certainty.
          </h1>

          {/* Subtitle */}
          <p className="font-sans text-base sm:text-lg text-[#d3c4b2] max-w-3xl mb-10 leading-relaxed font-light">
            Deterministic multi-source financial reconciliation delivering sub-cent ledger accuracy, verifiable cryptographic audit trails, and plain-language exception triage — without arbitrary write-offs or heuristic guesswork.
          </p>

          {/* CTA Cluster */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-16">
            <button
              onClick={() => onNavigate('rule-matching')}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#d4a24e] hover:bg-[#f3be67] text-[#0e0e10] font-sans text-sm font-semibold tracking-wider uppercase transition-colors duration-150 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Configure Match Rules</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>

            <button
              onClick={() => onNavigate('processing-run')}
              className="w-full sm:w-auto px-7 py-3.5 border border-[#4f4537] hover:border-[#f3be67] hover:text-[#f3be67] bg-[#131315] text-[#e5e1e4] font-mono text-xs tracking-wider uppercase transition-colors duration-150 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-[#f3be67] animate-ping inline-block"></span>
              <span>View Active Engine Run</span>
            </button>
          </div>

          {/* Live Telemetry Ribbon */}
          <div className="w-full max-w-5xl border border-[#27272a] bg-[#131315] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#27272a] text-left">
            <div className="p-6">
              <div className="flex items-center justify-between text-[#d3c4b2] mb-2">
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#9c8f7e]">
                  Measured Concordance
                </span>
                <span className="material-symbols-outlined text-[#f3be67] text-sm">balance</span>
              </div>
              <div className="font-mono text-2xl text-[#e5e1e4] font-semibold tracking-tight">
                99.984%
              </div>
              <div className="font-mono text-[11px] text-[#a1a1aa] mt-1">
                ±0.0001% statistical drift
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between text-[#d3c4b2] mb-2">
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#9c8f7e]">
                  Unaccounted Write-Offs
                </span>
                <span className="material-symbols-outlined text-[#f3be67] text-sm">shield_lock</span>
              </div>
              <div className="font-mono text-2xl text-[#f3be67] font-semibold tracking-tight">
                $0.0000
              </div>
              <div className="font-mono text-[11px] text-[#a1a1aa] mt-1">
                Strict zero-leakage guarantee
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between text-[#d3c4b2] mb-2">
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#9c8f7e]">
                  Cycle Close Latency
                </span>
                <span className="material-symbols-outlined text-[#f3be67] text-sm">speed</span>
              </div>
              <div className="font-mono text-2xl text-[#e5e1e4] font-semibold tracking-tight">
                4.200s
              </div>
              <div className="font-mono text-[11px] text-[#a1a1aa] mt-1">
                Across 1.4M journal entries
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between text-[#d3c4b2] mb-2">
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#9c8f7e]">
                  Invariant Verification
                </span>
                <span className="material-symbols-outlined text-[#f3be67] text-sm">fact_check</span>
              </div>
              <div className="font-mono text-2xl text-[#e5e1e4] font-semibold tracking-tight">
                100.0%
              </div>
              <div className="font-mono text-[11px] text-[#a1a1aa] mt-1">
                Hardware Intel SGX enclave proofs
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ENTERPRISE CONNECTORS MARQUEE */}
      <div className="w-full border-b border-[#27272a] bg-[#131315] py-4 px-4 md:px-12 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex items-center justify-between min-w-[800px] text-[#d3c4b2]">
          <span className="font-mono text-[11px] uppercase tracking-widest text-[#9c8f7e]">
            Tier-1 Institutional Rails:
          </span>
          <div className="flex items-center space-x-10 font-mono text-[12px]">
            <span className="flex items-center space-x-2 text-[#e5e1e4] hover:text-[#f3be67] transition-colors cursor-default">
              <span className="w-1.5 h-1.5 bg-[#f3be67] rounded-full"></span>
              <span>Oracle NetSuite ERP</span>
            </span>
            <span className="flex items-center space-x-2 text-[#e5e1e4] hover:text-[#f3be67] transition-colors cursor-default">
              <span className="w-1.5 h-1.5 bg-[#f3be67] rounded-full"></span>
              <span>J.P. Morgan Treasury</span>
            </span>
            <span className="flex items-center space-x-2 text-[#e5e1e4] hover:text-[#f3be67] transition-colors cursor-default">
              <span className="w-1.5 h-1.5 bg-[#f3be67] rounded-full"></span>
              <span>SAP S/4HANA Finance</span>
            </span>
            <span className="flex items-center space-x-2 text-[#e5e1e4] hover:text-[#f3be67] transition-colors cursor-default">
              <span className="w-1.5 h-1.5 bg-[#f3be67] rounded-full"></span>
              <span>Bloomberg AIM</span>
            </span>
            <span className="flex items-center space-x-2 text-[#e5e1e4] hover:text-[#f3be67] transition-colors cursor-default">
              <span className="w-1.5 h-1.5 bg-[#f3be67] rounded-full"></span>
              <span>Stripe Custom Treasury</span>
            </span>
            <span className="flex items-center space-x-2 text-[#e5e1e4] hover:text-[#f3be67] transition-colors cursor-default">
              <span className="w-1.5 h-1.5 bg-[#f3be67] rounded-full"></span>
              <span>Fedwire ISO 20022</span>
            </span>
          </div>
        </div>
      </div>

      {/* "THE BAR" — THREE IMMUTABLE COMMITMENTS */}
      <section className="py-16 md:py-24 px-4 md:px-12 border-b border-[#27272a] bg-[#0e0e10]">
        <div className="max-w-7xl mx-auto">
          <div className="border-b border-[#27272a] pb-8 mb-12 flex flex-col md:flex-row md:items-end justify-between">
            <div>
              <div className="font-mono text-[11px] text-[#f3be67] uppercase tracking-widest mb-2 font-semibold">
                Institutional Standard
              </div>
              <h2 className="font-serif text-2xl sm:text-4xl text-[#e5e1e4]">
                The Bar: Three Immutable Commitments
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Commitment 01 */}
            <div className="border border-[#27272a] bg-[#131315] p-8 flex flex-col justify-between">
              <div>
                <div className="font-mono text-[11px] text-[#f3be67] uppercase tracking-widest mb-6">
                  Commitment 01 // Determinism
                </div>
                <h3 className="font-serif text-2xl text-[#e5e1e4] mb-4">
                  100% Ingestion Throughput
                </h3>
                <p className="font-sans text-sm text-[#d3c4b2] leading-relaxed mb-6">
                  Zero dropped journal entries or orphaned gateway settlements. Every asynchronous wire, clearinghouse hold, and credit batch is cryptographically cataloged upon receipt.
                </p>
              </div>
              <div className="border-t border-[#27272a] pt-4 flex items-center justify-between text-[#d3c4b2] font-mono text-[11px]">
                <span>Unmatched Tolerance:</span>
                <span className="text-[#f3be67] font-semibold">0.000000 %</span>
              </div>
            </div>

            {/* Commitment 02 */}
            <div className="border border-[#27272a] bg-[#131315] p-8 flex flex-col justify-between">
              <div>
                <div className="font-mono text-[11px] text-[#f3be67] uppercase tracking-widest mb-6">
                  Commitment 02 // Exactness
                </div>
                <h3 className="font-serif text-2xl text-[#e5e1e4] mb-4">
                  Sub-Cent Cent-Level Concordance
                </h3>
                <p className="font-sans text-sm text-[#d3c4b2] leading-relaxed mb-6">
                  Every multi-currency variance, spread margin, and settlement fee is isolated and quantified down to the exact penny. No sweeping balances into miscellaneous suspense accounts.
                </p>
              </div>
              <div className="border-t border-[#27272a] pt-4 flex items-center justify-between text-[#d3c4b2] font-mono text-[11px]">
                <span>Resolution Fidelity:</span>
                <span className="text-[#f3be67] font-semibold">Base Currency Penny-Perfect</span>
              </div>
            </div>

            {/* Commitment 03 */}
            <div className="border border-[#27272a] bg-[#131315] p-8 flex flex-col justify-between">
              <div>
                <div className="font-mono text-[11px] text-[#f3be67] uppercase tracking-widest mb-6">
                  Commitment 03 // Fiduciary
                </div>
                <h3 className="font-serif text-2xl text-[#e5e1e4] mb-4">
                  Honest Plain-Language Exceptions
                </h3>
                <p className="font-sans text-sm text-[#d3c4b2] leading-relaxed mb-6">
                  When variances occur, Controller does not hallucinate resolutions. It generates plain-language briefs referencing ERP invoice IDs, contractual retention clauses, and ISO error codes.
                </p>
              </div>
              <div className="border-t border-[#27272a] pt-4 flex items-center justify-between text-[#d3c4b2] font-mono text-[11px]">
                <span>Audit Readiness:</span>
                <span className="text-[#f3be67] font-semibold">Big-4 Defensible Memo Ready</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-STEP RECONCILIATION ENGINE */}
      <section className="py-16 md:py-24 px-4 md:px-12 border-b border-[#27272a] bg-[#131315]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="font-mono text-[11px] text-[#f3be67] uppercase tracking-widest mb-3 font-semibold">
              System Architecture
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl text-[#e5e1e4] mb-4">
              The Four-Step Autonomous Engine
            </h2>
            <p className="font-sans text-sm text-[#d3c4b2]">
              From raw clearinghouse wires to certified general ledger journal postings, see how Aethelgard guarantees total balance sheet integrity.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="border border-[#27272a] bg-[#0e0e10] p-6 relative flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 border border-[#4f4537] flex items-center justify-center font-mono text-xs text-[#f3be67] mb-6 bg-[#131315]">
                  01
                </div>
                <div className="font-mono text-[10px] text-[#9c8f7e] uppercase tracking-wider mb-1">
                  Stage 01
                </div>
                <h3 className="font-sans text-lg font-semibold text-[#e5e1e4] mb-3">Reconcile</h3>
                <p className="font-sans text-xs text-[#d3c4b2] leading-relaxed mb-4">
                  Real-time multi-source ingest. Ingests ERP ledger subledgers, custodial statements, and banking APIs into cryptographic Merkle leaves.
                </p>
              </div>
              <div className="font-mono text-[11px] text-[#9c8f7e] border-t border-[#27272a] pt-3">
                SHA-256 Event Hashing
              </div>
            </div>

            {/* Step 2 */}
            <div className="border border-[#27272a] bg-[#0e0e10] p-6 relative flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 border border-[#4f4537] flex items-center justify-center font-mono text-xs text-[#f3be67] mb-6 bg-[#131315]">
                  02
                </div>
                <div className="font-mono text-[10px] text-[#9c8f7e] uppercase tracking-wider mb-1">
                  Stage 02
                </div>
                <h3 className="font-sans text-lg font-semibold text-[#e5e1e4] mb-3">Classify</h3>
                <p className="font-sans text-xs text-[#d3c4b2] leading-relaxed mb-4">
                  Deterministic rule parsing. Unpacks vendor contract retainage terms, interchange fee tables, and real-time spot FX conversions.
                </p>
              </div>
              <div className="font-mono text-[11px] text-[#9c8f7e] border-t border-[#27272a] pt-3">
                Contract Parsing Engine
              </div>
            </div>

            {/* Step 3 */}
            <div className="border border-[#27272a] bg-[#0e0e10] p-6 relative flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 border border-[#4f4537] flex items-center justify-center font-mono text-xs text-[#f3be67] mb-6 bg-[#131315]">
                  03
                </div>
                <div className="font-mono text-[10px] text-[#9c8f7e] uppercase tracking-wider mb-1">
                  Stage 03
                </div>
                <h3 className="font-sans text-lg font-semibold text-[#e5e1e4] mb-3">Quantify</h3>
                <p className="font-sans text-xs text-[#d3c4b2] leading-relaxed mb-4">
                  Cent-level variance decomposition. Deconstructs timing drifts, bank merchant reserves, and clearing fees down to individual sub-accounts.
                </p>
              </div>
              <div className="font-mono text-[11px] text-[#9c8f7e] border-t border-[#27272a] pt-3">
                Fixed-Point Math (0 Drift)
              </div>
            </div>

            {/* Step 4 */}
            <div className="border border-[#27272a] bg-[#0e0e10] p-6 relative flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 border border-[#4f4537] flex items-center justify-center font-mono text-xs text-[#f3be67] mb-6 bg-[#131315]">
                  04
                </div>
                <div className="font-mono text-[10px] text-[#9c8f7e] uppercase tracking-wider mb-1">
                  Stage 04
                </div>
                <h3 className="font-sans text-lg font-semibold text-[#e5e1e4] mb-3">Explain</h3>
                <p className="font-sans text-xs text-[#d3c4b2] leading-relaxed mb-4">
                  Deterministic narrative synthesis. Produces auditable CPA-ready variance explanations paired with one-click reversible GL journal adjustments.
                </p>
              </div>
              <div className="font-mono text-[11px] text-[#9c8f7e] border-t border-[#27272a] pt-3">
                1-Click Signed Ledger Sync
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RECONCILIATION COMMAND CENTER (INTERACTIVE LEDGER TABLE) */}
      <section className="py-16 md:py-24 px-4 md:px-12 border-b border-[#27272a] bg-[#0e0e10]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-[#27272a]">
            <div>
              <div className="font-mono text-[11px] text-[#f3be67] uppercase tracking-widest mb-2 font-semibold">
                Terminal Interface Preview
              </div>
              <h2 className="font-serif text-2xl sm:text-4xl text-[#e5e1e4]">
                Reconciliation Command Center
              </h2>
            </div>
            <div className="flex items-center space-x-3 mt-4 md:mt-0 font-mono text-[11px] text-[#d3c4b2]">
              <span className="w-2 h-2 bg-[#f3be67] rounded-full"></span>
              <span>Batch ID: #RUN-2024-Q3-0949</span>
              <span className="text-[#4f4537]">|</span>
              <span>42,109 Matched</span>
              <span className="text-[#4f4537]">|</span>
              <span className="text-[#f3be67] font-semibold">
                {ledgerRows.filter(r => r.status !== 'concordant').length} Exceptions Triaged
              </span>
            </div>
          </div>

          {/* Table Container Frame */}
          <div className="border border-[#27272a] bg-[#131315]">
            {/* Tool Strip */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-3 border-b border-[#27272a] bg-[#18181b] gap-3">
              <div className="flex items-center space-x-4">
                <span className="font-mono text-[11px] text-[#f3be67] font-semibold">
                  AETHELGARD::CONTROLLER // RUNTIME ACTIVE
                </span>
                <span className="hidden lg:inline font-mono text-[11px] text-[#9c8f7e]">
                  Target: NetSuite GL 1010 Cash Equiv. vs J.P. Morgan Settlement
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActiveTabFilter('all')}
                  className={`px-2 py-0.5 font-mono text-[10px] uppercase border ${
                    activeTabFilter === 'all'
                      ? 'border-[#f3be67] text-[#f3be67] bg-[#201f22]'
                      : 'border-[#27272a] text-[#a1a1aa]'
                  }`}
                >
                  All ({ledgerRows.length})
                </button>
                <button
                  onClick={() => setActiveTabFilter('concordant')}
                  className={`px-2 py-0.5 font-mono text-[10px] uppercase border ${
                    activeTabFilter === 'concordant'
                      ? 'border-[#f3be67] text-[#f3be67] bg-[#201f22]'
                      : 'border-[#27272a] text-[#a1a1aa]'
                  }`}
                >
                  Concordant ({ledgerRows.filter(r => r.status === 'concordant').length})
                </button>
                <button
                  onClick={() => setActiveTabFilter('exceptions')}
                  className={`px-2 py-0.5 font-mono text-[10px] uppercase border ${
                    activeTabFilter === 'exceptions'
                      ? 'border-[#f3be67] text-[#f3be67] bg-[#201f22]'
                      : 'border-[#27272a] text-[#a1a1aa]'
                  }`}
                >
                  Exceptions ({ledgerRows.filter(r => r.status !== 'concordant').length})
                </button>
                <span className="px-2 py-0.5 border border-[#4f4537] text-[#f3be67] font-mono text-[10px] uppercase">
                  Merkle Proof Verified
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-[12px] border-collapse min-w-[900px]">
                <thead>
                  <tr className="border-b border-[#27272a] bg-[#0e0e10] text-[#9c8f7e] uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-6">Entry ID &amp; Timestamp</th>
                    <th className="py-3 px-6">Source A (NetSuite ERP)</th>
                    <th className="py-3 px-6 text-right">Ledger Amount</th>
                    <th className="py-3 px-6">Source B (JPM Clearing)</th>
                    <th className="py-3 px-6 text-right">Cleared Amount</th>
                    <th className="py-3 px-6 text-right">Delta</th>
                    <th className="py-3 px-6">Resolution Status / CPA Annotation</th>
                    <th className="py-3 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27272a]/60">
                  {filteredRows.map(row => (
                    <tr
                      key={row.id}
                      className={`hover:bg-[#18181b] transition-colors ${
                        row.status !== 'concordant' ? 'bg-[#18181b]/40' : ''
                      }`}
                    >
                      <td className="py-4 px-6 text-[#d3c4b2] font-mono text-[11px]">
                        <div className="font-semibold text-[#e5e1e4]">{row.id}</div>
                        <div className="text-[10px] text-[#71717a]">{row.timestamp}</div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="font-medium text-[#e5e1e4]">{row.sourceA.entity}</div>
                        <div className="text-[11px] text-[#a1a1aa]">{row.sourceA.reference}</div>
                      </td>

                      <td className="py-4 px-6 text-right font-medium text-[#e5e1e4]">
                        ${row.sourceA.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-4 px-6">
                        <div className="text-[#e5e1e4]">{row.sourceB.entity}</div>
                        <div className="text-[11px] text-[#a1a1aa]">{row.sourceB.reference}</div>
                      </td>

                      <td className="py-4 px-6 text-right font-medium text-[#e5e1e4]">
                        ${row.sourceB.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      <td
                        className={`py-4 px-6 text-right font-medium ${
                          row.delta === 0
                            ? 'text-[#f3be67]'
                            : row.delta > 0
                            ? 'text-[#4eaa78]'
                            : 'text-[#f0be75]'
                        }`}
                      >
                        {row.delta === 0
                          ? '$0.00'
                          : row.delta > 0
                          ? `+$${row.delta.toFixed(2)}`
                          : `-$${Math.abs(row.delta).toFixed(2)}`}
                      </td>

                      <td className="py-4 px-6">
                        <div
                          className={`inline-flex items-center px-2 py-0.5 border text-[11px] font-mono ${
                            row.status === 'concordant'
                              ? 'border-[#f3be67]/40 bg-[#f3be67]/10 text-[#f3be67]'
                              : 'border-[#f0be75]/50 bg-[#f0be75]/10 text-[#f0be75]'
                          }`}
                        >
                          {row.statusLabel}
                        </div>
                        {row.statusNote && (
                          <div className="text-[10px] text-[#a1a1aa] mt-0.5">{row.statusNote}</div>
                        )}
                      </td>

                      <td className="py-4 px-6 text-right">
                        {row.actionRequired === 'reclass' ? (
                          <button
                            onClick={() => handlePostReclass(row.id)}
                            className="px-2.5 py-1 bg-[#2a2a2c] hover:bg-[#d4a24e] hover:text-[#0e0e10] text-[#f3be67] border border-[#4f4537] text-[11px] font-mono transition-colors cursor-pointer"
                          >
                            Post Reclass
                          </button>
                        ) : row.actionRequired === 'adjust' ? (
                          <button
                            onClick={() => handleAutoAdjust(row.id)}
                            className="px-2.5 py-1 bg-[#2a2a2c] hover:bg-[#d4a24e] hover:text-[#0e0e10] text-[#f3be67] border border-[#4f4537] text-[11px] font-mono transition-colors cursor-pointer"
                          >
                            Auto-Adjust
                          </button>
                        ) : (
                          <span className="material-symbols-outlined text-[#4eaa78]" title="Audit Verified">
                            check_circle
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Summary Bar */}
            <div className="px-6 py-4 border-t border-[#27272a] bg-[#18181b] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4 md:gap-6 font-mono text-[11px] text-[#d3c4b2]">
                <span>
                  Batch Total: <strong className="text-[#e5e1e4]">$26,655,393.72</strong>
                </span>
                <span>
                  Unresolved Delta: <strong className="text-[#f3be67]">$0.00</strong>
                </span>
                <span className="hidden md:inline">
                  Root Merkle: <code className="text-[#9c8f7e]">0x7f4e...9b12</code>
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleExportAuditPack}
                  className="px-4 py-1.5 border border-[#4f4537] text-[#e5e1e4] hover:text-[#f3be67] hover:border-[#f3be67] text-xs font-sans transition-colors cursor-pointer"
                >
                  Export Ledger Audit Pack (PDF/XBRL)
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ENTERPRISE DEFENSIBILITY & COMPLIANCE MATRIX */}
      <section className="py-16 md:py-24 px-4 md:px-12 border-b border-[#27272a] bg-[#131315]">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-16">
            <div className="font-mono text-[11px] text-[#f3be67] uppercase tracking-widest mb-2 font-semibold">
              PCAOB &amp; SOX 404 Ready
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl text-[#e5e1e4] mb-4">
              Enterprise Defensibility Architecture
            </h2>
            <p className="font-sans text-base text-[#d3c4b2] font-light">
              Engineered specifically for financial institutions that cannot compromise on data sovereignty, privacy, or audit proof.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 1 */}
            <div className="border border-[#27272a] bg-[#0e0e10] p-8">
              <div className="w-10 h-10 border border-[#4f4537] bg-[#18181b] flex items-center justify-center text-[#f3be67] mb-6">
                <span className="material-symbols-outlined">memory</span>
              </div>
              <h3 className="font-sans text-lg font-semibold text-[#e5e1e4] mb-3">
                Hardware Enclave Isolation
              </h3>
              <p className="font-sans text-sm text-[#d3c4b2] leading-relaxed mb-4">
                All financial reconciliation algorithms execute inside isolated Intel SGX / AWS Nitro Enclaves. Your private general ledger data and bank statements are never stored unencrypted or exposed to host infrastructure.
              </p>
              <ul className="font-mono text-[11px] text-[#9c8f7e] space-y-2 border-t border-[#27272a] pt-4">
                <li className="flex items-center space-x-2">
                  <span className="material-symbols-outlined text-[#f3be67] text-xs">check</span>
                  <span>Zero model training on financial records</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="material-symbols-outlined text-[#f3be67] text-xs">check</span>
                  <span>Cryptographic remote attestation</span>
                </li>
              </ul>
            </div>

            {/* Pillar 2 */}
            <div className="border border-[#27272a] bg-[#0e0e10] p-8">
              <div className="w-10 h-10 border border-[#4f4537] bg-[#18181b] flex items-center justify-center text-[#f3be67] mb-6">
                <span className="material-symbols-outlined">account_tree</span>
              </div>
              <h3 className="font-sans text-lg font-semibold text-[#e5e1e4] mb-3">
                Cryptographic Merkle Proofs
              </h3>
              <p className="font-sans text-sm text-[#d3c4b2] leading-relaxed mb-4">
                Every balance calculation generates an immutable, tamper-evident hash tree. External auditors can mathematically verify that zero transactions were deleted, injected, or retroactively edited after period close.
              </p>
              <ul className="font-mono text-[11px] text-[#9c8f7e] space-y-2 border-t border-[#27272a] pt-4">
                <li className="flex items-center space-x-2">
                  <span className="material-symbols-outlined text-[#f3be67] text-xs">check</span>
                  <span>SHA-256 verifiable leaves</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="material-symbols-outlined text-[#f3be67] text-xs">check</span>
                  <span>Deterministic mathematical audit pack</span>
                </li>
              </ul>
            </div>

            {/* Pillar 3 */}
            <div className="border border-[#27272a] bg-[#0e0e10] p-8">
              <div className="w-10 h-10 border border-[#4f4537] bg-[#18181b] flex items-center justify-center text-[#f3be67] mb-6">
                <span className="material-symbols-outlined">gavel</span>
              </div>
              <h3 className="font-sans text-lg font-semibold text-[#e5e1e4] mb-3">
                SOX 404 &amp; Big-4 Alignment
              </h3>
              <p className="font-sans text-sm text-[#d3c4b2] leading-relaxed mb-4">
                Pre-built compliance controls mapped to COSO framework standards. Every automated reclassification matches strict segregation of duties (SoD) policies and requires authenticated multi-party sign-offs.
              </p>
              <ul className="font-mono text-[11px] text-[#9c8f7e] space-y-2 border-t border-[#27272a] pt-4">
                <li className="flex items-center space-x-2">
                  <span className="material-symbols-outlined text-[#f3be67] text-xs">check</span>
                  <span>Continuous SOC 1 Type II &amp; SOC 2 Type II</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="material-symbols-outlined text-[#f3be67] text-xs">check</span>
                  <span>Audit trail immutable retention (7+ years)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* INSTITUTIONAL TESTIMONIAL & SOCIAL PROOF */}
      <section className="py-16 md:py-24 px-4 md:px-12 border-b border-[#27272a] bg-[#0e0e10]">
        <div className="max-w-5xl mx-auto border border-[#27272a] bg-[#131315] p-8 md:p-14 relative">
          <span className="material-symbols-outlined text-[#4f4537]/30 absolute top-6 right-6 text-6xl">
            format_quote
          </span>
          <div className="font-mono text-[11px] text-[#f3be67] uppercase tracking-widest mb-6 font-semibold">
            Institutional Dispatch // Sovereign Capital Alliance
          </div>
          <blockquote className="font-serif text-xl sm:text-2xl lg:text-3xl text-[#e5e1e4] leading-snug mb-8">
            “Before Aethelgard Controller, our multi-currency desk spent eight days reconciling SWIFT settlement feeds against general ledger journal lines. Today, our close runs in four minutes with <span className="italic text-[#f3be67]">zero unexplained suspense drift</span>. It is the gold standard for institutional ledger certainty.”
          </blockquote>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-[#27272a] pt-6">
            <div>
              <div className="font-sans font-semibold text-base text-[#e5e1e4]">Eleanor Vance, CPA, CFA</div>
              <div className="font-sans text-xs text-[#a1a1aa]">Chief Accounting Officer, Sovereign Capital Alliance ($42B AUM)</div>
            </div>
            <div className="mt-4 sm:mt-0 font-mono text-[11px] text-[#9c8f7e]">
              Audit Jurisdiction: US PCAOB / UK FRC
            </div>
          </div>
        </div>
      </section>

      {/* INSTITUTIONAL FOOTER */}
      <footer className="bg-[#131315] border-t border-[#27272a] py-12 px-4 md:px-12 text-[#a1a1aa]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
          {/* Brand Anchor */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 border border-[#4f4537] flex items-center justify-center bg-[#0e0e10] text-[#f3be67]">
                <span className="material-symbols-outlined text-sm">account_balance</span>
              </div>
              <span className="font-serif text-lg text-[#f3be67] tracking-tight font-medium">
                Aethelgard Controller
              </span>
            </div>
            <p className="font-sans text-xs text-[#a1a1aa] max-w-sm leading-relaxed">
              The autonomous financial intelligence and multi-source reconciliation standard for sovereign wealth funds, quantitative desks, and multinational enterprises.
            </p>
            <div className="font-mono text-[10px] text-[#71717a] pt-2">
              Root Genesis Hash: <code>0x98f217c...4aa0119e</code>
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <div className="font-mono text-[11px] text-[#9c8f7e] uppercase tracking-wider mb-4">
              Architecture
            </div>
            <ul className="space-y-2 font-sans text-xs">
              <li><button onClick={() => onNavigate('rule-matching')} className="hover:text-[#f3be67] transition-colors cursor-pointer text-left">Deterministic Ingest</button></li>
              <li><button onClick={() => onNavigate('processing-run')} className="hover:text-[#f3be67] transition-colors cursor-pointer text-left">4-Step Engine</button></li>
              <li><button onClick={() => onNavigate('overview')} className="hover:text-[#f3be67] transition-colors cursor-pointer text-left">Command Center UI</button></li>
              <li><button onClick={onOpenTerminal} className="hover:text-[#f3be67] transition-colors cursor-pointer text-left">Hardware Enclaves</button></li>
              <li><button onClick={() => onNavigate('run-history')} className="hover:text-[#f3be67] transition-colors cursor-pointer text-left">Historical Ledger</button></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <div className="font-mono text-[11px] text-[#9c8f7e] uppercase tracking-wider mb-4">
              Assurance &amp; Trust
            </div>
            <ul className="space-y-2 font-sans text-xs">
              <li><span className="hover:text-[#f3be67] transition-colors cursor-default">PCAOB Defensibility</span></li>
              <li><span className="hover:text-[#f3be67] transition-colors cursor-default">SOC 1 &amp; SOC 2 Type II</span></li>
              <li><span className="hover:text-[#f3be67] transition-colors cursor-default">SOX 404 Attestations</span></li>
              <li><span className="hover:text-[#f3be67] transition-colors cursor-default">Intel SGX Security Whitepaper</span></li>
              <li><button onClick={onOpenTerminal} className="hover:text-[#f3be67] transition-colors cursor-pointer text-left">Merkle Proof Verifier</button></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <div className="font-mono text-[11px] text-[#9c8f7e] uppercase tracking-wider mb-4">
              Firm &amp; Telemetry
            </div>
            <ul className="space-y-2 font-sans text-xs">
              <li><button onClick={onOpenNewIngestion} className="hover:text-[#f3be67] transition-colors cursor-pointer text-left">New Ingestion Protocol</button></li>
              <li><button onClick={() => onNavigate('exceptions')} className="hover:text-[#f3be67] transition-colors cursor-pointer text-left">Exceptions Management</button></li>
              <li><span className="hover:text-[#f3be67] transition-colors cursor-default">Desk Security Briefings</span></li>
              <li><span className="hover:text-[#f3be67] transition-colors cursor-default">Financial Journal</span></li>
              <li><button onClick={onOpenTerminal} className="hover:text-[#f3be67] transition-colors cursor-pointer text-left">Enclave Console</button></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-[#27272a] flex flex-col md:flex-row items-center justify-between text-[#71717a] font-mono text-[11px] gap-4">
          <div>
            © 2025 Aethelgard Systems Inc. All sovereign financial computing rights reserved.
          </div>
          <div className="flex items-center space-x-6">
            <span className="hover:text-[#f3be67] cursor-pointer">Cryptographic Privacy</span>
            <span className="hover:text-[#f3be67] cursor-pointer">Master Services Agreement</span>
            <span className="hover:text-[#f3be67] cursor-pointer">System Telemetry</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
