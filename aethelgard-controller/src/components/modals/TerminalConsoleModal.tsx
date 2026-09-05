import React, { useState, useEffect, useRef } from 'react';

interface TerminalConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_LOGS = [
  '[AETHELGARD::BOOT] Initializing Intel SGX PRM hardware enclave memory pages (8192 MB)...',
  '[ENCLAVE::ATTEST] Remote attestation certificate verified via Intel Attestation Service (IAS).',
  '[CRYPTO::BLAKE3] Root tree hash generated: 0x7e889a02cb8f90214a991823bb19fc19',
  '[ERP::NETSUITE] Connected to SuiteTalk REST v2.3 via mTLS token flow. Synced GL 1010.',
  '[GW::STRIPE] Subledger stream established. Ingesting Batch #8842 (52 records, $1,420,891.40).',
  '[CONCORDANCE] Evaluating 4 deterministic mapping vectors: Amount (flt64), RefID (256-bit), Date (±24h), Entity (Jaccard > 0.92).',
  '[PARITY] Match rate calculated: 99.984%. Bounded tolerance applied: ±$50.00.',
  '[INVARIANT] Sub-cent verification complete: Unaccounted write-offs = $0.000000.',
  '[SYSTEM] Ready for interactive command dispatch. Type "help" for operator commands.',
];

export const TerminalConsoleModal: React.FC<TerminalConsoleModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [logs, setLogs] = useState<string[]>(DEFAULT_LOGS);
  const [inputVal, setInputVal] = useState<string>('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isOpen]);

  if (!isOpen) return null;

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = inputVal.trim();
    if (!cmd) return;

    const newLogs = [...logs, `operator@aethelgard-controller:~$ ${cmd}`];

    if (cmd === 'clear') {
      setLogs([]);
      setInputVal('');
      return;
    } else if (cmd === 'help') {
      newLogs.push(
        'Available Enclave Commands:',
        '  status          - Display hardware enclave health and PRM allocation',
        '  verify-merkle   - Mathematically re-validate root SHA-256 Merkle proof',
        '  export-audit    - Generate SOX 404 compliance XBRL packet',
        '  clear           - Flush terminal output buffer'
      );
    } else if (cmd === 'status') {
      newLogs.push(
        'SGX Enclave Status: OPERATIONAL',
        'PRM Allocation: 8192 MB (62% utilized)',
        'Active Invariant Proofs: 42,109 leaves verified',
        'Zero-Leakage Guarantee: ACTIVE ($0.0000 variance)'
      );
    } else if (cmd === 'verify-merkle') {
      newLogs.push(
        'Traversing 52 leaf nodes in batch #8842-QC...',
        'Leaf 0..51 hashes match deterministic ledger records.',
        'ROOT HASH: 0x9f1ac84bee0911a3b84177d4c22998a0',
        'VERIFICATION SUCCESS: Merkle root immutable & zero-tamper.'
      );
    } else if (cmd === 'export-audit') {
      newLogs.push(
        'Packaging PCAOB Audit Pack #RUN-2024-Q3-0949...',
        'Hardware signed with RSA-4096 Controller Sovereign Key.',
        'Audit pack staged in local download memory buffer.'
      );
    } else {
      newLogs.push(`Command not recognized: "${cmd}". Type "help" for active directives.`);
    }

    setLogs(newLogs);
    setInputVal('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="border border-[#4f4537] bg-[#0c0c0e] w-full max-w-4xl h-[550px] shadow-2xl flex flex-col font-mono text-xs text-[#e5e1e4]">
        {/* Terminal Header Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#18181b] border-b border-[#27272a] select-none">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f3be67]"></span>
            <span className="text-[#f3be67] font-semibold text-[11px] tracking-wider">
              AETHELGARD::SECURE_ENCLAVE_SHELL (v4.2.1-PROD)
            </span>
          </div>

          <div className="flex items-center space-x-3 text-[#9c8f7e] text-[10px]">
            <span>NODE: ALGO-NY4-EQX</span>
            <span>|</span>
            <button
              onClick={onClose}
              className="text-[#e5e1e4] hover:text-[#f3be67] transition-colors cursor-pointer"
            >
              [ ESC / CLOSE ]
            </button>
          </div>
        </div>

        {/* Terminal Content / Logs Window */}
        <div className="flex-1 p-4 overflow-y-auto space-y-1.5 bg-[#0e0e10]/95 font-mono text-[11.5px] leading-relaxed">
          {logs.map((log, idx) => (
            <div
              key={idx}
              className={`${
                log.startsWith('operator')
                  ? 'text-[#f3be67] font-semibold'
                  : log.includes('ERROR')
                  ? 'text-[#f0be75]'
                  : log.includes('SUCCESS') || log.includes('VERIFIED')
                  ? 'text-[#4eaa78]'
                  : 'text-[#d3c4b2]'
              }`}
            >
              {log}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Command Preset Bar */}
        <div className="px-4 py-2 bg-[#131315] border-t border-[#27272a] flex items-center space-x-2 text-[10px] text-[#9c8f7e] overflow-x-auto">
          <span>Quick Directives:</span>
          <button
            onClick={() => {
              setLogs(prev => [...prev, 'operator@aethelgard-controller:~$ verify-merkle', 'VERIFICATION SUCCESS: Merkle root immutable & zero-tamper.']);
            }}
            className="px-2 py-0.5 border border-[#3f3f46] hover:border-[#f3be67] hover:text-[#f3be67] transition-colors cursor-pointer"
          >
            verify-merkle
          </button>
          <button
            onClick={() => {
              setLogs(prev => [...prev, 'operator@aethelgard-controller:~$ status', 'SGX Enclave Status: OPERATIONAL (8192 MB PRM)']);
            }}
            className="px-2 py-0.5 border border-[#3f3f46] hover:border-[#f3be67] hover:text-[#f3be67] transition-colors cursor-pointer"
          >
            status
          </button>
          <button
            onClick={() => {
              setLogs(prev => [...prev, 'operator@aethelgard-controller:~$ export-audit', 'Audit pack generated with RSA-4096 signature.']);
            }}
            className="px-2 py-0.5 border border-[#3f3f46] hover:border-[#f3be67] hover:text-[#f3be67] transition-colors cursor-pointer"
          >
            export-audit
          </button>
          <button
            onClick={() => setLogs([])}
            className="px-2 py-0.5 border border-[#3f3f46] hover:border-[#f0be75] hover:text-[#f0be75] transition-colors cursor-pointer"
          >
            clear
          </button>
        </div>

        {/* Command Prompt Input */}
        <form onSubmit={handleCommand} className="flex items-center px-4 py-3 bg-[#18181b] border-t border-[#27272a]">
          <span className="text-[#f3be67] font-semibold mr-2 font-mono text-xs">
            operator@aethelgard:~$
          </span>
          <input
            type="text"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            placeholder="Type 'help' or command..."
            className="flex-1 bg-transparent text-[#e5e1e4] focus:outline-none font-mono text-xs placeholder-[#71717a]"
            autoFocus
          />
          <button
            type="submit"
            className="px-3 py-1 bg-[#201f22] hover:bg-[#d4a24e] hover:text-[#0e0e10] text-[#f3be67] border border-[#4f4537] text-[10px] uppercase font-mono transition-colors cursor-pointer"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};
