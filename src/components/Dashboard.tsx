import React from "react";
import { Expense, Saving, Settings, CURRENCIES } from "../types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from "lucide-react";

interface DashboardProps {
  expenses: Expense[];
  savings: Saving[];
  settings: Settings;
}

const COLORS = ["#f97316", "#3b82f6", "#a855f7", "#ec4899", "#ef4444", "#10b981", "#71717a"];

export default function Dashboard({ expenses, savings, settings }: DashboardProps) {
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalSavings = savings.reduce((sum, sav) => sum + sav.amount, 0);
  const balance = settings.salary - totalExpenses - totalSavings;
  
  const currentCurrency = CURRENCIES.find(c => c.code === settings.currency) || CURRENCIES[0];

  const formatCurrency = (value: number) => {
    return value.toLocaleString(currentCurrency.locale, {
      style: "currency",
      currency: currentCurrency.code,
    });
  };

  // Group by category
  const categoryData = expenses.reduce((acc, exp) => {
    const existing = acc.find((item) => item.name === exp.category);
    if (existing) {
      existing.value += exp.amount;
    } else {
      acc.push({ name: exp.category, value: exp.amount });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  // Group by date (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split("T")[0];
  }).reverse();

  const dailyData = last7Days.map((date) => {
    const amount = expenses
      .filter((exp) => exp.date === date)
      .reduce((sum, exp) => sum + exp.amount, 0);
    return {
      date: new Date(date).toLocaleDateString(currentCurrency.locale, { weekday: "short" }),
      amount,
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center gap-2 text-zinc-500 mb-1">
            <Wallet size={16} />
            <span className="text-xs font-medium uppercase tracking-wider">Plata</span>
          </div>
          <span className="text-2xl font-bold text-zinc-900">{formatCurrency(settings.salary)}</span>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2 text-zinc-500 mb-1">
            <TrendingDown size={16} />
            <span className="text-xs font-medium uppercase tracking-wider">Troškovi</span>
          </div>
          <span className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</span>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2 text-zinc-500 mb-1">
            <PiggyBank size={16} />
            <span className="text-xs font-medium uppercase tracking-wider">Štednja</span>
          </div>
          <span className="text-2xl font-bold text-emerald-600">{formatCurrency(totalSavings)}</span>
        </div>

        <div className={`card p-6 border-2 ${balance >= 0 ? 'border-emerald-100 bg-emerald-50/30' : 'border-red-100 bg-red-50/30'}`}>
          <div className="flex items-center gap-2 text-zinc-500 mb-1">
            {balance >= 0 ? <TrendingUp size={16} className="text-emerald-500" /> : <TrendingDown size={16} className="text-red-500" />}
            <span className="text-xs font-medium uppercase tracking-wider">Ostatak</span>
          </div>
          <span className={`text-2xl font-bold ${balance >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
            {formatCurrency(balance)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 md:col-span-3">
          <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-4">
            Troškovi po Danima (Zadnjih 7 dana)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#71717a" }} />
                <YAxis hide />
                <Tooltip
                  cursor={{ fill: "#f4f4f5" }}
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                  formatter={(value: number) => [formatCurrency(value), "Iznos"]}
                />
                <Bar dataKey="amount" fill="#18181b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-4">
            Raspodjela po Kategorijama
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                  formatter={(value: number) => [formatCurrency(value), "Ukupno"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-4">
            Top Kategorije
          </h3>
          <div className="space-y-4">
            {categoryData
              .sort((a, b) => b.value - a.value)
              .slice(0, 5)
              .map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm font-medium text-zinc-700">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-zinc-900">
                    {formatCurrency(item.value)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
