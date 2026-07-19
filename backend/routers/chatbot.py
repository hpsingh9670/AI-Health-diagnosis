"""
Bilingual AI Chatbot router.
Handles English and Hindi conversations for healthcare guidance.
Rule-based with intent detection and multi-turn context.
"""
from fastapi import APIRouter, Depends
from schemas.schemas import ChatMessage
from auth import get_current_user
from typing import Optional
import random

router = APIRouter(prefix="/api/chatbot", tags=["Chatbot"])

# ─── Intent patterns ──────────────────────────────────────────────────────────
INTENTS_EN = {
    "greeting": ["hello", "hi", "hey", "good morning", "good evening", "namaste", "start"],
    "symptoms": ["symptom", "symptoms", "check symptoms", "i feel", "i have", "feeling", "sick", "pain", "fever", "cough"],
    "appointment": ["appointment", "book", "doctor", "schedule", "consult", "meet doctor"],
    "hospital": ["hospital", "clinic", "nearby", "find hospital", "emergency room", "where"],
    "sos": ["sos", "emergency", "help", "ambulance", "urgent", "critical"],
    "medicine": ["medicine", "medication", "reminder", "pill", "tablet", "drug", "dose"],
    "health_tips": ["tips", "health tips", "advice", "suggestion", "diet", "lifestyle"],
    "family": ["family", "family records", "family member", "health records"],
    "language": ["hindi", "english", "language", "change language", "हिंदी", "english mein"],
    "goodbye": ["bye", "goodbye", "exit", "thanks", "thank you", "done"],
}

INTENTS_HI = {
    "greeting": ["नमस्ते", "हैलो", "हाय", "शुरू", "स्वागत"],
    "symptoms": ["लक्षण", "बीमारी", "दर्द", "बुखार", "खांसी", "मुझे", "तकलीफ", "परेशानी"],
    "appointment": ["अपॉइंटमेंट", "डॉक्टर", "बुकिंग", "मिलना", "परामर्श"],
    "hospital": ["अस्पताल", "क्लिनिक", "नजदीक", "पास"],
    "sos": ["आपातकाल", "इमरजेंसी", "मदद", "एम्बुलेंस", "sos"],
    "medicine": ["दवाई", "दवा", "याद", "खुराक", "गोली"],
    "health_tips": ["सुझाव", "स्वास्थ्य", "सलाह", "टिप्स"],
    "family": ["परिवार", "परिवार के सदस्य", "रिकॉर्ड"],
    "language": ["अंग्रेजी", "हिंदी", "भाषा"],
    "goodbye": ["धन्यवाद", "अलविदा", "ठीक है", "बाय"],
}

