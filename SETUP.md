# StyleSync 2.0 - AI Features Setup Guide

## 🚀 New Features Added

### 1. 🤖 AI Chatbot

- **Smart Auto-Answers**: Pre-programmed responses for common questions (shipping, returns, sizes, payment, etc.)
- **Business Hours Logic**: Automatically shows "offline" message outside 10:00-19:00 (Georgian time)
- **AI-Powered Responses**: Uses OpenAI GPT-3.5 for complex questions
- **Multi-language Support**: Works in both Georgian and English
- **Floating Chat Button**: Replaces the Instagram floating button

### 2. 👗 AI Outfit Generation

- **Style-based Generation**: Create outfits based on casual, streetwear, sporty, or elegant styles
- **Product Matching**: AI analyzes your existing products and creates coordinated outfits
- **Color Coordination**: Smart matching based on product categories and styles
- **Price Calculation**: Shows total outfit cost
- **Product Links**: Direct links to view each outfit item

## 📋 Setup Requirements

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in your project root with:

```env
# Email Configuration (for contact form)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# OpenAI API Key (REQUIRED for AI features)
OPENAI_API_KEY=your-openai-api-key-here

# Instagram URL (optional)
INSTAGRAM_URL=https://www.instagram.com/stylesyncgeorgia/

# Server Port (optional, defaults to 3000)
PORT=3000
```

### 3. Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Create an API key
4. Add it to your `.env` file

## 🔧 How It Works

### Chatbot Logic

1. **Business Hours Check**: First checks if current time is between 10:00-19:00 (Georgian timezone)
2. **Auto-Answers**: Looks for keywords in user messages and provides instant responses
3. **AI Fallback**: If no auto-answer matches, uses OpenAI to generate a response
4. **Offline Mode**: Outside business hours, shows offline message

### Outfit Generation

1. **Product Analysis**: Analyzes your existing product catalog
2. **Style Selection**: User chooses desired style (casual, streetwear, sporty, elegant)
3. **AI Coordination**: OpenAI creates outfit combinations considering:
   - Color matching
   - Style compatibility
   - Seasonal appropriateness
   - Product availability
4. **Visual Display**: Shows outfit with images, prices, and styling tips

## 🎯 Usage

### Chatbot

- Click the floating chat button (bottom right)
- Ask questions about shipping, returns, sizes, etc.
- Get instant responses or AI-generated answers
- Automatically shows offline status outside business hours

### Outfit Generation

- Go to any product page
- Scroll to "AI Style Assistant" section
- Choose your preferred style
- Click "Generate Outfit"
- View AI-created outfit with styling tips

## 🌐 Language Support

- **Georgian (ka)**: Default language
- **English (en)**: Available via language switcher
- **Automatic**: Chatbot and outfit generation respond in user's selected language

## 📱 Responsive Design

- Mobile-friendly chatbot interface
- Responsive outfit display
- Touch-optimized controls

## 🚨 Troubleshooting

### Chatbot Not Working

- Check if OpenAI API key is set correctly
- Verify business hours logic (Georgian timezone)
- Check browser console for errors

### Outfit Generation Fails

- Ensure products.json has valid product data
- Check OpenAI API key and quota
- Verify product images are accessible

### API Errors

- Check network connectivity
- Verify API endpoints are working
- Check server logs for detailed errors

## 🔒 Security Notes

- OpenAI API key is stored server-side only
- No sensitive data is exposed to client
- Business hours logic runs server-side
- Input validation on all API endpoints

## 📈 Future Enhancements

- **Personalization**: Remember user preferences
- **Advanced Styling**: More sophisticated outfit algorithms
- **Inventory Integration**: Real-time stock checking
- **Analytics**: Track popular questions and outfit requests
- **Multi-modal AI**: Image-based outfit suggestions

## 🆘 Support

If you encounter issues:

1. Check the browser console for errors
2. Verify all environment variables are set
3. Ensure OpenAI API has sufficient credits
4. Check server logs for detailed error messages

---

**Note**: The AI features require an active OpenAI API key and internet connection to function properly.
