import { supabase } from "./supabaseClient";
import {
  isToday,
  isYesterday,
  isSameWeek,
  isSameMonth,
  subWeeks,
  subMonths,
} from "date-fns";

const matchesTimeRange = (expenseDateStr, timeRange) => {
  const today = new Date();
  const expenseDate = new Date(expenseDateStr);

  if (timeRange === "today") return isToday(expenseDate);
  if (timeRange === "yesterday") return isYesterday(expenseDate);
  if (timeRange === "this_week") return isSameWeek(expenseDate, today);
  if (timeRange === "last_week")
    return isSameWeek(expenseDate, subWeeks(today, 1));
  if (timeRange === "this_month") return isSameMonth(expenseDate, today);
  if (timeRange === "last_month")
    return isSameMonth(expenseDate, subMonths(today, 1));
  return true; // All
};

// To make data more clear in JSON
const slim = (e) => ({
  id: e.id,
  description: e.description,
  amount: Number(e.amount),
  category: e.category,
  date: e.date,
});

export const toolImpl = {
  //SearchText is description
  search_expenses: async ({ searchText, category, timeRange }, { userId }) => {
    let query = supabase.from("expenses").select("*").eq("user_id", userId);
    if (searchText) query = query.ilike("description", `%${searchText}%`);
    if (category && category !== "all") query = query.eq("category", category);

    const { data, error } = await query.order("date", { ascending: false });
    if (error) return { error: error.message };

    const rows = data.filter((e) =>
      matchesTimeRange(e.date, timeRange || "all"),
    );

    let total = 0;
    for (const e of rows) {
      total = total + Number(e.amount);
    }

    return {
      count: rows.length,
      total: Number(total.toFixed(2)),
      expenses: rows.slice(0, 25).map(slim),
    };
  },
  add_expense: async (
    { description, amount, category, date },
    { userId, onExpenseAdded }, //onExpenseAdded just to call the Dashboard to refresh the page
  ) => {
    // Adding the data to supabase
    const { data, error } = await supabase
      .from("expenses")
      .insert({
        user_id: userId,
        description,
        amount,
        category,
        date,
      })
      .select()
      .single();

    if (error) return { error: error.message };

    onExpenseAdded?.(data);
    return { added: slim(data) };
  },

  update_expense: async (
    { id, description, amount, category, date },
    { userId, onExpenseUpdated },
  ) => {
    const patch = {};
    if (description !== undefined) patch.description = description;
    if (amount !== undefined) patch.amount = amount;
    if (category !== undefined) patch.category = category;
    if (date !== undefined) patch.date = date;

    if (Object.keys(patch).length === 0) {
      return { error: "No fields to update were provided." };
    }

    const { data, error } = await supabase
      .from("expenses")
      .update(patch)
      .eq("user_id", userId)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) return { error: error.message };
    if (!data)
      return { error: "No expense with that id belongs to this user." };

    onExpenseUpdated?.(data);
    return { updated: slim(data) };
  },

  delete_expense: async ({ id }, { userId, onExpenseDeleted }) => {
    const { data, error } = await supabase
      .from("expenses")
      .delete()
      .eq("user_id", userId)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) return { error: error.message };
    if (!data)
      return { error: "No expense with that id belongs to this user." };

    onExpenseDeleted?.(data.id);
    return { deleted: slim(data) };
  },
};

export const STEP_LABELS = {
  search_expenses: "Searching expenses...",
  add_expense: "Adding expense...",
  update_expense: "Updating expense...",
  delete_expense: "Deleting expense...",
};
