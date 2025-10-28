import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertTriangle, Play, Pause, RotateCcw, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { Channel } from '@/types/iptv';

interface VideoPlayerProps {
  channel: Channel;
  onBack: () => void;
}

export const VideoPlayer = ({ channel, onBack }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const loadVideo = async () => {
      if (!videoRef.current || !channel.url) return;

      setIsLoading(true);
      setHasError(false);

      const video = videoRef.current;
      const streamUrl = channel.url;

      try {
        if (streamUrl.includes('.m3u8')) {
          // Dynamic import of HLS.js
          const Hls = (await import('hls.js')).default;

          if (Hls.isSupported()) {
            if (hlsRef.current) {
              hlsRef.current.destroy();
            }

            const hls = new Hls({
              enableWorker: true,
              lowLatencyMode: true,
              maxBufferLength: 30,
              maxMaxBufferLength: 60,
            });

            hlsRef.current = hls;
            hls.loadSource(streamUrl);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              setIsLoading(false);
              video.play().catch(() => setIsPlaying(false));
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
              if (data.fatal) {
                console.error('HLS Error:', data);
                setHasError(true);
                setIsLoading(false);
              }
            });
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // Native HLS support (Safari)
            video.src = streamUrl;
            video.addEventListener('loadedmetadata', () => {
              setIsLoading(false);
              video.play().catch(() => {});
            });
          }
        } else {
          // Direct video URL
          video.src = streamUrl;
          video.load();
        }

        video.addEventListener('play', () => setIsPlaying(true));
        video.addEventListener('pause', () => setIsPlaying(false));
        video.addEventListener('waiting', () => setIsLoading(true));
        video.addEventListener('canplay', () => setIsLoading(false));
        video.addEventListener('error', () => {
          setHasError(true);
          setIsLoading(false);
        });
      } catch (error) {
        console.error('Video load error:', error);
        setHasError(true);
        setIsLoading(false);
      }
    };

    loadVideo();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [channel]);

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(!isMuted);
  };

  const reloadStream = () => {
    if (!videoRef.current) return;
    setHasError(false);
    setIsLoading(true);
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    videoRef.current.load();
  };

  return (
    <>
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <Button
            onClick={onBack}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white border-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Channels
          </Button>
        </div>
      </header>

      {/* Video Player */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="relative w-full aspect-video bg-black">
            <video
              ref={videoRef}
              className="w-full h-full"
              controls
              playsInline
              crossOrigin="anonymous"
            />

            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                <div className="text-center space-y-3">
                  <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto" />
                  <p className="text-white font-semibold">Loading stream...</p>
                  <p className="text-slate-400 text-sm">Please wait</p>
                </div>
              </div>
            )}

            {hasError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/90">
                <div className="text-center space-y-4 p-6">
                  <AlertTriangle className="w-16 h-16 text-red-500 mx-auto" />
                  <div>
                    <p className="text-white font-semibold text-lg mb-2">Stream Error</p>
                    <p className="text-slate-400 text-sm mb-1">Cannot load this stream</p>
                    <p className="text-slate-500 text-xs">The stream may be offline or unavailable</p>
                  </div>
                  <Button
                    onClick={reloadStream}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Player Controls */}
          <div className="p-6 space-y-4 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">{channel.name}</h2>
              <p className="text-slate-400">{channel.country}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={togglePlayPause}
                disabled={hasError}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Play
                  </>
                )}
              </Button>

              <Button
                onClick={toggleMute}
                disabled={hasError}
                variant="outline"
                className="bg-slate-800 hover:bg-slate-700 text-white border-slate-700"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>

              <Button
                onClick={reloadStream}
                variant="outline"
                className="bg-slate-800 hover:bg-slate-700 text-white border-slate-700"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reload
              </Button>

              {channel.quality && (
                <div className="ml-auto flex items-center px-3 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-400 text-sm rounded-lg">
                  {channel.quality}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};