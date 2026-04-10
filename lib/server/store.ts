import { Prisma } from "@prisma/client";
import { addDays, subDays } from "date-fns";

import { initialState } from "@/lib/seed-data";
import { prisma } from "@/lib/server/prisma";
import type {
  AppState,
  BucketBalance,
  BucketKey,
  Chore,
  ChoreCompletion,
  Loan,
  Reflection,
  ReflectionVerdict,
  Settings,
  Tip,
  Transaction,
  TransactionType
} from "@/lib/types";
import {
  calculateSimpleInterest,
  getCurrentMonthKey,
  getReflectionCandidates,
  getReflectionProgress,
  getSplitAllocation,
  getTotalBalance,
  validatePercentages
} from "@/lib/utils";

type DbClient = Prisma.TransactionClient | typeof prisma;
type DashboardData = {
  settings: Settings;
  bucketBalances: BucketBalance[];
  totalBalance: number;
  owedSummary: {
    activeCount: number;
    totalOwed: number;
  };
  recentTransactions: Transaction[];
  currentTip: Tip;
  reflection: ReturnType<typeof getReflectionProgress>;
};
type ChoreWithLatestCompletion = Chore & { latestCompletion?: ChoreCompletion };

type PersistedTransactionInput = {
  id?: string;
  type: TransactionType;
  description: string;
  amount: number;
  bucket?: BucketKey;
  occurredAt?: string | Date;
  loanId?: string;
  choreId?: string;
  reflectionMonth?: string;
};

function toNumber(value: Prisma.Decimal | number | string) {
  return Number(value);
}

function toIsoString(value: Date | string | null | undefined) {
  return value ? new Date(value).toISOString() : undefined;
}

function toDate(value?: string | Date) {
  return value ? new Date(value) : new Date();
}

function mapSettings(record: {
  childName: string;
  spendPercentage: number;
  savePercentage: number;
  investPercentage: number;
  givePercentage: number;
  defaultLoanInterestRate: number;
}): Settings {
  return {
    childName: record.childName,
    percentages: {
      spend: record.spendPercentage,
      save: record.savePercentage,
      invest: record.investPercentage,
      give: record.givePercentage
    },
    defaultLoanInterestRate: record.defaultLoanInterestRate
  };
}

function mapBucketBalance(record: { bucket: string; balance: Prisma.Decimal }): BucketBalance {
  return {
    bucket: record.bucket as BucketKey,
    balance: toNumber(record.balance)
  };
}

function mapTransaction(record: {
  id: string;
  type: string;
  description: string;
  amount: Prisma.Decimal;
  bucket: string | null;
  occurredAt: Date;
  loanId: string | null;
  choreId: string | null;
  reflectionMonth: string | null;
}): Transaction {
  return {
    id: record.id,
    type: record.type as TransactionType,
    description: record.description,
    amount: toNumber(record.amount),
    bucket: (record.bucket ?? undefined) as BucketKey | undefined,
    occurredAt: record.occurredAt.toISOString(),
    loanId: record.loanId ?? undefined,
    choreId: record.choreId ?? undefined,
    reflectionMonth: record.reflectionMonth ?? undefined
  };
}

function mapLoan(record: {
  id: string;
  borrowerName: string;
  principal: Prisma.Decimal;
  purpose: string;
  annualInterestRate: number;
  borrowedAt: Date;
  repaidAt: Date | null;
  status: string;
}): Loan {
  return {
    id: record.id,
    borrowerName: record.borrowerName,
    principal: toNumber(record.principal),
    purpose: record.purpose,
    annualInterestRate: record.annualInterestRate,
    borrowedAt: record.borrowedAt.toISOString(),
    repaidAt: toIsoString(record.repaidAt),
    status: record.status as Loan["status"]
  };
}

function mapChore(record: {
  id: string;
  title: string;
  reward: Prisma.Decimal;
  active: boolean;
  sortOrder: number;
}): Chore {
  return {
    id: record.id,
    title: record.title,
    reward: toNumber(record.reward),
    active: record.active,
    sortOrder: record.sortOrder
  };
}

function mapChoreCompletion(record: {
  id: string;
  choreId: string;
  completedAt: Date;
  approvedAt: Date | null;
  resultingTransactionId: string | null;
}): ChoreCompletion {
  return {
    id: record.id,
    choreId: record.choreId,
    completedAt: record.completedAt.toISOString(),
    approvedAt: toIsoString(record.approvedAt),
    resultingTransactionId: record.resultingTransactionId ?? undefined
  };
}

