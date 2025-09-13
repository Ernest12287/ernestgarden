export interface Channel {
  id: string;
  name: string;
  country: string;
  categories: string[];
  languages: string[];
  logo?: string;
  website?: string;
}

export interface Stream {
  channel: string;
  url: string;
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
  width?: number;
  height?: number;
}

export interface Country {
  code: string;
  name: string;
  languages: string[];
}