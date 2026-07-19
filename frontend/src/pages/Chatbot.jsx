import { useState, useEffect, useRef } from 'react';
import { chatbotAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Send, Bot, User, Globe } from 'lucide-react';

const WELCOME_EN = "Hello! 👋 Welcome to **MediAI**. I'm your personal AI healthcare assistant.\n\nHow can I help you today?\n\n1. 🩺 Check Symptoms\n2. 📅 Book Appointment\n3. 🏥 Find Nearby Hospital\n4. 🚨 Emergency SOS\n5. 💊 Medicine Reminder\n6. 💡 Health Tips\n7. 👨‍👩‍👧 Family Records";
const WELCOME_HI = "नमस्ते! 👋 **MediAI** में आपका स्वागत है। मैं आपका व्यक्तिगत AI स्वास्थ्य सहायक हूँ।\n\nआज मैं आपकी कैसे मदद कर सकता हूँ?\n\n1. 🩺 लक्षण जांचें\n2. 📅 अपॉइंटमेंट बुक करें\n3. 🏥 नजदीकी अस्पताल खोजें\n4. 🚨 आपातकालीन SOS\n5. 💊 दवाई रिमाइंडर\n6. 💡 स्वास्थ्य सुझाव\n7. 👨‍👩‍👧 पारिवारिक रिकॉर्ड";

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  const text = msg.text;

  // Simple markdown: bold **text**
  const formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>');

  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexDirection: isUser ? 'row-reverse' : 'row' }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
        background: isUser ? 'var(--primary)' : 'linear-gradient(135deg, #1a6bdb, #06b6d4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14
      }}>
        {isUser ? <User size={14} color="#fff" /> : '🤖'}
      </div>
      <div
        className={`chat-bubble ${isUser ? 'user' : 'bot'}`}
        dangerouslySetInnerHTML={{ __html: formatted }}
      />
    </div>
  );
}

export default function Chatbot() {
  const { language, changeLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([
    'Check Symptoms', 'Find Hospital', 'Book Appointment', 'Emergency SOS'
  ]);
  const [showLangSelect, setShowLangSelect] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    // Initial welcome message
    const welcome = language === 'hi' ? WELCOME_HI : WELCOME_EN;
    setMessages([{ id: 1, role: 'bot', text: welcome }]);
    if (language === 'hi') {
      setSuggestions(['लक्षण जांचें', 'अस्पताल खोजें', 'अपॉइंटमेंट', 'आपातकाल SOS']);
    }
  }, [language]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text) => {
    if (!text.trim()) return;
    const userMsg = { id: Date.now(), role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await chatbotAPI.sendMessage(text, language);
      const botMsg = { id: Date.now() + 1, role: 'bot', text: data.response };
      setMessages(prev => [...prev, botMsg]);
      if (data.suggestions?.length) setSuggestions(data.suggestions);

      // Navigate on specific intents
      if (data.intent === 'sos') navigate('/sos');
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1, role: 'bot',
        text: t("I'm sorry, I'm having trouble right now. Please try again.", 'माफ करें, अभी मुझे कुछ समस्या है। कृपया पुनः प्रयास करें।')
      }]);
    } finally { setLoading(false); }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0f2557, #1a6bdb)',
        borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
        padding: '16px 20px',
        display: 'flex', alignItems: 'center', gap: 12
      }}>
        <div style={{
          width: 42, height: 42, borderRadius: '50%',
          background: 'rgba(255,255,255,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22
        }}>🤖</div>
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>MediAI Assistant</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
            Online · {t('Bilingual Support (EN/HI)', 'द्विभाषी समर्थन (EN/HI)')}
          </div>
        </div>
        {/* Language toggle */}
        <button
          onClick={() => { changeLanguage(language === 'en' ? 'hi' : 'en'); }}
          style={{
            marginLeft: 'auto', background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.25)', borderRadius: '99px',
            padding: '5px 12px', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6
          }}
        >
          <Globe size={12} />
          {language === 'en' ? 'Switch to हिन्दी' : 'Switch to English'}
        </button>
      </div>

      {/* Messages */}
      <div className="chat-messages" style={{
        flex: 1, overflowY: 'auto', padding: 20,
        background: 'var(--bg-card)',
        borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', gap: 16
      }}>
        {messages.map(msg => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
        {loading && (
          <div className="chat-bubble bot" style={{ display: 'flex', gap: 4, padding: '12px 16px' }}>
            <span style={{ animation: 'pulse 1s infinite 0s', width: 8, height: 8, borderRadius: '50%', background: 'var(--text-muted)' }} />
            <span style={{ animation: 'pulse 1s infinite 0.2s', width: 8, height: 8, borderRadius: '50%', background: 'var(--text-muted)' }} />
            <span style={{ animation: 'pulse 1s infinite 0.4s', width: 8, height: 8, borderRadius: '50%', background: 'var(--text-muted)' }} />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick replies */}
      <div style={{
        padding: '10px 16px', background: 'var(--bg-secondary)',
        borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)',
        display: 'flex', gap: 8, overflowX: 'auto'
      }}>
        {suggestions.map(s => (
          <button key={s} className="quick-reply" onClick={() => send(s)}>
            {s}
          </button>
        ))}
      </div>

      {/* Input area */}
      <div style={{
        padding: '12px 16px', background: 'var(--bg-card)',
        borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
        border: '1px solid var(--border)',
        display: 'flex', gap: 10, alignItems: 'center'
      }}>
        <input
          className="form-input"
          style={{ flex: 1, borderRadius: '99px' }}
          placeholder={t('Type your message... (English or हिन्दी)', 'अपना संदेश टाइप करें... (English or हिन्दी)')}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button
          className="btn btn-primary"
          style={{ borderRadius: '50%', width: 42, height: 42, padding: 0 }}
          onClick={() => send(input)}
          disabled={loading || !input.trim()}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
