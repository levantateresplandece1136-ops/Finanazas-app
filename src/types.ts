/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Transaction {
  id: string | number;
  type: 'income' | 'expense';
  cat: string;
  desc: string;
  amount: number;
  date: string; // YYYY-MM-DD
  note?: string;
}

export interface Category {
  name: string;
  color: string;
}

export interface CategoryBudget {
  [categoryName: string]: number;
}

export interface MonthlyGoal {
  id: string | number;
  name: string;
  type: 'saving' | 'spending' | 'income' | 'custom';
  target: number;
  why?: string;
}

export interface BigGoal {
  id: string | number;
  name: string;
  target: number;
  saved: number;
  purpose?: string;
  why?: string;
  how?: string;
  steps: string[];
  stepsDone: boolean[];
  icon: string; // emoji
  deadline?: string; // YYYY-MM-DD
}

export interface AppState {
  currentMonth: string; // YYYY-MM
  transactions: Transaction[];
  budgets: {
    [month: string]: CategoryBudget;
  };
  monthlyGoals: {
    [month: string]: MonthlyGoal[];
  };
  goals: BigGoal[];
  incomeCats: Category[];
  expenseCats: Category[];
  verse: string;
  verseDate: string;
}
