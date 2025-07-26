'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from './ui/skeleton';

export function InfoCards() {
  const [problem, setProblem] = useState('');
  const [challenges, setChallenges] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/problem.md').then(res => res.text()),
      fetch('/challenges.md').then(res => res.text()),
    ]).then(([problemText, challengesText]) => {
      setProblem(problemText);
      setChallenges(challengesText);
      setLoading(false);
    });
  }, []);

  return (
    <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>The Problem</AccordionTrigger>
        <AccordionContent>
          <Card>
            <CardContent className="pt-6">
                {loading ? <Skeleton className="h-24" /> : <ReactMarkdown className="prose prose-invert text-sm max-w-none">{problem}</ReactMarkdown>}
            </CardContent>
          </Card>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Challenges</AccordionTrigger>
        <AccordionContent>
          <Card>
            <CardContent className="pt-6">
                {loading ? <Skeleton className="h-32" /> : <ReactMarkdown className="prose prose-invert text-sm max-w-none">{challenges}</ReactMarkdown>}
            </CardContent>
          </Card>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
