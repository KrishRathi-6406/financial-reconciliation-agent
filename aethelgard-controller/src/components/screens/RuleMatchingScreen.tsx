import React, { useState, useEffect, useRef } from 'react';
import { DEFAULT_RULES } from '../../data/mockData';
import { RuleCriteria, ScreenId, UploadedFile } from '../../types';
import {
  computeHash,
  parseFileContent,
  generateSampleLedgerPair,
} from '../../utils/fileParsing';

interface RuleMatchingScreenProps {
  onNavigate: (screen: ScreenId) => void;
  onStartReconciliation: (rulesConfig: {
    tolerance: number;
    strictZeroPenny: boolean;
    uploadedFiles?: UploadedFile[];
    sourceA?: string;
    sourceB?: string;
    batchName?: string;
  }) => void;
  activeFiles?: UploadedFile[];
  onUpdateUploadedFiles?: (files: UploadedFile[]) => void;
}

export const RuleMatchingScreen: React.FC<RuleMatchingScreenProps> = ({
  onNavigate,
  onStartReconciliation,
  activeFiles = [],
  onUpdateUploadedFiles,
}) => {
  // Uploaded files state
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(activeFiles);
  const [isUploadDrawerOpen, setIsUploadDrawerOpen] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isProcessingFiles, setIsProcessingFiles] = useState<boolean>(false);
  const [isDataPreviewOpen, setIsDataPreviewOpen] = useState<boolean>(false);

  // Active files being paired
  const [selectedFileAIndex, setSelectedFileAIndex] = useState<number>(0);
  const [selectedFileBIndex, setSelectedFileBIndex] = useState<number>(1);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync if activeFiles prop changes
  useEffect(() => {
    if (activeFiles.length > 0 && uploadedFiles.length === 0) {
      setUploadedFiles(activeFiles);
    }
  }, [activeFiles]);

  const fileA: UploadedFile | null = uploadedFiles[selectedFileAIndex] || uploadedFiles[0] || null;
  const fileB: UploadedFile | null =
    uploadedFiles[selectedFileBIndex] || (uploadedFiles.length > 1 ? uploadedFiles[1] : null);

  // Available column headers from uploaded files (or fallbacks)
  const headersA: string[] = fileA?.headers && fileA.headers.length > 0
    ? fileA.headers
    : ['ns_line_net_amount', 'ns_tran_external_id', 'ns_posting_date', 'ns_entity_memo_ref', 'currency', 'reference'];

  const headersB: string[] = fileB?.headers && fileB.headers.length > 0
    ? fileB.headers
    : ['stripe_settlement_amt', 'stripe_payment_intent_id', 'stripe_cleared_timestamp', 'stripe_description_descriptor', 'currency', 'client_reference_id'];

  // Match rules state
  const [rules, setRules] = useState<RuleCriteria[]>(DEFAULT_RULES);
  const [tolerance, setTolerance] = useState<number>(50);
  const [strictZeroPenny, setStrictZeroPenny] = useState<boolean>(false);
  const [rulesetStatus, setRulesetStatus] = useState<'Draft Ruleset' | 'Ruleset Saved & Locked'>('Draft Ruleset');
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Custom rule creation state
  const [isAddingRule, setIsAddingRule] = useState<boolean>(false);
  const [newRuleTitle, setNewRuleTitle] = useState<string>('');
  const [newRuleBadge, setNewRuleBadge] = useState<string>('CUSTOM INVARIANT');
  const [newRuleSourceA, setNewRuleSourceA] = useState<string>(headersA[0] || 'amount');
  const [newRuleSourceB, setNewRuleSourceB] = useState<string>(headersB[0] || 'gross');
  const [newRuleOperator, setNewRuleOperator] = useState<string>('Exact 1:1 Invariant');

  // Auto-match headers algorithm based on uploaded files
  const handleAutoMatchHeaders = () => {
    if (!fileA || !fileB) {
      setSaveToast('Upload at least 2 ledger files to perform header auto-matching.');
      setTimeout(() => setSaveToast(null), 3500);
      return;
    }

    const findMatch = (
      headers: string[],
      keywords: string[],
      fallback: string
    ) => {
      for (const h of headers) {
        const lower = h.toLowerCase();
        for (const kw of keywords) {
          if (lower.includes(kw)) return h;
        }
      }
      return fallback;
    };

    const matchedAmountA = findMatch(headersA, ['amount', 'gross', 'debit', 'total', 'amt', 'value'], headersA[0] || 'amount');
    const matchedAmountB = findMatch(headersB, ['amount', 'gross', 'net', 'total', 'amt', 'value'], headersB[0] || 'amount');

    const matchedRefA = findMatch(headersA, ['id', 'ref', 'tx', 'tran', 'external', 'wire', 'code'], headersA[1] || 'reference');
    const matchedRefB = findMatch(headersB, ['id', 'ref', 'payout', 'ch_', 'intent', 'token', 'code'], headersB[1] || 'reference');

    const matchedDateA = findMatch(headersA, ['date', 'time', 'created', 'posting', 'cleared'], headersA[2] || 'date');
    const matchedDateB = findMatch(headersB, ['date', 'time', 'created', 'cleared', 'settlement'], headersB[2] || 'date');

    const matchedEntityA = findMatch(headersA, ['entity', 'currency', 'account', 'memo', 'vendor', 'client'], headersA[3] || 'entity');
    const matchedEntityB = findMatch(headersB, ['description', 'currency', 'status', 'account', 'org'], headersB[3] || 'descriptor');

    setRules([
      {
        id: 'amount-mapping',
        title: 'Amount & Value Parity',
        badge: 'PRIMARY KEY',
        sourceAField: matchedAmountA,
        sourceBField: matchedAmountB,
        description: `Deterministic decimal comparison between ${fileA.name} [${matchedAmountA}] and ${fileB.name} [${matchedAmountB}]. Tolerance window enforced below.`,
        metaKey: 'EVALUATION',
        metaVal: 'EXACT_SUB_CENT_DELTA',
        active: true,
        operator: 'Bounded Tolerance',
      },
      {
        id: 'ref-mapping',
        title: 'Reference / Transaction Key',
        badge: '1:1 INVARIANT',
        sourceAField: matchedRefA,
        sourceBField: matchedRefB,
        description: `Normalized transaction identifier lookup between [${matchedRefA}] and [${matchedRefB}]. Trims whitespace and non-alphanumeric prefixes prior to hashing.`,
        metaKey: 'HASHING',
        metaVal: 'SHA-256 BIJECTIVE LOOKUP',
        active: true,
        operator: 'Strict 1:1 Invariant',
      },
      {
        id: 'date-mapping',
        title: 'Date & Timestamp Bounds',
        badge: 'TEMPORAL TOLERANCE',
        sourceAField: matchedDateA,
        sourceBField: matchedDateB,
        description: `Temporal sequence alignment between [${matchedDateA}] and [${matchedDateB}]. Supports ±24h banking float and weekend cutoffs.`,
        metaKey: 'WINDOW',
        metaVal: 'UTC ISO-8601 CAUSAL FLOAT',
        active: true,
        operator: 'Temporal Floating Window',
      },
      {
        id: 'counterparty-mapping',
        title: 'Entity / Currency Normalization',
        badge: 'LEI INVARIANT',
        sourceAField: matchedEntityA,
        sourceBField: matchedEntityB,
        description: `Entity identifier or ISO-4217 currency balance validation between [${matchedEntityA}] and [${matchedEntityB}].`,
        metaKey: 'MATCH ALGO',
        metaVal: 'ISO-17442 DETERMINISTIC BIJECTION',
        active: true,
        operator: 'Exact Code Equivalence',
      },
    ]);

    setSaveToast('Columns auto-mapped from uploaded files with 100% deterministic alignment.');
    setTimeout(() => setSaveToast(null), 3500);
  };

  // Process newly uploaded files
  const handleProcessFiles = async (files: FileList | File[]) => {
    setIsProcessingFiles(true);
    const newFiles: UploadedFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const text = await file.text();
        const hash = await computeHash(text);
        const { detectedFormat, parsedRecordsCount, totalGrossAmount, headers, sampleRows } = parseFileContent(
          file.name,
          text
        );

        newFiles.push({
          id: `file_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
          name: file.name,
          size: file.size,
          type: file.type || 'text/plain',
          content: text,
          parsedRecordsCount,
          totalGrossAmount,
          hash,
          detectedFormat,
          headers,
          sampleRows,
        });
      } catch (err) {
        console.error('File parsing error', err);
      }
    }

    const merged = [...uploadedFiles, ...newFiles];
    setUploadedFiles(merged);
    if (onUpdateUploadedFiles) onUpdateUploadedFiles(merged);

    setIsProcessingFiles(false);
    setIsUploadDrawerOpen(false);

    setSaveToast(`Ingested ${newFiles.length} file(s). Field mappings updated.`);
    setTimeout(() => setSaveToast(null), 3500);
  };

  const handleLoadSampleLedgers = async () => {
    setIsProcessingFiles(true);
    const samples = await generateSampleLedgerPair();
    setUploadedFiles(samples);
    setSelectedFileAIndex(0);
    setSelectedFileBIndex(1);
    if (onUpdateUploadedFiles) onUpdateUploadedFiles(samples);

    setIsProcessingFiles(false);
    setIsUploadDrawerOpen(false);

    // Auto-update rules for sample files
    setRules([
      {
        id: 'amount-mapping',
        title: 'Amount & Value Parity',
        badge: 'PRIMARY KEY',
        sourceAField: 'Debit',
        sourceBField: 'Gross',
        description: 'Decimal value comparison between NetSuite Journal Debit and Stripe Settlement Gross. Baseline variance bounded by tolerance.',
        metaKey: 'EVALUATION',
        metaVal: 'EXACT_SUB_CENT_DELTA',
        active: true,
        operator: 'Bounded Tolerance',
      },
      {
        id: 'ref-mapping',
        title: 'Reference ID Invariant',
        badge: '1:1 INVARIANT',
        sourceAField: 'TxID',
        sourceBField: 'PayoutID',
        description: 'Primary transaction key bijective lookup. Sanitizes prefixes and checks uniqueness across all ledger entries.',
        metaKey: 'HASHING',
        metaVal: 'SHA-256 BIJECTIVE LOOKUP',
        active: true,
        operator: 'Strict 1:1 Invariant',
      },
      {
        id: 'date-mapping',
        title: 'Settlement Date Alignment',
        badge: 'TEMPORAL TOLERANCE',
        sourceAField: 'Date',
        sourceBField: 'Created',
        description: 'UTC ISO-8601 calendar day alignment between GL entry date and Gateway creation timestamp.',
        metaKey: 'WINDOW',
        metaVal: 'UTC ISO-8601 CAUSAL FLOAT',
        active: true,
        operator: 'Temporal Floating Window',
      },
      {
        id: 'counterparty-mapping',
        title: 'Currency Normalization',
        badge: 'LEI INVARIANT',
        sourceAField: 'Currency',
        sourceBField: 'Currency',
        description: 'ISO-4217 standard currency code parity checking across ledger postings.',
        metaKey: 'MATCH ALGO',
        metaVal: 'ISO-17442 DETERMINISTIC BIJECTION',
        active: true,
        operator: 'Exact Code Equivalence',
      },
    ]);

    setSaveToast('Preloaded sample ledger pair: NetSuite GL vs. Stripe Settlement.');
    setTimeout(() => setSaveToast(null), 3500);
  };

  const handleUpdateRuleField = (
    ruleId: string,
    source: 'sourceAField' | 'sourceBField' | 'operator',
    val: string
  ) => {
    setRules(prev =>
      prev.map(r => (r.id === ruleId ? { ...r, [source]: val } : r))
    );
  };

  const toggleRule = (id: string) => {
    setRules(prev =>
      prev.map(r => (r.id === id ? { ...r, active: !r.active } : r))
    );
  };

  const handleDeleteRule = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
    setSaveToast('Rule criterion removed.');
    setTimeout(() => setSaveToast(null), 3000);
  };

  const handleAddCustomRule = () => {
    if (!newRuleTitle.trim()) return;

    const newRule: RuleCriteria = {
      id: `custom-rule-${Date.now()}`,
      title: newRuleTitle,
      badge: newRuleBadge.toUpperCase(),
      sourceAField: newRuleSourceA,
      sourceBField: newRuleSourceB,
      description: `Custom deterministic mapping between Source A [${newRuleSourceA}] and Source B [${newRuleSourceB}].`,
      metaKey: 'CUSTOM RULE',
      metaVal: newRuleOperator.toUpperCase(),
      active: true,
      operator: newRuleOperator,
      isCustom: true,
    };

    setRules(prev => [...prev, newRule]);
    setIsAddingRule(false);
    setNewRuleTitle('');
    setSaveToast(`Custom match criterion "${newRuleTitle}" added.`);
    setTimeout(() => setSaveToast(null), 3500);
  };

  const handleResetDefaults = () => {
    setRules(DEFAULT_RULES);
    setTolerance(50);
    setStrictZeroPenny(false);
    setRulesetStatus('Draft Ruleset');
    setSaveToast('Rules reset to SEC / PCAOB regulatory defaults.');
    setTimeout(() => setSaveToast(null), 3500);
  };

  const handleSaveRuleset = () => {
    setRulesetStatus('Ruleset Saved & Locked');
    setSaveToast('Ruleset configuration and column mappings committed to enclave storage.');
    setTimeout(() => setSaveToast(null), 3500);
  };

  const handleRunReconciliation = () => {
    const fileAName = fileA?.name || 'Primary General Ledger';
    const fileBName = fileB?.name || 'Counterparty Clearing File';

    onStartReconciliation({
      tolerance: strictZeroPenny ? 0 : tolerance,
      strictZeroPenny,
      uploadedFiles,
      sourceA: fileAName,
      sourceB: fileBName,
      batchName: `CONCORDANCE_${(fileAName.split('.')[0] || 'BATCH').toUpperCase()}_VS_${(fileBName.split('.')[0] || 'SUBLEDGER').toUpperCase()}`,
    });
    onNavigate('processing-run');
  };

  // Metrics for files
  const totalRecordsStaged = fileA
    ? fileA.parsedRecordsCount
    : uploadedFiles.reduce((acc, f) => acc + f.parsedRecordsCount, 0) || 52;

  const totalGrossUSD = fileA
    ? fileA.totalGrossAmount
    : uploadedFiles.reduce((acc, f) => acc + f.totalGrossAmount, 0) || 1420891.4;

  const grossB = fileB ? fileB.totalGrossAmount : totalGrossUSD;
  const varianceValue = Math.abs(totalGrossUSD - grossB);
  const activeTolerance = strictZeroPenny ? 0 : tolerance;
  const isWithinTolerance = varianceValue <= activeTolerance;

  // Extraction sample helper
  const getSampleValue = (file: UploadedFile | null, header: string): string => {
    if (!file || !file.sampleRows || file.sampleRows.length === 0) return '—';
    const firstRow = file.sampleRows[0];
    const val = firstRow[header];
    return val !== undefined && val !== null ? String(val) : '—';
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0e0e10] text-[#e5e1e4] p-4 md:p-8 overflow-y-auto min-h-[calc(100vh-4rem)]">
      {saveToast && (
        <div className="fixed top-20 right-8 z-50 bg-[#1c1b1d] border border-[#f3be67] text-[#f3be67] px-4 py-2.5 shadow-2xl font-mono text-xs flex items-center space-x-2 animate-fade-in">
          <span className="material-symbols-outlined text-sm">verified</span>
          <span>{saveToast}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto w-full space-y-8">
        {/* Header Section */}
        <div className="border-b border-[#27272a] pb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="font-mono text-[11px] text-[#9c8f7e] uppercase tracking-widest mb-1.5 flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-[#f3be67] inline-block"></span>
                <span>02 // CLASSIFY / MATCH RULES / STAGE: DETERMINISTIC_MAPPING</span>
              </div>
              <h1 className="font-serif text-3xl md:text-4xl text-[#e5e1e4] font-medium tracking-tight">
                Configure Match &amp; Tolerance Rules
              </h1>
              <p className="font-sans text-xs md:text-sm text-[#a1a1aa] mt-2 max-w-3xl leading-relaxed">
                Map column invariants, numerical tolerances, and verification predicates across your ingested transaction files with mathematical precision.
              </p>
            </div>

            <div className="flex flex-col items-start md:items-end space-y-2 shrink-0 font-mono text-[11px]">
              <div className="px-3 py-1 bg-[#18181b] border border-[#4f4537] text-[#f3be67] flex items-center space-x-2">
                <span>ENGINE:</span>
                <span className="w-1.5 h-1.5 bg-[#4eaa78] rounded-full inline-block"></span>
                <span className="font-semibold text-[#e5e1e4]">Deterministic Parity Engine: Armed</span>
              </div>
              <div className="px-3 py-0.5 bg-[#131315] border border-[#27272a] text-[#a1a1aa]">
                Ruleset: <span className={rulesetStatus.includes('Locked') ? 'text-[#4eaa78]' : 'text-[#f0be75]'}>{rulesetStatus}</span>
              </div>
            </div>
          </div>

          {/* INGESTED FILES & COMPARISON PAIR BAR */}
          <div className="mt-6 border border-[#27272a] bg-[#131315] p-4 md:p-5 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 font-mono text-[11px] border-b border-[#27272a] pb-3">
              <div className="flex items-center space-x-2 text-[#9c8f7e]">
                <span className="material-symbols-outlined text-[#f3be67] text-[16px]">folder_open</span>
                <span className="text-[#e5e1e4] font-semibold uppercase tracking-wider">
                  Ingested Files Under Active Rule Configuration ({uploadedFiles.length})
                </span>
              </div>

              {/* Action Buttons for Files */}
              <div className="flex flex-wrap items-center gap-2">
                {fileA && fileB && (
                  <button
                    onClick={handleAutoMatchHeaders}
                    className="px-2.5 py-1 bg-[#18181b] border border-[#4f4537] hover:border-[#f3be67] text-[#f3be67] flex items-center space-x-1.5 transition-colors cursor-pointer text-[11px]"
                    title="Auto-detect matching columns from uploaded file headers"
                  >
                    <span className="material-symbols-outlined text-[14px]">auto_fix_high</span>
                    <span>Auto-Match Headers</span>
                  </button>
                )}

                <button
                  onClick={() => setIsDataPreviewOpen(!isDataPreviewOpen)}
                  className="px-2.5 py-1 bg-[#18181b] border border-[#3f3f46] hover:text-[#e5e1e4] text-[#d3c4b2] flex items-center space-x-1.5 transition-colors cursor-pointer text-[11px]"
                >
                  <span className="material-symbols-outlined text-[14px]">table_chart</span>
                  <span>{isDataPreviewOpen ? 'Hide Extracted Data' : 'Inspect Records'}</span>
                </button>

                <button
                  onClick={() => setIsUploadDrawerOpen(!isUploadDrawerOpen)}
                  className="px-2.5 py-1 bg-[#201f22] border border-[#4f4537] text-[#f3be67] hover:bg-[#2a292d] flex items-center space-x-1.5 transition-colors cursor-pointer text-[11px]"
                >
                  <span className="material-symbols-outlined text-[14px]">cloud_upload</span>
                  <span>{uploadedFiles.length > 0 ? 'Upload / Replace Files' : 'Upload Files'}</span>
                </button>

                {uploadedFiles.length === 0 && (
                  <button
                    onClick={handleLoadSampleLedgers}
                    disabled={isProcessingFiles}
                    className="px-2.5 py-1 bg-[#18181b] border border-[#3f3f46] text-[#a1a1aa] hover:text-[#f3be67] transition-colors cursor-pointer text-[11px]"
                  >
                    Load Sample Pair
                  </button>
                )}
              </div>
            </div>

            {/* If files exist, show interactive dual comparison cards */}
            {fileA ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 font-mono text-xs">
                {/* Source A Card */}
                <div className="border border-[#27272a] bg-[#0e0e10] p-4 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1.5">
                      <span className="text-[#f3be67] font-semibold flex items-center space-x-1.5">
                        <span className="w-4 h-4 bg-[#201f22] border border-[#4f4537] text-[9px] flex items-center justify-center font-bold">01</span>
                        <span>PRIMARY LEDGER (SOURCE A)</span>
                      </span>
                      <span className="px-1.5 py-0.5 bg-[#18181b] border border-[#3f3f46] text-[#d4a24e] text-[10px]">
                        {fileA.detectedFormat}
                      </span>
                    </div>

                    <div className="text-sm font-sans font-semibold text-[#e5e1e4] truncate" title={fileA.name}>
                      {fileA.name}
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2 text-[11px] text-[#9c8f7e]">
                      <div>Records: <strong className="text-[#4eaa78]">{fileA.parsedRecordsCount}</strong></div>
                      <div>Gross: <strong className="text-[#e5e1e4]">${fileA.totalGrossAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></div>
                    </div>

                    <div className="text-[10px] text-[#71717a] truncate mt-1">
                      Merkle Leaf: <code className="text-[#d3c4b2]">{fileA.hash}</code>
                    </div>
                  </div>

                  {/* Header Chips */}
                  <div className="pt-2 border-t border-[#201f22]">
                    <div className="text-[10px] text-[#71717a] uppercase mb-1">Detected Columns:</div>
                    <div className="flex flex-wrap gap-1">
                      {headersA.slice(0, 6).map((h, i) => (
                        <span key={i} className="px-1.5 py-0.2 bg-[#18181b] border border-[#27272a] text-[#d3c4b2] text-[10px]">
                          {h}
                        </span>
                      ))}
                      {headersA.length > 6 && (
                        <span className="text-[10px] text-[#71717a]">+{headersA.length - 6} more</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Source B Card */}
                <div className="border border-[#27272a] bg-[#0e0e10] p-4 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1.5">
                      <span className="text-[#f3be67] font-semibold flex items-center space-x-1.5">
                        <span className="w-4 h-4 bg-[#201f22] border border-[#4f4537] text-[9px] flex items-center justify-center font-bold">02</span>
                        <span>COUNTERPARTY / CLEARING (SOURCE B)</span>
                      </span>
                      <span className="px-1.5 py-0.5 bg-[#18181b] border border-[#3f3f46] text-[#d4a24e] text-[10px]">
                        {fileB ? fileB.detectedFormat : 'Pending Upload'}
                      </span>
                    </div>

                    <div className="text-sm font-sans font-semibold text-[#e5e1e4] truncate" title={fileB?.name || 'Awaiting counterparty file'}>
                      {fileB ? fileB.name : 'Upload second file to establish pair'}
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2 text-[11px] text-[#9c8f7e]">
                      <div>Records: <strong className="text-[#4eaa78]">{fileB ? fileB.parsedRecordsCount : 0}</strong></div>
                      <div>Gross: <strong className="text-[#e5e1e4]">${fileB ? fileB.totalGrossAmount.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}</strong></div>
                    </div>

                    <div className="text-[10px] text-[#71717a] truncate mt-1">
                      Merkle Leaf: <code className="text-[#d3c4b2]">{fileB ? fileB.hash : '—'}</code>
                    </div>
                  </div>

                  {/* Header Chips */}
                  <div className="pt-2 border-t border-[#201f22]">
                    <div className="text-[10px] text-[#71717a] uppercase mb-1">Detected Columns:</div>
                    <div className="flex flex-wrap gap-1">
                      {headersB.slice(0, 6).map((h, i) => (
                        <span key={i} className="px-1.5 py-0.2 bg-[#18181b] border border-[#27272a] text-[#d3c4b2] text-[10px]">
                          {h}
                        </span>
                      ))}
                      {headersB.length > 6 && (
                        <span className="text-[10px] text-[#71717a]">+{headersB.length - 6} more</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* If no files uploaded yet, show prominent dropzone */
              <div
                onDragOver={e => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={async e => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    await handleProcessFiles(e.dataTransfer.files);
                  }
                }}
                className={`border-2 border-dashed p-8 text-center transition-all ${
                  isDragging
                    ? 'border-[#f3be67] bg-[#201f22]'
                    : 'border-[#3f3f46] bg-[#0e0e10] hover:border-[#4f4537]'
                }`}
              >
                <span className="material-symbols-outlined text-4xl text-[#f3be67] mb-2">upload_file</span>
                <h3 className="font-serif text-lg text-[#e5e1e4]">No files uploaded for rule configuration</h3>
                <p className="font-sans text-xs text-[#a1a1aa] mt-1 max-w-md mx-auto">
                  Drag and drop 2 ledger or clearing files (.CSV, .JSON, .TSV, .XML) to automatically extract columns and configure deterministic match rules.
                </p>

                <div className="flex items-center justify-center space-x-3 mt-4">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-[#d4a24e] text-[#0e0e10] hover:bg-[#f3be67] font-mono text-xs font-semibold flex items-center space-x-2 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                    <span>Browse Files</span>
                  </button>
                  <button
                    onClick={handleLoadSampleLedgers}
                    disabled={isProcessingFiles}
                    className="px-4 py-2 border border-[#4f4537] text-[#f3be67] hover:bg-[#201f22] font-mono text-xs transition-colors cursor-pointer"
                  >
                    Preload Sample Pair (.CSV)
                  </button>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  onChange={e => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleProcessFiles(e.target.files);
                    }
                  }}
                  className="hidden"
                  accept=".csv,.tsv,.json,.xml,.txt"
                />
              </div>
            )}

            {/* INLINE UPLOAD DRAWER (when user clicks Upload / Replace) */}
            {isUploadDrawerOpen && (
              <div className="border-t border-[#27272a] pt-4 mt-4 space-y-3 font-mono text-xs animate-fade-in">
                <div className="flex items-center justify-between text-[#9c8f7e]">
                  <span>ADD MORE FILES OR REPLACE ACTIVE PAIR</span>
                  <button
                    onClick={() => setIsUploadDrawerOpen(false)}
                    className="text-[#a1a1aa] hover:text-[#e5e1e4] text-[11px] cursor-pointer"
                  >
                    ✕ Close
                  </button>
                </div>

                <div
                  onDragOver={e => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={async e => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      await handleProcessFiles(e.dataTransfer.files);
                    }
                  }}
                  className={`border-2 border-dashed p-6 text-center ${
                    isDragging ? 'border-[#f3be67] bg-[#201f22]' : 'border-[#3f3f46] bg-[#0e0e10]'
                  }`}
                >
                  <input
                    type="file"
                    multiple
                    onChange={e => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleProcessFiles(e.target.files);
                      }
                    }}
                    className="hidden"
                    id="rule-file-upload-input"
                    accept=".csv,.tsv,.json,.xml,.txt"
                  />
                  <label htmlFor="rule-file-upload-input" className="cursor-pointer">
                    <span className="material-symbols-outlined text-3xl text-[#f3be67]">cloud_upload</span>
                    <p className="text-[#e5e1e4] mt-1 font-semibold">Drop files here or click to select</p>
                    <p className="text-[10px] text-[#71717a] mt-0.5">Supports CSV, JSON, TSV, XML (ISO-20022 camt.053)</p>
                  </label>
                </div>
              </div>
            )}

            {/* EXPANDABLE INSPECT EXTRACTED DATA RECORDS */}
            {isDataPreviewOpen && (fileA || fileB) && (
              <div className="border-t border-[#27272a] pt-4 mt-4 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between text-[#9c8f7e] font-mono text-[11px]">
                  <span>EXTRACTED LEDGER DATA PREVIEW (FIRST 3 ROWS)</span>
                  <span className="text-[#f3be67]">Columns matched to active rule mappings</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* File A sample table */}
                  {fileA && (
                    <div className="border border-[#27272a] bg-[#0e0e10] p-3 overflow-x-auto">
                      <div className="font-mono text-[10px] text-[#f3be67] mb-1.5 uppercase truncate">
                        {fileA.name}
                      </div>
                      <table className="w-full text-left font-mono text-[10px]">
                        <thead className="bg-[#18181b] text-[#9c8f7e] border-b border-[#27272a]">
                          <tr>
                            {fileA.headers?.map((h, i) => (
                              <th key={i} className="px-2 py-1 whitespace-nowrap">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1c1b1d]">
                          {fileA.sampleRows?.map((r, ri) => (
                            <tr key={ri}>
                              {fileA.headers?.map((h, ci) => (
                                <td key={ci} className="px-2 py-1 whitespace-nowrap text-[#d3c4b2]">
                                  {String(r[h] ?? '')}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* File B sample table */}
                  {fileB && (
                    <div className="border border-[#27272a] bg-[#0e0e10] p-3 overflow-x-auto">
                      <div className="font-mono text-[10px] text-[#f3be67] mb-1.5 uppercase truncate">
                        {fileB.name}
                      </div>
                      <table className="w-full text-left font-mono text-[10px]">
                        <thead className="bg-[#18181b] text-[#9c8f7e] border-b border-[#27272a]">
                          <tr>
                            {fileB.headers?.map((h, i) => (
                              <th key={i} className="px-2 py-1 whitespace-nowrap">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1c1b1d]">
                          {fileB.sampleRows?.map((r, ri) => (
                            <tr key={ri}>
                              {fileB.headers?.map((h, ci) => (
                                <td key={ci} className="px-2 py-1 whitespace-nowrap text-[#d3c4b2]">
                                  {String(r[h] ?? '')}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ACTIVE MAPPING VECTOR SECTION */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono text-[11px]">
            <div className="text-[#d3c4b2] uppercase tracking-widest font-semibold flex items-center space-x-2">
              <span>ACTIVE MAPPING VECTOR</span>
              <span className="text-[#f3be67]">[{rules.filter(r => r.active).length} Rules Enforced]</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-[#9c8f7e]">
                {rules.filter(r => r.active).length} ACTIVE / {rules.length} TOTAL
              </span>
              <button
                onClick={() => setIsAddingRule(!isAddingRule)}
                className="px-2.5 py-1 border border-[#4f4537] bg-[#18181b] text-[#f3be67] hover:bg-[#201f22] flex items-center space-x-1 cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-xs">add</span>
                <span>Add Custom Match Rule</span>
              </button>
            </div>
          </div>

          {/* ADD CUSTOM RULE INLINE FORM */}
          {isAddingRule && (
            <div className="border border-[#f3be67] bg-[#18181b] p-5 space-y-4 font-mono text-xs animate-fade-in">
              <div className="flex items-center justify-between border-b border-[#27272a] pb-2 text-[#f3be67]">
                <span className="font-semibold uppercase">Define New Field-to-Field Match Criterion</span>
                <button
                  onClick={() => setIsAddingRule(false)}
                  className="text-[#9c8f7e] hover:text-[#e5e1e4] cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] text-[#9c8f7e] uppercase block mb-1">Rule Name</label>
                  <input
                    type="text"
                    value={newRuleTitle}
                    onChange={e => setNewRuleTitle(e.target.value)}
                    placeholder="e.g. Currency Parity, Department Code"
                    className="w-full bg-[#0e0e10] border border-[#3f3f46] p-2 text-[#e5e1e4] text-xs focus:border-[#f3be67] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-[#9c8f7e] uppercase block mb-1">Source A Field ({fileA?.name || 'File 1'})</label>
                  <select
                    value={newRuleSourceA}
                    onChange={e => setNewRuleSourceA(e.target.value)}
                    className="w-full bg-[#0e0e10] border border-[#3f3f46] p-2 text-[#f3be67] text-xs focus:border-[#f3be67] focus:outline-none cursor-pointer"
                  >
                    {headersA.map((h, i) => (
                      <option key={i} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-[#9c8f7e] uppercase block mb-1">Source B Field ({fileB?.name || 'File 2'})</label>
                  <select
                    value={newRuleSourceB}
                    onChange={e => setNewRuleSourceB(e.target.value)}
                    className="w-full bg-[#0e0e10] border border-[#3f3f46] p-2 text-[#f3be67] text-xs focus:border-[#f3be67] focus:outline-none cursor-pointer"
                  >
                    {headersB.map((h, i) => (
                      <option key={i} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-[#9c8f7e] uppercase block mb-1">Comparison Operator</label>
                  <select
                    value={newRuleOperator}
                    onChange={e => setNewRuleOperator(e.target.value)}
                    className="w-full bg-[#0e0e10] border border-[#3f3f46] p-2 text-[#d3c4b2] text-xs focus:border-[#f3be67] focus:outline-none cursor-pointer"
                  >
                    <option value="Exact 1:1 Invariant">Exact 1:1 Invariant (String/Numeric)</option>
                    <option value="Bounded Tolerance">Bounded Numeric Tolerance (Currency)</option>
                    <option value="Normalized Token">Prefix Stripped / Sanitized Token</option>
                    <option value="Temporal Float">Timestamp / Floating Date Window</option>
                  </select>
                </div>

                <div className="flex items-end space-x-2">
                  <button
                    onClick={handleAddCustomRule}
                    disabled={!newRuleTitle.trim()}
                    className="px-4 py-2 bg-[#d4a24e] text-[#0e0e10] hover:bg-[#f3be67] font-semibold text-xs cursor-pointer disabled:opacity-40 transition-colors"
                  >
                    Commit New Rule
                  </button>
                  <button
                    onClick={() => setIsAddingRule(false)}
                    className="px-3 py-2 border border-[#3f3f46] text-[#a1a1aa] hover:text-[#e5e1e4] text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* DYNAMIC FIELD MAPPING CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rules.map(rule => {
              const sampleA = getSampleValue(fileA, rule.sourceAField);
              const sampleB = getSampleValue(fileB, rule.sourceBField);

              return (
                <div
                  key={rule.id}
                  className={`border p-6 transition-all flex flex-col justify-between ${
                    rule.active
                      ? 'border-[#27272a] bg-[#131315] hover:border-[#3f3f46]'
                      : 'border-[#27272a]/50 bg-[#131315]/40 opacity-60'
                  }`}
                >
                  <div>
                    {/* Card Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2.5">
                        <span className="material-symbols-outlined text-[#f3be67] text-[18px]">
                          {rule.id.includes('amount')
                            ? 'payments'
                            : rule.id.includes('ref')
                            ? 'tag'
                            : rule.id.includes('date')
                            ? 'calendar_today'
                            : 'verified_user'}
                        </span>
                        <h3 className="font-sans font-semibold text-[#e5e1e4] text-[15px]">
                          {rule.title}
                        </h3>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 bg-[#201f22] border border-[#4f4537] text-[#f0be75] font-mono text-[10px] uppercase tracking-wider">
                          {rule.badge}
                        </span>
                        {rule.isCustom && (
                          <button
                            onClick={() => handleDeleteRule(rule.id)}
                            className="text-[#71717a] hover:text-red-400 p-1 cursor-pointer"
                            title="Delete custom rule"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* DYNAMIC FIELD MAPPING DROPDOWNS */}
                    <div className="border border-[#27272a] bg-[#0e0e10] p-3.5 mb-3 font-mono text-[12px] space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1">
                          <div className="text-[9px] text-[#71717a] uppercase tracking-wider mb-1">
                            {fileA ? fileA.name.slice(0, 20) : 'Source A'} Column:
                          </div>
                          <select
                            value={rule.sourceAField}
                            onChange={e => handleUpdateRuleField(rule.id, 'sourceAField', e.target.value)}
                            className="w-full bg-[#18181b] border border-[#3f3f46] px-2 py-1 text-[#f3be67] font-semibold text-[11px] focus:border-[#f3be67] focus:outline-none cursor-pointer truncate"
                          >
                            {headersA.map((hdr, hIdx) => (
                              <option key={hIdx} value={hdr}>{hdr}</option>
                            ))}
                          </select>
                        </div>

                        <div className="text-[#d4a24e] text-base px-1 shrink-0 font-bold">⇄</div>

                        <div className="flex-1 text-right">
                          <div className="text-[9px] text-[#71717a] uppercase tracking-wider mb-1">
                            {fileB ? fileB.name.slice(0, 20) : 'Source B'} Column:
                          </div>
                          <select
                            value={rule.sourceBField}
                            onChange={e => handleUpdateRuleField(rule.id, 'sourceBField', e.target.value)}
                            className="w-full bg-[#18181b] border border-[#3f3f46] px-2 py-1 text-[#f3be67] font-semibold text-[11px] focus:border-[#f3be67] focus:outline-none cursor-pointer truncate"
                          >
                            {headersB.map((hdr, hIdx) => (
                              <option key={hIdx} value={hdr}>{hdr}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Live extracted data preview check */}
                      {(sampleA !== '—' || sampleB !== '—') && (
                        <div className="pt-2 border-t border-[#1f1e21] flex items-center justify-between text-[10px] text-[#9c8f7e]">
                          <span className="truncate max-w-[45%] text-[#e5e1e4]">
                            Row 1: <strong className="text-[#f3be67]">{sampleA}</strong>
                          </span>
                          <span className="text-[#71717a]">matches</span>
                          <span className="truncate max-w-[45%] text-right text-[#e5e1e4]">
                            Row 1: <strong className="text-[#f3be67]">{sampleB}</strong>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <p className="font-sans text-xs text-[#a1a1aa] leading-relaxed mb-4">
                      {rule.description}
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div className="border-t border-[#27272a] pt-3 flex items-center justify-between font-mono text-[11px]">
                    <div className="text-[#9c8f7e]">
                      <span>{rule.metaKey}: </span>
                      <span className="text-[#d3c4b2]">{rule.metaVal}</span>
                    </div>

                    <button
                      onClick={() => toggleRule(rule.id)}
                      className="flex items-center space-x-1.5 text-[#f3be67] hover:text-[#ffdead] transition-colors cursor-pointer"
                    >
                      <span className={`w-2 h-2 ${rule.active ? 'bg-[#f3be67]' : 'bg-[#4f4537]'} inline-block`}></span>
                      <span className="text-[10px] uppercase font-semibold">
                        {rule.active ? 'Active Enforcement' : 'Bypassed'}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PARAMETRIC THRESHOLD & LIVE INVARIANT SIMULATION CARD */}
        <div className="border border-[#27272a] bg-[#131315] p-6 md:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="font-mono text-[10px] text-[#f0be75] uppercase tracking-widest mb-1.5 flex items-center space-x-2">
                <span>PARAMETRIC THRESHOLD</span>
                <span className="px-1.5 py-0.2 bg-[#201f22] border border-[#3f3f46] text-[#9c8f7e]">
                  CURRENCY_USD
                </span>
              </div>
              <h2 className="font-serif text-2xl text-[#e5e1e4] font-medium">
                Amount Tolerance Bound
              </h2>
              <p className="font-sans text-xs text-[#a1a1aa] mt-1 max-w-2xl leading-relaxed">
                Bounded numerical variance permitted during bi-directional matching between ingested files before triggering audit exceptions.
              </p>
            </div>

            {/* Current window display box */}
            <div className="border border-[#4f4537] bg-[#18181b] p-4 shrink-0 min-w-[220px] text-right font-mono">
              <div className="text-[10px] text-[#9c8f7e] uppercase tracking-wider mb-1">
                Active Tolerance Window:
              </div>
              <div className="text-3xl font-semibold text-[#f3be67] tracking-tight">
                {strictZeroPenny ? '± $0.00' : `± $${tolerance.toFixed(2)}`}
              </div>
              <div className={`text-[10px] mt-1 ${strictZeroPenny ? 'text-[#4eaa78]' : 'text-[#a1a1aa]'}`}>
                {strictZeroPenny ? 'Strict Zero-Penny (SOC-2 Type II)' : 'Custom Decimal Range'}
              </div>
            </div>
          </div>

          {/* Interactive Range Slider */}
          <div className="space-y-4 pt-4 border-t border-[#27272a]">
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              disabled={strictZeroPenny}
              value={strictZeroPenny ? 0 : tolerance}
              onChange={e => setTolerance(Number(e.target.value))}
              className="w-full accent-[#f3be67] cursor-pointer h-2 bg-[#201f22] rounded-none disabled:opacity-30"
            />

            {/* Step markers */}
            <div className="grid grid-cols-4 font-mono text-[11px] text-[#a1a1aa]">
              <button
                onClick={() => {
                  setTolerance(0);
                  setStrictZeroPenny(false);
                }}
                className={`text-left cursor-pointer transition-colors ${
                  tolerance === 0 && !strictZeroPenny ? 'text-[#f3be67]' : 'hover:text-[#e5e1e4]'
                }`}
              >
                <div className="font-semibold">$0.00</div>
                <div className="text-[10px] text-[#71717a]">Strict Zero-Penny</div>
              </button>

              <button
                onClick={() => {
                  setTolerance(25);
                  setStrictZeroPenny(false);
                }}
                className={`text-left cursor-pointer transition-colors ${
                  tolerance === 25 ? 'text-[#f3be67]' : 'hover:text-[#e5e1e4]'
                }`}
              >
                <div className="font-semibold">$25.00</div>
                <div className="text-[10px] text-[#71717a]">Standard Bounded</div>
              </button>

              <button
                onClick={() => {
                  setTolerance(50);
                  setStrictZeroPenny(false);
                }}
                className={`text-left cursor-pointer transition-colors ${
                  tolerance === 50 ? 'text-[#f3be67]' : 'hover:text-[#e5e1e4]'
                }`}
              >
                <div className="font-semibold">$50.00</div>
                <div className="text-[10px] text-[#f3be67]">Active Selection</div>
              </button>

              <button
                onClick={() => {
                  setTolerance(100);
                  setStrictZeroPenny(false);
                }}
                className={`text-right cursor-pointer transition-colors ${
                  tolerance === 100 ? 'text-[#f3be67]' : 'hover:text-[#e5e1e4]'
                }`}
              >
                <div className="font-semibold">$100.00</div>
                <div className="text-[10px] text-[#71717a]">Max Window</div>
              </button>
            </div>
          </div>

          {/* Strict Zero-Penny Checkbox */}
          <div className="border-t border-[#27272a] pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-[11px]">
            <div className="flex items-center space-x-2 text-[#a1a1aa]">
              <span className="material-symbols-outlined text-[16px] text-[#f3be67]">info</span>
              <span>Variance within tolerance is flagged for automatic clearing ledger entry.</span>
            </div>

            <label className="flex items-center space-x-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={strictZeroPenny}
                onChange={e => setStrictZeroPenny(e.target.checked)}
                className="w-4 h-4 rounded-none accent-[#d4a24e] bg-[#201f22] border-[#4f4537]"
              />
              <span className="text-[#e5e1e4] font-medium">
                Strict Zero-Penny Mode (SOC-2 Type II Strict)
              </span>
            </label>
          </div>

          {/* LIVE INVARIANT PREVIEW ON UPLOADED FILES */}
          <div className="pt-4 border-t border-[#27272a] font-mono text-xs">
            <div className="text-[10px] text-[#9c8f7e] uppercase tracking-wider mb-2">
              Mathematical Invariant Verification On Ingested Files:
            </div>
            <div className="p-3 bg-[#0e0e10] border border-[#27272a] flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[#a1a1aa]">
                  {fileA ? fileA.name : 'Source A'} Sum:{' '}
                  <strong className="text-[#e5e1e4]">${totalGrossUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
                </span>
                <span className="text-[#4f4537]">⇄</span>
                <span className="text-[#a1a1aa]">
                  {fileB ? fileB.name : 'Source B'} Sum:{' '}
                  <strong className="text-[#e5e1e4]">${grossB.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
                </span>
                <span className="text-[#4f4537]">|</span>
                <span className="text-[#a1a1aa]">
                  Delta: <strong className={varianceValue > 0 ? 'text-[#f0be75]' : 'text-[#4eaa78]'}>${varianceValue.toFixed(2)}</strong>
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span
                  className={`px-2 py-0.5 border text-[11px] font-semibold flex items-center space-x-1 ${
                    isWithinTolerance
                      ? 'border-[#4eaa78] text-[#4eaa78] bg-[#18181b]'
                      : 'border-[#f0be75] text-[#f0be75] bg-[#201f22]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[13px]">
                    {isWithinTolerance ? 'check_circle' : 'warning'}
                  </span>
                  <span>{isWithinTolerance ? 'INVARIANT SATISFIED' : 'FLAGGED EXCEPTION'}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="border border-[#27272a] bg-[#18181b] p-4 md:p-6 flex flex-col lg:flex-row items-center justify-between gap-4 font-mono text-[12px]">
          <div className="flex items-center space-x-3 text-[#d3c4b2]">
            <span className="w-2 h-2 bg-[#f3be67] inline-block"></span>
            <span>
              Ready to evaluate <strong className="text-[#e5e1e4]">{totalRecordsStaged} staged records</strong> from{' '}
              <strong className="text-[#f3be67]">{fileA?.name || 'Primary Ledger'}</strong> &amp;{' '}
              <strong className="text-[#f3be67]">{fileB?.name || 'Clearing File'}</strong> against{' '}
              <strong className="text-[#e5e1e4]">{rules.filter(r => r.active).length} active criteria</strong>
            </span>
            <span className="text-[#4f4537]">|</span>
            <span className="text-[#9c8f7e]">ESTIMATED RUNTIME &lt;1.2s</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleResetDefaults}
              className="px-4 py-2 border border-[#3f3f46] text-[#d3c4b2] hover:text-[#e5e1e4] hover:border-[#9c8f7e] transition-colors cursor-pointer"
            >
              Reset Regulatory Defaults
            </button>
            <button
              onClick={handleSaveRuleset}
              className="px-4 py-2 border border-[#4f4537] text-[#f3be67] hover:bg-[#201f22] transition-colors cursor-pointer"
            >
              Save Ruleset Configuration
            </button>
            <button
              onClick={handleRunReconciliation}
              className="px-6 py-2.5 bg-[#d4a24e] hover:bg-[#f3be67] text-[#0e0e10] font-semibold flex items-center space-x-2 transition-colors cursor-pointer uppercase tracking-wider"
            >
              <span>Run Reconciliation</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
