import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { AlertCircle } from 'lucide-react';

interface Props {
  url: string;
}

export default function VideoPlayer({ url }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    setError('');

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (url.includes('.m3u8')) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
        });
        hlsRef.current = hls;
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {});
        });
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            setError('视频加载失败，请尝试其他线路');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.addEventListener('loadedmetadata', () => {
          video.play().catch(() => {});
        });
      } else {
        setError('您的浏览器不支持播放此视频');
      }
    } else {
      video.src = url;
      video.play().catch(() => {});
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [url]);

  if (error) {
    return (
      <div className="w-full aspect-video bg-secondary rounded-xl flex flex-col items-center justify-center gap-3">
        <AlertCircle className="w-10 h-10 text-destructive" />
        <p className="text-muted-foreground text-sm">{error}</p>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      className="w-full aspect-video bg-background rounded-xl"
      controls
      playsInline
      autoPlay
    />
  );
}
