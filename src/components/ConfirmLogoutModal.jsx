import { X } from "lucide-react";

const ConfirmLogoutModal = ({ onClose, onConfirm, loading }) => {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 sm:px-0"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full sm:w-full max-w-md gap-5 p-6 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className=" flex flex-row justify-between items-center">
          <span className="text-lg sm:text-2xl">Are you leaving ?</span>
          <button onClick={onClose}>
            <div className="text-gray-500 bg-transparent p-2 rounded-2xl will-change-transform transition duration-300 hover:text-danger hover:bg-danger/10 hover:rotate-90 hover:scale-105 active:scale-95 cursor-pointer">
              <X className="size-4 sm:size-5" strokeWidth={3} />
            </div>
          </button>
        </div>
        <p className="text-sm sm:text-md text-gray-500">
          This action cannot be undone.
        </p>
        <div className="flex flex-row gap-5">
          <button
            className=" w-1/2 rounded-2xl px-5 py-2.5  transition duration-300 bg-gray-300 text-sm sm:text-md text-ink will-change-transform hover:scale-105 active:scale-95 hover:bg-gray-400 cursor-pointer"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className=" w-1/2 rounded-2xl px-5 py-2.5 transition duration-300 bg-danger text-sm sm:text-md text-white text-center will-change-transform hover:scale-105 active:scale-95 hover:brightness-110 cursor-pointer disabled:opacity-60"
            disabled={loading}
            onClick={onConfirm}
          >
            {loading ? "Logging out..." : "Logout"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmLogoutModal;
