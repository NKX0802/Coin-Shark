import { useState } from "react";
import { supabase } from "../supabaseClient";
import { runAgent } from "../geminiClient";
import { STEP_LABELS } from "../agentTools";
import { toast } from "sonner";
import { Bot, MessageCircle, Send, Trash2, X } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

const ChatWidget = ({
  userId,
  onExpenseAdded,
  onExpenseUpdated,
  onExpenseDeleted,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(null);
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

    // Past messages only — runAgent appends the new one itself
    const historyToSend = messages.slice(-20);

    try {
      // The agent decides what to do, does it, and writes the reply itself
      const result = await runAgent(
        text,
        historyToSend,
        {
          userId,
          // Wrap each callback so the toast fires the moment the row changes,
          // then pass it on to Dashboard to refresh the table
          onExpenseAdded: (row) => {
            onExpenseAdded?.(row);
            toast.success("Expense added!");
          },
          onExpenseUpdated: (row) => {
            onExpenseUpdated?.(row);
            toast.success("Expense updated!");
          },
          onExpenseDeleted: (id) => {
            onExpenseDeleted?.(id);
            toast.success("Expense deleted!");
          },
        },
        (toolName) => setStep(STEP_LABELS[toolName]),
      );

      setMessages((prev) => [
        ...prev,
        { from: "bot", text: result.text || "I couldn't quite catch that." },
      ]);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Sorry — I hit an error. Try again?" },
      ]);
    } finally {
      // Runs whether the agent succeeded or threw — no more stuck spinner
      setLoading(false);
      setStep(null);
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
                {step && (
                  <span className="text-xs text-gray-500">{step}</span>
                )}
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
