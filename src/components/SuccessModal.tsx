import React from 'react';
import { CheckCircle2, Mail, ExternalLink, FileSpreadsheet, Sparkles } from 'lucide-react';
import type { SurveyResponse } from '../types/survey';

interface Props {
  isOpen: boolean;
  response: SurveyResponse | null;
  spreadsheetUrl: string | null;
  formUrl: string | null;
  targetEmail: string;
  onClose: () => void;
  onResetForm: () => void;
}

export const SuccessModal: React.FC<Props> = ({
  isOpen,
  response,
  spreadsheetUrl,
  formUrl,
  targetEmail,
  onClose,
  onResetForm,
}) => {
  if (!isOpen || !response) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 text-center animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200 shadow-xs">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <h3 className="text-xl font-bold text-gray-900">Thank You for Your Feedback!</h3>
        <p className="text-sm text-gray-600 mt-2 max-w-sm mx-auto">
          Your survey response has been successfully captured and routed to the development team.
        </p>

        <div className="mt-6 p-4 rounded-xl bg-gray-50 border border-gray-200 text-left space-y-3">
          <div className="flex items-center gap-2.5 text-xs">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Mail className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 truncate">
              <p className="font-semibold text-gray-800">Email Notification Sent</p>
              <p className="text-gray-500 truncate">Forwarded to <span className="text-blue-600 font-medium">{targetEmail}</span></p>
            </div>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
              Delivered
            </span>
          </div>

          {spreadsheetUrl && (
            <div className="flex items-center gap-2.5 text-xs pt-2 border-t border-gray-200">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 truncate">
                <p className="font-semibold text-gray-800">Google Sheet Recorded</p>
                <p className="text-gray-500">Row appended in connected spreadsheet</p>
              </div>
              <a
                href={spreadsheetUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium underline"
              >
                <span>View Sheet</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {formUrl && (
            <div className="flex items-center gap-2.5 text-xs pt-2 border-t border-gray-200">
              <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 truncate">
                <p className="font-semibold text-gray-800">Google Form Available</p>
                <p className="text-gray-500">Created in Google Forms</p>
              </div>
              <a
                href={formUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 font-medium underline"
              >
                <span>Open Form</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        <div className="mt-5 p-3 rounded-lg bg-blue-50/60 border border-blue-100 text-xs text-blue-900 text-left">
          <p className="font-medium">Summary of your submission:</p>
          <p className="mt-1 text-gray-700 line-clamp-2 italic">"{response.primaryProblems}"</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="px-2 py-0.5 bg-white rounded border border-blue-200 font-medium text-blue-700 text-[11px]">
              Platform: {response.preferredPlatform}
            </span>
            <span className="px-2 py-0.5 bg-white rounded border border-blue-200 font-medium text-blue-700 text-[11px]">
              Severity: {response.severityRating}/10
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={onResetForm}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Submit Another Response
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
