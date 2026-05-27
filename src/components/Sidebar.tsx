/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  PieChart, 
  CalendarCheck, 
  Target, 
  Tag, 
  Database,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { getMonthName, formatCurrency } from '../initialData';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentMonth: string;
  setCurrentMonth: (month: string) => void;
  totalBalance: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentMonth,
  setCurrentMonth,
  totalBalance
}) => {
  const changeMonth = (delta: number) => {
    const [y, m] = currentMonth.split('-').map(Number);
    let newM = m + delta;
    let newY = y;
    if (newM > 12) {
      newM = 1;
      newY += 1;
    } else if (newM < 1) {
      newM = 12;
      newY -= 1;
    }
    const targetMonth = `${newY}-${String(newM).padStart(2, '0')}`;
    setCurrentMonth(targetMonth);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Resumen', icon: LayoutDashboard, section: 'Principal' },
    { id: 'transactions', label: 'Movimientos', icon: ArrowLeftRight, section: 'Principal' },
    { id: 'budget', label: 'Presupuestos', icon: PieChart, section: 'Principal' },
    { id: 'monthly', label: 'Metas del Mes', icon: CalendarCheck, section: 'Objetivos' },
    { id: 'goals', label: 'Metas Grandes', icon: Target, section: 'Objetivos' },
    { id: 'categories', label: 'Categorías', icon: Tag, section: 'Configuración' },
    { id: 'importexport', label: 'Importar / Exportar', icon: Database, section: 'Configuración' },
  ];

  const sections = ['Principal', 'Objetivos', 'Configuraciones'];

  return (
    <aside 
      id="sidebar-container" 
      className="w-16 md:w-68 bg-white border-r border-[#EBE7DF] flex flex-col fixed top-0 left-0 h-screen z-40 transition-all duration-300 shadow-sm"
    >
      {/* BRAND HEADER */}
      <div id="brand-header" className="p-4 md:p-6 pb-4 border-b border-[#EBE7DF] flex flex-col gap-0.5">
        <h1 id="brand-title" className="font-display text-lg md:text-2xl font-semibold tracking-tight text-brand-charcoal overflow-hidden text-ellipsis whitespace-nowrap">
          Savia
        </h1>
        <p id="brand-tagline" className="hidden md:block text-[11px] uppercase tracking-widest text-brand-gray font-medium">
          Diligencia Financiera
        </p>
      </div>

      {/* MONTH LEVEL SWAPPER */}
      <div id="month-swapper" className="p-2 md:p-4 bg-[#F8F6F1] border-b border-[#EBE7DF] flex items-center justify-between gap-1">
        <button 
          id="btn-prev-month"
          onClick={() => changeMonth(-1)}
          className="p-1 md:p-1.5 hover:bg-[#EDE8DE] text-brand-charcoal rounded transition-colors"
          title="Mes Anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span 
          id="label-current-month" 
          className="hidden md:block text-xs font-semibold text-brand-charcoal tracking-wide uppercase font-sans text-center flex-1 truncate"
        >
          {getMonthName(currentMonth)}
        </span>
        <button 
          id="btn-next-month"
          onClick={() => changeMonth(1)}
          className="p-1 md:p-1.5 hover:bg-[#EDE8DE] text-brand-charcoal rounded transition-colors"
          title="Mes Siguiente"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* NAVIGATION ITEMS */}
      <nav id="sidebar-navigation" className="flex-1 p-2 md:p-3 overflow-y-auto space-y-4">
        <div>
          <div id="nav-section-principal" className="hidden md:block text-[10px] font-bold text-brand-light-gray uppercase tracking-widest px-3 mb-2">
            Principal
          </div>
          <div className="space-y-0.5">
            {menuItems.filter(item => item.section === 'Principal').map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  id={`nav-item-${item.id}`}
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                    isActive 
                      ? 'bg-brand-charcoal text-white font-medium shadow-sm shadow-brand-charcoal/10' 
                      : 'text-brand-gray hover:text-brand-charcoal hover:bg-warm-cream'
                  }`}
                  title={item.label}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="hidden md:inline truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div id="nav-section-objetivos" className="hidden md:block text-[10px] font-bold text-brand-light-gray uppercase tracking-widest px-3 mb-2">
            Objetivos
          </div>
          <div className="space-y-0.5">
            {menuItems.filter(item => item.section === 'Objetivos').map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  id={`nav-item-${item.id}`}
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                    isActive 
                      ? 'bg-brand-charcoal text-white font-medium shadow-sm shadow-brand-charcoal/10' 
                      : 'text-brand-gray hover:text-brand-charcoal hover:bg-warm-cream'
                  }`}
                  title={item.label}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="hidden md:inline truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div id="nav-section-config" className="hidden md:block text-[10px] font-bold text-brand-light-gray uppercase tracking-widest px-3 mb-2">
            Sistema
          </div>
          <div className="space-y-0.5">
            {menuItems.filter(item => item.section === 'Configuración').map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  id={`nav-item-${item.id}`}
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                    isActive 
                      ? 'bg-brand-charcoal text-white font-medium shadow-sm shadow-brand-charcoal/10' 
                      : 'text-brand-gray hover:text-brand-charcoal hover:bg-warm-cream'
                  }`}
                  title={item.label}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="hidden md:inline truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* CUMULATIVE BALANCE BADGE */}
      <div id="sidebar-networth" className="p-2 md:p-3.5 m-2 border border-[#EBE7DF]/60 bg-[#FAFAFA] rounded-xl flex flex-col gap-1 overflow-hidden">
        <span id="sidebar-networth-lbl" className="hidden md:block text-[11px] font-bold text-brand-gray/80 tracking-wide uppercase">
          Fondo Acumulado
        </span>
        <div id="sidebar-networth-val" className="flex items-center gap-1">
          {totalBalance >= 0 ? (
            <TrendingUp className="w-4 h-4 text-brand-green flex-shrink-0" />
          ) : (
            <TrendingDown className="w-4 h-4 text-brand-red flex-shrink-0" />
          )}
          <span 
            className={`font-display text-sm md:text-lg font-bold truncate ${
              totalBalance >= 0 ? 'text-brand-green' : 'text-brand-red'
            }`}
          >
            {formatCurrency(totalBalance)}
          </span>
        </div>
      </div>
    </aside>
  );
};
