import React, { useState } from "react";
import { PiggyBank, Plus } from "lucide-react";
import { Settings, CURRENCIES } from "../types";

interface SavingsFormProps {
  settings: Settings;
  onAdd: (saving: { description: string; amount: number; date: string }) => void;
}

export default function SavingsForm({ settings, onAdd }: SavingsFormProps) {
  const currentCurrency = CURRENCIES.find(c => c.code === settings.currency) || CURRENCIES[0];
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    onAdd({
      description,
      amount: parseFloat(amount),
      date,
    });

    setDescription("");
    setAmount("");
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <PiggyBank size={20} className="text-emerald-500" />
        <h3 className="text-lg font-semibold">Dodaj u Štednju</h3>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-500">Opis (npr. Za auto)</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="npr. Mjesečna štednja"
          className="input-field"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-500">Iznos ({currentCurrency.symbol})</label>
        <input
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="input-field"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-500">Datum</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input-field"
          required
        />
      </div>

      <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700">
        <Plus size={18} />
        Spremi u Štednju
      </button>
    </form>
  );
}
