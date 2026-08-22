'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, ArrowRight } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const PREDEFINED_QUESTIONS = [
  { id: 'what', label: 'What is FormEasy?', icon: '❓' },
  { id: 'how', label: 'How does it work?', icon: '📋' },
  { id: 'fee', label: 'What are the fees?', icon: '💰' },
  { id: 'track', label: 'How to track application?', icon: '📍' },
  { id: 'refund', label: 'Refund policy?', icon: '💸' },
  { id: 'contact', label: 'Contact support', icon: '📞' },
  { id: 'docs', label: 'Required documents?', icon: '📄' },
  { id: 'time', label: 'How long does it take?', icon: '⏱️' },
];

// Smart AI responses - detects language and responds accordingly
function getAIResponse(input: string): string {
  const lower = input.toLowerCase().trim();

  // Hindi responses
  if (/^(kya|kaise|kab|kahan|kaun|kyu|kyun|batao|samjhao|help|madad)/i.test(lower) ||
      /hindi|हिंदी/.test(lower)) {
    if (/formeasy|form easy|form filling|form bhar/.test(lower)) {
      return 'FormEasy ek online form filling service hai. Hum government exams, college admissions, scholarships aur other official forms bharte hain. Aapko sirf apni details deni hain, baaki hum sambhal lenge! 🎯';
    }
    if (/fee|paisa|charge|price|kitna|rate|kharcha/.test(lower)) {
      return 'Humari service fee ₹50 se ₹200 tak hai form ke hisaab se. Official government fee alag se lagegi. Total fee form select karne pe dikhai degi. 💰';
    }
    if (/track|status|pata|kahan pahuncha|update/.test(lower)) {
      return 'Aap apne dashboard mein jaakar "My Applications" pe click karke apna status dekh sakte hain. Real-time updates milte hain! 📱';
    }
    if (/refund|paisa wapas|return/.test(lower)) {
      return 'Agar aapka form submit nahi hua hai toh full refund milega. Agar form process ho raha hai toh partial refund possible hai. Detail mein refund policy page pe padh sakte hain. 💸';
    }
    if (/contact|call|email|baat|phone|support/.test(lower)) {
      return 'Aap humse contact kar sakte hain: 📞 Email: support@formeasy.com | Phone: +91 9650X XXX95 | Ya phir Contact page pe jaakar message bhejiye!';
    }
    if (/document|doc|kagaz|paper|kya chahiye/.test(lower)) {
      return 'Aamtaur pe ye documents chahiye: 📄 Aadhaar Card, Passport Size Photo, Signature, aur 10th/12th Marksheet (exam ke hisaab se alag alag). Form select karne pe exact list dikhai degi!';
    }
    if (/time|kitna waqt|lamba|din|duration/.test(lower)) {
      return 'Form submit hone ke baad 24-48 hours mein hamari team process karti hai. Official portal pe submit hone mein 3-7 working days lag sakte hain. ⏱️';
    }
    if (/kaise|kaise kare|process|step|tarika/.test(lower)) {
      return 'Bahut aasan hai! 1️⃣ Form select karo 2️⃣ Details bharo 3️⃣ Documents upload karo 4️⃣ Payment karo 5️⃣ Baaki hum sambhal lenge! 🚀';
    }
    return 'Aapka sawal samajh aa gaya! FormEasy pe aap government forms, exam applications aur scholarships easily bhar sakte hain. Kya aapko kisi specific cheez ke baare mein jaanna hai? 🤔';
  }

  // English responses
  if (/what|about|tell me|explain|kya hai/.test(lower)) {
    if (/formeasy|form easy|service|platform/.test(lower)) {
      return 'FormEasy is India\'s trusted online form filling service! 🎯 We help students fill and submit government exam forms, college admissions, scholarships, and other official forms — all from the comfort of their home. No more standing in queues at cyber cafes!';
    }
    return 'FormEasy is an online form filling platform where you can apply for government exams, college admissions, scholarships, and more. We handle the entire process for you! 🎯';
  }

  if (/how|process|work|step|kaise/.test(lower)) {
    return 'It\'s super easy! 🚀\n\n1️⃣ Browse & select the form you need\n2️⃣ Fill in your personal details\n3️⃣ Upload required documents\n4️⃣ Make the payment\n5️⃣ We handle everything else!\n\nYou can track your application status anytime from your dashboard.';
  }

  if (/fee|price|cost|charge|rate|paisa|kitna/.test(lower)) {
    return 'Our service fees are very affordable! 💰\n\n📋 Form Filling: ₹50 - ₹200 (depending on form)\n📄 Official Fee: As per government portal\n\nTotal fee is shown before payment. No hidden charges!';
  }

  if (/track|status|progress|where|update/.test(lower)) {
    return 'Tracking is easy! 📍\n\n1. Login to your dashboard\n2. Click "My Applications"\n3. See real-time status updates\n\nYou\'ll get notifications at every step — from submission to completion!';
  }

  if (/refund|money back|return|paisa/.test(lower)) {
    return 'Our refund policy: 💸\n\n✅ Full refund if form is not submitted\n✅ Partial refund if cancelled during processing\n❌ No refund after form is submitted to portal\n\nCheck our Refund Policy page for complete details.';
  }

  if (/contact|call|email|support|help|phone/.test(lower)) {
    return 'We\'re here to help! 📞\n\n📧 Email: support@formeasy.com\n📱 Phone: +91 9650X XXX95\n💬 Chat: You\'re talking to me right now!\n📋 Contact Form: formeasy.in/contact\n\nOur team responds within 2-4 hours!';
  }

  if (/document|docs|paper|kagaz|upload/.test(lower)) {
    return 'Common documents needed 📄\n\n• Aadhaar Card\n• Passport Size Photo\n• Signature\n• 10th/12th Marksheet\n• Category Certificate (if applicable)\n\nExact documents are shown when you select a specific form!';
  }

  if (/time|long|how long|duration|kitna time|din/.test(lower)) {
    return 'Typical timeline ⏱️\n\n📱 Form filling by you: 10-15 minutes\n🤖 Our processing: 24-48 hours\n🏛️ Portal submission: 3-7 working days\n✅ Completion: varies by form\n\nYou\'ll get real-time updates at every step!';
  }

  if (/thanks|thank you|dhanyavad|shukriya/.test(lower)) {
    return 'You\'re welcome! 😊 Happy to help! If you have any more questions, feel free to ask. Good luck with your form! 🎯';
  }

  if (/hi|hello|hey|namaste|namaskar|hii/.test(lower)) {
    return 'Hello! 👋 Welcome to FormEasy Support! I\'m here to help you with any questions about our form filling service. What would you like to know?';
  }

  if (/ssc|upsc|railway|bank|neet|jee/.test(lower)) {
    return 'We support all major exams! 🎯\n\n• SSC (CGL, CHSL, MTS)\n• UPSC (CSE, IFS)\n• Railway (Group D, ALP, NTPC)\n• Banking (PO, Clerk, SO)\n• NEET, JEE Main\n• And many more!\n\nBrowse our Forms section to see all available exams.';
  }

  if (/payment|pay|upi|card|razorpay/.test(lower)) {
    return 'We accept all payment methods! 💳\n\n• UPI (Google Pay, PhonePe, etc.)\n• Debit/Credit Cards\n• Net Banking\n\nAll payments are secured by Razorpay 🔒';
  }

  // Default response
  return 'Thanks for your question! 🤔\n\nI can help you with:\n• FormEasy services & how they work\n• Fees & payment\n• Application tracking\n• Required documents\n• Refund policy\n• Contact information\n\nPlease ask me anything or select a quick option below! 👇';
}

