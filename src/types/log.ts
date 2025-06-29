
export interface LogEntry {
  id?: string;
  summary?: string;
  message?: string;
  service?: string;
  cabinetName: string;
  status?: 'Error' | 'Warn' | 'Info' | 'Success';
  timestamp?: string;
  [key: string]: any;
}

export interface LogState {
  id: string;
  log_id: string;
  cabinet_name: string;
  processed: boolean;
  comment?: string;
  in_progress: boolean;
  created_at: string;
  updated_at: string;
}

export interface CabinetWorkSession {
  id: string;
  cabinet_name: string;
  started_at: string;
  updated_at: string;
}

export interface ProcessedLogEntry extends LogEntry {
  log_id: string;
  processed: boolean;
  comment?: string;
  in_progress: boolean;
}
