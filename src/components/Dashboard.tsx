/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  BookOpen, 
  RefreshCw,
  CalendarCheck,
  ChevronRight,
  Sparkles,
  ArrowLeftRight
} from 'lucide-react';
import { Transaction, Category, MonthlyGoal } from '../types';
import { formatCurrency, VERSES, getMonthName } from '../initialData';

interface DashboardProps {
  transactions: Transaction[];
  currentMonth: string;
  incomeCats: Category[];
  expenseCats: Category[];
  monthlyGoals: MonthlyGoal[];
  verse: string;
  setVerse: (v: string) => void;
  onNavigateToTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  transactions,
  currentMonth,
  incomeCats,
  expenseCats,
  monthlyGoals,
  verse,
  setVerse,
  onNavigateToTab
}) => {
  // Rotate verse manually
  const rotateVerse = () => {
    const idx = Math.floor(Math.random() * VERSES.length);
    setVerse(VERSES[idx]);
  };

  // Monthly stats
  const monthTxs = transactions.filter(t => t.date && t.date.startsWith(currentMonth));
  const incomeSum = monthTxs.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const expenseSum = monthTxs.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const netEarnings = incomeSum - expenseSum;

  // Pie chart computations
  const expenseTxs = monthTxs.filter(t => t.type === 'expense');
  const catSums: { [key: string]: number } = {};
  expenseTxs.forEach(t => {
    catSums[t.cat] = (catSums[t.cat] || 0) + t.amount;
  });

  const chartData = Object.entries(catSums)
    .map(([name, value]) => {
      const catObj = expenseCats.find(c => c.name === name);
      return {
        name,
        value,
        color: catObj ? catObj.color : '#858076'
      };
    })
    .sort((a, b) => b.value - a.value);

  const totalExpense = chartData.reduce((acc, d) => acc + d.value, 0);

  // SVG parameters for custom donut chart
  let cumulativePercent = 0;
  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  // Recent 5 transactions
  const sortedRecents = [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  return (
    <div id="dashboard-tab-panel" className="animate-fade-in space-y-6">
      {/* HEADER ROW */}
      <div id="dash-header" className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 id="dash-title" className="font-display text-2xl md:text-3.5xl font-semibold text-brand-charcoal leading-tight">
            Resumen Financiero
          </h2>
          <p id="dash-subtitle" className="text-xs md:text-sm text-brand-gray mt-1">
            Revisión integral de tu estabilidad, control de gastos e incentivos de disciplina.
          </p>
        </div>
        <button 
          id="btn-quick-transaction"
          onClick={() => onNavigateToTab('transactions')}
          className="self-start md:self-auto bg-brand-charcoal text-white hover:bg-neutral-800 text-xs font-semibold px-4 py-2.5 rounded-lg transition-all duration-150 shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-brand-amber" />
          Registrar Movimiento
        </button>
      </div>

      {/* DISCIPLINE VERSE BAR */}
      <div 
        id="discipline-verse-bar" 
        className="relative bg-brand-green-light border-l-4 border-brand-green/80 p-4 rounded-r-xl shadow-xs text-brand-green flex flex-col md:flex-row items-start md:items-center justify-between gap-3"
      >
        <div className="flex gap-2.5 items-start">
          <BookOpen className="w-5 h-5 text-brand-green/80 flex-shrink-0 mt-0.5 md:mt-0" />
          <div className="text-xs md:text-sm leading-relaxed text-brand-green font-medium italic">
            {verse}
          </div>
        </div>
        <button 
          id="btn-rotate-verse"
          onClick={rotateVerse}
          className="text-brand-green/70 hover:text-brand-green p-1 hover:bg-brand-green/10 rounded transition-all duration-150 self-end md:self-auto flex items-center gap-1.5 text-xs font-semibold"
          title="Siguiente Consejos"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Inspirar</span>
        </button>
      </div>

      {/* METRICS LEVEL STATS */}
      <div id="dash-metrics-grid" className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        {/* Income Card */}
        <div id="stat-card-income" className="bg-white border border-[#EBE7DF] rounded-xl p-5 shadow-xs flex flex-col relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-brand-gray tracking-wide uppercase">Ingresos de este Mes</span>
            <div className="w-8 h-8 rounded-full bg-brand-green-light flex items-center justify-center text-brand-green">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <span className="font-display text-2xl md:text-3xl font-semibold text-brand-green tracking-tight">
            {formatCurrency(incomeSum)}
          </span>
          <p className="text-[11px] text-brand-gray mt-2 font-medium">Incrementa tu abasto con persistencia constructiva.</p>
          <div className="absolute top-0 left-0 w-full h-[3px] bg-brand-green/60 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200" />
        </div>

        {/* Expense Card */}
        <div id="stat-card-expense" className="bg-white border border-[#EBE7DF] rounded-xl p-5 shadow-xs flex flex-col relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-brand-gray tracking-wide uppercase">Gastos de este Mes</span>
            <div className="w-8 h-8 rounded-full bg-brand-red-light flex items-center justify-center text-brand-red">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <span className="font-display text-2xl md:text-3xl font-semibold text-brand-red tracking-tight">
            {formatCurrency(expenseSum)}
          </span>
          <p className="text-[11px] text-brand-gray mt-2 font-medium">El sabio vigila los pequeños desembolsos innecesarios.</p>
          <div className="absolute top-0 left-0 w-full h-[3px] bg-brand-red/60 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200" />
        </div>

        {/* Available Savings Card */}
        <div id="stat-card-savings" className="bg-white border border-[#EBE7DF] rounded-xl p-5 shadow-xs flex flex-col relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-brand-gray tracking-wide uppercase">Rendimiento (Remanente)</span>
            <div className="w-8 h-8 rounded-full bg-brand-amber-light flex items-center justify-center text-brand-amber">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <span 
            className={`font-display text-2xl md:text-3xl font-semibold tracking-tight ${
              netEarnings >= 0 ? 'text-brand-charcoal' : 'text-brand-red'
            }`}
          >
            {formatCurrency(netEarnings)}
          </span>
          <p className="text-[11px] text-brand-gray mt-2 font-medium">
            {netEarnings >= 0 ? 'Excedente óptimo encaminado a tus proyectos grandes.' : 'Alerta: Tus gastos exceden los límites de tu ingreso mensual.'}
          </p>
          <div className="absolute top-0 left-0 w-full h-[3px] bg-brand-amber/60 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200" />
        </div>
      </div>

      {/* DETAILED CATEGORY DONUT CHART & RECENT MOVS BENTO */}
      <div id="dash-bento-grid-upper" className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* CHART CONTAINER CARD */}
        <div id="bento-expenses-chart" className="bg-white border border-[#EBE7DF] rounded-2xl p-5 md:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-sans text-[13px] font-bold text-brand-gray uppercase tracking-widest mb-4">
              Gastos por Categoría
            </h3>
            
            {chartData.length === 0 ? (
              <div className="h-60 flex flex-col items-center justify-center text-center text-brand-light-gray">
                <PieChartFallback />
                <p className="text-sm mt-3 font-medium text-brand-gray">Sin gastos registrados este mes</p>
                <p className="text-xs">Los desembolsos se desglosarán en esta sección.</p>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
                {/* SVG Radial Chart */}
                <div className="relative w-44 h-44 flex-shrink-0 flex items-center justify-center">
                  <svg className="w-44 h-44 -rotate-90 transform" viewBox="-1.2 -1.2 2.4 2.4 font-sans">
                    {/* Circle Background */}
                    <circle cx="0" cy="0" r="1.0" fill="#FCFCFB" />
                    {chartData.map((d, idx) => {
                      const percentage = totalExpense > 0 ? d.value / totalExpense : 0;
                      if (percentage === 0) return null;
                      
                      const startPercent = cumulativePercent;
                      cumulativePercent += percentage;
                      const [startX, startY] = getCoordinatesForPercent(startPercent);
                      const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
                      const largeArcFlag = percentage > 0.5 ? 1 : 0;
                      
                      const pathData = [
                        `M ${startX} ${startY}`,
                        `A 1.0 1.0 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                        `L 0 0`
                      ].join(' ');

                      return (
                        <path 
                          key={idx} 
                          d={pathData} 
                          fill={d.color} 
                          className="hover:opacity-90 transition-opacity cursor-pointer stroke-white stroke-[0.02]" 
                        >
                          <title>{d.name}: {formatCurrency(d.value)} ({Math.round(percentage * 100)}%)</title>
                        </path>
                      );
                    })}
                    {/* Cutout Ring */}
                    <circle cx="0" cy="0" r="0.65" fill="#FFFFFF" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-4">
                    <span className="text-[10px] text-brand-gray uppercase tracking-wider font-semibold">Total Gastado</span>
                    <span className="font-display text-[15px] sm:text-[17px] font-bold text-brand-charcoal leading-tight truncate max-w-[124px]">
                      {formatCurrency(totalExpense)}
                    </span>
                  </div>
                </div>

                {/* Legend list */}
                <div className="flex-1 space-y-1.5 w-full max-h-[176px] overflow-y-auto pr-1">
                  {chartData.map((d, index) => {
                    const percentage = totalExpense > 0 ? (d.value / totalExpense) * 100 : 0;
                    return (
                      <div key={index} className="flex items-center justify-between text-xs font-sans gap-2">
                        <span className="flex items-center gap-1.5 font-medium text-brand-charcoal truncate">
                          <span 
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                            style={{ backgroundColor: d.color }} 
                          />
                          <span className="truncate">{d.name}</span>
                        </span>
                        <span className="font-bold text-brand-gray text-right flex-shrink-0">
                          {formatCurrency(d.value)} <span className="text-[10px] text-brand-light-gray font-normal ml-0.5">({Math.round(percentage)}%)</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <div className="border-t border-[#EBE7DF]/60 pt-4 mt-2 flex items-center justify-between">
            <span className="text-[11px] text-brand-gray font-medium">Categorías activas: {chartData.length}</span>
            <button 
              id="goto-budget"
              onClick={() => onNavigateToTab('budget')}
              className="text-[11px] text-brand-green font-bold flex items-center hover:underline cursor-pointer"
            >
              Controlar Presupuestos <ChevronRight className="w-3 h-3 ml-0.5" />
            </button>
          </div>
        </div>

        {/* RECENTS SNAPSHOT TABLE */}
        <div id="bento-recent-txs" className="bg-white border border-[#EBE7DF] rounded-2xl p-5 md:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-sans text-[13px] font-bold text-brand-gray uppercase tracking-widest mb-4">
              Últimos Movimientos
            </h3>
            <div className="space-y-2.5">
              {sortedRecents.length === 0 ? (
                <div className="h-48 flex flex-col items-center justify-center text-center text-brand-light-gray">
                  <ArrowLeftRight className="w-8 h-8 opacity-40 mb-1" />
                  <p className="text-sm font-medium">Aún no hay movimientos</p>
                  <p className="text-xs">Registra tus transacciones para calibrar el sistema.</p>
                </div>
              ) : (
                sortedRecents.map((t) => {
                  const isIncome = t.type === 'income';
                  const catColorValue = isIncome 
                    ? (incomeCats.find(c => c.name === t.cat)?.color || '#12795B')
                    : (expenseCats.find(c => c.name === t.cat)?.color || '#858076');

                  return (
                    <div 
                      key={t.id} 
                      className="flex items-center gap-3 p-2.5 rounded-lg border border-[#EBE7DF]/40 bg-[#FAFAFA]/70 hover:bg-[#FAFAFA] transition-colors"
                    >
                      <div 
                        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white font-serif font-bold text-xs`}
                        style={{ backgroundColor: catColorColorFilter(catColorValue) }}
                      >
                        {isIncome ? 'I' : 'G'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-brand-charcoal truncate">{t.desc}</p>
                        <p className="text-[10px] text-brand-gray font-medium truncate">
                          {t.cat} · <span className="font-mono">{t.date}</span>
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0 font-sans">
                        <span className={`text-xs font-bold leading-none ${isIncome ? 'text-brand-green' : 'text-brand-red'}`}>
                          {isIncome ? '+' : '-'}{formatCurrency(t.amount)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          <div className="border-t border-[#EBE7DF]/60 pt-4 mt-3 flex items-center justify-between">
            <span className="text-[11px] text-brand-gray font-medium">Movimientos totales: {transactions.length}</span>
            <button 
              id="goto-transactions"
              onClick={() => onNavigateToTab('transactions')}
              className="text-[11px] text-brand-green font-bold flex items-center hover:underline cursor-pointer"
            >
              Historial Completo <ChevronRight className="w-3 h-3 ml-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* MONTHLY FOCUS GOALS CHECKS */}
      <div id="dash-monthly-goals" className="bg-white border border-[#EBE7DF] rounded-2xl p-5 md:p-6 shadow-xs">
        <h3 className="font-sans text-[13px] font-bold text-brand-gray uppercase tracking-widest mb-4 flex items-center gap-1.5">
          <CalendarCheck className="w-4.5 h-4.5 text-brand-green" />
          Enfoque de este Mes
        </h3>

        {monthlyGoals.length === 0 ? (
          <div className="py-6 flex flex-col items-center justify-center text-center text-brand-light-gray bg-[#FAF9F6] rounded-xl border border-dashed border-[#EBE7DF]">
            <p className="text-xs font-semibold text-brand-gray">Sin objetivos definidos para el mes de {getMonthName(currentMonth)}</p>
            <button 
              onClick={() => onNavigateToTab('monthly')}
              className="text-xs text-brand-green font-bold mt-2 hover:underline cursor-pointer"
            >
              Crear Metas Mensuales
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {monthlyGoals.map((g) => {
              const pct = calcMonthlyProgress(g, transactions, currentMonth);
              const roundedPct = Math.min(Math.round(pct), 100);
              const isDone = pct >= 100;
              const clr = isDone ? 'bg-brand-green' : pct >= 60 ? 'bg-brand-amber' : 'bg-brand-green/70';

              return (
                <div key={g.id} className="border border-[#EBE7DF] bg-[#FAFAFA] rounded-xl p-4 flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-brand-charcoal truncate">{g.name}</h4>
                      <p className="text-[10px] text-brand-gray tracking-wide uppercase font-medium mt-0.5">
                        {g.type === 'saving' ? 'Metas de Ahorro' : g.type === 'spending' ? 'Límite de Gasto' : g.type === 'income' ? 'Ingreso Mínimo' : 'Foco Directo'}
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                      isDone ? 'bg-brand-green-light text-brand-green' : 'bg-[#EAE5DC] text-brand-gray'
                    }`}>
                      {roundedPct}%
                    </span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-[#EAE5DC] rounded-full overflow-hidden mt-2 mb-3">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${clr}`}
                      style={{ width: `${roundedPct}%` }}
                    />
                  </div>
                  
                  {g.why && (
                    <p className="text-[10px] text-brand-gray font-medium italic truncate mt-0.5">
                      💬 "{g.why}"
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper color fallback
function catColorColorFilter(hexStr: string) {
  if (!hexStr) return '#1E1C19';
  return hexStr;
}

// Calculate progress dynamically
const calcMonthlyProgress = (g: MonthlyGoal, txs: Transaction[], month: string): number => {
  const mtxs = txs.filter(t => t.date && t.date.startsWith(month));
  
  if (g.type === 'saving') {
    const inc = mtxs.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const exp = mtxs.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const net = inc - exp;
    return g.target > 0 ? (net / g.target) * 100 : 0;
  }
  
  if (g.type === 'income') {
    const inc = mtxs.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    return g.target > 0 ? (inc / g.target) * 100 : 0;
  }
  
  if (g.type === 'spending') {
    const exp = mtxs.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    if (g.target <= 0) return 0;
    // Over spending reduces percentage starting from 100%
    const ratio = exp / g.target;
    return ratio >= 1 ? 0 : (1 - ratio) * 100;
  }

  return 0; // custom goals tracked with status
};

// Placeholder pie icon
const PieChartFallback = () => (
  <svg className="w-12 h-12 text-[#EAE5DC]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
  </svg>
);
