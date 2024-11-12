'use client';

import './globals.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import localFont from 'next/font/local';

const queryClient = new QueryClient();

const paperlogy = localFont({
  src: [
    {
      path: './fonts/Paperlogy-1Thin.ttf',
      weight: '100',
      style: 'normal',
    },
    {
      path: './fonts/Paperlogy-2ExtraLight.ttf',
      weight: '200',
      style: 'normal',
    },
    {
      path: './fonts/Paperlogy-3Light.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: './fonts/Paperlogy-4Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/Paperlogy-5Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: './fonts/Paperlogy-6SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: './fonts/Paperlogy-7Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: './fonts/Paperlogy-8ExtraBold.ttf',
      weight: '800',
      style: 'normal',
    },
    {
      path: './fonts/Paperlogy-9Black.ttf',
      weight: '900',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-paperlogy',
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={paperlogy.variable}>
      <body>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </body>
    </html>
  );
}
