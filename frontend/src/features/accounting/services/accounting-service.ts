export interface IncomeEntry {
  id: string;
  amount: number;
  description: string;
  date: string;
  categoryId: string;
  categoryName: string;
  paymentType: "cash" | "credit_card" | "bank_transfer" | "check";
  createdAt: string;
}

export interface ExpenseEntry {
  id: string;
  amount: number;
  description: string;
  date: string;
  categoryId: string;
  categoryName: string;
  paymentType: "cash" | "credit_card" | "bank_transfer" | "check";
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface Transaction {
  id: string;
  type: "income" | "expense";
  description: string;
  amount: number;
  date: string;
  categoryName: string;
}

export interface MonthData {
  month: string;
  income: number;
  expense: number;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
}

export interface DashboardSummary {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  pendingAmount: number;
  thisMonthIncome: number;
  thisMonthExpense: number;
  cashBalance: number;
  monthlyData: MonthData[];
  topExpenseCategories: CategoryBreakdown[];
  recentTransactions: Transaction[];
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateIncomeData {
  amount: number;
  description: string;
  date: string;
  categoryId: string;
  paymentType: "cash" | "credit_card" | "bank_transfer" | "check";
}

export interface CreateExpenseData {
  amount: number;
  description: string;
  date: string;
  categoryId: string;
  paymentType: "cash" | "credit_card" | "bank_transfer" | "check";
}

const incomeCategories: Category[] = [
  { id: "inc-cat-1", name: "Satış", description: "Ürün satış gelirleri" },
  { id: "inc-cat-2", name: "Hizmet Geliri", description: "Verilen hizmetlerden elde edilen gelir" },
  { id: "inc-cat-3", name: "Hurda Satışı", description: "Hurda malzeme satış gelirleri" },
  { id: "inc-cat-4", name: "Diğer Gelir", description: "Diğer tüm gelirler" },
];

const expenseCategories: Category[] = [
  { id: "exp-cat-1", name: "Malzeme", description: "Hammadde ve sarf malzeme giderleri" },
  { id: "exp-cat-2", name: "Kira", description: "Dükkan ve depo kira giderleri" },
  { id: "exp-cat-3", name: "Elektrik/Su/Doğalgaz", description: "Enerji ve altyapı giderleri" },
  { id: "exp-cat-4", name: "Maaşlar", description: "Personel maaş ve yan hak giderleri" },
  { id: "exp-cat-5", name: "Nakliye", description: "Taşıma ve kargo giderleri" },
  { id: "exp-cat-6", name: "Bakım/Onarım", description: "Makine ve ekipman bakım giderleri" },
  { id: "exp-cat-7", name: "Ofis", description: "Kırtasiye ve ofis giderleri" },
  { id: "exp-cat-8", name: "Pazarlama", description: "Reklam ve tanıtım giderleri" },
  { id: "exp-cat-9", name: "Diğer", description: "Diğer tüm giderler" },
];

function genId(): string {
  return Math.random().toString(36).substring(2, 11);
}

function randomAmount(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function randomDate(start: Date, end: Date): string {
  const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return d.toISOString().split("T")[0];
}

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const paymentTypes: Array<"cash" | "credit_card" | "bank_transfer" | "check"> = [
  "cash", "credit_card", "bank_transfer", "check",
];

const incomeDescriptions = [
  "Proje ödemesi", "Ürün satış bedeli", "Peşin ödeme", "Taksitli satış tahsilatı",
  "Hizmet bedeli", "Montaj ücreti", "Nakliye bedeli tahsilatı", "Kapora",
];
const expenseDescriptions = [
  "Sac levha alımı", "Profil demir bedeli", "Kaynak teli malzemesi", "Boya ve tiner",
  "Aylık kira bedeli", "Depo kirası", "Elektrik faturası", "Su faturası",
  "Doğalgaz faturası", "İşçi maaş ödemesi", "Usta yevmiyesi", "Nakliye ücreti",
  "Kargo gönderimi", "Makine bakımı", "Kesici takım alımı", "Kırtasiye",
  "Reklam panosu", "Sosyal medya reklamı",
];

function generateIncomeData(): IncomeEntry[] {
  const items: IncomeEntry[] = [];
  const now = new Date();
  for (let m = 5; m >= 0; m--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - m + 1, 0);
    const count = Math.floor(Math.random() * 5) + 3;
    for (let i = 0; i < count; i++) {
      const cat = randomPick(incomeCategories);
      const date = randomDate(monthStart, monthEnd);
      items.push({
        id: genId(),
        amount: randomAmount(2000, 45000),
        description: randomPick(incomeDescriptions),
        date,
        categoryId: cat.id,
        categoryName: cat.name,
        paymentType: randomPick(paymentTypes),
        createdAt: date,
      });
    }
  }
  items.sort((a, b) => b.date.localeCompare(a.date));
  return items;
}

function generateExpenseData(): ExpenseEntry[] {
  const items: ExpenseEntry[] = [];
  const now = new Date();
  for (let m = 5; m >= 0; m--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - m + 1, 0);
    const count = Math.floor(Math.random() * 7) + 4;
    for (let i = 0; i < count; i++) {
      const cat = randomPick(expenseCategories);
      const date = randomDate(monthStart, monthEnd);
      items.push({
        id: genId(),
        amount: randomAmount(150, 18000),
        description: randomPick(expenseDescriptions),
        date,
        categoryId: cat.id,
        categoryName: cat.name,
        paymentType: randomPick(paymentTypes),
        createdAt: date,
      });
    }
  }
  items.sort((a, b) => b.date.localeCompare(a.date));
  return items;
}

let incomes: IncomeEntry[] = generateIncomeData();
let expenses: ExpenseEntry[] = generateExpenseData();

function simulateDelay(): Promise<void> {
  return new Promise((r) => setTimeout(r, 200 + Math.random() * 200));
}

function getMonthKey(dateStr: string): string {
  return dateStr.substring(0, 7);
}

function computeDashboardSummary(): DashboardSummary {
  const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
  const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);

