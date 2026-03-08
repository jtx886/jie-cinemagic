import { Link } from 'react-router-dom';
import { getImageUrl, getTitle, getYear, getMediaType, type TMDBItem } from '@/lib/tmdb';
import { Play, Star } from 'lucide-react';

interface Props {
  item: TMDBItem;
}

export default function VideoCard({ item }: Props) {
  const type = getMediaType(item);
  const title = getTitle(item);
  const year = getYear(item);

  return (
    <Link
      to={`/detail/${type}/${item.id}`}
      className="glass-card rounded-xl overflow-hidden group block"
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-secondary">
        <img
          src={getImageUrl(item.poster_path)}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center glow">
            <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
          </div>
        </div>
        {item.vote_average > 0 && (
          <span className="absolute top-2 left-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-background/70 backdrop-blur text-xs text-yellow-400 font-medium">
            <Star className="w-3 h-3 fill-yellow-400" />
            {item.vote_average.toFixed(1)}
          </span>
        )}
        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-primary/90 text-primary-foreground text-[10px] font-medium">
          {type === 'movie' ? '电影' : '剧集'}
        </span>
      </div>
      <div className="p-3">
        <h3 className="text-sm font-medium text-foreground truncate">{title}</h3>
        <p className="text-xs text-muted-foreground mt-1 truncate">
          {year}
        </p>
      </div>
    </Link>
  );
}
