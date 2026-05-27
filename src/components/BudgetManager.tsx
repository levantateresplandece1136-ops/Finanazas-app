/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PieChart, PenTool, Check, Info, AlertTriangle } from 'lucide-react';
import { Transaction, Category, CategoryBudget } from '../types';
import { formatCurrency, getMonthName } from '../initialData';

interface BudgetManagerProps {
  transactions: Transaction[];
  currentMonth: string;
  expenseCats: Category[];
  budgets: {
    [month: string]: CategoryBudget;
  };
  setBudgets: (b: { [month: string]: CategoryBudget }) => void;
}

export const BudgetManager: React.FC<BudgetManagerProps> = ({
  transactions,
  currentMonth,
  expenseCats,
  budgets,
  setBudgets
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formBudgets, setFormBudgets] = useState<CategoryBudget>({});

  // Get current budgets for this month
  const activeBudget = budgets[currentMonth] || {};

  // Compute expenses for current month
  const monthExpenseTxs = transactions.filter(
    t => t.type === 'expense' && t.date && t.date.startsWith(currentMonth)
  );

  const spentPerCat: { [cat: string]: number } = {};
  monthExpenseTxs.forEach(t => {
    spentPerCat[t.cat] = (spentPerCat[t.cat] || 0) + t.amount;
  });

  // Open Edit Dialog
  const openEditDialog = () => {
    const initializedForm: CategoryBudget = {};
    expenseCats.forEach(c => {
      initializedForm[c.name] = activeBudget[c.name] || 0;
    });
    setFormBudgets(initializedForm);
    setIsOpen(true);
  };

  // Change input value
  const handleInputChange = (catName: string, value: string) => {
    const parsed = parseFloat(value);
    setFormBudgets({
      ...formBudgets,
      [catName]: isNaN(parsed) || parsed < 0 ? 0 : parsed
    });
  };

  // Save budget changes
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newBudgetObj = { ...formBudgets };
    
    // Clean up empty/zero budgets to avoid clutter
    Object.keys(newBudgetObj).forEach(k => {
      if (newBudgetObj[k] <= 0) {
        delete newBudgetObj[k];
      }
    });

    setBudgets({
      ...budgets,
      [currentMonth]: newBudgetObj
    });
    setIsOpen(false);
  };

  // Build full budgets list
  const budgetsToDisplay = expenseCats.map(c => {
    const limit = activeBudget[c.name] || 0;
    const spent = spentPerCat[c.name] || 0;
    const progressPercent = limit > 0 ? (spent / limit) * 100 : 0;
    const isExceeded = limit > 0 && spent > limit;
    const isClose = limit > 0 && spent >= limit * 0.8 && spent <= limit;

    return {
      category: c,
      limit,
      spent,
      progressPercent,
      isExceeded,
      isClose
    };
  });

  const totalBudgeted = Object.values(activeBudget).reduce((acc: number, v: any) => acc + (Number(v) || 0), 0) as number;
  const totalSpent = monthExpenseTxs.reduce((acc, t) => acc + t.amount, 0);

  return (
    <div id="budget-tab-panel" className="animate-fade-in space-y-6">
      
      {/* HEADER ROW */}
      <div id="budget-header" className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 id="budget-title" className="font-display text-2xl md:text-3xl font-semibold text-brand-charcoal leading-tight">
            Presupuestos Mensuales
          </h2>
          <p id="budget-subtitle" className="text-xs md:text-sm text-brand-gray mt-1">
            Pon un límite estricto a las salidas de dinero por categoría para evitar gastos innecesarios.
          </p>
        </div>
        <button
          id="btn-edit-budgets"
          onClick={openEditDialog}
          className="self-start md:self-auto bg-brand-charcoal hover:bg-neutral-800 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <PenTool className="w-4 h-4" />
          Establecer Límites
        </button>
      </div>

      {/* OVERALL MONTH PROGRESS */}
      <div id="overall-budget-track" className="bg-[#FAF9F6] border border-[#EBE7DF] rounded-2xl p-5 md:p-6 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="space-y-1">
          <p className="text-[11px] font-bold text-brand-gray tracking-wider uppercase">Límite Total Planificado</p>
          <p className="font-display text-2.5xl font-bold text-brand-charcoal leading-none">
            {formatCurrency(totalBudgeted)}
          </p>
          <p className="text-[11px] text-brand-gray">La suma de todos tus topes de categoría.</p>
        </div>
        <div className="space-y-1 border-y md:border-y-0 md:border-x border-[#EBE7DF]/85 py-3 md:py-0 md:px-6">
          <p className="text-[11px] font-bold text-brand-gray tracking-wider uppercase font-sans">Total Ejercido</p>
          <p className="font-display text-2.5xl font-bold text-brand-red leading-none">
            {formatCurrency(totalSpent)}
          </p>
          <p className="text-[11px] text-brand-gray">Egresos efectivos transcurridos.</p>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold text-brand-gray">
            <span>Progreso Total Consumido</span>
            <span className="font-bold">
              {totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : 0}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-[#EAE5DC] rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${
                totalSpent > totalBudgeted ? 'bg-[#991B1F]' : 'bg-[#12795B]'
              }`}
              style={{ width: `${totalBudgeted > 0 ? Math.min((totalSpent / totalBudgeted) * 100, 100) : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* INDIVIDUAL CATEGORIES GRID */}
      <div id="individual-budget-track-grid" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {budgetsToDisplay.map(({ category, limit, spent, progressPercent, isExceeded, isClose }) => {
          
          if (limit === 0 && spent === 0) {
            // Skips categories with no budgets and zero consumption to keep focus on active elements
            return null;
          }

          // Progress color switcher
          const barColor = isExceeded 
            ? 'bg-brand-red' 
            : isClose 
              ? 'bg-brand-amber' 
              : 'bg-brand-green';

          return (
            <div 
              key={category.name} 
              id={`bud-track-card-${category.name}`}
              className="bg-white border border-[#EBE7DF] hover:border-[#DED9CE] rounded-xl p-4.5 shadow-xs transition-all duration-150 flex flex-col justify-between"
            >
              {/* Card Title Label */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 truncate">
                    <span 
                      className="w-3 h-3 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: category.color }} 
                    />
                    <h4 className="text-xs font-bold text-brand-charcoal truncate">{category.name}</h4>
                  </div>
                  {/* Warning badges */}
                  {isExceeded ? (
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold tracking-wide uppercase px-2 py-0.5 rounded-full bg-brand-red-light text-brand-red animate-pulse">
                      <AlertTriangle className="w-3 h-3 text-brand-red flex-shrink-0" />
                      Excedido
                    </span>
                  ) : isClose ? (
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold tracking-wide uppercase px-2 py-0.5 rounded-full bg-brand-amber-light text-brand-amber">
                      Límite Próximo
                    </span>
                  ) : limit > 0 ? (
                    <span className="text-[9px] font-extrabold tracking-wide uppercase px-2 py-0.5 rounded-full bg-brand-green-light text-brand-green">
                      Bajo control
                    </span>
                  ) : (
                    <span className="text-[9px] font-semibold text-brand-gray px-2 py-0.5 rounded-full bg-warm-cream border border-[#EBE7DF]/80">
                      Sin presupuesto
                    </span>
                  )}
                </div>

                {/* Values line */}
                <div className="flex items-baseline justify-between text-xs mt-2.5">
                  <span className="text-[11px] text-brand-gray font-medium">Ejercido este mes</span>
                  <div className="text-right">
                    <span className="font-bold text-brand-charcoal">{formatCurrency(spent)}</span>
                    {limit > 0 && (
                      <span className="text-brand-gray font-normal"> / {formatCurrency(limit)}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress Bar & percentage */}
              {limit > 0 && (
                <div className="mt-4 space-y-1.5">
                  <div className="w-full h-1.5 bg-[#EAE5DC] rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                      style={{ width: `${Math.min(progressPercent, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-brand-gray font-medium">
                    <span>Consumido</span>
                    <span className="font-bold text-brand-charcoal">{Math.round(progressPercent)}%</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Informational checklist if everything empty */}
        {budgetsToDisplay.filter(b => b.limit > 0 || b.spent > 0).length === 0 && (
          <div className="col-span-2 bg-[#FAF9F6] border-2 border-dashed border-[#EBE7DF] py-10 px-4 text-center rounded-2xl text-brand-light-gray">
            <PieChart className="w-10 h-10 mx-auto opacity-30 mb-2.5" />
            <p className="text-sm font-semibold text-brand-gray">Sin presupuestos parametrizados para este mes</p>
            <p className="text-xs max-w-md mx-auto mt-1 leading-relaxed">
              Define los montos máximos sugeridos que quieres gastar. Esto te mantendrá motivado a no exceder tus recursos económicos corporativos o familiares.
            </p>
            <button
              onClick={openEditDialog}
              className="mt-4 bg-brand-charcoal hover:bg-neutral-800 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              Comenzar Presupuesto
            </button>
          </div>
        )}
      </div>

      {/* POPUP EDIT MODAL */}
      {isOpen && (
        <div id="budget-modal-overlay" className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 md:p-7 max-w-md w-full shadow-xl border border-[#EBE7DF]/80 animate-slide-up">
            
            {/* Modal Head */}
            <div className="flex items-center justify-between border-b border-[#EBE7DF]/60 pb-3.5 mb-5">
              <h3 className="font-display text-lg font-bold text-brand-charcoal">
                Ajustar Presupuesto: <span className="text-brand-green">{getMonthName(currentMonth)}</span>
              </h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-brand-gray hover:text-brand-charcoal text-lg font-semibold"
              >
                &times;
              </button>
            </div>

            {/* Modal Form inputs */}
            <form onSubmit={handleSave} className="space-y-4 font-sans">
              <p className="text-xs text-brand-gray leading-relaxed mb-4">
                Ingresa el límite máximo de gasto que te propones para cada una de tus categorías este mes. Deja en 0 para no presupuestar.
              </p>

              {/* Scrollable list of fields */}
              <div className="max-h-[280px] overflow-y-auto pr-1 space-y-3">
                {expenseCats.map(c => (
                  <div key={c.name} className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-brand-charcoal flex-1 truncate">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                      <span className="truncate">{c.name}</span>
                    </span>
                    <div className="relative w-36 flex-shrink-0">
                      <span className="absolute left-2.5 top-2.5 text-xs font-medium text-brand-light-gray">$</span>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        placeholder="0.00"
                        value={formBudgets[c.name] || ''}
                        onChange={(e) => handleInputChange(c.name, e.target.value)}
                        className="pl-6 pr-3 py-2 text-xs bg-[#FAF9F6] border border-[#EBE7DF] rounded-lg focus:outline-none focus:bg-white focus:border-brand-charcoal w-full font-mono font-semibold"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Warning info */}
              <div id="budget-discl-box" className="flex gap-2 p-3 bg-brand-green-light border border-brand-green/30 text-brand-green rounded-lg text-[10px] leading-relaxed font-semibold">
                <Info className="w-4 h-4 flex-shrink-0" />
                <p>El sistema cruzará automáticamente estos topes con tus egresos del mes actual de manera dinámica.</p>
              </div>

              {/* Footer action trigger */}
              <div className="flex items-center justify-end gap-2 border-t border-[#EBE7DF]/60 pt-4 mt-5">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-xs font-semibold border border-[#EBE7DF] rounded-lg text-brand-gray hover:text-brand-charcoal hover:bg-[#FAF9F6] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-brand-charcoal text-white hover:bg-neutral-800 rounded-lg shadow-sm transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  Guardar Límites
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
