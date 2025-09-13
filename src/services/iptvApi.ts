import { Channel, Stream, Category, Logo, Country } from '@/types/iptv';

const BASE_URL = 'https://iptv-org.github.io/api';

export const iptvApi = {
  async getChannels(): Promise<Channel[]> {
    const response = await fetch(`${BASE_URL}/channels.json`);
    return response.json();
  },

  async getStreams(): Promise<Stream[]> {
    const response = await fetch(`${BASE_URL}/streams.json`);
    return response.json();
  },

  async getCategories(): Promise<Category[]> {
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