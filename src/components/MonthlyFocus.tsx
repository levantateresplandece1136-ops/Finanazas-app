/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Target, Plus, Pencil, Trash2, HelpCircle, Info, Lightbulb } from 'lucide-react';
import { Transaction, MonthlyGoal } from '../types';
import { formatCurrency, generateId, getMonthName } from '../initialData';

interface MonthlyFocusProps {
  transactions: Transaction[];
  currentMonth: string;
  monthlyGoals: {
    [month: string]: MonthlyGoal[];
  };
  setMonthlyGoals: (goals: { [month: string]: MonthlyGoal[] }) => void;
}

export const MonthlyFocus: React.FC<MonthlyFocusProps> = ({
  transactions,
  currentMonth,
  monthlyGoals,
  setMonthlyGoals
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('Nueva Meta del Mes');
  
  // Form fields
  const [mgId, setMgId] = useState<string | number>('');
  const [mgName, setMgName] = useState('');
  const [mgType, setMgType] = useState<'saving' | 'spending' | 'income' | 'custom'>('saving');
  const [mgTarget, setMgTarget] = useState('');
  const [mgWhy, setMgWhy] = useState('');

  // Active goals array for this month
  const activeMonthGoals = monthlyGoals[currentMonth] || [];

  // Filter relevant transactions for progress checks
  const monthTxs = transactions.filter(t => t.date && t.date.startsWith(currentMonth));
  const incomeSum = monthTxs.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const expenseSum = monthTxs.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const netSavings = incomeSum - expenseSum;

  const openAddModal = () => {
    setModalTitle('Registrar Meta Mensual');
    setMgId('');
    setMgName('');
    setMgType('saving');
    setMgTarget('');
    setMgWhy('');
    setIsOpen(true);
  };

  const openEditModal = (g: MonthlyGoal) => {
    setModalTitle('Modificar Meta Mensual');
    setMgId(g.id);
    setMgName(g.name);
    setMgType(g.type);
    setMgTarget(String(g.target));
    setMgWhy(g.why || '');
    setIsOpen(true);
  };

  const handleDelete = (id: string | number) => {
    if (confirm('¿Deseas dar de baja esta meta mensual?')) {
      const updatedList = activeMonthGoals.filter(g => g.id !== id);
      setMonthlyGoals({
        ...monthlyGoals,
        [currentMonth]: updatedList
      });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mgName.trim() || !mgTarget || parseFloat(mgTarget) <= 0) {
      alert('Ingresa el nombre de la meta y un valor objetivo razonable.');
      return;
    }

    const goalObj: MonthlyGoal = {
      id: mgId || generateId(),
      name: mgName.trim(),
      type: mgType,
      target: parseFloat(mgTarget),
      why: mgWhy.trim() || undefined
    };

    let updatedList = [...activeMonthGoals];
    if (mgId) {
      updatedList = updatedList.map(g => g.id === mgId ? goalObj : g);
    } else {
      updatedList.push(goalObj);
    }

    setMonthlyGoals({
      ...monthlyGoals,
      [currentMonth]: updatedList
    });
    setIsOpen(false);
  };

  // Helper calculation formulas for exact progress
  const getGoalProgressStats = (g: MonthlyGoal) => {
    let currentVal = 0;
    let percent = 0;

    if (g.type === 'saving') {
      currentVal = netSavings;
      percent = g.target > 0 ? (netSavings / g.target) * 100 : 0;
    } else if (g.type === 'income') {
      currentVal = incomeSum;
      percent = g.target > 0 ? (incomeSum / g.target) * 100 : 0;
    } else if (g.type === 'spending') {
      currentVal = expenseSum;
      // Spending limit is met when actual expense is below target limit
      if (g.target <= 0) {
        percent = 0;
      } else {
        const ratio = expenseSum / g.target;
        percent = ratio >= 1 ? 0 : (1 - ratio) * 100;
      }
    }

    const roundedPercent = Math.min(Math.round(percent), 100);
    const isCompleted = percent >= 100;

    return {
      currentVal,
      percent: Math.max(0, percent),
      roundedPercent: Math.max(0, roundedPercent),
      isCompleted
    };
  };

  return (
    <div id="monthly-focus-panel" className="animate-fade-in space-y-6">
      
      {/* HEADER ROW */}
      <div id="monthly-header" className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 id="monthly-title" className="font-display text-2xl md:text-3xl font-semibold text-brand-charcoal leading-tight">
            Metas del Mes
          </h2>
          <p id="monthly-subtitle" className="text-xs md:text-sm text-brand-gray mt-1">
            Establece objetivos de corto plazo para el periodo actual y evalúa tu comportamiento.
          </p>
        </div>
        <button
          id="btn-add-monthly-goal"
          onClick={openAddModal}
          className="self-start md:self-auto bg-brand-charcoal hover:bg-neutral-800 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nueva Meta Mensual
        </button>
      </div>

      {/* QUICK INSPIRATIONAL TIPS BANNER */}
      <div id="monthly-tips" className="bg-brand-amber-light border border-brand-amber/25 p-4 rounded-xl flex items-start gap-3">
        <Lightbulb className="w-5 h-5 text-brand-amber flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5 text-xs text-brand-amber font-semibold">
          <p className="font-bold">Estrategia de Enfoque Práctico:</p>
          <p className="text-[11px] leading-relaxed text-brand-amber/90 font-medium">
            Tener metas diarias o semanales es la clave de la disciplina financiera. 
            Haz un hábito de revisar estos indicadores los domingos para afilar tus hábitos del mes en curso (<span className="font-semibold">{getMonthName(currentMonth)}</span>).
          </p>
        </div>
      </div>

      {/* ACTIVE GOALS DISP GROUP */}
      <div id="active-monthly-goals-listing" className="space-y-4">
        {activeMonthGoals.length === 0 ? (
          <div id="monthly-empty-slate" className="bg-white border border-[#EBE7DF] rounded-xl p-12 text-center text-brand-light-gray">
            <Target className="w-10 h-10 mx-auto opacity-35 mb-2.5 text-brand-light-gray" />
            <p className="text-base font-semibold text-brand-gray">Sin metas mensuales trazadas</p>
            <p className="text-xs max-w-sm mx-auto mt-1 leading-relaxed">
              No dejes tus finanzas a la deriva. Traza un objetivo claro de ahorro, un tope de egreso o un ingreso mínimo.
            </p>
            <button
              onClick={openAddModal}
              className="mt-4 bg-brand-charcoal hover:bg-neutral-800 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              Crear mi Primer Objetivo del Mes
            </button>
          </div>
        ) : (
          activeMonthGoals.map((g) => {
            const { currentVal, roundedPercent, isCompleted } = getGoalProgressStats(g);
            
            // Progress Fill Switcher
            const fillStyle = isCompleted 
              ? 'bg-brand-green' 
              : roundedPercent >= 65 
                ? 'bg-brand-amber' 
                : 'bg-brand-green/75';

            return (
              <div 
                key={g.id}
                id={`monthly-goal-card-${g.id}`} 
                className="bg-white border border-[#EBE7DF] rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center gap-5 justify-between hover:border-[#DED9CE] transition-all duration-150"
              >
                {/* Meta Core information */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                      g.type === 'saving' 
                        ? 'bg-brand-green-light text-brand-green' 
                        : g.type === 'spending' 
                          ? 'bg-brand-red-light text-brand-red' 
                          : g.type === 'income' 
                            ? 'bg-brand-green-light text-brand-green' 
                            : 'bg-brand-amber-light text-brand-amber'
                    }`}>
                      {g.type === 'saving' ? 'Ahorro Neto' : g.type === 'spending' ? 'Tope de Gasto' : g.type === 'income' ? 'Ingreso Mínimo' : 'Foco Libre'}
                    </span>
                    <span className="text-[11px] font-bold text-brand-light-gray select-none">·</span>
                    <span className="text-xs font-bold text-brand-gray">
                      Objetivo: {formatCurrency(g.target)}
                    </span>
                  </div>

                  <h3 className="font-sans text-[15px] font-bold text-brand-charcoal truncate">
                    {g.name}
                  </h3>

                  {g.why && (
                    <p className="text-xs text-brand-gray font-medium italic">
                      💬 Por qué importa: "{g.why}"
                    </p>
                  )}
                </div>

                {/* Progress Indicators */}
                <div className="w-full md:w-64 flex flex-col justify-center gap-1.5 flex-shrink-0">
                  <div className="flex justify-between items-baseline text-xs font-semibold text-brand-gray">
                    <span>
                      {g.type === 'spending' ? 'Ejercido: ' : 'Acumulado: '}
                      <strong className="text-brand-charcoal">{formatCurrency(currentVal)}</strong>
                    </span>
                    <span className={`font-bold ${isCompleted ? 'text-brand-green' : 'text-brand-charcoal'}`}>
                      {g.type === 'spending' && currentVal > g.target ? 'No logrado' : `${roundedPercent}%`}
                    </span>
                  </div>

                  {/* Progress bar fill */}
                  <div className="w-full h-2.5 bg-[#EAE5DC] rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        g.type === 'spending' && currentVal > g.target ? 'bg-brand-red' : fillStyle
                      }`}
                      style={{ width: `${g.type === 'spending' && currentVal > g.target ? 100 : roundedPercent}%` }}
                    />
                  </div>

                  {g.type === 'spending' && currentVal > g.target && (
                    <p className="text-[10px] text-brand-red font-bold mt-0.5">⚠️ Te has excedido del límite configurado.</p>
                  )}
                </div>

                {/* Left controls */}
                <div className="flex md:flex-col items-center justify-end gap-1 border-t md:border-t-0 border-[#EBE7DF]/50 pt-3 md:pt-0">
                  <button
                    onClick={() => openEditModal(g)}
                    className="p-1 px-2 hover:bg-[#FAF9F6] text-brand-gray hover:text-brand-charcoal text-xs font-bold rounded flex items-center gap-1.5 cursor-pointer"
                    title="Modificar"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span className="md:hidden">Modificar</span>
                  </button>
                  <button
                    onClick={() => handleDelete(g.id)}
                    className="p-1 px-2 hover:bg-brand-red-light text-brand-gray hover:text-brand-red text-xs font-bold rounded flex items-center gap-1.5 cursor-pointer"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="md:hidden">Eliminar</span>
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* POPUP TRIGGER DIALOG */}
      {isOpen && (
        <div id="monthly-modal-overlay" className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 md:p-7 max-w-lg w-full shadow-xl border border-[#EBE7DF]/80 animate-slide-up">
            
            {/* Modal Head */}
            <div className="flex items-center justify-between border-b border-[#EBE7DF]/60 pb-3.5 mb-5 font-sans">
              <h3 className="font-display text-lg font-bold text-brand-charcoal">
                {modalTitle}
              </h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-brand-gray hover:text-brand-charcoal text-lg font-semibold"
              >
                &times;
              </button>
            </div>

            {/* Modal Input fields */}
            <form onSubmit={handleSave} className="space-y-4 font-sans">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-brand-gray">¿Cuál es tu objetivo? (Título corto) *</label>
                <input
                  type="text"
                  placeholder="Ej. Ahorrar $3,000 netos, Evitar salidas caras"
                  value={mgName}
                  onChange={(e) => setMgName(e.target.value)}
                  className="p-2.5 text-xs bg-[#FAF9F6] border border-[#EBE7DF] rounded-lg focus:outline-none focus:bg-white focus:border-brand-charcoal"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Goal Type */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-brand-gray">Tipo de Meta</label>
                  <select
                    className="p-2.5 text-xs bg-[#FAF9F6] border border-[#EBE7DF] rounded-lg focus:outline-none focus:border-brand-charcoal"
                    value={mgType}
                    onChange={(e) => setMgType(e.target.value as any)}
                  >
                    <option value="saving">Ahorro Mensual (Remanente neto)</option>
                    <option value="spending">Tope de Gasto (No gastar más de...)</option>
                    <option value="income">Embalsar Ingreso (Depositar mínimo...)</option>
                  </select>
                </div>

                {/* Target Amount */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-brand-gray">Monto Objetivo ($) *</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="0.00"
                    value={mgTarget}
                    onChange={(e) => setMgTarget(e.target.value)}
                    className="p-2.5 text-xs bg-[#FAF9F6] border border-[#EBE7DF] rounded-lg focus:outline-none focus:bg-white focus:border-brand-charcoal font-sans font-semibold"
                    required
                  />
                </div>
              </div>

              {/* Purpose / Why */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-brand-gray">¿Por qué es importante para ti esta meta? *</label>
                <textarea
                  placeholder="Escribe tu motivación profunda. Te recordará por qué estás disciplinando tu bolsillo."
                  value={mgWhy}
                  onChange={(e) => setMgWhy(e.target.value)}
                  className="p-2.5 text-xs bg-[#FAF9F6] border border-[#EBE7DF] rounded-lg focus:outline-none focus:bg-white focus:border-brand-charcoal min-h-[72px]"
                  required
                />
              </div>

              {/* Help tip boxes */}
              <div id="monthly-help-alert" className="flex gap-2 p-3 bg-brand-green-light border border-brand-green/30 text-brand-green rounded-lg text-[10px] leading-relaxed font-semibold">
                <Info className="w-4 h-4 flex-shrink-0" />
                <p>Las metas de Tipo Ahorro evaluarán automáticamente la resta entre tus ingresos y egresos de este mes.</p>
              </div>

              {/* Action buttons */}
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
                  className="px-5 py-2 text-xs font-semibold bg-brand-charcoal text-white hover:bg-neutral-800 rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  Registrar Objetivo
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
