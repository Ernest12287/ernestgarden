import { useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Channel, Stream } from '@/types/iptv';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import * as THREE from 'three';

interface VideoPlayerProps {
  channel: Channel;
  stream: Stream;
  onBack: () => void;
}

export const VideoPlayer = ({ channel, stream, onBack }: VideoPlayerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!containerRef.current || !videoRef.current) return;

    // Initialize Three.js scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setClearColor(0x000000);
    containerRef.current.appendChild(renderer.domElement);

    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;

    // Create video texture
    const video = videoRef.current;
    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    // Create plane geometry for video
    const geometry = new THREE.PlaneGeometry(16, 9);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const plane = new THREE.Mesh(geometry, material);
    
    scene.add(plane);
    camera.position.z = 10;

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;
      
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, []);

  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    video.src = stream.url;
    
    // Set custom headers if provided
    if (stream.http_referrer) {
      video.setAttribute('referrer', stream.http_referrer);
    }
    
    if (stream.user_agent) {
      video.setAttribute('user-agent', stream.user_agent);
    }

    video.load();
  }, [stream]);

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

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Service Notice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Stream links may occasionally become unavailable due to technical issues or network changes. 
            We cannot control external streaming sources and their availability.
          </p>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div 
            ref={containerRef} 
            className="relative w-full aspect-video bg-black"
          >
            <video
              ref={videoRef}
              className="hidden"
              controls={false}
              autoPlay
              muted
              playsInline
              crossOrigin="anonymous"
            />
          </div>
          
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{channel.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {channel.categories.join(', ')} • {channel.country}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Quality: {stream.quality || 'Auto'}</p>
                {channel.languages && (
                  <p className="text-xs text-muted-foreground">
                    {channel.languages.join(', ')}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={() => {
                  if (videoRef.current) {
                    if (videoRef.current.paused) {
                      videoRef.current.play();
                    } else {
                      videoRef.current.pause();
                    }
                  }
                }}
              >
                Play/Pause
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.load();
                  }
                }}
              >
                Reload Stream
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};