// src/services/streamManager.ts
import { Stream, Channel, Category } from '@/types/iptv';
import { m3uParser } from './m3uParser';

interface StreamCache {
  streams: Stream[];
  channels: Channel[];
  categories: Category[];
  lastUpdated: number;
  validatedStreams: Map<string, boolean>;
  streamHealth: Map<string, number>;
}

class StreamManager {
  private cache: StreamCache = {
    streams: [],
    channels: [],
    categories: [],
    lastUpdated: 0,
    validatedStreams: new Map(),
    streamHealth: new Map()
  };

  private readonly CACHE_DURATION = 30 * 60 * 1000;
  private refreshInterval: NodeJS.Timeout | null = null;
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) {
      console.log('⚡ Stream Manager already initialized');
      return;
    }

    console.log('🚀 Initializing Ernest Garden TV with Ernest12287/iptv...');
    await this.refreshStreams();
    this.startAutoRefresh();
    this.isInitialized = true;
  }

  private async refreshStreams() {
    try {
      console.log('📡 Fetching streams from your GitHub fork...');
      
      const m3uEntries = await m3uParser.getAllStreams(10);
      
      if (m3uEntries.length === 0) {
        console.warn('⚠️ No streams loaded from fork');
        return;
      }

      const channels = m3uParser.convertToChannels(m3uEntries);
      const streams = m3uParser.convertToStreams(m3uEntries);
      const categories = m3uParser.convertToCategories(m3uEntries);

      const workingStreams = streams.filter(stream => {
        if (!stream.url) return false;
        
        const url = stream.url.toLowerCase();
        
        if (url.includes('localhost') || url.includes('127.0.0.1')) return false;
        if (!url.startsWith('https://') && !url.startsWith('http://')) return false;
        if (url.includes('pluto.tv')) return false;
        
        return true;
      });

      this.cache.streams = workingStreams;
      this.cache.channels = channels;
      this.cache.categories = categories;
      this.cache.lastUpdated = Date.now();
      
      console.log(`✅ Ernest Garden TV loaded successfully:`);
      console.log(`   📺 ${channels.length} channels`);
      console.log(`   🎬 ${workingStreams.length} streams`);
      console.log(`   📁 ${categories.length} categories`);
      
    } catch (error) {
      console.error('❌ Failed to load streams:', error);
    }
  }

  private startAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    
    this.refreshInterval = setInterval(() => {
      console.log('🔄 Auto-refreshing streams...');
      this.refreshStreams();
    }, this.CACHE_DURATION);
  }

  getStreams(): Stream[] {
    return this.cache.streams;
  }

  getChannels(): Channel[] {
    return this.cache.channels;
  }

  getCategories(): Category[] {
    return this.cache.categories;
  }

  getProxiedUrl(url: string): string {
    return url;
  }

  getBestStreamForChannel(channelId: string): Stream | undefined {
    const channelStreams = this.cache.streams.filter(s => s.channel === channelId);
    
    if (channelStreams.length === 0) return undefined;
    
    return channelStreams.sort((a, b) => {
      const healthA = this.cache.streamHealth.get(a.url) || 50;
      const healthB = this.cache.streamHealth.get(b.url) || 50;
      
      const aIsHLS = a.url.includes('.m3u8') ? 10 : 0;
      const bIsHLS = b.url.includes('.m3u8') ? 10 : 0;
      
      return (healthB + bIsHLS) - (healthA + aIsHLS);
    })[0];
  }

  async validateStream(url: string): Promise<boolean> {
    if (this.cache.validatedStreams.has(url)) {
      return this.cache.validatedStreams.get(url)!;
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-cache'
      });
      
      clearTimeout(timeout);
      
      const isValid = response.ok;
      this.cache.validatedStreams.set(url, isValid);
      this.cache.streamHealth.set(url, isValid ? 100 : 0);
      
      return isValid;
    } catch (error) {
      this.cache.validatedStreams.set(url, false);
      this.cache.streamHealth.set(url, 0);
      return false;
    }
  }

  getStreamWarning(url: string): string | null {
    const health = this.cache.streamHealth.get(url);
    
    if (health !== undefined && health < 30) {
      return "⚠️ This stream may have connection issues";
    }
    
    return null;
  }

  isStreamValidated(url: string): boolean {
    return this.cache.validatedStreams.get(url) === true;
  }

  async loadMoreCountries(additionalCount: number = 10) {
    console.log(`📡 Loading ${additionalCount} more countries...`);
    await this.refreshStreams();
  }

  destroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
    this.isInitialized = false;
  }
}

export const streamManager = new StreamManager();