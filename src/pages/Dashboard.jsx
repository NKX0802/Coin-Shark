import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

import Navbar from "../components/Navbar";
import AddExpenseModal from "../components/AddExpenseModal";
import EditExpenseModal from "../components/EditExpenseModal";

import {
  Wallet,
  Receipt,
  Bot,
  ChartPie,
  Sticker,
  Pencil,
  Trash2,
  TrendingUpDown,
  CirclePlus,
} from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Other");
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const checkSessionAndFetch = async () => {
      // Step A: Check if logged in
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;

      if (!session) {
        navigate("/signin");
        return; // stop here, no point fetching expenses for a non-user
      }

      setUserId(session.user.id);

      // Step B: Fetch this user's expenses
      const { data: expensesData, error } = await supabase
        .from("expenses")
        .select("*")
        .order("date", { ascending: false });

      if (error) {
        toast.error("Couldn't load expenses");
        console.error(error);
      } else {
        setExpenses(expensesData);
      }

      setLoading(false);
    };

    checkSessionAndFetch();
  }, [navigate]);

  const categoryColors = {
    "Food & Drink": "#3b82f6", // blue
    Transport: "#10b981", // green
    Shopping: "#e8703a", // orange
    "Bills & Utilities": "#eab308", // yellow
    Entertainment: "#a855f7", // purple
    Health: "#ef4444", // red
    Groceries: "#14b8a6", // teal
    Other: "#6b7280", // gray
  };

  const handleExpenseAdded = (newExpense) => {
    setExpenses([newExpense, ...expenses]);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg text-center">
        <p className="text-9xl text-accent">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      {/* Page wrapper — adds spacing around all content */}
      <div className="px-25 py-7 ">
        {/* Card row — lays 3 cards side by side */}
        <div className="flex flex-row gap-7 mb-7">
          {/* Card 1 */}
          <div className="flex flex-col p-6 w-1/3 bg-card rounded-2xl shadow border border-gray-200">
            {/* Cover Title and Icon */}
            <div className="mb-5 flex flex-row items-center justify-between">
              <span className="text-2xl text-accent">Total Expenses</span>
              {/* Icon */}
              <div className="p-2.5 bg-soft rounded-2xl">
                <Wallet className="text-accent" size={35} strokeWidth={2} />
              </div>
            </div>
            <div className="flex gap-2 text-ink">
              <span className="text-4xl">RM</span>
              <span className="text-4xl">250.00</span>
            </div>
          </div>

          <div className="flex flex-col p-6 w-1/3 bg-card rounded-2xl shadow border border-gray-200">
            <div className="mb-5 flex flex-row items-center justify-between">
              <span className="text-2xl text-accent">Number of Expenses</span>
              <div className="p-2.5 bg-soft rounded-2xl">
                <Receipt className="text-accent" size={35} strokeWidth={2} />
              </div>
            </div>
            <span className="text-4xl text-ink">15</span>
          </div>

          <div className="flex flex-col p-6 w-1/3 bg-card rounded-2xl shadow border border-gray-200">
            <div className="mb-5 flex flex-row items-center justify-between">
              <span className="text-2xl text-accent">Average Expenses</span>
              <div className="p-2.5 bg-soft rounded-2xl">
                <TrendingUpDown
                  className="text-accent"
                  size={35}
                  strokeWidth={2}
                />
              </div>
            </div>
            <div className="flex gap-2 text-ink">
              <span className="text-4xl">RM</span>
              <span className="text-4xl">5.50</span>
            </div>
          </div>
        </div>

        {/* Second row — Chart */}
        <div className="flex gap-7 mb-7">
          {/* Spending chart card */}
          <div className="flex flex-col p-6 w-1/2 bg-card rounded-2xl shadow border border-gray-200 gap-4">
            {/* Card header */}
            <div className="mb-2 flex flex-row items-center justify-between">
              <span className="text-2xl text-accent">Spending Category</span>
              <div className="p-2.5 bg-soft rounded-2xl">
                <ChartPie className="text-accent" size={35} strokeWidth={2} />
              </div>
            </div>

            {/* Bar rows — each row: label + bar + amount */}
            <div className="flex flex-col gap-4">
              {/* Food & Drink */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-lg">
                  <span className="text-ink">Food & Drink</span>
                  <span className="text-ink">RM 50.00</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div
                    className="h-3 rounded-full"
                    style={{ width: "80%", background: "#3b82f6" }}
                  />
                </div>
              </div>

              {/* Transport */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-lg">
                  <span className="text-ink">Transport</span>
                  <span className="text-ink">RM 18.50</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div
                    className="h-3 rounded-full"
                    style={{ width: "50%", background: "#10b981" }}
                  />
                </div>
              </div>

              {/* Shopping */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-lg">
                  <span className="text-ink">Shopping</span>
                  <span className="text-ink">RM 75.00</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div
                    className="h-3 rounded-full"
                    style={{ width: "65%", background: "#e8703a" }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* AI Insights card */}
          <div className="flex flex-col justify-between p-6 w-1/2 bg-card rounded-2xl shadow border border-gray-200 gap-4">
            {/* Top — header + description */}
            <div className="flex flex-col gap-3">
              <div className="mb-2 flex flex-row items-center justify-between">
                <span className="text-2xl text-accent">AI Insights</span>
                <div className="p-2.5 bg-soft rounded-2xl">
                  <Bot className="text-accent" size={35} strokeWidth={2} />
                </div>
              </div>
              <span className="text-ink text-lg">
                Get 3 simple tips to save money based on your spending.
              </span>
            </div>

            {/* Bottom — button centered */}
            <button className="self-center p-2.5 px-20 text-xl text-white bg-accent rounded-2xl shadow-xs shadow-accent/50 will-change-transform transition-all duration-300 hover:scale-105 hover:brightness-105 active:scale-95 cursor-pointer">
              Analyze my spending
            </button>
          </div>
        </div>
        {/* Expenses table section */}
        <div className="flex flex-col p-6 bg-card rounded-2xl shadow border border-gray-200 gap-2">
          {/* Header row — title on left, Add button on right */}
          <div className="flex items-center justify-between pb-5 -mb-5">
            {/* Title — icon left, text right */}
            <div className="flex gap-2 items-center">
              <div className="p-2.5">
                <Sticker className="text-accent" size={50} strokeWidth={2} />
              </div>
              <span className="text-2xl text-accent">All Expenses</span>
            </div>

            {/* Add button */}
            <button
              onClick={() => setOpenAddModal(true)}
              className="flex flex-row p-2.5 px-5 text-xl gap-2 text-white bg-accent rounded-2xl shadow-xs shadow-accent/50 will-change-transform transition-all duration-300 hover:scale-105 hover:brightness-105 active:scale-95 cursor-pointer"
            >
              <CirclePlus className="text-white" size={30} strokeWidth={2} />
              <span className="text-xl">Add</span>
            </button>
          </div>

          <div className="p-4">
            <div className="border border-gray-300 rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-[1fr_1.2fr_0.8fr_1fr_80px] gap-3 p-3.5 bg-accent border-b border-gray-200 text-xs  text-white uppercase tracking-wider">
                <span>Description</span>
                <span>Category</span>
                <span>Amount</span>
                <span>Date</span>
                {/* <span className="text-center">Actions</span> */}
              </div>

              {/* Data rows */}
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="grid grid-cols-[1fr_1.2fr_0.8fr_1fr_80px] gap-3 px-4 py-3 border-b border-gray-200 items-center hover:bg-accent/3 text-ink"
                >
                  <span className="font-medium text-ink">
                    {expense.description}
                  </span>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: categoryColors[expense.category],
                      }}
                    ></div>
                    <span className="text-ink">{expense.category}</span>
                  </div>
                  {/* .toFixed(2) can formats to 2 decimal places */}
                  <span className="">
                    RM {Number(expense.amount).toFixed(2)}
                  </span>
                  <span className="">{expense.date}</span>
                  <div className="flex gap-5 justify-end">
                    <button
                      className="p-2 border border-gray-300 rounded-2xl will-change-transform transition-300 hover:bg-soft hover:border-accent hover:text-accent cursor-pointer"
                      onClick={() => setOpenEditModal(true)}
                    >
                      <Pencil size={20} strokeWidth={2.5} />
                    </button>
                    <button className="p-2 border border-gray-300 rounded-2xl will-change-transform transition-300 hover:bg-danger/10 hover:border-danger hover:text-danger cursor-pointer">
                      <Trash2 size={20} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {openAddModal && (
        <AddExpenseModal
          onClose={() => setOpenAddModal(false)}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          userId={userId}
          onExpenseAdded={handleExpenseAdded}
        />
      )}

      {openEditModal && (
        <EditExpenseModal
          onClose={() => setOpenEditModal(false)}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
      )}
    </div>
  );
};

export default Dashboard;
