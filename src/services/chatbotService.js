const db = require('../config/database');

class ChatbotService {
  constructor() {
    // Knowledge base for different languages
    this.knowledge = {
      en: {
        greeting: ["Hello! I'm here to help you with hedging and oilseed price information. How can I assist you today?"],
        hedging_info: [
          "Hedging is a risk management strategy used to offset potential losses in price fluctuations.",
          "In oilseed markets, you can use long positions (betting prices will rise) or short positions (betting prices will fall).",
          "Our platform allows you to practice virtual hedging without risking real money."
        ],
        long_position: [
          "A long position means you're buying a contract expecting prices to increase.",
          "If prices go up, you profit. If they go down, you incur a loss.",
          "Use long positions when you believe crop prices will rise."
        ],
        short_position: [
          "A short position means you're selling a contract expecting prices to decrease.",
          "If prices go down, you profit. If they go up, you incur a loss.",
          "Use short positions to protect against falling prices."
        ],
        price_prediction: [
          "Our platform uses AI algorithms including Simple Moving Average (SMA), Exponential Moving Average (EMA), and trend analysis.",
          "You can view 7-day price predictions for all oilseeds in the Prices section.",
          "Remember, predictions are estimates and actual prices may vary."
        ],
        crops: [
          "We support four major oilseeds: Soybean, Mustard, Groundnut, and Sunflower.",
          "Each crop has different price volatility and market characteristics.",
          "Check the Prices page for current rates and historical trends."
        ],
        alerts: [
          "You can set price alerts to notify you when a crop reaches your target price.",
          "Visit the Alerts page to create threshold-based notifications.",
          "This helps you act quickly on market opportunities."
        ],
        trading: [
          "Visit the Trading page to create virtual hedging contracts.",
          "Select a crop, choose long or short position, set quantity and expiry date.",
          "Monitor your positions in the Contracts page."
        ],
        default: [
          "I can help you with information about hedging, price predictions, trading contracts, and market alerts.",
          "Try asking about 'what is hedging', 'price predictions', 'how to trade', or 'setting alerts'."
        ]
      },
      hi: {
        greeting: ["नमस्ते! मैं हेजिंग और तिलहन मूल्य जानकारी में आपकी मदद के लिए यहाँ हूँ। आज मैं आपकी कैसे सहायता कर सकता हूँ?"],
        hedging_info: [
          "हेजिंग एक जोखिम प्रबंधन रणनीति है जिसका उपयोग मूल्य में उतार-चढ़ाव से होने वाले संभावित नुकसान को कम करने के लिए किया जाता है।",
          "तिलहन बाजारों में, आप लॉन्ग पोजीशन (कीमतें बढ़ने की उम्मीद) या शॉर्ट पोजीशन (कीमतें गिरने की उम्मीद) का उपयोग कर सकते हैं।",
          "हमारा प्लेटफ़ॉर्म आपको वास्तविक धन को जोखिम में डाले बिना वर्चुअल हेजिंग का अभ्यास करने की अनुमति देता है।"
        ],
        long_position: [
          "लॉन्ग पोजीशन का मतलब है कि आप कीमतों में वृद्धि की उम्मीद में एक अनुबंध खरीद रहे हैं।",
          "यदि कीमतें बढ़ती हैं, तो आपको लाभ होता है। यदि वे नीचे जाती हैं, तो आपको नुकसान होता है।",
          "जब आपको लगे कि फसल की कीमतें बढ़ेंगी तो लॉन्ग पोजीशन का उपयोग करें।"
        ],
        short_position: [
          "शॉर्ट पोजीशन का मतलब है कि आप कीमतों में कमी की उम्मीद में एक अनुबंध बेच रहे हैं।",
          "यदि कीमतें नीचे जाती हैं, तो आपको लाभ होता है। यदि वे बढ़ती हैं, तो आपको नुकसान होता है।",
          "गिरती कीमतों से बचाने के लिए शॉर्ट पोजीशन का उपयोग करें।"
        ],
        price_prediction: [
          "हमारा प्लेटफ़ॉर्म AI एल्गोरिदम का उपयोग करता है जिसमें सिंपल मूविंग एवरेज (SMA), एक्सपोनेंशियल मूविंग एवरेज (EMA), और ट्रेंड विश्लेषण शामिल हैं।",
          "आप प्राइसेस सेक्शन में सभी तिलहनों के लिए 7-दिन की कीमत भविष्यवाणी देख सकते हैं।",
          "याद रखें, भविष्यवाणियाँ अनुमान हैं और वास्तविक कीमतें भिन्न हो सकती हैं।"
        ],
        crops: [
          "हम चार प्रमुख तिलहनों का समर्थन करते हैं: सोयाबीन, सरसों, मूंगफली और सूरजमुखी।",
          "प्रत्येक फसल की अलग मूल्य अस्थिरता और बाजार विशेषताएं हैं।",
          "वर्तमान दरों और ऐतिहासिक रुझानों के लिए प्राइसेस पेज देखें।"
        ],
        alerts: [
          "जब कोई फसल आपके लक्षित मूल्य पर पहुंच जाए तो आपको सूचित करने के लिए आप मूल्य अलर्ट सेट कर सकते हैं।",
          "थ्रेसहोल्ड-आधारित सूचनाएं बनाने के लिए अलर्ट्स पेज पर जाएं।",
          "यह आपको बाजार के अवसरों पर जल्दी से कार्य करने में मदद करता है।"
        ],
        trading: [
          "वर्चुअल हेजिंग अनुबंध बनाने के लिए ट्रेडिंग पेज पर जाएं।",
          "एक फसल चुनें, लॉन्ग या शॉर्ट पोजीशन चुनें, मात्रा और समाप्ति तिथि सेट करें।",
          "कॉन्ट्रैक्ट्स पेज में अपनी पोजीशन की निगरानी करें।"
        ],
        default: [
          "मैं हेजिंग, मूल्य भविष्यवाणियों, ट्रेडिंग अनुबंधों और बाजार अलर्ट के बारे में जानकारी में आपकी मदद कर सकता हूं।",
          "'हेजिंग क्या है', 'मूल्य भविष्यवाणी', 'ट्रेड कैसे करें', या 'अलर्ट सेट करना' के बारे में पूछने का प्रयास करें।"
        ]
      },
      pa: {
        greeting: ["ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਹੈਜਿੰਗ ਅਤੇ ਤਿਲਹਣ ਕੀਮਤ ਜਾਣਕਾਰੀ ਵਿੱਚ ਤੁਹਾਡੀ ਮਦਦ ਕਰਨ ਲਈ ਇੱਥੇ ਹਾਂ। ਅੱਜ ਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਸਹਾਇਤਾ ਕਰ ਸਕਦਾ ਹਾਂ?"],
        hedging_info: [
          "ਹੈਜਿੰਗ ਇੱਕ ਜੋਖਮ ਪ੍ਰਬੰਧਨ ਰਣਨੀਤੀ ਹੈ ਜੋ ਕੀਮਤ ਵਿੱਚ ਉਤਾਰ-ਚੜ੍ਹਾਅ ਤੋਂ ਸੰਭਾਵਿਤ ਨੁਕਸਾਨ ਨੂੰ ਘਟਾਉਣ ਲਈ ਵਰਤੀ ਜਾਂਦੀ ਹੈ।",
          "ਤਿਲਹਣ ਬਾਜ਼ਾਰਾਂ ਵਿੱਚ, ਤੁਸੀਂ ਲੰਬੀ ਸਥਿਤੀ (ਕੀਮਤਾਂ ਵਧਣ ਦੀ ਉਮੀਦ) ਜਾਂ ਛੋਟੀ ਸਥਿਤੀ (ਕੀਮਤਾਂ ਘਟਣ ਦੀ ਉਮੀਦ) ਦੀ ਵਰਤੋਂ ਕਰ ਸਕਦੇ ਹੋ।",
          "ਸਾਡਾ ਪਲੇਟਫਾਰਮ ਤੁਹਾਨੂੰ ਅਸਲ ਪੈਸੇ ਨੂੰ ਜੋਖਮ ਵਿੱਚ ਪਾਏ ਬਿਨਾਂ ਵਰਚੁਅਲ ਹੈਜਿੰਗ ਦਾ ਅਭਿਆਸ ਕਰਨ ਦੀ ਇਜਾਜ਼ਤ ਦਿੰਦਾ ਹੈ।"
        ],
        default: [
          "ਮੈਂ ਹੈਜਿੰਗ, ਕੀਮਤ ਪੂਰਵ-ਅਨੁਮਾਨ, ਵਪਾਰ ਇਕਰਾਰਨਾਮੇ, ਅਤੇ ਬਾਜ਼ਾਰ ਚੇਤਾਵਨੀਆਂ ਬਾਰੇ ਜਾਣਕਾਰੀ ਵਿੱਚ ਤੁਹਾਡੀ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ।"
        ]
      },
      ta: {
        greeting: ["வணக்கம்! நான் ஹெட்ஜிங் மற்றும் எண்ணெய் விதை விலை தகவல்களில் உங்களுக்கு உதவ இங்கே இருக்கிறேன். இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?"],
        hedging_info: [
          "ஹெட்ஜிங் என்பது விலை ஏற்ற இறக்கங்களால் ஏற்படும் சாத்தியமான இழப்புகளை ஈடுகட்ட பயன்படுத்தப்படும் ஒரு இடர் மேலாண்மை உத்தி.",
          "எண்ணெய் விதை சந்தைகளில், நீங்கள் நீண்ட நிலைகள் (விலைகள் உயரும் என எதிர்பார்த்து) அல்லது குறுகிய நிலைகள் (விலைகள் குறையும் என எதிர்பார்த்து) பயன்படுத்தலாம்.",
          "எங்கள் தளம் உண்மையான பணத்தை பணயம் வைக்காமல் மெய்நிகர் ஹெட்ஜிங் பயிற்சி செய்ய உங்களை அனுமதிக்கிறது."
        ],
        long_position: [
          "நீண்ட நிலை என்றால் விலைகள் அதிகரிக்கும் என எதிர்பார்த்து ஒரு ஒப்பந்தத்தை வாங்குவது.",
          "விலைகள் உயர்ந்தால், நீங்கள் லாபம் பெறுவீர்கள். குறைந்தால், நீங்கள் நட்டமடைவீர்கள்.",
          "பயிர் விலைகள் உயரும் என நீங்கள் நம்பும்போது நீண்ட நிலைகளைப் பயன்படுத்துங்கள்."
        ],
        default: [
          "ஹெட்ஜிங், விலை முன்னறிவிப்புகள், வர்த்தக ஒப்பந்தங்கள் மற்றும் சந்தை எச்சரிக்கைகள் பற்றிய தகவல்களில் நான் உங்களுக்கு உதவ முடியும்.",
          "'ஹெட்ஜிங் என்றால் என்ன', 'விலை முன்னறிவிப்புகள்', 'எப்படி வர்த்தகம் செய்வது' என்று கேட்க முயற்சிக்கவும்."
        ]
      },
      bn: {
        greeting: ["নমস্কার! আমি হেজিং এবং তৈলবীজের মূল্য তথ্যে আপনাকে সাহায্য করতে এখানে আছি। আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?"],
        hedging_info: [
          "হেজিং হল একটি ঝুঁকি ব্যবস্থাপনা কৌশল যা মূল্যের ওঠানামা থেকে সম্ভাব্য ক্ষতি পূরণ করতে ব্যবহৃত হয়।",
          "তৈলবীজ বাজারে, আপনি দীর্ঘ অবস্থান (মূল্য বৃদ্ধির প্রত্যাশা) বা সংক্ষিপ্ত অবস্থান (মূল্য হ্রাসের প্রত্যাশা) ব্যবহার করতে পারেন।",
          "আমাদের প্ল্যাটফর্ম আপনাকে প্রকৃত অর্থ ঝুঁকি না নিয়ে ভার্চুয়াল হেজিং অনুশীলন করার অনুমতি দেয়।"
        ],
        long_position: [
          "দীর্ঘ অবস্থান মানে আপনি মূল্য বৃদ্ধির প্রত্যাশা করে একটি চুক্তি কিনছেন।",
          "মূল্য বৃদ্ধি পেলে আপনি লাভবান হবেন। কমলে আপনি ক্ষতিগ্রস্ত হবেন।",
          "যখন আপনি বিশ্বাস করেন ফসলের মূল্য বৃদ্ধি পাবে তখন দীর্ঘ অবস্থান ব্যবহার করুন।"
        ],
        default: [
          "আমি হেজিং, মূল্য পূর্বাভাস, ট্রেডিং চুক্তি এবং বাজার সতর্কতা সম্পর্কে তথ্যে আপনাকে সাহায্য করতে পারি।",
          "'হেজিং কি', 'মূল্য পূর্বাভাস', 'কিভাবে ট্রেড করবেন' সম্পর্কে জিজ্ঞাসা করার চেষ্টা করুন।"
        ]
      },
      gu: {
        greeting: ["નમસ્તે! હું હેજિંગ અને તેલીબિયાંના ભાવ માહિતીમાં તમને મદદ કરવા અહીં છું. આજે હું તમને કેવી રીતે મદદ કરી શકું?"],
        hedging_info: [
          "હેજિંગ એ જોખમ વ્યવસ્થાપન વ્યૂહરચના છે જેનો ઉપયોગ ભાવમાં વધઘટથી સંભવિત નુકસાનને સરભર કરવા માટે થાય છે।",
          "તેલીબિયાં બજારોમાં, તમે લાંબી સ્થિતિ (ભાવ વધશે તેવી અપેક્ષા) અથવા ટૂંકી સ્થિતિ (ભાવ ઘટશે તેવી અપેક્ષા) વાપરી શકો છો।",
          "અમારું પ્લેટફોર્મ તમને વાસ્તવિક પૈસાનું જોખમ લીધા વિના વર્ચ્યુઅલ હેજિંગની પ્રેક્ટિસ કરવાની મંજૂરી આપે છે।"
        ],
        long_position: [
          "લાંબી સ્થિતિનો અર્થ છે કે તમે ભાવ વધવાની અપેક્ષાએ કરાર ખરીદી રહ્યા છો।",
          "જો ભાવ વધે તો તમે નફો મેળવો છો. જો ઘટે તો તમને નુકસાન થાય છે।",
          "જ્યારે તમે માનો છો કે પાકના ભાવ વધશે ત્યારે લાંબી સ્થિતિનો ઉપયોગ કરો।"
        ],
        default: [
          "હું હેજિંગ, ભાવ અનુમાન, ટ્રેડિંગ કરાર અને બજાર ચેતવણીઓ વિશેની માહિતીમાં તમને મદદ કરી શકું છું।",
          "'હેજિંગ શું છે', 'ભાવ અનુમાન', 'કેવી રીતે વેપાર કરવો' વિશે પૂછવાનો પ્રયાસ કરો."
        ]
      }
    };

    // Keywords for intent matching
    this.intents = {
      greeting: ['hello', 'hi', 'hey', 'namaste', 'नमस्ते', 'sat sri akal', 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ', 'வணக்கம்', 'নমস্কার', 'નમસ્તે'],
      hedging_info: ['hedging', 'hedge', 'risk management', 'हेजिंग', 'जोखिम', 'ਹੈਜਿੰਗ', 'ஹெட்ஜிங்', 'হেজিং', 'હેજિંગ', 'what is'],
      long_position: ['long', 'long position', 'buy', 'लॉन्ग', 'खरीद', 'நீண்ட', 'দীর্ঘ', 'લાંબી'],
      short_position: ['short', 'short position', 'sell', 'शॉर्ट', 'बेच', 'குறுகிய', 'সংক্ষিপ্ত', 'ટૂંકી'],
      price_prediction: ['predict', 'prediction', 'forecast', 'price', 'भविष्यवाणी', 'कीमत', 'முன்னறிவிப்பு', 'পূর্বাভাস', 'અનુમાન', 'future'],
      crops: ['crop', 'soybean', 'mustard', 'groundnut', 'sunflower', 'फसल', 'सोयाबीन', 'सरसों', 'பயிர்', 'ফসল', 'પાક'],
      alerts: ['alert', 'notification', 'notify', 'अलर्ट', 'सूचना', 'எச்சரிக்கை', 'সতর্কতা', 'ચેતવણી'],
      trading: ['trade', 'trading', 'contract', 'व्यापार', 'अनुबंध', 'வர்த்தகம்', 'ট্রেডিং', 'વેપાર', 'how to trade']
    };
  }

  // Detect intent from user message
  detectIntent(message) {
    const lowerMessage = message.toLowerCase();
    
    for (const [intent, keywords] of Object.entries(this.intents)) {
      for (const keyword of keywords) {
        if (lowerMessage.includes(keyword)) {
          return intent;
        }
      }
    }
    
    return 'default';
  }

  // Get response based on intent and language
  getResponse(intent, language = 'en') {
    const langKnowledge = this.knowledge[language] || this.knowledge['en'];
    const responses = langKnowledge[intent] || langKnowledge['default'];
    
    // Return random response from available options
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Get current market data for context-aware responses
  async getMarketContext() {
    try {
      const currentPrices = await db.query(`
        SELECT c.name, p.price, p.date
        FROM crops c
        LEFT JOIN price_history p ON c.id = p.crop_id
        WHERE p.date = (SELECT MAX(date) FROM price_history WHERE crop_id = c.id)
        ORDER BY c.id
      `);
      
      return currentPrices;
    } catch (error) {
      console.error('Error fetching market context:', error);
      return [];
    }
  }

  // Main chat method
  async chat(message, language = 'en', userId = null) {
    try {
      const intent = this.detectIntent(message);
      let response = this.getResponse(intent, language);
      
      // Add market data context if relevant
      if (['price_prediction', 'crops', 'trading'].includes(intent)) {
        const marketData = await this.getMarketContext();
        if (marketData.length > 0) {
          const priceInfo = marketData
            .map(crop => `${crop.name}: ₹${crop.price ? crop.price.toFixed(2) : 'N/A'}`)
            .join(', ');
          
          const priceLabels = {
            hi: `\n\nवर्तमान कीमतें: ${priceInfo}`,
            pa: `\n\nਮੌਜੂਦਾ ਕੀਮਤਾਂ: ${priceInfo}`,
            ta: `\n\nதற்போதைய விலைகள்: ${priceInfo}`,
            bn: `\n\nবর্তমান মূল্য: ${priceInfo}`,
            gu: `\n\nવર્તમાન ભાવ: ${priceInfo}`,
            en: `\n\nCurrent prices: ${priceInfo}`
          };
          response += priceLabels[language] || priceLabels['en'];
        }
      }
      
      return {
        message: response,
        intent: intent,
        language: language,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Chatbot error:', error);
      
      const errorMessages = {
        en: "I'm sorry, I encountered an error. Please try asking your question again.",
        hi: "मुझे खेद है, मुझे एक त्रुटि का सामना करना पड़ा। कृपया अपना प्रश्न फिर से पूछें।",
        pa: "ਮੈਨੂੰ ਮਾਫ਼ ਕਰਨਾ, ਮੈਨੂੰ ਇੱਕ ਗਲਤੀ ਦਾ ਸਾਹਮਣਾ ਕਰਨਾ ਪਿਆ। ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਸਵਾਲ ਦੁਬਾਰਾ ਪੁੱਛੋ।",
        ta: "மன்னிக்கவும், நான் ஒரு பிழையை சந்தித்தேன். தயவு செய்து உங்கள் கேள்வியை மீண்டும் கேளுங்கள்.",
        bn: "আমি দুঃখিত, আমি একটি ত্রুটির সম্মুখীন হয়েছি। অনুগ্রহ করে আপনার প্রশ্ন আবার জিজ্ঞাসা করুন।",
        gu: "મારી માફી, મને ત્રુટિનો સામનો કરવો પડ્યો. કૃપયા કરીને તમારો પ્રશ્ન ફરીથી પૂછો."
      };
      
      return {
        message: errorMessages[language] || errorMessages['en'],
        intent: 'error',
        language: language,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = new ChatbotService();
