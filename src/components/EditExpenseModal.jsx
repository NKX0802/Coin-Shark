import { supabase } from "../supabaseClient";
import { toast } from "sonner";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Bot, X } from "lucide-react";
import { suggestCategory } from "../geminiClient";

const CATEGORIES = [
  { label: "Food & Drink", color: "#3b82f6" },
  { label: "Transport", color: "#10b981" },
  { label: "Shopping", color: "#e8703a" },
  { label: "Bills & Utilities", color: "#eab308" },
  { label: "Entertainment", color: "#a855f7" },
  { label: "Health", color: "#ef4444" },
  { label: "Groceries", color: "#14b8a6" },
  { label: "Other", color: "#6b7280" },
];

const EditExpenseModal = ({
  onClose,
  selectedCategory,
  setSelectedCategory,
  onExpenseUpdated,
  expenseToEdit,
}) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  // new Date() gets today's date
  // format() converts it to "yyyy-MM-dd" string for the date input
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [loading, setLoading] = useState(false);
  const [suggestingCategory, setSuggestingCategory] = useState(false);

  useEffect(() => {
    if (expenseToEdit) {
      setDescription(expenseToEdit.description);
      setAmount(String(expenseToEdit.amount));
      setSelectedCategory(expenseToEdit.category);
      setDate(expenseToEdit.date);
    }
  }, [expenseToEdit, setSelectedCategory]);

  const handleEditExpense = async () => {
    if (!description.trim()) {
      toast.error("Please enter a description");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid number");
      return;
    }

    setLoading(true);

    // The type="number" is actually giving back string
    // parseFloat can make string to number
    // .toFixed will make the output be string
    // Number make the string to number again
    const roundedAmount = Number(parseFloat(amount).toFixed(2));

    // Insert into supabase
    const { data, error } = await supabase
      .from("expenses")
      .update({
        description: description,
        amount: roundedAmount,
        category: selectedCategory,
        date: date,
      })
      .eq("id", expenseToEdit.id)
      // Send back the row created
      .select()
      // Unwrap the array
      .single();

    setLoading(false);

    // Handle result
    if (error) {
      toast.error("Fail update expense.");
      console.error(error);
      return;
    }

    onExpenseUpdated(data);
    toast.success("Expense updated!");
    onClose();
  };

  const handleSuggestCategory = async () => {
    if (!description.trim()) {
      toast.error("Please enter a Description");
      return;
    }

    setSuggestingCategory(true);
    try {
      const suggestedCategory = await suggestCategory(description);
      setSelectedCategory(suggestedCategory);
      toast.success(`Suggested: ${suggestedCategory}`);
    } catch (error) {
      console.error("Error suggesting category:", error);
      toast.error("Failed to get AI category suggestion");
    } finally {
      setSuggestingCategory(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 sm:px-0"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-2xl p-6 w-full max-w-md shadow-xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title + X */}
        <div className="flex flex-row justify-between items-center">
          <span className="text-xl font-semibold text-ink">Edit expense</span>
          <button onClick={onClose}>
            <div className="text-gray-500 bg-transparent p-2 rounded-2xl will-change-transform transition duration-300 hover:text-danger hover:bg-danger/10 hover:rotate-90 hover:scale-105 active:scale-95 cursor-pointer">
              <X size={20} strokeWidth={3} />
            </div>
          </button>
        </div>
        {/* Name */}
        <div className="flex flex-col gap-2">
          <span className="text-sm text-ink">Description</span>
          <input
            className="border-3 border-gray-300 rounded-2xl p-3 hover:border-gray-400 focus:border-accent outline-none transition duration-300 text-ink"
            type="text"
            placeholder="e.g. Breakfast at Mcdonald"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="flex flex-row gap-2">
          {/* Amount */}
          <div className="flex flex-col gap-2 w-1/2">
            <span className="text-sm text-ink">Amount (RM)</span>
            <input
              className="border-3 border-gray-300 rounded-2xl p-3 hover:border-gray-400 focus:border-accent outline-none transition duration-300 text-ink appearance-none"
              type="number"
              min={0}
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {/* Date */}
          <div className="flex flex-col gap-2  w-1/2">
            <span className="text-sm text-ink">Date</span>
            <input
              className="border-3 border-gray-300 rounded-2xl p-3 hover:border-gray-400 focus:border-accent outline-none transition duration-300 text-ink appearance-none"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>
        {/* Category label + AI button */}
        <div className="flex flex-row justify-between items-center">
          <span className="text-sm text-ink">Category</span>
          <button
            className="border py-2 px-2.5 flex flex-row gap-1.5 rounded-2xl text-accent bg-soft border-accent will-change-transform transition duration-300 hover:scale-105 active:scale-95 cursor-pointer text-sm disabled:opacity-60"
            disabled={suggestingCategory}
            onClick={handleSuggestCategory}
          >
            <Bot size={18} strokeWidth={2.5} />
            <span>Suggest with AI</span>
          </button>
        </div>
        {/* Category grid */}
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.label}
              onClick={() => setSelectedCategory(cat.label)}
              className={`flex items-center gap-2 p-3 border-3 rounded-2xl transition duration-200 cursor-pointer ${
                selectedCategory === cat.label
                  ? "border-accent bg-soft text-accent"
                  : "border-gray-300 text-ink hover:border-gray-400 hover:bg-accent/5"
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              {cat.label}
            </button>
          ))}
        </div>
        {/* Cancel + Add buttons */}
        <div className="flex justify-end gap-3 pt-1">
          <button
            onClick={handleEditExpense}
            disabled={loading}
            className="px-5 py-2.5 rounded-2xl bg-accent will-change-transform text-white hover:brightness-105 cursor-pointer transition duration-300 hover:scale-105 active:scale-95 shadow-accent shadow-xs disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditExpenseModal;
