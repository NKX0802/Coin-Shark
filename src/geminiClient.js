import { toolImpl } from "./agentTools";
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

// Search tool for the gemini to use
const searchExpensesFunction = {
  name: "search_expenses",
  description:
    "Search the user's expenses by description text, category and/or time range. " +
    "Returns the matching rows WITH their ids, plus the count and total. " +
    "You MUST call this first to get a real id before updating or deleting an expense.",
  parameters: {
    type: "object",
    properties: {
      searchText: {
        type: "string",
        description:
          "Text to match against the expense description, e.g. 'lunch', 'taxi'. Omit to match all descriptions.",
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
          "The expense category to filter by. Omit or use 'all' for no category filter.",
      },
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
          "The time period to filter by. Omit or use 'all' for no time filter.",
      },
    },
  },
};

// Delete tool for the gemini to use
const deleteExpenseFunction = {
  name: "delete_expense",
  description:
    "Delete one expense by its id. The id MUST come from a previous search_expenses result — never guess an id.",
  parameters: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description:
          "The id of the expense to delete, taken from a search_expenses result.",
      },
    },
    required: ["id"],
  },
};

// Update tool
const updateExpenseFunction = {
  name: "update_expense",
  description:
    "Change one or more fields of an existing expense. The id MUST come from a previous search_expenses result. Only include the fields the user actually wants changed.",
  parameters: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description:
          "The id of the expense to update, taken from a search_expenses result",
      },
      description: {
        type: "string",
        description:
          "The name of the expenses, change the name of the expenses if the user mentioned, if the user did not mention just use the original description.",
      },
      amount: {
        type: "number",
        description:
          "The amount spend of the expenses, change the amount of the expenses if the user mentioned, if the user did not mention just use the original amount.",
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
      date: { type: "string", description: "YYYY-MM-DD" },
    },
    required: ["id"],
  },
};

const SYSTEM = `You are a friendly expense assistant for a Malaysian user (currency RM).

Rules:
- To delete or update an expense, ALWAYS call search_expenses first to get the real id. Never invent an id.
- If search returns multiple matches, list them and ASK which one the user means. Do not guess.
- If search returns nothing, say so and offer to widen the search.
- When reporting a total, quote the "total" field from the tool result exactly. Never do arithmetic yourself.
- After a tool succeeds, confirm in one short friendly sentence.
- If a tool returns an error, explain plainly what went wrong.
- Never invent expenses. Only mention what the tools returned.`;

export async function runAgent(userMessage, history, ctx, onStep) {
  // Gemini requires the conversation to start with a user turn, so drop the
  // opening bot greeting (and anything before the first real user message)
  const past = history.filter((m) => m.text);
  const firstUser = past.findIndex((m) => m.from === "user");

  const contents = [
    ...(firstUser === -1 ? [] : past.slice(firstUser)).map((m) => ({
      role: m.from === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    })),
    { role: "user", parts: [{ text: userMessage }] },
  ];

  for (let turn = 0; turn < 6; turn++) {
    console.log(`[agent] turn ${turn}, contents:`, JSON.stringify(contents));
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents,
      config: {
        systemInstruction: `${SYSTEM}\nToday's date is ${new Date().toISOString().split("T")[0]}.`,
        tools: [
          {
            functionDeclarations: [
              addExpenseFunction,
              searchExpensesFunction,
              updateExpenseFunction,
              deleteExpenseFunction,
            ],
          },
        ],
      },
    });

    const calls = response.functionCalls;
    if (!calls?.length) return { text: response.text };

    const results = await Promise.all(
      calls.map(async (c) => {
        onStep?.(c.name);
        const fn = toolImpl[c.name];
        let out;
        try {
          out = fn
            ? await fn(c.args, ctx)
            : { error: `Unknown tool ${c.name}` };
        } catch (err) {
          // A tool that throws shouldn't kill the loop — let the model see it
          console.error(`Tool ${c.name} threw:`, err);
          out = { error: String(err?.message || err) };
        }
        console.log(`[agent] ${c.name}`, c.args, "→", out);
        return { name: c.name, response: out };
      }),
    );

    // THE FEEDBACK — the model sees its own calls and what they returned.
    // Push back the model's ORIGINAL parts, not a rebuilt copy: Gemini 3 signs
    // each functionCall with a thoughtSignature and rejects calls missing it.
    const modelParts = response.candidates?.[0]?.content?.parts;
    contents.push({
      role: "model",
      parts: modelParts?.length
        ? modelParts
        : calls.map((c) => ({ functionCall: c })),
    });
    contents.push({
      role: "user",
      parts: results.map((r) => ({ functionResponse: r })),
    });
    // Part 3 goes here — run the tools, push the feedback
  }

  return { text: "That took too many steps — could you rephrase?" };
}
