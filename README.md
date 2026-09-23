<div align="center">

# **🦈 Coin Shark**

### An AI-powered expense tracker with a chat agent that adds, finds, edits and deletes your expenses for you.

🔗 **[Live Demo](https://coin-shark.vercel.app)**

<br>

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-20232A?style=for-the-badge&logo=tailwind-css&logoColor=38B2AC)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Google Gemini](https://img.shields.io/badge/Google%20Gemini-4285F4?style=for-the-badge&logo=googlegemini&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000?style=for-the-badge&logo=shadcnui&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=green)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)




</div>

---

## 📖 About

Coin Shark is a web app where users log their daily expenses and let AI analyze their spending. It automatically suggests categories for new expenses and gives 3 simple, personalized money-saving tips based on actual spending patterns.

It also ships a **chat agent** — not a chatbot that parses one command, but a real tool-calling loop. Ask it to *"delete my lunch"* and it searches your expenses, reads the result, finds the right row, and deletes it. Multi-step, no hardcoded `if/else`.

---

## ✨ Features

- 💬 **AI chat agent** — Manage expenses by chatting: *"20 on lunch today"*, *"how much this week?"*, *"delete my taxi"*
- 📝 **Track expenses** — Add, view, edit, and delete your daily expenses
- 🤖 **AI auto-categorize** — Type an expense and let Gemini AI suggest the right category
- 💡 **AI money-saving tips** — Get 3 personalized tips based on your spending habits
- 📊 **Visual dashboard** — See total spending, averages, and a breakdown by category
- 📄 **Pagination** — Browse your expenses page by page, with a customizable page size in Settings
- 🌙 **Dark mode** — Toggle between light and dark themes, saved across sessions
- 🔐 **Secure login** — Sign in with email or Google
- 📱 **Responsive** — Works on both phone and desktop

---

## 🤖 How the Chat Agent Works

Most AI chat features parse one message, run one action, and stop. This one runs a **loop**, so the model can act on what its own tools return.

```
You: "delete my lunch"

  turn 0  →  search_expenses({ searchText: "lunch" })
            ↓ returns 2 rows, with their real ids
  turn 1  →  no tool call — the model asks "which one?"
            ↓ you click a row, or reply "the mamak one"
  turn 2  →  delete_expense({ id: "a3f8…" })
  turn 3  →  "Deleted your RM15 lunch."   ← no tool call, loop exits
```

The key step is turn 1. After each tool runs, the call **and its result** are pushed back into the conversation, so the next turn the model can see the ids it just found. Without that feedback it would have to guess an id — and guessing is how you delete the wrong row.

### The four tools

| Tool | Does |
|------|------|
| `search_expenses` | Filter by text, category and time range. Returns rows **with ids**, plus a count and total. |
| `add_expense` | Insert a new expense. |
| `update_expense` | Change only the fields the user actually mentioned. |
| `delete_expense` | Delete one expense by id. |

### Design decisions

- **Every write is scoped to the user** — `update` and `delete` filter on `user_id` as well as `id`, so a hallucinated id can never touch another user's row.
- **Totals are computed in JavaScript, not by the model** — LLMs are unreliable at arithmetic. The tool sums the rows and the system prompt tells the model to quote that number exactly.
- **Tool errors are returned, not thrown** — a failure comes back as `{ error: "…" }` so the model can read it and explain what went wrong instead of the loop dying.
- **Row payloads are trimmed** before they reach the model. `contents` is resent every turn, so trimming compounds.
- **Hard 6-turn cap**, so a confused model can't loop forever on your API quota.

### Where it lives

| File | Role |
|------|------|
| `src/agentTools.js` | The hands — tool implementations that talk to Supabase |
| `src/geminiClient.js` | The brain — tool declarations, system prompt, and the `runAgent` loop |
| `src/components/ChatWidget.jsx` | The mouth — chat UI, progress labels, clickable result rows |

---

## 🗄️ Database Schema

The app uses a single \`expenses\` table in Supabase:

| Column | Type | Description |
|--------|------|-------------|
| \`id\` | uuid | Primary key (auto-generated) |
| \`user_id\` | uuid | Links the expense to the logged-in user |
| \`description\` | text | What the expense was for |
| \`amount\` | numeric | How much was spent |
| \`category\` | text | Spending category (e.g. Food & Drink) |
| \`date\` | date | When the expense happened |
| \`created_at\` | timestamptz | When the row was created (auto-generated) |

> 🔒 **Row Level Security (RLS)** is enabled so users can only read, edit, and delete their own expenses.

---

## 🚀 Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- A [Supabase](https://supabase.com/) account
- A [Google Gemini API key](https://ai.google.dev/)

### Steps

1. **Clone the repository**
```bash
   git clone https://github.com/YOUR_USERNAME/coin-shark.git
   cd coin-shark
```
2. **Install dependencies**
```bash
   npm install
```
3. **Set up environment variables** (see Configuration below)
4. **Run the development server**
```bash
   npm run dev
```
5. Open your browser at `http://localhost:5173`

---

## ⚙️ Configuration

Create a `.env` file in the root folder and add your keys:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

> ⚠️ **Never commit your `.env` file to GitHub.** Make sure `.env` is listed in your `.gitignore`.

---

## 🚸 How to Use

1. **Sign up / Sign in** with email or Google
2. **Add an expense** — fill in the description, amount, date, and category
3. **Use "Suggest with AI"** to let Gemini pick a category for you
4. **View your dashboard** — see totals, averages, and your top spending categories
5. **Click "Analyze my spending"** to get 3 AI-generated money-saving tips
6. **Open the chat bubble** (bottom right) and just talk to it:
   - `20 on lunch today` — adds it
   - `how much did I spend this week?` — searches and totals
   - `delete my taxi ride` — finds it, asks if there are several, then deletes
   - `change that lunch to 25` — finds it and updates the amount

---

## 🐛 Future Improvements

- 📅 **Filter by time period** — View expenses by day, week, month, or year
- 💵 **Budget goals** — Set a monthly limit and track progress
- 📤 **Export to CSV** — Download your expenses as a spreadsheet
- 🗣️ **Voice input for the chat agent** — Log an expense without typing

---

## 📜 License

This project is licensed under the MIT License — feel free to use and modify it.
