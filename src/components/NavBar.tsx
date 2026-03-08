import { Home, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/', label: '首页', icon: <Home className="w-4 h-4" /> },
  { to: '/category/movie', label: '电影', icon: <span className="text-sm">🎬</span> },
  { to: '/category/tv', label: '电视剧', icon: <span className="text-sm">📺</span> },
  { to: '/category/anime', label: '日本动漫', icon: <span className="text-sm">🎌</span> },
  { to: '/me', label: '我的', icon: <User className="w-4 h-4" /> },
];

export default function NavBar() {
  const { pathname } = useLocation();

  return (
    <nav className="flex gap-1 overflow-x-auto scrollbar-hide py-3">
      {NAV_ITEMS.map((link) => {
        const active = pathname === link.to;
        return (
          <Link
            key={link.to}
            to={link.to}
            className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              active ? 'bg-primary text-primary-foreground glow' : 'glass text-muted-foreground hover:text-foreground'
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
