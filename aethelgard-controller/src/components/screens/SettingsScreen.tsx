import React, { useState } from 'react';
import { ScreenId } from '../../types';

interface SettingsScreenProps {
  onNavigate: (screen: ScreenId) => void;
  onOpenTerminal: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onNavigate,
  onOpenTerminal,
}) => {
  const [enclaveMemory, setEnclaveMemory] = useState<'4GB' | '8GB' | '16GB'>('8GB');
  const [dualSignOff, setDualSignOff] = useState<boolean>(true);
  const [autoReclassLimit, setAutoReclassLimit] = useState<number>(100);
  const [savedToast, setSavedToast] = useState<boolean>(false);

  const handleSave = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0e0e10] text-[#e5e1e4] p-4 md:p-8 overflow-y-auto">
      {savedToast && (
        <div className="fixed top-20 right-8 z-50 bg-[#1c1b1d] border border-[#f3be67] text-[#f3be67] px-4 py-2.5 shadow-2xl font-mono text-xs flex items-center space-x-2">
          <span className="material-symbols-outlined text-sm">verified</span>
          <span>System configuration signed and deployed to SGX PRM.</span>
        </div>
      )}

      <div className="max-w-5xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="border-b border-[#27272a] pb-6">
          <div className="font-mono text-[11px] text-[#9c8f7e] uppercase tracking-widest mb-1.5">
            08 // ENCLAVE CONFIGURATION &amp; PROTOCOL SECURITY
          </div>
          <h1 className="font-serif text-3xl md:text-4xl text-[#e5e1e4] font-medium tracking-tight">
            System Settings &amp; Governance
          </h1>
          <p className="font-sans text-xs md:text-sm text-[#a1a1aa] mt-2 max-w-2xl leading-relaxed">
            Configure cryptographic security parameters, institutional ERP bridges, and automated segregation of duties (SoD) policies.
          </p>
        </div>

        {/* Section 1: Hardware Enclave & Cryptography */}
        <div className="border border-[#27272a] bg-[#131315] p-6 space-y-6">
          <div className="flex items-center space-x-3 border-b border-[#27272a] pb-4">
            <span className="material-symbols-outlined text-[#f3be67]">memory</span>
            <h2 className="font-sans text-base font-semibold text-[#e5e1e4]">
              Intel SGX / AWS Nitro Enclave Isolation
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
            <div>
              <label className="block text-[#9c8f7e] uppercase text-[10px] tracking-wider mb-2">
                Enclave Page Root Memory (PRM) Allocation
              </label>
              <div className="flex items-center space-x-2">
                {(['4GB', '8GB', '16GB'] as const).map(mem => (
                  <button
                    key={mem}
                    onClick={() => setEnclaveMemory(mem)}
                    className={`px-4 py-2 border transition-colors cursor-pointer ${
                      enclaveMemory === mem
                        ? 'border-[#f3be67] text-[#f3be67] bg-[#201f22] font-semibold'
                        : 'border-[#27272a] text-[#a1a1aa] hover:text-[#e5e1e4]'
                    }`}
                  >
                    {mem} SGX EPC
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[#9c8f7e] uppercase text-[10px] tracking-wider mb-2">
                Cryptographic Attestation Algorithm
              </label>
              <div className="p-2.5 bg-[#0e0e10] border border-[#27272a] text-[#d4a24e]">
                ECDSA P-256 with SHA-256 Merkle Leaf Generation
              </div>
            </div>
          </div>

          <div className="border-t border-[#27272a] pt-4 flex items-center justify-between font-mono text-[11px] text-[#9c8f7e]">
            <span>Remote Attestation Status: <strong className="text-[#4eaa78]">VERIFIED (Hardware Signed)</strong></span>
            <button
              onClick={onOpenTerminal}
              className="text-[#f3be67] hover:underline flex items-center space-x-1"
            >
              <span>Inspect Attestation Certificate</span>
              <span className="material-symbols-outlined text-xs">open_in_new</span>
            </button>
          </div>
        </div>

        {/* Section 2: Segregation of Duties & Regulatory Compliance */}
        <div className="border border-[#27272a] bg-[#131315] p-6 space-y-6">
          <div className="flex items-center space-x-3 border-b border-[#27272a] pb-4">
            <span className="material-symbols-outlined text-[#f3be67]">gavel</span>
            <h2 className="font-sans text-base font-semibold text-[#e5e1e4]">
              SOX 404 &amp; PCAOB Regulatory Invariants
            </h2>
          </div>

          <div className="space-y-4 font-mono text-xs">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={dualSignOff}
                onChange={e => setDualSignOff(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded-none accent-[#d4a24e] bg-[#201f22] border-[#4f4537]"
              />
              <div>
                <span className="text-[#e5e1e4] font-medium block">
                  Enforce Dual-Controller Multi-Party Sign-Off
                </span>
                <span className="text-[#a1a1aa] text-[11px] font-sans">
                  Requires two independent CFA/CPA cryptographic keys to execute any ledger adjustment exceeding the statutory threshold.
                </span>
              </div>
            </label>

            <div>
              <label className="block text-[#9c8f7e] uppercase text-[10px] tracking-wider mb-2">
                Automated Direct Reclassification Ceiling (USD)
              </label>
              <div className="flex items-center space-x-4 max-w-sm">
                <input
                  type="number"
                  value={autoReclassLimit}
                  onChange={e => setAutoReclassLimit(Number(e.target.value))}
                  className="w-32 px-3 py-2 bg-[#0e0e10] border border-[#27272a] text-[#f3be67] font-semibold focus:outline-none focus:border-[#f3be67]"
                />
                <span className="text-[#a1a1aa] text-[11px] font-sans">
                  Maximum allowable automated allocation to GL 7100 / GL 6410 without manual review.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Institutional Connectors Status */}
        <div className="border border-[#27272a] bg-[#131315] p-6 space-y-4">
          <div className="flex items-center space-x-3 border-b border-[#27272a] pb-4">
            <span className="material-symbols-outlined text-[#f3be67]">cable</span>
            <h2 className="font-sans text-base font-semibold text-[#e5e1e4]">
              Institutional ERP &amp; Custody Connectors
            </h2>
          </div>

          <div className="divide-y divide-[#27272a] font-mono text-xs">
            <div className="py-3 flex items-center justify-between">
              <div>
                <span className="text-[#e5e1e4] font-medium">Oracle NetSuite ERP SuiteTalk</span>
                <div className="text-[10px] text-[#71717a]">REST Web Services · OAuth 2.0 Token Flow</div>
              </div>
              <span className="px-2 py-0.5 bg-[#1c1b1d] border border-[#4eaa78]/40 text-[#4eaa78] text-[10px]">
                CONNECTED // SYNCED
              </span>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <span className="text-[#e5e1e4] font-medium">J.P. Morgan Treasury Settlement (SWIFT/ACH)</span>
                <div className="text-[10px] text-[#71717a]">ISO 20022 camt.053 &amp; pain.002 API</div>
              </div>
              <span className="px-2 py-0.5 bg-[#1c1b1d] border border-[#4eaa78]/40 text-[#4eaa78] text-[10px]">
                CONNECTED // SYNCED
              </span>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <span className="text-[#e5e1e4] font-medium">Stripe Custom Treasury Subledger</span>
                <div className="text-[10px] text-[#71717a]">Webhooks v2 · Merkle Root Stream</div>
              </div>
              <span className="px-2 py-0.5 bg-[#1c1b1d] border border-[#4eaa78]/40 text-[#4eaa78] text-[10px]">
                CONNECTED // SYNCED
              </span>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <span className="text-[#e5e1e4] font-medium">SAP S/4HANA Finance OData</span>
                <div className="text-[10px] text-[#71717a]">mTLS Certificate Auth</div>
              </div>
              <span className="px-2 py-0.5 bg-[#1c1b1d] border border-[#4eaa78]/40 text-[#4eaa78] text-[10px]">
                CONNECTED // SYNCED
              </span>
            </div>
          </div>
        </div>

        {/* Save Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-[#27272a]">
          <span className="font-mono text-xs text-[#71717a]">
            Governance Policy Version: 4.19.8-LTS
          </span>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-[#d4a24e] hover:bg-[#f3be67] text-[#0e0e10] font-sans text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Save &amp; Commit Settings
          </button>
        </div>
      </div>
    </div>
  );
};
