import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Channel, Stream, Logo } from "@/types/iptv";
import { ArrowLeft } from "lucide-react";

interface ChannelGridProps {
  channels: Channel[];
  streams: Stream[];
  logos: Logo[];
  category: string;
  onChannelSelect: (channel: Channel, stream: Stream) => void;
  onBack: () => void;
}

export const ChannelGrid = ({ 
  channels, 
  streams, 
  logos, 
  category, 
  onChannelSelect, 
  onBack 
}: ChannelGridProps) => {
  const filteredChannels = channels.filter(channel => 
    channel.categories.some(cat => cat.toLowerCase() === category.toLowerCase())
  );

  const getChannelLogo = (channelId: string) => {
    const logo = logos.find(l => l.id === channelId);
    return logo?.url;
  };

  const getChannelStream = (channelId: string) => {
    return streams.find(s => s.channel === channelId);
  };

  return (
    <div className="space-y-6">
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
        <h2 className="text-2xl font-bold capitalize">{category} Channels</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredChannels.map((channel) => {
          const stream = getChannelStream(channel.id);
          const logoUrl = getChannelLogo(channel.id);
          
          if (!stream) return null;

          return (
            <Card 
              key={channel.id} 
              className="cursor-pointer hover:bg-accent transition-all duration-200 group hover:scale-105"
              onClick={() => onChannelSelect(channel, stream)}
            >
              <CardContent className="p-4">
                <div className="aspect-video bg-muted rounded-lg mb-3 overflow-hidden">
                  {logoUrl ? (
                    <img 
                      src={logoUrl} 
                      alt={channel.name}
                      className="w-full h-full object-contain bg-white"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      📺
                    </div>
                  )}
                </div>
                <h3 className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">
                  {channel.name}
                </h3>
                <p className="text-xs text-muted-foreground truncate">{channel.country}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};