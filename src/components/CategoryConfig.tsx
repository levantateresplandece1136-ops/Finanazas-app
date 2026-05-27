/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Tag, Plus, Trash2, Check, Sparkles, Info } from 'lucide-react';
import { Category } from '../types';

interface CategoryConfigProps {
  incomeCats: Category[];
  setIncomeCats: (cats: Category[]) => void;
  expenseCats: Category[];
  setExpenseCats: (cats: Category[]) => void;
}

export const CategoryConfig: React.FC<CategoryConfigProps> = ({
  incomeCats,
  setIncomeCats,
  expenseCats,
  setExpenseCats
}) => {
  // Input fields
  const [incName, setIncName] = useState('');
  const [incColor, setIncColor] = useState('#12795B');

  const [expName, setExpName] = useState('');
  const [expColor, setExpColor] = useState('#C54316');

  // Add Income
  const handleAddIncome = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = incName.trim();
    if (!cleanName) return;

    if (incomeCats.find(c => c.name.toLowerCase() === cleanName.toLowerCase())) {
      alert('Esta categoría ya está registrada en tus ingresos.');
      return;
    }

    setIncomeCats([...incomeCats, { name: cleanName, color: incColor }]);
    setIncName('');
  };

  // Add Expense
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = expName.trim();
    if (!cleanName) return;

    if (expenseCats.find(c => c.name.toLowerCase() === cleanName.toLowerCase())) {
      alert('Esta categoría ya está registrada en tus egresos.');
      return;
    }

    setExpenseCats([...expenseCats, { name: cleanName, color: expColor }]);
    setExpName('');
  };

  // Delete Category
  const handleDeleteCat = (type: 'income' | 'expense', name: string) => {
    const isSystem = ['Sueldo', 'Vivienda', 'Alimentación', 'Otros Grandes', 'Otros Ingresos', 'Otros Gastos'].includes(name);
    if (isSystem) {
      alert(`La categoría "${name}" es obligatoria para el funcionamiento coherente del sistema y no puede eliminarse.`);
      return;
    }

    if (confirm(`¿Estás seguro de que deseas eliminar la categoría "${name}"? Los movimientos antiguos asignados conservarán la categoría pero no se sumarán a los gráficos si ya no existen.`)) {
      if (type === 'income') {
        setIncomeCats(incomeCats.filter(c => c.name !== name));
      } else {
        setExpenseCats(expenseCats.filter(c => c.name !== name));
      }
    }
  };

  return (
    <div id="category-config-panel" className="animate-fade-in space-y-6">
      
      {/* HEADER BAR */}
      <div>
        <h2 id="cat-title" className="font-display text-2xl md:text-3xl font-semibold text-brand-charcoal leading-tight">
          Configuración de Categorías
        </h2>
        <p id="cat-subtitle" className="text-xs md:text-sm text-brand-gray mt-1">
          Modela las etiquetas de ingresos y gastos según tu estilo de vida. Puedes asignar paletas personalizadas para tu comodidad visual.
        </p>
      </div>

      {/* BEN GRID FOR INCOME & EXPENSES */}
      <div id="cats-grid-dual" className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* INCOME CATEGORIES CARD */}
        <div id="income-cats-card" className="bg-white border border-[#EBE7DF] rounded-2.5xl p-5 md:p-6 shadow-xs flex flex-col justify-between space-y-6">
          <div>
            <h3 className="text-xs uppercase tracking-wider font-extrabold text-brand-green mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-amber" />
              Categorías de Ingresos
            </h3>

            <div className="flex flex-wrap gap-2.5 max-h-[220px] overflow-y-auto pr-1">
              {incomeCats.map(c => (
                <div 
                  key={c.name}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#EBE7DF] bg-[#FAF9F6] text-xs font-semibold text-brand-charcoal"
                >
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                  <span>{c.name}</span>
                  <button
                    onClick={() => handleDeleteCat('income', c.name)}
                    className="ml-1 text-brand-light-gray hover:text-brand-red text-sm font-bold leading-none cursor-pointer"
                    title="Eliminar"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleAddIncome} className="border-t border-[#EBE7DF]/60 pt-4 space-y-3 font-sans">
            <h4 className="text-[11px] font-bold text-brand-gray uppercase tracking-widest">Crear Nueva Etiqueta</h4>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nombre de etiqueta..."
                value={incName}
                onChange={(e) => setIncName(e.target.value)}
                className="flex-1 p-2 py-1.5 text-xs bg-[#FAF9F6] border border-[#EBE7DF] rounded-lg focus:outline-none focus:bg-white focus:border-brand-charcoal"
                required
              />
              <input
                type="color"
                value={incColor}
                onChange={(e) => setIncColor(e.target.value)}
                className="w-10 h-8 p-0.5 border border-[#EBE7DF] rounded-lg bg-white cursor-pointer flex-shrink-0"
                title="Color de categoría"
              />
              <button
                type="submit"
                className="px-3 bg-brand-charcoal text-white hover:bg-neutral-800 text-xs font-bold rounded-lg transition-colors flex items-center justify-center cursor-pointer flex-shrink-0"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* EXPENSE CATEGORIES CARD */}
        <div id="expense-cats-card" className="bg-white border border-[#EBE7DF] rounded-2.5xl p-5 md:p-6 shadow-xs flex flex-col justify-between space-y-6">
          <div>
            <h3 className="text-xs uppercase tracking-wider font-extrabold text-[#991B1F] mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-amber" />
              Categorías de Gastos
            </h3>

            <div className="flex flex-wrap gap-2.5 max-h-[220px] overflow-y-auto pr-1">
              {expenseCats.map(c => (
                <div 
                  key={c.name}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#EBE7DF] bg-[#FAF9F6] text-xs font-semibold text-brand-charcoal"
                >
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                  <span>{c.name}</span>
                  <button
                    onClick={() => handleDeleteCat('expense', c.name)}
                    className="ml-1 text-brand-light-gray hover:text-brand-red text-sm font-bold leading-none cursor-pointer"
                    title="Eliminar"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleAddExpense} className="border-t border-[#EBE7DF]/60 pt-4 space-y-3 font-sans">
            <h4 className="text-[11px] font-bold text-brand-gray uppercase tracking-widest">Crear Nueva Etiqueta</h4>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nombre de etiqueta..."
                value={expName}
                onChange={(e) => setExpName(e.target.value)}
                className="flex-1 p-2 py-1.5 text-xs bg-[#FAF9F6] border border-[#EBE7DF] rounded-lg focus:outline-none focus:bg-white focus:border-brand-charcoal"
                required
              />
              <input
                type="color"
                value={expColor}
                onChange={(e) => setExpColor(e.target.value)}
                className="w-10 h-8 p-0.5 border border-[#EBE7DF] rounded-lg bg-white cursor-pointer flex-shrink-0"
                title="Color de categoría"
              />
              <button
                type="submit"
                className="px-3 bg-brand-charcoal text-white hover:bg-neutral-800 text-xs font-bold rounded-lg transition-colors flex items-center justify-center cursor-pointer flex-shrink-0"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* DISCIPLINE WARNING INFO */}
      <div id="cat-intel-box" className="flex gap-2.5 p-4 bg-[#FAF9F6] border border-[#EBE7DF] text-brand-gray rounded-xl text-xs leading-relaxed font-medium">
        <Info className="w-5 h-5 text-brand-light-gray flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-brand-charcoal mb-0.5">Estética y Ritmo Visual:</p>
          <p>
            Te recomendamos asignar colores sutiles y contrastados a fin de que los análisis de tus presupuestos y el gráfico de dona en la pantalla de Resumen sea nítido y legible en tu pantalla de control.
          </p>
        </div>
      </div>

    </div>
  );
};
