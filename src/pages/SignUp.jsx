import { useState } from "react";
import { Mail, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "../supabaseClient";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  //Sign Up Function
  const handleSignUp = async (e) => {
    //Prevent reloading thw whole page
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Account created! Welcome aboard.");
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg">
      <div className="flex flex-col items-center justify-center rounded-2xl pt-6 px-12 pb-8 min-w-xl bg-card border border-gray-300 shadow-md">
        <div className="flex flex-col items-center gap-3 mb-8">
          <img
            src="/Coin_Shark_Logo2.png"
            alt="CoinSharkLogo"
            width={360}
            className="brightness-110 -mb-3.5"
          />
          <h1 className="text-4xl text-accent cursor-default">Get Started</h1>
        </div>

        <form
          onSubmit={handleSignUp}
          className="flex flex-col items-start w-full"
        >
          <div className="flex flex-col gap-2 mb-5 w-full">
            <div className="flex items-center gap-2">
              <Mail size={25} strokeWidth={3} className="text-ink" />
              <label className="text-2xl text-ink">Email</label>
            </div>
            <input
              className="text-xl rounded-2xl p-3 w-full border-3 border-gray-300 focus:border-accent outline-none hover:border-gray-400 transition duration-300"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2 mb-6 w-full">
            <div className="flex items-center gap-2">
              <Lock size={25} strokeWidth={3} className="text-ink" />
              <label className="text-2xl text-ink">Password</label>
            </div>
            <input
              className="text-xl rounded-2xl p-3 w-full border-3 border-gray-300 focus:border-accent outline-none hover:border-gray-400 transition duration-300"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            className="text-2xl text-center rounded-2xl bg-accent text-white w-full p-3 mb-3 cursor-pointer transition-all duration-300 hover:scale-102 hover:brightness-105 active:scale-98 disabled:opacity-60"
            type="submit"
            //Disabled is on when loading is true
            disabled={loading}
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
          <button className="w-full text-2xl border-4 rounded-2xl p-3 cursor-pointer transition-all duration-300 hover:scale-102 hover:brightness-105 active:scale-98 flex items-center justify-center border-accent text-accent bg-accent/10">
            <img
              src="/Google_Icon_Edited.png"
              alt="Google"
              width={60}
              className="-mr-1"
            />
            Sign up with Google
          </button>
        </form>

        <p className="mt-6 text-lg">
          Back again?{" "}
          <Link
            className="text-accent underline-reveal decoration-8 will-change-transform"
            to="/signin"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
