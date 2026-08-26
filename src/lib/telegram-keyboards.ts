// ─── ClickNsit Telegram Bot — Inline Keyboards ──────────────────
// All keyboard builders for the bot UI

export function mainMenuKeyboard(isAdmin: boolean) {
  const keyboard: any[][] = [
    [{ text: '📋 My Applications', callback_data: 'my_apps' }],
    [{ text: '🔍 Browse Exams', callback_data: 'browse_exams' }],
    [{ text: '💰 Payment History', callback_data: 'payments' }],
    [{ text: '👤 My Profile', callback_data: 'profile' }],
    [{ text: '📩 Request Form', callback_data: 'request_form' }],
    [{ text: '💬 Contact Support', callback_data: 'contact_support' }],
    [{ text: '❓ Help', callback_data: 'help' }],
  ];

  if (isAdmin) {
    keyboard.push([{ text: '━━━ 🔑 Admin Panel ━━━', callback_data: 'noop' }]);
    keyboard.push([{ text: '📊 Dashboard Stats', callback_data: 'admin_stats' }]);
    keyboard.push([{ text: '📥 Pending Applications', callback_data: 'admin_pending' }]);
    keyboard.push([{ text: '💰 Revenue Report', callback_data: 'admin_revenue' }]);
  }

  return { inline_keyboard: keyboard };
}

export function examListKeyboard(exams: any[], page: number = 0, pageSize: number = 5) {
  const start = page * pageSize;
  const slice = exams.slice(start, start + pageSize);
  const keyboard: any[][] = [];

  for (const exam of slice) {
    const fee = (exam.officialFee + exam.serviceFee) / 100;
    keyboard.push([{
      text: `${exam.title} — ₹${fee}`,
      callback_data: `exam_${exam.id}`,
    }]);
  }

  // Pagination
  const navRow: any[] = [];
  if (page > 0) navRow.push({ text: '⬅️ Prev', callback_data: `exams_page_${page - 1}` });
  if (start + pageSize < exams.length) navRow.push({ text: 'Next ➡️', callback_data: `exams_page_${page + 1}` });
  if (navRow.length) keyboard.push(navRow);

  keyboard.push([{ text: '🔙 Back to Menu', callback_data: 'menu' }]);

  return { inline_keyboard: keyboard };
}

export function examDetailKeyboard(examId: string) {
  return {
    inline_keyboard: [
      [{ text: '✅ Apply Now', callback_data: `apply_${examId}` }],
      [{ text: '🔙 Back to Exams', callback_data: 'browse_exams' }],
    ],
  };
}

export function applicationListKeyboard(apps: any[]) {
  const keyboard: any[][] = [];

  for (const app of apps) {
    const emoji = statusEmoji(app.status);
    keyboard.push([{
      text: `${emoji} ${app.exam.title} — ${app.status.replace(/_/g, ' ')}`,
      callback_data: `app_${app.id}`,
    }]);
  }

  keyboard.push([{ text: '🔙 Back to Menu', callback_data: 'menu' }]);

  return { inline_keyboard: keyboard };
}

export function applicationDetailKeyboard(appId: string, status: string) {
  const rows: any[][] = [
    [{ text: '📄 View Full Details', callback_data: `app_detail_${appId}` }],
  ];

  if (status === 'SUBMITTED') {
    rows.push([{ text: '💳 Pay Now', callback_data: `pay_${appId}` }]);
    rows.push([{ text: '❌ Cancel Application', callback_data: `cancel_${appId}` }]);
  }

  if (status === 'FORM_FILLED') {
    rows.push([{ text: '📥 Download Receipt', callback_data: `receipt_${appId}` }]);
  }

  rows.push([{ text: '🔙 Back', callback_data: 'my_apps' }]);

  return { inline_keyboard: rows };
}

export function paymentKeyboard(appId: string) {
  return {
    inline_keyboard: [
      [{ text: '💳 Pay with Razorpay', callback_data: `pay_link_${appId}` }],
      [{ text: '🔙 Back', callback_data: `app_${appId}` }],
    ],
  };
}

export function confirmKeyboard(action: string, id: string) {
  return {
    inline_keyboard: [
      [
        { text: '✅ Confirm', callback_data: `${action}_confirm_${id}` },
        { text: '❌ Cancel', callback_data: 'menu' },
      ],
    ],
  };
}

export function adminAppKeyboard(appId: string, currentStatus: string) {
  const rows: any[][] = [];

  if (currentStatus === 'SUBMITTED') {
    rows.push([{ text: '🔍 Mark In Review', callback_data: `admin_process_${appId}` }]);
  }
  if (currentStatus === 'IN_PROCESS') {
    rows.push([{ text: '📝 Mark Form Filled', callback_data: `admin_formfilled_${appId}` }]);
  }
  if (['IN_PROCESS', 'FORM_FILLED'].includes(currentStatus)) {
    rows.push([{ text: '✅ Mark Completed', callback_data: `admin_done_${appId}` }]);
  }
  rows.push([{ text: '❌ Reject', callback_data: `admin_reject_${appId}` }]);
  rows.push([{ text: '📤 Upload Receipt', callback_data: `admin_receipt_${appId}` }]);
  rows.push([{ text: '🔙 Back', callback_data: 'admin_pending' }]);

  return { inline_keyboard: rows };
}

export function cancelConfirmKeyboard(appId: string) {
  return {
    inline_keyboard: [
      [
        { text: '✅ Yes, Cancel', callback_data: `cancel_confirm_${appId}` },
        { text: '❌ No, Go Back', callback_data: `app_${appId}` },
      ],
    ],
  };
}

function statusEmoji(status: string): string {
  const map: Record<string, string> = {
    DRAFT: '📝', SUBMITTED: '📥', IN_PROCESS: '🔍',
    FORM_FILLED: '✅', COMPLETED: '🎉', REJECTED: '❌',
  };
  return map[status] || '📋';
}
