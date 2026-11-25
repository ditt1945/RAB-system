'use client';

import { Printer } from 'lucide-react';
import { buttonClass } from '@/components/ui';

export default function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className={buttonClass.secondary}>
      <Printer className="h-4 w-4" /> <span className="hidden sm:inline">Cetak</span>
    </button>
  );
}
