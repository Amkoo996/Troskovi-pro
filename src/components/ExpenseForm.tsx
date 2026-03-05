import React, { useState } from "react";
import { CATEGORIES, Category, Settings, CURRENCIES } from "../types";
import { Plus } from "lucide-react";

interface ExpenseFormProps {
  settings: Settings;
  onAdd: (expense: { description: string; amount: number; category: Category; date: string }) => void;
}

export default function ExpenseForm({ settings, onAdd }: ExpenseFormProps) {
  const currentCurrency = CURRENCIES.find(c => c.code === settings.currency) || CURRENCIES[0];
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category>("Hrana");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    onAdd({
      description,
      amount: parseFloat(amount),
      category,
      date,
    });

    setDescription("");
    setAmount("");
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-4">
      <h3 className="text-lg font-semibold mb-4">Dodaj Trošak</h3>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-500">Opis</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="npr. Ručak u restoranu"
          className="input-field"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
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
          <label className="text-sm font-medium text-zinc-500">Kategorija</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="input-field"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
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

      <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
        <Plus size={18} />
        Dodaj Trošak
      </button>
    </form>
  );
}
