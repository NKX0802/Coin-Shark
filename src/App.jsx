import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
// import { useEffect } from "react";
// import { suggestCategory } from "./geminiClient";

const App = () => {
  // useEffect(() => {
  //   suggestCategory("Starbucks coffee 5.50").then((category) => {
  //     console.log("AI suggested:", category);
  //   });
  // }, []);
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors duration={5000} />
      <Routes>
        <Route path="/" element={<Navigate to="/signin" replace />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