# ─── Responses ────────────────────────────────────────────────────────────────
RESPONSES = {
    "en": {
        "greeting": [
            "Hello! 👋 Welcome to **MediAI**. I'm your personal AI healthcare assistant.\n\nHow can I help you today?\n\n1. 🩺 Check Symptoms\n2. 📅 Book Appointment\n3. 🏥 Find Nearby Hospital\n4. 🚨 Emergency SOS\n5. 💊 Medicine Reminder\n6. 💡 Health Tips\n7. 👨‍👩‍👧 Family Records",
        ],
        "symptoms": [
            "I can help you check your symptoms! 🩺\n\nPlease go to the **Symptom Checker** page or tell me your symptoms here.\n\nFor example: *'I have fever, headache, and body ache'*\n\nRemember: This is for informational purposes only — always consult a real doctor for diagnosis.",
        ],
        "appointment": [
            "I'll help you book an appointment! 📅\n\nTo book an appointment, I'll need:\n• Your **name** and **age**\n• Main **symptoms**\n• **Preferred date & time**\n• Your **location**\n\nPlease go to the **Appointment Booking** page to complete your booking, or tell me your details and I'll guide you.",
        ],
        "hospital": [
            "I can help you find nearby hospitals! 🏥\n\nTo find hospitals near you:\n1. Click on **Hospital Finder** in the dashboard\n2. Allow location access\n3. View hospitals on the map with distances and emergency availability\n\nWould you like me to take you there?",
        ],
        "sos": [
            "🚨 **EMERGENCY DETECTED!**\n\nIf this is a medical emergency:\n• Press the **SOS Button** on the Emergency page immediately\n• This will alert emergency services with your location\n• Your emergency contacts will be notified\n\n**Call 112** (Emergency) or **108** (Ambulance) right now if in immediate danger!",
        ],
        "medicine": [
            "I can help you manage your medicines! 💊\n\nIn the **Medicine Reminder** section, you can:\n• Add medicines with dosage\n• Set reminder times (e.g., 8:00 AM, 2:00 PM)\n• Get browser notifications\n• Track if you've taken your doses\n\nWould you like to add a medicine reminder?",
        ],
        "health_tips": [
            "Here are some personalized health tips for you! 💡\n\n✅ **Hydration**: Drink 8-10 glasses of water daily\n🏃 **Exercise**: 30 minutes of moderate activity 5 days/week\n🥗 **Diet**: Include fruits, vegetables, and whole grains\n😴 **Sleep**: Get 7-9 hours of quality sleep\n🧘 **Stress**: Practice meditation or deep breathing\n\nFor personalized tips based on your health profile, visit the **Health Tips** section!",
        ],
        "family": [
            "Manage your family's health records! 👨‍👩‍👧\n\nIn **Family Records** you can:\n• Add family members with complete health info\n• Store blood groups, allergies, medications\n• Save emergency contacts\n• Store insurance information\n\nWould you like to add a family member?",
        ],
        "language": [
            "You can switch languages! 🌐\n\nSupported languages:\n• **English** (Current)\n• **हिन्दी** (Hindi)\n\nType 'Hindi' to switch to Hindi mode, or select your language in the settings.",
        ],
        "goodbye": [
            "Thank you for using MediAI! 🏥\n\nStay healthy and take care! If you need help anytime, I'm here for you.\n\n*Remember: MediAI provides information only — always consult a qualified doctor for medical advice.* 👨‍⚕️",
        ],
        "default": [
            "I'm here to help! 😊 You can ask me about:\n\n• 🩺 Symptom checking\n• 📅 Appointment booking\n• 🏥 Finding hospitals\n• 🚨 Emergency SOS\n• 💊 Medicine reminders\n• 💡 Health tips\n• 👨‍👩‍👧 Family health records\n\nWhat would you like help with?",
            "I didn't quite understand that. Let me know how I can assist you with your healthcare needs! Would you like to:\n1. Check symptoms\n2. Find a hospital\n3. Book an appointment",
        ],
    },
    "hi": {
        "greeting": [
            "नमस्ते! 👋 **MediAI** में आपका स्वागत है। मैं आपका व्यक्तिगत AI स्वास्थ्य सहायक हूँ।\n\nमैं आपकी कैसे मदद कर सकता हूँ?\n\n1. 🩺 लक्षण जांचें\n2. 📅 अपॉइंटमेंट बुक करें\n3. 🏥 नजदीकी अस्पताल खोजें\n4. 🚨 आपातकालीन SOS\n5. 💊 दवाई रिमाइंडर\n6. 💡 स्वास्थ्य सुझाव\n7. 👨‍👩‍👧 पारिवारिक स्वास्थ्य रिकॉर्ड",
        ],
        "symptoms": [
            "मैं आपके लक्षणों की जांच करने में मदद कर सकता हूँ! 🩺\n\n**लक्षण जांचकर्ता** पृष्ठ पर जाएं या यहाँ अपने लक्षण बताएं।\n\nउदाहरण: *'मुझे बुखार, सिरदर्द और शरीर में दर्द है'*\n\nयाद रखें: यह केवल जानकारी के लिए है — निदान के लिए हमेशा असली डॉक्टर से मिलें।",
        ],
        "appointment": [
            "मैं आपको अपॉइंटमेंट बुक करने में मदद करूँगा! 📅\n\nअपॉइंटमेंट के लिए मुझे चाहिए:\n• आपका **नाम** और **उम्र**\n• मुख्य **लक्षण**\n• **पसंदीदा तारीख और समय**\n• आपका **स्थान**\n\n**अपॉइंटमेंट बुकिंग** पृष्ठ पर जाएं।",
        ],
        "hospital": [
            "मैं आपके नजदीकी अस्पताल खोजने में मदद कर सकता हूँ! 🏥\n\nनजदीकी अस्पताल खोजने के लिए:\n1. डैशबोर्ड में **अस्पताल खोजक** पर क्लिक करें\n2. स्थान एक्सेस की अनुमति दें\n3. मानचित्र पर अस्पताल देखें\n\nक्या आप वहाँ जाना चाहते हैं?",
        ],
        "sos": [
            "🚨 **आपातकाल!**\n\nयदि यह चिकित्सा आपातकाल है:\n• **SOS बटन** दबाएं तुरंत\n• यह आपके स्थान के साथ आपातकालीन सेवाओं को अलर्ट करेगा\n• आपके परिवार को सूचित किया जाएगा\n\nतुरंत **112** (आपातकाल) या **108** (एम्बुलेंस) पर कॉल करें!",
        ],
        "medicine": [
            "मैं आपकी दवाइयाँ प्रबंधित करने में मदद कर सकता हूँ! 💊\n\n**दवाई रिमाइंडर** अनुभाग में:\n• दवाइयाँ खुराक के साथ जोड़ें\n• रिमाइंडर समय सेट करें\n• ब्राउज़र नोटिफिकेशन पाएं\n• खुराक ट्रैक करें\n\nक्या आप दवाई रिमाइंडर जोड़ना चाहते हैं?",
        ],
        "health_tips": [
            "आपके लिए स्वास्थ्य सुझाव! 💡\n\n✅ **पानी**: रोज 8-10 गिलास पानी पिएं\n🏃 **व्यायाम**: सप्ताह में 5 दिन 30 मिनट व्यायाम करें\n🥗 **आहार**: फल, सब्जियाँ और साबुत अनाज लें\n😴 **नींद**: 7-9 घंटे की अच्छी नींद लें\n🧘 **तनाव**: ध्यान या गहरी सांस का अभ्यास करें",
        ],
        "family": [
            "अपने परिवार के स्वास्थ्य रिकॉर्ड प्रबंधित करें! 👨‍👩‍👧\n\n**पारिवारिक रिकॉर्ड** में:\n• परिवार के सदस्य जोड़ें\n• रक्त समूह, एलर्जी, दवाइयाँ संग्रहीत करें\n• आपातकालीन संपर्क सहेजें",
        ],
        "language": [
            "आप भाषा बदल सकते हैं! 🌐\n\nसमर्थित भाषाएं:\n• **हिन्दी** (वर्तमान)\n• **English**\n\n'English' टाइप करें अंग्रेजी में स्विच करने के लिए।",
        ],
        "goodbye": [
            "MediAI उपयोग करने के लिए धन्यवाद! 🏥\n\nस्वस्थ रहें और ख्याल रखें! किसी भी समय मदद के लिए मैं यहाँ हूँ।\n\n*याद रखें: MediAI केवल जानकारी प्रदान करता है — चिकित्सा सलाह के लिए हमेशा योग्य डॉक्टर से मिलें।* 👨‍⚕️",
        ],
        "default": [
            "मैं यहाँ मदद के लिए हूँ! 😊 आप पूछ सकते हैं:\n\n• 🩺 लक्षण जांच\n• 📅 अपॉइंटमेंट बुकिंग\n• 🏥 अस्पताल खोज\n• 🚨 आपातकालीन SOS\n• 💊 दवाई रिमाइंडर\n\nआप किस विषय में मदद चाहते हैं?",
        ],
    }
}


