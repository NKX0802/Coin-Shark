import { Bot, X } from "lucide-react";

const CATEGORIES = [
  { label: "Food & Drinks", color: "#f97316" },
  { label: "Groceries", color: "#22c55e" },
  { label: "Transport", color: "#3b82f6" },
  { label: "Shopping", color: "#a855f7" },
  { label: "Bills", color: "#ef4444" },
  { label: "Entertainment", color: "#eab308" },
  { label: "Health", color: "#10b981" },
  { label: "Other", color: "#9ca3af" },
];

const EditExpenseModal = ({
  onClose,
  selectedCategory,
  setSelectedCategory,
}) => {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-2xl p-6 w-full max-w-md shadow-xl flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title + X */}
        <div className="flex flex-row justify-between items-center">
          <span className="text-xl font-semibold text-ink">Edit expense</span>
          <button onClick={onClose}>
            <div className="text-ink bg-transparent p-2 rounded-2xl will-change-transform transition duration-300 hover:text-danger hover:bg-danger/10 hover:rotate-90 hover:scale-105 active:scale-95 cursor-pointer">
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
          />
        </div>

        {/* Amount */}
        <div className="flex flex-col gap-2">
          <span className="text-sm text-ink">Amount (RM)</span>
          <input
            className="border-3 border-gray-300 rounded-2xl p-3 hover:border-gray-400 focus:border-accent outline-none transition duration-300 text-ink"
            type="number"
            min={0}
            defaultValue="0.00"
          />
        </div>

        {/* Category label + AI button */}
        <div className="flex flex-row justify-between items-center">
          <span className="text-sm text-ink">Category</span>
          <button className="border py-2 px-2.5 flex flex-row gap-1.5 rounded-2xl text-accent bg-soft border-accent will-change-transform transition duration-300 hover:scale-105 active:scale-95 cursor-pointer text-sm">
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
          <button className="px-5 py-2.5 rounded-2xl bg-accent will-change-transform text-white hover:brightness-105 cursor-pointer transition duration-300 hover:scale-105 active:scale-95 shadow-accent shadow-xs">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditExpenseModal;
