<div align="center">

# **🦈 Coin Shark**

### An AI-powered expense tracker that helps you manage spending and get personalized money-saving tips.

🔗 **[Live Demo](https://coin-shark.vercel.app)**

<br>

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-20232A?style=for-the-badge&logo=tailwind-css&logoColor=38B2AC)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Google Gemini](https://img.shields.io/badge/Google%20Gemini-4285F4?style=for-the-badge&logo=googlegemini&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=green)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)




</div>

---

## 📖 About

Coin Shark is a web app where users log their daily expenses and let AI analyze their spending. It automatically suggests categories for new expenses and gives 3 simple, personalized money-saving tips based on actual spending patterns.

---

## ✨ Features

- 📝 **Track expenses** — Add, view, edit, and delete your daily expenses
- 🤖 **AI auto-categorize** — Type an expense and let Gemini AI suggest the right category
- 💡 **AI money-saving tips** — Get 3 personalized tips based on your spending habits
- 📊 **Visual dashboard** — See total spending, averages, and a breakdown by category
- 🔐 **Secure login** — Sign in with email or Google
- 📱 **Responsive** — Works on both phone and desktop

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
   \`\`\`bash
   git clone https://github.com/YOUR_USERNAME/coin-shark.git
   cd coin-shark
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables** (see Configuration below)

4. **Run the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

5. Open your browser at \`http://localhost:5173\`

---

## ⚙️ Configuration

Create a \`.env\` file in the root folder and add your keys:

\`\`\`env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
\`\`\`

> ⚠️ **Never commit your \`.env\` file to GitHub.** Make sure \`.env\` is listed in your \`.gitignore\`.

---

## 🚸 How to Use

1. **Sign up / Sign in** with email or Google
2. **Add an expense** — fill in the description, amount, date, and category
3. **Use "Suggest with AI"** to let Gemini pick a category for you
4. **View your dashboard** — see totals, averages, and your top spending categories
5. **Click "Analyze my spending"** to get 3 AI-generated money-saving tips

---

## 🐛 Future Improvements

- 📅 **Filter by month** — View expenses by time period (day, week, month, or year).
- 💵 **Budget goals** — Set a monthly limit and track progress
- 📤 **Export to CSV** — Download your expenses as a spreadsheet

---

## 📜 License

This project is licensed under the MIT License — feel free to use and modify it.
