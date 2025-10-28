// src/types/iptv.ts

export interface Channel {
  id: string;
  name: string;
  country: string;
  categories: string[];
  languages: string[];
  logo?: string;
  website?: string;
  url?: string; // Added for direct channel URL
  quality?: string; // Added for quality detection
}

export interface Stream {
  channel: string;
  url: string;
  title?: string;
  http_referrer?: string;
  user_agent?: string;
  quality?: string;
  timeshift?: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Logo {
  id: string;
  url: string;
}

export interface Country {
  code: string;
  name: string;
}