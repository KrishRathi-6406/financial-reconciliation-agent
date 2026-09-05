export type ScreenId = 
  | 'overview' 
  | 'rule-matching' 
  | 'processing-run' 
  | 'run-history' 
  | 'exceptions' 
  | 'settings';

export interface LedgerTransaction {
  id: string;
  timestamp: string;
  sourceA: {
    entity: string;
    reference: string;
    amount: number;
    currency: string;
  };
  sourceB: {
    entity: string;
    reference: string;
    amount: number;
    currency: string;
  };
  delta: number;
  status: 'concordant' | 'partial' | 'exception';
  statusLabel: string;
  statusNote?: string;
  actionRequired?: 'reclass' | 'adjust' | 'verified';
  auditHash: string;
}

export interface HistoricalBatch {
  id: string;
  dateUtc: string;
  name: string;
  sourcePair: string;
  sha: string;
  pipeline: string;
  recordCount: number;
  grossVolume: number;
  grossVolumeFormatted: string;
  matchRate: number;
  exceptionsCount: number;
  merkleRoot: string;
  status: 'sealed' | 'audited' | 'immutable';
}

export interface RuleCriteria {
  id: string;
  title: string;
  badge: string;
  sourceAField: string;
  sourceBField: string;
  description: string;
  metaKey: string;
  metaVal: string;
  active: boolean;
  operator?: string;
  isCustom?: boolean;
}

export interface MicroStage {
  id: string;
  label: string;
  status: 'done' | 'active' | 'queued';
  badgeText: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content: string;
  parsedRecordsCount: number;
  totalGrossAmount: number;
  hash: string;
  detectedFormat: string;
  headers?: string[];
  sampleRows?: Array<Record<string, string | number>>;
}

export interface IngestionBatchConfig {
  batchName: string;
  tolerance: number;
  strictZeroPenny?: boolean;
  uploadedFiles: UploadedFile[];
  sourceSummary?: string;
  sourceA?: string;
  sourceB?: string;
}
