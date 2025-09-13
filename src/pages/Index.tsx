import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CategoryGrid } from '@/components/CategoryGrid';
import { ChannelGrid } from '@/components/ChannelGrid';
import { VideoPlayer } from '@/components/VideoPlayer';
import { iptvApi } from '@/services/iptvApi';
import { streamManager } from '@/services/streamManager';
import { Channel, Stream, Category, Logo } from '@/types/iptv';
import { Loader2, Tv, AlertCircle } from 'lucide-react';

type ViewState = 'categories' | 'channels' | 'player';

const Index = () => {
  const [currentView, setCurrentView] = useState<ViewState>('categories');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const { data: channels = [], isLoading: channelsLoading } = useQuery({
    queryKey: ['channels'],
    queryFn: iptvApi.getChannels,
  });

  const { data: streams = [], isLoading: streamsLoading } = useQuery({
    queryKey: ['streams'],
    queryFn: () => streamManager.getStreams().length > 0 ? streamManager.getStreams() : iptvApi.getStreams(),
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: iptvApi.getCategories,
  });

  const { data: logos = [], isLoading: logosLoading } = useQuery({
    queryKey: ['logos'],
    queryFn: iptvApi.getLogos,
  });

  const isLoading = channelsLoading || streamsLoading || categoriesLoading || logosLoading || isInitializing;

  // Initialize stream manager and preload streams
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await streamManager.initialize();
      } catch (error) {
        console.error('Failed to initialize stream manager:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeApp();

    // Cleanup on unmount
    return () => {
      streamManager.destroy();
    };
  }, []);

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setCurrentView('channels');
  };

  const handleChannelSelect = (channel: Channel, stream: Stream) => {
    setSelectedChannel(channel);
    setSelectedStream(stream);
    setCurrentView('player');
  };

  const handleBack = () => {
    if (currentView === 'player') {
      setCurrentView('channels');
    } else if (currentView === 'channels') {
      setCurrentView('categories');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading Ernest Garden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Tv className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Ernest Garden</h1>
              <p className="text-sm text-muted-foreground">Premium Streaming Platform</p>
            </div>
          </div>
        </div>
      </header>

      {/* Service Notice */}
      {currentView === 'categories' && (
        <div className="container mx-auto px-4 py-4">
          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-destructive text-base">
                <AlertCircle className="w-4 h-4" />
                Service Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground">
                Our streaming service aggregates content from various sources. Stream availability may vary 
                due to external factors beyond our control. We continuously work to ensure the best possible experience.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {currentView === 'categories' && (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-foreground">Browse Categories</h2>
              <p className="text-muted-foreground">Choose from our wide selection of entertainment</p>
            </div>
            <CategoryGrid 
              categories={categories} 
              onCategorySelect={handleCategorySelect}
            />
          </div>
        )}

        {currentView === 'channels' && selectedCategory && (
          <ChannelGrid
            channels={channels}
            streams={streams}
            logos={logos}
            category={selectedCategory.name}
            onChannelSelect={handleChannelSelect}
            onBack={handleBack}
          />
        )}

        {currentView === 'player' && selectedChannel && selectedStream && (
          <VideoPlayer
            channel={selectedChannel}
            stream={selectedStream}
            onBack={handleBack}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2024 Ernest Garden. Premium streaming experience.</p>
            <p className="mt-1">Stream availability subject to external source conditions.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;