import Header from '@/components/Header';
import NavBar from '@/components/NavBar';
import { User, ShieldCheck, History, Heart } from 'lucide-react';

export default function MyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pb-20">
        <NavBar />

        <section className="glass rounded-2xl p-5 md:p-7 mt-2">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">我的资料</h1>
              <p className="text-sm text-muted-foreground">登录后可同步收藏、历史和偏好</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 text-foreground font-medium text-sm">
                <History className="w-4 h-4 text-primary" /> 播放历史
              </div>
              <p className="text-xs text-muted-foreground mt-2">最近观看记录将在登录后保存。</p>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 text-foreground font-medium text-sm">
                <Heart className="w-4 h-4 text-primary" /> 我的收藏
              </div>
              <p className="text-xs text-muted-foreground mt-2">登录后可跨设备同步收藏内容。</p>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 text-foreground font-medium text-sm">
                <ShieldCheck className="w-4 h-4 text-primary" /> 账号安全
              </div>
              <p className="text-xs text-muted-foreground mt-2">支持邮箱 + 用户名注册登录。</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
