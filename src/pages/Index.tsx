import Header from '@/components/Header';
import NavBar from '@/components/NavBar';
import CategorySection from '@/components/CategorySection';
import { CATEGORIES } from '@/lib/videoApi';

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: 'var(--gradient-hero)' }}
      />
      <div className="relative z-10">
        <Header />
        <main className="container mx-auto px-4 pb-20">
          <NavBar />

          <div className="glass rounded-2xl p-4 md:p-6 mb-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gradient mb-2">
              JIE影视4K
            </h2>
            <p className="text-sm text-muted-foreground">
              免费在线观看 · 高清4K · 无广告 · 电影 · 电视剧 · 动漫
            </p>
            <div className="mt-3 flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span>作者：杰同学🐾</span>
              <span>桂ICP备202602110908号</span>
            </div>
          </div>

          <div className="space-y-10">
            {Object.values(CATEGORIES).map((cat) => (
              <CategorySection
                key={cat.id}
                title={cat.label}
                icon={cat.icon}
                categoryId={cat.id}
              />
            ))}
          </div>
        </main>

        <footer className="glass-strong py-6 text-center text-xs text-muted-foreground">
          <p>JIE影视4K © 2026 杰同学🐾</p>
          <p className="mt-1">备案号：桂ICP备202602110908号</p>
          <p className="mt-1">本站资源均来自互联网，仅供学习交流使用</p>
        </footer>
      </div>
    </div>
  );
}
