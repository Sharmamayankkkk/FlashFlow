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
  const [executionLogic, setExecutionLogic] = useState<string | null>(null);

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

  const onGenerateCode: SubmitHandler<FormValues> = async (data) => {
    setIsExecuting(true);
    setExecutionLogic(null);
    try {
      const logicResult = await generateExecutionLogic({
        asset: data.asset,
        amount: Number(data.amount),
        strategy: data.strategy,
      });
      setExecutionLogic(logicResult.executionLogic);
    } catch (error) {
      console.error('Code generation failed:', error);
      toast({
        variant: 'destructive',
        title: 'Code Generation Failed',
        description: 'An unexpected error occurred while generating the code.',
      });
    } finally {
      setIsExecuting(false);
    }
  };
  
  const handleExecute = async () => {
    if (executionLogic) {
      setIsExecuting(true);
      try {
        // Here you would call the real blockchain simulation service
        const result = await executeTransaction({
            executionLogic
        });

        if (result.success) {
            const values = form.getValues();
            onExecuteLoan({
              asset: values.asset,
              amount: values.amount,
            });
            toast({
              title: 'Transaction Successful',
              description: `Profit: ${result.profit} ETH`,
            });
        } else {
             toast({
                variant: 'destructive',
                title: 'Transaction Failed',
                description: result.error,
            });
        }
      } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Execution Error',
            description: 'An unexpected error occurred during execution.',
        });
      } finally {
          setIsExecuting(false);
      }
      handleClear();
    } else {
        toast({
            variant: 'destructive',
            title: 'Execution Failed',
            description: 'Please generate the execution logic first.',
        });
    }
  };
  
  const handleClear = () => {
      form.reset({
        asset: '',
        amount: 1000,
        strategy: '',
      });
      setExecutionLogic(null);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Flash Loan Builder</CardTitle>
        <CardDescription>Describe your strategy to generate and execute a flash loan.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onGenerateCode)} className="space-y-6">
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
              {isExecuting && !executionLogic ? <Loader2 className="animate-spin" /> : 'Generate Execution Logic'}
            </Button>
          </form>
        </Form>
        
        {executionLogic && (
             <div className="mt-6 animate-in fade-in-50">
                <Textarea
                    readOnly
                    value={executionLogic}
                    className="min-h-[200px] text-xs font-mono bg-muted"
                />
                <div className="mt-6 flex flex-col sm:flex-row gap-4">
                    <Button onClick={handleClear} variant="outline" className="w-full">
                        Clear
                    </Button>
                    <Button onClick={handleExecute} disabled={isExecuting} className="w-full">
                        {isExecuting ? <Loader2 className="animate-spin" /> : <Zap />}
                        Execute Transaction
                    </Button>
                </div>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
