
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Transaction, TransactionStatus } from '@/types';
import { ScrollArea } from './ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface TransactionDashboardProps {
  transactions: Transaction[];
}

const statusClasses: Record<TransactionStatus, string> = {
  Pending: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  Executing: 'bg-primary text-primary-foreground hover:bg-primary/90 animate-pulse',
  Completed: 'bg-accent/20 text-accent-foreground border border-accent/40',
  Failed: 'bg-destructive/80 text-destructive-foreground border border-destructive/90',
};


export function TransactionDashboard({ transactions }: TransactionDashboardProps) {
  const formatProfit = (profit: number, asset: string) => {
    const symbols: {[key: string]: string} = {
        'ETH': 'Ξ',
        'DAI': '♦',
        'USDC': '$',
        'WBTC': '₿'
    }
    const symbol = symbols[asset] || '';
    return `${symbol}${profit.toFixed(4)}`;
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Transaction Dashboard</CardTitle>
        <CardDescription>Monitor live and past flash loan transactions.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow p-0">
        <TooltipProvider>
          <ScrollArea className="h-[400px]">
            <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                    <TableHead>Asset</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead className="text-right">Time</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {transactions.length > 0 ? (
                    transactions.map((tx) => (
                    <TableRow key={tx.id} className="animate-in fade-in-25">
                        <TableCell className="font-medium">{tx.asset}</TableCell>
                        <TableCell>{tx.amount.toLocaleString()}</TableCell>
                        <TableCell>
                            {tx.status === 'Completed' ? (
                                <Badge variant="outline" className={cn('whitespace-nowrap font-mono', statusClasses[tx.status])}>
                                    <CheckCircle2 className="h-3 w-3 mr-1.5 text-accent" />
                                    {tx.profit ? `+${formatProfit(tx.profit, tx.asset)}` : 'Success'}
                                </Badge>
                            ) : (
                                <Tooltip delayDuration={100}>
                                    <TooltipTrigger asChild>
                                        <Badge variant="outline" className={cn('whitespace-nowrap cursor-help', statusClasses[tx.status])}>
                                             <AlertCircle className="h-3 w-3 mr-1.5" />
                                            {tx.status}
                                        </Badge>
                                    </TooltipTrigger>
                                    {tx.error && (
                                    <TooltipContent side="top" align="start">
                                        <p className="text-xs">{tx.error}</p>
                                    </TooltipContent>
                                    )}
                                </Tooltip>
                            )}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground text-xs">
                            {formatDistanceToNow(tx.timestamp, { addSuffix: true })}
                        </TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                        No transactions yet.
                    </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
          </ScrollArea>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
