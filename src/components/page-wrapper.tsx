import { Header } from '@/components/header';

export function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
