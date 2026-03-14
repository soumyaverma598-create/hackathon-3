import type { Language } from '@/lib/translations';

export interface AssistantMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface LiveUserContext {
  userName?: string;
  userRole?: string;
  userDepartment?: string;
  applications?: Array<{
    id: string;
    applicationNumber: string;
    projectName: string;
    status: string;
    paymentStatus: string;
    openEdsCount: number;
    sector?: string;
  }>;
}

export const assistantQuickPrompts: Record<Language, string[]> = {
  en: [
    'How do I submit a new proponent proposal?',
    'Which documents do I need before applying?',
    'How does EDS work on this portal?',
    'How can I track my application status?',
  ],
  hi: [
    'नई प्रपोनेंट आवेदन प्रक्रिया कैसे शुरू करूं?',
    'आवेदन से पहले कौन से दस्तावेज चाहिए?',
    'इस पोर्टल पर EDS कैसे काम करता है?',
    'मैं आवेदन की स्थिति कैसे ट्रैक करूं?',
  ],
};

export const assistantWelcome: Record<Language, string> = {
  en: 'Hello. I can guide you through the PARIVESH portal, explain the proponent proposal flow, required documents, EDS, payment, status tracking, and role-based steps. Ask your question in plain language.',
  hi: 'नमस्ते। मैं PARIVESH पोर्टल में आपकी मदद कर सकता हूं। मैं प्रपोनेंट आवेदन प्रक्रिया, दस्तावेज, EDS, भुगतान, स्टेटस ट्रैकिंग और अलग-अलग भूमिकाओं के चरण समझा सकता हूं। अपना सवाल सीधे लिखें।',
};

export const assistantUiCopy: Record<
  Language,
  {
    title: string;
    subtitle: string;
    placeholder: string;
    send: string;
    suggested: string;
    unavailable: string;
    welcomeBadge: string;
  }
> = {
  en: {
    title: 'Portal Assistant',
    subtitle: 'Live navigation and workflow guidance',
    placeholder: 'Ask about application steps, documents, EDS, payment...',
    send: 'Send',
    suggested: 'Suggested questions',
    unavailable: 'AI is temporarily unavailable. Basic guidance is still active.',
    welcomeBadge: 'Need help?',
  },
  hi: {
    title: 'पोर्टल सहायक',
    subtitle: 'लाइव नेविगेशन और वर्कफ्लो मार्गदर्शन',
    placeholder: 'आवेदन चरण, दस्तावेज, EDS, भुगतान के बारे में पूछें...',
    send: 'भेजें',
    suggested: 'सुझावित प्रश्न',
    unavailable: 'AI अभी उपलब्ध नहीं है। बुनियादी मार्गदर्शन सक्रिय है।',
    welcomeBadge: 'मदद चाहिए?',
  },
};

const portalKnowledge = `
PARIVESH 3.0 portal summary:
- This is an Environmental Clearance portal for Government of India workflows.
- Main roles in the product: Proponent or Applicant, Scrutiny Officer, MoM Secretary, and System Admin.
- The portal has a landing page, login, applicant apply flow, applicant dashboard, documents, EDS, payment, scrutiny dashboard, MoM dashboard, and admin pages.

Key website features:
- Single window clearance experience.
- Real-time application tracking.
- EDS query management for scrutiny observations.
- Digital certificate and workflow visibility.

Proponent or applicant flow:
1. Log in as applicant or proponent.
2. Open the apply page and select application type.
3. Prepare and upload required documents based on project category.
4. Submit the application.
5. Complete payment when prompted.
6. Track status on the dashboard.
7. Respond to EDS queries if scrutiny raises observations.
8. Wait for scrutiny review, referral, MoM action, and final decision.
9. Download final outputs such as EC related documents when available.

Application types currently visible in the UI:
- Sand Mining
- Limestone Mining
- Bricks Manufacturing
- Infrastructure Development
- Industrial Project

Guidance rules:
- Help users navigate the website and explain which page or role they should use.
- Keep answers practical, step-by-step, and website-specific.
- If the user asks about required documents, mention that exact checklist items depend on application type.
- If the user asks about EDS, explain that scrutiny can raise observations and the proponent must respond through the portal.
- If the user asks about status tracking, direct them to the dashboard and relevant workflow pages.
- If the user asks about admin-only or officer-only functions, state the correct role clearly.
- If the question is outside this website, say you can only help with this portal and related process guidance.
`;

