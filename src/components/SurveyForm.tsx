import React, { useState } from 'react';
import {
  Send,
  Sparkles,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Smartphone,
  Monitor,
  Laptop,
  Compass,
  Layers,
  ArrowRight,
  ArrowLeft,
  Mail,
  User,
  Briefcase
} from 'lucide-react';
import type { SurveyResponse } from '../types/survey';
import { CAPABILITY_OPTIONS, FREQUENCY_OPTIONS, PLATFORM_OPTIONS, DEFAULT_TARGET_EMAIL } from '../data/surveyQuestions';
import { GoogleSignInButton } from './GoogleSignInButton';

interface Props {
  isAuthenticated: boolean;
  userEmail?: string | null;
  onInitiateSubmit: (response: SurveyResponse) => void;
  onGoogleSignIn: () => void;
  isAuthenticating: boolean;
}

export const SurveyForm: React.FC<Props> = ({
  isAuthenticated,
  userEmail,
  onInitiateSubmit,
  onGoogleSignIn,
  isAuthenticating,
}) => {
  // Check URL query param for tester links (e.g. ?email=joshi.namburu8@gmail.com)
  const queryEmail = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('email') : null;
  const initialEmail = userEmail || queryEmail || '';

  // Form State
  const [formData, setFormData] = useState({
    respondentName: '',
    respondentEmail: initialEmail,
    organizationOrRole: '',
    primaryProblems: '',
    problemFrequency: 'Daily' as (typeof FREQUENCY_OPTIONS)[number],
    severityRating: 7,
    currentToolsOrWorkarounds: '',
    suggestedFeatures: '',
    preferredPlatform: 'Web App' as (typeof PLATFORM_OPTIONS)[number],
    mustHaveCapabilities: [
      '⚡ Fast & Clean Modern Interface',
      '🤖 AI-Powered Assistance & Smart Suggestions',
    ] as string[],
    switchingFactor: '',
    willingToBetaTest: true,
    additionalNotes: '',
  });

  const [activeStep, setActiveStep] = useState<number>(1);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Severity color & emoji helper
  const getSeverityInfo = (score: number) => {
    if (score >= 9) return { color: 'text-red-600 bg-red-50 border-red-200', label: 'Critical Showstopper', emoji: '🔥' };
    if (score >= 7) return { color: 'text-amber-600 bg-amber-50 border-amber-200', label: 'Severe Obstacle', emoji: '⚠️' };
    if (score >= 4) return { color: 'text-blue-600 bg-blue-50 border-blue-200', label: 'Moderate Drag', emoji: '⏳' };
    return { color: 'text-emerald-600 bg-emerald-50 border-emerald-200', label: 'Minor Inconvenience', emoji: '🌱' };
  };

  const handleCapabilityToggle = (cap: string) => {
    setFormData((prev) => {
      const exists = prev.mustHaveCapabilities.includes(cap);
      return {
        ...prev,
        mustHaveCapabilities: exists
          ? prev.mustHaveCapabilities.filter((c) => c !== cap)
          : [...prev.mustHaveCapabilities, cap],
      };
    });
  };

  const validateStep = (stepNumber: number): boolean => {
    const errors: Record<string, string> = {};

    if (stepNumber === 1) {
      if (!formData.respondentEmail || !/^\S+@\S+\.\S+$/.test(formData.respondentEmail)) {
        errors.respondentEmail = 'Please provide a valid email address.';
      }
    }

    if (stepNumber === 2) {
      if (!formData.primaryProblems.trim() || formData.primaryProblems.length < 10) {
        errors.primaryProblems = 'Please describe the problem you face (at least 10 characters).';
      }
    }

    if (stepNumber === 3) {
      if (!formData.suggestedFeatures.trim() || formData.suggestedFeatures.length < 10) {
        errors.suggestedFeatures = 'Please provide suggestions on what features or capabilities would help.';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => Math.min(prev + 1, 4));
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      alert('Please fill out all required fields across the survey steps.');
      return;
    }

    const payload: SurveyResponse = {
      id: `vex_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      submittedAt: new Date().toISOString(),
      ...formData,
    };

    onInitiateSubmit(payload);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Top Banner & Destination Clarification */}
      <div className="mb-8 bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              Vexlora User Voice & Feedback Initiative
            </div>
            {queryEmail && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-xs font-semibold">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tester Invitation: {queryEmail}</span>
              </div>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Shape the Next Generation Digital Tool
          </h1>
          <p className="mt-2 text-sm sm:text-base text-blue-100/90 leading-relaxed max-w-2xl">
            We are listening closely to identify real daily problems and build a web & mobile application that solves them. All answers are directly forwarded to{' '}
            <span className="font-semibold text-yellow-300 underline decoration-yellow-400/60 underline-offset-2">
              {DEFAULT_TARGET_EMAIL}
            </span>{' '}
            and logged in Google Sheets for our product team.
          </p>

          {!isAuthenticated && (
            <div className="mt-4 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-blue-200">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span>Optional: Connect with Google for direct Workspace sync</span>
              </div>
              <div>
                <GoogleSignInButton
                  onClick={onGoogleSignIn}
                  isLoading={isAuthenticating}
                  size="sm"
                  text="Sign in with Google"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stepper Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-semibold text-gray-500 mb-2">
          <span className={activeStep >= 1 ? 'text-blue-600' : ''}>1. About You</span>
          <span className={activeStep >= 2 ? 'text-blue-600' : ''}>2. Problems Faced</span>
          <span className={activeStep >= 3 ? 'text-blue-600' : ''}>3. App Suggestions</span>
          <span className={activeStep >= 4 ? 'text-blue-600' : ''}>4. Review & Send</span>
        </div>
        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-blue-600 h-full transition-all duration-300 ease-out"
            style={{ width: `${(activeStep / 4) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Main Survey Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
        {/* STEP 1: ABOUT YOU */}
        {activeStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
                <User className="w-4 h-4" /> Section 1 of 4
              </div>
              <h2 className="text-xl font-bold text-gray-900">Tell Us About Yourself</h2>
              <p className="text-sm text-gray-500 mt-1">
                This helps us contextualize your daily workflow and industry demands.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Your Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="e.g. yourname@gmail.com"
                  value={formData.respondentEmail}
                  onChange={(e) => setFormData({ ...formData, respondentEmail: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900"
                />
              </div>
              {validationErrors.respondentEmail && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {validationErrors.respondentEmail}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Your Full Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={formData.respondentName}
                onChange={(e) => setFormData({ ...formData, respondentName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Your Current Role, Organization or Field
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Briefcase className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="e.g. Small Business Owner, Freelancer, Engineer, Student, Manager"
                  value={formData.organizationOrRole}
                  onChange={(e) => setFormData({ ...formData, organizationOrRole: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: PROBLEMS FACED */}
        {activeStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-600 mb-1">
                <AlertCircle className="w-4 h-4" /> Section 2 of 4
              </div>
              <h2 className="text-xl font-bold text-gray-900">What Problems Are You Facing?</h2>
              <p className="text-sm text-gray-500 mt-1">
                Be as honest and detailed as possible. The more specific the pain point, the better we can solve it.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                What is the single biggest bottleneck, headache, or problem in your daily tasks?{' '}
                <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                placeholder="Describe what tasks take too long, where communication breaks down, what errors happen frequently, or what current apps fail to do..."
                value={formData.primaryProblems}
                onChange={(e) => setFormData({ ...formData, primaryProblems: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900"
              />
              {validationErrors.primaryProblems && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {validationErrors.primaryProblems}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  How often do you face this challenge?
                </label>
                <select
                  value={formData.problemFrequency}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      problemFrequency: e.target.value as (typeof FREQUENCY_OPTIONS)[number],
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 cursor-pointer"
                >
                  {FREQUENCY_OPTIONS.map((freq) => (
                    <option key={freq} value={freq}>
                      {freq}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
                  <span>Pain Severity:</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getSeverityInfo(formData.severityRating).color}`}>
                    {formData.severityRating}/10 {getSeverityInfo(formData.severityRating).emoji} {getSeverityInfo(formData.severityRating).label}
                  </span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={formData.severityRating}
                  onChange={(e) => setFormData({ ...formData, severityRating: parseInt(e.target.value, 10) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-3"
                />
                <div className="flex justify-between text-[11px] text-gray-400 mt-1">
                  <span>1: Mild nuisance</span>
                  <span>5: Moderate burden</span>
                  <span>10: Blocker / Costly</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                How do you currently cope or solve this problem right now?
              </label>
              <input
                type="text"
                placeholder="e.g. WhatsApp groups, messy Excel sheets, multiple paper notes, slow legacy software..."
                value={formData.currentToolsOrWorkarounds}
                onChange={(e) => setFormData({ ...formData, currentToolsOrWorkarounds: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900"
              />
            </div>
          </div>
        )}

        {/* STEP 3: APP SUGGESTIONS */}
        {activeStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">
                <Sparkles className="w-4 h-4" /> Section 3 of 4
              </div>
              <h2 className="text-xl font-bold text-gray-900">Your Suggestions for a Better Solution</h2>
              <p className="text-sm text-gray-500 mt-1">
                What would make an app or website genuinely indispensable for you?
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                What specific features or capabilities should we build? <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                placeholder="e.g. One-click PDF reports, instant WhatsApp alerts, automated expense tracking, clean client portal, easy team assignment..."
                value={formData.suggestedFeatures}
                onChange={(e) => setFormData({ ...formData, suggestedFeatures: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900"
              />
              {validationErrors.suggestedFeatures && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {validationErrors.suggestedFeatures}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Which platform would you use most often?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {PLATFORM_OPTIONS.map((plat) => {
                  const isSelected = formData.preferredPlatform === plat;
                  return (
                    <button
                      key={plat}
                      type="button"
                      onClick={() => setFormData({ ...formData, preferredPlatform: plat })}
                      className={`p-3 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer flex items-center gap-2 ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/80 text-blue-900 shadow-xs ring-1 ring-blue-600'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                      }`}
                    >
                      {plat.includes('Web') && <Monitor className="w-4 h-4 text-blue-600 shrink-0" />}
                      {plat.includes('Mobile') && <Smartphone className="w-4 h-4 text-emerald-600 shrink-0" />}
                      {plat.includes('Desktop') && <Laptop className="w-4 h-4 text-indigo-600 shrink-0" />}
                      {plat.includes('Browser') && <Compass className="w-4 h-4 text-amber-600 shrink-0" />}
                      {plat.includes('Cross') && <Layers className="w-4 h-4 text-purple-600 shrink-0" />}
                      <span>{plat}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select your top must-have capabilities (Check all that apply):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CAPABILITY_OPTIONS.map((cap) => {
                  const checked = formData.mustHaveCapabilities.includes(cap);
                  return (
                    <label
                      key={cap}
                      className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        checked
                          ? 'border-blue-500 bg-blue-50/50 text-blue-900 font-medium'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleCapabilityToggle(cap)}
                        className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span>{cap}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                What would convince you to immediately switch to this new tool?
              </label>
              <input
                type="text"
                placeholder="e.g. Saving 2+ hours daily, zero learning curve, affordable pricing, great customer support..."
                value={formData.switchingFactor}
                onChange={(e) => setFormData({ ...formData, switchingFactor: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900"
              />
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW & CONFIRM */}
        {activeStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-purple-600 mb-1">
                <CheckCircle className="w-4 h-4" /> Section 4 of 4
              </div>
              <h2 className="text-xl font-bold text-gray-900">Review & Submit Your Response</h2>
              <p className="text-sm text-gray-500 mt-1">
                Verify your details. When you submit, your full response will be routed to{' '}
                <span className="font-semibold text-blue-700">{DEFAULT_TARGET_EMAIL}</span>.
              </p>
            </div>

            {/* Summary Review Card */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-gray-200">
                <div>
                  <span className="text-gray-500 font-medium">Respondent:</span>
                  <p className="font-semibold text-gray-900 mt-0.5">
                    {formData.respondentName || 'Anonymous'} ({formData.respondentEmail})
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 font-medium">Role / Field:</span>
                  <p className="font-semibold text-gray-900 mt-0.5">
                    {formData.organizationOrRole || 'General User'}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-gray-500 font-medium">Primary Pain Point:</span>
                <p className="font-medium text-gray-900 mt-1 bg-white p-2.5 rounded-lg border border-gray-200">
                  {formData.primaryProblems}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-gray-500 font-medium">Frequency & Severity:</span>
                  <p className="font-semibold text-gray-900 mt-0.5">
                    {formData.problemFrequency} • {formData.severityRating}/10 Severity
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 font-medium">Preferred Platform:</span>
                  <p className="font-semibold text-blue-700 mt-0.5">{formData.preferredPlatform}</p>
                </div>
              </div>

              <div>
                <span className="text-gray-500 font-medium">Suggested Features:</span>
                <p className="font-medium text-gray-900 mt-1 bg-white p-2.5 rounded-lg border border-gray-200">
                  {formData.suggestedFeatures}
                </p>
              </div>

              {formData.mustHaveCapabilities.length > 0 && (
                <div>
                  <span className="text-gray-500 font-medium">Must-Have Capabilities:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {formData.mustHaveCapabilities.map((c) => (
                      <span key={c} className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md font-medium text-[11px]">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Additional Notes & Beta Toggle */}
            <div className="space-y-4 pt-2">
              <label className="flex items-center gap-3 p-3.5 rounded-xl border border-blue-200 bg-blue-50/40 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.willingToBetaTest}
                  onChange={(e) => setFormData({ ...formData, willingToBetaTest: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                />
                <div className="text-xs">
                  <span className="font-semibold text-gray-900">Join Vexlora Early Beta Testing</span>
                  <p className="text-gray-600 mt-0.5">
                    Check this if you would like free early access to test the prototypes and provide direct product feedback.
                  </p>
                </div>
              </label>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Any additional advice, notes or thoughts for the Vexlora team?
                </label>
                <textarea
                  rows={2}
                  placeholder="Share anything else on your mind..."
                  value={formData.additionalNotes}
                  onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
                />
              </div>
            </div>
          </div>
        )}

        {/* Buttons / Navigation */}
        <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
          {activeStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <div></div>
          )}

          {activeStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm active:bg-blue-800 transition-colors cursor-pointer ml-auto"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-linear-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-md active:scale-98 transition-all cursor-pointer ml-auto"
            >
              <Send className="w-4 h-4" />
              <span>Submit & Send to {DEFAULT_TARGET_EMAIL}</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
