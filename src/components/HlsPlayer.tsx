import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { AlertCircle, Loader2, Maximize, Minimize } from 'lucide-react';

interface Props {
  url: string;
  onError?: () => void;
}

export default function HlsPlayer({ url, onError }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen?.().catch(() => {
        // Fallback: try video element directly (better mobile support)
        videoRef.current?.requestFullscreen?.().catch(() => {});
      });
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    setError('');
    setLoading(true);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (url.includes('.m3u8')) {
      if (Hls.isSupported()) {
        const hls = new Hls({ maxBufferLength: 30, maxMaxBufferLength: 60 });
        hlsRef.current = hls;
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setLoading(false);
          video.play().catch(() => {});
        });
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            setLoading(false);
            setError('视频加载失败，请切换线路');
            onError?.();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.addEventListener('loadedmetadata', () => {
          setLoading(false);
          video.play().catch(() => {});
        });
        video.addEventListener('error', () => {
          setLoading(false);
          setError('视频加载失败');
          onError?.();
        });
      } else {
        setLoading(false);
        setError('您的浏览器不支持播放此视频');
      }
    } else {
      video.src = url;
      video.addEventListener('loadeddata', () => setLoading(false));
      video.addEventListener('error', () => {
        setLoading(false);
        setError('视频加载失败');
        onError?.();
      });
      video.play().catch(() => {});
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [url]);

  return (
    <div
      ref={containerRef}
      className={`relative bg-background rounded-xl overflow-hidden group ${
        isFullscreen ? 'fixed inset-0 z-[9999] rounded-none' : 'aspect-video'
      }`}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      )}
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-secondary">
          <AlertCircle className="w-10 h-10 text-destructive" />
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            className="w-full h-full"
            controls
            playsInline
            preload="auto"
            style={{ WebkitMediaPlaybackRequiresUserAction: false } as React.CSSProperties}
          />
          {/* Fullscreen button overlay */}
          <button
            onClick={toggleFullscreen}
            className="absolute top-3 right-3 z-20 p-2 rounded-lg bg-background/60 backdrop-blur text-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/80"
            title={isFullscreen ? '退出全屏' : '全屏播放'}
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </>
      )}
    </div>
  );
}
