import { useState } from 'react';
import { ArrowLeft, Search, Tv } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Channel } from '@/types/iptv';

interface Country {
  code: string;
  name: string;
  flag: string;
}

interface ChannelGridProps {
  country: Country;
  channels: Channel[];
  onChannelSelect: (channel: Channel) => void;
  onBack: () => void;
}

export const ChannelGrid = ({ country, channels, onChannelSelect, onBack }: ChannelGridProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={onBack}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white border-slate-700"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div className="flex items-center gap-3">
                <span className="text-4xl">{country.flag}</span>
                <div>
                  <h2 className="text-xl font-bold text-white">{country.name}</h2>
                  <p className="text-sm text-slate-400">{channels.length} channels available</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search channels..."
            className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Channel Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        {filteredChannels.length === 0 ? (
          <div className="text-center py-20">
            <Tv className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">
              {searchTerm ? 'No channels found matching your search' : 'No channels available'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredChannels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => onChannelSelect(channel)}
                className="group bg-slate-800 hover:bg-gradient-to-br hover:from-blue-600 hover:to-purple-600 border border-slate-700 hover:border-transparent rounded-xl p-4 transition-all duration-300 hover:scale-105 hover:shadow-xl text-left"
              >
                <div className="aspect-video bg-slate-900 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                  {channel.logo ? (
                    <img
                      src={channel.logo}
                      alt={channel.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <Tv className="w-8 h-8 text-slate-600" />
                  )}
                </div>
                <h3 className="font-medium text-sm text-white truncate group-hover:text-white">
                  {channel.name}
                </h3>
                {channel.quality && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">
                    {channel.quality}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </main>
    </>
  );
};