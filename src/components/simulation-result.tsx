import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { SimulateFlashLoanTransactionOutput } from '@/ai/flows/validate-loan-viability';
import { CheckCircle, XCircle, Zap } from 'lucide-react';

interface SimulationResultProps {
  result: SimulateFlashLoanTransactionOutput;
  onExecute: () => void;
  onClear: () => void;
  isExecuting: boolean;
}

export function SimulationResult({ result, onExecute, onClear, isExecuting }: SimulationResultProps) {
  const { isViable, riskAssessment, feedback } = result;

  return (
    <div className="mt-6 animate-in fade-in-50">
      <Separator className="my-6" />
      <h3 className="text-lg font-semibold mb-4 text-center">Simulation Result</h3>
      <Card className="bg-card/50 border-border">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Viability Status</span>
            <Badge variant={isViable ? 'default' : 'destructive'} className={isViable ? 'bg-accent text-accent-foreground hover:bg-accent/90' : ''}>
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
          <Button onClick={onExecute} disabled={!isViable || isExecuting} className="w-full">
              <Zap className="mr-2 h-4 w-4" />
              Execute Loan
          </Button>
      </div>
    </div>
  );
}
