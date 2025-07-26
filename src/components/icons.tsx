import type { SVGProps } from 'react';

// This component is no longer used, but kept in case of future use.
export function FlashFlowLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M13 10.25h4.5l-5.25 6v-3.75H8l5.25-6.25v4Z" fill="hsl(var(--primary))" stroke="none"/>
      <circle cx="12" cy="12" r="10" stroke="hsl(var(--primary))" />
    </svg>
  );
}
