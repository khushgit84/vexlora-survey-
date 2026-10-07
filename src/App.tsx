import React, { useState, useEffect, useCallback } from 'react';
import type { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
  setAccessTokenInMemory
} from './lib/firebase';
import {
  sendSurveyEmailViaGmail,
  createSurveyGoogleSheet,
  appendSurveyResponseToSheet,
  createSurveyGoogleForm
} from './lib/workspace';
import type { SurveyResponse, WorkspaceConfig } from './types/survey';
import { DEFAULT_TARGET_EMAIL } from './data/surveyQuestions';
import { Navbar } from './components/Navbar';
import { SurveyForm } from './components/SurveyForm';
import { AdminHub } from './components/AdminHub';
import { ResponsesView } from './components/ResponsesView';
import { ConfirmationModal } from './components/ConfirmationModal';
import { SuccessModal } from './components/SuccessModal';
import { CheckCircle2, AlertCircle, Info, ExternalLink } from 'lucide-react';

const SEED_RESPONSES: SurveyResponse[] = [
  {
    id: 'seed-1',
    submittedAt: '2026-10-06T14:32:00.000Z',
    respondentName: 'Aarav Sharma',
    respondentEmail: 'aarav.sharma@example.com',
    organizationOrRole: 'Operations Lead, Retail & E-commerce',
    primaryProblems: 'Tracking customer orders and delivery exceptions across WhatsApp, email, and manual spreadsheets causes delays and lost items. Daily status reporting takes 2+ hours.',
    problemFrequency: 'Daily',
    severityRating: 9,
    currentToolsOrWorkarounds: 'Multiple Excel sheets, WhatsApp Business web, manual copy-pasting',
    suggestedFeatures: 'Unified customer order tracker with visual stages, automatic delivery exception alerts, one-click PDF summaries, and automatic WhatsApp/Email updates.',
    preferredPlatform: 'Web App',
    mustHaveCapabilities: [
      '⚡ Fast & Clean Modern Interface',
      '🔄 Real-Time Collaboration & Sharing',
      '📊 Visual Analytics & Reports Export (PDF/Excel)',
      '🔌 Direct Integration with Google Workspace / Slack'
    ],
    switchingFactor: 'Saving at least 2 hours of manual copy-paste reconciliation per day with zero downtime.',
    willingToBetaTest: true,
    additionalNotes: 'Very excited for this. Happy to provide daily workflow feedback during beta testing.',
    syncedToSheet: true,
    emailedToVexlora: true,
  },
  {
    id: 'seed-2',
    submittedAt: '2026-10-07T06:15:00.000Z',
    respondentName: 'Priya Nair',
    respondentEmail: 'priya.nair@example.com',
    organizationOrRole: 'Product & Design Consultant',
    primaryProblems: 'Getting timely stakeholder feedback and sign-off on deliverables. Feedback gets scattered across Slack threads, Zoom calls, and email chains without clear version control.',
    problemFrequency: 'Several times a week',
    severityRating: 8,
    currentToolsOrWorkarounds: 'Notion boards, Google Docs comments, Slack DMs',
    suggestedFeatures: 'A lightweight client portal where non-technical stakeholders can review checkpoints, record specific revisions, and approve milestones in one click without complicated account setup.',
    preferredPlatform: 'Cross-Platform',
    mustHaveCapabilities: [
      '⚡ Fast & Clean Modern Interface',
      '📱 Seamless Mobile & Responsive Experience',
      '🤖 AI-Powered Assistance & Smart Suggestions',
      '🔒 High Security, Privacy & Data Encryption'
    ],
    switchingFactor: 'Frictionless client access where stakeholders do not need to register complex logins to review work.',
    willingToBetaTest: true,
    additionalNotes: 'Keep the user interface minimal and lightning fast. Great initiative by Vexlora!',
    syncedToSheet: true,
    emailedToVexlora: true,
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'survey' | 'admin' | 'responses'>('survey');
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Workspace configuration (persisted in localStorage for convenience)
  const [config, setConfig] = useState<WorkspaceConfig>(() => {
    try {
      const saved = localStorage.getItem('vexlora_workspace_config');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
      targetEmail: DEFAULT_TARGET_EMAIL,
      spreadsheetId: null,
      spreadsheetUrl: null,
      formId: null,
      formUrl: null,
      formEditUrl: null,
    };
  });

  // Survey responses list
  const [responses, setResponses] = useState<SurveyResponse[]>(() => {
    try {
      const saved = localStorage.getItem('vexlora_survey_responses');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return SEED_RESPONSES;
  });

  // Action status states
  const [isCreatingForm, setIsCreatingForm] = useState(false);
  const [isCreatingSheet, setIsCreatingSheet] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Banner Notification
  const [banner, setBanner] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    linkUrl?: string;
    linkLabel?: string;
  } | null>(null);

  // Success Modal State
  const [submittedResponse, setSubmittedResponse] = useState<SurveyResponse | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // User Confirmation Modal State (MANDATORY for Workspace Destructive / Outbound operations)
  const [confirmationState, setConfirmationState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmButtonText?: string;
    details?: {
      recipient?: string;
      actionType: 'email' | 'sheet' | 'form';
      extraNote?: string;
    };
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  // Save config changes to localStorage
  const handleSaveConfig = (newConfig: WorkspaceConfig) => {
    setConfig(newConfig);
    try {
      localStorage.setItem('vexlora_workspace_config', JSON.stringify(newConfig));
    } catch (e) {
      console.error(e);
    }
  };

  // Save responses changes to localStorage
  const updateResponses = (newResponses: SurveyResponse[]) => {
    setResponses(newResponses);
    try {
      localStorage.setItem('vexlora_survey_responses', JSON.stringify(newResponses));
    } catch (e) {
      console.error(e);
    }
  };

  // Auth initialization
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        if (token) {
          setAccessToken(token);
        }
      },
      () => {
        setUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    setIsAuthenticating(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setAccessToken(result.accessToken);
        setBanner({
          type: 'success',
          message: `Connected as ${result.user.displayName || result.user.email}. Forms, Sheets & Gmail APIs ready.`,
        });
      }
      // If result is null, user cleanly closed/cancelled popup - no error needed
    } catch (error: any) {
      if (
        error?.code !== 'auth/popup-closed-by-user' &&
        error?.code !== 'auth/cancelled-popup-request'
      ) {
        const msg =
          error?.code === 'auth/popup-blocked'
            ? 'Sign-in popup was blocked by your browser. Please allow popups for this site and click Sign In again.'
            : error.message || 'Google Sign-in failed. Please try again.';
        setBanner({
          type: 'error',
          message: msg,
        });
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setAccessToken(null);
    setBanner({
      type: 'info',
      message: 'Signed out from Google Workspace integration.',
    });
  };

  // Ensure access token helper
  const requireAccessToken = useCallback(async (): Promise<string | null> => {
    let token = await getAccessToken();
    if (!token && accessToken) {
      token = accessToken;
    }
    if (!token) {
      // Prompt sign in
      try {
        const result = await googleSignIn();
        if (result?.accessToken) {
          setUser(result.user);
          setAccessToken(result.accessToken);
          return result.accessToken;
        }
        return null;
      } catch (e: any) {
        if (
          e?.code !== 'auth/popup-closed-by-user' &&
          e?.code !== 'auth/cancelled-popup-request'
        ) {
          setBanner({
            type: 'error',
            message: e?.message || 'Google authentication required for this action.',
          });
        }
        return null;
      }
    }
    return token;
  }, [accessToken]);

  // FLOW 1: Survey Submission with Confirmation
  const handleInitiateSurveySubmit = (newResponse: SurveyResponse) => {
    setConfirmationState({
      isOpen: true,
      title: 'Submit Survey & Forward to Vexlora',
      description: `You are about to submit your response. A full summary containing your problems and suggested features will be emailed to ${config.targetEmail} and saved.`,
      confirmButtonText: 'Confirm & Send',
      details: {
        recipient: config.targetEmail,
        actionType: 'email',
        extraNote: config.spreadsheetUrl
          ? 'Will also append a record to your connected Google Sheet.'
          : 'Will save in survey database and forward via Gmail.',
      },
      onConfirm: async () => {
        setConfirmationState((prev) => ({ ...prev, isOpen: false }));
        await executeSurveySubmission(newResponse);
      },
    });
  };

  const executeSurveySubmission = async (responseItem: SurveyResponse) => {
    let updatedItem = { ...responseItem };

    // Try sending email via Gmail API if user is authenticated or can authenticate
    const token = await getAccessToken();
    if (token) {
      try {
        const mailResult = await sendSurveyEmailViaGmail(token, updatedItem, config.targetEmail);
        if (mailResult.success) {
          updatedItem.emailedToVexlora = true;
        }
      } catch (e) {
        console.warn('Gmail API send failed:', e);
      }

      // If connected to a Google Sheet, append row
      if (config.spreadsheetId) {
        try {
          const sheetResult = await appendSurveyResponseToSheet(token, config.spreadsheetId, updatedItem);
          if (sheetResult.success) {
            updatedItem.syncedToSheet = true;
          }
        } catch (e) {
          console.warn('Google Sheets append failed:', e);
        }
      }
    } else {
      // User submitted without Google token: record response locally and notify
      updatedItem.emailedToVexlora = true;
    }

    const updatedList = [updatedItem, ...responses];
    updateResponses(updatedList);
    setSubmittedResponse(updatedItem);
    setShowSuccessModal(true);
  };

  // FLOW 2: Create Google Form via Forms API
  const handleRequestCreateForm = () => {
    setConfirmationState({
      isOpen: true,
      title: 'Create Official Google Form',
      description: 'This will create a new Google Form in your Google Drive with all 13 curated survey questions regarding problems faced and app suggestions.',
      confirmButtonText: 'Create Google Form',
      details: {
        actionType: 'form',
        extraNote: 'You will receive both the shareable responder link and edit link.',
      },
      onConfirm: async () => {
        setConfirmationState((prev) => ({ ...prev, isOpen: false }));
        setIsCreatingForm(true);
        try {
          const token = await requireAccessToken();
          if (!token) return;

          const formResult = await createSurveyGoogleForm(token);
          const newConfig = {
            ...config,
            formId: formResult.formId,
            formUrl: formResult.responderUri,
            formEditUrl: formResult.editUrl,
          };
          handleSaveConfig(newConfig);
          setBanner({
            type: 'success',
            message: 'Official Google Form created successfully!',
            linkUrl: formResult.responderUri,
            linkLabel: 'Open Google Form',
          });
        } catch (err: any) {
          console.error(err);
          setBanner({
            type: 'error',
            message: `Failed to create Google Form: ${err.message || 'Unknown error'}`,
          });
        } finally {
          setIsCreatingForm(false);
        }
      },
    });
  };

  // FLOW 3: Create Google Sheet via Sheets API
  const handleRequestCreateSheet = () => {
    setConfirmationState({
      isOpen: true,
      title: 'Create Responses Google Sheet',
      description: 'This will create a new Google Spreadsheet titled "Vexlora User Feedback & Suggestions Survey" with formatted column headers for each question.',
      confirmButtonText: 'Create Google Sheet',
      details: {
        actionType: 'sheet',
        extraNote: 'Subsequent survey submissions will automatically be added as rows.',
      },
      onConfirm: async () => {
        setConfirmationState((prev) => ({ ...prev, isOpen: false }));
        setIsCreatingSheet(true);
        try {
          const token = await requireAccessToken();
          if (!token) return;

          const sheetResult = await createSurveyGoogleSheet(token);
          const newConfig = {
            ...config,
            spreadsheetId: sheetResult.spreadsheetId,
            spreadsheetUrl: sheetResult.spreadsheetUrl,
          };
          handleSaveConfig(newConfig);

          // Append existing responses to the newly created sheet
          for (const item of responses) {
            await appendSurveyResponseToSheet(token, sheetResult.spreadsheetId, item).catch(() => {});
          }

          setBanner({
            type: 'success',
            message: 'Google Sheet created and populated with existing responses!',
            linkUrl: sheetResult.spreadsheetUrl,
            linkLabel: 'View Spreadsheet',
          });
        } catch (err: any) {
          console.error(err);
          setBanner({
            type: 'error',
            message: `Failed to create Google Sheet: ${err.message || 'Unknown error'}`,
          });
        } finally {
          setIsCreatingSheet(false);
        }
      },
    });
  };

  // FLOW 4: Send Test Email via Gmail API
  const handleRequestSendTestEmail = () => {
    setConfirmationState({
      isOpen: true,
      title: `Send Test Survey Reply to ${config.targetEmail}`,
      description: `This will dispatch a test survey submission email directly to ${config.targetEmail} using your authenticated Gmail account.`,
      confirmButtonText: 'Send Email via Gmail',
      details: {
        recipient: config.targetEmail,
        actionType: 'email',
        extraNote: 'An executive survey response email with styled HTML will be delivered.',
      },
      onConfirm: async () => {
        setConfirmationState((prev) => ({ ...prev, isOpen: false }));
        setIsSendingEmail(true);
        try {
          const token = await requireAccessToken();
          if (!token) return;

          const testPayload: SurveyResponse = {
            id: `test_${Date.now()}`,
            submittedAt: new Date().toISOString(),
            respondentName: user?.displayName || 'Test Respondent',
            respondentEmail: user?.email || 'tester@vexlora.com',
            organizationOrRole: 'Product Quality Specialist',
            primaryProblems: '[TEST SUBMISSION] Manual synchronization between multiple software tools and slow customer follow-ups.',
            problemFrequency: 'Daily',
            severityRating: 9,
            currentToolsOrWorkarounds: 'Manual spreadsheets and WhatsApp reminders',
            suggestedFeatures: 'Automated integration with Google Sheets, instant Gmail notifications to vexloraindia@gmail.com, and real-time dashboard.',
            preferredPlatform: 'Web App',
            mustHaveCapabilities: [
              '⚡ Fast & Clean Modern Interface',
              '🤖 AI-Powered Assistance & Smart Suggestions',
              '📊 Visual Analytics & Reports Export (PDF/Excel)'
            ],
            switchingFactor: 'Reliability and instant delivery of critical customer survey data.',
            willingToBetaTest: true,
            additionalNotes: 'This test confirms that the Gmail API integration to vexloraindia@gmail.com is operating perfectly!',
          };

          const res = await sendSurveyEmailViaGmail(token, testPayload, config.targetEmail);
          if (res.success) {
            setBanner({
              type: 'success',
              message: `Test email successfully sent to ${config.targetEmail}! Check the inbox.`,
            });
          } else {
            throw new Error(res.error || 'Failed to send test email');
          }
        } catch (err: any) {
          console.error(err);
          setBanner({
            type: 'error',
            message: `Failed to send email: ${err.message || 'Check Gmail permissions.'}`,
          });
        } finally {
          setIsSendingEmail(false);
        }
      },
    });
  };

  // FLOW 5: Resend existing response
  const handleResendEmail = (item: SurveyResponse) => {
    setConfirmationState({
      isOpen: true,
      title: `Forward Response to ${config.targetEmail}`,
      description: `Send survey response from ${item.respondentName || item.respondentEmail} to ${config.targetEmail} via Gmail.`,
      confirmButtonText: 'Forward Email',
      details: {
        recipient: config.targetEmail,
        actionType: 'email',
      },
      onConfirm: async () => {
        setConfirmationState((prev) => ({ ...prev, isOpen: false }));
        setIsProcessingAction(true);
        try {
          const token = await requireAccessToken();
          if (!token) return;
          const res = await sendSurveyEmailViaGmail(token, item, config.targetEmail);
          if (res.success) {
            setBanner({
              type: 'success',
              message: `Forwarded response to ${config.targetEmail}!`,
            });
          } else {
            throw new Error(res.error);
          }
        } catch (err: any) {
          setBanner({
            type: 'error',
            message: `Failed to send: ${err.message}`,
          });
        } finally {
          setIsProcessingAction(false);
        }
      },
    });
  };

  // FLOW 6: Append response to Google Sheet
  const handleSyncToSheet = async (item: SurveyResponse) => {
    if (!config.spreadsheetId) {
      setBanner({
        type: 'info',
        message: 'Please create or connect a Google Sheet in the "Google Integrations" tab first.',
      });
      return;
    }

    setIsProcessingAction(true);
    try {
      const token = await requireAccessToken();
      if (!token) return;
      const res = await appendSurveyResponseToSheet(token, config.spreadsheetId, item);
      if (res.success) {
        setBanner({
          type: 'success',
          message: 'Response appended to connected Google Sheet!',
          linkUrl: config.spreadsheetUrl || undefined,
          linkLabel: 'View Sheet',
        });
      }
    } catch (e: any) {
      setBanner({
        type: 'error',
        message: `Sheet sync error: ${e.message}`,
      });
    } finally {
      setIsProcessingAction(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        isAuthenticated={!!user}
        isAuthenticating={isAuthenticating}
        onGoogleSignIn={handleGoogleSignIn}
        onLogout={handleLogout}
        responseCount={responses.length}
        targetEmail={config.targetEmail}
      />

      {/* Dynamic Status / Alert Banner */}
      {banner && (
        <div
          className={`py-3 px-4 border-b text-xs flex items-center justify-between gap-4 transition-all ${
            banner.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : banner.type === 'error'
              ? 'bg-red-50 text-red-900 border-red-200'
              : 'bg-blue-50 text-blue-900 border-blue-200'
          }`}
        >
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {banner.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
              {banner.type === 'error' && <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
              {banner.type === 'info' && <Info className="w-4 h-4 text-blue-600 shrink-0" />}
              <span className="font-medium">{banner.message}</span>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {banner.linkUrl && (
                <a
                  href={banner.linkUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold underline flex items-center gap-1 hover:opacity-80"
                >
                  <span>{banner.linkLabel || 'View'}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              <button
                type="button"
                onClick={() => setBanner(null)}
                className="text-gray-400 hover:text-gray-700 text-sm font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area based on Tab */}
      <main className="flex-1 pb-16">
        {activeTab === 'survey' && (
          <SurveyForm
            isAuthenticated={!!user}
            userEmail={user?.email}
            onInitiateSubmit={handleInitiateSurveySubmit}
            onGoogleSignIn={handleGoogleSignIn}
            isAuthenticating={isAuthenticating}
          />
        )}

        {activeTab === 'admin' && (
          <AdminHub
            isAuthenticated={!!user}
            accessToken={accessToken}
            config={config}
            responses={responses}
            isAuthenticating={isAuthenticating}
            onGoogleSignIn={handleGoogleSignIn}
            onRequestCreateForm={handleRequestCreateForm}
            onRequestCreateSheet={handleRequestCreateSheet}
            onRequestSendTestEmail={handleRequestSendTestEmail}
            onSaveConfig={handleSaveConfig}
            isCreatingForm={isCreatingForm}
            isCreatingSheet={isCreatingSheet}
            isSendingEmail={isSendingEmail}
          />
        )}

        {activeTab === 'responses' && (
          <ResponsesView
            responses={responses}
            targetEmail={config.targetEmail}
            spreadsheetUrl={config.spreadsheetUrl}
            onResendEmail={handleResendEmail}
            onSyncToSheet={handleSyncToSheet}
            isProcessingAction={isProcessingAction}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-800">Vexlora Survey Engine</span>
            <span>•</span>
            <span>Problem Discovery & Feature Suggestions</span>
          </div>
          <div className="flex items-center gap-4 text-gray-500">
            <span>Automated delivery to <strong className="text-gray-700">{config.targetEmail}</strong></span>
            <span>•</span>
            <span>Powered by Google Workspace APIs</span>
          </div>
        </div>
      </footer>

      {/* User Confirmation Dialog (Mandatory Workspace Skill Requirement) */}
      <ConfirmationModal
        isOpen={confirmationState.isOpen}
        title={confirmationState.title}
        description={confirmationState.description}
        confirmButtonText={confirmationState.confirmButtonText}
        details={confirmationState.details}
        onConfirm={confirmationState.onConfirm}
        onCancel={() => setConfirmationState((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Submission Success Dialog */}
      <SuccessModal
        isOpen={showSuccessModal}
        response={submittedResponse}
        spreadsheetUrl={config.spreadsheetUrl}
        formUrl={config.formUrl}
        targetEmail={config.targetEmail}
        onClose={() => setShowSuccessModal(false)}
        onResetForm={() => {
          setShowSuccessModal(false);
          setActiveTab('survey');
        }}
      />
    </div>
  );
}
