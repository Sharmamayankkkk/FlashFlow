'use client';

import { useState } from 'react';
import { FlashLoanBuilder } from '@/components/flash-loan-builder';
import { TransactionDashboard } from '@/components/transaction-dashboard';
import { PageWrapper } from '@/components/page-wrapper';
import type { Transaction } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookCheck } from 'lucide-react';

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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookCheck className="h-5 w-5" />
                About the Analysis
              </CardTitle>
              <CardDescription>How the simulation works</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-4">
              <p>
                The transaction viability analysis is powered by an AI model that acts as a blockchain security expert.
              </p>
              <p>
                It reviews the generated code for potential vulnerabilities, logical errors, and unprofitable strategies. Based on this, it provides a "Viable" or "Not Viable" recommendation and simulates a potential profit or loss curve.
              </p>
            </CardContent>
          </Card>
          <TransactionDashboard transactions={transactions} />
        </div>
      </div>
    </PageWrapper>
  );
}
