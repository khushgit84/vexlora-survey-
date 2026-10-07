import type { SurveyResponse } from '../types/survey';

/**
 * Base64 URL-safe encoding for Gmail API RFC 2822 messages
 */
function encodeBase64Url(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Send survey response email via Gmail API directly to vexloraindia@gmail.com
 */
export async function sendSurveyEmailViaGmail(
  accessToken: string,
  response: SurveyResponse,
  targetEmail = 'vexloraindia@gmail.com'
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const subject = `[New Survey Reply] Problem Discovery & App Suggestions from ${response.respondentName || 'Anonymous'}`;

    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f6f9; margin: 0; padding: 24px; color: #1e293b; }
    .card { max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 28px 24px; }
    .header h1 { margin: 0 0 6px 0; font-size: 22px; font-weight: 700; letter-spacing: -0.02em; }
    .header p { margin: 0; font-size: 14px; opacity: 0.9; }
    .badge { display: inline-block; padding: 4px 10px; background: rgba(255,255,255,0.2); border-radius: 9999px; font-size: 12px; font-weight: 600; margin-top: 8px; }
    .content { padding: 24px; }
    .section-title { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-top: 20px; margin-bottom: 12px; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px; }
    .field-row { margin-bottom: 14px; }
    .field-label { font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 4px; }
    .field-value { font-size: 15px; color: #0f172a; line-height: 1.5; background: #f8fafc; padding: 10px 14px; border-radius: 8px; border: 1px solid #e2e8f0; }
    .severity-badge { display: inline-block; padding: 4px 12px; border-radius: 6px; font-weight: 700; font-size: 14px; }
    .severity-high { background-color: #fee2e2; color: #b91c1c; }
    .severity-med { background-color: #fef3c7; color: #b45309; }
    .severity-low { background-color: #dcfce7; color: #15803d; }
    .pill-list { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
    .pill { display: inline-block; background: #eff6ff; color: #1d4ed8; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 9999px; border: 1px solid #bfdbfe; margin-right: 6px; margin-bottom: 6px; }
    .footer { background: #f8fafc; padding: 16px 24px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>🚀 Vexlora Survey Submission</h1>
      <p>A new user submitted problem discovery & suggestions for your app or website</p>
      <div class="badge">Submitted on: ${new Date(response.submittedAt).toLocaleString()}</div>
    </div>
    
    <div class="content">
      <div class="section-title">1. Respondent Profile</div>
      <div class="field-row">
        <div class="field-label">Name:</div>
        <div class="field-value">${response.respondentName || 'Not specified'}</div>
      </div>
      <div class="field-row">
        <div class="field-label">Email:</div>
        <div class="field-value"><a href="mailto:${response.respondentEmail}">${response.respondentEmail}</a></div>
      </div>
      <div class="field-row">
        <div class="field-label">Role / Organization / Field:</div>
        <div class="field-value">${response.organizationOrRole || 'General User'}</div>
      </div>

      <div class="section-title">2. Problems & Pain Points</div>
      <div class="field-row">
        <div class="field-label">Single Biggest Bottleneck or Problem:</div>
        <div class="field-value" style="font-weight: 500;">${response.primaryProblems}</div>
      </div>
      <div class="field-row">
        <div class="field-label">Frequency of Encounter:</div>
        <div class="field-value">${response.problemFrequency}</div>
      </div>
      <div class="field-row">
        <div class="field-label">Pain Severity (1-10 Scale):</div>
        <div class="field-value">
          <span class="severity-badge ${response.severityRating >= 7 ? 'severity-high' : response.severityRating >= 4 ? 'severity-med' : 'severity-low'}">
            ${response.severityRating} / 10 ${response.severityRating >= 8 ? '🔥 Critical' : response.severityRating >= 5 ? '⚠️ Moderate' : '✅ Minor'}
          </span>
        </div>
      </div>
      <div class="field-row">
        <div class="field-label">Current Workarounds / Tools Used:</div>
        <div class="field-value">${response.currentToolsOrWorkarounds || 'None provided'}</div>
      </div>

      <div class="section-title">3. App & Website Suggestions</div>
      <div class="field-row">
        <div class="field-label">Features or Capabilities That Would Help Most:</div>
        <div class="field-value" style="font-weight: 500;">${response.suggestedFeatures}</div>
      </div>
      <div class="field-row">
        <div class="field-label">Preferred Platform:</div>
        <div class="field-value">💻 ${response.preferredPlatform}</div>
      </div>
      <div class="field-row">
        <div class="field-label">Must-Have Capabilities Selected:</div>
        <div class="field-value">
          ${response.mustHaveCapabilities.length > 0 
            ? response.mustHaveCapabilities.map(cap => `<span class="pill">${cap}</span>`).join(' ') 
            : 'None selected'}
        </div>
      </div>
      <div class="field-row">
        <div class="field-label">What Would Make You Switch to This New App?</div>
        <div class="field-value">${response.switchingFactor || 'Not specified'}</div>
      </div>

      <div class="section-title">4. Follow-up & Additional Feedback</div>
      <div class="field-row">
        <div class="field-label">Willing to Test Beta Releases:</div>
        <div class="field-value">
          ${response.willingToBetaTest ? '🎉 <strong>Yes</strong>, eager to try early builds!' : 'No / Not at this time'}
        </div>
      </div>
      ${response.additionalNotes ? `
      <div class="field-row">
        <div class="field-label">Additional Advice or Notes for Vexlora Team:</div>
        <div class="field-value">${response.additionalNotes}</div>
      </div>` : ''}
    </div>

    <div class="footer">
      Sent automatically to <strong>${targetEmail}</strong> via Google AI Studio Vexlora Survey Integration
    </div>
  </div>
</body>
</html>
    `.trim();

    const emailLines = [
      `To: ${targetEmail}`,
      `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      '',
      htmlBody
    ];

    const rawMessage = encodeBase64Url(emailLines.join('\r\n'));

    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: rawMessage }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Gmail API Error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return { success: true, messageId: data.id };
  } catch (error: any) {
    console.error('Failed to send survey email via Gmail:', error);
    return { success: false, error: error.message || 'Unknown error sending email' };
  }
}

/**
 * Create a new Google Spreadsheet dedicated to storing survey responses
 */
export async function createSurveyGoogleSheet(
  accessToken: string,
  title = 'Vexlora User Feedback & Suggestions Survey'
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const payload = {
    properties: {
      title,
    },
    sheets: [
      {
        properties: {
          title: 'Responses',
          gridProperties: {
            frozenRowCount: 1,
          },
        },
      },
    ],
  };

  const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Failed to create Google Sheet: ${res.statusText}`);
  }

  const data = await res.json();
  const spreadsheetId = data.spreadsheetId;
  const spreadsheetUrl = data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // Write header row
  const headerValues = [
    [
      'Timestamp',
      'Respondent Name',
      'Respondent Email',
      'Role / Organization',
      'Primary Problems & Bottlenecks',
      'Problem Frequency',
      'Severity (1-10)',
      'Current Workarounds / Tools',
      'Suggested Features & Solutions',
      'Preferred Platform',
      'Must-Have Capabilities',
      'Switching Motivation',
      'Willing to Beta Test',
      'Additional Notes',
      'Email Sent to vexloraindia@gmail.com'
    ]
  ];

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Responses!A1:O1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: headerValues,
      }),
    }
  );

  return { spreadsheetId, spreadsheetUrl };
}

/**
 * Append a survey response into the Google Sheet
 */
export async function appendSurveyResponseToSheet(
  accessToken: string,
  spreadsheetId: string,
  response: SurveyResponse
): Promise<{ success: boolean; updatedRange?: string; error?: string }> {
  try {
    const row = [
      new Date(response.submittedAt).toISOString(),
      response.respondentName || 'Anonymous',
      response.respondentEmail,
      response.organizationOrRole,
      response.primaryProblems,
      response.problemFrequency,
      response.severityRating,
      response.currentToolsOrWorkarounds,
      response.suggestedFeatures,
      response.preferredPlatform,
      response.mustHaveCapabilities.join(', '),
      response.switchingFactor,
      response.willingToBetaTest ? 'Yes' : 'No',
      response.additionalNotes,
      response.emailedToVexlora ? 'Yes (vexloraindia@gmail.com)' : 'Pending'
    ];

    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Responses!A:O:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [row],
        }),
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Failed to append to Google Sheet: ${res.statusText}`);
    }

    const data = await res.json();
    return { success: true, updatedRange: data?.updates?.updatedRange };
  } catch (error: any) {
    console.error('Error appending response to Google Sheet:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Create an official Google Form populated with the problem & suggestion survey questions
 */
export async function createSurveyGoogleForm(
  accessToken: string,
  title = 'Vexlora User Needs, Pain Points & App Suggestions'
): Promise<{ formId: string; responderUri: string; editUrl: string }> {
  // 1. Create empty form
  const createRes = await fetch('https://forms.googleapis.com/v1/forms', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      info: {
        title,
        documentTitle: title,
      },
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Failed to create Google Form: ${createRes.statusText}`);
  }

  const createdData = await createRes.json();
  const formId = createdData.formId;
  const responderUri = createdData.responderUri || `https://docs.google.com/forms/d/e/${formId}/viewform`;
  const editUrl = `https://docs.google.com/forms/d/${formId}/edit`;

  // 2. Add question items via batchUpdate
  const batchRequests = {
    requests: [
      {
        createItem: {
          item: {
            title: 'Your Full Name',
            description: 'Help us know who is sharing this feedback',
            questionItem: {
              question: {
                required: false,
                textQuestion: { paragraph: false },
              },
            },
          },
          location: { index: 0 },
        },
      },
      {
        createItem: {
          item: {
            title: 'Your Email Address',
            description: 'So we can follow up or invite you to beta testing',
            questionItem: {
              question: {
                required: true,
                textQuestion: { paragraph: false },
              },
            },
          },
          location: { index: 1 },
        },
      },
      {
        createItem: {
          item: {
            title: 'Your Current Role / Organization / Field of Work',
            questionItem: {
              question: {
                required: false,
                textQuestion: { paragraph: false },
              },
            },
          },
          location: { index: 2 },
        },
      },
      {
        createItem: {
          item: {
            title: 'What is the single biggest bottleneck or problem you face in your daily workflow?',
            description: 'Describe the frustrating tasks, manual steps, or challenges in detail.',
            questionItem: {
              question: {
                required: true,
                textQuestion: { paragraph: true },
              },
            },
          },
          location: { index: 3 },
        },
      },
      {
        createItem: {
          item: {
            title: 'How frequently do you encounter this challenge?',
            questionItem: {
              question: {
                required: true,
                choiceQuestion: {
                  type: 'RADIO',
                  options: [
                    { value: 'Daily' },
                    { value: 'Several times a week' },
                    { value: 'Weekly' },
                    { value: 'Occasionally' },
                    { value: 'Rarely' },
                  ],
                },
              },
            },
          },
          location: { index: 4 },
        },
      },
      {
        createItem: {
          item: {
            title: 'How severe is this problem in your daily work? (1 = Minor Inconvenience, 10 = Critical Blocker)',
            questionItem: {
              question: {
                required: true,
                scaleQuestion: {
                  low: 1,
                  high: 10,
                  lowLabel: 'Minor Inconvenience',
                  highLabel: 'Critical Blocker',
                },
              },
            },
          },
          location: { index: 5 },
        },
      },
      {
        createItem: {
          item: {
            title: 'How do you currently solve or cope with this problem? (Tools, spreadsheets, manual work)',
            questionItem: {
              question: {
                required: false,
                textQuestion: { paragraph: true },
              },
            },
          },
          location: { index: 6 },
        },
      },
      {
        createItem: {
          item: {
            title: 'What specific features or capabilities in a new app or website would be most useful to you?',
            description: 'What would save you the most time and effort?',
            questionItem: {
              question: {
                required: true,
                textQuestion: { paragraph: true },
              },
            },
          },
          location: { index: 7 },
        },
      },
      {
        createItem: {
          item: {
            title: 'Which platform would you prefer for this application?',
            questionItem: {
              question: {
                required: true,
                choiceQuestion: {
                  type: 'RADIO',
                  options: [
                    { value: 'Web App' },
                    { value: 'Mobile App (iOS/Android)' },
                    { value: 'Desktop App' },
                    { value: 'Browser Extension' },
                    { value: 'Cross-Platform' },
                  ],
                },
              },
            },
          },
          location: { index: 8 },
        },
      },
      {
        createItem: {
          item: {
            title: 'Which key capabilities are must-haves for you?',
            questionItem: {
              question: {
                required: false,
                choiceQuestion: {
                  type: 'CHECKBOX',
                  options: [
                    { value: 'Fast & Clean Modern Interface' },
                    { value: 'Real-Time Collaboration & Sharing' },
                    { value: 'Visual Analytics & Reports Export' },
                    { value: 'AI-Powered Assistance & Smart Suggestions' },
                    { value: 'Seamless Mobile & Responsive Experience' },
                    { value: 'High Security, Privacy & Data Encryption' },
                    { value: 'Direct Integration with Google Workspace / Slack' },
                    { value: 'Offline Support & Automatic Sync' },
                  ],
                },
              },
            },
          },
          location: { index: 9 },
        },
      },
      {
        createItem: {
          item: {
            title: 'What would convince you to switch from your current method or tool to this new app?',
            questionItem: {
              question: {
                required: false,
                textQuestion: { paragraph: true },
              },
            },
          },
          location: { index: 10 },
        },
      },
      {
        createItem: {
          item: {
            title: 'Would you be interested in participating in early beta testing or product feedback sessions?',
            questionItem: {
              question: {
                required: true,
                choiceQuestion: {
                  type: 'RADIO',
                  options: [
                    { value: 'Yes, absolutely!' },
                    { value: 'Maybe later' },
                    { value: 'No, thank you' },
                  ],
                },
              },
            },
          },
          location: { index: 11 },
        },
      },
      {
        createItem: {
          item: {
            title: 'Any additional suggestions, advice, or ideas for the Vexlora team?',
            questionItem: {
              question: {
                required: false,
                textQuestion: { paragraph: true },
              },
            },
          },
          location: { index: 12 },
        },
      },
    ],
  };

  const updateRes = await fetch(`https://forms.googleapis.com/v1/forms/${formId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(batchRequests),
  });

  if (!updateRes.ok) {
    console.warn('Form created but batchUpdate failed to insert some questions');
  }

  return { formId, responderUri, editUrl };
}

/**
 * Fetch responses from Google Forms API
 */
export async function getGoogleFormResponses(
  accessToken: string,
  formId: string
): Promise<any> {
  const res = await fetch(`https://forms.googleapis.com/v1/forms/${formId}/responses`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Failed to fetch form responses: ${res.statusText}`);
  }

  return await res.json();
}
