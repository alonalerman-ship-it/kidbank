import { subDays, subMonths } from "date-fns";

import type { AppState } from "@/lib/types";

const now = new Date();
const lastMonth = subMonths(now, 1);

export const initialState: AppState = {
  settings: {
    childName: "Asher",
    percentages: {
      spend: 50,
      save: 20,
      invest: 20,
      give: 10
    },
    defaultLoanInterestRate: 5
  },
  bucketBalances: [
    { bucket: "spend", balance: 42.2 },
    { bucket: "save", balance: 125.3 },
    { bucket: "invest", balance: 60 },
    { bucket: "give", balance: 20 }
  ],
  transactions: [
    {
      id: "txn-income-1",
      type: "income",
      description: "Weekly allowance",
      amount: 20,
      occurredAt: subDays(now, 7).toISOString()
    },
    {
      id: "txn-expense-1",
      type: "expense",
      description: "Ice cream treat",
      amount: -4.5,
      bucket: "spend",
      occurredAt: subDays(now, 1).toISOString()
    },
    {
      id: "txn-expense-2",
      type: "expense",
      description: "Video game",
      amount: -49.99,
      bucket: "spend",
      occurredAt: subDays(lastMonth, 3).toISOString()
    },
    {
      id: "txn-expense-3",
      type: "expense",
      description: "Giant cupcake",
      amount: -4.5,
      bucket: "spend",
      occurredAt: subDays(lastMonth, 10).toISOString()
    },
    {
      id: "txn-income-2",
      type: "chore_reward",
      description: "Mow lawn",
      amount: 15,
      occurredAt: subDays(now, 2).toISOString()
    }
  ],
  loans: [
    {
      id: "loan-1",
      borrowerName: "Mom",
      principal: 20,
      purpose: "Movie tickets",
      annualInterestRate: 5,
      borrowedAt: subDays(now, 14).toISOString(),
      status: "active"
    },
    {
      id: "loan-2",
      borrowerName: "Grandma",
      principal: 50,
      purpose: "Groceries",
      annualInterestRate: 5,
      borrowedAt: subDays(now, 60).toISOString(),
      repaidAt: subDays(now, 12).toISOString(),
      status: "settled"
    }
  ],
  chores: [
    { id: "chore-1", title: "Feed the dog", reward: 3, active: true, sortOrder: 1 },
    { id: "chore-2", title: "Tidy the room", reward: 4, active: true, sortOrder: 2 },
    { id: "chore-3", title: "Mow lawn", reward: 15, active: true, sortOrder: 3 }
  ],
  choreCompletions: [
    {
      id: "completion-1",
      choreId: "chore-3",
      completedAt: subDays(now, 2).toISOString(),
      approvedAt: subDays(now, 2).toISOString(),
      resultingTransactionId: "txn-income-2"
    }
  ],
  reflections: [
    { transactionId: "txn-expense-2", monthKey: lastMonth.toISOString().slice(0, 7), verdict: "not_worth_it" }
  ],
  monthlyNotes: {
    [lastMonth.toISOString().slice(0, 7)]: "Next month I want to save more for a new bike."
  },
  tips: [
    {
      id: "tip-1",
      title: "Money Tip of the Day",
      body: "Saving just $1 a day becomes $365 in a year. That is enough to get much closer to a big goal.",
      active: true
    },
    {
      id: "tip-2",
      title: "Tiny Investing Lesson",
      body: "When money earns more money over time, that is compound growth working for you.",
      active: true
    }
  ]
};
