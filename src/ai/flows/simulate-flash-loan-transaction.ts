'use server';

/**
 * @fileOverview Analyzes the viability of a flash loan's execution logic.
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
});
export type SimulateFlashLoanTransactionOutput = z.infer<typeof SimulateFlashLoanTransactionOutputSchema>;

export async function simulateFlashLoanTransaction(input: SimulateFlashLoanTransactionInput): Promise<SimulateFlashLoanTransactionOutput> {
    return simulateFlashLoanTransactionFlow(input);
}

const prompt = ai.definePrompt({
    name: 'simulateFlashLoanTransactionPrompt',
    input: {schema: SimulateFlashLoanTransactionInputSchema},
    output: {schema: SimulateFlashLoanTransactionOutputSchema},
    prompt: `You are a blockchain security expert and DeFi analyst. Your task is to analyze the provided smart contract execution logic for a flash loan and determine its viability.

    Analyze the following code:
    {{{executionLogic}}}

    Based on your analysis, determine if the strategy is 'Viable' or 'Not Viable'. A viable strategy should be profitable and have a high chance of success. Default to 'Viable' unless you see clear and high-probability risks (e.g., obvious logic errors, high gas costs that would negate profit, reliance on highly volatile assets with no slippage protection).

    Also, generate a list of 10 profit-and-loss data points (pnlData) to simulate the transaction's financial performance over time.
    - If the transaction is 'Viable', the profit should generally trend upwards, ending with a positive value.
    - If it's 'Not Viable', the profit should trend downwards, ending with a negative value.
    - Start the profit at 0 for time 0.
    
    Provide a concise rationale for your decision.
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
