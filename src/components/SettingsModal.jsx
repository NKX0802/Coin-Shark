import { useState } from "react";
import { Save, X } from "lucide-react";
import { toast } from "sonner";

const SettingsModal = ({ onClose, expensePerPage, setExpensePerPage }) => {
  const [draftValue, setDraftValue] = useState(expensePerPage);

  const handleSave = () => {
    const value = Number(draftValue);
    const finalValue = !value || value < 5 ? 5 : value;

    setExpensePerPage(finalValue);
    toast.success(
      finalValue !== value ? "Below min, set to default 5" : "Settings saved",
    );
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 sm:px-0"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-2xl w-full sm:w-full max-w-md gap-5 p-6 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-row justify-between items-center">
          <span className="text-lg sm:text-2xl text-ink">Settings</span>
          <button onClick={onClose}>
            <div className="text-gray-500 bg-transparent p-2 rounded-xl will-change-transform transition duration-600 hover:text-danger hover:bg-danger/10 hover:rotate-90 hover:scale-105 active:scale-95 cursor-pointer">
              <X className="size-4 sm:size-5" strokeWidth={3} />
            </div>
          </button>
        </div>

        <div className="flex flex-col">
          <label className="text-sm sm:text-md text-gray-500 mb-2">
            Expenses per page (min 5)
          </label>
          <div className="flex flex-row gap-3">
            <input
              type="number"
              min={5}
              value={draftValue}
              onChange={(e) => setDraftValue(e.target.value)}
              className="flex-1 rounded-2xl px-4 py-2.5 border-gray-300 text-sm sm:text-md text-ink outline-hidden focus:border-accent border-2"
            />
            <button
              onClick={handleSave}
              className="bg-accent flex items-center justify-center rounded-2xl p-3 transition-all will-change-transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Save className="size-5 text-white" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