export function buildAssistantSystemPrompt(
  language: Language,
  pathname: string,
  context?: LiveUserContext,
) {
  const lines = [
    'You are the PARIVESH 3.0 portal assistant for this website only.',
    `Reply in the same language as this code: ${language}. If that language is unsupported, reply in simple English.`,
    `Current route in the app: ${pathname || '/'}.`,
    'You help users navigate the website, understand the proponent proposal process, identify where actions happen, and answer portal usage questions in real time.',
    'Keep replies concise, factual, and operational. Prefer 4 to 8 short bullet-like lines or short paragraphs when steps are needed.',
    'Do not invent legal commitments, approval guarantees, timelines, or backend state.',
    'If the answer depends on project category, say that clearly and list the categories available in the UI.',
    portalKnowledge.trim(),
  ];

  if (context) {
    const userLines = [
      'Live session context — use this to personalise your answers:',
      context.userName ? `- Logged-in user: ${context.userName}` : null,
      context.userRole ? `- Role: ${context.userRole}` : null,
      context.userDepartment ? `- Department / Organisation: ${context.userDepartment}` : null,
    ].filter((l): l is string => l !== null).join('\n');

    const appLines = context.applications?.length
      ? [
          `Applications visible to this user (${context.applications.length}):`,
          ...context.applications.map(
            (app) =>
              `  [${app.applicationNumber}] ${app.projectName} — status: ${app.status}, payment: ${app.paymentStatus}` +
              (app.openEdsCount > 0 ? `, open EDS queries: ${app.openEdsCount}` : '') +
              (app.sector ? `, sector: ${app.sector}` : '')
          ),
        ].join('\n')
      : 'No applications loaded for this user yet.';

    lines.push([userLines, appLines].join('\n'));
  }

  return lines.join('\n\n');
}

