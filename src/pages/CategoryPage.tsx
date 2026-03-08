import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { tmdb, type TMDBItem } from '@/lib/tmdb';
import Header from '@/components/Header';
import NavBar from '@/components/NavBar';
import VideoCard from '@/components/VideoCard';
import { Loader2 } from 'lucide-react';

const CATEGORY_MAP: Record<string, { label: string; icon: string; fetcher: (page: number) => Promise<{ results: TMDBItem[]; total_pages: number }> }> = {
  movie: { label: '热门电影', icon: '🎬', fetcher: (p) => tmdb.moviesPopular(p) },
  tv: { label: '热门剧集', icon: '📺', fetcher: (p) => tmdb.tvPopular(p) },
  anime: { label: '日本动漫', icon: '🎌', fetcher: (p) => tmdb.anime(p) },
  animation: { label: '动画精选', icon: '✨', fetcher: (p) => tmdb.dongman(p) },
  guoman: { label: '国漫', icon: '🐉', fetcher: (p) => tmdb.guoman(p) },
  toprated: { label: '高分电影', icon: '⭐', fetcher: (p) => tmdb.moviesTopRated(p) },
};

export default function CategoryPage() {
  const { id } = useParams();
  const cat = CATEGORY_MAP[id || ''];
  const [items, setItems] = useState<TMDBItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!cat) return;
    setLoading(true);
    setPage(1);
    cat.fetcher(1)
      .then((res) => {
        setItems(res.results || []);
        setTotalPages(Math.min(res.total_pages || 1, 50));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const loadMore = () => {
    if (!cat) return;
    const next = page + 1;
    if (next > totalPages) return;
    setLoading(true);
    cat.fetcher(next)
      .then((res) => {
        setItems((prev) => [...prev, ...(res.results || [])]);
        setPage(next);
      })
      .finally(() => setLoading(false));
  };

  if (!cat) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex justify-center py-32 text-muted-foreground">未知分类</div>
      </div>
    );
  }

  // Assign media_type for categories
  const mediaType = id === 'movie' || id === 'toprated' ? 'movie' : 'tv';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pb-20">
        <NavBar />
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span>{cat.icon}</span>
          <span>{cat.label}</span>
        </h2>

        {loading && items.length === 0 ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
              {items.map((item) => (
                <VideoCard key={item.id} item={{ ...item, media_type: item.media_type || mediaType }} />
              ))}
            </div>
            {page < totalPages && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="glass px-8 py-2.5 rounded-xl text-sm font-medium text-primary hover:glow transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '加载更多'}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