export function ChatSupport() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: '1',
        text: 'Hello! 👋 Welcome to FormEasy Support!\n\nI\'m here to help you with any questions. You can ask me anything or select a quick option below!',
        isBot: true,
        timestamp: new Date(),
      }]);
    }
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isBot: false,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking time
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
    }, 800 + Math.random() * 700);
  };

  const handlePredefined = (questionId: string) => {
    const question = PREDEFINED_QUESTIONS.find(q => q.id === questionId);
    if (question) {
      // Map predefined question to actual query
      const queryMap: Record<string, string> = {
        what: 'What is FormEasy?',
        how: 'How does FormEasy work?',
        fee: 'What are the fees?',
        track: 'How to track my application?',
        refund: 'What is the refund policy?',
        contact: 'How to contact support?',
        docs: 'What documents are required?',
        time: 'How long does it take?',
      };
      sendMessage(queryMap[questionId] || question.label);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 ${
          isOpen
            ? 'bg-red-500 hover:bg-red-600'
            : 'bg-primary-600 hover:bg-primary-700'
        }`}
        aria-label={isOpen ? 'Close chat' : 'Open chat support'}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <div className="relative">
            <MessageCircle className="h-6 w-6 text-white" />
            {/* Notification dot */}
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-primary-600"></span>
          </div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col" style={{ maxHeight: 'min(580px, calc(100vh - 160px))' }}>
          {/* Header */}
          <div className="bg-primary-600 text-white px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">FormEasy Support</h3>
              <p className="text-xs text-primary-100">Usually replies instantly</p>
            </div>
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-neutral-50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] ${msg.isBot ? 'order-2' : ''}`}>
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
                      ? 'bg-white text-neutral-800 rounded-tl-sm border border-neutral-100'
                      : 'bg-primary-600 text-white rounded-tr-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 border border-neutral-100">
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

          {/* Predefined Questions (show only at start) */}
          {messages.length <= 1 && (
            <div className="px-3 py-2 border-t border-neutral-100 bg-white">
              <p className="text-[10px] text-neutral-400 mb-2 px-1">QUICK QUESTIONS</p>
              <div className="flex flex-wrap gap-1.5">
                {PREDEFINED_QUESTIONS.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => handlePredefined(q.id)}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-full text-xs font-medium transition-colors"
                  >
                    <span>{q.icon}</span>
                    <span>{q.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="px-3 py-3 border-t border-neutral-100 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question..."
                className="flex-1 px-3 py-2 bg-neutral-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-0"
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
