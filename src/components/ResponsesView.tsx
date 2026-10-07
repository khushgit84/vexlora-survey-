import React, { useState } from 'react';
import {
  Download,
  Mail,
  FileSpreadsheet,
  CheckCircle,
  Clock,
  Search,
  ChevronRight,
  Send,
  Sparkles,
  Smartphone,
  Monitor,
  Flame,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import type { SurveyResponse } from '../types/survey';

interface Props {
  responses: SurveyResponse[];
  targetEmail: string;
  spreadsheetUrl: string | null;
  onResendEmail: (response: SurveyResponse) => void;
  onSyncToSheet: (response: SurveyResponse) => void;
  isProcessingAction: boolean;
}

export const ResponsesView: React.FC<Props> = ({
  responses,
  targetEmail,
  spreadsheetUrl,
  onResendEmail,
  onSyncToSheet,
  isProcessingAction,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResponse, setSelectedResponse] = useState<SurveyResponse | null>(null);

  const filteredResponses = responses.filter(
    (r) =>
      r.respondentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.respondentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.primaryProblems.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.suggestedFeatures.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Compute analytics
  const totalCount = responses.length;
  const avgSeverity =
    totalCount > 0
      ? (responses.reduce((acc, curr) => acc + curr.severityRating, 0) / totalCount).toFixed(1)
      : '0.0';
  const betaTestersCount = responses.filter((r) => r.willingToBetaTest).length;
  const criticalCount = responses.filter((r) => r.severityRating >= 8).length;

  const exportCsv = () => {
    if (responses.length === 0) return;
    const headers = [
      'ID',
      'Submitted At',
      'Name',
      'Email',
      'Role/Org',
      'Primary Problems',
      'Frequency',
      'Severity',
      'Workarounds',
      'Suggested Features',
      'Preferred Platform',
      'Must Haves',
      'Switching Factor',
      'Beta Tester',
      'Notes'
    ];

    const rows = responses.map((r) => [
      r.id,
      r.submittedAt,
      `"${r.respondentName.replace(/"/g, '""')}"`,
      `"${r.respondentEmail}"`,
      `"${r.organizationOrRole.replace(/"/g, '""')}"`,
      `"${r.primaryProblems.replace(/"/g, '""')}"`,
      r.problemFrequency,
      r.severityRating,
      `"${r.currentToolsOrWorkarounds.replace(/"/g, '""')}"`,
      `"${r.suggestedFeatures.replace(/"/g, '""')}"`,
      r.preferredPlatform,
      `"${r.mustHaveCapabilities.join('; ')}"`,
      `"${r.switchingFactor.replace(/"/g, '""')}"`,
      r.willingToBetaTest ? 'Yes' : 'No',
      `"${r.additionalNotes.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `vexlora_survey_responses_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Submissions</div>
          <div className="text-3xl font-extrabold text-gray-900 mt-2">{totalCount}</div>
          <div className="text-xs text-blue-600 font-medium mt-1">Routed to {targetEmail}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Avg Pain Severity</div>
          <div className="text-3xl font-extrabold text-amber-600 mt-2 flex items-center gap-1">
            <span>{avgSeverity}</span>
            <span className="text-sm font-semibold text-gray-400">/ 10</span>
          </div>
          <div className="text-xs text-amber-700 font-medium mt-1">
            {criticalCount} critical blockers (&ge;8/10)
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Beta Volunteers</div>
          <div className="text-3xl font-extrabold text-emerald-600 mt-2 flex items-center gap-1.5">
            <UserCheck className="w-7 h-7" />
            <span>{betaTestersCount}</span>
          </div>
          <div className="text-xs text-emerald-700 font-medium mt-1">
            {totalCount > 0 ? `${Math.round((betaTestersCount / totalCount) * 100)}% interested` : 'Awaiting responses'}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Google Sheets Status</div>
            <div className="text-xs font-medium text-gray-900 mt-2 truncate">
              {spreadsheetUrl ? 'Spreadsheet Connected' : 'Local Cache Active'}
            </div>
          </div>
          <button
            type="button"
            onClick={exportCsv}
            disabled={responses.length === 0}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {/* Responses List / Table Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Captured Problem Surveys</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Review what problems users are facing and their specific feature suggestions.
            </p>
          </div>

          <div className="w-full sm:w-72 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by keyword, name, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {filteredResponses.length === 0 ? (
          <div className="p-12 text-center text-gray-500 space-y-3">
            <Clock className="w-10 h-10 mx-auto text-gray-300" />
            <h3 className="text-base font-semibold text-gray-700">No responses matching search</h3>
            <p className="text-xs max-w-sm mx-auto">
              Switch to "Fill Survey" tab above to submit test responses or share the link with prospective users.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 overflow-x-auto">
            {filteredResponses.map((res) => (
              <div
                key={res.id}
                onClick={() => setSelectedResponse(res)}
                className="p-5 hover:bg-blue-50/40 transition-colors cursor-pointer flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="flex-1 space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-bold text-gray-900 text-sm">{res.respondentName || 'Anonymous'}</span>
                    <span className="text-xs text-gray-500 font-mono">({res.respondentEmail})</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-medium">
                      {res.organizationOrRole || 'General'}
                    </span>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                        res.severityRating >= 8
                          ? 'bg-red-100 text-red-700'
                          : res.severityRating >= 5
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      Severity {res.severityRating}/10
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium">
                      {res.preferredPlatform}
                    </span>
                  </div>

                  <div className="text-xs text-gray-800 line-clamp-1 font-medium">
                    <span className="text-red-700 font-semibold">Problem:</span> {res.primaryProblems}
                  </div>

                  <div className="text-xs text-gray-600 line-clamp-1">
                    <span className="text-emerald-700 font-semibold">Suggestion:</span> {res.suggestedFeatures}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right text-[11px] text-gray-400">
                    <div>{new Date(res.submittedAt).toLocaleDateString()}</div>
                    <div>{new Date(res.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detailed Response Modal */}
      {selectedResponse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-gray-200">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Response Detail</span>
                <h3 className="text-xl font-bold text-gray-900 mt-1">{selectedResponse.respondentName || 'Anonymous'}</h3>
                <p className="text-xs text-gray-500 font-mono mt-0.5">{selectedResponse.respondentEmail}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedResponse(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="mt-5 space-y-4 text-xs">
              <div className="p-3 bg-red-50/70 border border-red-200 rounded-xl space-y-1">
                <span className="font-bold text-red-900 uppercase tracking-wider text-[11px]">Primary Bottleneck & Problem</span>
                <p className="text-gray-900 text-sm leading-relaxed">{selectedResponse.primaryProblems}</p>
                <div className="flex items-center gap-3 pt-2 text-gray-600 text-[11px]">
                  <span>Frequency: <strong>{selectedResponse.problemFrequency}</strong></span>
                  <span>•</span>
                  <span>Pain Score: <strong>{selectedResponse.severityRating} / 10</strong></span>
                </div>
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
                <span className="font-bold text-blue-900 uppercase tracking-wider text-[11px]">Suggested App Solution & Features</span>
                <p className="text-gray-900 text-sm leading-relaxed">{selectedResponse.suggestedFeatures}</p>
                <div className="pt-2">
                  <span className="font-semibold text-gray-700">Preferred Platform:</span>{' '}
                  <span className="text-blue-700 font-bold">{selectedResponse.preferredPlatform}</span>
                </div>
              </div>

              {selectedResponse.mustHaveCapabilities.length > 0 && (
                <div>
                  <span className="font-semibold text-gray-700 block mb-1">Must-Have Capabilities:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedResponse.mustHaveCapabilities.map((cap) => (
                      <span key={cap} className="px-2.5 py-1 bg-gray-100 rounded-md text-gray-800 font-medium">
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedResponse.currentToolsOrWorkarounds && (
                <div>
                  <span className="font-semibold text-gray-700">Current Workarounds / Tools:</span>
                  <p className="text-gray-800 mt-1 p-2 bg-gray-50 rounded-lg border border-gray-200">
                    {selectedResponse.currentToolsOrWorkarounds}
                  </p>
                </div>
              )}

              {selectedResponse.switchingFactor && (
                <div>
                  <span className="font-semibold text-gray-700">What would make them switch:</span>
                  <p className="text-gray-800 mt-1 p-2 bg-gray-50 rounded-lg border border-gray-200">
                    {selectedResponse.switchingFactor}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div>
                  <span className="font-semibold text-emerald-900">Beta Testing Enrollment:</span>
                  <p className="text-emerald-700">
                    {selectedResponse.willingToBetaTest ? 'Yes, wants early product preview & testing' : 'No'}
                  </p>
                </div>
                {selectedResponse.willingToBetaTest && <CheckCircle className="w-5 h-5 text-emerald-600" />}
              </div>

              {selectedResponse.additionalNotes && (
                <div>
                  <span className="font-semibold text-gray-700">Additional Advice for Vexlora Team:</span>
                  <p className="text-gray-800 mt-1 p-2 bg-gray-50 rounded-lg border border-gray-200">
                    {selectedResponse.additionalNotes}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => onResendEmail(selectedResponse)}
                disabled={isProcessingAction}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" /> Send to {targetEmail}
              </button>

              <button
                type="button"
                onClick={() => setSelectedResponse(null)}
                className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
