'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const PREDEFINED_QUESTIONS = [
  { id: 'what', label: 'What is CyberSeva?', icon: '❓' },
  { id: 'how', label: 'How does it work?', icon: '📋' },
  { id: 'fee', label: 'What are the fees?', icon: '💰' },
  { id: 'track', label: 'Track application', icon: '📍' },
  { id: 'refund', label: 'Refund policy', icon: '💸' },
  { id: 'contact', label: 'Contact support', icon: '📞' },
  { id: 'docs', label: 'Required documents', icon: '📄' },
  { id: 'time', label: 'Processing time', icon: '⏱️' },
];

interface TopicMatch {
  keywords: string[];
  response: string;
}

const TOPICS: TopicMatch[] = [
  {
    keywords: ['cyberseva', 'cyber seva', 'what is', 'kya hai', 'about', 'tell me', 'explain', 'samjhao', 'batao', 'service', 'platform', 'site', 'website', 'app'],
    response: 'CyberSeva ek online cyber cafe hai! 🎯\n\nHum government exams, college admissions, scholarships aur other official forms bharte hain — jaise cyber cafe mein hota hai, par ab ghar baithe! Aapko sirf apni details deni hain, documents upload karni hain, baaki hum sambhal lenge!\n\n✅ 5000+ forms already filled\n✅ 98% success rate\n✅ 24/7 support'
  },
  {
    keywords: ['how', 'process', 'work', 'kaise', 'kaise kare', 'step', 'tarika', 'procedure', 'karna', 'kaise hota', 'kaise chalta'],
    response: 'Bahut aasan hai! 🚀\n\n1️⃣ Form select karo (Browse Forms pe jao)\n2️⃣ Apni details bharo (Name, Mobile, Education etc.)\n3️⃣ Documents upload karo (Photo, Signature, Marksheets)\n4️⃣ Payment karo (UPI/Card se)\n5️⃣ Hum form official portal pe submit kar denge!\n\nAap dashboard pe real-time status dekh sakte ho! 📱'
  },
  {
    keywords: ['fee', 'price', 'cost', 'charge', 'rate', 'paisa', 'kitna', 'how much', 'paise', 'kharcha', 'bill', 'payment amount', 'dena', 'lagega'],
    response: 'Humari fees bahut affordable hai! 💰\n\n📋 Form Filling Fee: ₹50 - ₹200 (form ke hisaab se)\n🏛️ Official Fee: Government portal ka as-is\n💡 Total fee form select karne pe dikhai degi\n\n🔒 Koi hidden charges nahi!\n💳 UPI, Card, Net Banking - sab accepted hai'
  },
  {
    keywords: ['track', 'status', 'progress', 'where', 'update', 'pata', 'kahan', 'location', 'kitna hua', 'kya hua', 'check', 'dekhna', 'dekho', 'position'],
    response: 'Track karna bahut easy hai! 📍\n\n1️⃣ Dashboard pe jao\n2️⃣ "My Applications" pe click karo\n3️⃣ Har step ka update dikhega!\n\nStatus options:\n🔵 Submitted - Form receive ho gaya\n🟡 In Review - Team check kar rahi hai\n🟣 Form Filled - Portal pe submit ho gaya\n🟢 Completed - Sab ho gaya!\n\nHar update pe notification bhi milega! 🔔'
  },
  {
    keywords: ['refund', 'money back', 'return', 'paisa wapas', 'cancel', 'wapas', 'raam', 'refund kaise', 'paise', 'cancelation', 'cancellation'],
    response: 'Refund Policy 💸\n\n✅ Full refund agar form submit nahi hua\n✅ Partial refund agar processing mein cancel karo\n❌ No refund agar form portal pe submit ho chuka hai\n\nRefund request ke liye:\n📧 support@cyberseva.in pe mail karo\nYa dashboard se cancel karo\n\nRefund 5-7 working days mein aa jayega! 🏦'
  },
  {
    keywords: ['contact', 'call', 'email', 'support', 'help', 'phone', 'baat', 'mail', 'number', 'reach', 'milna'],
    response: 'Humse baat karo! 📞\n\n📧 Email: support@cyberseva.in\n📱 Phone: +91 9650X XXX95\n💬 WhatsApp: Same number pe\n🌐 Website: cyberseva.in/contact\n\n⏰ Support Hours: 9 AM - 9 PM (Mon-Sat)\n⚡ Response Time: 2-4 hours'
  },
  {
    keywords: ['document', 'docs', 'paper', 'kagaz', 'upload', 'kya chahiye', 'lagta', 'attach', 'file', 'photo', 'signature', 'marksheet', 'aadhar'],
    response: 'Common Documents 📄\n\n✅ Aadhaar Card (Front & Back)\n✅ Passport Size Photo (Recent)\n✅ Signature (White background)\n✅ 10th Marksheet\n✅ 12th Marksheet\n✅ Category Certificate (if applicable)\n\n📌 Exact documents form select karne pe dikhai denge!\n💡 Sab documents clear aur readable hone chahiye!'
  },
  {
    keywords: ['time', 'long', 'how long', 'duration', 'kitna time', 'din', 'days', 'week', 'jaldi', 'fast', 'quick', 'takes', 'lamba', 'lambe', 'process time'],
    response: 'Timeline ⏱️\n\n📱 Form fill karna: 10-15 minutes\n🤖 Hamari processing: 24-48 hours\n🏛️ Portal submission: 3-7 working days\n📧 Confirmation: Turant mail/SMS\n\n⚡ Express processing available hai kuch forms ke liye!\n\nTotal: Usually 1-2 weeks mein sab ho jata hai!'
  },
  {
    keywords: ['payment', 'pay', 'upi', 'card', 'razorpay', 'method', 'mode', 'kaise pay', 'transaction', 'net banking', 'gpay', 'phonepe', 'paytm'],
    response: 'Payment Methods 💳\n\n✅ UPI (Google Pay, PhonePe, Paytm)\n✅ Debit Card\n✅ Credit Card\n✅ Net Banking\n\n🔒 100% Secure (Razorpay powered)\n💡 Payment confirmation turant milta hai!'
  },
  {
    keywords: ['ssc', 'upsc', 'railway', 'bank', 'neet', 'jee', 'exam', 'government', 'form', 'kaunsa', 'available', 'konsa', 'list', 'exams', 'forms', 'catalog'],
    response: 'Available Exams & Forms 🎯\n\n🏛️ Government: SSC CGL, CHSL, UPSC, Railway\n🏦 Banking: IBPS PO, Clerk, SBI\n🎓 College: NEET, JEE Main, CUET\n📚 Scholarships: NSP, State Scholarships\n\n📌 50+ forms available!\n💡 Browse karne pe saari forms dikh jayengi!'
  },
  {
    keywords: ['login', 'signup', 'sign up', 'register', 'account', 'password', 'forgot', 'login nahi', 'account ban', 'profile'],
    response: 'Account Related 🔐\n\n📝 Signup: cyberseva.in/signup pe jaao\n🔐 Login: cyberseva.in/login pe jaao\n🔑 Password bhool gaye? "Forgot Password" pe click karo\n\n💡 Signup free hai! Sirf mobile number aur email chahiye!'
  },
  {
    keywords: ['safe', 'security', 'secure', 'privacy', 'data', 'bharosa', 'trust', 'reliable', 'trusted'],
    response: 'Bilkul safe hai! 🔒\n\n🛡️ 256-bit SSL encryption\n🔐 Data encrypted hai\n❌ Kabhi data share nahi hota\n✅ 5000+ trusted users\n⭐ 4.8/5 rating\n\nAapka data hamare liye sabse important hai!'
  },
  {
    keywords: ['thanks', 'thank', 'dhanyavad', 'shukriya', 'thank you', 'thx', 'ok', 'theek'],
    response: 'Aapka swagat hai! 😊\n\nKoi aur sawaal ho toh zaroor puchho. Hum hamesha ready hain help karne ke liye!\n\nAll the best with your form! 🎯🚀'
  },
  {
    keywords: ['hi', 'hello', 'hey', 'namaste', 'namaskar', 'hii', 'helo', 'good morning', 'good evening', 'sup'],
    response: 'Hello! 👋 Welcome to CyberSeva Support!\n\nMain aapki help karne ke liye hoon. Aap mujhse kuch bhi pooch sakte ho:\n\n❓ CyberSeva kya hai?\n💰 Fees kitni hain?\n📋 Kaise kaam karta hai?\n📞 Contact kaise karein?\n\nYa phir neeche quick options pe click karo! 👇'
  },
  {
    keywords: ['problem', 'issue', 'complaint', 'dikkat', 'pareshani', 'galat', 'wrong', 'not working', 'error', 'bug', 'fail'],
    response: 'Sorry for the inconvenience! 😟\n\nAapki problem ka solution karte hain:\n\n1️⃣ Screenshot lo (agar possible)\n2️⃣ Email karo: support@cyberseva.in\n3️⃣ Ya call karo: +91 9650X XXX95\n\n💡 Detail mein batayo toh hum jaldi solve kar payenge!'
  },
  {
    keywords: ['aadhar', 'aadhaar'],
    response: 'Aadhaar se related kya jaanna hai? 🪪\n\nForm fill karte waqt Aadhaar ki zaroorat padti hai as ID proof.\n\n✅ Aadhaar Card upload karna hota hai\n✅ Front & Back dono side clear honi chahiye\n✅ Name match hona chahiye form mein\n\nKya aapko Aadhaar update ya correction ke baare mein jaanna hai?'
  },
  {
    keywords: ['pan', 'pan card'],
    response: 'PAN Card related info 🪪\n\nAgar aap PAN card ke liye apply kar rahe ho toh:\n\n✅ CyberSeva pe available hai\n✅ Fee: ₹107 (Government) + ₹50 (Service)\n✅ Documents: Aadhaar, Photo, Signature\n✅ Time: 2-3 working days\n\nApply karne ke liye Forms section mein jao! 📋'
  },
  {
    keywords: ['voter', 'voter id', 'matdata', 'matdan'],
    response: 'Voter ID info 🗳️\n\n✅ New Voter ID apply available\n✅ Correction available\n✅ Documents: Aadhaar, Photo, Address Proof\n✅ Time: 7-15 days\n\nForms section mein Voter ID form dikh jayega! 📋'
  },
  {
    keywords: ['passport', 'visa', 'travel'],
    response: 'Passport & Travel 🛂\n\n✅ Passport application assistance\n✅ Documents: Aadhaar, PAN, Photo, Address Proof\n✅ Processing: 30-60 days\n\nNote: Passport appointment ke liye aapko khud jaana padega PSK. Hum form filling mein help karenge! ✈️'
  },
  {
    keywords: ['driving', 'license', 'dl', 'licence', 'driving licence'],
    response: 'Driving License 🚗\n\n✅ Learning License available\n✅ Permanent License available\n✅ Renewal available\n✅ Documents: Aadhaar, Photo, Address Proof, Medical Certificate\n\nForms section mein DL form dikh jayega! 📋'
  },
  {
    keywords: ['certificate', 'income', 'caste', 'domicile', 'character', 'sanad'],
    response: 'Government Certificates 📜\n\nAvailable:\n📋 Income Certificate\n📋 Caste Certificate\n📋 Domicile Certificate\n📋 Character Certificate\n\n✅ Documents: Aadhaar, Photo, Address Proof\n✅ Processing: 7-30 days (government ke hisaab se)\n\nForms section mein dekho! 📋'
  },
  {
    keywords: ['scholarship', 'schlorship', 'fee waiver', 'scholar'],
    response: 'Scholarships 🎓\n\n✅ National Scholarship Portal (NSP)\n✅ State Scholarships\n✅ College Scholarships\n\n💡 Eligibility check karo pehle!\n📄 Documents: Income Certificate, Caste Certificate, Marksheets, Bank Passbook\n\nForms section mein scholarships dikh jayengi! 🎯'
  },
];

