import { useState } from "react";
import { supabase } from "../supabaseClient";
import { parseExpenseFromChat } from "../geminiClient";
import { toast } from "sonner";
import { Bot, MessageCircle, Send, Trash2, X } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import {
  isToday,
  isYesterday,
  isSameWeek,
  isSameMonth,
  subWeeks,
  subMonths,
} from "date-fns";

const ChatWidget = ({ userId, onExpenseAdded, onExpenseDeleted }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    //The first message in the chat widget
    {
      from: "bot",
      text: 'Tell me about an expense, e.g. "20 on lunch today".',
    },
  ]);

  const handleSend = async () => {
    const text = input.trim();
    // If no input then nothing happen
    if (!text) return;

    // Show the user's own message immediately
    setMessages((prev) => [...prev, { from: "user", text }]);
    // Back to Empty
    setInput("");
    setLoading(true);

    //{ from: "users", text } add the user latest message
    const historyToSend = [...messages, { from: "user", text }].slice(-20);

    // Ask Gemini what the user meant — could be add, delete, or plain chat
    const result = await parseExpenseFromChat(text, historyToSend);

    const today = new Date();

    const matchesTimeRange = (expenseDateStr, timeRange) => {
      const expenseDate = new Date(expenseDateStr);

      if (timeRange === "today") return isToday(expenseDate);
      if (timeRange === "yesterday") return isYesterday(expenseDate);
      if (timeRange === "this_week") return isSameWeek(expenseDate, today);
      if (timeRange === "last_week")
        return isSameWeek(expenseDate, subWeeks(today, 1));
      if (timeRange === "this_month") return isSameMonth(expenseDate, today);
      if (timeRange === "last_month")
        return isSameMonth(expenseDate, subMonths(today, 1));
      return true; // All
    };

    if (result.name === "add_expense") {
      const args = result.args;

      // Insert the parsed expense into Supabase, same shape AddExpenseModal uses
      const { data, error } = await supabase
        .from("expenses")
        .insert({
          user_id: userId,
          description: args.description,
          amount: args.amount,
          category: args.category,
          date: args.date,
        })
        .select()
        .single();

      setLoading(false);

      if (error) {
        toast.error("Failed to add expense.");
        console.error(error);
        setMessages((prev) => [
          ...prev,
          { from: "bot", text: "Something went wrong saving that expense." },
        ]);
        return;
      }

      // Tell Dashboard.jsx about the new row so the main expense table updates live
      onExpenseAdded(data);
      toast.success("Expense added!");
      // Send message after added expense
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: `Added: ${data.description} — RM ${Number(data.amount).toFixed(2)} (${data.category})`,
        },
      ]);
    } else if (result.name === "delete_expense") {
      const searchText = result.args.description;

      // Find candidate rows for this user whose description matches the text
      const { data: matches, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("user_id", userId)
        .ilike("description", `%${searchText}%`);

      setLoading(false);

      if (error) {
        toast.error("Failed to search expenses.");
        console.error(error);
        setMessages((prev) => [
          ...prev,
          { from: "bot", text: "Something went wrong looking that up." },
        ]);
        return;
      }

      // Show delete messages
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text:
            matches.length === 0
              ? `I couldn't find an expense matching "${searchText}". `
              : `Found "${matches.length} result(s) for "${searchText}"`,
          candidates: matches,
        },
      ]);
    } else if (result.name === "show_expenses") {
      const args = result.args;
      let query = supabase.from("expenses").select("*").eq("user_id", userId);

      if (args.category !== "all") {
        query = query.eq("category", args.category);
      }

      const { data, error } = await query;

      setLoading(false);

      if (error) {
        toast.error("Failed to search expenses.");
        console.error(error);
        setMessages((prev) => [
          ...prev,
          { from: "bot", text: "Something went wrong looking that up." },
        ]);
        return;
      }

      const matches = data.filter((e) =>
        matchesTimeRange(e.date, args.timeRange),
      );

      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text:
            matches.length === 0
              ? `No expenses found for category "${args.category}" and time range "${args.timeRange}".`
              : `Found ${matches.length} expense(s):`,
          candidates: matches,
          readOnly: true,
        },
      ]);
    } else {
      // Gemini didn't call a tool — just show its plain text reply
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: result.text || "I couldn't quite catch that." },
      ]);
      setLoading(false);
    }
  };

  const handleDeleteCandidate = async (expense) => {
    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", expense.id);

    if (error) {
      toast.error("Failed to delete expense.");
      console.error(error);
      return;
    }

    toast.success("Expense Deleted!");
    onExpenseDeleted(expense.id);
    setMessages((prev) => [
      ...prev,
      {
        from: "bot",
        text: `Deleted: ${expense.description} - RM ${Number(expense.amount).toFixed(2)}`,
      },
    ]);
  };

  // Pressing Enter acts like clicking Send (but only if not already sending)
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !loading) {
      handleSend();
    }
  };

  return (
    <>
      {/* Floating bubble button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 p-4 bg-accent text-white rounded-full shadow-lg will-change-transform transition-all duration-500 hover:scale-105 active:scale-95 cursor-pointer z-30"
      >
        {isOpen ? (
          <X size={24} strokeWidth={2.5} />
        ) : (
          <MessageCircle size={24} strokeWidth={2.5} />
        )}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-155 max-w-[90vw] h-101 bg-card rounded-2xl shadow-xl border border-gray-200 flex flex-col overflow-hidden z-30">
          {/* Header */}
          <div className="flex items-center gap-2 p-4 bg-accent text-white">
            <Bot size={20} strokeWidth={2.5} />
            <span className="text-md font-medium">Add expense by chat</span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm flex flex-col gap-2 ${
                  msg.from === "user"
                    ? "self-end bg-accent text-white"
                    : "self-start bg-soft text-ink"
                }`}
              >
                <span>{msg.text}</span>

                {/* If this message carries candidate rows, show one row per expense with a delete button */}
                {msg.candidates && (
                  <div className="flex flex-col gap-1.5">
                    {msg.candidates.map((expense) => (
                      <div
                        key={expense.id}
                        className="flex items-center justify-between gap-2 bg-card rounded-xl px-2.5 py-1.5"
                      >
                        <div className="flex flex-col leading-tight">
                          <span className="text-ink">
                            {expense.description}
                          </span>
                          <span className="text-xs text-gray-500">
                            RM {Number(expense.amount).toFixed(2)} —{" "}
                            {expense.date}
                          </span>
                        </div>

                        {!msg.readOnly && (
                          <button
                            onClick={() => handleDeleteCandidate(expense)}
                            className="p-1.5 text-danger rounded-lg hover:bg-danger/10 cursor-pointer"
                          >
                            <Trash2 size={16} strokeWidth={2.5} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="self-start flex items-center gap-2 px-3 py-2">
                <Spinner className="size-4" strokeWidth={4} />
              </div>
            )}
          </div>

          {/* Input row */}
          <div className="flex items-center gap-2 p-3 border-t border-gray-200">
            <input
              type="text"
              className="flex-1 text-sm border-2 border-gray-300 rounded-2xl px-3 py-2 outline-none focus:border-accent transition duration-300 text-ink"
              placeholder="I spent 20 on lunch..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading}
              className="p-2.5 bg-accent text-white rounded-2xl will-change-transform transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-60"
            >
              <Send size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
