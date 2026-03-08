import { useState } from 'react';
import { PLAYER_SOURCES } from '@/lib/tmdb';
import { MonitorPlay, RefreshCw } from 'lucide-react';

interface Props {
  tmdbId: number;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
  title?: string;
}

export default function EmbedPlayer({ tmdbId, type, season, episode, title }: Props) {
  const [sourceIdx, setSourceIdx] = useState(0);
  const [iframeKey, setIframeKey] = useState(0);

  const currentSource = PLAYER_SOURCES[sourceIdx];
  const playerUrl = currentSource.getUrl(tmdbId, type, season, episode);

  const handleRetry = () => {
    setIframeKey((k) => k + 1);
  };

  return (
    <div className="rounded-2xl overflow-hidden glass">
      {/* Source selector */}
      <div className="flex items-center gap-2 p-3 border-b border-border/50">
        <MonitorPlay className="w-4 h-4 text-primary shrink-0" />
        <span className="text-xs text-muted-foreground shrink-0">播放线路：</span>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          {PLAYER_SOURCES.map((src, i) => (
            <button
              key={i}
              onClick={() => { setSourceIdx(i); setIframeKey((k) => k + 1); }}
              className={`shrink-0 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                i === sourceIdx
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary/50 text-secondary-foreground hover:bg-secondary'
              }`}
            >
              {src.name}
            </button>
          ))}
        </div>
        <button
          onClick={handleRetry}
          className="shrink-0 ml-auto p-1.5 rounded-lg bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
          title="重新加载"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Player iframe */}
      <div className="relative aspect-video bg-background">
        <iframe
          key={iframeKey}
          src={playerUrl}
          className="absolute inset-0 w-full h-full"
          allowFullScreen
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          referrerPolicy="no-referrer"
          title={title || '视频播放'}
        />
      </div>

      <div className="px-3 py-2 text-[10px] text-muted-foreground/60 text-center">
        如无法播放请切换线路 · 视频资源来自第三方
      </div>
    </div>
  );
}
