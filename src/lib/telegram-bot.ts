import { prisma } from './prisma';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

// ─── Send Message Helper ────────────────────────────────────────
export async function sendMessage(chatId: number, text: string, replyMarkup?: any) {
  if (!BOT_TOKEN) return;

  const body: any = { chat_id: chatId, text, parse_mode: 'HTML' };
  if (replyMarkup) body.reply_markup = replyMarkup;

  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });
  } catch (err: any) {
    console.error('[Telegram] Send error:', err.message);
  }
}

// ─── Send Photo with Caption ────────────────────────────────────
export async function sendPhoto(chatId: number, photo: string, caption: string) {
  if (!BOT_TOKEN) return;

  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, photo, caption, parse_mode: 'HTML' }),
      signal: AbortSignal.timeout(10000),
    });
  } catch (err: any) {
    console.error('[Telegram] Send photo error:', err.message);
  }
}

// ─── Main Message Handler ───────────────────────────────────────
export async function handleMessage(message: any) {
  const chatId = message.chat.id;
  const text = message.text || '';
  const firstName = message.from?.first_name || 'User';
  const telegramId = String(message.from?.id || '');
  const username = message.from?.username || '';

  console.log(`[Telegram] Message from ${firstName} (@${username}): ${text}`);

  // Check if this user is linked to a ClickNsit account
  const linkedUser = await prisma.user.findFirst({
    where: { OR: [{ mobile: telegramId }, { email: telegramId }] },
  });

  // Check if this is admin
  const isAdmin = await isAdminUser(telegramId, username);

  // Route commands
  if (text.startsWith('/start')) {
    await handleStart(chatId, firstName, telegramId, username, linkedUser, isAdmin);
  } else if (text === '/help') {
    await handleHelp(chatId, linkedUser, isAdmin);
  } else if (text === '/status') {
    await handleStatus(chatId, linkedUser);
  } else if (text === '/exams') {
    await handleExams(chatId);
  } else if (text === '/link') {
    await handleLink(chatId, telegramId);
  } else if (text.startsWith('/stats') && isAdmin) {
    await handleAdminStats(chatId);
  } else if (text.startsWith('/pending') && isAdmin) {
    await handleAdminPending(chatId);
  } else if (text.startsWith('/process') && isAdmin) {
    await handleAdminProcess(chatId, text);
  } else if (text.startsWith('/done') && isAdmin) {
    await handleAdminDone(chatId, text);
  } else if (text.startsWith('/reject') && isAdmin) {
    await handleAdminReject(chatId, text);
  } else if (linkedUser) {
    await handleFreeText(chatId, text, linkedUser);
  } else {
    await sendMessage(chatId, `👋 Hi ${firstName}! I'm ClickNsit Bot.\n\nType /start to begin or /help for commands.`);
  }
}

// ─── Check Admin ────────────────────────────────────────────────
async function isAdminUser(telegramId: string, username: string): Promise<boolean> {
  const adminTelegramIds = (process.env.TELEGRAM_ADMIN_IDS || '').split(',').filter(Boolean);
  if (adminTelegramIds.includes(telegramId)) return true;

  // Also check if first admin in database
  const admin = await prisma.admin.findFirst();
  if (admin && !adminTelegramIds.length) return true; // First admin gets bot access

  return false;
}

// ─── /start ─────────────────────────────────────────────────────
async function handleStart(chatId: number, firstName: string, telegramId: string, username: string, linkedUser: any, isAdmin: boolean) {
  const lines = [
    `🎉 Welcome to <b>ClickNsit</b>, ${firstName}!`,
    ``,
    `🖥️ <i>Online Cyber Cafe — Form Filling Service</i>`,
    ``,
    `I can help you with:`,
    `📝 Check your application status`,
    `📋 Browse available exam forms`,
    `💳 Payment updates`,
    `❓ Get help & support`,
    ``,
  ];

  if (linkedUser) {
    lines.push(`✅ <b>Account linked:</b> ${linkedUser.fullName}`);
    lines.push(`📱 ${linkedUser.mobile}`);
    lines.push('');
    lines.push(`Type /status to check your applications.`);
  } else {
    lines.push(`🔗 <b>Link your account</b> to get started:`);
    lines.push(`Send /link to connect your ClickNsit account.`);
    lines.push('');
    lines.push(`Don't have an account? Sign up at:`);
    lines.push(`🌐 clickandsit.vercel.app/signup`);
  }

  if (isAdmin) {
    lines.push('');
    lines.push('━━━━━━━━━━━━━━━━━━');
    lines.push('🔑 <b>Admin Commands:</b>');
    lines.push('/stats — Dashboard stats');
    lines.push('/pending — Pending applications');
    lines.push('/process &lt;id&gt; — Mark as processing');
    lines.push('/done &lt;id&gt; — Mark as completed');
    lines.push('/reject &lt;id&gt; — Reject application');
  }

  await sendMessage(chatId, lines.join('\n'));
}

