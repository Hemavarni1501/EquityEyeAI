export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  RESULTS = 'RESULTS',
  ERROR = 'ERROR'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface UploadedFile {
  name: string;
  type: string;
  data: string; // Base64
}

export interface AuditResult {
  fullReport: string;
  score?: number; // Parsed from the report if possible
}
