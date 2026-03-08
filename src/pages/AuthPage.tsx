import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import { Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);
  const { signUp, signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setBusy(true);

    if (mode === 'register') {
      if (!username.trim()) {
        setError('请输入用户名');
        setBusy(false);
        return;
      }
      const { error } = await signUp(email, password, username.trim());
      if (error) {
        setError(error);
      } else {
        setSuccess('注册成功！请查收邮箱确认链接，或直接登录。');
        setMode('login');
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error);
      } else {
        navigate('/me');
      }
    }
    setBusy(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'var(--gradient-hero)' }} />
      <div className="relative z-10">
        <Header />
        <main className="container mx-auto px-4 flex items-center justify-center py-16">
          <div className="glass rounded-2xl p-6 md:p-8 w-full max-w-sm">
            <h2 className="text-xl font-bold text-foreground text-center mb-1">
              {mode === 'login' ? '登录' : '注册'}
            </h2>
            <p className="text-xs text-muted-foreground text-center mb-6">
              {mode === 'login' ? '欢迎回来，继续观影' : '创建账号，开启观影之旅'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="用户名"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                    required
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="邮箱地址"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="密码（至少6位）"
                  minLength={6}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-secondary/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {error && <p className="text-xs text-destructive">{error}</p>}
              {success && <p className="text-xs text-primary">{success}</p>}

              <button
                type="submit"
                disabled={busy}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm glow hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                {mode === 'login' ? '登录' : '注册'}
              </button>
            </form>

            <p className="text-xs text-muted-foreground text-center mt-5">
              {mode === 'login' ? '没有账号？' : '已有账号？'}
              <button
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  setError('');
                  setSuccess('');
                }}
                className="text-primary font-medium ml-1 hover:underline"
              >
                {mode === 'login' ? '立即注册' : '去登录'}
              </button>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
