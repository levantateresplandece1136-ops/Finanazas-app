/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppState, Transaction } from './types';
import { getSeedState } from './initialData';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { TransactionsList } from './components/TransactionsList';
import { BudgetManager } from './components/BudgetManager';
import { MonthlyFocus } from './components/MonthlyFocus';
import { BigDreams } from './components/BigDreams';
import { CategoryConfig } from './components/CategoryConfig';
import { DataBackup } from './components/DataBackup';

const STORAGE_KEY = 'savia_finance_app_state';

export default function App() {
  const [appState, setAppState] = useState<AppState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Quick check to confirm structure validity
        if (parsed && typeof parsed === 'object' && Array.isArray(parsed.transactions)) {
          return parsed as AppState;
        }
      }
    } catch (e) {
      console.warn('Could not read from localStorage, using seed state instead.', e);
    }
    return getSeedState();
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
    } catch (e) {
      console.error('Could not sync to localStorage', e);
    }
  }, [appState]);

  // Set current month in state
  const setCurrentMonth = (month: string) => {
    setAppState(prev => ({
      ...prev,
      currentMonth: month
    }));
  };

  // Set transactions
  const setTransactions = (txs: Transaction[]) => {
    setAppState(prev => ({
      ...prev,
      transactions: txs
    }));
  };

  // Handle individual budgets setter
  const setBudgets = (budgets: AppState['budgets']) => {
    setAppState(prev => ({
      ...prev,
      budgets
    }));
  };

  // Set monthly goals
  const setMonthlyGoals = (goalsObj: AppState['monthlyGoals']) => {
    setAppState(prev => ({
      ...prev,
      monthlyGoals: goalsObj
    }));
  };

  // Set Big Dreams life goals
  const setBigGoals = (goals: AppState['goals']) => {
    setAppState(prev => ({
      ...prev,
      goals
    }));
  };

  // Set category tags lists
  const setIncomeCats = (cats: AppState['incomeCats']) => {
    setAppState(prev => ({
      ...prev,
      incomeCats: cats
    }));
  };

  const setExpenseCats = (cats: AppState['expenseCats']) => {
    setAppState(prev => ({
      ...prev,
      expenseCats: cats
    }));
  };

  const setVerse = (verseStr: string) => {
    setAppState(prev => ({
      ...prev,
      verse: verseStr,
      verseDate: new Date().toDateString()
    }));
  };

  // State import modifiers
  const handleRestoreState = (restored: AppState) => {
    setAppState(restored);
  };

  const handleAppendTransactions = (extraTxs: Transaction[]) => {
    setAppState(prev => ({
      ...prev,
      transactions: [...prev.transactions, ...extraTxs]
    }));
  };

  // Compute total accumulated balance across all time
  const totalBalance = appState.transactions.reduce((acc, t) => {
    if (t.type === 'income') return acc + t.amount;
    return acc - t.amount;
  }, 0);

  // Dynamic tab routing render switcher
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            transactions={appState.transactions}
            currentMonth={appState.currentMonth}
            incomeCats={appState.incomeCats}
            expenseCats={appState.expenseCats}
            monthlyGoals={appState.monthlyGoals[appState.currentMonth] || []}
            verse={appState.verse}
            setVerse={setVerse}
            onNavigateToTab={setActiveTab}
          />
        );
      case 'transactions':
        return (
          <TransactionsList 
            transactions={appState.transactions}
            setTransactions={setTransactions}
            currentMonth={appState.currentMonth}
            incomeCats={appState.incomeCats}
            expenseCats={appState.expenseCats}
          />
        );
      case 'budget':
        return (
          <BudgetManager 
            transactions={appState.transactions}
            currentMonth={appState.currentMonth}
            expenseCats={appState.expenseCats}
            budgets={appState.budgets}
            setBudgets={setBudgets}
          />
        );
      case 'monthly':
        return (
          <MonthlyFocus 
            transactions={appState.transactions}
            currentMonth={appState.currentMonth}
            monthlyGoals={appState.monthlyGoals}
            setMonthlyGoals={setMonthlyGoals}
          />
        );
      case 'goals':
        return (
          <BigDreams 
            goals={appState.goals}
            setGoals={setBigGoals}
          />
        );
      case 'categories':
        return (
          <CategoryConfig 
            incomeCats={appState.incomeCats}
            setIncomeCats={setIncomeCats}
            expenseCats={appState.expenseCats}
            setExpenseCats={setExpenseCats}
          />
        );
      case 'importexport':
        return (
          <DataBackup 
            appState={appState}
            onRestoreState={handleRestoreState}
            onAppendTransactions={handleAppendTransactions}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div id="app-viewport-root" className="min-h-screen flex text-[#1E1C19] font-sans antialiased">
      {/* FIXED SIDEBAR MENU CONTROLLER */}
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentMonth={appState.currentMonth}
        setCurrentMonth={setCurrentMonth}
        totalBalance={totalBalance}
      />

      {/* RIGHT SIDE MAIN SCROLL VIEWPORT */}
      <main 
        id="app-content-viewport" 
        className="flex-1 ml-16 md:ml-68 p-4 md:p-8 max-w-5xl mx-auto min-h-screen pb-20 overflow-x-hidden font-sans"
      >
        <div className="max-w-4xl mx-auto">
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
}
