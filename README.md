# FlashFlow: AI-Powered Flash Loan GUI

FlashFlow is a Next.js application that provides a user-friendly graphical interface for designing, simulating, and executing flash loans. It leverages AI to generate the underlying Solidity smart contract logic from natural language and to analyze the viability of a proposed transaction before it's sent to the blockchain.

## Key Features

*   **Natural Language Strategy Input:** Describe your flash loan strategy in plain English.
*   **AI-Powered Code Generation:** An AI model converts your strategy into secure and efficient Solidity code.
*   **Transaction Simulation:** Before execution, an AI-powered analyst simulates the transaction, assessing its viability and estimating potential profit or loss.
*   **Interactive PnL Chart:** Visualize the simulated financial performance of your strategy.
*   **Transaction Dashboard:** Monitor the status of your past flash loan attempts.
*   **Built with Modern Tech:** Next.js, TypeScript, ShadCN UI, Tailwind CSS, and Genkit for AI integration.

## How It Works

1.  **Define Strategy:** The user specifies the asset and amount for the loan and describes their trading strategy.
2.  **AI Generates Logic:** The `generateExecutionLogic` flow uses an AI model to write the Solidity code required to execute the strategy.
3.  **AI Simulates Transaction:** The `simulateFlashLoanTransaction` flow takes the generated code and analyzes it for risks and profitability, returning a "Viable" or "Not Viable" status, a rationale, and data for a PnL chart.
4.  **User Executes:** If the simulation is viable, the user can choose to execute the transaction, which is then processed by a simulated blockchain service.
