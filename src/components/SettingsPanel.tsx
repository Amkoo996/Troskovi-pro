import React, { useState } from "react";
import { Settings, CURRENCIES } from "../types";
import { Save, Settings as SettingsIcon } from "lucide-react";

interface SettingsPanelProps {
  settings: Settings;
  onUpdate: (newSettings: Partial<Settings>) => void;
}

export default function SettingsPanel({ settings, onUpdate }: SettingsPanelProps) {
  const [salary, setSalary] = useState(settings.salary.toString());
  const [currency, setCurrency] = useState(settings.currency);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      salary: parseFloat(salary) || 0,
      currency,
    });
  };

  return (
    <div className="card p-6 space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <SettingsIcon size={20} className="text-zinc-500" />
        <h3 className="text-lg font-semibold">Postavke</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-500">Mjesečna Plata / Prihod</label>
          <input
            type="number"
            step="0.01"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            className="input-field"
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-500">Valuta</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="input-field"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} ({c.symbol})
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
          <Save size={18} />
          Spremi Postavke
        </button>
      </form>
    </div>
  );
}
