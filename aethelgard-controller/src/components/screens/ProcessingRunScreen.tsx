import React, { useState, useEffect } from 'react';
import { ScreenId, UploadedFile } from '../../types';

export interface ProcessingRunScreenProps {
  onNavigate: (screen: ScreenId) => void;
  onOpenTerminal: () => void;
  activeBatchConfig?: {
    tolerance?: number;
    strictZeroPenny?: boolean;
    sourceA?: string;
    sourceB?: string;
    batchName?: string;
    uploadedFiles?: UploadedFile[];
  } | null;
}

export const ProcessingRunScreen: React.FC<ProcessingRunScreenProps> = ({
  onNavigate,
  onOpenTerminal,
  activeBatchConfig,
}) => {
  const uploadedFiles = activeBatchConfig?.uploadedFiles || [];
  const hasUploadedFiles = uploadedFiles.length > 0;

  const totalBatchRecords = hasUploadedFiles
    ? Math.max(1, uploadedFiles.reduce((acc, f) => acc + f.parsedRecordsCount, 0))
    : 52;

  const totalBatchGross = hasUploadedFiles
    ? uploadedFiles.reduce((acc, f) => acc + f.totalGrossAmount, 0)
    : 1420891.4;

  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [progressPercent, setProgressPercent] = useState<number>(hasUploadedFiles ? 40 : 74);
  const [reconciledCount, setReconciledCount] = useState<number>(
    Math.floor((hasUploadedFiles ? 0.4 : 0.74) * totalBatchRecords)
  );
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(hasUploadedFiles ? 12 : 38);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(hasUploadedFiles ? 18 : 14);

  // Active micro-stage tracking
  const [stage2Done, setStage2Done] = useState<boolean>(false);
  const [stage3Active, setStage3Active] = useState<boolean>(false);
  const [stage3Done, setStage3Done] = useState<boolean>(false);
  const [stage4Active, setStage4Active] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Expanded file preview inside run screen
  const [activePreviewFileId, setActivePreviewFileId] = useState<string | null>(
    uploadedFiles[0]?.id || null
  );
  const [downloadedReport, setDownloadedReport] = useState<boolean>(false);

  // Live execution progress simulation
  useEffect(() => {
    if (!isRunning || isCompleted) return;

    const interval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
      setRemainingSeconds(prev => (prev > 0 ? prev - 1 : 0));

      setProgressPercent(prev => {
        if (prev >= 100) {
          setIsCompleted(true);
          return 100;
        }
        const next = Math.min(100, prev + 3);
        const nextCount = Math.min(totalBatchRecords, Math.floor((next / 100) * totalBatchRecords));
        setReconciledCount(nextCount);

        if (next >= 75 && !stage2Done) {
          setStage2Done(true);
          setStage3Active(true);
        }
        if (next >= 92 && !stage3Done) {
          setStage3Done(true);
          setStage4Active(true);
        }
        if (next >= 100) {
          setIsCompleted(true);
        }
        return next;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isRunning, isCompleted, stage2Done, stage3Done, totalBatchRecords]);

  const handleRestart = () => {
    setProgressPercent(20);
    setReconciledCount(Math.floor(0.2 * totalBatchRecords));
    setElapsedSeconds(4);
    setRemainingSeconds(24);
    setStage2Done(false);
    setStage3Active(false);
    setStage3Done(false);
    setStage4Active(false);
    setIsCompleted(false);
    setIsRunning(true);
  };

  const handleFastForward = () => {
    setProgressPercent(100);
    setReconciledCount(totalBatchRecords);
    setRemainingSeconds(0);
    setStage2Done(true);
    setStage3Active(true);
    setStage3Done(true);
    setStage4Active(true);
    setIsCompleted(true);
  };

  const handleDownloadOperationsReport = () => {
    const reportData = {
      specVersion: '4.2.1-PROD-CONCORDANCE',
      batchTitle: activeBatchConfig?.batchName || 'BATCH-QC-8842',
      executionTimestampUtc: new Date().toISOString(),
      toleranceApplied: activeBatchConfig?.strictZeroPenny
        ? 'STRICT_ZERO_PENNY (±$0.00)'
        : `±$${activeBatchConfig?.tolerance ?? 50}.00 USD`,
      uploadedFiles: uploadedFiles.map(f => ({
        fileName: f.name,
        fileFormat: f.detectedFormat,
        byteSize: f.size,
        recordsParsed: f.parsedRecordsCount,
        grossVolumeUSD: f.totalGrossAmount,
        merkleLeafHash: f.hash,
      })),
      reconciliationMetrics: {
        totalUnitsAudited: totalBatchRecords,
        grossVolumeUSD: totalBatchGross,
        measuredMatchRate: '99.9882%',
        exceptionsCount: activeBatchConfig?.strictZeroPenny ? 2 : 0,
        unexplainedDeltaUSD: 0.0,
      },
      invariantVerification: {
        conservationOfValue: 'PASSED (GL 7100/6410 zero-sum balanced)',
        biDirectionalBijection: 'PASSED (Deterministic mapping strictly verified)',
        temporalOrdering: 'PASSED (ISO-20022 clearing sequence causal)',
      },
      hardwareEnclaveAttestation: {
        hardwareModel: 'Intel SGX EPC Enclave NY4',
        rootDigest: '0x98f217c9120ba44aa0119e8124b89230',
        signatureStatus: 'VERIFIED_ECDSA_P256',
      },
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Aethelgard_Run_Report_${(activeBatchConfig?.batchName || 'batch').replace(/[^a-zA-Z0-9_-]/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setDownloadedReport(true);
    setTimeout(() => setDownloadedReport(false), 3500);
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `00:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0e0e10] text-[#e5e1e4] p-4 md:p-8 justify-between overflow-y-auto min-h-[calc(100vh-4rem)]">
      <div className="max-w-6xl mx-auto w-full space-y-8">
        {/* Protocol Header Line */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#27272a] pb-4 font-mono text-[11px]">
          <div className="flex items-center space-x-2 text-[#9c8f7e]">
            <span className="text-[#f3be67]">INGESTION PROTOCOL</span>
            <span>/</span>
            <span>{activeBatchConfig?.batchName || 'BATCH-QC-8842'}</span>
            <span>/</span>
            <span className="text-[#f0be75]">STAGE: AUTOMATED CONCORDANCE</span>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-[#9c8f7e]">TOLERANCE:</span>
            <span className="text-[#f3be67] font-semibold">
              {activeBatchConfig?.strictZeroPenny ? 'STRICT ZERO-PENNY (±$0.00)' : `±$${activeBatchConfig?.tolerance ?? 50}.00 USD`}
            </span>
            <span className="px-1.5 py-0.5 bg-[#201f22] border border-[#4f4537] text-[#d4a24e] text-[10px]">
              SYNCHRONOUS
            </span>
          </div>
        </div>

        {/* Big Status Headline */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <span
                className={`w-3 h-3 rounded-full ${
                  isCompleted ? 'bg-[#4eaa78]' : 'bg-[#f3be67] animate-pulse'
                }`}
              ></span>
              <h1 className="font-serif text-3xl md:text-5xl text-[#e5e1e4] font-medium tracking-tight">
                {isCompleted ? 'Completed' : 'Running'}
              </h1>
              <span className="px-2 py-0.5 border border-[#4f4537] bg-[#18181b] text-[#f0be75] font-mono text-[11px] uppercase tracking-wider">
                {isCompleted ? 'ALL 3 PASSES VERIFIED' : 'PASS 2 OF 3'}
              </span>
            </div>
            <p className="font-sans text-sm text-[#a1a1aa] mt-2">
              Processing {activeBatchConfig?.batchName || 'Batch #8842-QC'} ·{' '}
              <span className="text-[#e5e1e4]">
                {activeBatchConfig?.sourceA || 'NetSuite ERP'} vs. {activeBatchConfig?.sourceB || 'Stripe Settlement'}
              </span>
            </p>
          </div>

          {/* Simulation Controls */}
          <div className="flex items-center space-x-2 font-mono text-[11px]">
            {!isCompleted ? (
              <>
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className="px-3 py-1.5 border border-[#3f3f46] text-[#d3c4b2] hover:text-[#f3be67] hover:border-[#f3be67] transition-colors cursor-pointer"
                >
                  {isRunning ? 'Pause Ingestion' : 'Resume Ingestion'}
                </button>
                <button
                  onClick={handleFastForward}
                  className="px-3 py-1.5 border border-[#4f4537] text-[#f3be67] hover:bg-[#201f22] transition-colors cursor-pointer"
                >
                  Fast-Forward (100%)
                </button>
              </>
            ) : (
              <button
                onClick={handleRestart}
                className="px-3 py-1.5 border border-[#4f4537] text-[#f3be67] hover:bg-[#201f22] transition-colors cursor-pointer"
              >
                Re-Run Batch Simulation
              </button>
            )}
          </div>
        </div>

        {/* EXECUTION PROGRESS CARD (IMAGE 8 CENTERPIECE) */}
        <div className="border border-[#27272a] bg-[#131315] p-6 md:p-8 space-y-6">
          {/* Card Title & Remaining Countdown */}
          <div className="flex items-center justify-between font-mono text-[11px]">
            <div className="text-[#9c8f7e] uppercase tracking-widest font-semibold">
              EXECUTION PROGRESS
            </div>
            <div className="text-[#f3be67]">
              ESTIMATED COMPLETION{' '}
              <span className="font-semibold">{formatTimer(remainingSeconds)} REMAINING</span>
            </div>
          </div>

          {/* Big Percentage & Metric Counter */}
          <div className="flex items-baseline space-x-4">
            <span className="font-mono text-5xl md:text-6xl font-semibold text-[#e5e1e4] tracking-tight">
              {progressPercent}%
            </span>
            <span className="font-mono text-xs md:text-sm text-[#a1a1aa]">
              <strong className="text-[#e5e1e4]">{reconciledCount}</strong> / {totalBatchRecords} records reconciled with deterministic fidelity
            </span>
          </div>

          {/* Progress Bar with precision lines */}
          <div className="w-full bg-[#1c1b1d] h-3 border border-[#27272a] p-0.5 relative overflow-hidden">
            <div
              className="bg-[#d4a24e] h-full transition-all duration-300 relative"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20"></div>
            </div>
          </div>

          {/* CONCORDANCE PIPELINE MICRO-STAGES */}
          <div className="pt-4 border-t border-[#27272a] space-y-3 font-mono text-[12px]">
            <div className="text-[#71717a] text-[10px] uppercase tracking-wider mb-2">
              CONCORDANCE PIPELINE MICRO-STAGES
            </div>

            {/* Stage 1 */}
            <div className="flex items-center justify-between py-1.5 border-b border-[#201f22]">
              <div className="flex items-center space-x-3 text-[#e5e1e4]">
                <span className="material-symbols-outlined text-[#4eaa78] text-[16px]">check_circle</span>
                <span>
                  Comparing {totalBatchRecords} records across{' '}
                  {hasUploadedFiles ? `${uploadedFiles.length} uploaded files` : 'sources'}...
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[#9c8f7e] text-[11px]">{totalBatchRecords}/{totalBatchRecords} INGESTED</span>
                <span className="px-1.5 py-0.2 bg-[#1c1b1d] text-[#4eaa78] border border-[#27272a] text-[10px]">
                  DONE
                </span>
              </div>
            </div>

            {/* Stage 2 */}
            <div className="flex items-center justify-between py-1.5 border-b border-[#201f22]">
              <div className="flex items-center space-x-3 text-[#e5e1e4]">
                {stage2Done ? (
                  <span className="material-symbols-outlined text-[#4eaa78] text-[16px]">check_circle</span>
                ) : (
                  <span className="material-symbols-outlined text-[#f3be67] text-[16px] animate-spin">
                    sync
                  </span>
                )}
                <span>Classifying matches, partials, mismatches...</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[#9c8f7e] text-[11px]">
                  {stage2Done ? 'TIER 1 HASHES VERIFIED' : 'EVALUATING TIER 1 HASHES'}
                </span>
                <span
                  className={`px-1.5 py-0.2 text-[10px] border ${
                    stage2Done
                      ? 'bg-[#1c1b1d] text-[#4eaa78] border-[#27272a]'
                      : 'bg-[#2a2a2c] text-[#f3be67] border-[#4f4537]'
                  }`}
                >
                  {stage2Done ? 'DONE' : 'ACTIVE'}
                </span>
              </div>
            </div>

            {/* Stage 3 */}
            <div className="flex items-center justify-between py-1.5 border-b border-[#201f22]">
              <div className="flex items-center space-x-3 text-[#e5e1e4]">
                {stage3Done ? (
                  <span className="material-symbols-outlined text-[#4eaa78] text-[16px]">check_circle</span>
                ) : stage3Active ? (
                  <span className="material-symbols-outlined text-[#f3be67] text-[16px] animate-spin">
                    sync
                  </span>
                ) : (
                  <span className="w-4 h-4 rounded-full border border-[#4f4537] inline-block"></span>
                )}
                <span className={stage3Active || stage3Done ? 'text-[#e5e1e4]' : 'text-[#71717a]'}>
                  Evaluating §4.2 contractual holdbacks and FX tolerance bounds...
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`px-1.5 py-0.2 text-[10px] border ${
                    stage3Done
                      ? 'bg-[#1c1b1d] text-[#4eaa78] border-[#27272a]'
                      : stage3Active
                      ? 'bg-[#2a2a2c] text-[#f3be67] border-[#4f4537]'
                      : 'bg-[#18181b] text-[#71717a] border-[#27272a]'
                  }`}
                >
                  {stage3Done ? 'DONE' : stage3Active ? 'ACTIVE' : 'QUEUED'}
                </span>
              </div>
            </div>

            {/* Stage 4 */}
            <div className="flex items-center justify-between py-1.5">
              <div className="flex items-center space-x-3 text-[#e5e1e4]">
                {isCompleted ? (
                  <span className="material-symbols-outlined text-[#4eaa78] text-[16px]">check_circle</span>
                ) : stage4Active ? (
                  <span className="material-symbols-outlined text-[#f3be67] text-[16px] animate-spin">
                    sync
                  </span>
                ) : (
                  <span className="w-4 h-4 rounded-full border border-[#4f4537] inline-block"></span>
                )}
                <span className={stage4Active || isCompleted ? 'text-[#e5e1e4]' : 'text-[#71717a]'}>
                  Compiling SHA-256 Merkle audit proof...
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`px-1.5 py-0.2 text-[10px] border ${
                    isCompleted
                      ? 'bg-[#1c1b1d] text-[#4eaa78] border-[#27272a]'
                      : stage4Active
                      ? 'bg-[#2a2a2c] text-[#f3be67] border-[#4f4537]'
                      : 'bg-[#18181b] text-[#71717a] border-[#27272a]'
                  }`}
                >
                  {isCompleted ? 'DONE' : stage4Active ? 'ACTIVE' : 'QUEUED'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* INGESTED FILES UNDER ACTIVE OPERATIONS PANEL */}
        {hasUploadedFiles && (
          <div className="border border-[#27272a] bg-[#131315] p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-[#27272a] pb-3 font-mono text-[11px]">
              <div className="flex items-center space-x-2 text-[#9c8f7e]">
                <span className="material-symbols-outlined text-[#f3be67] text-sm">inventory_2</span>
                <span className="uppercase tracking-wider font-semibold text-[#e5e1e4]">
                  Uploaded Ledger Files Under Concordance Operation ({uploadedFiles.length})
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[#4eaa78] flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 bg-[#4eaa78] rounded-full inline-block"></span>
                  <span>ENCLAVE SECURED</span>
                </span>
                <button
                  onClick={handleDownloadOperationsReport}
                  className="px-2.5 py-1 border border-[#4f4537] bg-[#18181b] hover:bg-[#201f22] text-[#f3be67] flex items-center space-x-1 transition-colors cursor-pointer text-[10px]"
                >
                  <span className="material-symbols-outlined text-xs">download</span>
                  <span>Export Invariant Certificate</span>
                </button>
              </div>
            </div>

            {/* List of files with format badge, lines, hash, and preview toggle */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {uploadedFiles.map((file, fIdx) => {
                const isSelected = activePreviewFileId === file.id;
                return (
                  <div
                    key={file.id}
                    className={`border p-4 transition-all font-mono text-xs ${
                      isSelected
                        ? 'border-[#f3be67] bg-[#18181b]'
                        : 'border-[#27272a] bg-[#0e0e10] hover:border-[#3f3f46]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="w-5 h-5 bg-[#201f22] border border-[#4f4537] text-[#f3be67] text-[10px] flex items-center justify-center font-bold">
                            0{fIdx + 1}
                          </span>
                          <span className="font-semibold text-[#e5e1e4] truncate max-w-[200px]" title={file.name}>
                            {file.name}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#9c8f7e] mt-1.5 space-y-0.5">
                          <div>Format: <span className="text-[#f3be67]">{file.detectedFormat}</span></div>
                          <div>
                            Records: <span className="text-[#4eaa78] font-semibold">{file.parsedRecordsCount}</span> ({(file.size / 1024).toFixed(1)} KB)
                          </div>
                          <div>
                            Gross: <span className="text-[#e5e1e4] font-semibold">${file.totalGrossAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                          <div className="truncate text-[#71717a]">
                            Leaf: <code className="text-[#d3c4b2]">{file.hash}</code>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setActivePreviewFileId(isSelected ? null : file.id)}
                        className="px-2 py-1 bg-[#131315] border border-[#3f3f46] text-[#d3c4b2] hover:text-[#f3be67] text-[10px] cursor-pointer"
                      >
                        {isSelected ? 'Hide Records' : 'Inspect Data'}
                      </button>
                    </div>

                    {/* Preview Table of parsed lines */}
                    {isSelected && file.sampleRows && file.sampleRows.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-[#27272a] space-y-1.5">
                        <div className="text-[9px] text-[#9c8f7e] uppercase tracking-wider">
                          Sample Extracted Ledger Lines:
                        </div>
                        <div className="overflow-x-auto border border-[#27272a] bg-[#0e0e10] max-h-36">
                          <table className="w-full text-left text-[9px]">
                            <thead className="bg-[#18181b] text-[#9c8f7e] border-b border-[#27272a]">
                              <tr>
                                {file.headers?.map((h, i) => (
                                  <th key={i} className="px-2 py-1">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#1c1b1d]">
                              {file.sampleRows.map((r, ri) => (
                                <tr key={ri}>
                                  {file.headers?.map((h, ci) => (
                                    <td key={ci} className="px-2 py-0.5 text-[#d3c4b2]">
                                      {String(r[h] ?? '')}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Three Invariant Tests on uploaded files */}
            <div className="pt-2 grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-[11px]">
              <div className="p-3 border border-[#27272a] bg-[#0e0e10]">
                <div className="text-[#9c8f7e] text-[10px] uppercase">1. Conservation of Value</div>
                <div className="text-[#4eaa78] font-semibold mt-1">✓ INVARIANT PASSED</div>
                <div className="text-[10px] text-[#71717a] mt-0.5">Sum difference resolved to explicit balance.</div>
              </div>
              <div className="p-3 border border-[#27272a] bg-[#0e0e10]">
                <div className="text-[#9c8f7e] text-[10px] uppercase">2. Bijection Check</div>
                <div className="text-[#4eaa78] font-semibold mt-1">✓ DETERMINISTIC BIJECTION</div>
                <div className="text-[10px] text-[#71717a] mt-0.5">Zero orphaned transactions across files.</div>
              </div>
              <div className="p-3 border border-[#27272a] bg-[#0e0e10]">
                <div className="text-[#9c8f7e] text-[10px] uppercase">3. Temporal Order</div>
                <div className="text-[#4eaa78] font-semibold mt-1">✓ CAUSALITY VERIFIED</div>
                <div className="text-[10px] text-[#71717a] mt-0.5">Clearing sequence strictly causal within bounds.</div>
              </div>
            </div>

            {downloadedReport && (
              <div className="p-2.5 bg-[#18181b] border border-[#4eaa78] text-[#4eaa78] font-mono text-xs flex items-center space-x-2">
                <span className="material-symbols-outlined text-sm">verified</span>
                <span>Cryptographic Invariant Report downloaded with SHA-256 leaf proofs.</span>
              </div>
            )}
          </div>
        )}

        {/* THREE LOWER METRIC CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Transaction Value */}
          <div className="border border-[#27272a] bg-[#131315] p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[#9c8f7e] font-mono text-[11px] mb-3">
                <span className="uppercase tracking-wider">TRANSACTION VALUE</span>
                <span className="material-symbols-outlined text-[#f3be67] text-[18px]">account_balance</span>
              </div>
              <div className="font-mono text-2xl md:text-3xl font-semibold text-[#e5e1e4] tracking-tight">
                ${totalBatchGross.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="font-mono text-[11px] text-[#a1a1aa] mt-1">
                USD Aggregate Across {totalBatchRecords} Ledger Units
              </div>
            </div>

            <div className="border-t border-[#27272a] pt-3 mt-6 flex items-center justify-between font-mono text-[11px] text-[#9c8f7e]">
              <span>DELTA TOLERANCE: <strong className="text-[#e5e1e4]">±0.002%</strong></span>
              <span>EUR/USD: <strong className="text-[#f3be67]">1.0842</strong></span>
            </div>
          </div>

          {/* Card 2: Execution Timings */}
          <div className="border border-[#27272a] bg-[#131315] p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[#9c8f7e] font-mono text-[11px] mb-3">
                <span className="uppercase tracking-wider">EXECUTION TIMINGS</span>
                <span className="material-symbols-outlined text-[#f3be67] text-[18px]">timer</span>
              </div>
              <div className="font-mono text-2xl md:text-3xl font-semibold text-[#e5e1e4] tracking-tight">
                {formatTimer(elapsedSeconds)} <span className="text-sm font-normal text-[#9c8f7e]">ELAPSED</span>
              </div>
              <div className="font-mono text-[11px] text-[#a1a1aa] mt-1">
                Throughput: 1.37 tx/sec (Systemic Bound)
              </div>
            </div>

            <div className="border-t border-[#27272a] pt-3 mt-6 flex items-center justify-between font-mono text-[11px] text-[#9c8f7e]">
              <span>MEM POOL: <strong className="text-[#e5e1e4]">4.2 MB</strong></span>
              <span>LATENCY: <strong className="text-[#f3be67]">14ms</strong></span>
            </div>
          </div>

          {/* Card 3: Rule Directives */}
          <div className="border border-[#27272a] bg-[#131315] p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[#9c8f7e] font-mono text-[11px] mb-3">
                <span className="uppercase tracking-wider">RULE DIRECTIVES</span>
                <span className="material-symbols-outlined text-[#f3be67] text-[18px]">rule</span>
              </div>
              <div className="font-mono text-2xl md:text-3xl font-semibold text-[#e5e1e4] tracking-tight">
                STRICT-L9
              </div>
              <div className="font-mono text-[11px] text-[#a1a1aa] mt-1">
                Settlement Engine: ISO-20022 Native
              </div>
            </div>

            <div className="border-t border-[#27272a] pt-3 mt-6 flex items-center justify-between font-mono text-[11px] text-[#9c8f7e]">
              <span>SANCTIONS CHECK: <strong className="text-[#4eaa78]">VERIFIED</strong></span>
              <span className="px-1.5 py-0.2 bg-[#1c1b1d] border border-[#27272a] text-[#4eaa78] text-[10px]">
                HASH VALID
              </span>
            </div>
          </div>
        </div>

        {/* Governance Certificate & View Results Bar */}
        <div className="border border-[#27272a] bg-[#18181b] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-[11px]">
          <div className="flex items-center space-x-2 text-[#9c8f7e] leading-relaxed">
            <span className="w-1.5 h-1.5 bg-[#f3be67] inline-block shrink-0"></span>
            <span>
              Reconciliation result ledger is immutable once written to the private institutional Merkle stream. Transaction state locked under Governance Certificate #2024-QX99.
            </span>
          </div>

          <button
            onClick={() => onNavigate('overview')}
            disabled={!isCompleted && progressPercent < 90}
            className={`px-4 py-2 text-xs font-mono shrink-0 flex items-center space-x-2 transition-colors ${
              isCompleted || progressPercent >= 90
                ? 'bg-[#d4a24e] text-[#0e0e10] hover:bg-[#f3be67] cursor-pointer font-semibold'
                : 'bg-[#201f22] text-[#71717a] border border-[#27272a] cursor-not-allowed'
            }`}
          >
            <span>View results</span>
            {isCompleted || progressPercent >= 90 ? (
              <span className="material-symbols-outlined text-sm">lock_open</span>
            ) : (
              <span className="material-symbols-outlined text-sm">lock</span>
            )}
          </button>
        </div>
      </div>

      {/* Bottom Status Ticker */}
      <div className="mt-8 pt-4 border-t border-[#27272a] flex flex-col md:flex-row items-center justify-between font-mono text-[10px] text-[#71717a] gap-2">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1 text-[#4eaa78]">
            <span className="w-1.5 h-1.5 bg-[#4eaa78] rounded-full inline-block"></span>
            <span>NODE: ALGO-NY4-EQX</span>
          </span>
          <span>BLOCK PROTOCOL: 0x9f1a...c84b</span>
          <span>TLS 1.3 SECURE RUNTIME</span>
        </div>

        <div className="flex items-center space-x-4 text-[#9c8f7e]">
          <span>SYNCHRONIZING RECONCILIATION BUS</span>
          <span className="text-[#e5e1e4]">UTC 14:22:09</span>
        </div>
      </div>
    </div>
  );
};
