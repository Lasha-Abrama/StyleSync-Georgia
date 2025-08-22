import OpenAI from "openai";

// (client left here in case you want AI later, but unused now)
let openaiClient = null;
function getOpenAI() {
  if (!openaiClient && process.env.OPENAI_API_KEY) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

// Auto-answers for common questions
const AUTO_ANSWERS = {
  shipping: {
    ka: "🚚 უფასო მიწოდება თბილისში! სხვა ქალაქებში - 5₾. მიწოდება 1-2 სამუშაო დღეში.",
    en: "🚚 Free shipping in Tbilisi! Other cities - 5₾. Delivery in 1-2 business days.",
  },
  returns: {
    ka: "🔄 პროდუქტის დაბრუნება შესაძლებელია მხოლოდ იმ შემთხვევაში, თუ ის დაზიანებულია",
    en: "🔄 Return is only possible if the product is damaged",
  },
  sizes: {
    ka: "📏 ზომების ცხრილის მისაღებად მოგვწერეთ ინსტაგრამზე",
    en: "📏 To see the size chart, please write to Instagram",
  },
  payment: {
    ka: "💳 გადახდა შესაძლებელია მხოლოდ ონლაინ, როგორც საქართველოს ბანკის(BOG) ბარათით, ისე TBC, შესაძენად მოგვწერეთ ჩვენს ინსტაგრამ გვერდზე @stylesyncgeorgia ",
    en: "💳 Payment is only available online, via BOG Card or TBC, purchase via instagram @stylesyncgeorgia ",
  },
  instagram: {
    ka: "📱 ჩვენი Instagram: @stylesyncgeorgia - შესაკვეთად გადმოდით ინსტაგრამზე და მოგვწერეთ!",
    en: "📱 Our Instagram: @stylesyncgeorgia - to order, please go to Instagram and write to us!",
  },
  location: {
    ka: "📍 ამჟამად მხოლოდ ონლაინ მაღაზიაა ხელმისაწვდომი",
    en: "📍 Currently, only online store is available",
  },
};

const KEYWORD_SETS = {
  shipping: ["shipping", "delivery", "მიწოდება", "კურიერი"],
  returns: ["return", "refund", "returns", "დაბრუნება", "ჩანაცვლება"],
  sizes: ["size", "size chart", "sizes", "ზომა", "ზომების", "ზომების ცხრილი"],
  payment: [
    "payment",
    "pay",
    "card",
    "cash",
    "transfer",
    "გადახდა",
    "ბარათი",
    "ნაღდი",
    "თიბისი",
    "tbc",
    "საქართველო",
    "bog",
    "შეძენა",
    "გადმორიცხვა",
  ],
  instagram: ["instagram", "ig", "ინსტაგრამ", "ინსტაგრამი"],
  location: [
    "location",
    "address",
    "where",
    "store",
    "სად",
    "მისამართი",
    "მაღაზია",
  ],
};

function includesAny(message, variants) {
  return variants.some((v) => message.includes(v));
}

function getCurrentTime() {
  return new Date().toLocaleString("en-US", {
    timeZone: "Asia/Tbilisi",
    hour12: false,
  });
}

// ------------------- MAIN -------------------
export async function processMessage(userMessage, language = "ka") {
  const message = userMessage.toLowerCase().trim();

  // --- Auto answers ---
  for (const [key, variants] of Object.entries(KEYWORD_SETS)) {
    if (includesAny(message, variants)) {
      const answer = AUTO_ANSWERS[key];
      if (answer) {
        return {
          type: "auto",
          message: answer[language],
          time: getCurrentTime(),
        };
      }
    }
  }

  // --- Greetings ---
  if (
    message.includes("hello") ||
    message.includes("hi") ||
    message.includes("გამარჯობა")
  ) {
    return {
      type: "greeting",
      message:
        language === "ka"
          ? "👋 გამარჯობა! როგორ შეგვიძლია დაგეხმაროთ?"
          : "👋 Hello! How can we help you?",
      time: getCurrentTime(),
    };
  }

  // --- Price ---
  if (
    message.includes("price") ||
    message.includes("ფასი") ||
    message.includes("ღირებულება") ||
    message.includes("cost")
  ) {
    return {
      type: "price",
      message:
        language === "ka"
          ? "💰 ყველა პროდუქტის ფასი მითითებულია ჩვენს ვებსაიტზე."
          : "💰 All product prices are listed on our website.",
      time: getCurrentTime(),
    };
  }

  // --- Outfit ---
  if (
    message.includes("outfit") ||
    message.includes("კომპლექტი") ||
    message.includes("style")
  ) {
    return {
      type: "outfit",
      message:
        language === "ka"
          ? "👗 გამოიყენეთ 'Generate Outfit' ღილაკი პროდუქტის გვერდზე."
          : "👗 Use the 'Generate Outfit' button on any product page.",
      time: getCurrentTime(),
    };
  }

  // --- Fallback (Instagram redirect) ---
  return {
    type: "fallback",
    message:
      language === "ka"
        ? "ℹ️ გთხოვთ მოგვწერეთ Instagram-ზე: @stylesyncgeorgia"
        : "ℹ️ Please text us on Instagram: @stylesyncgeorgia",
    time: getCurrentTime(),
  };
}
