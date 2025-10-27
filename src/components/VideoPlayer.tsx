// src/components/VideoPlayer.tsx - Improved version with HLS.js
import { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Channel, Stream } from '@/types/iptv';
import { ArrowLeft, AlertTriangle, Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { streamManager } from '@/services/streamManager';

interface VideoPlayerProps {
  channel: Channel;
  stream: Stream;
  onBack: () => void;
}

export const VideoPlayer = ({ channel, stream, onBack }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [streamWarning, setStreamWarning] = useState<string | null>(null);

  useEffect(() => {
    const loadVideo = async () => {
      if (!videoRef.current || !stream.url) return;

      setIsLoading(true);
      setHasError(false);
      setErrorMessage('');

      const video = videoRef.current;
      const streamUrl = streamManager.getProxiedUrl(stream.url);
      
      // Check for stream warnings
      const warning = streamManager.getStreamWarning(stream.url);
      setStreamWarning(warning);

      try {
        // Check if HLS stream
        if (streamUrl.includes('.m3u8')) {
          // Dynamically import HLS.js only when needed
          const Hls = (await import('hls.js')).default;
          
          if (Hls.isSupported()) {
            // Destroy previous HLS instance
            if (hlsRef.current) {
              hlsRef.current.destroy();
            }

            const hls = new Hls({
              enableWorker: true,
              lowLatencyMode: true,
              backBufferLength: 90,
              maxBufferLength: 30,
              maxMaxBufferLength: 600,
            });

            hlsRef.current = hls;

            hls.loadSource(streamUrl);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              console.log('✅ HLS manifest loaded');
              setIsLoading(false);
              video.play().catch(e => {
                console.log('Autoplay prevented:', e);
                setIsPlaying(false);
              });
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
              console.error('❌ HLS error:', data);
              
              if (data.fatal) {
                setHasError(true);
                setIsLoading(false);
                
                switch (data.type) {
                  case Hls.ErrorTypes.NETWORK_ERROR:
                    setErrorMessage('Network error - Stream may be unavailable');
                    hls.startLoad();
                    break;
                  case Hls.ErrorTypes.MEDIA_ERROR:
                    setErrorMessage('Media error - Trying to recover...');
                    hls.recoverMediaError();
                    break;
                  default:
                    setErrorMessage('Fatal error - Cannot play this stream');
                    break;
                }
              }
            });

          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // Native HLS support (Safari)
            video.src = streamUrl;
            video.addEventListener('loadedmetadata', () => {
              setIsLoading(false);
              video.play().catch(e => console.log('Autoplay prevented:', e));
            });
          } else {
            setHasError(true);
            setErrorMessage('HLS not supported in this browser');
            setIsLoading(false);
          }
        } else {
          // Regular video stream
          video.src = streamUrl;
          video.load();
        }

        // Video event listeners
        video.addEventListener('play', () => setIsPlaying(true));
        video.addEventListener('pause', () => setIsPlaying(false));
        video.addEventListener('waiting', () => setIsLoading(true));
        video.addEventListener('canplay', () => setIsLoading(false));
        video.addEventListener('error', (e) => {
          console.error('Video error:', e);
          setHasError(true);
          setIsLoading(false);
          setErrorMessage('Failed to load stream - Source may be offline');
        });

      } catch (error) {
        console.error('Failed to load stream:', error);
        setHasError(true);
        setIsLoading(false);
        setErrorMessage('Failed to initialize player');
      }
    };

    loadVideo();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [stream]);

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
    
    // Trigger reload
    videoRef.current.load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{channel.name}</h2>
            <p className="text-muted-foreground">{channel.country}</p>
          </div>
        </div>
      </div>

      {streamWarning && (
        <Card className="bg-destructive/10 border-destructive/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertTriangle className="w-4 h-4" />
              {streamWarning}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="relative w-full aspect-video bg-black">
            <video
              ref={videoRef}
              className="w-full h-full"
              controls
              playsInline
              crossOrigin="anonymous"
            />
            
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-white text-center">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p>Loading stream...</p>
                </div>
              </div>
            )}
            
            {hasError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                <div className="text-white text-center space-y-3 p-6">
                  <AlertTriangle className="w-12 h-12 mx-auto text-destructive" />
                  <p className="font-semibold">Stream Error</p>
                  <p className="text-sm">{errorMessage}</p>
                  <Button variant="secondary" size="sm" onClick={reloadStream}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{channel.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {channel.categories.join(', ')} • {channel.country}
                </p>
              </div>
              <div className="flex gap-2">
                {streamManager.isStreamValidated(stream.url) && (
                  <Badge variant="secondary">Verified</Badge>
                )}
                {stream.quality && (
                  <Badge variant="outline">{stream.quality}</Badge>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={togglePlayPause}
                disabled={hasError}
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
                variant="outline" 
                size="sm"
                onClick={toggleMute}
                disabled={hasError}
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={reloadStream}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reload
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};