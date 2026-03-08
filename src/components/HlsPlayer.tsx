import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { AlertCircle, Loader2, Maximize, Minimize, Volume2 } from 'lucide-react';

interface Props {
  url: string;
  autoPlaySignal?: number;
  onError?: () => void;
}

export default function HlsPlayer({ url, autoPlaySignal = 0, onError }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [muted, setMuted] = useState(true);

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen?.().catch(() => {
        videoRef.current?.requestFullscreen?.().catch(() => {});
      });
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  const tryAutoplay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = muted;
    video.playsInline = true;
    video.play().catch(() => {
      // ignore blocked autoplay; user can tap play button in controls
    });
  }, [muted]);

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

    video.muted = muted;
    video.playsInline = true;
    video.preload = 'auto';

    if (url.includes('.m3u8')) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          maxBufferLength: 20,
          maxMaxBufferLength: 40,
          fragLoadingTimeOut: 10000,
          manifestLoadingTimeOut: 10000,
        });
        hlsRef.current = hls;
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setLoading(false);
          if (autoPlaySignal > 0) tryAutoplay();
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
          if (autoPlaySignal > 0) tryAutoplay();
        });
        video.addEventListener('error', () => {
          setLoading(false);
          setError('视频加载失败');
          onError?.();
        });
      } else {
        setLoading(false);
        setError('您的浏览器不支持此视频格式');
      }
    } else {
      video.src = url;
      video.addEventListener('loadeddata', () => {
        setLoading(false);
        if (autoPlaySignal > 0) tryAutoplay();
      });
      video.addEventListener('error', () => {
        setLoading(false);
        setError('视频加载失败');
        onError?.();
      });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [url, autoPlaySignal, tryAutoplay, muted, onError]);

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
          <video ref={videoRef} className="w-full h-full" controls playsInline preload="auto" muted={muted} />
          <div className="absolute top-3 right-3 z-20 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setMuted((m) => !m)}
              className="p-2 rounded-lg bg-background/60 backdrop-blur text-foreground hover:bg-background/80"
              title={muted ? '取消静音' : '静音'}
            >
              <Volume2 className="w-5 h-5" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg bg-background/60 backdrop-blur text-foreground hover:bg-background/80"
              title={isFullscreen ? '退出全屏' : '全屏播放'}
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
