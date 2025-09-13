import { Stream } from '@/types/iptv';

interface StreamCache {
  streams: Stream[];
  lastUpdated: number;
  validatedStreams: Set<string>;
  invalidStreams: Set<string>;
}

class StreamManager {
  private cache: StreamCache = {
    streams: [],
    lastUpdated: 0,
    validatedStreams: new Set(),
    invalidStreams: new Set()
  };

  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
  private refreshInterval: NodeJS.Timeout | null = null;

  async initialize() {
    await this.refreshStreams();
    await this.preloadRandomStreams(10);
    this.startAutoRefresh();
  }

  private async refreshStreams() {
    try {
      console.log('Fetching streams...');
      const response = await fetch('https://iptv-org.github.io/api/streams.json');
      const newStreams: Stream[] = await response.json();
      
      const previousUrls = new Set(this.cache.streams.map(s => s.url));
      const newUrls = new Set(newStreams.map(s => s.url));
      
      // Mark streams that disappeared as potentially invalid
      previousUrls.forEach(url => {
        if (!newUrls.has(url)) {
          this.cache.invalidStreams.add(url);
          this.cache.validatedStreams.delete(url);
        }
      });

      this.cache.streams = newStreams;
      this.cache.lastUpdated = Date.now();
      
      console.log(`Updated ${newStreams.length} streams`);
    } catch (error) {
      console.error('Failed to refresh streams:', error);
    }
  }

  private async preloadRandomStreams(count: number) {
    const availableStreams = this.cache.streams.filter(s => 
      s.url && !this.cache.invalidStreams.has(s.url)
    );
    
    const randomStreams = availableStreams
      .sort(() => Math.random() - 0.5)
      .slice(0, count);

    console.log(`Testing ${randomStreams.length} random streams...`);
    
    const testPromises = randomStreams.map(stream => this.testStream(stream.url));
    await Promise.allSettled(testPromises);
  }

  private async testStream(url: string): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        mode: 'no-cors' // Some streams don't allow CORS
      });
      
      clearTimeout(timeout);
      
      if (response.ok || response.type === 'opaque') {
        this.cache.validatedStreams.add(url);
        return true;
      } else {
        this.cache.invalidStreams.add(url);
        return false;
      }
    } catch (error) {
      this.cache.invalidStreams.add(url);
      return false;
    }
  }

  private startAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    
    this.refreshInterval = setInterval(() => {
      this.refreshStreams();
    }, this.CACHE_DURATION);
  }

  getStreams(): Stream[] {
    return this.cache.streams;
  }

  getStreamWarning(url: string): string | null {
    if (this.cache.invalidStreams.has(url)) {
      return "This link was not found in previous request and might not work";
    }
    return null;
  }

  isStreamValidated(url: string): boolean {
    return this.cache.validatedStreams.has(url);
  }

  async validateStream(url: string): Promise<boolean> {
    if (this.cache.validatedStreams.has(url)) return true;
    if (this.cache.invalidStreams.has(url)) return false;
    
    return await this.testStream(url);
  }

  destroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }
}

export const streamManager = new StreamManager();