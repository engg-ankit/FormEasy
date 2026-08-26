// ─── ClickNsit Telegram Bot — Complete Handler ──────────────────
import { prisma } from './prisma';
import {
  mainMenuKeyboard, examListKeyboard, examDetailKeyboard,
  applicationListKeyboard, applicationDetailKeyboard,
  paymentKeyboard, confirmKeyboard, adminAppKeyboard,
  cancelConfirmKeyboard,
} from './telegram-keyboards';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

// ─── In-memory conversation state (per chat) ────────────────────
const conversations = new Map<number, {
  step: string;
  data: any;
  examId?: string;
  applicationId?: string;
}>();

// ─── Telegram API Helpers ───────────────────────────────────────

async function send(chatId: number, text: string, replyMarkup?: any) {
  if (!BOT_TOKEN) return;
  try {
    const body: any = { chat_id: chatId, text, parse_mode: 'HTML' };
    if (replyMarkup) body.reply_markup = replyMarkup;
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });
  } catch (err: any) {
    console.error('[TG] Send error:', err.message);
  }
}

async function editMessage(chatId: number, messageId: number, text: string, replyMarkup?: any) {
  if (!BOT_TOKEN) return;
  try {
    const body: any = { chat_id: chatId, message_id: messageId, text, parse_mode: 'HTML' };
    if (replyMarkup) body.reply_markup = replyMarkup;
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });
  } catch {}
}

async function answerCallback(callbackId: number, text?: string) {
  if (!BOT_TOKEN) return;
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callback_query_id: callbackId, text, show_alert: false }),
      signal: AbortSignal.timeout(3000),
    });
  } catch {}
}

async function sendPhoto(chatId: number, photo: string, caption: string) {
  if (!BOT_TOKEN) return;
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, photo, caption, parse_mode: 'HTML' }),
      signal: AbortSignal.timeout(10000),
    });
  } catch {}
}

// ─── DB Helpers ─────────────────────────────────────────────────

async function findUserByTelegram(telegramId: string) {
  // Try mobile match first (for linked users), then try telegram-specific field
  return prisma.user.findFirst({
    where: {
      OR: [
        { mobile: telegramId },
        { referralCode: `TG_${telegramId}` },
      ],
    },
  });
}

