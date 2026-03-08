import { Search, Film, User } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function Header() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 glass-strong">
      <div className="container mx-auto flex items-center justify-between gap-3 py-3 px-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <Film className="w-7 h-7 text-primary" />
          <h1 className="text-xl font-bold text-gradient hidden sm:block">JIE影视4K</h1>
        </Link>

        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索电影、电视剧、动漫..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 text-sm transition-all"
            />
          </div>
        </form>

        <Link
          to={user ? '/me' : '/auth'}
          className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl glass text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <User className="w-4 h-4" />
          <span className="hidden sm:inline text-xs">
            {user ? (profile?.username || '我的') : '登录'}
          </span>
        </Link>
      </div>
    </header>
  );
}
