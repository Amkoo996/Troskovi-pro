import React from "react";
import { Expense, Settings, CURRENCIES } from "../types";
import { Trash2, ShoppingBag, Utensils, Car, Home, HeartPulse, Music, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { hr } from "date-fns/locale";

interface ExpenseListProps {
  expenses: Expense[];
  settings: Settings;
  onDelete: (id: number) => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Hrana: <Utensils size={18} className="text-orange-500" />,
  Transport: <Car size={18} className="text-blue-500" />,
  Stanarina: <Home size={18} className="text-purple-500" />,
  Zabava: <Music size={18} className="text-pink-500" />,
  Zdravlje: <HeartPulse size={18} className="text-red-500" />,
  Shopping: <ShoppingBag size={18} className="text-emerald-500" />,
  Ostalo: <MoreHorizontal size={18} className="text-zinc-500" />,
};

export default function ExpenseList({ expenses, settings, onDelete }: ExpenseListProps) {
  const currentCurrency = CURRENCIES.find(c => c.code === settings.currency) || CURRENCIES[0];

  if (expenses.length === 0) {
    return (
      <div className="card p-12 text-center text-zinc-500">
        Nema troškova za prikaz. Dodajte novi trošak da biste započeli.
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200">
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Datum
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Opis
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Kategorija
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">
                Iznos
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">
                Akcije
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {expenses.map((expense) => (
              <tr key={expense.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">
                  {format(new Date(expense.date), "dd. MMM yyyy.", { locale: hr })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900">
                  {expense.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">
                  <div className="flex items-center gap-2">
                    {CATEGORY_ICONS[expense.category] || CATEGORY_ICONS.Ostalo}
                    {expense.category}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-zinc-900 text-right">
                  {expense.amount.toLocaleString(currentCurrency.locale, { style: "currency", currency: currentCurrency.code })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button
                    onClick={() => onDelete(expense.id)}
                    className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
