import { Frown, CircleArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center sm:justify-center sm:pt-0 bg-bg gap-2">
      <div className="flex flex-row text-[80px] sm:text-[300px] text-accent items-center gap-2 -mb-7 sm:-mb-15">
        <span className="">4</span>
        <Frown strokeWidth={3} className="size-15 sm:size-70" />
        <span>4</span>
      </div>
      <p className="text-xl sm:text-5xl text-ink sm:mb-5">Page not found</p>
      <button
        className="flex flex-row items-center gap-3 bg-accent text-white text-lg sm:text-3xl px-3 py-2 sm:px-6 sm:py-5 will-change-transform transition duration-300 rounded-2xl hover:scale-105 hover:brightness-105 active:scale-95 cursor-pointer"
        // Navigates to Dashboard, which will redirect to Sign In if not logged in
        onClick={() => navigate("/dashboard")}
      >
        <CircleArrowLeft strokeWidth={3} className="size-6 sm:size-12" />
        Back
      </button>
    </div>
  );
};

export default NotFound;