  const now = new Date();
  const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const thisMonthIncome = incomes
    .filter((i) => getMonthKey(i.date) === thisMonthKey)
    .reduce((s, i) => s + i.amount, 0);
  const thisMonthExpense = expenses
    .filter((e) => getMonthKey(e.date) === thisMonthKey)
    .reduce((s, e) => s + e.amount, 0);

  const pendingAmount = 12400;

  const monthlyMap = new Map<string, MonthData>();
  for (let m = 5; m >= 0; m--) {
    const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyMap.set(key, { month: key, income: 0, expense: 0 });
  }

  for (const i of incomes) {
    const key = getMonthKey(i.date);
    const entry = monthlyMap.get(key);
    if (entry) entry.income += i.amount;
  }
  for (const e of expenses) {
    const key = getMonthKey(e.date);
    const entry = monthlyMap.get(key);
    if (entry) entry.expense += e.amount;
  }

  const catMap = new Map<string, number>();
  for (const e of expenses) {
    catMap.set(e.categoryName, (catMap.get(e.categoryName) || 0) + e.amount);
  }
  const topCategories: CategoryBreakdown[] = Array.from(catMap.entries())
    .map(([category, amount]) => ({
      category,
      amount: Math.round(amount * 100) / 100,
      percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const allTransactions: Transaction[] = [
    ...incomes.map((i) => ({
      id: i.id,
      type: "income" as const,
      description: i.description,
      amount: i.amount,
      date: i.date,
      categoryName: i.categoryName,
    })),
    ...expenses.map((e) => ({
      id: e.id,
      type: "expense" as const,
      description: e.description,
      amount: e.amount,
      date: e.date,
      categoryName: e.categoryName,
    })),
  ];
  allTransactions.sort((a, b) => b.date.localeCompare(a.date));
  const recentTransactions = allTransactions.slice(0, 10);

  return {
    totalIncome: Math.round(totalIncome * 100) / 100,
    totalExpense: Math.round(totalExpense * 100) / 100,
    netProfit: Math.round((totalIncome - totalExpense) * 100) / 100,
    pendingAmount,
    thisMonthIncome: Math.round(thisMonthIncome * 100) / 100,
    thisMonthExpense: Math.round(thisMonthExpense * 100) / 100,
    cashBalance: Math.round((totalIncome - totalExpense) * 0.75 * 100) / 100,
    monthlyData: Array.from(monthlyMap.values()),
    topExpenseCategories: topCategories,
    recentTransactions,
  };
}

export const accountingService = {
  getDashboardSummary: async (): Promise<DashboardSummary> => {
    await simulateDelay();
    return computeDashboardSummary();
  },

  getIncomeCategories: async (): Promise<Category[]> => {
    await simulateDelay();
    return [...incomeCategories];
  },

  getExpenseCategories: async (): Promise<Category[]> => {
    await simulateDelay();
    return [...expenseCategories];
  },

  getIncomes: async (params?: {
    page?: number;
    pageSize?: number;
  }): Promise<PagedResult<IncomeEntry>> => {
    await simulateDelay();
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 20;
    const totalCount = incomes.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const start = (page - 1) * pageSize;
    const items = incomes.slice(start, start + pageSize);
    return { items, totalCount, page, pageSize, totalPages };
  },

  getExpenses: async (params?: {
    page?: number;
    pageSize?: number;
  }): Promise<PagedResult<ExpenseEntry>> => {
    await simulateDelay();
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 20;
    const totalCount = expenses.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const start = (page - 1) * pageSize;
    const items = expenses.slice(start, start + pageSize);
    return { items, totalCount, page, pageSize, totalPages };
  },

  createIncome: async (data: CreateIncomeData): Promise<IncomeEntry> => {
    await simulateDelay();
    const cat = incomeCategories.find((c) => c.id === data.categoryId);
    const entry: IncomeEntry = {
      id: genId(),
      ...data,
      categoryName: cat?.name || "",
      createdAt: new Date().toISOString(),
    };
    incomes.unshift(entry);
    return entry;
  },

  updateIncome: async (id: string, data: CreateIncomeData): Promise<IncomeEntry> => {
    await simulateDelay();
    const idx = incomes.findIndex((i) => i.id === id);
    if (idx === -1) throw new Error("Gelir kaydı bulunamadı.");
    const cat = incomeCategories.find((c) => c.id === data.categoryId);
    incomes[idx] = { ...incomes[idx], ...data, categoryName: cat?.name || "" };
    return incomes[idx];
  },

  deleteIncome: async (id: string): Promise<void> => {
    await simulateDelay();
    incomes = incomes.filter((i) => i.id !== id);
  },

  createExpense: async (data: CreateExpenseData): Promise<ExpenseEntry> => {
    await simulateDelay();
    const cat = expenseCategories.find((c) => c.id === data.categoryId);
    const entry: ExpenseEntry = {
      id: genId(),
      ...data,
      categoryName: cat?.name || "",
      createdAt: new Date().toISOString(),
    };
    expenses.unshift(entry);
    return entry;
  },

  updateExpense: async (id: string, data: CreateExpenseData): Promise<ExpenseEntry> => {
    await simulateDelay();
    const idx = expenses.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error("Gider kaydı bulunamadı.");
    const cat = expenseCategories.find((c) => c.id === data.categoryId);
    expenses[idx] = { ...expenses[idx], ...data, categoryName: cat?.name || "" };
    return expenses[idx];
  },

  deleteExpense: async (id: string): Promise<void> => {
    await simulateDelay();
    expenses = expenses.filter((e) => e.id !== id);
  },
};
