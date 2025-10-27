// src/services/iptvApi.ts
import { Channel, Stream, Category, Logo, Country } from '@/types/iptv';
import { streamManager } from './streamManager';

const BASE_URL = 'https://iptv-org.github.io/api';

export const iptvApi = {
  async getChannels(): Promise<Channel[]> {
    const channels = streamManager.getChannels();
    
    if (channels.length > 0) {
      return channels;
    }
    
    const response = await fetch(`${BASE_URL}/channels.json`);
    return response.json();
  },

  async getStreams(): Promise<Stream[]> {
    const streams = streamManager.getStreams();
    
    if (streams.length > 0) {
      return streams;
    }
    
    const response = await fetch(`${BASE_URL}/streams.json`);
    return response.json();
  },

  async getCategories(): Promise<Category[]> {
    const categories = streamManager.getCategories();
    
    if (categories.length > 0) {
      return categories;
    }
    
    const response = await fetch(`${BASE_URL}/categories.json`);
    return response.json();
  },

  async getLogos(): Promise<Logo[]> {
    const response = await fetch(`${BASE_URL}/logos.json`);
    return response.json();
  },

  async getCountries(): Promise<Country[]> {
    const response = await fetch(`${BASE_URL}/countries.json`);
    return response.json();
  },

  async getBlocklist(): Promise<string[]> {
    const response = await fetch(`${BASE_URL}/blocklist.json`);
    return response.json();
  }
};