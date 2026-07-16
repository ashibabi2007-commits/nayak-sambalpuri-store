import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nayak Sambalpuri Bastralaya | Sambalpuri Cotton & Silk Sarees',
  description: 'Manufacturer of Sambalpuri cotton and silk sarees in Sambalpur, Odisha.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
