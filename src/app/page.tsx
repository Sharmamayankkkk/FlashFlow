
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
                The transaction viability analysis is powered by an AI model that acts as both a blockchain security expert and a DeFi analyst. It performs a multi-step assessment:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <span className="font-semibold text-foreground">Code Review:</span> The AI first generates the necessary smart contract logic based on your strategy. It then scrutinizes this code for potential vulnerabilities, logical errors, or gas-inefficient operations.
                </li>
                <li>
                  <span className="font-semibold text-foreground">Risk Assessment:</span> It simulates how the strategy would perform under current market assumptions, looking for risks like high slippage, unprofitable trades, or reliance on volatile assets without safeguards.
                </li>
                <li>
                  <span className="font-semibold text-foreground">Viability Score:</span> Based on the review, it provides a "Viable" or "Not Viable" recommendation. A "Viable" status indicates a high probability of success and profitability.
                </li>
                 <li>
                  <span className="font-semibold text-foreground">PnL Simulation:</span> The profit-and-loss chart is a visual forecast of the transaction's potential financial performance, illustrating the expected outcome if the strategy is executed successfully.
                </li>
              </ul>
            </CardContent>
          </Card>
          <TransactionDashboard transactions={transactions} />
        </div>
      </div>
    </PageWrapper>
  );
}
