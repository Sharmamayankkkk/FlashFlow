'use server';

/**
 * @fileOverview Analyzes the viability and risks of a flash loan's execution logic.
 *
 * - simulateFlashLoanTransaction - A function that simulates the transaction.
 * - SimulateFlashLoanTransactionInput - The input type for the function.
 * - SimulateFlashLoanTransactionOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SimulateFlashLoanTransactionInputSchema = z.object({
  executionLogic: z.string().describe('The smart contract code to be analyzed.'),
});
export type SimulateFlashLoanTransactionInput = z.infer<typeof SimulateFlashLoanTransactionInputSchema>;

const SimulateFlashLoanTransactionOutputSchema = z.object({
  viability: z.enum(['Viable', 'Not Viable']).describe('Whether the transaction is likely to be profitable.'),
  rationale: z.string().describe('The reasoning behind the viability assessment.'),
  pnlData: z.array(z.object({
    time: z.number().describe("The time step, from 0 to 10."),
    profit: z.number().describe("The simulated profit or loss at this time step."),
  })).describe('An array of profit/loss data points over 10 time steps to illustrate the transaction\'s performance.'),
  riskScore: z.number().min(1).max(10).describe('A score from 1 (low risk) to 10 (high risk).'),
  riskBreakdown: z.array(z.object({
    risk: z.string().describe('The name of the identified risk.'),
    description: z.string().describe('A brief explanation of the risk.'),
  })).describe('A breakdown of the specific risks identified.'),
});
export type SimulateFlashLoanTransactionOutput = z.infer<typeof SimulateFlashLoanTransactionOutputSchema>;

export async function simulateFlashLoanTransaction(input: SimulateFlashLoanTransactionInput): Promise<SimulateFlashLoanTransactionOutput> {
    return simulateFlashLoanTransactionFlow(input);
}

const prompt = ai.definePrompt({
    name: 'simulateFlashLoanTransactionPrompt',
    input: {schema: SimulateFlashLoanTransactionInputSchema},
    output: {schema: SimulateFlashLoanTransactionOutputSchema},
    prompt: `You are a blockchain security expert and DeFi analyst. Your task is to analyze the provided smart contract execution logic for a flash loan and determine its viability and associated risks.

    Analyze the following code:
    {{{executionLogic}}}

    Based on your analysis, you must perform the following actions:
    1.  **Viability Assessment**: Determine if the strategy is 'Viable' or 'Not Viable'. A viable strategy should be profitable and have a high chance of success. Default to 'Viable' unless you see clear and high-probability risks (e.g., obvious logic errors, high gas costs that would negate profit, reliance on highly volatile assets with no slippage protection).
    2.  **P&L Simulation**: Generate a list of 10 profit-and-loss data points (pnlData) to simulate the transaction's financial performance.
        - If the transaction is 'Viable', the profit should generally trend upwards, ending positive.
        - If it's 'Not Viable', the profit should trend downwards, ending negative.
        - Start profit at 0 for time 0.
    3.  **Risk Score**: Assign a 'riskScore' from 1 (very low risk) to 10 (extremely high risk). Base this on factors like code complexity, reliance on market conditions, and potential for slippage or high gas fees. A simple, direct arbitrage should be low risk, while a multi-step process involving volatile assets should be higher risk.
    4.  **Risk Breakdown**: Provide a 'riskBreakdown' detailing the potential risks. Always include at least two risks, even for viable-seeming transactions. Examples include 'Price Slippage', 'Gas Fee Volatility', 'Contract Vulnerability', or 'Market Fluctuation'. For each risk, provide a short description.
    5.  **Rationale**: Provide a concise 'rationale' for your overall viability decision, taking the risks into account.
    `,
});


const simulateFlashLoanTransactionFlow = ai.defineFlow(
  {
    name: 'simulateFlashLoanTransactionFlow',
    inputSchema: SimulateFlashLoanTransactionInputSchema,
    outputSchema: SimulateFlashLoanTransactionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