function detectLanguage(text: string): 'hindi' | 'english' | 'hinglish' {
  const hindiPattern = /[\u0900-\u097F]/;
  const commonHindiWords = ['kya', 'hai', 'kaise', 'kab', 'kahan', 'kaun', 'kyu', 'batao', 'samjhao', 'nahi', 'haan', 'ji', 'mein', 'hum', 'aap', 'tum', 'ye', 'woh', 'aur', 'ya', 'pe', 'ko', 'ka', 'ki', 'ke', 'se', 'ne', 'chahiye', 'hoga', 'karega', 'lagta', 'hota'];
  if (hindiPattern.test(text)) return 'hindi';
  const words = text.toLowerCase().split(/\s+/);
  const hindiWordCount = words.filter(w => commonHindiWords.includes(w)).length;
  if (hindiWordCount > words.length * 0.3) return 'hinglish';
  return 'english';
}

function getAIResponse(input: string): string {
  const lower = input.toLowerCase().trim();
  const lang = detectLanguage(input);
  let bestMatch: TopicMatch | null = null;
  let bestScore = 0;
  for (const topic of TOPICS) {
    let score = 0;
    for (const keyword of topic.keywords) {
      if (lower.includes(keyword)) {
        score += keyword.length;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = topic;
    }
  }
  if (bestMatch && bestScore > 0) {
    return bestMatch.response;
  }
  if (lang === 'hindi' || lang === 'hinglish') {
    return 'Aapka sawal samajh nahi aaya. 🤔\n\nAap ye pooch sakte ho:\n❓ CyberSeva kya hai?\n💰 Fees kitni hain?\n📋 Kaise kaam karta hai?\n📍 Status kaise check karein?\n📞 Support se kaise baat karein?\n📄 Documents kaunse chahiye?\n⏱️ Kitna time lagta hai?\n\nYa neeche quick options use karo! 👇';
  }
  return 'I didn\'t quite understand that. 🤔\n\nYou can ask me about:\n❓ What is CyberSeva?\n💰 Fees & pricing\n📋 How it works\n📍 Application tracking\n📞 Contact support\n📄 Required documents\n⏱️ Processing time\n💳 Payment methods\n\nTry one of these or use the quick options below! 👇';
}

// Helper: Predefined question to query text
function predefinedToQuery(questionId: string): string {
  const queryMap: Record<string, string> = {
    what: 'What is CyberSeva?',
    how: 'How does CyberSeva work?',
    fee: 'What are the fees?',
    track: 'How to track my application?',
    refund: 'What is the refund policy?',
    contact: 'How to contact support?',
    docs: 'What documents are required?',
    time: 'How long does it take?',
  };
  return queryMap[questionId] || questionId;
}

export function ChatSupport() {
  // ALL hooks must be at the top - no conditional returns before hooks!
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isHidden, setIsHidden] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check mount + path
  useEffect(() => {
    setMounted(true);
    const path = window.location.pathname;
    const hiddenPrefixes = ['/admin', '/dashboard', '/api'];
    setIsHidden(hiddenPrefixes.some(p => path.startsWith(p)));
  }, []);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  // NOW we can do conditional returns AFTER all hooks
  if (!mounted || isHidden) return null;

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isBot: false,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setTimeout(() => {
      const response = getAIResponse(text);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isBot: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 600 + Math.random() * 800);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[60] w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 bg-primary-600 hover:bg-primary-700"
        aria-label={isOpen ? 'Close chat' : 'Open chat support'}
      >
        <MessageCircle className="h-6 w-6 text-white" />
        {!isOpen && <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-primary-600"></span>}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[370px] max-w-[calc(100vw-3rem)] bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden flex flex-col" style={{ maxHeight: 'min(600px, calc(100vh - 160px))' }}>
          {/* Header */}
          <div className="bg-primary-600 text-white px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">CyberSeva Support</h3>
              <p className="text-xs text-primary-100">Ask me anything!</p>
            </div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors ml-1"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-neutral-50 dark:bg-neutral-900">
            {messages.length === 0 && (
              <div className="flex justify-start">
                <div className="max-w-[85%]">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center">
                      <Bot className="h-3 w-3 text-primary-600" />
                    </div>
                    <span className="text-[10px] text-neutral-400">Bot</span>
                  </div>
                  <div className="px-3 py-2 rounded-2xl rounded-tl-sm text-sm leading-relaxed whitespace-pre-line bg-white dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 border border-neutral-100 dark:border-neutral-600">
                    {'Hello! 👋 Welcome to CyberSeva Support!\n\nI\'m here to help you with any questions about our online cyber cafe service.\n\nYou can ask me anything — in English, Hindi, or Hinglish! 🌐'}
                  </div>
                </div>
              </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className="max-w-[85%]">
                  {msg.isBot && (
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center">
                        <Bot className="h-3 w-3 text-primary-600" />
                      </div>
                      <span className="text-[10px] text-neutral-400">Bot</span>
                    </div>
                  )}
                  <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                    msg.isBot
                      ? 'bg-white dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 rounded-tl-sm border border-neutral-100 dark:border-neutral-600'
                      : 'bg-primary-600 text-white rounded-tr-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-neutral-700 rounded-2xl rounded-tl-sm px-4 py-3 border border-neutral-100 dark:border-neutral-600">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Predefined Questions */}
          {messages.length === 0 && (
            <div className="px-3 py-2 border-t border-neutral-100 dark:border-neutral-700 bg-white dark:bg-neutral-800">
              <p className="text-[10px] text-neutral-400 mb-2 px-1 font-medium">QUICK QUESTIONS</p>
              <div className="flex flex-wrap gap-1.5">
                {PREDEFINED_QUESTIONS.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => sendMessage(predefinedToQuery(q.id))}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50 text-primary-700 dark:text-primary-300 rounded-full text-xs font-medium transition-colors"
                  >
                    <span>{q.icon}</span>
                    <span>{q.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="px-3 py-3 border-t border-neutral-100 dark:border-neutral-700 bg-white dark:bg-neutral-800">
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything... (Hindi/English)"
                className="flex-1 px-3 py-2 bg-neutral-100 dark:bg-neutral-700 dark:text-white rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-0"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="w-9 h-9 bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-300 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
              >
                <Send className="h-4 w-4 text-white" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
