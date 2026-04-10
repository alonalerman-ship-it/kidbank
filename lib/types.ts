export type BucketKey = "spend" | "save" | "invest" | "give";

export type TransactionType =
  | "income"
  | "expense"
  | "split_allocation"
  | "loan_created"
  | "loan_repayment"
  | "chore_reward"
  | "reflection_note";

export type ReflectionVerdict = "worth_it" | "not_worth_it";

export interface Settings {
  childName: string;
  percentages: Record<BucketKey, number>;
  defaultLoanInterestRate: number;
}

export interface BucketBalance {
  bucket: BucketKey;
  balance: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  amount: number;
  bucket?: BucketKey;
  occurredAt: string;
  loanId?: string;
  choreId?: string;
  reflectionMonth?: string;
}

export interface Loan {
  id: string;
  borrowerName: string;
  principal: number;
  purpose: string;
  annualInterestRate: number;
  borrowedAt: string;
  repaidAt?: string;
  status: "active" | "settled";
}

export interface Chore {
  id: string;
  title: string;
  reward: number;
  active: boolean;
  sortOrder: number;
}

export interface ChoreCompletion {
  id: string;
  choreId: string;
  completedAt: string;
  approvedAt?: string;
  resultingTransactionId?: string;
}

export interface Reflection {
  transactionId: string;
  monthKey: string;
  verdict: ReflectionVerdict;
  note?: string;
}

export interface Tip {
  id: string;
  title: string;
  body: string;
  active: boolean;
}

export interface AppState {
  settings: Settings;
  bucketBalances: BucketBalance[];
  transactions: Transaction[];
  loans: Loan[];
  chores: Chore[];
  choreCompletions: ChoreCompletion[];
  reflections: Reflection[];
  monthlyNotes: Record<string, string>;
  tips: Tip[];
}
