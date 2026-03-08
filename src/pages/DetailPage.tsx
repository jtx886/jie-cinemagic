import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchVodList, parsePlayUrls, type VodItem, type PlaySource } from '@/lib/videoApi';
import Header from '@/components/Header';
import VideoPlayer from '@/components/VideoPlayer';
import { Loader2, Calendar, MapPin, User, Clapperboard } from 'lucide-react';

export default function DetailPage() {
  const { id } = useParams();
  const [item, setItem] = useState<VodItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [sources, setSources] = useState<PlaySource[]>([]);
  const [activeSource, setActiveSource] = useState(0);
  const [activeEp, setActiveEp] = useState(0);
  const [playUrl, setPlayUrl] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchVodList({ ac: 'detail', ids: id })
      .then((res) => {
        const vod = res.list?.[0];
        if (vod) {
          setItem(vod);
          const parsed = parsePlayUrls(vod.vod_play_url, vod.vod_play_from);
          setSources(parsed);
          // Auto-select first m3u8 source
          const m3u8Source = parsed.findIndex((s) =>
            s.urls.some((u) => u.url.includes('.m3u8'))
          );
          const idx = m3u8Source >= 0 ? m3u8Source : 0;
          setActiveSource(idx);
          setActiveEp(0);
          if (parsed[idx]?.urls[0]?.url) {
            setPlayUrl(parsed[idx].urls[0].url);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleSelectEp = (sourceIdx: number, epIdx: number) => {
    setActiveSource(sourceIdx);
    setActiveEp(epIdx);
    setPlayUrl(sources[sourceIdx]?.urls[epIdx]?.url || '');
  };

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

  if (!item) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex justify-center py-32 text-muted-foreground">未找到该影视</div>
      </div>
    );
  }

  const cleanContent = item.vod_content?.replace(/<[^>]*>/g, '') || item.vod_blurb || '';

  return (
    <div className="min-h-screen bg-background">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: 'var(--gradient-hero)' }}
      />
      <div className="relative z-10">
        <Header />
        <main className="container mx-auto px-4 pb-20">
          {/* Player */}
          {playUrl && (
            <div className="mt-4 rounded-2xl overflow-hidden glass">
              <VideoPlayer url={playUrl} />
            </div>
          )}

          {/* Info */}
          <div className="mt-6 flex flex-col md:flex-row gap-6">
            <img
              src={item.vod_pic}
              alt={item.vod_name}
              className="w-36 md:w-48 aspect-[2/3] object-cover rounded-xl glass shrink-0 self-start"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">{item.vod_name}</h1>
              <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
                {item.type_name && (
                  <span className="flex items-center gap-1">
                    <Clapperboard className="w-3.5 h-3.5" /> {item.type_name}
                  </span>
                )}
                {item.vod_year && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {item.vod_year}
                  </span>
                )}
                {item.vod_area && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {item.vod_area}
                  </span>
                )}
                {item.vod_director && (
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" /> {item.vod_director}
                  </span>
                )}
              </div>
              {item.vod_actor && (
                <p className="text-xs text-muted-foreground mt-2">
                  主演：{item.vod_actor}
                </p>
              )}
              {cleanContent && (
                <p className="text-sm text-secondary-foreground/80 mt-4 leading-relaxed line-clamp-4">
                  {cleanContent}
                </p>
              )}
            </div>
          </div>

          {/* Episode selector */}
          {sources.length > 0 && (
            <div className="mt-8 space-y-4">
              {/* Source tabs */}
              {sources.length > 1 && (
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                  {sources.map((src, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectEp(i, 0)}
                      className={`shrink-0 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                        i === activeSource
                          ? 'bg-primary text-primary-foreground glow'
                          : 'glass text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {src.name || `线路${i + 1}`}
                    </button>
                  ))}
                </div>
              )}

              {/* Episodes */}
              <div className="glass rounded-2xl p-4">
                <h3 className="text-sm font-medium mb-3 text-foreground">选集</h3>
                <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto scrollbar-hide">
                  {sources[activeSource]?.urls.map((ep, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectEp(activeSource, i)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        i === activeEp && activeSource === activeSource
                          ? 'bg-primary text-primary-foreground glow'
                          : 'bg-secondary/50 text-secondary-foreground hover:bg-secondary'
                      }`}
                    >
                      {ep.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