function mapReflection(record: { transactionId: string; monthKey: string; verdict: string; note: string | null }): Reflection {
  return {
    transactionId: record.transactionId,
    monthKey: record.monthKey,
    verdict: record.verdict as ReflectionVerdict,
    note: record.note ?? undefined
  };
}

function mapTip(record: { id: string; title: string; body: string; active: boolean }): Tip {
  return {
    id: record.id,
    title: record.title,
    body: record.body,
    active: record.active
  };
}

async function createTransaction(db: DbClient, input: PersistedTransactionInput) {
  const transaction = await db.transaction.create({
    data: {
      ...(input.id ? { id: input.id } : {}),
      type: input.type,
      description: input.description,
      amount: new Prisma.Decimal(input.amount.toFixed(2)),
      bucket: input.bucket,
      occurredAt: toDate(input.occurredAt),
      loanId: input.loanId,
      choreId: input.choreId,
      reflectionMonth: input.reflectionMonth
    }
  });

  return mapTransaction(transaction);
}

async function applyBucketDelta(db: DbClient, bucket: BucketKey, delta: number) {
  const existing = await db.bucketBalance.findUnique({ where: { bucket } });
  if (!existing) {
    throw new Error(`Missing bucket ${bucket}`);
  }

  await db.bucketBalance.update({
    where: { bucket },
    data: {
      balance: new Prisma.Decimal((toNumber(existing.balance) + delta).toFixed(2))
    }
  });
}

async function logIncomeInTransaction(
  db: DbClient,
  amount: number,
  description: string,
  settings: Settings,
  type: TransactionType = "income",
  occurredAt?: string,
  extra: Pick<PersistedTransactionInput, "loanId" | "choreId"> = {}
) {
  const parent = await createTransaction(db, {
    type,
    description,
    amount,
    occurredAt,
    loanId: extra.loanId,
    choreId: extra.choreId
  });

  const splits = getSplitAllocation(amount, settings.percentages);
  for (const split of splits) {
    await applyBucketDelta(db, split.bucket, split.amount);
    await createTransaction(db, {
      type: "split_allocation",
      description: `${description} -> ${split.bucket}`,
      amount: split.amount,
      bucket: split.bucket,
      occurredAt: parent.occurredAt,
      loanId: extra.loanId,
      choreId: extra.choreId
    });
  }

  return parent;
}

async function getSettingsRecord(db: DbClient) {
  const settings = await db.settings.findUnique({ where: { id: 1 } });
  if (!settings) {
    throw new Error("Settings not found");
  }
  return settings;
}

