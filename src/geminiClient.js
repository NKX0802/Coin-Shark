import { GoogleGenAI } from "@google/genai";

// Saving the contact of GoogleGenAI
const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

export async function suggestCategory(description) {
  const prompt = `You are an expense category classifier.

Categorize this expense into EXACTLY ONE of these categories:
- Food & Drink
- Transport
- Shopping
- Bills & Utilities
- Entertainment
- Health
- Groceries
- Other

Expense description: "${description}"

Reply ONLY with valid JSON in this exact format, nothing else:
{"category": "Food & Drink"}

If unsure, use "Other". Do not invent new categories.`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite",
    // Message to AI
    contents: prompt,
  });

  // Clean and parse the AI's reply
  let text = response.text.trim();

  // Remove ```json ... ``` wrapper if Gemini added one
  text = text
    .replace(/^```json\s*/i, "")
    .replace(/```$/i, "")
    // Delete empty spaces
    .trim();

  // Change Text to Object
  // ('{"category": "Food & Drink"}') to (Label: category -> Value: Food & Drink)
  const parsed = JSON.parse(text);

  return parsed.category;
}

export async function analyzeSpending(expenses) {
  const prompt = `You are a friendly financial coach analyzing someone's spending habits.

Look at their expenses and identify spending patterns (which categories they spend the most on).

Give 3 SHORT money-saving tips based on THEIR ACTUAL SPENDING PATTERNS.

Each tip MUST be:
- MAXIMUM 1 sentence (under 15 words)
- Easy to understand
- Actionable today
- Based on actual spending

Expenses:
${JSON.stringify(expenses)}

Reply ONLY with valid JSON, nothing else:
{"tips": ["tip 1", "tip 2", "tip 3"]}`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite",
    // Message to AI
    contents: prompt,
  });

  // Clean and parse the AI's reply
  let text = response.text.trim();

  // Remove ```json ... ``` wrapper if Gemini added one
  text = text
    .replace(/^```json\s*/i, "")
    .replace(/```$/i, "")
    // Delete empty spaces
    .trim();

  // Change Text to Object
  // ('{"category": "Food & Drink"}') to (Label: category -> Value: Food & Drink)
  const parsed = JSON.parse(text);

  return parsed.tips;
}
