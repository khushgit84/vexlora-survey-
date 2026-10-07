export interface SurveyResponse {
  id: string;
  submittedAt: string;
  respondentName: string;
  respondentEmail: string;
  organizationOrRole: string;
  primaryProblems: string;
  problemFrequency: 'Daily' | 'Several times a week' | 'Weekly' | 'Occasionally' | 'Rarely';
  severityRating: number; // 1 to 10
  currentToolsOrWorkarounds: string;
  suggestedFeatures: string;
  preferredPlatform: 'Web App' | 'Mobile App (iOS/Android)' | 'Desktop App' | 'Browser Extension' | 'Cross-Platform';
  mustHaveCapabilities: string[];
  switchingFactor: string;
  willingToBetaTest: boolean;
  additionalNotes: string;
  syncedToSheet?: boolean;
  emailedToVexlora?: boolean;
  sheetRowIndex?: number;
}

export interface WorkspaceConfig {
  targetEmail: string;
  spreadsheetId: string | null;
  spreadsheetUrl: string | null;
  formId: string | null;
  formUrl: string | null;
  formEditUrl: string | null;
  authorizedTesters?: string[];
}
