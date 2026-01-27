import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';

export default function ThemeToggle() {
  // Avoid SSR mismatch; we only access document on client
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  const toggle = () => {
    const el = document.documentElement;
    const next = el.classList.contains('dark') ? 'light' : 'dark';
    el.classList.toggle('dark', next === 'dark');
    try { localStorage.setItem('theme', next); } catch {}
  };

  if (!ready) return null;

  return (
    <Button variant="toggle" size="icon" onClick={toggle}>
      <Sun className="size-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute size-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
