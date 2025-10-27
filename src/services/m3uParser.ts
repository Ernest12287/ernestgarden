// src/services/m3uParser.ts
import { Channel, Stream, Category } from '@/types/iptv';

interface M3UInfo {
  tvgId?: string;
  tvgName?: string;
  tvgLogo?: string;
  groupTitle?: string;
  tvgCountry?: string;
  tvgLanguage?: string;
  title: string;
  url: string;
}

export class M3UParser {
  private readonly GITHUB_USER = 'Ernest12287';
  private readonly GITHUB_REPO = 'iptv';
  private readonly GITHUB_BRANCH = 'master';
  private readonly BASE_URL = `https://raw.githubusercontent.com/${this.GITHUB_USER}/${this.GITHUB_REPO}/${this.GITHUB_BRANCH}/streams`;

  private readonly COUNTRIES = [
    'at', 'de', 'ch', 'us', 'uk', 'ca', 'au', 'fr', 'es', 'it', 
    'nl', 'be', 'se', 'no', 'dk', 'fi', 'pl', 'cz', 'hu', 'ro',
    'bg', 'gr', 'tr', 'ru', 'ua', 'br', 'mx', 'ar', 'cl', 'pe',
    'jp', 'kr', 'cn', 'in', 'id', 'th', 'vn', 'ph', 'my', 'sg',
    'za', 'eg', 'ma', 'ng', 'ke', 'il', 'ae', 'sa', 'qa', 'kw'
  ];

  async parseM3U(url: string): Promise<M3UInfo[]> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch M3U: ${response.status}`);
      }
      
      const text = await response.text();
      return this.parseM3UContent(text);
    } catch (error) {
      console.error('Error parsing M3U:', error);
      return [];
    }
  }

  private parseM3UContent(content: string): M3UInfo[] {
    const lines = content.split('\n').map(line => line.trim());
    const entries: M3UInfo[] = [];
    
    let currentInfo: Partial<M3UInfo> = {};
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (!line || (line.startsWith('#') && !line.startsWith('#EXTINF'))) {
        continue;
      }
      
      if (line.startsWith('#EXTINF')) {
        const tvgIdMatch = line.match(/tvg-id="([^"]*)"/);
        const tvgNameMatch = line.match(/tvg-name="([^"]*)"/);
        const tvgLogoMatch = line.match(/tvg-logo="([^"]*)"/);
        const groupTitleMatch = line.match(/group-title="([^"]*)"/);
        const tvgCountryMatch = line.match(/tvg-country="([^"]*)"/);
        const tvgLanguageMatch = line.match(/tvg-language="([^"]*)"/);
        const titleMatch = line.match(/,(.+)$/);
        
        currentInfo = {
          tvgId: tvgIdMatch?.[1],
          tvgName: tvgNameMatch?.[1],
          tvgLogo: tvgLogoMatch?.[1],
          groupTitle: groupTitleMatch?.[1],
          tvgCountry: tvgCountryMatch?.[1],
          tvgLanguage: tvgLanguageMatch?.[1],
          title: titleMatch?.[1] || 'Unknown Channel'
        };
      } else if (line.startsWith('http')) {
        if (currentInfo.title) {
          entries.push({
            ...currentInfo,
            url: line
          } as M3UInfo);
        }
        currentInfo = {};
      }
    }
    
    return entries;
  }

  async getAllStreamsFromCountry(countryCode: string): Promise<M3UInfo[]> {
    const url = `${this.BASE_URL}/${countryCode.toLowerCase()}.m3u`;
    console.log(`📡 Fetching ${countryCode.toUpperCase()} streams from:`, url);
    return this.parseM3U(url);
  }

  async getAllStreams(maxCountries: number = 10): Promise<M3UInfo[]> {
    console.log(`🌍 Loading streams from ${maxCountries} countries...`);
    
    const promises = this.COUNTRIES.slice(0, maxCountries).map(country =>
      this.getAllStreamsFromCountry(country).catch(err => {
        console.warn(`⚠️ Failed to load ${country}:`, err.message);
        return [];
      })
    );
    
    const results = await Promise.all(promises);
    const allStreams = results.flat();
    
    console.log(`✅ Loaded ${allStreams.length} total streams from ${maxCountries} countries`);
    return allStreams;
  }

  convertToChannels(m3uInfos: M3UInfo[]): Channel[] {
    const channelMap = new Map<string, Channel>();
    
    m3uInfos.forEach(info => {
      const channelId = info.tvgId || info.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
      
      if (!channelMap.has(channelId)) {
        channelMap.set(channelId, {
          id: channelId,
          name: info.title,
          country: info.tvgCountry || 'Unknown',
          categories: info.groupTitle ? [info.groupTitle] : ['General'],
          languages: info.tvgLanguage ? [info.tvgLanguage] : [],
          logo: info.tvgLogo,
          website: undefined
        });
      }
    });
    
    return Array.from(channelMap.values());
  }

  convertToStreams(m3uInfos: M3UInfo[]): Stream[] {
    return m3uInfos.map(info => ({
      channel: info.tvgId || info.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase(),
      url: info.url,
      title: info.title,
      http_referrer: undefined,
      user_agent: undefined,
      quality: this.detectQuality(info.title),
      timeshift: undefined
    }));
  }

  convertToCategories(m3uInfos: M3UInfo[]): Category[] {
    const categorySet = new Set<string>();
    
    m3uInfos.forEach(info => {
      if (info.groupTitle) {
        categorySet.add(info.groupTitle);
      }
    });
    
    return Array.from(categorySet).map(name => ({
      id: name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase(),
      name
    }));
  }

  private detectQuality(title: string): string | undefined {
    const upper = title.toUpperCase();
    if (upper.includes('4K') || upper.includes('UHD')) return '4K';
    if (upper.includes('FHD') || upper.includes('1080P')) return '1080p';
    if (upper.includes('HD') || upper.includes('720P')) return '720p';
    if (upper.includes('SD')) return 'SD';
    return undefined;
  }

  getAvailableCountries(): string[] {
    return this.COUNTRIES;
  }
}

export const m3uParser = new M3UParser();