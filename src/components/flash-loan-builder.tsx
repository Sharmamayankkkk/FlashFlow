'use client';

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Zap, Search, CheckCircle, XCircle, Shield, AlertTriangle } from 'lucide-react';
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import ReactMarkdown from 'react-markdown';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { generateExecutionLogic } from '@/ai/flows/generate-execution-logic';
import { simulateFlashLoanTransaction, type SimulateFlashLoanTransactionOutput } from '@/ai/flows/simulate-flash-loan-transaction';
import type { Transaction } from '@/types';
import { executeTransaction } from '@/services/blockchain-simulator';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Skeleton } from './ui/skeleton';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from './ui/chart';
import { Badge } from './ui/badge';

const formSchema = z.object({
  asset: z.string().min(1, 'Please select an asset.'),
  amount: z.coerce.number().positive('Amount must be positive.'),
  strategy: z.string().min(10, 'Please describe your strategy.'),
});

type FormValues = z.infer<typeof formSchema>;

interface FlashLoanBuilderProps {
  onExecuteLoan: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => void;
}

export function FlashLoanBuilder({ onExecuteLoan }: FlashLoanBuilderProps) {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<SimulateFlashLoanTransactionOutput | null>(null);
  const [executionLogic, setExecutionLogic] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      asset: 'ETH',
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedAsset, watchedAmount]);
  
  const handleAnalyze: SubmitHandler<FormValues> = async (data) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setExecutionLogic(null);
    try {
      const logicResult = await generateExecutionLogic({
        asset: data.asset,
        amount: data.amount,
        strategy: data.strategy,
      });
      setExecutionLogic(logicResult.executionLogic);

      const simulationResult = await simulateFlashLoanTransaction({
        executionLogic: logicResult.executionLogic,
      });
      setAnalysisResult(simulationResult);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: 'An unexpected error occurred during analysis.',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExecute = async () => {
    if (!executionLogic || !analysisResult) {
        toast({
            variant: 'destructive',
            title: 'Missing Execution Logic',
            description: 'Please analyze a strategy first.',
        });
        return;
    }
    setIsExecuting(true);
    try {
      const result = await executeTransaction({ 
        executionLogic,
        isViable: analysisResult.viability === 'Viable',
      });
      
      onExecuteLoan({
        asset: form.getValues('asset'),
        amount: form.getValues('amount'),
        status: result.success ? 'Completed' : 'Failed',
        profit: result.profit,
        error: result.error,
      });

      if (result.success) {
        toast({
          title: 'Transaction Sent!',
          description: 'Your transaction is being processed on the network.',
        });
        // Reset state after execution
        setAnalysisResult(null);
        setExecutionLogic(null);
        form.reset({ asset: 'ETH', amount: 1000, strategy: '' });
      } else {
        toast({
          variant: 'destructive',
          title: 'Execution Failed',
          description: result.error,
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Execution Error',
        description: 'An unexpected error occurred.',
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score <= 3) return 'text-green-500'; // Low risk
    if (score <= 7) return 'text-yellow-500'; // Medium risk
    return 'text-red-500'; // High risk
  };
  
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Flash Loan Builder</CardTitle>
          <CardDescription>Design and analyze your flash loan strategy before execution.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAnalyze)} className="space-y-6">
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

              <Button type="submit" disabled={isAnalyzing} className="w-full">
                {isAnalyzing ? <Loader2 className="animate-spin" /> : <Search />}
                Analyze Strategy
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {(isAnalyzing || analysisResult) && (
        <Card className="animate-in fade-in-50">
          <CardHeader>
            <CardTitle>Analysis Result</CardTitle>
            <CardDescription>Review the viability analysis and simulated performance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isAnalyzing && !analysisResult ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-40 w-full" />
              </div>
            ) : analysisResult ? (
              <div className="space-y-4">
                <Alert variant={analysisResult.viability === 'Viable' ? 'default' : 'destructive'}>
                  {analysisResult.viability === 'Viable' ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  <AlertTitle>Viability Status: {analysisResult.viability}</AlertTitle>
                  <AlertDescription>
                    <ReactMarkdown className="prose prose-sm prose-p:text-current dark:prose-invert">
                      {analysisResult.rationale}
                    </ReactMarkdown>
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Shield />
                        Risk Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-baseline gap-2">
                        <span className={`text-3xl font-bold ${getRiskColor(analysisResult.riskScore)}`}>{analysisResult.riskScore}</span>
                        <span className="text-sm text-muted-foreground">/ 10</span>
                      </div>
                       <div className="mt-2 space-y-2">
                        {analysisResult.riskBreakdown.map((risk, index) => (
                           <div key={index} className="text-xs">
                             <p className="font-semibold flex items-center gap-1.5"><AlertTriangle className="h-3 w-3 text-yellow-500" />{risk.risk}</p>
                             <p className="text-muted-foreground pl-5">{risk.description}</p>
                           </div>
                         ))}
                       </div>
                    </CardContent>
                  </Card>
                   <div>
                      <h3 className="font-semibold mb-2 text-lg">Simulated PnL</h3>
                       <ChartContainer config={{
                          profit: {
                            label: "Profit",
                            color: analysisResult.viability === 'Viable' ? "hsl(var(--chart-2))" : "hsl(var(--destructive))",
                          },
                        }} className="h-[200px] w-full">
                        <ResponsiveContainer>
                          <LineChart data={analysisResult.pnlData}>
                            <CartesianGrid vertical={false} />
                            <XAxis 
                              dataKey="time" 
                              tickLine={false} 
                              axisLine={false} 
                              tickMargin={8} 
                              tickFormatter={(value) => `T+${value}`}
                            />
                             <YAxis 
                              tickLine={false} 
                              axisLine={false} 
                              tickMargin={8}
                              tickFormatter={(value) => `$${value.toLocaleString()}`}
                              width={60}
                            />
                            <Tooltip
                              cursor={false}
                              content={<ChartTooltipContent indicator="dot" />}
                            />
                            <Line
                              dataKey="profit"
                              type="natural"
                              stroke="var(--color-profit)"
                              strokeWidth={2}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                  </div>
                </div>
                
                <Button onClick={handleExecute} disabled={isExecuting || analysisResult.viability === 'Not Viable'} className="w-full">
                  {isExecuting ? <Loader2 className="animate-spin" /> : <Zap />}
                  Execute Transaction
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
