import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Mail,
  FileText,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Send,
  Plus,
  Copy,
  Check,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import type { WorkspaceConfig, SurveyResponse } from '../types/survey';
import { GoogleSignInButton } from './GoogleSignInButton';
import { DEFAULT_TARGET_EMAIL } from '../data/surveyQuestions';

interface Props {
  isAuthenticated: boolean;
  accessToken: string | null;
  config: WorkspaceConfig;
  responses: SurveyResponse[];
  isAuthenticating: boolean;
  onGoogleSignIn: () => void;
  onRequestCreateForm: () => void;
  onRequestCreateSheet: () => void;
  onRequestSendTestEmail: () => void;
  onSaveConfig: (newConfig: WorkspaceConfig) => void;
  isCreatingForm: boolean;
  isCreatingSheet: boolean;
  isSendingEmail: boolean;
}

export const AdminHub: React.FC<Props> = ({
  isAuthenticated,
  accessToken,
  config,
  responses,
  isAuthenticating,
  onGoogleSignIn,
  onRequestCreateForm,
  onRequestCreateSheet,
  onRequestSendTestEmail,
  onSaveConfig,
  isCreatingForm,
  isCreatingSheet,
  isSendingEmail,
}) => {
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Title & Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Google Workspace Connected Hub
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Survey Management & Integrations</h1>
          <p className="text-sm text-gray-500 mt-1">
            Connect and configure Google Forms, Google Sheets, and Gmail forwarding to{' '}
            <span className="font-semibold text-blue-700">{config.targetEmail}</span>.
          </p>
        </div>

        <div>
          {!isAuthenticated ? (
            <div className="flex flex-col items-start md:items-end gap-1.5">
              <GoogleSignInButton
                onClick={onGoogleSignIn}
                isLoading={isAuthenticating}
                text="Connect Google Account"
                size="md"
              />
              <span className="text-[11px] text-gray-500">Enables direct Forms, Sheets & Gmail API</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Google Account Connected</span>
            </div>
          )}
        </div>
      </div>

      {/* Integration Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Gmail Integration */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col justify-between hover:border-gray-300 transition-all">
          <div>
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-4 border border-red-100">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Gmail Auto-Forwarding</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Every survey response is automatically formatted into an executive summary and emailed to the target inbox.
            </p>

            <div className="mt-4 p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-1.5">
              <div className="text-gray-500 font-medium">Target Recipient:</div>
              <div className="font-semibold text-gray-900 break-all bg-white px-2.5 py-1 rounded border border-gray-200">
                {config.targetEmail}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium pt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Direct Gmail API Integration Active</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onRequestSendTestEmail}
              disabled={isSendingEmail}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSendingEmail ? (
                <span>Sending Test...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Test Email to {config.targetEmail}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 2. Google Sheets Integration */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col justify-between hover:border-gray-300 transition-all">
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-100">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Google Sheets Database</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Store, sort, and analyze every survey response in a shared Google Sheet spreadsheet with 15 organized columns.
            </p>

            <div className="mt-4 p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-2">
              <div className="text-gray-500 font-medium">Spreadsheet Status:</div>
              {config.spreadsheetUrl ? (
                <div className="space-y-2">
                  <div className="text-emerald-700 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Connected & Active
                  </div>
                  <a
                    href={config.spreadsheetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-semibold underline break-all"
                  >
                    <span>Open in Google Sheets</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                </div>
              ) : (
                <div className="text-gray-500 italic text-[11px]">
                  No spreadsheet created yet. Click below to generate one automatically.
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onRequestCreateSheet}
              disabled={isCreatingSheet}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              {isCreatingSheet ? (
                <span>Generating Spreadsheet...</span>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>{config.spreadsheetUrl ? 'Re-create Google Sheet' : 'Create Google Sheet via API'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 3. Google Forms Integration */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col justify-between hover:border-gray-300 transition-all">
          <div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 border border-purple-100">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Google Forms Creator</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Create an official Google Form with all 13 questions so you can distribute direct Google Form links anytime.
            </p>

            <div className="mt-4 p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-2">
              <div className="text-gray-500 font-medium">Google Form Status:</div>
              {config.formUrl ? (
                <div className="space-y-2">
                  <div className="text-purple-700 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Form Created
                  </div>
                  <div className="flex flex-col gap-1.5 pt-1">
                    <a
                      href={config.formUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 font-semibold underline"
                    >
                      <span>Public Responder Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    {config.formEditUrl && (
                      <a
                        href={config.formEditUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 underline"
                      >
                        <span>Edit Form in Google Drive</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 italic text-[11px]">
                  No Google Form generated yet. Click below to generate it instantly.
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onRequestCreateForm}
              disabled={isCreatingForm}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              {isCreatingForm ? (
                <span>Generating Form...</span>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>{config.formUrl ? 'Re-generate Google Form' : 'Create Google Form via API'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Target Email Configuration & Quick Links */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
        <h3 className="text-base font-bold text-gray-900 mb-3">Notification & Delivery Settings</h3>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Forward All Form Replies To Email:
            </label>
            <input
              type="email"
              value={config.targetEmail}
              onChange={(e) => onSaveConfig({ ...config, targetEmail: e.target.value })}
              className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>
          <div className="self-end pt-5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onSaveConfig({ ...config, targetEmail: DEFAULT_TARGET_EMAIL })}
              className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
            >
              Reset to Default (vexloraindia@gmail.com)
            </button>
          </div>
        </div>
      </div>

      {/* Tester Friends & Google Authentication Access */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Tester Whitelist & Access Manager
            </div>
            <h3 className="text-lg font-bold text-gray-900">Tester Friends & Google Sign-In Access</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage access for your testers to sign in with Google or fill out personalized survey links.
            </p>
          </div>

          <a
            href="https://console.cloud.google.com/apis/credentials/consent?project=moonlit-app-444807-g3"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors cursor-pointer"
          >
            <span>Google Cloud Test Users Console</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Info callout on Google's Developer Mode OAuth requirement */}
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-950">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>How to enable Google Sign-In for your friends (Google OAuth Policy):</span>
          </div>
          <p className="leading-relaxed text-amber-900">
            Because this application uses sensitive Google Workspace APIs (Forms, Sheets, Gmail) in testing mode on Google Cloud project <code className="bg-amber-100/80 px-1.5 py-0.5 rounded font-mono font-bold text-amber-950">moonlit-app-444807-g3</code>, Google requires you (the project owner) to whitelist their Gmail addresses in the Google Cloud Console:
          </p>
          <ol className="list-decimal list-inside space-y-1 pl-1 font-medium text-amber-950">
            <li>Click the <strong>Google Cloud Test Users Console</strong> button above (or open the OAuth Consent Screen).</li>
            <li>Scroll down to the <strong>Test users</strong> section and click <strong>+ ADD USERS</strong>.</li>
            <li>Paste <code className="bg-amber-100 px-1 rounded">joshi.namburu8@gmail.com</code> and <code className="bg-amber-100 px-1 rounded">senikushikumari@gmail.com</code>.</li>
            <li>Click <strong>Save</strong>. They will then be able to authenticate with Google without seeing Google's <em>Error 403 (access_denied)</em>!</li>
          </ol>
          <div className="pt-2 border-t border-amber-200/80 text-[11px] font-semibold text-emerald-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Good news: Your friends can already fill out and submit the survey on this website right now even without signing in!</span>
          </div>
        </div>

        {/* Tester Accounts List */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Configured Tester Accounts:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { email: 'joshi.namburu8@gmail.com', name: 'Joshi Namburu' },
              { email: 'senikushikumari@gmail.com', name: 'Senikushi Kumari' },
            ].map((tester) => {
              const inviteUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/?email=${encodeURIComponent(tester.email)}`;
              const isCopied = copiedLink === tester.email;

              return (
                <div
                  key={tester.email}
                  className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-sm text-gray-900">{tester.name}</div>
                      <div className="text-xs text-gray-600 font-mono mt-0.5">{tester.email}</div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Whitelisted Tester
                    </span>
                  </div>

                  <div className="pt-2 border-t border-gray-200/80 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(inviteUrl, tester.email)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 bg-white border border-gray-300 hover:bg-blue-50 transition-colors cursor-pointer shadow-2xs"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied Link!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Personalized Survey Link</span>
                        </>
                      )}
                    </button>
                    <a
                      href={inviteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-gray-500 hover:text-gray-800 p-1"
                      title="Open link"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
