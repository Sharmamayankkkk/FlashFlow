'use server';

/**
 * @fileOverview Generates smart contract execution logic from a natural language description.
 *
 * - generateExecutionLogic - A function that creates smart contract code.
 * - GenerateExecutionLogicInput - The input type for the generateExecutionLogic function.
 * - GenerateExecutionLogicOutput - The return type for the generateExecutionLogic function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateExecutionLogicInputSchema = z.object({
  asset: z.string().describe('The asset to be used in the flash loan.'),
  amount: z.number().describe('The amount of the asset to be borrowed.'),
  strategy: z.string().describe('The user-defined strategy in natural language.'),
});
export type GenerateExecutionLogicInput = z.infer<typeof GenerateExecutionLogicInputSchema>;

const GenerateExecutionLogicOutputSchema = z.object({
  executionLogic: z.string().describe('The generated smart contract code for the flash loan execution logic.'),
});
export type GenerateExecutionLogicOutput = z.infer<typeof GenerateExecutionLogicOutputSchema>;


export async function generateExecutionLogic(input: GenerateExecutionLogicInput): Promise<GenerateExecutionLogicOutput> {
  return generateExecutionLogicFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateExecutionLogicPrompt',
    input: {schema: GenerateExecutionLogicInputSchema},
    output: {schema: GenerateExecutionLogicOutputSchema},
    prompt: `You are an expert in writing Solidity smart contracts for flash loans. Based on the user's strategy, generate the execution logic. The code should be well-commented and follow best practices.

    The user wants to borrow an asset and has provided the following parameters:
    Asset: {{{asset}}}
    Amount: {{{amount}}}

    Their strategy is as follows:
    Strategy: {{{strategy}}}
    `,
});

const generateExecutionLogicFlow = ai.defineFlow(
  {
    name: 'generateExecutionLogicFlow',
    inputSchema: GenerateExecutionLogicInputSchema,
    outputSchema: GenerateExecutionLogicOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
