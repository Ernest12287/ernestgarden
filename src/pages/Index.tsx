import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { CountryGrid } from '@/components/CountryGrid';
import { ChannelGrid } from '@/components/ChannelGrid';
import { VideoPlayer } from '@/components/VideoPlayer';
import { m3uParser } from '@/services/m3uParser';
import { Channel } from '@/types/iptv';

export interface Country {
  code: string;
  name: string;
  flag: string;
}

type ViewState = 'countries' | 'channels' | 'player';

const Index = () => {
  const [currentView, setCurrentView] = useState<ViewState>('countries');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCountrySelect = async (country: Country) => {
    setIsLoading(true);
    setSelectedCountry(country);
    
    try {
      const m3uEntries = await m3uParser.getAllStreamsFromCountry(country.code);
      const channelData = m3uEntries.map((entry, index) => {
        const channelId = entry.tvgId || `${country.code}-${index}`;
        return {
          id: channelId,
          name: entry.title,
          country: country.code.toUpperCase(),
          categories: entry.groupTitle ? [entry.groupTitle] : ['General'],
          languages: entry.tvgLanguage ? [entry.tvgLanguage] : [],
          logo: entry.tvgLogo,
          website: undefined,
          url: entry.url,
          quality: detectQuality(entry.title)
        };
      });
      
      setChannels(channelData);
      setCurrentView('channels');
    } catch (error) {
      console.error('Failed to load channels:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const detectQuality = (title: string): string | undefined => {
    const upper = title.toUpperCase();
    if (upper.includes('4K') || upper.includes('UHD')) return '4K';
    if (upper.includes('FHD') || upper.includes('1080P')) return '1080p';
    if (upper.includes('HD') || upper.includes('720P')) return '720p';
    if (upper.includes('SD')) return 'SD';
    return undefined;
  };

  const handleChannelSelect = (channel: Channel) => {
    setSelectedChannel(channel);
    setCurrentView('player');
  };

  const handleBack = () => {
    if (currentView === 'player') {
      setCurrentView('channels');
      setSelectedChannel(null);
    } else if (currentView === 'channels') {
      setCurrentView('countries');
      setChannels([]);
      setSelectedCountry(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-500" />
          <p className="text-white font-semibold">Loading Channels...</p>
          <p className="text-slate-400 text-sm">This may take a moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {currentView === 'countries' && (
        <CountryGrid onCountrySelect={handleCountrySelect} />
      )}

      {currentView === 'channels' && selectedCountry && (
        <ChannelGrid
          country={selectedCountry}
          channels={channels}
          onChannelSelect={handleChannelSelect}
          onBack={handleBack}
        />
      )}

      {currentView === 'player' && selectedChannel && (
        <VideoPlayer
          channel={selectedChannel}
          onBack={handleBack}
        />
      )}
    </div>
  );
};

export default Index;