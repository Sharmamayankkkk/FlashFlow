'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { SimulateFlashLoanTransactionOutput } from '@/ai/flows/validate-loan-viability';
import { CheckCircle, XCircle, Zap } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

interface SimulationResultProps {
  result: SimulateFlashLoanTransactionOutput;
  onExecute: () => void;
  onClear: () => void;
}

const chartConfig = {
  profit: {
    label: "Profit",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export function SimulationResult({ result, onExecute, onClear }: SimulationResultProps) {
  const { isViable, riskAssessment, feedback, profitAndLossData } = result;
  
  const isProfit = profitAndLossData[profitAndLossData.length - 1].profit > 0;

  return (
    <div className="mt-6 animate-in fade-in-50">
      <Separator className="my-6" />
      <h3 className="text-lg font-semibold mb-4 text-center">Simulation Result</h3>
      <Card className="bg-card/50 border-border">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Viability Status</span>
            <Badge variant={isViable ? 'default' : 'destructive'} >
              {isViable ? (
                <CheckCircle className="mr-2 h-4 w-4" />
              ) : (
                <XCircle className="mr-2 h-4 w-4" />
              )}
              {isViable ? 'Viable' : 'Not Viable'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="h-[200px] w-full">
                <ChartContainer config={chartConfig} className="h-full w-full">
                    <AreaChart data={profitAndLossData} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                        <defs>
                            <linearGradient id="fillProfit" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={isProfit ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'} stopOpacity={0.8} />
                                <stop offset="95%" stopColor={isProfit ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'} stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `T+${value}`} />
                        <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                        <Tooltip cursor={{fill: 'hsl(var(--muted))'}} content={<ChartTooltipContent />} />
                        <Area
                            dataKey="profit"
                            type="natural"
                            fill="url(#fillProfit)"
                            stroke={isProfit ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'}
                        />
                    </AreaChart>
                </ChartContainer>
            </div>
          <div>
            <h4 className="font-semibold text-primary">Risk Assessment</h4>
            <p className="text-sm text-muted-foreground">{riskAssessment}</p>
          </div>
          <div>
            <h4 className="font-semibold text-primary">Feedback & Recommendations</h4>
            <p className="text-sm text-muted-foreground">{feedback}</p>
          </div>
        </CardContent>
      </Card>
      <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <Button onClick={onClear} variant="outline" className="w-full">
              Clear
          </Button>
          <Button onClick={onExecute} disabled={!isViable} className="w-full">
              <Zap className="mr-2 h-4 w-4" />
              Execute Loan
          </Button>
      </div>
    </div>
  );
}
