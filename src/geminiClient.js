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

// Add expense tool for gemini to use
const addExpenseFunction = {
  name: "add_expense",
  description:
    "Add a new expense record when the user mentions spending money, buying something or paying for something.",
  parameters: {
    type: "object",
    properties: {
      description: {
        type: "string",
        description:
          "A short label for what the expense was for, e.g. 'Lunch', 'Groceries','Taxi ride'",
      },
      amount: {
        type: "number",
        description:
          "Amount for the expenses cost with 2 decimal only, e.g. '15.00','5.50','30.90'",
      },
      category: {
        type: "string",
        enum: [
          "Food & Drink",
          "Transport",
          "Shopping",
          "Bills & Utilities",
          "Entertainment",
          "Health",
          "Groceries",
          "Other",
        ],
      },
      date: {
        type: "string",
        description:
          "The date of the expense in YYYY-MM-DD format, e.g. '2026-09-04'. Resolve relative terms like 'today' or 'yesterday' using the current date provided in context.",
      },
    },
    required: ["description", "amount", "category", "date"],
  },
};

const showExpenseFunction = {
  name: "show_expenses",
  description:
    "Show the user's expenses, filtered by time range and/or category, when the user asks to see or list their expenses.",
  parameters: {
    type: "object",
    properties: {
      timeRange: {
        type: "string",
        enum: [
          "today",
          "yesterday",
          "this_week",
          "last_week",
          "this_month",
          "last_month",
          "all",
        ],
        description:
          "The time period to filter expenses by. Use 'all' if the user doesn't mention a specific time period.",
      },
      category: {
        type: "string",
        enum: [
          "Food & Drink",
          "Transport",
          "Shopping",
          "Bills & Utilities",
          "Entertainment",
          "Health",
          "Groceries",
          "Other",
          "all",
        ],
        description:
          "The expense category to filter by. Use 'all' if the user doesn't mention a specific category.",
      },
    },
    required: ["timeRange", "category"],
  },
};

// Delete tool for the gemini to use
const deleteExpenseFunction = {
  name: "delete_expense",
  description:
    "Delete an expense record when the user asks to delete or remove an expense they previously logged.",
  parameters: {
    type: "object",
    properties: {
      description: {
        type: "string",
        description:
          "Text describing which expense to delete, taken from the user's own words, e.g. 'lunch', 'taxi ride'",
      },
    },
    required: ["description"],
  },
};

export async function parseExpenseFromChat(message, history = []) {
  // To remember chat history
  const historyText = history
    .filter((m) => m.text)
    .map((m) => `${m.from === "user" ? "User" : "Bot"}: ${m.text}`)
    .join("\n");
  // Give some Info and chat history to the gemini
  const contents = `Today's date is ${new Date().toISOString().split("T")[0]}.\nRecent conversation: ${historyText}\nUser message: "${message}"`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite",
    contents: contents,
    config: {
      // Which tools can use
      tools: [
        {
          functionDeclarations: [
            addExpenseFunction,
            deleteExpenseFunction,
            showExpenseFunction,
          ],
        },
      ],
    },
  });

  const call = response.functionCalls?.[0];
  // Response normally
  if (!call) {
    return { name: "chat", text: response.text };
  }
  return { name: call.name, args: call.args };
}
