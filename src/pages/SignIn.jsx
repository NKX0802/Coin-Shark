import { useState } from "react";
import { Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { Spinner } from "@/components/ui/spinner";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      // email(Supabase) : email(From the useState)
      email: email,
      password: password,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Welcome back!");
      navigate("/dashboard");
    }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      // After User approve using Google Auth straight go to dashboard
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      toast.error("Failed to sign in with Google");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg px-4 sm:px-0">
      <div className="flex flex-col items-center justify-center rounded-2xl pt-4 px-6 sm:px-12 pb-5 w-full sm:min-w-xl sm:max-w-xl bg-card border border-gray-300 shadow-md">
        <div className="flex flex-col items-center gap-2 mb-4">
          <img
            src="/Coin_Shark_Logo2.png"
            alt="CoinSharkLogo"
            className="w-36 sm:w-100 brightness-110 -mb-3.5"
          />
          <h1 className="text-3xl text-accent cursor-default">Welcome Back</h1>
        </div>

        <form
          className="flex flex-col items-start w-full"
          onSubmit={handleSignIn}
        >
          <div className="flex flex-col gap-1.5 mb-3 w-full">
            <div className="flex items-center gap-2">
              <Mail size={22} strokeWidth={3} className="text-ink" />
              <label className="text-md sm:text-xl text-ink">Email</label>
            </div>
            <input
              className="text-md sm:text-lg rounded-2xl p-2.5 w-full border-3 border-gray-300 focus:border-accent outline-none hover:border-gray-400 transition duration-600"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5 mb-4 w-full">
            <div className="flex items-center gap-2">
              <Lock size={22} strokeWidth={3} className="text-ink" />
              <label className="text-md sm:text-xl text-ink">Password</label>
            </div>
            <input
              className="text-md sm:text-lg rounded-2xl p-2.5 w-full border-3 border-gray-300 focus:border-accent outline-none hover:border-gray-400 transition duration-600"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            className="text-md sm:text-xl text-center rounded-2xl bg-accent text-white w-full p-2.5 mb-2.5 cursor-pointer transition-all duration-600 hover:scale-102 hover:brightness-105 active:scale-98 disabled:opacity-60"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner className="size-5" strokeWidth={4} />
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
          <button
            type="button"
            className="w-full text-md sm:text-xl border-4 rounded-2xl p-2.5 cursor-pointer transition-all duration-600 hover:scale-102 hover:brightness-105 active:scale-98 flex items-center justify-center border-accent text-accent bg-accent/10"
            onClick={handleGoogleSignIn}
          >
            <img
              src="/Google_Icon_Edited.png"
              alt="Google"
              width={50}
              className="-mr-1"
            />
            Sign in with Google
          </button>
        </form>

        <p className="mt-4 text-sm sm:text-lg">
          New here?{" "}
          <Link
            className="text-accent underline-reveal decoration-8 will-change-transform"
            to="/signup"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
