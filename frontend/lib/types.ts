export type RawRow = Record<string, string>;

export interface CrmRecord {
  created_at: string;
  name: string;
  email: string;
  country_code: string;
  mobile_without_country_code: string;
  company: string;
  city: string;
  state: string;
  country: string;
  lead_owner: string;
  crm_status: string;
  crm_note: string;
  data_source: string;
  possession_time: string;
  description: string;
}

export interface SkippedRecord {
  reason: string;
  source_row: RawRow;
}

export interface ImportProgress {
  type: 'progress';
  completedBatches: number;
  totalBatches: number;
  importedSoFar: number;
  skippedSoFar: number;
}

export interface ImportDone {
  type: 'done';
  imported: CrmRecord[];
  skipped: SkippedRecord[];
  totalImported: number;
  totalSkipped: number;
  totalRows: number;
  totalBatches: number;
}

export interface ImportError {
  type: 'error';
  error: string;
}

export type ImportStreamEvent = ImportProgress | ImportDone | ImportError;

export const CRM_FIELD_ORDER: (keyof CrmRecord)[] = [
  'created_at',
  'name',
  'email',
  'country_code',
  'mobile_without_country_code',
  'company',
  'city',
  'state',
  'country',
  'lead_owner',
  'crm_status',
  'crm_note',
  'data_source',
  'possession_time',
  'description',
];
