'use server';

/**
 * @fileOverview Simulates a flash loan transaction using AI to validate its viability before execution.
 *
 * - simulateFlashLoanTransaction - A function that simulates the flash loan transaction.
 * - SimulateFlashLoanTransactionInput - The input type for the simulateFlashLoanTransaction function.
 * - SimulateFlashLoanTransactionOutput - The return type for the simulateFlashLoanTransaction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SimulateFlashLoanTransactionInputSchema = z.object({
  asset: z.string().describe('The asset to be used in the flash loan.'),
  amount: z.number().describe('The amount of the asset to be borrowed.'),
  executionLogic: z.string().describe('The smart contract code that defines the flash loan execution logic.'),
});
export type SimulateFlashLoanTransactionInput = z.infer<typeof SimulateFlashLoanTransactionInputSchema>;

const ProfitAndLossDataPointSchema = z.object({
    time: z.number().describe('The timestamp of the data point, as a numerical value.'),
    profit: z.number().describe('The profit or loss at this point in time.'),
});

const SimulateFlashLoanTransactionOutputSchema = z.object({
  isViable: z.boolean().describe('Whether the flash loan transaction is viable.'),
  riskAssessment: z.string().describe('A detailed risk assessment of the flash loan transaction.'),
  feedback: z.string().describe('Feedback and recommendations for the user based on the simulation.'),
  profitAndLossData: z.array(ProfitAndLossDataPointSchema).describe('An array of profit and loss data points over the course of the simulated transaction.'),
});
export type SimulateFlashLoanTransactionOutput = z.infer<typeof SimulateFlashLoanTransactionOutputSchema>;

export async function simulateFlashLoanTransaction(input: SimulateFlashLoanTransactionInput): Promise<SimulateFlashLoanTransactionOutput> {
  return simulateFlashLoanTransactionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'simulateFlashLoanTransactionPrompt',
  input: {schema: SimulateFlashLoanTransactionInputSchema},
  output: {schema: SimulateFlashLoanTransactionOutputSchema},
  prompt: `You are an AI-powered simulation tool for flash loan transactions. Your role is to assess the viability of a flash loan transaction before it is executed on the blockchain.

  Based on the provided information, evaluate the potential risks and provide feedback to the user. Set the isViable output field appropriately.

  In addition, generate a series of 10-15 data points to simulate the profit and loss over the very short duration of the flash loan. This data will be used to create a chart.

  - If you determine the transaction is viable, the profitAndLossData should show a clear upward trend, ending in a positive profit.
  - If the transaction is not viable, the data should show a downward trend, ending in a loss.
  - The "time" for the data points should be a simple sequence, like 0, 1, 2, 3...

  Asset: {{{asset}}}
  Amount: {{{amount}}}
  Execution Logic: {{{executionLogic}}}
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
