import { CATEGORIES } from '@/lib/videoApi';
import { Link, useLocation } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NavBar() {
  const { pathname } = useLocation();

  const links = [
    { to: '/', label: '首页', icon: <Home className="w-4 h-4" /> },
    ...Object.values(CATEGORIES).map((c) => ({
      to: `/category/${c.id}`,
      label: c.label,
      icon: <span className="text-sm">{c.icon}</span>,
    })),
  ];

  return (
    <nav className="flex gap-1 overflow-x-auto scrollbar-hide py-3">
      {links.map((link) => {
        const active = pathname === link.to;
        return (
          <Link
            key={link.to}
            to={link.to}
            className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              active
                ? 'bg-primary text-primary-foreground glow'
                : 'glass text-muted-foreground hover:text-foreground'
            }`}
          >
            {link.icon}
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
