import { Frown, CircleArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg gap-2">
      <div className="flex flex-row text-[300px] text-accent items-center gap-2 -mb-15">
        <span>4</span>
        <Frown size={270} strokeWidth={3} />
        <span>4</span>
      </div>
      <p className="text-5xl text-ink mb-5">Page not found</p>
      <button
        className="flex flex-row items-center gap-3 bg-accent text-white text-3xl px-6 py-5 will-change-transform transition duration-300 rounded-2xl hover:scale-105 hover:brightness-105 active:scale-95 cursor-pointer"
        onClick={() => navigate("/dashboard")}
      >
        <CircleArrowLeft size={50} strokeWidth={3} />
        Back
      </button>
    </div>
  );
};

export default NotFound;