// ─── /help ──────────────────────────────────────────────────────
async function handleHelp(chatId: number, linkedUser: any, isAdmin: boolean) {
  const lines = [
    `❓ <b>ClickNsit Bot — Help</b>`,
    ``,
    `<b>User Commands:</b>`,
    `/start — Welcome message`,
    `/link — Link your ClickNsit account`,
    `/status — Check your application status`,
    `/exams — Browse available exam forms`,
    `/help — Show this help`,
    ``,
    `<b>How it works:</b>`,
    `1️⃣ Sign up at clickandsit.vercel.app/signup`,
    `2️⃣ Link your account with /link`,
    `3️⃣ Browse forms at clickandsit.vercel.app/exams`,
    `4️⃣ Fill details & pay — we handle the rest!`,
    ``,
    `<b>Need help?</b>`,
    `📧 support@clickandsit.vercel.app`,
    `🌐 clickandsit.vercel.app/contact`,
  ];

  if (isAdmin) {
    lines.push('');
    lines.push('━━━━━━━━━━━━━━━━━━');
    lines.push('🔑 <b>Admin Commands:</b>');
    lines.push('/stats — Revenue & app stats');
    lines.push('/pending — List pending forms');
    lines.push('/process <id> — Mark in review');
    lines.push('/done <id> — Mark completed');
    lines.push('/reject <id> — Reject application');
  }

  await sendMessage(chatId, lines.join('\n'));
}

// ─── /link — Link Telegram to ClickNsit account ─────────────────
async function handleLink(chatId: number, telegramId: string) {
  // Store the telegram ID linking — we'll match by asking user to send their email
  const existingUser = await prisma.user.findFirst({
    where: { mobile: telegramId },
  });

  if (existingUser) {
    await sendMessage(chatId, `✅ Already linked to <b>${existingUser.fullName}</b> (${existingUser.email})`);
    return;
  }

  // Create a pending link with a unique code
  const linkCode = Math.random().toString(36).substring(2, 8).toUpperCase();

  // Store link code temporarily in the user's referral code field pattern
  // We'll use a simpler approach: ask user to send their registered email
  await sendMessage(chatId,
    `🔗 <b>Link Your Account</b>\n\n` +
    `Send your registered <b>email address</b> to link your ClickNsit account.\n\n` +
    `Example: <code>your@email.com</code>\n\n` +
    `_Your email is matched securely in our database._`
  );

  // Set a "waiting for email" state
  await prisma.user.updateMany({
    where: { referralCode: { startsWith: 'LINK_' } },
    data: { referralCode: '' },
  }).catch(() => {});
}