export async function seedDatabase(db: typeof prisma = prisma) {
  await db.$transaction(async (tx) => {
    await tx.choreCompletion.deleteMany();
    await tx.reflection.deleteMany();
    await tx.transaction.deleteMany();
    await tx.loan.deleteMany();
    await tx.chore.deleteMany();
    await tx.tip.deleteMany();
    await tx.bucketBalance.deleteMany();
    await tx.settings.deleteMany();

    await tx.settings.create({
      data: {
        id: 1,
        childName: initialState.settings.childName,
        spendPercentage: initialState.settings.percentages.spend,
        savePercentage: initialState.settings.percentages.save,
        investPercentage: initialState.settings.percentages.invest,
        givePercentage: initialState.settings.percentages.give,
        defaultLoanInterestRate: initialState.settings.defaultLoanInterestRate
      }
    });

    await tx.bucketBalance.createMany({
      data: initialState.bucketBalances.map((bucket) => ({
        bucket: bucket.bucket,
        balance: new Prisma.Decimal(bucket.balance.toFixed(2))
      }))
    });

    await tx.loan.createMany({
      data: initialState.loans.map((loan) => ({
        id: loan.id,
        borrowerName: loan.borrowerName,
        principal: new Prisma.Decimal(loan.principal.toFixed(2)),
        purpose: loan.purpose,
        annualInterestRate: loan.annualInterestRate,
        borrowedAt: new Date(loan.borrowedAt),
        repaidAt: loan.repaidAt ? new Date(loan.repaidAt) : null,
        status: loan.status
      }))
    });

    await tx.chore.createMany({
      data: initialState.chores.map((chore) => ({
        id: chore.id,
        title: chore.title,
        reward: new Prisma.Decimal(chore.reward.toFixed(2)),
        active: chore.active,
        sortOrder: chore.sortOrder
      }))
    });

    await tx.transaction.createMany({
      data: [
        ...initialState.transactions.map((transaction) => ({
          id: transaction.id,
          type: transaction.type,
          description: transaction.description,
          amount: new Prisma.Decimal(transaction.amount.toFixed(2)),
          bucket: transaction.bucket,
          occurredAt: new Date(transaction.occurredAt),
          loanId: transaction.loanId ?? null,
          choreId: transaction.choreId ?? null,
          reflectionMonth: transaction.reflectionMonth ?? null
        })),
        ...Object.entries(initialState.monthlyNotes).map(([monthKey, note]) => ({
          id: `txn-reflection-note-${monthKey}`,
          type: "reflection_note",
          description: `Reflection note (${monthKey}): ${note}`,
          amount: new Prisma.Decimal("0.00"),
          bucket: null,
          occurredAt: new Date(`${monthKey}-01T12:00:00.000Z`),
          loanId: null,
          choreId: null,
          reflectionMonth: monthKey
        }))
      ]
    });

    await tx.choreCompletion.createMany({
      data: initialState.choreCompletions.map((completion) => ({
        id: completion.id,
        choreId: completion.choreId,
        completedAt: new Date(completion.completedAt),
        approvedAt: completion.approvedAt ? new Date(completion.approvedAt) : null,
        resultingTransactionId: completion.resultingTransactionId ?? null
      }))
    });

    await tx.reflection.createMany({
      data: initialState.reflections.map((reflection) => ({
        transactionId: reflection.transactionId,
        monthKey: reflection.monthKey,
        verdict: reflection.verdict,
        note: reflection.note ?? null
      }))
    });

    await tx.tip.createMany({
      data: initialState.tips.map((tip) => ({
        id: tip.id,
        title: tip.title,
        body: tip.body,
        active: tip.active
      }))
    });
  });
}

