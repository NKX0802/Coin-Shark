import { X, Lightbulb } from "lucide-react";

const AnalysisTipsModal = ({ onClose, tips }) => {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 sm:px-0"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-2xl w-full sm:w-5xl shadow-xl px-5 sm:px-10 py-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-row justify-between items-center p-5 mb-3">
          <div className="flex items-center gap-5 -ml-5">
            <div className="p-2.5 bg-soft rounded-2xl">
              <Lightbulb
                className="text-accent size-7 sm:size-9"
                strokeWidth={2}
              />
            </div>
            <span className="text-xl sm:text-3xl font-semibold text-ink">
              Tips
            </span>
          </div>
          <button onClick={onClose}>
            <div className="text-gray-500 bg-transparent p-2 rounded-2xl will-change-transform transition duration-300 hover:text-danger hover:bg-danger/10 hover:rotate-90 hover:scale-105 active:scale-95 cursor-pointer">
              <X className="size-6 sm:size-8" strokeWidth={3} />
            </div>
          </button>
        </div>
        <div className="flex flex-col gap-4">
          {tips.map((tip, index) => (
            <div
              key={index}
              className="rounded-2xl border-4 border-accent bg-soft p-5"
            >
              <div className="flex gap-5">
                <span className="text-accent text-xl">{index + 1}</span>
                <span className="text-md sm:text-xl text-ink">{tip}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center items-center mt-5">
          <button
            className="mb-3 px-6 sm:px-10 py-3 sm:py-5 bg-accent text-white text-md sm:text-xl rounded-2xl hover:scale-105 hover:brightness-105 transition duration-300 cursor-pointer will-change-transform active:scale-95"
            onClick={onClose}
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisTipsModal;
