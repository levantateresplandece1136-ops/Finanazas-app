/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppState, Category } from './types';

export const VERSES = [
  '"El que de manera fiel reúne poco a poco, hace crecer su abundancia." — Proverbios 13:11',
  '"Planifica cuidadosamente y ganarás; actúa a la ligera y fracasarás." — Proverbios 21:5',
  '"El que es fiel en lo muy poco también es fiel en lo mucho." — Lucas 16:10',
  '"Mejor es lo poco con justicia que grandes ganancias con discordia." — Proverbios 16:8',
  '"Hay tesoro precioso y aceite en la casa del sabio; mas el hombre insensato todo lo disipa." — Proverbios 21:20',
  '"Porque ¿quién de vosotros, queriendo edificar una torre, no se sienta primero y calcula los gastos, para ver si tiene lo que necesita para acabarla?" — Lucas 14:28',
  '"No debáis a nadie nada, sino el amaros unos a otros." — Romanos 13:8'
];

export const DEFAULT_INCOME_CATS: Category[] = [
  { name: 'Sueldo', color: '#12795B' },
  { name: 'Negocio', color: '#249E34' },
  { name: 'Freelance', color: '#1B9A9F' },
  { name: 'Inversiones', color: '#689F1B' },
  { name: 'Transferencias', color: '#8F57DD' },
  { name: 'Otros Ingresos', color: '#7E786E' }
];

export const DEFAULT_EXPENSE_CATS: Category[] = [
  { name: 'Vivienda', color: '#1F6BB5' },
  { name: 'Alimentación', color: '#2E8F47' },
  { name: 'Transporte', color: '#B5771F' },
  { name: 'Servicios', color: '#129299' },
  { name: 'Salud', color: '#991B1F' },
  { name: 'Educación', color: '#761FB5' },
  { name: 'Entretenimiento', color: '#B51F72' },
  { name: 'Deudas', color: '#C0341E' },
  { name: 'Ahorro / Inversión', color: '#137A5B' },
  { name: 'Otros Gastos', color: '#858076' }
];

export const getSeedState = (): AppState => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const currentMonthYm = `${year}-${month}`;

  return {
    currentMonth: currentMonthYm,
    transactions: [
      {
        id: 'seed-1',
        type: 'income',
        cat: 'Sueldo',
        desc: 'Sueldo quincenal principal',
        amount: 14500,
        date: `${currentMonthYm}-15`,
        note: 'Pago regular'
      },
      {
        id: 'seed-2',
        type: 'income',
        cat: 'Freelance',
        desc: 'Diseño de Landing Page',
        amount: 3200,
        date: `${currentMonthYm}-10`,
        note: 'Cliente externo'
      },
      {
        id: 'seed-3',
        type: 'expense',
        cat: 'Vivienda',
        desc: 'Renta mensual',
        amount: 5200,
        date: `${currentMonthYm}-05`,
        note: 'Departamento'
      },
      {
        id: 'seed-4',
        type: 'expense',
        cat: 'Alimentación',
        desc: 'Súper semanal completo',
        amount: 2150,
        date: `${currentMonthYm}-08`,
        note: 'Walmart'
      },
      {
        id: 'seed-5',
        type: 'expense',
        cat: 'Servicios',
        desc: 'Internet de alta velocidad',
        amount: 550,
        date: `${currentMonthYm}-06`,
        note: 'Mensualidad'
      },
      {
        id: 'seed-6',
        type: 'expense',
        cat: 'Transporte',
        desc: 'Carga de Combustible',
        amount: 900,
        date: `${currentMonthYm}-12`
      },
      {
        id: 'seed-7',
        type: 'expense',
        cat: 'Entretenimiento',
        desc: 'Cena de fin de semana',
        amount: 1100,
        date: `${currentMonthYm}-18`,
        note: 'Salida familiar'
      }
    ],
    budgets: {
      [currentMonthYm]: {
        'Alimentación': 4500,
        'Transporte': 2000,
        'Servicios': 1500,
        'Entretenimiento': 2500,
        'Vivienda': 6000
      }
    },
    monthlyGoals: {
      [currentMonthYm]: [
        {
          id: 'mg-seed-1',
          name: 'Ahorrar el 20% de los ingresos netos',
          type: 'saving',
          target: 3500,
          why: 'Quiero consolidar mi fondo de emergencias'
        },
        {
          id: 'mg-seed-2',
          name: 'Evitar sobrecosto en cenas afuera',
          type: 'spending',
          target: 2000,
          why: 'Salvar fugas pequeñas de dinero'
        }
      ]
    },
    goals: [
      {
        id: 'bg-1',
        name: 'Fondo de Alivio y Emergencia',
        target: 40000,
        saved: 12500,
        purpose: 'Tener una reserva equivalente a 3 meses de gastos fijos.',
        why: 'Quiero paz mental absoluta y no estresarme ante cualquier imprevisto de salud o laboral.',
        how: 'Automatizar $1,500 cada quincena directo a renta fija al recibir la nómina.',
        steps: [
          'Abrir cuenta de inversión separada no visible en el día a día',
          'Configurar depósito automático recurrente',
          'Reducir suscripciones de streaming inactivas para aportar más',
          'Alcanzar el primer hito de $15,000 en el fondo'
        ],
        stepsDone: [true, true, false, false],
        icon: '🛡️',
        deadline: `${year}-12-15`
      },
      {
        id: 'bg-2',
        name: 'Curso Avanzado de Finanzas e Inversiones',
        target: 8000,
        saved: 3000,
        purpose: 'Adquirir certificación oficial en finanzas personales y bolsa básica.',
        why: 'La mejor disciplina es saber poner a trabajar el dinero excedente con sabiduría.',
        how: 'Ahorrar el dinero de comisiones extras o freelance exclusivamente para esto.',
        steps: [
          'Comparar planes de estudio de las 3 plataformas principales',
          'Ahorrar la cuota de suscripción o pago único',
          'Bloquear 2 horas semanales los sábados para el estudio',
          'Completar el examen y obtener certificado'
        ],
        stepsDone: [true, false, false, false],
        icon: '📚',
        deadline: `${year}-09-30`
      }
    ],
    incomeCats: DEFAULT_INCOME_CATS,
    expenseCats: DEFAULT_EXPENSE_CATS,
    verse: VERSES[0],
    verseDate: new Date().toDateString()
  };
};

export const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(val);
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
};

export const getMonthName = (ym: string): string => {
  if (!ym) return '';
  const [y, m] = ym.split('-');
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const idx = parseInt(m, 10) - 1;
  return `${months[idx]} ${y}`;
};
