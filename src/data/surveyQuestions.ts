export interface QuestionDefinition {
  id: string;
  section: string;
  title: string;
  subtitle?: string;
  type: 'text' | 'textarea' | 'select' | 'scale' | 'checkbox-group' | 'radio-group' | 'boolean';
  options?: string[];
  required: boolean;
  placeholder?: string;
}

export const CAPABILITY_OPTIONS = [
  '⚡ Fast & Clean Modern Interface',
  '🔄 Real-Time Collaboration & Sharing',
  '📊 Visual Analytics & Reports Export (PDF/Excel)',
  '🤖 AI-Powered Assistance & Smart Suggestions',
  '📱 Seamless Mobile & Responsive Experience',
  '🔒 High Security, Privacy & Data Encryption',
  '🔌 Direct Integration with Google Workspace / Slack',
  '📶 Offline Support & Automatic Sync'
];

export const FREQUENCY_OPTIONS = [
  'Daily',
  'Several times a week',
  'Weekly',
  'Occasionally',
  'Rarely'
] as const;

export const PLATFORM_OPTIONS = [
  'Web App',
  'Mobile App (iOS/Android)',
  'Desktop App',
  'Browser Extension',
  'Cross-Platform'
] as const;

export const DEFAULT_TARGET_EMAIL = 'vexloraindia@gmail.com';

export const DEFAULT_TESTERS = [
  'joshi.namburu8@gmail.com',
  'senikushikumari@gmail.com'
];
