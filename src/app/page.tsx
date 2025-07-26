'use client';

import { useState, useEffect } from 'react';
import { FlashLoanBuilder } from '@/components/flash-loan-builder';
import { TransactionDashboard } from '@/components/transaction-dashboard';
import { PageWrapper } from '@/components/page-wrapper';
import type { Transaction } from '@/types';

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'status' | 'timestamp'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: `fl-${Math.random().toString(36).substr(2, 9)}`,
      status: 'Pending',
      timestamp: new Date(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  // Simulate transaction status updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTransactions(currentTransactions =>
        currentTransactions.map(tx => {
          if (tx.status === 'Pending') {
            return { ...tx, status: 'Executing' };
          }
          if (tx.status === 'Executing') {
            // Randomly succeed or fail
            const succeeds = Math.random() > 0.2;
            return { ...tx, status: succeeds ? 'Completed' : 'Failed' };
          }
          return tx;
        }).sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime())
      );
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

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