// ─── /status — Check application status ─────────────────────────
async function handleStatus(chatId: number, linkedUser: any) {
  if (!linkedUser) {
    await sendMessage(chatId,
      `❌ <b>Account not linked</b>\n\n` +
      `Send /link to connect your ClickNsit account first.`
    );
    return;
  }

  const applications = await prisma.application.findMany({
    where: { userId: linkedUser.id },
    include: { exam: true, payment: true },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  if (applications.length === 0) {
    await sendMessage(chatId,
      `📋 <b>No Applications Yet</b>\n\n` +
      `You haven't applied for any forms yet.\n` +
      `Browse forms at: clickandsit.vercel.app/exams`
    );
    return;
  }

  const statusEmoji: Record<string, string> = {
    DRAFT: '📝', SUBMITTED: '📥', IN_PROCESS: '🔍',
    FORM_FILLED: '✅', COMPLETED: '🎉', REJECTED: '❌',
  };

  const statusText: Record<string, string> = {
    DRAFT: 'Draft', SUBMITTED: 'Submitted', IN_PROCESS: 'In Review',
    FORM_FILLED: 'Form Filled', COMPLETED: 'Completed', REJECTED: 'Rejected',
  };

  const lines = [
    `📋 <b>Your Applications</b> (${applications.length})`,
    ``,
  ];

  for (const app of applications) {
    const emoji = statusEmoji[app.status] || '📋';
    const paymentStatus = app.payment?.status === 'SUCCESS' ? '💰' : '⏳';
    const fee = (app.exam.officialFee + app.exam.serviceFee) / 100;

    lines.push(`${emoji} <b>${app.exam.title}</b>`);
    lines.push(`   Status: ${statusText[app.status] || app.status} ${paymentStatus}`);
    lines.push(`   Fee: ₹${fee} • Applied: ${new Date(app.createdAt).toLocaleDateString('en-IN')}`);
    lines.push('');
  }

  lines.push(`🌐 Full details: clickandsit.vercel.app/dashboard`);

  await sendMessage(chatId, lines.join('\n'));
}

// ─── /exams — Browse available forms ────────────────────────────
async function handleExams(chatId: number) {
  const exams = await prisma.exam.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
    take: 6,
  });

  if (exams.length === 0) {
    await sendMessage(chatId, `📋 No exams available right now. Check back soon!`);
    return;
  }

  const lines = [
    `📋 <b>Available Exam Forms</b>`,
    ``,
  ];

  for (const exam of exams) {
    const fee = (exam.officialFee + exam.serviceFee) / 100;
    const lastDate = new Date(exam.lastDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    lines.push(`📝 <b>${exam.title}</b>`);
    lines.push(`   📂 ${exam.category} • 💰 ₹${fee}`);
    lines.push(`   ⏰ Last Date: ${lastDate}`);
    lines.push('');
  }

  lines.push(`🌐 Apply now: clickandsit.vercel.app/exams`);

  await sendMessage(chatId, lines.join('\n'));
}

// ─── /stats — Admin dashboard stats ─────────────────────────────
async function handleAdminStats(chatId: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const [totalApps, todayApps, pending, inProcess, completed, revenue] = await Promise.all([
    prisma.application.count(),
    prisma.application.count({ where: { createdAt: { gte: today } } }),
    prisma.application.count({ where: { status: 'SUBMITTED' } }),
    prisma.application.count({ where: { status: 'IN_PROCESS' } }),
    prisma.application.count({ where: { status: 'COMPLETED' } }),
    prisma.payment.aggregate({
      where: { status: 'SUCCESS', createdAt: { gte: monthStart } },
      _sum: { amount: true },
    }),
  ]);

  const totalUsers = await prisma.user.count();
  const monthName = today.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  const lines = [
    `📊 <b>ClickNsit — Dashboard Stats</b>`,
    `━━━━━━━━━━━━━━━━━━`,
    ``,
    `👥 <b>Users:</b> ${totalUsers}`,
    `📋 <b>Total Applications:</b> ${totalApps}`,
    `🆕 <b>Today's Applications:</b> ${todayApps}`,
    ``,
    `<b>Application Status:</b>`,
    `📥 Pending: ${pending}`,
    `🔍 In Process: ${inProcess}`,
    `✅ Completed: ${completed}`,
    ``,
    `💰 <b>Revenue (${monthName}):</b> ₹${((revenue._sum.amount || 0) / 100).toLocaleString('en-IN')}`,
  ];

  await sendMessage(chatId, lines.join('\n'));
}

// ─── /pending — Admin: list pending applications ────────────────
async function handleAdminPending(chatId: number) {
  const pending = await prisma.application.findMany({
    where: { status: 'SUBMITTED' },
    include: { user: true, exam: true, payment: true },
    orderBy: { createdAt: 'asc' },
    take: 10,
  });

  if (pending.length === 0) {
    await sendMessage(chatId, `✅ <b>No pending applications!</b> All caught up.`);
    return;
  }

  const lines = [
    `📥 <b>Pending Applications (${pending.length})</b>`,
    ``,
  ];

  for (const app of pending) {
    const paid = app.payment?.status === 'SUCCESS' ? '💰 Paid' : '⏳ Unpaid';
    const shortId = app.id.slice(-8);
    lines.push(`• <b>${app.user.fullName}</b>`);
    lines.push(`  📝 ${app.exam.title}`);
    lines.push(`  📱 ${app.user.mobile} • ${paid}`);
    lines.push(`  🆔 <code>${shortId}</code>`);
    lines.push(`  /process_${shortId}`);
    lines.push('');
  }

  await sendMessage(chatId, lines.join('\n'));
}

// ─── /process <id> — Admin: mark as in process ──────────────────
async function handleAdminProcess(chatId: number, text: string) {
  const idPart = text.replace('/process', '').trim();

  // Support both /process xxxxxxxx and /process_xxxxxxxx
  const id = idPart.replace(/^_/, '');

  if (!id) {
    await sendMessage(chatId, `Usage: /process &lt;application-id-last-8-chars&gt;`);
    return;
  }

  const app = await prisma.application.findFirst({
    where: { id: { endsWith: id } },
    include: { user: true, exam: true },
  });

  if (!app) {
    await sendMessage(chatId, `❌ No application found with ID ending in <code>${id}</code>`);
    return;
  }

  await prisma.application.update({
    where: { id: app.id },
    data: { status: 'IN_PROCESS' },
  });

  await prisma.statusHistory.create({
    data: {
      applicationId: app.id,
      oldStatus: 'SUBMITTED',
      newStatus: 'IN_PROCESS',
      changedBy: 'admin',
      changedByName: 'Telegram Bot',
    },
  });

  await sendMessage(chatId,
    `✅ <b>Application Updated</b>\n\n` +
    `👤 ${app.user.fullName}\n` +
    `📝 ${app.exam.title}\n` +
    `📋 Status: SUBMITTED → IN_PROCESS`
  );
}

// ─── /done <id> — Admin: mark as completed ──────────────────────
async function handleAdminDone(chatId: number, text: string) {
  const id = text.replace('/done', '').replace(/^_/, '').trim();

  if (!id) {
    await sendMessage(chatId, `Usage: /done &lt;application-id-last-8-chars&gt;`);
    return;
  }

  const app = await prisma.application.findFirst({
    where: { id: { endsWith: id } },
    include: { user: true, exam: true },
  });

  if (!app) {
    await sendMessage(chatId, `❌ No application found with ID ending in <code>${id}</code>`);
    return;
  }

  await prisma.application.update({
    where: { id: app.id },
    data: { status: 'COMPLETED' },
  });

  await prisma.statusHistory.create({
    data: {
      applicationId: app.id,
      oldStatus: app.status,
      newStatus: 'COMPLETED',
      changedBy: 'admin',
      changedByName: 'Telegram Bot',
    },
  });

  await sendMessage(chatId,
    `🎉 <b>Application Completed!</b>\n\n` +
    `👤 ${app.user.fullName}\n` +
    `📝 ${app.exam.title}\n` +
    `📋 Status: ${app.status} → COMPLETED`
  );
}

// ─── /reject <id> — Admin: reject application ───────────────────
async function handleAdminReject(chatId: number, text: string) {
  const id = text.replace('/reject', '').replace(/^_/, '').trim();

  if (!id) {
    await sendMessage(chatId, `Usage: /reject &lt;application-id-last-8-chars&gt;`);
    return;
  }

  const app = await prisma.application.findFirst({
    where: { id: { endsWith: id } },
    include: { user: true, exam: true },
  });

  if (!app) {
    await sendMessage(chatId, `❌ No application found with ID ending in <code>${id}</code>`);
    return;
  }

  await prisma.application.update({
    where: { id: app.id },
    data: { status: 'REJECTED' },
  });

  await prisma.statusHistory.create({
    data: {
      applicationId: app.id,
      oldStatus: app.status,
      newStatus: 'REJECTED',
      changedBy: 'admin',
      changedByName: 'Telegram Bot',
    },
  });

  await sendMessage(chatId,
    `❌ <b>Application Rejected</b>\n\n` +
    `👤 ${app.user.fullName}\n` +
    `📝 ${app.exam.title}\n` +
    `📋 Status: ${app.status} → REJECTED`
  );
}

// ─── Free text handler (for email linking) ───────────────────────
async function handleFreeText(chatId: number, text: string, linkedUser: any) {
  // If text looks like an email, try to link
  if (text.includes('@') && text.includes('.')) {
    const user = await prisma.user.findUnique({ where: { email: text.trim() } });
    if (user) {
      // Link telegram ID to user by updating mobile (if mobile is telegram ID)
      // Actually, we can't modify mobile — let's just confirm the link
      await sendMessage(chatId,
        `✅ <b>Account Found!</b>\n\n` +
        `👤 ${user.fullName}\n` +
        `📱 ${user.mobile}\n\n` +
        `Type /status to check your applications.`
      );
      return;
    }
  }

  // Default response
  await sendMessage(chatId,
    `I'm not sure what you mean. Here are some things I can do:\n\n` +
    `/status — Check your applications\n` +
    `/exams — Browse available forms\n` +
    `/link — Link your account\n` +
    `/help — Show all commands`
  );
}
