import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { analyzeSpending } from "../geminiClient";
import { Spinner } from "@/components/ui/spinner";
import Navbar from "../components/Navbar";
import AddExpenseModal from "../components/AddExpenseModal";
import EditExpenseModal from "../components/EditExpenseModal";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";

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
  CircleChevronUp,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { toast } from "sonner";
import AnalysisTipsModal from "../components/AnalysisTipsModal";

const Dashboard = () => {
  const navigate = useNavigate();
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Other");
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [userId, setUserId] = useState(null);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  const [openTipsModal, setOpenTipsModal] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [tips, setTips] = useState([]);
  const [showButton, setShowButton] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [expensePerPage, setExpensePerPage] = useState(
    () => Number(localStorage.getItem("expensePerPage")) || 5,
  );
  const startIndex = (currentPage - 1) * expensePerPage;
  const paginatedExpenses = expenses.slice(
    startIndex,
    startIndex + expensePerPage,
  );
  const totalPages = Math.ceil(expenses.length / expensePerPage);
  const [selectedFilter, setSelectedFilter] = useState("All");

  useEffect(() => {
    const checkSessionAndFetch = async () => {
      // Step 1: Check if logged in
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;

      if (!session) {
        navigate("/signin");
        return; // stop here, no point fetching expenses for a non-user
      }

      // Inside the session have user then inside user have id
      setUserId(session.user.id);

      // Step 2: Fetch this user's expenses
      const { data: expensesData, error } = await supabase
        .from("expenses")
        .select("*")
        .order("date", { ascending: false }); //Sort by latest date first

      if (error) {
        toast.error("Couldn't load expenses");
        console.error(error);
      } else {
        setExpenses(expensesData);
      }

      setLoading(false);
    };

    //Run this function
    checkSessionAndFetch();
  }, [navigate]);

  // Save the user's chosen page size so it survives refresh/logout
  useEffect(() => {
    localStorage.setItem("expensePerPage", expensePerPage);
  }, [expensePerPage]);

  //Show the Back to top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        //When the user scroll Y axis > 300
        setShowButton(true);
      } else {
        setShowButton(false);
      }
    };

    window.addEventListener("scroll", handleScroll); //This let the button handleScroll be always functioning

    // Clean up: remove the listener when the component closes
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleDeleteExpense = async () => {
    const { error } = await supabase
      .from("expenses")
      .delete()
      // eq = equals
      // "id" is the COLUMN NAME in database
      // expenseToDelete.id is the value to equal
      .eq("id", expenseToDelete.id);

    if (error) {
      toast.error("Couldn't remove expenses");
      console.error(error);
    } else {
      // !== if different then true, only the need to delete is false so wont show in setExpenses
      // filter goes through every  item in array then check e.id !== expenseToDelete.id
      setExpenses(expenses.filter((e) => e.id !== expenseToDelete.id));
      toast.success("Removed successfully");
      setOpenConfirmModal(false);
    }

    setLoading(false);
  };

  const categoryColors = {
    // category = "Food & Drink", "Transport", "Shopping"
    "Food & Drink": "#3b82f6", // blue
    Transport: "#10b981", // green
    Shopping: "#e8703a", // orange
    "Bills & Utilities": "#eab308", // yellow
    Entertainment: "#a855f7", // purple
    Health: "#ef4444", // red
    Groceries: "#14b8a6", // teal
    Other: "#6b7280", // gray
  };

  // handleExpenseAdded = onExpenseAdded(AddExpenseModal.jsx)
  // newExpense = data(AddExpenseModal.jsx)
  const handleExpenseAdded = (newExpense) => {
    setExpenses([newExpense, ...expenses]);
  };

  const handleExpenseUpdated = (updatedExpense) => {
    setExpenses(
      expenses.map((e) => (e.id === updatedExpense.id ? updatedExpense : e)),
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-2 sm:gap-6 bg-bg text-center">
        <Spinner className="size-25 sm:size-75 text-accent" strokeWidth={4} />
        <div className="flex flex-row">
          <p className="text-xl sm:text-5xl text-accent">Loading</p>
          <p className="text-xl sm:text-5xl text-accent">...</p>
        </div>
      </div>
    );
  }

  const handleGetTips = async () => {
    // Fetch expenses from Supabase for this user
    const { data: expenses, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", userId); // Filter by logged-in user

    setAnalyzing(true);

    if (error) {
      toast.error("Failed to fetch expenses");
      setAnalyzing(false);
      return;
    }

    // Pass expenses to Gemini
    const tips = await analyzeSpending(expenses);
    setTips(tips);
    setOpenTipsModal(true);
    setAnalyzing(false);
    console.log(tips); // See what you get
  };

  let totalExpenses = 0;
  for (let i = 0; i < expenses.length; i++) {
    totalExpenses = totalExpenses + expenses[i].amount;
  }

  const numberOfExpenses = expenses.length;

  const averageExpenses =
    numberOfExpenses > 0 ? totalExpenses / numberOfExpenses : 0;

  // Group expenses by category and sum amounts
  const categoryTotals = {};

  for (let i = 0; i < expenses.length; i++) {
    const category = expenses[i].category;
    const amount = expenses[i].amount;

    // First time see this category set it to 0 before adding
    if (!categoryTotals[category]) {
      categoryTotals[category] = 0;
    }

    //Add the amount inside
    categoryTotals[category] = categoryTotals[category] + amount;
  }

  // Find the highest amount (for bar width calculation)
  let maxAmount = 0;
  for (let category in categoryTotals) {
    if (categoryTotals[category] > maxAmount) {
      maxAmount = categoryTotals[category];
    }
  }

  // Sort categories by amount (biggest first) and take top 3
  // Change categoryTotals to {Food & Drinks : 200} ["Food & Drinks", 100]
  const sortedCategories = Object.entries(categoryTotals)
    // [ ["Food", 80], ["Transport", 20], ["Shopping", 100] ]
    // a[1] = 80 b[1]=100
    // b[i] - a[i] = 100-80 b goes in front
    .sort((a, b) => b[1] - a[1])
    //.slice(start, stop)
    .slice(0, 3);

  return (
    <div>
      <Navbar
        expensePerPage={expensePerPage}
        setExpensePerPage={setExpensePerPage}
      />
      {/* Page wrapper — adds spacing around all content */}
      <div className="px-4 sm:px-10 lg:px-25 py-7">
        <div className="hidden sm:flex sm:w-auto sm:my-5 sm:p-8 sm:-mt-1 gap-15 p-0 justify-center items-center bg-card rounded-2xl shadow border border-gray-200">
          {["Day", "Week", "Month", "Year", "All"].map((option) => (
            <button
              key={option}
              onClick={() => setSelectedFilter(option)}
              className={`filter-btn ${selectedFilter === option ? "filter-btn-active" : ""}`}
            >
              {option}
            </button>
          ))}
        </div>
        <div className="flex flex-row w-auto h-auto my-5 -mt-2 gap-1 p-2 justify-center items-center bg-card rounded-2xl shadow border border-gray-200 sm:hidden">
          {["Day", "Week", "Month", "Year", "All"].map((option) => (
            <button
              key={option}
              onClick={() => setSelectedFilter(option)}
              className={`mobile-filter-btn ${selectedFilter === option ? "mobile-filter-btn-active" : ""}`}
            >
              {option}
            </button>
          ))}
        </div>
        {/* Card row */}
        <div className="flex flex-row flex-wrap sm:flex-nowrap gap-4 sm:gap-7 mb-4 sm:mb-7">
          {/* Card 1 */}
          <div className="flex flex-col px-5 py-2 sm:p-6 flex-1 bg-card rounded-2xl shadow border border-gray-200 -gap-2 sm:gap-0">
            {/* Title and Icon */}
            <div className="mb-1 sm:mb-5 flex flex-row items-center justify-between">
              <span className="text-md sm:text-2xl text-accent">
                Total Expenses
              </span>
              {/* Icon */}
              <div className="p-2.5 bg-soft rounded-2xl hidden sm:inline">
                <Wallet
                  className="text-accent size-7 sm:size-9 "
                  strokeWidth={2}
                />
              </div>
            </div>
            <div className="flex gap-2 text-ink">
              <span className="text-2xl sm:text-4xl">RM</span>
              <span className="text-2xl sm:text-4xl">
                {totalExpenses.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="hidden sm:flex flex-col px-5 py-2 sm:p-6 flex-1 bg-card rounded-2xl shadow border border-gray-200 -gap-2 sm:gap-0">
            <div className="mb-5 flex flex-row items-center justify-between gap-2">
              <span className="text-sm sm:text-2xl text-accent whitespace-nowrap">
                Number of Expenses
              </span>
              <div className="p-2.5 bg-soft rounded-2xl hidden sm:inline shrink-0">
                <Receipt
                  className="text-accent size-7 sm:size-9"
                  strokeWidth={2}
                />
              </div>
            </div>
            <span className="text-2xl sm:text-4xl text-ink">
              {numberOfExpenses}
            </span>
          </div>

          <div className="flex flex-col px-5 py-2 sm:p-6 flex-1 bg-card rounded-2xl shadow border border-gray-200 -gap-2 sm:gap-0">
            <div className="mb-1 sm:mb-5 flex flex-row items-center justify-between">
              <span className="hidden sm:inline sm:text-2xl text-accent">
                Average Expenses
              </span>
              <span className="text-md sm:hidden text-accent">
                Avg. Expenses
              </span>
              <div className="p-2.5 bg-soft rounded-2xl hidden sm:inline">
                <TrendingUpDown
                  className="text-accent size-7 sm:size-9"
                  strokeWidth={2}
                />
              </div>
            </div>
            <div className="flex gap-2 text-ink">
              <span className="text-2xl sm:text-4xl">RM</span>
              <span className="text-2xl sm:text-4xl">
                {averageExpenses.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Second row */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-7 mb-4 sm:mb-7">
          {/* Spending chart card */}
          <div className="flex flex-col p-6 w-full sm:w-1/2 bg-card rounded-2xl shadow border border-gray-200 gap-4">
            {/* Card header */}
            <div className="mb-2 flex flex-row items-center justify-between">
              <span className="text-lg sm:text-2xl text-accent">
                Spending Category
              </span>
              <div className="p-2.5 bg-soft rounded-2xl">
                <ChartPie
                  className="text-accent size-6 sm:size-9"
                  strokeWidth={2}
                />
              </div>
            </div>

            {/* Bar rows */}
            <div className="flex flex-col gap-4">
              {/* Unpack sortedCategories */}
              {sortedCategories.map(([category, amount]) => {
                const barWidth = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
                return (
                  <div key={category} className="flex flex-col gap-1">
                    <div className="flex justify-between text-lg">
                      <span className="text-ink text-md sm:text-xl">
                        {category}
                      </span>
                      <span className="text-ink text-md sm:text-xl">
                        RM {amount.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3">
                      <div
                        className="h-3 rounded-full"
                        style={{
                          width: `${barWidth}%`,
                          background: categoryColors[category],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Insights card */}
          <div className="hidden sm:flex flex-col justify-between p-6 w-full sm:w-1/2 bg-card rounded-2xl shadow border border-gray-200 gap-4">
            <div className="flex flex-col gap-3">
              <div className="mb-2 flex flex-row items-center justify-between">
                <span className="text-sm sm:text-2xl text-accent">
                  AI Insights
                </span>
                <div className="p-2.5 bg-soft rounded-2xl">
                  <Bot
                    className="text-accent size-7 sm:size-9"
                    strokeWidth={2}
                  />
                </div>
              </div>
              <span className="text-ink text-lg">
                Get 3 simple tips to save money based on your spending.
              </span>
            </div>

            {/* Bottom */}
            <button
              className="self-center p-2.5 px-8 sm:px-20 text-base sm:text-xl text-white bg-accent rounded-2xl shadow-xs shadow-accent/50 will-change-transform transition-all duration-600 hover:scale-105 hover:brightness-105 active:scale-95 cursor-pointer disabled:opacity-60"
              disabled={analyzing}
              onClick={handleGetTips}
            >
              {analyzing ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner className="size-5" strokeWidth={4} />
                  Analyzing...
                </span>
              ) : (
                "Analyze my spending"
              )}
            </button>
          </div>
        </div>
        {/* Expenses table section */}
        <div className="flex flex-col p-2 sm:p-6 bg-card rounded-2xl shadow border border-gray-200 gap-2">
          {/* Header row */}
          <div className="flex items-center justify-between pb-5 -mb-9">
            {/* Title */}
            <div className="flex gap-0.5 items-center ml-1 sm:ml-0">
              <div className="p-2.5">
                <Sticker
                  className="text-accent size-9 sm:size-15"
                  strokeWidth={2}
                />
              </div>
              <span className="text-lg sm:text-2xl text-accent">
                All Expenses
              </span>
            </div>

            {/* Add button */}
            <div className="flex flex-row justify-between gap-2">
              <button
                onClick={handleGetTips}
                className="text-white sm:hidden bg-accent flex flex-row justify-center p-2.5 rounded-2xl shadow-xs shadow-accent/50 will-change-transform transition-all duration-600 hover:scale-105 hover:brightness-105 active:scale-95 cursor-pointer"
              >
                {analyzing ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner className="size-5" strokeWidth={4} />
                  </span>
                ) : (
                  <Bot
                    className="text-white size-5 sm:hidden"
                    strokeWidth={2}
                  />
                )}
              </button>
              <button
                onClick={() => setOpenAddModal(true)}
                className="justify-center items-center sm:flex flex-row p-2.5 sm:p-2.5 sm:px-5 mr-4 text-sm sm:text-xl gap-2 text-white bg-accent rounded-2xl shadow-xs shadow-accent/50 will-change-transform transition-all duration-600 hover:scale-105 hover:brightness-105 active:scale-95 cursor-pointer"
              >
                {/* Mobile icon */}
                <CirclePlus
                  className="text-white size-5 sm:hidden"
                  strokeWidth={2}
                />
                {/* Laptop/desktop icon */}
                <CirclePlus
                  className="hidden text-white sm:block sm:size-8"
                  strokeWidth={2}
                />
                <span className="hidden text-md sm:inline sm:text-xl">Add</span>
              </button>
            </div>
          </div>

          <div className="p-4">
            <div className="border border-gray-300 rounded-2xl overflow-hidden">
              <div className="grid grid-cols-[1fr_0.8fr_80px] sm:grid-cols-[1fr_1.2fr_0.8fr_1fr_80px] gap-3 p-3.5 bg-accent border-b border-gray-200 text-xs text-white uppercase tracking-wider">
                <span>Description</span>
                {/* block is just to let it show as normal visible box */}
                <span className="hidden sm:block">Category</span>
                <span>Amount</span>
                <span className="hidden sm:block">Date</span>
                {/* <span className="text-center">Actions</span> */}
              </div>

              {/* Data rows */}
              {paginatedExpenses.map((expense) => (
                <div
                  key={expense.id}
                  // fr is like length and changes according to screen size
                  className="grid grid-cols-[1fr_0.8fr_80px] sm:grid-cols-[1fr_1.2fr_0.8fr_1fr_80px] gap-3 px-4 py-3 border-b border-gray-200 items-center hover:bg-accent/3 text-ink text-sm sm:text-lg"
                >
                  <span className="font-medium text-ink">
                    {expense.description}
                  </span>
                  <div className="hidden sm:flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: categoryColors[expense.category],
                      }}
                    ></div>
                    <span className="text-ink">{expense.category}</span>
                  </div>
                  <span className="">
                    RM {Number(expense.amount).toFixed(2)}
                  </span>
                  <span className="hidden sm:block">{expense.date}</span>
                  <div className="flex gap-1 sm:gap-5 justify-end">
                    <button
                      title="Edit"
                      className="p-2 border border-gray-300 rounded-xl will-change-transform transition-all duration-600 hover:bg-soft hover:border-accent hover:text-accent cursor-pointer"
                      onClick={() => {
                        setExpenseToEdit(expense);
                        setOpenEditModal(true);
                      }}
                    >
                      <Pencil size={20} strokeWidth={2.5} />
                    </button>
                    <button
                      title="Delete"
                      className="p-2 border border-gray-300 rounded-xl will-change-transform transition-all duration-600 hover:bg-danger/10 hover:border-danger hover:text-danger cursor-pointer"
                      onClick={() => {
                        //Store the expense
                        setExpenseToDelete(expense);
                        //Open ConfirmDeleteModal
                        setOpenConfirmModal(true);
                      }}
                    >
                      <Trash2 size={20} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {/* Pages */}
            <div className="hidden sm:flex sm:items-center sm:justify-center sm:gap-5 sm:mt-5 sm:-mb-5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="bg-accent text-white p-3 rounded-xl will-change-transform transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
              >
                <div className="flex flex-row gap-2 items-center">
                  <ChevronLeft size={25} strokeWidth={5} />
                </div>
              </button>
              <span className="text-ink text-md">
                Page {currentPage} of {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="bg-accent text-white p-3 rounded-xl will-change-transform transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
              >
                <div className="flex flex-row gap-2 items-center">
                  <ChevronRight size={25} strokeWidth={5} />
                </div>
              </button>
            </div>

            <div className="flex gap-2.5">
              {/* <button
                className="flex-1 sm:hidden flex justify-center items-center gap-2 w-full rounded-2xl bg-accent mt-5 py-3 hover:scale-105 hover:brightness-105 active:scale-95 transition duration-600 will-change-transform cursor-pointer shadow-xs shadow-accent/50 disabled:opacity-60"
                onClick={() => setOpenAddModal(true)}
                disabled={analyzing}
              >
                <CirclePlus className="text-white size-6" strokeWidth={2} />
                <span className="text-md text-white">Add Expense</span>
              </button> */}
              {/* <button
                className="flex-1 sm:hidden flex justify-center items-center gap-2 w-full rounded-2xl bg-accent mt-5 py-3 hover:scale-105 hover:brightness-105 active:scale-95 transition duration-600 will-change-transform cursor-pointer shadow-xs shadow-accent/50 disabled:opacity-60"
                onClick={handleGetTips}
                disabled={analyzing}
              >
                <Bot className="text-white size-6" strokeWidth={2} />
                <span className="text-md text-white">
                  {analyzing ? "Analyzing..." : "Get Tips"}
                </span>
              </button> */}
            </div>
          </div>
        </div>
      </div>

      {openAddModal && (
        <AddExpenseModal
          // Gives AddExpenseModal a way to close itself
          onClose={() => {
            setOpenAddModal(false);
            setSelectedCategory("Other");
          }}
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
          expenseToEdit={expenseToEdit}
          onExpenseUpdated={handleExpenseUpdated}
        />
      )}

      {openConfirmModal && (
        <ConfirmDeleteModal
          onClose={() => {
            setOpenConfirmModal(false);
            setSelectedCategory("Other");
          }}
          onConfirm={handleDeleteExpense}
          loading={false}
          expenseName={expenseToDelete?.description}
          expenseToDelete={expenseToDelete}
        />
      )}

      {openTipsModal && (
        <AnalysisTipsModal
          onClose={() => setOpenTipsModal(false)}
          loading={false}
          tips={tips}
        />
      )}

      {showButton && (
        <div className="hidden sm:block fixed bottom-6 right-6 group">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="p-3 bg-accent text-white rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all duration-500 cursor-pointer"
          >
            <CircleChevronUp size={30} strokeWidth={2.5} />
          </button>
          <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 whitespace-nowrap rounded-lg bg-accent text-white text-xs px-2.5 py-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-500 z-10">
            Back to Top
          </span>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