export function getAssistantFallbackReply(message: string, language: Language) {
  const query = message.toLowerCase();

  if (
    query.includes('apply') ||
    query.includes('proposal') ||
    query.includes('application') ||
    query.includes('proponent') ||
    query.includes('submit')
  ) {
    return fallbackByLanguage(language, {
      en: 'To submit a proponent proposal, log in as the applicant or proponent, open the Apply page, choose the project type, complete the application details, upload the required documents, and submit. After submission, complete payment if requested and monitor the dashboard for scrutiny updates and EDS queries.',
      hi: 'प्रपोनेंट आवेदन जमा करने के लिए applicant या proponent के रूप में लॉगिन करें, Apply पेज खोलें, प्रोजेक्ट टाइप चुनें, आवेदन विवरण भरें, जरूरी दस्तावेज अपलोड करें और सबमिट करें। सबमिशन के बाद यदि भुगतान मांगा जाए तो भुगतान करें और scrutiny अपडेट तथा EDS queries के लिए dashboard देखते रहें।',
    });
  }

  if (
    query.includes('document') ||
    query.includes('upload') ||
    query.includes('checklist') ||
    query.includes('file')
  ) {
    return fallbackByLanguage(language, {
      en: 'The required documents depend on the application type. The portal already shows separate checklists for Sand Mining, Limestone Mining, Bricks Manufacturing, Infrastructure Development, and Industrial Project flows. In general, keep Form 1 or related forms, project reports, land records, maps, NOCs, compliance documents, and supporting technical files ready before you apply.',
      hi: 'जरूरी दस्तावेज आवेदन के प्रकार पर निर्भर करते हैं। पोर्टल में Sand Mining, Limestone Mining, Bricks Manufacturing, Infrastructure Development और Industrial Project के लिए अलग-अलग checklist दिखाई जाती है। सामान्य रूप से Form 1 या संबंधित फॉर्म, project reports, land records, maps, NOC, compliance documents और technical supporting files तैयार रखें।',
    });
  }

  if (query.includes('eds') || query.includes('query') || query.includes('observation')) {
    return fallbackByLanguage(language, {
      en: 'EDS is the observation or query stage raised during scrutiny. If an officer raises an EDS query, the proponent should open the relevant application, review the observation carefully, upload or edit the required response, and resubmit through the portal. Keep checking the dashboard so the case does not stay pending.',
      hi: 'EDS scrutiny के दौरान उठाई गई observation या query stage है। यदि अधिकारी EDS query उठाते हैं, तो proponent को संबंधित application खोलना चाहिए, observation ध्यान से देखना चाहिए, जरूरी उत्तर या दस्तावेज अपलोड करने चाहिए और portal के माध्यम से दोबारा submit करना चाहिए। Dashboard नियमित रूप से देखते रहें ताकि मामला pending न रहे।',
    });
  }

  if (query.includes('payment') || query.includes('fee')) {
    return fallbackByLanguage(language, {
      en: 'Payment usually comes after the application reaches the required step in the workflow. Open the applicant payment page, confirm the application reference, complete the payment, and then return to the dashboard to verify that the status has moved forward.',
      hi: 'भुगतान आमतौर पर workflow के आवश्यक चरण पर पहुंचने के बाद आता है। Applicant payment page खोलें, application reference जांचें, भुगतान पूरा करें और फिर dashboard पर वापस जाकर देखें कि status आगे बढ़ा है या नहीं।',
    });
  }

  if (query.includes('track') || query.includes('status') || query.includes('dashboard')) {
    return fallbackByLanguage(language, {
      en: 'Use the dashboard to track status. The applicant dashboard is the main place to monitor drafts, submissions, scrutiny progress, EDS activity, and later-stage outputs. Open the relevant application record to see stage-specific actions.',
      hi: 'Status track करने के लिए dashboard का उपयोग करें। Applicant dashboard drafts, submissions, scrutiny progress, EDS activity और बाद के outputs देखने की मुख्य जगह है। Stage-specific actions देखने के लिए संबंधित application record खोलें।',
    });
  }

  if (query.includes('role') || query.includes('login') || query.includes('admin') || query.includes('scrutiny') || query.includes('mom')) {
    return fallbackByLanguage(language, {
      en: 'This portal supports role-based workflows. Proponents or applicants create and manage proposals. Scrutiny officers review submissions and raise EDS queries. MoM users handle meeting and recommendation stages. Admin users manage settings and users. Make sure you sign in with the role that matches the task you want to perform.',
      hi: 'यह portal role-based workflow पर काम करता है। Proponent या applicant proposal बनाते और manage करते हैं। Scrutiny officers submissions review करते हैं और EDS queries उठाते हैं। MoM users meeting और recommendation stages संभालते हैं। Admin users settings और users manage करते हैं। जिस काम को करना है उसी के अनुसार सही role से sign in करें।',
    });
  }

  return fallbackByLanguage(language, {
    en: 'I can help you with this portal: how to start an application, choose the correct role, prepare documents, respond to EDS, complete payment, and track status. Ask a specific question about the page or step you are stuck on.',
    hi: 'मैं इस portal में आपकी मदद कर सकता हूं: आवेदन शुरू करना, सही role चुनना, दस्तावेज तैयार करना, EDS का जवाब देना, भुगतान पूरा करना और status track करना। जिस page या step पर आप रुके हैं उसके बारे में specific question पूछें।',
  });
}

function fallbackByLanguage(
  language: Language,
  messages: { en: string; hi: string }
) {
  return language === 'hi' ? messages.hi : messages.en;
}