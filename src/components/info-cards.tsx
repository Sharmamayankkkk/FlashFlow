
'use client';

import { FileQuestion, ShieldAlert } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

const problem = `
## The Problem

[Flash loans](https://docs.aave.com/developers/v/2.0/guides/flash-loans) are a powerful, uncollateralized lending tool unique to decentralized finance (DeFi). They allow users to borrow massive amounts of cryptocurrency for a single transaction, as long as the loan is repaid by the end of that same transaction. This opens up incredible opportunities for arbitrage, liquidations, and other complex financial maneuvers.

However, the technical complexity of creating and executing the necessary smart contracts makes flash loans inaccessible to most people. A single mistake in the code can lead to a failed transaction and lost gas fees. This high barrier to entry prevents widespread adoption and innovation.

## The Solution

FlashFlow solves this problem by providing an intuitive graphical user interface (GUI) where users can simply describe their strategy in natural language. An AI model then handles the complexity of generating, analyzing, and simulating the required smart contract, making the power of flash loans accessible to a much broader audience.
`;

const challenges = `
## Technical Challenges

A primary challenge was ensuring the atomicity of the flash loan. The entire sequence—borrowing, executing a strategy, and repaying the loan—must occur within a single blockchain transaction. Crafting the AI prompt to generate robust and gas-efficient smart contract logic that handles all these steps correctly was complex. Any error in the generated code could lead to the transaction failing and the loan not being repaid, which, while safe due to automatic reversion, is not a successful outcome.

Another hurdle was creating a realistic, real-time simulation of the transaction. To provide users with an accurate viability assessment, the simulation needs to account for rapidly changing market conditions, such as price slippage on decentralized exchanges (DEXs) and network gas fees. This required the AI model to act as a sophisticated analyst, capable of inferring these risks from the code and providing a reasonable profit-and-loss projection without actually forking the blockchain state.
`;

export function InfoCards() {
    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileQuestion className="h-5 w-5" />
                        The Problem & Solution
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-4">
                    <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none prose-p:text-muted-foreground prose-h2:text-card-foreground prose-h2:text-lg prose-h2:font-semibold prose-a:text-primary hover:prose-a:text-primary/80">
                        {problem}
                    </ReactMarkdown>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShieldAlert className="h-5 w-5" />
                        Technical Challenges
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-4">
                     <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none prose-p:text-muted-foreground prose-h2:text-card-foreground prose-h2:text-lg prose-h2:font-semibold">
                        {challenges}
                    </ReactMarkdown>
                </CardContent>
            </Card>
        </>
    )
}
