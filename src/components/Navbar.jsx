import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { LogOut, Sun, Moon } from "lucide-react";
import ConfirmLogoutModal from "./ConfirmLogoutModal";

const Navbar = () => {
  const [isDark, setIsDark] = useState(false);
  const [openLogoutModal, setOpenLogoutModal] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/signin");
  };

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
    setIsDark((prev) => !prev);
  };

  return (
    // Navbar bar — justify-between pushes left and right groups apart
    <nav className="w-full flex items-center justify-between px-25 py-3 -mb-6">
      {/* LEFT — logo + brand name. Change gap-1.5 to adjust space between logo and text */}
      <div className="flex items-center -ml-15 cursor-default">
        <img
          src="/Coin_Shark_Logo2.png"
          alt="CoinShark"
          className="brightness-110 transition will-change-transform duration-500 hover:-rotate-15 "
          width={200}
        />
        <span className="text-4xl -ml-12 text-ink will-change-transform underline-reveal decoration-20">
          Coin<a className="text-accent">Shark</a>
        </span>
      </div>
      {/* RIGHT — sun + logout. Change gap-3 to adjust space between the two buttons */}
      <div className="flex items-center gap-3">
        {/* Sun / theme toggle button */}

        <button
          className="p-2 bg-card rounded-2xl shadow border border-gray-200 will-change-transform transition-all duration-300 hover:scale-105 hover:border-accent hover:text-accent hover:bg-accent/10 hover:rotate active:scale-95 cursor-pointer text-ink"
          onClick={toggleTheme}
        >
          {isDark ? (
            <Moon className="duration-500" size={34} strokeWidth={3} />
          ) : (
            <Sun className="duration-500 " size={34} strokeWidth={3} />
          )}
        </button>

        {/* Logout button */}
        <button
          className="text-ink text-xl flex items-center gap-2 p-2.5 bg-card rounded-2xl shadow border border-gray-200  will-change-transform transition-all duration-300 hover:scale-105 hover:border-danger  hover:text-danger active:scale-95 cursor-pointer"
          onClick={() => setOpenLogoutModal(true)}
        >
          <LogOut size={20} strokeWidth={3.5} />
          <span>Logout</span>
        </button>
      </div>
      {openLogoutModal && (
        <ConfirmLogoutModal
          onClose={() => setOpenLogoutModal(false)}
          onConfirm={handleLogout}
          loading={false}
        />
      )}
    </nav>
  );
};

export default Navbar;