async function isAdmin(telegramId: string): Promise<boolean> {
  const adminIds = (process.env.TELEGRAM_ADMIN_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
  if (adminIds.includes(telegramId)) return true;
  // If no admin IDs configured, check DB
  if (adminIds.length === 0) {
    const admin = await prisma.admin.findFirst();
    return !!admin;
  }
  return false;
}

// ─── Main Entry Points ──────────────────────────────────────────

export async function handleMessage(message: any) {
  const chatId = message.chat.id;
  const text = message.text || '';
  const firstName = message.from?.first_name || 'User';
  const telegramId = String(message.from?.id || '');

  console.log(`[TG] ${firstName} (${telegramId}): ${text}`);

  // Check for active conversation (form filling flow)
  const conv = conversations.get(chatId);
  if (conv && !text.startsWith('/')) {
    await handleConversationStep(chatId, telegramId, text, conv);
    return;
  }

  // Route commands — run DB queries in parallel for speed
  if (text.startsWith('/start')) {
    // /start: fast path — send welcome first, DB query in background
    const [user, admin] = await Promise.all([
      findUserByTelegram(telegramId),
      isAdmin(telegramId),
    ]);
    await cmdStart(chatId, firstName, telegramId, user, admin);
  } else if (text === '/help') {
    await cmdHelp(chatId);
  } else if (text === '/menu') {
    const [user, admin] = await Promise.all([
      findUserByTelegram(telegramId),
      isAdmin(telegramId),
    ]);
    await showMenu(chatId, user, admin);
  } else if (text === '/exams' || text === '/browse') {
    await cmdBrowseExams(chatId);
  } else if (text === '/status' || text === '/apps') {
    await cmdMyApps(chatId, telegramId);
  } else if (text === '/profile') {
    await cmdProfile(chatId, telegramId);
  } else if (text === '/payments') {
    await cmdPayments(chatId, telegramId);
  } else if (text === '/link') {
    await cmdLink(chatId);
  } else {
    const [user, admin] = await Promise.all([
      findUserByTelegram(telegramId),
      isAdmin(telegramId),
    ]);
    if (!user && !admin) {
      await send(chatId,
        `👋 Hi ${firstName}! I'm the ClickNsit Bot.\n\n` +
        `🖥️ <b>Online Cyber Cafe — Form Filling Service</b>\n\n` +
        `Send /start to begin!`
      );
    }
  }
}

export async function handleCallback(callbackQuery: any) {
  const chatId = callbackQuery.message?.chat.id;
  const data = callbackQuery.data;
  const telegramId = String(callbackQuery.from?.id || '');
  const messageId = callbackQuery.message?.message_id;

  if (!chatId || !data) return;
  await answerCallback(callbackQuery.id);

  const [user, admin] = await Promise.all([
    findUserByTelegram(telegramId),
    isAdmin(telegramId),
  ]);

  // ─── User Callbacks ──────────────────────────────────────
  if (data === 'menu') {
    await showMenu(chatId, user, admin);
  } else if (data === 'help') {
    await cmdHelp(chatId);
  } else if (data === 'my_apps') {
    await cmdMyApps(chatId, telegramId);
  } else if (data === 'browse_exams') {
    await cmdBrowseExams(chatId);
  } else if (data === 'payments') {
    await cmdPayments(chatId, telegramId);
  } else if (data === 'profile') {
    await cmdProfile(chatId, telegramId);
  } else if (data === 'contact_support') {
    await send(chatId,
      `💬 <b>Contact Support</b>\n\n` +
      `📧 Email: support@clickandsit.vercel.app\n` +
      `🌐 Web: clickandsit.vercel.app/contact\n\n` +
      `⏰ Support Hours: 9 AM - 9 PM (Mon-Sat)`
    );
  } else if (data === 'request_form') {
    conversations.set(chatId, { step: 'request_name', data: {} });
    await send(chatId, `📩 <b>Request a Form</b>\n\nWhat form do you need? Send the form/exam name:`);
  } else if (data.startsWith('exams_page_')) {
    const page = parseInt(data.replace('exams_page_', ''));
    const exams = await prisma.exam.findMany({ where: { isActive: true }, orderBy: { createdAt: 'desc' } });
    await send(chatId, `📋 <b>Available Forms</b> (Page ${page + 1})`, examListKeyboard(exams, page));
  } else if (data.startsWith('exam_')) {
    const examId = data.replace('exam_', '');
    await cmdExamDetail(chatId, examId);
  } else if (data.startsWith('apply_')) {
    const examId = data.replace('apply_', '');
    await cmdApplyStart(chatId, telegramId, examId);
  } else if (data.startsWith('app_') && !data.startsWith('app_detail_') && !data.startsWith('admin_')) {
    const appId = data.replace('app_', '');
    await cmdAppDetail(chatId, appId);
  } else if (data.startsWith('app_detail_')) {
    const appId = data.replace('app_detail_', '');
    await cmdAppFullDetail(chatId, appId);
  } else if (data.startsWith('pay_')) {
    const appId = data.replace('pay_', '');
    await cmdPayInfo(chatId, appId);
  } else if (data.startsWith('cancel_') && !data.startsWith('cancel_confirm_')) {
    const appId = data.replace('cancel_', '');
    await send(chatId, `⚠️ <b>Are you sure you want to cancel this application?</b>`, cancelConfirmKeyboard(appId));
  } else if (data.startsWith('cancel_confirm_')) {
    const appId = data.replace('cancel_confirm_', '');
    await cmdCancelApp(chatId, appId);
  } else if (data.startsWith('receipt_')) {
    const appId = data.replace('receipt_', '');
    await cmdDownloadReceipt(chatId, appId);
  }
  // ─── Admin Callbacks ─────────────────────────────────────
  else if (data === 'admin_stats') {
    await cmdAdminStats(chatId);
  } else if (data === 'admin_pending') {
    await cmdAdminPending(chatId);
  } else if (data === 'admin_revenue') {
    await cmdAdminRevenue(chatId);
  } else if (data.startsWith('admin_app_')) {
    const appId = data.replace('admin_app_', '');
    await cmdAdminAppDetail(chatId, appId);
  } else if (data.startsWith('admin_process_')) {
    const appId = data.replace('admin_process_', '');
    await cmdAdminStatusChange(chatId, appId, 'IN_PROCESS');
  } else if (data.startsWith('admin_formfilled_')) {
    const appId = data.replace('admin_formfilled_', '');
    await cmdAdminStatusChange(chatId, appId, 'FORM_FILLED');
  } else if (data.startsWith('admin_done_')) {
    const appId = data.replace('admin_done_', '');
    await cmdAdminStatusChange(chatId, appId, 'COMPLETED');
  } else if (data.startsWith('admin_reject_')) {
    const appId = data.replace('admin_reject_', '');
    await cmdAdminStatusChange(chatId, appId, 'REJECTED');
  } else if (data.startsWith('admin_receipt_')) {
    const appId = data.replace('admin_receipt_', '');
    conversations.set(chatId, { step: 'admin_upload_receipt', data: {}, applicationId: appId });
    await send(chatId, `📤 <b>Upload Filled Form Receipt</b>\n\nSend the PDF file now (max 3MB):`);
  }
}

// ─── /start Command ─────────────────────────────────────────────

async function cmdStart(chatId: number, firstName: string, telegramId: string, user: any, admin: boolean) {
  if (user) {
    const lines = [
      `🎉 Welcome back, <b>${user.fullName}</b>!`,
      ``,
      `🖥️ <b>ClickNsit — Online Cyber Cafe</b>`,
      ``,
      `I can help you with everything — just like the website!`,
    ];
    await send(chatId, lines.join('\n'), mainMenuKeyboard(admin));
  } else {
    const lines = [
      `👋 Hi <b>${firstName}</b>! Welcome to <b>ClickNsit</b>!`,
      ``,
      `🖥️ <b>Online Cyber Cafe — Form Filling Service</b>`,
      ``,
      `I can do everything the website does:`,
      `📋 Browse & apply for exam forms`,
      `💳 Make payments securely`,
      `📊 Track your application status`,
      `📥 Download your filled form receipts`,
      ``,
      `🔗 <b>First time? Link your account:</b>`,
      `Send /link to connect your ClickNsit account.`,
      ``,
      `No account yet? Sign up at:`,
      `🌐 clickandsit.vercel.app/signup`,
    ];
    await send(chatId, lines.join('\n'), { inline_keyboard: [
      [{ text: '🔗 Link Account', callback_data: 'link' }],
      [{ text: '❓ Help', callback_data: 'help' }],
    ]});
  }
}

async function showMenu(chatId: number, user: any, admin: boolean) {
  if (!user) {
    await send(chatId,
      `❌ <b>Account not linked</b>\n\n` +
      `Send /link to connect your ClickNsit account first.`,
      { inline_keyboard: [[{ text: '🔗 Link Account', callback_data: 'link' }]] }
    );
    return;
  }
  await send(chatId, `📋 <b>ClickNsit Menu</b> — Choose an option:`, mainMenuKeyboard(admin));
}

// ─── /help ──────────────────────────────────────────────────────

async function cmdHelp(chatId: number) {
  await send(chatId,
    `❓ <b>ClickNsit Bot — Help</b>\n\n` +
    `<b>User Commands:</b>\n` +
    `/menu — Open main menu\n` +
    `/link — Link your ClickNsit account\n` +
    `/exams — Browse available forms\n` +
    `/status — Check your applications\n` +
    `/payments — Payment history\n` +
    `/profile — Your profile info\n` +
    `/help — This help message\n\n` +
    `<b>How it works:</b>\n` +
    `1️⃣ Link your account (/link)\n` +
    `2️⃣ Browse forms (/exams)\n` +
    `3️⃣ Apply with /apply or "Apply Now" button\n` +
    `4️⃣ Pay — we submit your form!\n` +
    `5️⃣ Track status anytime\n\n` +
    `<b>Need help?</b>\n` +
    `📧 support@clickandsit.vercel.app\n` +
    `🌐 clickandsit.vercel.app/contact`
  );
}

// ─── /link — Account Linking ────────────────────────────────────

async function cmdLink(chatId: number) {
  conversations.set(chatId, { step: 'link_email', data: {} });
  await send(chatId,
    `🔗 <b>Link Your ClickNsit Account</b>\n\n` +
    `Send your <b>registered email address</b> to link:`
  );
}

// ─── /exams — Browse Exams ──────────────────────────────────────

async function cmdBrowseExams(chatId: number) {
  const exams = await prisma.exam.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  });

  if (exams.length === 0) {
    await send(chatId, `📋 No exams available right now. Check back soon!`);
    return;
  }

  await send(chatId, `📋 <b>Available Forms</b> (${exams.length} total)\n\nTap to view details:`, examListKeyboard(exams, 0));
}

