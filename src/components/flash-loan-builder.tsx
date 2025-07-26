'use client';

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BrainCircuit, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { simulateFlashLoanTransaction } from '@/ai/flows/validate-loan-viability';
import { generateExecutionLogic } from '@/ai/flows/generate-execution-logic';
import type { SimulateFlashLoanTransactionOutput } from '@/ai/flows/validate-loan-viability';
import { SimulationResult } from './simulation-result';
import type { Transaction } from '@/types';

const formSchema = z.object({
  asset: z.string().min(1, 'Please select an asset.'),
  amount: z.coerce.number().positive('Amount must be positive.'),
  strategy: z.string(),
  executionLogic: z.string().min(10, 'Execution logic must be at least 10 characters.'),
});

type FormValues = z.infer<typeof formSchema>;

interface FlashLoanBuilderProps {
  onExecuteLoan: (transaction: Omit<Transaction, 'id' | 'status' | 'timestamp'>) => void;
}

export function FlashLoanBuilder({ onExecuteLoan }: FlashLoanBuilderProps) {
  const { toast } = useToast();
  const [isSimulating, setIsSimulating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<SimulateFlashLoanTransactionOutput | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      asset: '',
      amount: 1000,
      strategy: '',
      executionLogic: `// Example: Arbitrage between two DEXs
// 1. Borrow asset from Pool A.
// 2. Swap borrowed asset for another asset on DEX B.
// 3. Swap back to the original asset on DEX C at a better rate.
// 4. Repay the loan to Pool A.
// 5. Keep the profit.`,
    },
  });

  const watchedAsset = form.watch('asset');
  const watchedAmount = form.watch('amount');

  useEffect(() => {
    const asset = watchedAsset || 'ETH';
    const amount = watchedAmount || 1000;
    form.setValue('strategy', `Borrow ${amount} ${asset}, perform an arbitrage trade on a DEX like Uniswap for a stablecoin like DAI, then repay the loan on a lending protocol like Aave.`);
  }, [watchedAsset, watchedAmount, form.setValue]);

  const handleGenerateLogic = async () => {
    const values = form.getValues();
    if (!values.strategy) {
        toast({
            variant: 'destructive',
            title: 'Strategy is empty',
            description: 'Please describe your strategy to generate the logic.',
        });
        return;
    }
    setIsGenerating(true);
    try {
        const result = await generateExecutionLogic({ 
            strategy: values.strategy,
            asset: values.asset,
            amount: values.amount 
        });
        form.setValue('executionLogic', result.executionLogic, { shouldValidate: true });
    } catch (error) {
        console.error('Logic generation failed:', error);
        toast({
            variant: 'destructive',
            title: 'Generation Failed',
            description: 'An unexpected error occurred while generating the logic.',
        });
    } finally {
        setIsGenerating(false);
    }
  }

  const onSimulate: SubmitHandler<FormValues> = async (data) => {
    setIsSimulating(true);
    setSimulationResult(null);
    try {
      const result = await simulateFlashLoanTransaction({
        asset: data.asset,
        amount: data.amount,
        executionLogic: data.executionLogic,
      });
      setSimulationResult(result);
    } catch (error) {
      console.error('Simulation failed:', error);
      toast({
        variant: 'destructive',
        title: 'Simulation Failed',
        description: 'An unexpected error occurred during simulation.',
      });
    } finally {
      setIsSimulating(false);
    }
  };
  
  const handleExecute = () => {
    if (simulationResult && simulationResult.isViable) {
      const values = form.getValues();
      onExecuteLoan({
        asset: values.asset,
        amount: values.amount,
      });
      toast({
        title: 'Transaction Initiated',
        description: 'Your flash loan has been sent to the network.',
      });
      handleClear();
    } else {
        toast({
            variant: 'destructive',
            title: 'Execution Failed',
            description: 'Cannot execute a non-viable transaction.',
        });
    }
  };
  
  const handleClear = () => {
      form.reset({
        asset: '',
        amount: 1000,
        strategy: '',
        executionLogic: `// Example: Arbitrage between two DEXs
// 1. Borrow asset from Pool A.
// 2. Swap borrowed asset for another asset on DEX B.
// 3. Swap back to the original asset on DEX C at a better rate.
// 4. Repay the loan to Pool A.
// 5. Keep the profit.`,
      });
      setSimulationResult(null);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Flash Loan Builder</CardTitle>
        <CardDescription>Construct and simulate your flash loan transaction.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSimulate)} className="space-y-6">
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
                      className="min-h-[100px] text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="button" variant="secondary" onClick={handleGenerateLogic} disabled={isGenerating || isSimulating} className="w-full">
              {isGenerating ? <Loader2 className="animate-spin" /> : <BrainCircuit />}
              Generate Execution Logic with AI
            </Button>


            <FormField
              control={form.control}
              name="executionLogic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Execution Logic (Solidity)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter your smart contract logic here, or generate it with AI."
                      className="min-h-[200px] font-mono text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSimulating || isGenerating} className="w-full">
              {isSimulating ? <Loader2 className="animate-spin" /> : 'Simulate Transaction'}
            </Button>
          </form>
        </Form>
        
        {simulationResult && (
            <SimulationResult 
                result={simulationResult} 
                onExecute={handleExecute}
                onClear={handleClear}
            />
        )}
      </CardContent>
    </Card>
  );
}
