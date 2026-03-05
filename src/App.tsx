import React, { useState, useEffect } from "react";
import { Expense, Category, Saving, Settings } from "./types";
import ExpenseForm from "./components/ExpenseForm";
import ExpenseList from "./components/ExpenseList";
import Dashboard from "./components/Dashboard";
import AIChat from "./components/AIChat";
import SettingsPanel from "./components/SettingsPanel";
import SavingsForm from "./components/SavingsForm";
import { Wallet, LayoutDashboard, List, MessageSquare, Settings as SettingsIcon, PiggyBank } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type Tab = "dashboard" | "list" | "savings" | "ai" | "settings";

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [savings, setSavings] = useState<Saving[]>([]);
  const [settings, setSettings] = useState<Settings>({ salary: 0, currency: "EUR" });
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [expensesRes, savingsRes, settingsRes] = await Promise.all([
        fetch("/api/expenses"),
        fetch("/api/savings"),
        fetch("/api/settings"),
      ]);
      
      const [expensesData, savingsData, settingsData] = await Promise.all([
        expensesRes.json(),
        savingsRes.json(),
        settingsRes.json(),
      ]);

      setExpenses(expensesData);
      setSavings(savingsData);
      setSettings({
        salary: parseFloat(settingsData.salary) || 0,
        currency: settingsData.currency || "EUR",
      });
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddExpense = async (newExpense: {
    description: string;
    amount: number;
    category: Category;
    date: string;
  }) => {
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newExpense),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Failed to add expense:", error);
    }
  };

  const handleAddSaving = async (newSaving: {
    description: string;
    amount: number;
    date: string;
  }) => {
    try {
      const res = await fetch("/api/savings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSaving),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Failed to add saving:", error);
    }
  };

  const handleDeleteExpense = async (id: number) => {
    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setExpenses(expenses.filter((e) => e.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete expense:", error);
    }
  };

  const handleUpdateSettings = async (newSettings: Partial<Settings>) => {
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings),
      });
      if (res.ok) {
        setSettings({ ...settings, ...newSettings });
      }
    } catch (error) {
      console.error("Failed to update settings:", error);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-white">
              <Wallet size={24} />
            </div>
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Troškovi Pro</h1>
          </div>
          
          <nav className="hidden md:flex items-center gap-1">
            <TabButton
              active={activeTab === "dashboard"}
              onClick={() => setActiveTab("dashboard")}
              icon={<LayoutDashboard size={18} />}
              label="Pregled"
            />
            <TabButton
              active={activeTab === "list"}
              onClick={() => setActiveTab("list")}
              icon={<List size={18} />}
              label="Transakcije"
            />
            <TabButton
              active={activeTab === "savings"}
              onClick={() => setActiveTab("savings")}
              icon={<PiggyBank size={18} />}
              label="Štednja"
            />
            <TabButton
              active={activeTab === "ai"}
              onClick={() => setActiveTab("ai")}
              icon={<MessageSquare size={18} />}
              label="AI Asistent"
            />
            <TabButton
              active={activeTab === "settings"}
              onClick={() => setActiveTab("settings")}
              icon={<SettingsIcon size={18} />}
              label="Postavke"
            />
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar / Form */}
          <div className="lg:col-span-4 space-y-6">
            {activeTab === "savings" ? (
              <SavingsForm settings={settings} onAdd={handleAddSaving} />
            ) : (
              <ExpenseForm settings={settings} onAdd={handleAddExpense} />
            )}
            
            <div className="card p-6 bg-zinc-900 text-white border-none">
              <h4 className="font-semibold mb-2">Savjet Dana</h4>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Pokušajte ograničiti "Zabavu" na 10% vašeg mjesečnog budžeta kako biste brže postigli svoje ciljeve štednje.
              </p>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {activeTab === "dashboard" && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Dashboard expenses={expenses} savings={savings} settings={settings} />
                </motion.div>
              )}
              {activeTab === "list" && (
                <motion.div
                  key="list"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-zinc-900">Sve Transakcije</h2>
                    <span className="text-sm text-zinc-500">{expenses.length} transakcija</span>
                  </div>
                  <ExpenseList expenses={expenses} settings={settings} onDelete={handleDeleteExpense} />
                </motion.div>
              )}
              {activeTab === "savings" && (
                <motion.div
                  key="savings"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-zinc-900">Moja Štednja</h2>
                    <span className="text-sm text-zinc-500">{savings.length} unosa</span>
                  </div>
                  <div className="card p-6 space-y-4">
                    {savings.length === 0 ? (
                      <p className="text-zinc-500 text-center py-8">Još niste dodali ništa u štednju.</p>
                    ) : (
                      <div className="space-y-3">
                        {savings.map((s) => (
                          <div key={s.id} className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl">
                            <div>
                              <p className="font-medium text-zinc-900">{s.description}</p>
                              <p className="text-xs text-zinc-500">{s.date}</p>
                            </div>
                            <span className="font-bold text-emerald-600">
                              +{s.amount.toLocaleString()} {settings.currency}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
              {activeTab === "ai" && (
                <motion.div
                  key="ai"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <AIChat expenses={expenses} savings={savings} settings={settings} />
                </motion.div>
              )}
              {activeTab === "settings" && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <SettingsPanel settings={settings} onUpdate={handleUpdateSettings} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 px-4 py-3 flex justify-around items-center z-20">
        <MobileTabButton
          active={activeTab === "dashboard"}
          onClick={() => setActiveTab("dashboard")}
          icon={<LayoutDashboard size={24} />}
        />
        <MobileTabButton
          active={activeTab === "list"}
          onClick={() => setActiveTab("list")}
          icon={<List size={24} />}
        />
        <MobileTabButton
          active={activeTab === "savings"}
          onClick={() => setActiveTab("savings")}
          icon={<PiggyBank size={24} />}
        />
        <MobileTabButton
          active={activeTab === "ai"}
          onClick={() => setActiveTab("ai")}
          icon={<MessageSquare size={24} />}
        />
        <MobileTabButton
          active={activeTab === "settings"}
          onClick={() => setActiveTab("settings")}
          icon={<SettingsIcon size={24} />}
        />
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
        active ? "bg-zinc-100 text-zinc-900" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function MobileTabButton({ active, onClick, icon }: { active: boolean; onClick: () => void; icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-xl transition-all ${
        active ? "text-zinc-900 bg-zinc-100" : "text-zinc-400"
      }`}
    >
      {icon}
    </button>
  );
}