async function cmdExamDetail(chatId: number, examId: string) {
  const exam = await prisma.exam.findUnique({ where: { id: examId } });
  if (!exam) {
    await send(chatId, `❌ Exam not found.`);
    return;
  }

  const fee = (exam.officialFee + exam.serviceFee) / 100;
  const officialFee = exam.officialFee / 100;
  const serviceFee = exam.serviceFee / 100;
  const lastDate = new Date(exam.lastDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  let docs: string[] = [];
  try { docs = JSON.parse(exam.requiredDocuments); } catch {}

  const lines = [
    `📝 <b>${exam.title}</b>`,
    ``,
    `📂 Category: ${exam.category}`,
    `💰 Total Fee: ₹${fee}`,
    `   ├ Official Fee: ₹${officialFee}`,
    `   └ Service Fee: ₹${serviceFee}`,
    `⏰ Last Date: ${lastDate}`,
    ``,
    `<b>Description:</b>\n${exam.description}`,
  ];

  if (docs.length) {
    lines.push('');
    lines.push('<b>📄 Required Documents:</b>');
    docs.forEach((d, i) => lines.push(`  ${i + 1}. ${d}`));
  }

  await send(chatId, lines.join('\n'), examDetailKeyboard(examId));
}

// ─── /status — My Applications ──────────────────────────────────

async function cmdMyApps(chatId: number, telegramId: string) {
  const user = await findUserByTelegram(telegramId);
  if (!user) {
    await send(chatId, `❌ <b>Account not linked.</b> Send /link first.`);
    return;
  }

  const apps = await prisma.application.findMany({
    where: { userId: user.id },
    include: { exam: true, payment: true },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  if (apps.length === 0) {
    await send(chatId,
      `📋 <b>No Applications Yet</b>\n\n` +
      `Browse forms and apply now!`,
      { inline_keyboard: [[{ text: '🔍 Browse Exams', callback_data: 'browse_exams' }]] }
    );
    return;
  }

  await send(chatId, `📋 <b>Your Applications</b> (${apps.length})\n\nTap to view:`, applicationListKeyboard(apps));
}

async function cmdAppDetail(chatId: number, appId: string) {
  const app = await prisma.application.findUnique({
    where: { id: appId },
    include: { exam: true, payment: true },
  });

  if (!app) {
    await send(chatId, `❌ Application not found.`);
    return;
  }

  const emoji = statusEmoji(app.status);
  const fee = (app.exam.officialFee + app.exam.serviceFee) / 100;
  const payStatus = app.payment?.status === 'SUCCESS' ? '✅ Paid' : app.payment ? '⏳ Pending' : '❌ Unpaid';
  const applied = new Date(app.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const lines = [
    `${emoji} <b>${app.exam.title}</b>`,
    ``,
    `📋 Status: <b>${app.status.replace(/_/g, ' ')}</b>`,
    `💰 Fee: ₹${fee}`,
    `💳 Payment: ${payStatus}`,
    `📅 Applied: ${applied}`,
    `🆔 <code>${app.id.slice(-8)}</code>`,
  ];

  await send(chatId, lines.join('\n'), applicationDetailKeyboard(app.id, app.status));
}

async function cmdAppFullDetail(chatId: number, appId: string) {
  const app = await prisma.application.findUnique({
    where: { id: appId },
    include: { exam: true, payment: true, documents: true },
  });

  if (!app) {
    await send(chatId, `❌ Application not found.`);
    return;
  }

  let formData: any = {};
  try { formData = JSON.parse(app.formData); } catch {}

  const lines = [
    `📄 <b>Application Details</b>`,
    `━━━━━━━━━━━━━━━━━━`,
    ``,
    `<b>📝 Form:</b> ${app.exam.title}`,
    `<b>📂 Category:</b> ${app.exam.category}`,
    `<b>📋 Status:</b> ${app.status.replace(/_/g, ' ')}`,
    ``,
  ];

  // Personal details
  const personalFields = ['fullName', 'fatherName', 'motherName', 'dob', 'gender', 'category', 'mobile', 'email', 'address', 'city', 'state', 'pincode'];
  const eduFields = ['education', 'board', 'university', 'yearOfPassing', 'percentage'];

  lines.push('<b>👤 Personal Details:</b>');
  for (const key of personalFields) {
    if (formData[key]) lines.push(`  ${key.replace(/([A-Z])/g, ' $1')}: ${formData[key]}`);
  }

  const hasEdu = eduFields.some(k => formData[k]);
  if (hasEdu) {
    lines.push('');
    lines.push('<b>🎓 Education:</b>');
    for (const key of eduFields) {
      if (formData[key]) lines.push(`  ${key.replace(/([A-Z])/g, ' $1')}: ${formData[key]}`);
    }
  }

  // Payment
  if (app.payment) {
    lines.push('');
    lines.push('<b>💳 Payment:</b>');
    lines.push(`  Amount: ₹${app.payment.amount / 100}`);
    lines.push(`  Status: ${app.payment.status}`);
    if (app.payment.razorpayPaymentId) lines.push(`  ID: ${app.payment.razorpayPaymentId}`);
  }

  // Documents
  if (app.documents.length) {
    lines.push('');
    lines.push(`<b>📄 Documents:</b> ${app.documents.length} uploaded`);
  }

  await send(chatId, lines.join('\n'), applicationDetailKeyboard(app.id, app.status));
}

// ─── /payments — Payment History ────────────────────────────────

async function cmdPayments(chatId: number, telegramId: string) {
  const user = await findUserByTelegram(telegramId);
  if (!user) {
    await send(chatId, `❌ <b>Account not linked.</b> Send /link first.`);
    return;
  }

  const apps = await prisma.application.findMany({
    where: { userId: user.id, payment: { isNot: null } },
    include: { exam: true, payment: true },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  if (apps.length === 0) {
    await send(chatId, `💰 <b>No Payments Yet</b>\n\nYour payment history will appear here.`);
    return;
  }

  const lines = [`💰 <b>Payment History</b>`, ``];

  let totalSpent = 0;
  for (const app of apps) {
    if (app.payment?.status === 'SUCCESS') {
      totalSpent += app.payment.amount;
    }
    const emoji = app.payment?.status === 'SUCCESS' ? '✅' : '⏳';
    lines.push(`${emoji} <b>${app.exam.title}</b>`);
    lines.push(`   ₹${app.payment!.amount / 100} • ${app.payment!.status}`);
    lines.push(`   ${new Date(app.createdAt).toLocaleDateString('en-IN')}`);
    lines.push('');
  }

  lines.push(`💰 <b>Total Spent: ₹${totalSpent / 100}</b>`);

  await send(chatId, lines.join('\n'));
}

// ─── /profile ───────────────────────────────────────────────────

async function cmdProfile(chatId: number, telegramId: string) {
  const user = await findUserByTelegram(telegramId);
  if (!user) {
    await send(chatId, `❌ <b>Account not linked.</b> Send /link first.`);
    return;
  }

  const appCount = await prisma.application.count({ where: { userId: user.id } });
  const paidCount = await prisma.application.count({
    where: { userId: user.id, payment: { status: 'SUCCESS' } },
  });

  await send(chatId,
    `👤 <b>Your Profile</b>\n` +
    `━━━━━━━━━━━━━━━━━━\n\n` +
    `👤 Name: ${user.fullName}\n` +
    `📱 Mobile: ${user.mobile}\n` +
    `📧 Email: ${user.email}\n\n` +
    `📋 Applications: ${appCount}\n` +
    `💰 Paid: ${paidCount}\n` +
    `🎁 Referral Code: ${user.referralCode || 'N/A'}\n` +
    `🎁 Referral Bonus: ₹${(user.referralBonus / 100).toFixed(0)}`
  );
}

// ─── Apply Flow (Multi-step Conversation) ───────────────────────

async function cmdApplyStart(chatId: number, telegramId: string, examId: string) {
  const user = await findUserByTelegram(telegramId);
  if (!user) {
    await send(chatId,
      `❌ <b>Account not linked</b>\n\n` +
      `Send /link to connect your account first.`,
      { inline_keyboard: [[{ text: '🔗 Link Account', callback_data: 'link' }]] }
    );
    return;
  }

  const exam = await prisma.exam.findUnique({ where: { id: examId } });
  if (!exam) {
    await send(chatId, `❌ Exam not found.`);
    return;
  }

  // Check if already applied
  const existing = await prisma.application.findFirst({
    where: { userId: user.id, examId, status: { not: 'DRAFT' } },
  });
  if (existing) {
    await send(chatId,
      `⚠️ You've already applied for <b>${exam.title}</b>.\n\n` +
      `Application ID: <code>${existing.id.slice(-8)}</code>\n` +
      `Status: ${existing.status.replace(/_/g, ' ')}`
    );
    return;
  }

  // Start conversation
  conversations.set(chatId, {
    step: 'apply_name',
    data: { userId: user.id, examId, examTitle: exam.title },
    examId,
  });

  const fee = (exam.officialFee + exam.serviceFee) / 100;
  await send(chatId,
    `📝 <b>Applying for: ${exam.title}</b>\n` +
    `💰 Fee: ₹${fee}\n\n` +
    `I'll ask you a few details. Send /cancel to stop.\n\n` +
    `<b>Step 1/5 — Personal Details</b>\n\n` +
    `👤 What is your <b>full name</b>?`
  );
}

async function handleConversationStep(chatId: number, telegramId: string, text: string, conv: any) {
  // Cancel flow
  if (text.toLowerCase() === '/cancel' || text.toLowerCase() === 'cancel') {
    conversations.delete(chatId);
    await send(chatId, `❌ <b>Cancelled.</b>`, { inline_keyboard: [[{ text: '🔙 Back to Menu', callback_data: 'menu' }]] });
    return;
  }

  // ─── Apply Form Steps ────────────────────────────────────
  if (conv.step === 'apply_name') {
    conv.data.fullName = text;
    conv.step = 'apply_father';
    await send(chatId, `<b>Step 1/5 — Personal Details</b>\n\n👤 What is your <b>father's name</b>?`);
  } else if (conv.step === 'apply_father') {
    conv.data.fatherName = text;
    conv.step = 'apply_mother';
    await send(chatId, `👤 What is your <b>mother's name</b>?`);
  } else if (conv.step === 'apply_mother') {
    conv.data.motherName = text;
    conv.step = 'apply_dob';
    await send(chatId, `📅 What is your <b>date of birth</b>? (DD/MM/YYYY)`);
  } else if (conv.step === 'apply_dob') {
    conv.data.dob = text;
    conv.step = 'apply_gender';
    await send(chatId, `👤 Gender? (Male / Female / Other)`);
  } else if (conv.step === 'apply_gender') {
    conv.data.gender = text;
    conv.step = 'apply_category';
    await send(chatId, `📂 Category? (General / OBC / SC / ST / EWS)`);
  } else if (conv.step === 'apply_category') {
    conv.data.category = text;
    conv.step = 'apply_email';
    await send(chatId, `<b>Step 2/5 — Contact</b>\n\n📧 Your <b>email address</b>?`);
  } else if (conv.step === 'apply_email') {
    conv.data.email = text;
    conv.step = 'apply_address';
    await send(chatId, `<b>Step 3/5 — Address</b>\n\n🏠 Your <b>full address</b>?`);
  } else if (conv.step === 'apply_address') {
    conv.data.address = text;
    conv.step = 'apply_city';
    await send(chatId, `🏙️ <b>City</b>?`);
  } else if (conv.step === 'apply_city') {
    conv.data.city = text;
    conv.step = 'apply_state';
    await send(chatId, `🗺️ <b>State</b>?`);
  } else if (conv.step === 'apply_state') {
    conv.data.state = text;
    conv.step = 'apply_pincode';
    await send(chatId, `📮 <b>PIN code</b>?`);
  } else if (conv.step === 'apply_pincode') {
    conv.data.pincode = text;
    conv.step = 'apply_education';
    await send(chatId, `<b>Step 4/5 — Education</b>\n\n🎓 Highest <b>qualification</b>?`);
  } else if (conv.step === 'apply_education') {
    conv.data.education = text;
    conv.step = 'apply_board';
    await send(chatId, `🏫 <b>Board / University</b>?`);
  } else if (conv.step === 'apply_board') {
    conv.data.board = text;
    conv.step = 'apply_year';
    await send(chatId, `📅 <b>Year of Passing</b>?`);
  } else if (conv.step === 'apply_year') {
    conv.data.yearOfPassing = text;
    conv.step = 'apply_review';
    // Show review
    const lines = [
      `<b>Step 5/5 — Review</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      ``,
      `<b>📝 Form:</b> ${conv.data.examTitle}`,
      ``,
      `<b>👤 Personal:</b>`,
      `  Name: ${conv.data.fullName}`,
      `  Father: ${conv.data.fatherName}`,
      `  Mother: ${conv.data.motherName}`,
      `  DOB: ${conv.data.dob}`,
      `  Gender: ${conv.data.gender}`,
      `  Category: ${conv.data.category}`,
      ``,
      `<b>📧 Contact:</b>`,
      `  Email: ${conv.data.email}`,
      ``,
      `<b>🏠 Address:</b>`,
      `  ${conv.data.address}, ${conv.data.city}, ${conv.data.state} - ${conv.data.pincode}`,
      ``,
      `<b>🎓 Education:</b>`,
      `  ${conv.data.education} from ${conv.data.board} (${conv.data.yearOfPassing})`,
    ];

    await send(chatId, lines.join('\n'), {
      inline_keyboard: [
        [{ text: '✅ Submit Application', callback_data: 'apply_submit' }],
        [{ text: '❌ Cancel', callback_data: 'menu' }],
      ],
    });
  } else if (conv.step === 'apply_review') {
    if (text.toLowerCase() === 'yes' || text.toLowerCase() === 'submit' || text.toLowerCase() === 'confirm') {
      await submitApplication(chatId, conv);
    } else {
      await send(chatId, `Send "yes" to submit or "no" to cancel.`);
    }
  }
  // ─── Link Account Step ───────────────────────────────────
  else if (conv.step === 'link_email') {
    const user = await prisma.user.findUnique({ where: { email: text.trim() } });
    if (user) {
      // Link by updating referralCode to include telegram ID
      await prisma.user.update({
        where: { id: user.id },
        data: { referralCode: `TG_${telegramId}` },
      });
      conversations.delete(chatId);
      const admin = await isAdmin(telegramId);
      await send(chatId,
        `✅ <b>Account Linked!</b>\n\n` +
        `👤 ${user.fullName}\n` +
        `📱 ${user.mobile}\n` +
        `📧 ${user.email}\n\n` +
        `You can now use all bot features!`,
        mainMenuKeyboard(admin)
      );
    } else {
      await send(chatId, `❌ No account found with this email.\n\nCheck your email and try again, or sign up at clickandsit.vercel.app/signup`);
    }
  }
  // ─── Request Form Step ───────────────────────────────────
  else if (conv.step === 'request_name') {
    conv.data.formName = text;
    conv.step = 'request_portal';
    await send(chatId, `🌐 Which <b>portal</b> is this form on? (e.g., SSC, IBPS, Railway)`);
  } else if (conv.step === 'request_portal') {
    conv.data.portal = text;
    conv.step = 'request_category';
    await send(chatId, `📂 <b>Category</b>? (Government / College / Scholarship / Other)`);
  } else if (conv.step === 'request_category') {
    conv.data.category = text;
    // Submit form request
    const user = await findUserByTelegram(telegramId);
    if (user) {
      await prisma.formRequest.create({
        data: {
          userId: user.id,
          formName: conv.data.formName,
          category: conv.data.category,
          portalName: conv.data.portal,
          contactNumber: user.mobile,
        },
      });
    }
    conversations.delete(chatId);
    await send(chatId,
      `✅ <b>Form Request Submitted!</b>\n\n` +
      `📝 Form: ${conv.data.formName}\n` +
      `🌐 Portal: ${conv.data.portal}\n` +
      `📂 Category: ${conv.data.category}\n\n` +
      `We'll add it within 24-48 hours and notify you!`,
      { inline_keyboard: [[{ text: '🔙 Back to Menu', callback_data: 'menu' }]] }
    );
  }
  // ─── Admin Receipt Upload Step ───────────────────────────
  else if (conv.step === 'admin_upload_receipt') {
    await send(chatId, `⚠️ Please send a PDF file, not text. Use the 📎 attachment button.`);
  }
}

async function submitApplication(chatId: number, conv: any) {
  try {
    const exam = await prisma.exam.findUnique({ where: { id: conv.data.examId } });
    if (!exam) {
      await send(chatId, `❌ Exam not found.`);
      conversations.delete(chatId);
      return;
    }

    const app = await prisma.application.create({
      data: {
        userId: conv.data.userId,
        examId: conv.data.examId,
        formData: JSON.stringify(conv.data),
        status: 'SUBMITTED',
      },
    });

    // Create payment record
    const totalAmount = exam.officialFee + exam.serviceFee;
    await prisma.payment.create({
      data: {
        applicationId: app.id,
        amount: totalAmount,
        razorpayOrderId: `pending_${app.id}`,
        status: 'PENDING',
      },
    });

    // Log status
    await prisma.statusHistory.create({
      data: {
        applicationId: app.id,
        oldStatus: null,
        newStatus: 'SUBMITTED',
        changedBy: 'telegram_bot',
        changedByName: 'Telegram Bot',
      },
    });

    conversations.delete(chatId);

    const fee = totalAmount / 100;
    const paymentLink = `clickandsit.vercel.app/payment/${app.id}`;

    await send(chatId,
      `🎉 <b>Application Submitted!</b>\n\n` +
      `📝 Form: ${exam.title}\n` +
      `🆔 ID: <code>${app.id.slice(-8)}</code>\n` +
      `💰 Total: ₹${fee}\n\n` +
      `💳 <b>Next: Complete Payment</b>\n\n` +
      `Pay online at:\n` +
      `🌐 ${paymentLink}\n\n` +
      `After payment, our team will fill your form on the official portal!`,
      {
        inline_keyboard: [
          [{ text: '💳 Pay Now', url: `https://${paymentLink}` }],
          [{ text: '📋 Check Status', callback_data: `app_${app.id}` }],
          [{ text: '🔙 Back to Menu', callback_data: 'menu' }],
        ],
      }
    );

  } catch (err: any) {
    console.error('[TG] Submit error:', err);
    conversations.delete(chatId);
    await send(chatId, `❌ Error submitting application. Please try again or use the website.`);
  }
}

// ─── Payment Info ───────────────────────────────────────────────

async function cmdPayInfo(chatId: number, appId: string) {
  const app = await prisma.application.findUnique({
    where: { id: appId },
    include: { exam: true, payment: true },
  });

  if (!app) {
    await send(chatId, `❌ Application not found.`);
    return;
  }

  if (app.payment?.status === 'SUCCESS') {
    await send(chatId, `✅ <b>Payment already completed!</b>\n\nAmount: ₹${app.payment.amount / 100}`);
    return;
  }

  const fee = (app.exam.officialFee + app.exam.serviceFee) / 100;
  const paymentUrl = `https://clickandsit.vercel.app/payment/${app.id}`;

  await send(chatId,
    `💳 <b>Payment Details</b>\n\n` +
    `📝 Form: ${app.exam.title}\n` +
    `💰 Amount: ₹${fee}\n\n` +
    `Tap below to pay securely via Razorpay:`,
    {
      inline_keyboard: [
        [{ text: `💳 Pay ₹${fee} Now`, url: paymentUrl }],
        [{ text: '🔙 Back', callback_data: `app_${appId}` }],
      ],
    }
  );
}

// ─── Cancel Application ─────────────────────────────────────────

async function cmdCancelApp(chatId: number, appId: string) {
  try {
    const app = await prisma.application.findUnique({ where: { id: appId } });
    if (!app || app.status !== 'SUBMITTED') {
      await send(chatId, `❌ Cannot cancel this application.`);
      return;
    }

    await prisma.application.delete({ where: { id: appId } });
    await send(chatId,
      `✅ <b>Application Cancelled</b>\n\nYour application has been cancelled.`,
      { inline_keyboard: [[{ text: '🔙 Back to Menu', callback_data: 'menu' }]] }
    );
  } catch {
    await send(chatId, `❌ Failed to cancel. Please try from the website.`);
  }
}

// ─── Download Receipt ───────────────────────────────────────────

async function cmdDownloadReceipt(chatId: number, appId: string) {
  const receipts = await prisma.document.findMany({
    where: { applicationId: appId, docType: 'FILLED_FORM_RECEIPT' },
    orderBy: { uploadedAt: 'desc' },
    take: 1,
  });

  if (receipts.length === 0) {
    await send(chatId, `⏳ <b>Receipt not ready yet.</b>\n\nOur team is still processing your form. You'll be notified when it's ready.`);
    return;
  }

  await send(chatId,
    `📄 <b>Your Filled Form Receipt</b>\n\n` +
    `Your form has been filled! Download it below:`,
    {
      inline_keyboard: [
        [{ text: '📥 Download Receipt', url: `https://clickandsit.vercel.app/dashboard/applications/${appId}` }],
        [{ text: '🔙 Back', callback_data: `app_${appId}` }],
      ],
    }
  );
}

// ─── Admin Commands ─────────────────────────────────────────────

async function cmdAdminStats(chatId: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const [total, todayApps, pending, inProcess, completed, totalUsers, revenue] = await Promise.all([
    prisma.application.count(),
    prisma.application.count({ where: { createdAt: { gte: today } } }),
    prisma.application.count({ where: { status: 'SUBMITTED' } }),
    prisma.application.count({ where: { status: 'IN_PROCESS' } }),
    prisma.application.count({ where: { status: 'COMPLETED' } }),
    prisma.user.count(),
    prisma.payment.aggregate({ where: { status: 'SUCCESS', createdAt: { gte: monthStart } }, _sum: { amount: true } }),
  ]);

  const monthName = today.toLocaleDateString('en-IN', { month: 'long' });

  await send(chatId,
    `📊 <b>ClickNsit Dashboard</b>\n` +
    `━━━━━━━━━━━━━━━━━━\n\n` +
    `👥 <b>Users:</b> ${totalUsers}\n` +
    `📋 <b>Total Applications:</b> ${total}\n` +
    `🆕 <b>Today:</b> ${todayApps}\n\n` +
    `<b>Status Breakdown:</b>\n` +
    `📥 Pending: ${pending}\n` +
    `🔍 In Process: ${inProcess}\n` +
    `✅ Completed: ${completed}\n\n` +
    `💰 <b>${monthName} Revenue:</b> ₹${((revenue._sum.amount || 0) / 100).toLocaleString('en-IN')}`,
    {
      inline_keyboard: [
        [{ text: '📥 View Pending', callback_data: 'admin_pending' }],
        [{ text: '💰 Revenue Details', callback_data: 'admin_revenue' }],
        [{ text: '🔄 Refresh', callback_data: 'admin_stats' }],
      ],
    }
  );
}

async function cmdAdminPending(chatId: number) {
  const pending = await prisma.application.findMany({
    where: { status: 'SUBMITTED' },
    include: { user: true, exam: true, payment: true },
    orderBy: { createdAt: 'asc' },
    take: 10,
  });

  if (pending.length === 0) {
    await send(chatId, `✅ <b>All caught up!</b> No pending applications.`, {
      inline_keyboard: [[{ text: '🔄 Refresh', callback_data: 'admin_pending' }]],
    });
    return;
  }

  const lines = [`📥 <b>Pending Applications (${pending.length})</b>\n`];

  for (let i = 0; i < pending.length; i++) {
    const app = pending[i];
    const paid = app.payment?.status === 'SUCCESS' ? '💰' : '⏳';
    lines.push(`${i + 1}. <b>${app.user.fullName}</b>`);
    lines.push(`   📝 ${app.exam.title}`);
    lines.push(`   📱 ${app.user.mobile} ${paid}`);
    lines.push(`   🆔 <code>${app.id.slice(-8)}</code>`);
    lines.push('');
  }

  // Build keyboard with individual app buttons
  const keyboard: any[][] = [];
  for (const app of pending) {
    keyboard.push([{
      text: `📋 ${app.user.fullName} — ${app.exam.title.slice(0, 30)}`,
      callback_data: `admin_app_${app.id}`,
    }]);
  }
  keyboard.push([{ text: '🔙 Back to Dashboard', callback_data: 'admin_stats' }]);

  await send(chatId, lines.join('\n'), { inline_keyboard: keyboard });
}

async function cmdAdminAppDetail(chatId: number, appId: string) {
  const app = await prisma.application.findUnique({
    where: { id: appId },
    include: { user: true, exam: true, payment: true, documents: true },
  });

  if (!app) {
    await send(chatId, `❌ Application not found.`);
    return;
  }

  const lines = [
    `📋 <b>Application Detail</b>`,
    `━━━━━━━━━━━━━━━━━━`,
    ``,
    `👤 <b>${app.user.fullName}</b>`,
    `📱 ${app.user.mobile} • ${app.user.email}`,
    ``,
    `📝 <b>${app.exam.title}</b>`,
    `📂 ${app.exam.category}`,
    `📋 Status: <b>${app.status.replace(/_/g, ' ')}</b>`,
    ``,
    `💳 Payment: ${app.payment?.status === 'SUCCESS' ? `✅ ₹${app.payment.amount / 100}` : '⏳ Pending'}`,
    `📄 Documents: ${app.documents.length}`,
    `🆔 <code>${app.id}</code>`,
  ];

  await send(chatId, lines.join('\n'), adminAppKeyboard(app.id, app.status));
}

async function cmdAdminStatusChange(chatId: number, appId: string, newStatus: string) {
  try {
    const app = await prisma.application.findUnique({
      where: { id: appId },
      include: { user: true, exam: true },
    });

    if (!app) {
      await send(chatId, `❌ Application not found.`);
      return;
    }

    const oldStatus = app.status;
    await prisma.application.update({ where: { id: appId }, data: { status: newStatus } });

    await prisma.statusHistory.create({
      data: {
        applicationId: appId,
        oldStatus,
        newStatus,
        changedBy: 'telegram_admin',
        changedByName: 'Admin (Telegram)',
      },
    });

    const statusEmoji: Record<string, string> = {
      IN_PROCESS: '🔍', FORM_FILLED: '📝', COMPLETED: '🎉', REJECTED: '❌',
    };

    await send(chatId,
      `${statusEmoji[newStatus] || '📋'} <b>Application Updated!</b>\n\n` +
      `👤 ${app.user.fullName}\n` +
      `📝 ${app.exam.title}\n` +
      `📋 ${oldStatus.replace(/_/g, ' ')} → <b>${newStatus.replace(/_/g, ' ')}</b>`,
      adminAppKeyboard(appId, newStatus)
    );
  } catch (err: any) {
    await send(chatId, `❌ Error: ${err.message}`);
  }
}

async function cmdAdminRevenue(chatId: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [monthRevenue, weekRevenue, totalCount, successCount] = await Promise.all([
    prisma.payment.aggregate({ where: { status: 'SUCCESS', createdAt: { gte: monthStart } }, _sum: { amount: true }, _count: true }),
    prisma.payment.aggregate({ where: { status: 'SUCCESS', createdAt: { gte: weekAgo } }, _sum: { amount: true }, _count: true }),
    prisma.payment.count(),
    prisma.payment.count({ where: { status: 'SUCCESS' } }),
  ]);

  const monthName = today.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  await send(chatId,
    `💰 <b>Revenue Report</b>\n` +
    `━━━━━━━━━━━━━━━━━━\n\n` +
    `📅 <b>${monthName}:</b>\n` +
    `  Revenue: ₹${((monthRevenue._sum.amount || 0) / 100).toLocaleString('en-IN')}\n` +
    `  Transactions: ${monthRevenue._count}\n\n` +
    `📆 <b>Last 7 Days:</b>\n` +
    `  Revenue: ₹${((weekRevenue._sum.amount || 0) / 100).toLocaleString('en-IN')}\n` +
    `  Transactions: ${weekRevenue._count}\n\n` +
    `📊 <b>Overall:</b>\n` +
    `  Total Payments: ${totalCount}\n` +
    `  Successful: ${successCount}\n` +
    `  Success Rate: ${totalCount > 0 ? Math.round((successCount / totalCount) * 100) : 0}%`,
    {
      inline_keyboard: [
        [{ text: '🔄 Refresh', callback_data: 'admin_revenue' }],
        [{ text: '🔙 Dashboard', callback_data: 'admin_stats' }],
      ],
    }
  );
}

// ─── Handle Photos (document uploads) ───────────────────────────

export async function handleDocument(message: any) {
  const chatId = message.chat.id;
  const telegramId = String(message.from?.id || '');
  const conv = conversations.get(chatId);

  if (!conv || conv.step !== 'admin_upload_receipt') return;

  const doc = message.document;
  if (!doc || doc.mime_type !== 'application/pdf') {
    await send(chatId, `⚠️ Please send a <b>PDF file</b> only.`);
    return;
  }

  if (doc.file_size > 3 * 1024 * 1024) {
    await send(chatId, `⚠️ File too large. Max size is <b>3MB</b>.`);
    return;
  }

  try {
    // Download from Telegram
    const fileInfo = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${doc.file_id}`);
    const fileData = await fileInfo.json();

    if (!fileData.ok) {
      await send(chatId, `❌ Failed to download file.`);
      return;
    }

    const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${fileData.result.file_path}`;
    const response = await fetch(fileUrl);
    const buffer = Buffer.from(await response.arrayBuffer());
    const base64 = buffer.toString('base64');

    // Save to database
    await prisma.document.create({
      data: {
        applicationId: conv.applicationId!,
        docType: 'FILLED_FORM_RECEIPT',
        fileUrl: `data:application/pdf;base64,${base64}`,
        fileData: base64,
      },
    });

    // Notify user
    const app = await prisma.application.findUnique({
      where: { id: conv.applicationId },
      include: { user: true },
    });

    if (app) {
      // Send notification to user via their Telegram if linked
      const userTelegram = await prisma.user.findFirst({
        where: { referralCode: { startsWith: 'TG_' } },
      });
    }

    conversations.delete(chatId);
    await send(chatId,
      `✅ <b>Receipt Uploaded!</b>\n\n` +
      `Application: ${conv.applicationId?.slice(-8)}\n` +
      `The user can now download it from their dashboard.`,
      { inline_keyboard: [[{ text: '🔙 Back to Pending', callback_data: 'admin_pending' }]] }
    );

  } catch (err: any) {
    console.error('[TG] Receipt upload error:', err);
    conversations.delete(chatId);
    await send(chatId, `❌ Upload failed: ${err.message}`);
  }
}

// ─── Helper ─────────────────────────────────────────────────────

function statusEmoji(status: string): string {
  const map: Record<string, string> = {
    DRAFT: '📝', SUBMITTED: '📥', IN_PROCESS: '🔍',
    FORM_FILLED: '✅', COMPLETED: '🎉', REJECTED: '❌',
  };
  return map[status] || '📋';
}
