'use client';

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Zap } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { generateExecutionLogic } from '@/ai/flows/generate-execution-logic';
import type { Transaction } from '@/types';
import { executeTransaction } from '@/services/blockchain-simulator';

const formSchema = z.object({
  asset: z.string().min(1, 'Please select an asset.'),
  amount: z.coerce.number().positive('Amount must be positive.'),
  strategy: z.string().min(10, 'Please describe your strategy.'),
});

type FormValues = z.infer<typeof formSchema>;

interface FlashLoanBuilderProps {
  onExecuteLoan: (transaction: Omit<Transaction, 'id' | 'status' | 'timestamp'>) => void;
}

export function FlashLoanBuilder({ onExecuteLoan }: FlashLoanBuilderProps) {
  const { toast } = useToast();
  const [isExecuting, setIsExecuting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      asset: '',
      amount: 1000,
      strategy: '',
    },
  });

  const watchedAsset = form.watch('asset');
  const watchedAmount = form.watch('amount');

  useEffect(() => {
    if (watchedAsset && watchedAmount > 0) {
      form.setValue('strategy', `Borrow ${watchedAmount.toLocaleString()} ${watchedAsset}, perform an arbitrage trade on a DEX like Uniswap for a stablecoin like DAI, then repay the loan on a lending protocol like Aave.`);
    }
  }, [watchedAsset, watchedAmount, form.setValue]);
  
  const handleExecute: SubmitHandler<FormValues> = async (data) => {
      setIsExecuting(true);
      try {
        const logicResult = await generateExecutionLogic({
            asset: data.asset,
            amount: data.amount,
            strategy: data.strategy
        });

        const result = await executeTransaction({
            executionLogic: logicResult.executionLogic
        });

        if (result.success) {
            onExecuteLoan({
              asset: data.asset,
              amount: data.amount,
            });
            toast({
              title: 'Transaction Successful',
              description: `Profit: ${result.profit?.toFixed(4)} ETH`,
            });
        } else {
             toast({
                variant: 'destructive',
                title: 'Transaction Failed',
                description: result.error,
            });
        }
      } catch (error) {
        console.error(error);
        toast({
            variant: 'destructive',
            title: 'Execution Error',
            description: 'An unexpected error occurred during execution.',
        });
      } finally {
          setIsExecuting(false);
      }
      form.reset({
        asset: '',
        amount: 1000,
        strategy: '',
      });
  };
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Flash Loan Builder</CardTitle>
        <CardDescription>Describe your strategy to generate and execute a flash loan.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleExecute)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="asset"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an asset" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                        <SelectItem value="DAI">Dai (DAI)</SelectItem>
                        <SelectItem value="USDC">USD Coin (USDC)</SelectItem>
                        <SelectItem value="WBTC">Wrapped Bitcoin (WBTC)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 1000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="strategy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Strategy Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your loan strategy in plain English..."
                      className="min-h-[120px] text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isExecuting} className="w-full">
              {isExecuting ? <Loader2 className="animate-spin" /> : <Zap />}
              Execute Transaction
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