export const store = {
  async reset() {
    await seedDatabase();
  },
  async getState(): Promise<AppState> {
    const [settings, bucketBalances, transactions, loans, chores, choreCompletions, reflections, tips] = await Promise.all([
      prisma.settings.findUniqueOrThrow({ where: { id: 1 } }),
      prisma.bucketBalance.findMany({ orderBy: { id: "asc" } }),
      prisma.transaction.findMany({ orderBy: [{ occurredAt: "desc" }, { createdAt: "desc" }] }),
      prisma.loan.findMany({ orderBy: [{ borrowedAt: "desc" }, { createdAt: "desc" }] }),
      prisma.chore.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.choreCompletion.findMany({ orderBy: [{ completedAt: "desc" }, { createdAt: "desc" }] }),
      prisma.reflection.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.tip.findMany({ orderBy: { createdAt: "asc" } })
    ]);

    return {
      settings: mapSettings(settings),
      bucketBalances: bucketBalances.map(mapBucketBalance),
      transactions: transactions.map(mapTransaction),
      loans: loans.map(mapLoan),
      chores: chores.map(mapChore),
      choreCompletions: choreCompletions.map(mapChoreCompletion),
      reflections: reflections.map(mapReflection),
      monthlyNotes: Object.fromEntries(
        transactions
          .filter((transaction) => transaction.type === "reflection_note" && transaction.reflectionMonth)
          .map((transaction) => [
            transaction.reflectionMonth as string,
            transaction.description.replace(new RegExp(`^Reflection note \\(${transaction.reflectionMonth}\\):\\s*`), "")
          ])
      ),
      tips: tips.map(mapTip)
    };
  },
  async getDashboard(): Promise<DashboardData> {
    const [settingsRecord, bucketBalancesRaw, activeLoansRaw, recentTransactionsRaw, tipsRaw, allTransactionsRaw, reflectionsRaw] = await Promise.all([
      getSettingsRecord(prisma),
      prisma.bucketBalance.findMany({ orderBy: { id: "asc" } }),
      prisma.loan.findMany({
        where: { status: "active" },
        orderBy: [{ borrowedAt: "desc" }, { createdAt: "desc" }]
      }),
      prisma.transaction.findMany({
        orderBy: [{ occurredAt: "desc" }, { createdAt: "desc" }],
        take: 6
      }),
      prisma.tip.findMany({ where: { active: true }, orderBy: { createdAt: "asc" } }),
      prisma.transaction.findMany({ orderBy: [{ occurredAt: "desc" }, { createdAt: "desc" }] }),
      prisma.reflection.findMany({ orderBy: { createdAt: "asc" } })
    ]);

    const settings = mapSettings(settingsRecord);
    const bucketBalances = bucketBalancesRaw.map(mapBucketBalance);
    const activeLoans = activeLoansRaw.map(mapLoan);
    const owedTotal = activeLoans.reduce((sum, loan) => {
      return sum + loan.principal + calculateSimpleInterest(loan.principal, loan.annualInterestRate, loan.borrowedAt);
    }, 0);
    const tipIndex = tipsRaw.length === 0 ? -1 : Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % tipsRaw.length;
    const transactions = allTransactionsRaw.map(mapTransaction);
    const reflections = reflectionsRaw.map(mapReflection);

    return {
      settings,
      bucketBalances,
      totalBalance: getTotalBalance(bucketBalances),
      owedSummary: {
        activeCount: activeLoans.length,
        totalOwed: Number(owedTotal.toFixed(2))
      },
      recentTransactions: recentTransactionsRaw.map(mapTransaction),
      currentTip:
        tipIndex >= 0
          ? mapTip(tipsRaw[tipIndex])
          : {
              id: "fallback-tip",
              title: "Money Tip of the Day",
              body: "Keep going. Small money habits add up over time.",
              active: true
            },
      reflection: getReflectionProgress(transactions, reflections)
    };
  },
  async getTransactions(filter?: { type?: TransactionType; bucket?: BucketKey }): Promise<Transaction[]> {
    const transactions = await prisma.transaction.findMany({
      where: {
        ...(filter?.type ? { type: filter.type } : {}),
        ...(filter?.bucket ? { bucket: filter.bucket } : {})
      },
      orderBy: [{ occurredAt: "desc" }, { createdAt: "desc" }]
    });

    return transactions.map(mapTransaction);
  },
  async logIncome(amount: number, description: string, type: TransactionType = "income", occurredAt?: string): Promise<Transaction> {
    return prisma.$transaction(async (tx) => {
      const settings = mapSettings(await getSettingsRecord(tx));
      return logIncomeInTransaction(tx, amount, description, settings, type, occurredAt);
    });
  },
  async logExpense(amount: number, description: string): Promise<Transaction> {
    return prisma.$transaction(async (tx) => {
      await applyBucketDelta(tx, "spend", -amount);
      return createTransaction(tx, {
        type: "expense",
        description,
        amount: -amount,
        bucket: "spend"
      });
    });
  },
  async createLoan(input: { borrowerName: string; amount: number; purpose: string; annualInterestRate?: number }): Promise<Loan> {
    return prisma.$transaction(async (tx) => {
      const settings = mapSettings(await getSettingsRecord(tx));

      await applyBucketDelta(tx, "spend", -input.amount);

      const loan = await tx.loan.create({
        data: {
          borrowerName: input.borrowerName,
          principal: new Prisma.Decimal(input.amount.toFixed(2)),
          purpose: input.purpose,
          annualInterestRate: input.annualInterestRate ?? settings.defaultLoanInterestRate,
          borrowedAt: new Date(),
          status: "active"
        }
      });

      await createTransaction(tx, {
        type: "loan_created",
        description: `Loan to ${input.borrowerName}: ${input.purpose}`,
        amount: -input.amount,
        bucket: "spend",
        loanId: loan.id
      });

      return mapLoan(loan);
    });
  },
  async repayLoan(id: string): Promise<{ loan: Loan; total: number; transaction: Transaction }> {
    return prisma.$transaction(async (tx) => {
      const loanRecord = await tx.loan.findUnique({ where: { id } });
      if (!loanRecord || loanRecord.status !== "active") {
        throw new Error("Loan not found");
      }

      const repaidAt = new Date();
      const updatedLoan = await tx.loan.update({
        where: { id },
        data: {
          status: "settled",
          repaidAt
        }
      });

      const loan = mapLoan(updatedLoan);
      const interest = calculateSimpleInterest(loan.principal, loan.annualInterestRate, loan.borrowedAt, loan.repaidAt);
      const total = Number((loan.principal + interest).toFixed(2));
      const settings = mapSettings(await getSettingsRecord(tx));
      const transaction = await logIncomeInTransaction(
        tx,
        total,
        `Loan repaid by ${loan.borrowerName}`,
        settings,
        "loan_repayment",
        loan.repaidAt,
        { loanId: loan.id }
      );

      return { loan, total, transaction };
    });
  },
  async getLoans(): Promise<{
    active: Array<Loan & { interest: number; totalOwed: number }>;
    settled: Loan[];
  }> {
    const loans = (await prisma.loan.findMany({
      orderBy: [{ borrowedAt: "desc" }, { createdAt: "desc" }]
    })).map(mapLoan);

    return {
      active: loans
        .filter((loan) => loan.status === "active")
        .map((loan) => {
          const interest = calculateSimpleInterest(loan.principal, loan.annualInterestRate, loan.borrowedAt);
          return {
            ...loan,
            interest,
            totalOwed: Number((loan.principal + interest).toFixed(2))
          };
        }),
      settled: loans.filter((loan) => loan.status === "settled")
    };
  },
  async getChores(): Promise<ChoreWithLatestCompletion[]> {
    const chores = await prisma.chore.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      include: {
        completions: {
          orderBy: [{ completedAt: "desc" }, { createdAt: "desc" }],
          take: 1
        }
      }
    });

    return chores.map((chore) => ({
      ...mapChore(chore),
      latestCompletion: chore.completions[0] ? mapChoreCompletion(chore.completions[0]) : undefined
    }));
  },
  async getWeeklyChoreEarnings(): Promise<number> {
    const weekStart = subDays(new Date(), 7);
    const rewards = await prisma.transaction.findMany({
      where: {
        type: "chore_reward",
        occurredAt: {
          gte: weekStart
        }
      }
    });

    return rewards.reduce((sum, transaction) => sum + toNumber(transaction.amount), 0);
  },
  async completeChore(id: string): Promise<ChoreCompletion> {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.choreCompletion.findFirst({
        where: {
          choreId: id,
          approvedAt: {
            not: null
          }
        },
        orderBy: [{ completedAt: "desc" }, { createdAt: "desc" }]
      });
      if (existing) {
        return mapChoreCompletion(existing);
      }

      const chore = await tx.chore.findUnique({ where: { id } });
      if (!chore) {
        throw new Error("Chore not found");
      }

      const completion = await tx.choreCompletion.create({
        data: {
          choreId: id,
          completedAt: new Date(),
          approvedAt: new Date()
        }
      });

      const settings = mapSettings(await getSettingsRecord(tx));
      const transaction = await logIncomeInTransaction(
        tx,
        toNumber(chore.reward),
        chore.title,
        settings,
        "chore_reward",
        completion.approvedAt?.toISOString(),
        { choreId: chore.id }
      );

      const updatedCompletion = await tx.choreCompletion.update({
        where: { id: completion.id },
        data: {
          resultingTransactionId: transaction.id
        }
      });

      return mapChoreCompletion(updatedCompletion);
    });
  },
  async approveChore(completionId: string): Promise<ChoreCompletion> {
    return prisma.$transaction(async (tx) => {
      const completion = await tx.choreCompletion.findUnique({ where: { id: completionId } });
      if (!completion) {
        throw new Error("Completion not found");
      }

      const chore = await tx.chore.findUnique({ where: { id: completion.choreId } });
      if (!chore) {
        throw new Error("Chore not found");
      }

      const approvedAt = new Date();
      await tx.choreCompletion.update({
        where: { id: completionId },
        data: {
          approvedAt
        }
      });

      const settings = mapSettings(await getSettingsRecord(tx));
      const transaction = await logIncomeInTransaction(
        tx,
        toNumber(chore.reward),
        chore.title,
        settings,
        "chore_reward",
        approvedAt.toISOString(),
        { choreId: chore.id }
      );

      const updatedCompletion = await tx.choreCompletion.update({
        where: { id: completionId },
        data: {
          resultingTransactionId: transaction.id
        }
      });

      return mapChoreCompletion(updatedCompletion);
    });
  },
  async getReflect(monthKey: string): Promise<{
    monthKey: string;
    transactions: Transaction[];
    reflections: Reflection[];
    note: string;
  }> {
    const [transactions, reflections, noteTransaction] = await Promise.all([
      prisma.transaction.findMany({
        orderBy: [{ occurredAt: "desc" }, { createdAt: "desc" }]
      }),
      prisma.reflection.findMany({
        where: { monthKey },
        orderBy: { createdAt: "asc" }
      }),
      prisma.transaction.findFirst({
        where: {
          type: "reflection_note",
          reflectionMonth: monthKey
        },
        orderBy: [{ occurredAt: "desc" }, { createdAt: "desc" }]
      })
    ]);

    return {
      monthKey,
      transactions: getReflectionCandidates(transactions.map(mapTransaction)),
      reflections: reflections.map(mapReflection),
      note: noteTransaction ? noteTransaction.description.replace(new RegExp(`^Reflection note \\(${monthKey}\\):\\s*`), "") : ""
    };
  },
  async setReflection(transactionId: string, verdict: ReflectionVerdict): Promise<Reflection> {
    const monthKey = getCurrentMonthKey();
    const reflection = await prisma.reflection.upsert({
      where: { transactionId },
      create: {
        transactionId,
        monthKey,
        verdict
      },
      update: {
        verdict,
        monthKey
      }
    });

    return mapReflection(reflection);
  },
  async setMonthlyNote(monthKey: string, note: string): Promise<{ monthKey: string; note: string }> {
    const occurredAt = new Date();

    await prisma.$transaction(async (tx) => {
      const existing = await tx.transaction.findFirst({
        where: {
          type: "reflection_note",
          reflectionMonth: monthKey
        }
      });

      if (existing) {
        await tx.transaction.update({
          where: { id: existing.id },
          data: {
            description: `Reflection note (${monthKey}): ${note}`,
            occurredAt
          }
        });
        return;
      }

      await createTransaction(tx, {
        type: "reflection_note",
        description: `Reflection note (${monthKey}): ${note}`,
        amount: 0,
        reflectionMonth: monthKey,
        occurredAt
      });
    });

    return { monthKey, note };
  },
  async getSettings(): Promise<Settings> {
    if (!process.env.DATABASE_URL) {
      return structuredClone(initialState.settings);
    }
    return mapSettings(await prisma.settings.findUniqueOrThrow({ where: { id: 1 } }));
  },
  async updateSettings(nextSettings: Settings): Promise<Settings> {
    if (!validatePercentages(nextSettings.percentages)) {
      throw new Error("Percentages must total 100");
    }

    const settings = await prisma.settings.upsert({
      where: { id: 1 },
      create: {
        id: 1,
        childName: nextSettings.childName,
        spendPercentage: nextSettings.percentages.spend,
        savePercentage: nextSettings.percentages.save,
        investPercentage: nextSettings.percentages.invest,
        givePercentage: nextSettings.percentages.give,
        defaultLoanInterestRate: nextSettings.defaultLoanInterestRate
      },
      update: {
        childName: nextSettings.childName,
        spendPercentage: nextSettings.percentages.spend,
        savePercentage: nextSettings.percentages.save,
        investPercentage: nextSettings.percentages.invest,
        givePercentage: nextSettings.percentages.give,
        defaultLoanInterestRate: nextSettings.defaultLoanInterestRate
      }
    });

    return mapSettings(settings);
  },
  async exportCsv(): Promise<string> {
    const transactions = await prisma.transaction.findMany({
      orderBy: [{ occurredAt: "desc" }, { createdAt: "desc" }]
    });

    const rows = [["id", "type", "description", "amount", "bucket", "occurredAt", "loanId", "choreId"].join(",")];
    transactions.forEach((transaction) => {
      rows.push(
        [
          transaction.id,
          transaction.type,
          `"${transaction.description.replaceAll('"', '""')}"`,
          toNumber(transaction.amount).toFixed(2),
          transaction.bucket ?? "",
          transaction.occurredAt.toISOString(),
          transaction.loanId ?? "",
          transaction.choreId ?? ""
        ].join(",")
      );
    });
    return rows.join("\n");
  },
  getShortcutSecret() {
    return process.env.SHORTCUT_SECRET ?? "replace-me";
  },
  getSimulator(amount: number) {
    return [1, 5, 10].map((years) => ({
      years,
      futureValue: Number((amount * Math.pow(1.06, years)).toFixed(2)),
      checkpoints: Array.from({ length: years }, (_, index) => {
        const year = index + 1;
        return {
          year,
          value: Number((amount * Math.pow(1.06, year)).toFixed(2)),
          label: addDays(new Date(), year * 365).toISOString().slice(0, 10)
        };
      })
    }));
  }
};
