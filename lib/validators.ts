import { z } from "zod";

export const moneySchema = z.object({
  amount: z.coerce.number().positive(),
  description: z.string().min(2).max(120)
});

export const incomeSchema = moneySchema.extend({
  source: z.enum(["manual", "shortcut", "repayment", "chore"]).default("manual")
});

export const expenseSchema = moneySchema;

export const loanSchema = z.object({
  borrowerName: z.string().min(2).max(60),
  amount: z.coerce.number().positive(),
  purpose: z.string().min(2).max(120),
  annualInterestRate: z.coerce.number().min(0).max(100).optional()
});

export const settingsSchema = z.object({
  childName: z.string().min(1).max(30),
  percentages: z.object({
    spend: z.number().int().min(0).max(100),
    save: z.number().int().min(0).max(100),
    invest: z.number().int().min(0).max(100),
    give: z.number().int().min(0).max(100)
  }),
  defaultLoanInterestRate: z.number().min(0).max(100)
});

export const reflectionSchema = z.object({
  verdict: z.enum(["worth_it", "not_worth_it"])
});

export const monthlyNoteSchema = z.object({
  note: z.string().max(280)
});