def detect_intent(message: str, language: str = "en") -> str:
    """Detect intent from user message using keyword matching."""
    msg_lower = message.lower().strip()
    intent_map = INTENTS_HI if language == "hi" else INTENTS_EN

    for intent, keywords in intent_map.items():
        if any(kw in msg_lower for kw in keywords):
            return intent

    # Cross-language detection
    for intent, keywords in INTENTS_EN.items():
        if any(kw in msg_lower for kw in keywords):
            return intent

    return "default"


def get_response(intent: str, language: str = "en") -> str:
    """Get a response for the detected intent in the chosen language."""
    lang = language if language in RESPONSES else "en"
    intent_responses = RESPONSES[lang].get(intent, RESPONSES[lang]["default"])
    return random.choice(intent_responses)


@router.post("/message")
def chat(payload: ChatMessage):
    """
    Process a chat message and return a bot response.
    Supports English and Hindi with intent-based routing.
    """
    intent = detect_intent(payload.message, payload.language or "en")
    response = get_response(intent, payload.language or "en")

    return {
        "intent": intent,
        "response": response,
        "language": payload.language,
        "suggestions": get_suggestions(intent, payload.language or "en"),
    }


def get_suggestions(intent: str, language: str) -> list:
    """Return quick reply suggestions based on current intent."""
    if language == "hi":
        base = ["लक्षण जांचें", "अस्पताल खोजें", "अपॉइंटमेंट", "आपातकाल", "दवाई रिमाइंडर"]
    else:
        base = ["Check Symptoms", "Find Hospital", "Book Appointment", "Emergency SOS", "Medicine Reminder"]

    return base[:4]
