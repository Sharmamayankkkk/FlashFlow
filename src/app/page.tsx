'use client';

import { useState, useEffect } from 'react';
import { FlashLoanBuilder } from '@/components/flash-loan-builder';
import { TransactionDashboard } from '@/components/transaction-dashboard';
import { PageWrapper } from '@/components/page-wrapper';
import type { Transaction } from '@/types';

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'timestamp'>, success: boolean) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: `fl-${Math.random().toString(36).substr(2, 9)}`,
      status: success ? 'Completed' : 'Failed',
      timestamp: new Date(),
    };
    setTransactions(prev => [newTransaction, ...prev].sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime()));
  };

  return (
    <PageWrapper>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        <div className="lg:col-span-3 space-y-8">
          <FlashLoanBuilder onExecuteLoan={addTransaction} />
        </div>
        <div className="lg:col-span-2 space-y-8">
          <TransactionDashboard transactions={transactions} />
        </div>
      </div>
    </PageWrapper>
  );
}
