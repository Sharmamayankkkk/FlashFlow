'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Transaction, TransactionStatus } from '@/types';
import { ScrollArea } from './ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface TransactionDashboardProps {
  transactions: Transaction[];
}

const statusClasses: Record<TransactionStatus, string> = {
  Pending: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  Executing: 'bg-primary text-primary-foreground hover:bg-primary/90 animate-pulse',
  Completed: 'bg-accent text-accent-foreground hover:bg-accent/90',
  Failed: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
};

export function TransactionDashboard({ transactions }: TransactionDashboardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Transaction Dashboard</CardTitle>
        <CardDescription>Monitor live and past flash loan transactions.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow p-0">
          <ScrollArea className="h-[400px]">
            <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                    <TableHead>Asset</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
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
                        <Badge className={cn('whitespace-nowrap border-transparent', statusClasses[tx.status])}>
                            {tx.status}
                        </Badge>
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
      </CardContent>
    </Card>
  );
}
