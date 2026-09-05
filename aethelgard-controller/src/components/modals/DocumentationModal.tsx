import React, { useState } from 'react';

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTerminal?: () => void;
}

export const DocumentationModal: React.FC<DocumentationModalProps> = ({
  isOpen,
  onClose,
  onOpenTerminal,
}) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'invariants' | 'enclave' | 'api'>('architecture');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
      <div className="border border-[#4f4537] bg-[#131315] w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col text-[#e5e1e4] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#27272a] bg-[#18181b]">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 border border-[#4f4537] bg-[#0e0e10] flex items-center justify-center text-[#f3be67]">
              <span className="material-symbols-outlined text-[16px]">menu_book</span>
            </div>
            <div>
              <div className="font-serif text-lg text-[#f3be67] font-medium leading-tight">
                Aethelgard Controller Specification
              </div>
              <div className="font-mono text-[10px] text-[#9c8f7e] uppercase tracking-wider">
                Autonomous Financial Intelligence Standard v4.2.1-PROD
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#9c8f7e] hover:text-[#e5e1e4] p-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#27272a] bg-[#0e0e10] px-6 font-mono text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`py-3 px-4 border-b-2 font-medium transition-colors cursor-pointer ${
              activeTab === 'architecture'
                ? 'border-[#f3be67] text-[#f3be67]'
                : 'border-transparent text-[#a1a1aa] hover:text-[#e5e1e4]'
            }`}
          >
            01 // 4-Step Engine
          </button>
          <button
            onClick={() => setActiveTab('invariants')}
            className={`py-3 px-4 border-b-2 font-medium transition-colors cursor-pointer ${
              activeTab === 'invariants'
                ? 'border-[#f3be67] text-[#f3be67]'
                : 'border-transparent text-[#a1a1aa] hover:text-[#e5e1e4]'
            }`}
          >
            02 // Mathematical Invariants
          </button>
          <button
            onClick={() => setActiveTab('enclave')}
            className={`py-3 px-4 border-b-2 font-medium transition-colors cursor-pointer ${
              activeTab === 'enclave'
                ? 'border-[#f3be67] text-[#f3be67]'
                : 'border-transparent text-[#a1a1aa] hover:text-[#e5e1e4]'
            }`}
          >
            03 // Intel SGX &amp; Merkle Proofs
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`py-3 px-4 border-b-2 font-medium transition-colors cursor-pointer ${
              activeTab === 'api'
                ? 'border-[#f3be67] text-[#f3be67]'
                : 'border-transparent text-[#a1a1aa] hover:text-[#e5e1e4]'
            }`}
          >
            04 // ISO-20022 &amp; API Integration
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 text-sm font-sans leading-relaxed">
          {activeTab === 'architecture' && (
            <div className="space-y-6">
              <div className="border border-[#27272a] bg-[#0e0e10] p-4 font-mono text-xs">
                <span className="text-[#f3be67] uppercase font-semibold">Core Principle:</span>{' '}
                <span className="text-[#d3c4b2]">
                  Deterministic reconciliation eliminates probabilistic fuzzy hallucinations by enforcing exact sub-cent arithmetic and cryptographic invariants across disparate multi-source financial ledgers.
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-[#27272a] bg-[#18181b] p-4">
                  <div className="font-mono text-xs text-[#f3be67] font-semibold mb-1">
                    Stage 01: Ingestion &amp; Hashing
                  </div>
                  <p className="text-xs text-[#a1a1aa]">
                    Every ERP journal line and bank clearing batch is received through authenticated mTLS streams, canonicalized, and committed into a leaf hash before memory allocation.
                  </p>
                </div>

                <div className="border border-[#27272a] bg-[#18181b] p-4">
                  <div className="font-mono text-xs text-[#f3be67] font-semibold mb-1">
                    Stage 02: Classification
                  </div>
                  <p className="text-xs text-[#a1a1aa]">
                    Transactions are evaluated through multi-field invariants: exact amount equality, alphanumeric payment identifier stripping, nanosecond temporal windows, and LEI legal entity taxonomy.
                  </p>
                </div>

                <div className="border border-[#27272a] bg-[#18181b] p-4">
                  <div className="font-mono text-xs text-[#f3be67] font-semibold mb-1">
                    Stage 03: Cent-Level Quantification
                  </div>
                  <p className="text-xs text-[#a1a1aa]">
                    Identified variances are decomposed into isolated financial mechanisms: spot FX rates, interchange processing schedules, or contractual retainage clauses.
                  </p>
                </div>

                <div className="border border-[#27272a] bg-[#18181b] p-4">
                  <div className="font-mono text-xs text-[#f3be67] font-semibold mb-1">
                    Stage 04: Plain-Language Explanation
                  </div>
                  <p className="text-xs text-[#a1a1aa]">
                    For any un-reconciled delta, the platform outputs an audit-defensible PCAOB memo accompanied by signed, reversible general ledger reclassification entries.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'invariants' && (
            <div className="space-y-4">
              <h3 className="font-serif text-lg text-[#e5e1e4]">
                The Three Mathematical Invariants
              </h3>
              <div className="space-y-3 font-mono text-xs">
                <div className="border border-[#27272a] bg-[#0e0e10] p-4 space-y-1">
                  <div className="text-[#f3be67] font-semibold">1. Conservation of Value Invariant:</div>
                  <code className="text-[#d3c4b2] block bg-[#18181b] p-2 mt-1">
                    ∑ SourceA_Amount - ∑ SourceB_Amount = ∑ Explicit_Variance_Components
                  </code>
                  <p className="text-[11px] font-sans text-[#a1a1aa] mt-2">
                    Every cent of difference must be explicitly allocated to an auditable variance account (GL 7100 FX, GL 6410 Fees, GL 1450 Retainage). No unexplained suspense balances are mathematically permitted.
                  </p>
                </div>

                <div className="border border-[#27272a] bg-[#0e0e10] p-4 space-y-1">
                  <div className="text-[#f3be67] font-semibold">2. Bi-Directional Bijection Invariant:</div>
                  <p className="text-[11px] font-sans text-[#a1a1aa] mt-1">
                    Every matched record in Source A corresponds to exactly one deterministic subset of records in Source B, preventing double-counting or orphaned clearing wires.
                  </p>
                </div>

                <div className="border border-[#27272a] bg-[#0e0e10] p-4 space-y-1">
                  <div className="text-[#f3be67] font-semibold">3. Temporal Window Causality:</div>
                  <p className="text-[11px] font-sans text-[#a1a1aa] mt-1">
                    Settlement clearing date must follow or coincide with invoice origination date, subject to ISO 20022 nanosecond banking cutoff tolerances.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'enclave' && (
            <div className="space-y-4">
              <h3 className="font-serif text-lg text-[#e5e1e4]">
                Hardware Enclaves &amp; Cryptographic Proofs
              </h3>
              <p className="text-xs text-[#a1a1aa]">
                Financial data is processed inside Intel Software Guard Extensions (SGX) Enclave Page Cache (EPC). Even root container administrators and host OS processes cannot read memory addresses holding unencrypted ledger transactions.
              </p>

              <div className="border border-[#27272a] bg-[#0e0e10] p-4 font-mono text-xs space-y-2">
                <div className="text-[#9c8f7e] uppercase text-[10px]">Merkle Tree Attestation Architecture:</div>
                <div className="text-[#d3c4b2] leading-relaxed">
                  Leaves: H(tx_id || timestamp || sourceA_amt || sourceB_amt || delta)<br />
                  Internal Nodes: H(LeftChild || RightChild)<br />
                  Root: Publicly verifiable 256-bit commitment written to institutional ledger stream.
                </div>
              </div>

              <div className="p-3 bg-[#18181b] border-l-2 border-[#4eaa78] text-xs font-mono text-[#4eaa78]">
                Audit Defense Guarantee: Any tampering or retrospective amendment invalidates the root hash with probability 1 - 2^-256.
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-4 font-mono text-xs">
              <h3 className="font-serif text-lg text-[#e5e1e4] font-sans">
                Supported Institutional Protocols
              </h3>
              <div className="space-y-2">
                <div className="border border-[#27272a] p-3 bg-[#0e0e10] flex justify-between items-center">
                  <div>
                    <span className="text-[#e5e1e4] font-semibold">ISO 20022 (camt.053 / pain.002)</span>
                    <div className="text-[10px] text-[#71717a]">High-value interbank end-of-day bank-to-customer statement</div>
                  </div>
                  <span className="text-[#4eaa78] text-[10px] border border-[#4eaa78]/40 px-2 py-0.5">NATIVE PARSER</span>
                </div>

                <div className="border border-[#27272a] p-3 bg-[#0e0e10] flex justify-between items-center">
                  <div>
                    <span className="text-[#e5e1e4] font-semibold">Oracle NetSuite SuiteTalk REST API</span>
                    <div className="text-[10px] text-[#71717a]">OAuth 2.0 Client Credentials &amp; Transaction Search v2</div>
                  </div>
                  <span className="text-[#4eaa78] text-[10px] border border-[#4eaa78]/40 px-2 py-0.5">CONNECTED</span>
                </div>

                <div className="border border-[#27272a] p-3 bg-[#0e0e10] flex justify-between items-center">
                  <div>
                    <span className="text-[#e5e1e4] font-semibold">Stripe Treasury v2 Webhook Enclave</span>
                    <div className="text-[10px] text-[#71717a]">Streaming financial account balance &amp; payout disbursements</div>
                  </div>
                  <span className="text-[#4eaa78] text-[10px] border border-[#4eaa78]/40 px-2 py-0.5">SYNCHRONIZED</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#27272a] bg-[#18181b] font-mono text-xs">
          <div className="text-[#71717a] text-[11px]">
            Attestation Hash: <code className="text-[#f3be67]">0x98f217c...4aa0119e</code>
          </div>

          <div className="flex items-center space-x-3">
            {onOpenTerminal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenTerminal();
                }}
                className="px-3.5 py-1.5 border border-[#4f4537] text-[#f3be67] hover:bg-[#201f22] transition-colors cursor-pointer flex items-center space-x-1.5"
              >
                <span className="material-symbols-outlined text-sm">terminal</span>
                <span>Open Terminal</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-[#d4a24e] hover:bg-[#f3be67] text-[#0e0e10] font-semibold transition-colors cursor-pointer"
            >
              Close Documentation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
