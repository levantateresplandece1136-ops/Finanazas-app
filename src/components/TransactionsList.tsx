/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Filter, 
  Calendar,
  Tag,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  Info
} from 'lucide-react';
import { Transaction, Category } from '../types';
import { formatCurrency, generateId } from '../initialData';

interface TransactionsListProps {
  transactions: Transaction[];
  setTransactions: (txs: Transaction[]) => void;
  currentMonth: string;
  incomeCats: Category[];
  expenseCats: Category[];
}

export const TransactionsList: React.FC<TransactionsListProps> = ({
  transactions,
  setTransactions,
  currentMonth,
  incomeCats,
  expenseCats
}) => {
  // Filters
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCat, setFilterCat] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAllHistory, setShowAllHistory] = useState<boolean>(false);

  // Modal State
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>('Nuevo Movimiento');
  
  // Form fields
  const [txId, setTxId] = useState<string | number>('');
  const [txType, setTxType] = useState<'income' | 'expense'>('expense');
  const [txCat, setTxCat] = useState<string>('');
  const [txDesc, setTxDesc] = useState<string>('');
  const [txAmount, setTxAmount] = useState<string>('');
  const [txDate, setTxDate] = useState<string>('');
  const [txNote, setTxNote] = useState<string>('');

  // Handle open modal for ADD
  const openAddModal = () => {
    setModalTitle('Nuevo Movimiento');
    setTxId('');
    setTxType('expense');
    const availableCats = expenseCats;
    setTxCat(availableCats[0]?.name || '');
    setTxDesc('');
    setTxAmount('');
    
    // Set default date to current month, plus today's day
    const now = new Date();
    const currentDay = String(now.getDate()).padStart(2, '0');
    setTxDate(`${currentMonth}-${currentDay}`);
    setTxNote('');
    
    setIsOpen(true);
  };

  // Handle open modal for EDIT
  const openEditModal = (t: Transaction) => {
    setModalTitle('Modificar Movimiento');
    setTxId(t.id);
    setTxType(t.type);
    setTxCat(t.cat);
    setTxDesc(t.desc);
    setTxAmount(String(t.amount));
    setTxDate(t.date);
    setTxNote(t.note || '');
    setIsOpen(true);
  };

  // Switch type triggers category preset adjustment
  const handleTypeChange = (type: 'income' | 'expense') => {
    setTxType(type);
    const list = type === 'income' ? incomeCats : expenseCats;
    setTxCat(list[0]?.name || '');
  };

  // Handle Save
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txDesc.trim() || !txAmount || parseFloat(txAmount) <= 0 || !txDate) {
      alert('Por favor complete los campos obligatorios con valores válidos.');
      return;
    }

    const updatedTx: Transaction = {
      id: txId || generateId(),
      type: txType,
      cat: txCat,
      desc: txDesc.trim(),
      amount: parseFloat(txAmount),
      date: txDate,
      note: txNote.trim() || undefined
    };

    if (txId) {
      // Edit
      setTransactions(transactions.map(t => t.id === txId ? updatedTx : t));
    } else {
      // Add
      setTransactions([...transactions, updatedTx]);
    }

    setIsOpen(false);
  };

  // Handle Delete
  const handleDelete = (id: string | number) => {
    if (confirm('¿Estás seguro de que deseas eliminar este movimiento permanentemente?')) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  // Filter items
  const activeMonthTxs = showAllHistory 
    ? transactions 
    : transactions.filter(t => t.date && t.date.startsWith(currentMonth));

  const filteredTxs = activeMonthTxs.filter(t => {
    const matchesType = filterType === 'all' ? true : t.type === filterType;
    const matchesCat = filterCat === 'all' ? true : t.cat === filterCat;
    const matchesSearch = searchQuery.trim() === ''
      ? true 
      : t.desc.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (t.note && t.note.toLowerCase().includes(searchQuery.toLowerCase())) ||
        t.cat.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesCat && matchesSearch;
  }).sort((a, b) => b.date.localeCompare(a.date));

  // Category options for filter selector
  const allAvailableCats = [...incomeCats, ...expenseCats];

  return (
    <div id="transactions-tab-panel" className="animate-fade-in space-y-6">
      
      {/* HEADER SECTION */}
      <div id="txs-header" className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 id="txs-title" className="font-display text-2xl md:text-3xl font-semibold text-brand-charcoal leading-tight">
            Movimientos y Registro
          </h2>
          <p id="txs-subtitle" className="text-xs md:text-sm text-brand-gray mt-1">
            Visualiza tu bitácora de flujos. Registra aportaciones o deduce egresos disciplinadamente.
          </p>
        </div>
        <button
          id="btn-add-tx"
          onClick={openAddModal}
          className="self-start md:self-auto bg-brand-charcoal hover:bg-neutral-800 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nuevo Movimiento
        </button>
      </div>

      {/* FILTER & SEARCH TOOLS BAR */}
      <div id="search-filter-controls" className="bg-white border border-[#EBE7DF] rounded-xl p-4 gap-4 flex flex-col lg:flex-row lg:items-center justify-between shadow-xs">
        
        {/* Left components: input & selectors */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 text-brand-light-gray absolute left-3 top-3" />
            <input 
              id="tx-search-input"
              type="text"
              placeholder="Buscar por descripción..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 text-xs border border-[#EBE7DF] rounded-lg bg-[#FAF9F6] text-brand-charcoal focus:bg-white focus:outline-none focus:border-brand-charcoal transition-colors w-full"
            />
          </div>

          {/* Type Selector */}
          <div className="flex items-center gap-1 border border-[#EBE7DF] bg-[#FAF9F6] rounded-lg p-1">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 text-[11px] font-bold rounded-md transition-colors ${
                filterType === 'all' 
                  ? 'bg-brand-charcoal text-white' 
                  : 'text-brand-gray hover:text-brand-charcoal'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`px-3 py-1 text-[11px] font-bold rounded-md transition-colors ${
                filterType === 'income' 
                  ? 'bg-brand-green/10 text-brand-green' 
                  : 'text-brand-gray hover:text-brand-charcoal'
              }`}
            >
              Ingresos
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`px-3 py-1 text-[11px] font-bold rounded-md transition-colors ${
                filterType === 'expense' 
                  ? 'bg-brand-red/10 text-brand-red' 
                  : 'text-brand-gray hover:text-brand-charcoal'
              }`}
            >
              Gastos
            </button>
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              id="filter-category-select"
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value)}
              className="pl-3 pr-8 py-1.5 text-xs border border-[#EBE7DF] rounded-lg bg-[#FAF9F6] text-brand-charcoal focus:outline-none appearance-none cursor-pointer"
            >
              <option value="all">Todas las Categorías</option>
              {allAvailableCats.map(c => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
            <Tag className="w-3 h-3 text-brand-light-gray absolute right-2.5 top-3.5 pointer-events-none" />
          </div>
        </div>

        {/* Right components: History Toggle and Counter */}
        <div className="flex items-center justify-between lg:justify-end gap-4 border-t lg:border-t-0 border-[#EBE7DF]/60 pt-3 lg:pt-0">
          <label className="flex items-center gap-2 text-xs font-semibold text-brand-gray select-none cursor-pointer">
            <input 
              type="checkbox"
              checked={showAllHistory}
              onChange={(e) => {
                setShowAllHistory(e.target.checked);
                setFilterCat('all'); // reset to avoid mismatch
              }}
              className="rounded border-[#EBE7DF] text-brand-charcoal focus:ring-0 w-3.5 h-3.5 cursor-pointer"
            />
            <span>Historial histórico completo</span>
          </label>
          <span className="text-[11px] font-bold text-brand-gray bg-[#FAF9F6] px-2.5 py-1 rounded-sm border border-[#EBE7DF]/80">
            {filteredTxs.length} Movimientos
          </span>
        </div>
      </div>

      {/* DATA JOURNAL TABLE */}
      {filteredTxs.length === 0 ? (
        <div id="tx-empty-slate" className="bg-white border border-[#EBE7DF] rounded-xl p-12 text-center text-brand-light-gray">
          <ArrowDownLeft className="w-10 h-10 mx-auto opacity-30 mb-2.5 text-brand-light-gray" />
          <p className="text-base font-semibold text-brand-gray">Sin movimientos registrados</p>
          <p className="text-xs max-w-sm mx-auto mt-1">
            Ninguna transferencia coincide con la consulta. Empieza pulsando "Nuevo Movimiento" para inyectar datos de control.
          </p>
        </div>
      ) : (
        <div id="txs-table-wrapper" className="bg-white border border-[#EBE7DF] rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans">
              <thead>
                <tr className="bg-[#FAF9F6] border-b border-[#EBE7DF] text-[10px] uppercase tracking-wider text-brand-gray font-bold">
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Categoría</th>
                  <th className="py-3 px-4">Descripción</th>
                  <th className="py-3 px-4 text-right">Monto</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredTxs.map((t) => {
                  const isIncome = t.type === 'income';
                  const catColorValue = isIncome 
                    ? (incomeCats.find(c => c.name === t.cat)?.color || '#12795B')
                    : (expenseCats.find(c => c.name === t.cat)?.color || '#858076');

                  return (
                    <tr 
                      key={t.id} 
                      className="border-b border-[#EBE7DF]/55 hover:bg-[#FAFAFA]/70 transition-colors text-xs"
                    >
                      {/* Date */}
                      <td className="py-3.5 px-4 font-mono font-medium text-brand-gray">
                        {t.date}
                      </td>

                      {/* Type Badge */}
                      <td className="py-3.5 px-4 font-semibold">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isIncome ? 'bg-brand-green-light text-brand-green' : 'bg-brand-red-light text-brand-red'
                        }`}>
                          {isIncome ? (
                            <ArrowUpRight className="w-3 h-3" />
                          ) : (
                            <ArrowDownLeft className="w-3 h-3" />
                          )}
                          {isIncome ? 'Ingreso' : 'Egreso'}
                        </span>
                      </td>

                      {/* Category Label */}
                      <td className="py-3.5 px-4 font-bold">
                        <span className="flex items-center gap-2 truncate max-w-[140px]">
                          <span 
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                            style={{ backgroundColor: catColorValue }} 
                          />
                          <span>{t.cat}</span>
                        </span>
                      </td>

                      {/* Description & Optional Notes */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-brand-charcoal truncate max-w-[280px]">
                          {t.desc}
                        </div>
                        {t.note && (
                          <div className="text-[10px] text-brand-gray italic truncate max-w-[280px] mt-0.5">
                            💬 {t.note}
                          </div>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right font-bold">
                        <span className={isIncome ? 'text-brand-green' : 'text-brand-red'}>
                          {isIncome ? '+' : '-'}{formatCurrency(t.amount)}
                        </span>
                      </td>

                      {/* Operations */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(t)}
                            className="p-1 px-1.5 text-brand-gray hover:text-brand-charcoal hover:bg-[#FAF9F6] rounded transition-colors"
                            title="Modificar"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(t.id)}
                            className="p-1 px-1.5 text-brand-gray hover:text-brand-red hover:bg-brand-red-light rounded transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* POPUP TRIGGER MODAL (CREATE / EDIT) */}
      {isOpen && (
        <div id="tx-modal-overlay" className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 md:p-7 max-w-lg w-full shadow-xl border border-[#EBE7DF]/80 animate-slide-up">
            
            {/* Modal Heading */}
            <div className="flex items-center justify-between border-b border-[#EBE7DF]/60 pb-3.5 mb-5">
              <h3 className="font-display text-lg font-bold text-brand-charcoal flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-amber" />
                {modalTitle}
              </h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-brand-gray hover:text-brand-charcoal text-lg font-semibold"
              >
                &times;
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="space-y-4 font-sans">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Type Selection */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-brand-gray">Tipo de Movimiento</label>
                  <select
                    className="p-2.5 text-xs bg-[#FAF9F6] border border-[#EBE7DF] rounded-lg focus:outline-none focus:border-brand-charcoal"
                    value={txType}
                    onChange={(e) => handleTypeChange(e.target.value as 'income' | 'expense')}
                  >
                    <option value="expense">Gasto / Egreso</option>
                    <option value="income">Ingreso / Depósito</option>
                  </select>
                </div>

                {/* Category Selection */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-brand-gray">Categoría</label>
                  <select
                    className="p-2.5 text-xs bg-[#FAF9F6] border border-[#EBE7DF] rounded-lg focus:outline-none focus:border-brand-charcoal"
                    value={txCat}
                    onChange={(e) => setTxCat(e.target.value)}
                  >
                    {(txType === 'income' ? incomeCats : expenseCats).map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-brand-gray">Descripción *</label>
                <input
                  type="text"
                  placeholder="Ej. Compra de Mandado Semanal, Depósito Freelance"
                  value={txDesc}
                  onChange={(e) => setTxDesc(e.target.value)}
                  className="p-2.5 text-xs bg-[#FAF9F6] border border-[#EBE7DF] rounded-lg focus:outline-none focus:bg-white focus:border-brand-charcoal"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Amount */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-brand-gray">Monto ($ MXN) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    className="p-2.5 text-xs bg-[#FAF9F6] border border-[#EBE7DF] rounded-lg focus:outline-none focus:bg-white focus:border-brand-charcoal font-sans"
                    required
                  />
                </div>

                {/* Date */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-brand-gray">Fecha *</label>
                  <input
                    type="date"
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="p-2.5 text-xs bg-[#FAF9F6] border border-[#EBE7DF] rounded-lg focus:outline-none focus:border-brand-charcoal font-mono"
                    required
                  />
                </div>
              </div>

              {/* Additional Note */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-brand-gray">Comentario / Nota Adicional (Opcional)</label>
                <input
                  type="text"
                  placeholder="Detalle extra de la transacción"
                  value={txNote}
                  onChange={(e) => setTxNote(e.target.value)}
                  className="p-2.5 text-xs bg-[#FAF9F6] border border-[#EBE7DF] rounded-lg focus:outline-none focus:bg-white focus:border-brand-charcoal"
                />
              </div>

              {/* Instructions footer warning */}
              <div id="validation-notice" className="flex gap-2 p-3 bg-brand-amber-light border border-brand-amber/30 text-brand-amber rounded-lg text-[10px] leading-relaxed font-semibold">
                <Info className="w-4 h-4 flex-shrink-0" />
                <p>Asegúrate de que la fecha coincida con tu control mensual para que los balances y gráficos muestren el cálculo idóneo.</p>
              </div>

              {/* Buttons action control */}
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
                  Confirmar Guardado
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
