import React from 'react';
import { AlertTriangle, Mail, Send, CheckCircle2, ShieldAlert } from 'lucide-react';

interface Props {
  isOpen: boolean;
  title: string;
  description: string;
  details?: {
    recipient?: string;
    actionType: 'email' | 'sheet' | 'form';
    itemsCount?: number;
    extraNote?: string;
  };
  confirmButtonText?: string;
  isConfirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<Props> = ({
  isOpen,
  title,
  description,
  details,
  confirmButtonText = 'Confirm & Proceed',
  isConfirming = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 transform transition-all animate-in zoom-in-95 duration-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            {details?.actionType === 'email' ? (
              <Mail className="w-6 h-6 text-blue-600" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 leading-snug">{title}</h3>
            <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{description}</p>
          </div>
        </div>

        {details && (
          <div className="mt-5 p-4 rounded-xl bg-gray-50 border border-gray-200/80 space-y-2.5 text-xs text-gray-700">
            {details.recipient && (
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-500">Destination Email:</span>
                <span className="font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  {details.recipient}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-500">Action:</span>
              <span className="font-semibold text-gray-800">
                {details.actionType === 'email' && 'Send survey response email via Gmail'}
                {details.actionType === 'sheet' && 'Create / Append data to Google Sheet'}
                {details.actionType === 'form' && 'Create new Google Form with survey questions'}
              </span>
            </div>
            {details.extraNote && (
              <div className="pt-2 border-t border-gray-200 flex items-start gap-1.5 text-gray-600">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>{details.extraNote}</span>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isConfirming}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isConfirming}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm active:bg-blue-800 transition-colors disabled:opacity-60 cursor-pointer"
          >
            {isConfirming ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>{confirmButtonText}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
