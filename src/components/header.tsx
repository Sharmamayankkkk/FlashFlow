import Image from 'next/image';

export function Header() {
  return (
    <header className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm z-10">
      <div className="container mx-auto px-4 md:px-8 h-16 flex items-center">
        <div className="flex items-center gap-3">
          <Image src="/logo.svg" alt="FlashFlow Logo" width={32} height={32} />
          <h1 className="text-2xl font-bold text-foreground">
            FlashFlow
          </h1>
        </div>
      </div>
    </header>
  );
}
