import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import NavBar from '@/components/NavBar';
import { User, ShieldCheck, History, Heart, LogOut, LogIn, Loader2 } from 'lucide-react';

export default function MyPage() {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex justify-center py-32">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pb-20">
        <NavBar />

        <section className="glass rounded-2xl p-5 md:p-7 mt-2">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-primary" />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">我的</h1>
              {user ? (
                <div>
                  <p className="text-sm text-foreground">{profile?.username || '用户'}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">登录后可同步收藏、历史和偏好</p>
              )}
            </div>
            {user ? (
              <button
                onClick={async () => {
                  await signOut();
                  navigate('/');
                }}
                className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl glass text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <LogOut className="w-4 h-4" /> 退出
              </button>
            ) : (
              <button
                onClick={() => navigate('/auth')}
                className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium glow hover:opacity-90 transition-all"
              >
                <LogIn className="w-4 h-4" /> 登录 / 注册
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 text-foreground font-medium text-sm">
                <History className="w-4 h-4 text-primary" /> 播放历史
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {user ? '暂无播放记录' : '登录后可查看播放记录'}
              </p>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 text-foreground font-medium text-sm">
                <Heart className="w-4 h-4 text-primary" /> 我的收藏
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {user ? '暂无收藏内容' : '登录后可跨设备同步收藏'}
              </p>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 text-foreground font-medium text-sm">
                <ShieldCheck className="w-4 h-4 text-primary" /> 账号安全
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {user ? '账号已登录，信息安全' : '支持邮箱 + 用户名注册登录'}
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
