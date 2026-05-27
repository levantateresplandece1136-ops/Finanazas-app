/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Target, 
  Trash2, 
  Pencil, 
  Plus, 
  Sparkles, 
  CheckCircle, 
  Calendar, 
  ChevronRight, 
  HelpCircle,
  Gem
} from 'lucide-react';
import { BigGoal } from '../types';
import { formatCurrency, generateId } from '../initialData';

interface BigDreamsProps {
  goals: BigGoal[];
  setGoals: (goals: BigGoal[]) => void;
}

export const BigDreams: React.FC<BigDreamsProps> = ({
  goals,
  setGoals
}) => {
  // Modal state for General Info Add/Edit
  const [isOpen, setIsOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('Nueva Meta de Vida');
  
  // General Info Form fields
  const [gId, setGId] = useState<string | number>('');
  const [gName, setGName] = useState('');
  const [gTarget, setGTarget] = useState('');
  const [gSaved, setGSaved] = useState('');
  const [gPurpose, setGPurpose] = useState('');
  const [gWhy, setGWhy] = useState('');
  const [gHow, setGHow] = useState('');
  const [gSteps, setGSteps] = useState('');
  const [gIcon, setGIcon] = useState('🎯');
  const [gDeadline, setGDeadline] = useState('');

  // Deposit/Abonar modal state
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [depositGoalId, setDepositGoalId] = useState<string | number>('');
  const [depositAmount, setDepositAmount] = useState('');

  // Handle open general modal for ADD
  const openAddModal = () => {
    setModalTitle('Trazar Gran Sueño');
    setGId('');
    setGName('');
    setGTarget('');
    setGSaved('0');
    setGPurpose('');
    setGWhy('');
    setGHow('');
    setGSteps('');
    setGIcon('🎯');
    setGDeadline('');
    setIsOpen(true);
  };

  // Handle open general modal for EDIT
  const openEditModal = (g: BigGoal) => {
    setModalTitle('Modificar Gran Sueño');
    setGId(g.id);
    setGName(g.name);
    setGTarget(String(g.target));
    setGSaved(String(g.saved));
    setGPurpose(g.purpose || '');
    setGWhy(g.why || '');
    setGHow(g.how || '');
    setGSteps((g.steps || []).join('\n'));
    setGIcon(g.icon || '🎯');
    setGDeadline(g.deadline || '');
    setIsOpen(true);
  };

  // Open quick deposit modal
  const openDepositModal = (id: string | number) => {
    setDepositGoalId(id);
    setDepositAmount('');
    setIsDepositOpen(true);
  };

  // Save General details
  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gName.trim() || !gTarget || parseFloat(gTarget) <= 0) {
      alert('Ingresa el nombre del sueño y el monto objetivo de ahorro.');
      return;
    }

    const stepsArray = gSteps
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const isEditing = !!gId;
    const existingGoal = goals.find(g => g.id === gId);

    // Persist checks state if editing, otherwise default to unchecked
    const newStepsDone = stepsArray.map((_, idx) => {
      if (isEditing && existingGoal) {
        return existingGoal.stepsDone[idx] || false;
      }
      return false;
    });

    const newGoal: BigGoal = {
      id: gId || generateId(),
      name: gName.trim(),
      target: parseFloat(gTarget),
      saved: parseFloat(gSaved) || 0,
      purpose: gPurpose.trim() || undefined,
      why: gWhy.trim() || undefined,
      how: gHow.trim() || undefined,
      steps: stepsArray,
      stepsDone: newStepsDone,
      icon: gIcon.trim() || '🎯',
      deadline: gDeadline || undefined
    };

    if (isEditing) {
      setGoals(goals.map(g => g.id === gId ? newGoal : g));
    } else {
      setGoals([...goals, newGoal]);
    }

    setIsOpen(false);
  };

  // Process Quick Deposit
  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('Ingresa una cifra válida de abono.');
      return;
    }

    setGoals(goals.map(g => {
      if (g.id === depositGoalId) {
        const afterSaved = Math.min(g.saved + amt, g.target);
        return {
          ...g,
          saved: afterSaved
        };
      }
      return g;
    }));

    setIsDepositOpen(false);
  };

  // Toggle checklist steps checks
  const toggleChecklistStep = (goalId: string | number, stepIdx: number) => {
    setGoals(goals.map(g => {
      if (g.id === goalId) {
        const updatedChecks = [...g.stepsDone];
        updatedChecks[stepIdx] = !updatedChecks[stepIdx];
        return {
          ...g,
          stepsDone: updatedChecks
        };
      }
      return g;
    }));
  };

  // Delete big goal
  const handleDeleteGoal = (id: string | number) => {
    if (confirm('¿Estás seguro de que deseas eliminar permanentemente este objetivo de vida y sus registros de avances?')) {
      setGoals(goals.filter(g => g.id !== id));
    }
  };

  return (
    <div id="big-dreams-panel" className="animate-fade-in space-y-6">
      
      {/* HEADER BAR */}
      <div id="dreams-header" className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 id="dreams-title" className="font-display text-2xl md:text-3xl font-semibold text-brand-charcoal leading-tight flex items-center gap-2">
            Metas Consolidadas
          </h2>
          <p id="dreams-subtitle" className="text-xs md:text-sm text-brand-gray mt-1">
            Los sueños económicos toman forma cuando divides metas en pasos pequeños, defines su por qué y aportas metódicamente.
          </p>
        </div>
        <button
          id="btn-add-dream"
          onClick={openAddModal}
          className="self-start md:self-auto bg-brand-charcoal hover:bg-neutral-800 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5" />
          Trazar Gran Sueño
        </button>
      </div>

      {/* RENDER LIFE CARDS */}
      <div id="life-goals-grid" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {goals.length === 0 ? (
          <div id="dreams-empty" className="col-span-2 bg-white border border-[#EBE7DF] rounded-2xl p-12 text-center text-brand-light-gray">
            <Gem className="w-12 h-12 mx-auto text-brand-amber opacity-35 mb-3" />
            <p className="text-base font-semibold text-brand-gray">¿Cuál es tu próximo gran sueño o fondo sólido?</p>
            <p className="text-xs max-w-md mx-auto mt-1 leading-relaxed">
              Consigue disciplina enfocándote en lo que verdaderamente importa: tu primer auto, liquidar deudas, tu libertad financiera o tu jubilación digna.
            </p>
            <button
              onClick={openAddModal}
              className="mt-5 bg-brand-charcoal hover:bg-neutral-800 text-white text-xs font-bold px-4.5 py-2.5 rounded-md shadow-sm transition-colors cursor-pointer"
            >
              Comenzar a Planificar Sueño
            </button>
          </div>
        ) : (
          goals.map(g => {
            const progress = g.target > 0 ? (g.saved / g.target) * 100 : 0;
            const completedPercent = Math.min(Math.round(progress), 100);
            const isCompleted = progress >= 100;

            const totalSteps = g.steps.length;
            const doneSteps = g.stepsDone.filter(Boolean).length;

            const remainingValue = Math.max(0, g.target - g.saved);

            // Compute countdown days
            let daysLeft: number | null = null;
            if (g.deadline) {
              const diffTime = new Date(g.deadline).getTime() - new Date().getTime();
              daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            }

            return (
              <div 
                key={g.id} 
                id={`dream-card-${g.id}`}
                className="bg-white border border-[#EBE7DF] hover:border-[#D0CBBE] rounded-2.5xl p-5 md:p-6 flex flex-col justify-between shadow-xs transition-colors duration-150 relative space-y-4"
              >
                {/* Header Information and percentage check */}
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-11 h-11 bg-brand-green-light rounded-full flex items-center justify-center font-serif text-lg flex-shrink-0 animate-scale-in">
                        {g.icon}
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-sans text-[15px] font-bold text-brand-charcoal truncate">{g.name}</h3>
                        {g.purpose && (
                          <p className="text-[11px] text-brand-gray font-medium truncate mt-0.5">{g.purpose}</p>
                        )}
                      </div>
                    </div>
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full flex-shrink-0 ${
                      isCompleted ? 'bg-brand-green-light text-brand-green' : 'bg-brand-amber-light text-brand-amber'
                    }`}>
                      {isCompleted ? '¡Logrado!' : `${completedPercent}%`}
                    </span>
                  </div>

                  {/* Meter line */}
                  <div className="w-full h-2 bg-[#EAE5DC] rounded-full overflow-hidden mt-4">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        isCompleted ? 'bg-brand-green' : 'bg-brand-amber'
                      }`}
                      style={{ width: `${completedPercent}%` }}
                    />
                  </div>

                  {/* Summary grid values */}
                  <div className="grid grid-cols-3 gap-3 my-5 font-sans">
                    <div className="bg-[#FAF9F6] border border-[#EBE7DF]/60 p-2.5 rounded-xl text-center">
                      <p className="text-[9px] uppercase tracking-wider font-extrabold text-brand-gray">Ahorrado</p>
                      <p className="font-display text-sm md:text-base font-bold text-brand-green leading-tight mt-0.5 truncate">{formatCurrency(g.saved)}</p>
                    </div>
                    <div className="bg-[#FAF9F6] border border-[#EBE7DF]/60 p-2.5 rounded-xl text-center">
                      <p className="text-[9px] uppercase tracking-wider font-extrabold text-brand-gray">Faltante</p>
                      <p className="font-display text-sm md:text-base font-bold text-brand-red leading-tight mt-0.5 truncate">{formatCurrency(remainingValue)}</p>
                    </div>
                    <div className="bg-[#FAF9F6] border border-[#EBE7DF]/60 p-2.5 rounded-xl text-center">
                      <p className="text-[9px] uppercase tracking-wider font-extrabold text-brand-gray">
                        {g.deadline ? 'Días Restantes' : 'Monto Total'}
                      </p>
                      <p className="font-display text-sm md:text-base font-bold text-brand-charcoal leading-tight mt-0.5 truncate">
                        {g.deadline 
                          ? (daysLeft !== null && daysLeft > 0 ? `${daysLeft}D` : 'Excedido') 
                          : formatCurrency(g.target)
                        }
                      </p>
                    </div>
                  </div>

                  {/* Motivations deep purpose details */}
                  {(g.why || g.how) && (
                    <div className="p-3 bg-[#FAFBF9] border border-brand-green/20 text-[11px] leading-relaxed rounded-xl text-brand-charcoal space-y-1.5 font-medium">
                      {g.why && (
                        <p><strong className="text-[9px] uppercase tracking-wider text-brand-green block leading-none mb-0.5">Visión Profunda y Por Qué</strong> "{g.why}"</p>
                      )}
                      {g.how && (
                        <p><strong className="text-[9px] uppercase tracking-wider text-brand-green block leading-none mb-0.5">Estrategia Práctica</strong> {g.how}</p>
                      )}
                    </div>
                  )}

                  {/* Checklists steps */}
                  {totalSteps > 0 && (
                    <div className="border-t border-[#EBE7DF]/60 pt-4 mt-4">
                      <p className="text-[10px] uppercase tracking-widest text-brand-gray font-bold mb-2 flex items-center justify-between">
                        <span>Plan de Acción</span>
                        <span>{doneSteps} / {totalSteps} completados</span>
                      </p>
                      <div className="space-y-1.5">
                        {g.steps.map((step, idx) => {
                          const isStepChecked = g.stepsDone[idx] || false;
                          return (
                            <label 
                              key={idx} 
                              className="flex items-start gap-2.5 text-xs text-brand-charcoal cursor-pointer select-none font-medium py-0.5 group"
                            >
                              <input 
                                type="checkbox"
                                checked={isStepChecked}
                                onChange={() => toggleChecklistStep(g.id, idx)}
                                className="rounded border-brand-light-gray text-brand-green focus:ring-0 w-4 h-4 cursor-pointer mt-0.5"
                              />
                              <span className={`transition-all duration-100 ${
                                isStepChecked ? 'line-through text-brand-light-gray font-normal' : 'group-hover:text-brand-charcoal'
                              }`}>
                                {step}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Operations bar controls */}
                <div className="border-t border-[#EBE7DF]/60 pt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(g)}
                      className="p-1 px-2.5 text-xs font-bold text-brand-gray hover:text-brand-charcoal hover:bg-[#FAF9F6] rounded transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Ajustar Plan
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(g.id)}
                      className="p-1 px-2.5 text-xs font-bold text-brand-gray hover:text-brand-red hover:bg-brand-red-light rounded transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Eliminar
                    </button>
                  </div>
                  
                  {!isCompleted && (
                    <button
                      onClick={() => openDepositModal(g.id)}
                      className="bg-[#12795B]/10 hover:bg-[#12795B]/15 text-[#12795B] font-bold text-xs px-4 py-2 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-brand-amber" />
                      Abonar Ahorro
                    </button>
                  )}
                </div>

                {g.deadline && (
                  <span className="absolute bottom-4 right-4 md:right-6 text-[9px] font-mono text-brand-light-gray pointer-events-none flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Límite: {g.deadline}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* QUICK DEPOSIT POPUP */}
      {isDepositOpen && (
        <div id="deposit-modal-overlay" className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 md:p-7 max-w-sm w-full shadow-xl border border-[#EBE7DF]/80 animate-slide-up">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#EBE7DF]/60 pb-3.5 mb-5 font-sans">
              <h3 className="font-display text-base font-bold text-brand-charcoal">
                Abonar a Ahorro
              </h3>
              <button 
                onClick={() => setIsDepositOpen(false)}
                className="text-brand-gray hover:text-brand-charcoal text-base font-semibold"
              >
                &times;
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleDepositSubmit} className="space-y-4 font-sans">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-brand-gray">¿Cuánto vas a depositar o apartar? ($ MXN) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-brand-gray font-bold text-xs select-none">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="0.00"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="pl-7 pr-4 py-2.5 text-xs bg-[#FAF9F6] border border-[#EBE7DF] rounded-lg focus:outline-none focus:bg-white focus:border-brand-charcoal font-sans font-bold w-full"
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* Action */}
              <div className="flex items-center justify-end gap-2 border-t border-[#EBE7DF]/60 pt-4 mt-5">
                <button
                  type="button"
                  onClick={() => setIsDepositOpen(false)}
                  className="px-4 py-2 text-xs font-semibold border border-[#EBE7DF] rounded-lg text-brand-gray hover:text-brand-charcoal hover:bg-[#FAF9F6] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#12795B] text-white hover:bg-[#0E5E46] rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  Depositar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GENERAL EDIT POPUP DIALOG */}
      {isOpen && (
        <div id="general-dream-overlay" className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 md:p-7 max-w-lg w-full shadow-xl border border-[#EBE7DF]/80 animate-slide-up max-h-[90vh] overflow-y-auto">
            
            {/* Head */}
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

            {/* Inputs */}
            <form onSubmit={handleSaveGeneral} className="space-y-4 font-sans text-left">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-brand-gray">Nombre del Sueño *</label>
                  <input
                    type="text"
                    placeholder="Ej. Fondo de Alivio, Carro Familiar"
                    value={gName}
                    onChange={(e) => setGName(e.target.value)}
                    className="p-2.5 text-xs bg-[#FAF9F6] border border-[#EBE7DF] rounded-lg focus:outline-none focus:bg-white focus:border-brand-charcoal"
                    required
                  />
                </div>

                {/* Target */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-brand-gray">Meta Económica Total ($) *</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="0.00"
                    value={gTarget}
                    onChange={(e) => setGTarget(e.target.value)}
                    className="p-2.5 text-xs bg-[#FAF9F6] border border-[#EBE7DF] rounded-lg focus:outline-none focus:bg-white focus:border-brand-charcoal font-sans font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Start Balance */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-brand-gray font-sans">Ahorro Inicial Acumulado ($)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0.00"
                    value={gSaved}
                    onChange={(e) => setGSaved(e.target.value)}
                    className="p-2.5 text-xs bg-[#FAF9F6] border border-[#EBE7DF] rounded-lg focus:outline-none focus:bg-white focus:border-brand-charcoal font-sans"
                  />
                </div>

                {/* Emoji Select */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-brand-gray">Ícono Representativo (Emoji)</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={gIcon}
                    onChange={(e) => setGIcon(e.target.value)}
                    className="p-2.5 text-center text-lg bg-[#FAF9F6] border border-[#EBE7DF] rounded-lg focus:outline-none focus:bg-white focus:border-brand-charcoal"
                    title="Pon un emoji motivacional"
                  />
                </div>
              </div>

              {/* Purpose */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-brand-gray">Beneficio Claro / Propósito (Corto) *</label>
                <input
                  type="text"
                  placeholder="Ej. Resguardo de 3 meses de renta en caso de emergencia"
                  value={gPurpose}
                  onChange={(e) => setGPurpose(e.target.value)}
                  className="p-2.5 text-xs bg-[#FAF9F6] border border-[#EBE7DF] rounded-lg focus:outline-none focus:bg-white focus:border-brand-charcoal"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Deep Why */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-brand-gray">Por qué lo quieres (Motivación Profunda)</label>
                  <textarea
                    placeholder="Escribe la tranquilidad, salud o felicidad auténtica que esto traerá a tu vida."
                    value={gWhy}
                    onChange={(e) => setGWhy(e.target.value)}
                    className="p-2.5 text-xs bg-[#FAF9F6] border border-[#EBE7DF] rounded-lg focus:outline-none focus:bg-white focus:border-brand-charcoal min-h-[72px]"
                  />
                </div>

                {/* Practical how */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-brand-gray">Cómo lo lograrás (Estrategia)</label>
                  <textarea
                    placeholder="Ej. Guardar el 10% de mis dividendos o freelance sin excusa."
                    value={gHow}
                    onChange={(e) => setGHow(e.target.value)}
                    className="p-2.5 text-xs bg-[#FAF9F6] border border-[#EBE7DF] rounded-lg focus:outline-none focus:bg-white focus:border-brand-charcoal min-h-[72px]"
                  />
                </div>
              </div>

              {/* Action Steps plan */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-brand-gray flex items-center justify-between">
                  <span>Pasos Pequeños / Checklist (Escribe uno por línea)</span>
                  <span className="text-[10px] text-brand-light-gray font-normal">Opcional</span>
                </label>
                <textarea
                  placeholder="Ej:&#10;Abrir un pagaré de alto rendimiento&#10;Inyectar el bono navideño&#10;Cumplir la meta de ahorro este mes"
                  value={gSteps}
                  onChange={(e) => setGSteps(e.target.value)}
                  className="p-2.5 text-xs bg-[#FAF9F6] border border-[#EBE7DF] rounded-lg focus:outline-none focus:bg-white focus:border-brand-charcoal min-h-[96px] font-mono leading-relaxed"
                />
              </div>

              {/* Deadline */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-brand-gray">Fecha Límite Sugerida</label>
                <input
                  type="date"
                  value={gDeadline}
                  onChange={(e) => setGDeadline(e.target.value)}
                  className="p-2.5 text-xs bg-[#FAF9F6] border border-[#EBE7DF] rounded-lg focus:outline-none focus:border-brand-charcoal font-mono"
                />
              </div>

              {/* Submit triggers */}
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
                  className="px-5 py-2 text-xs font-bold bg-brand-charcoal text-white hover:bg-neutral-800 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1"
                >
                  <CheckCircle className="w-4 h-4" />
                  Guardar Plan de Vida
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
