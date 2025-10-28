import { useState } from 'react';
import { Tv, Globe, ChevronDown } from 'lucide-react';

export interface Country {
  code: string;
  name: string;
  flag: string;
}

interface CountryGridProps {
  onCountrySelect: (country: Country) => void;
}

const COUNTRIES: Country[] = [
  { code: 'us', name: 'United States', flag: '🇺🇸' },
  { code: 'uk', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'ca', name: 'Canada', flag: '🇨🇦' },
  { code: 'de', name: 'Germany', flag: '🇩🇪' },
  { code: 'fr', name: 'France', flag: '🇫🇷' },
  { code: 'es', name: 'Spain', flag: '🇪🇸' },
  { code: 'it', name: 'Italy', flag: '🇮🇹' },
  { code: 'nl', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'au', name: 'Australia', flag: '🇦🇺' },
  { code: 'br', name: 'Brazil', flag: '🇧🇷' },
  { code: 'mx', name: 'Mexico', flag: '🇲🇽' },
  { code: 'jp', name: 'Japan', flag: '🇯🇵' },
  { code: 'kr', name: 'South Korea', flag: '🇰🇷' },
  { code: 'in', name: 'India', flag: '🇮🇳' },
  { code: 'ae', name: 'UAE', flag: '🇦🇪' },
  { code: 'tr', name: 'Turkey', flag: '🇹🇷' },
  { code: 'ru', name: 'Russia', flag: '🇷🇺' },
  { code: 'pl', name: 'Poland', flag: '🇵🇱' },
  { code: 'se', name: 'Sweden', flag: '🇸🇪' },
  { code: 'no', name: 'Norway', flag: '🇳🇴' },
  { code: 'dk', name: 'Denmark', flag: '🇩🇰' },
  { code: 'fi', name: 'Finland', flag: '🇫🇮' },
  { code: 'at', name: 'Austria', flag: '🇦🇹' },
  { code: 'ch', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'be', name: 'Belgium', flag: '🇧🇪' },
  { code: 'pt', name: 'Portugal', flag: '🇵🇹' },
  { code: 'gr', name: 'Greece', flag: '🇬🇷' },
  { code: 'cz', name: 'Czech Republic', flag: '🇨🇿' },
  { code: 'hu', name: 'Hungary', flag: '🇭🇺' },
  { code: 'ro', name: 'Romania', flag: '🇷🇴' },
  { code: 'bg', name: 'Bulgaria', flag: '🇧🇬' },
  { code: 'ar', name: 'Argentina', flag: '🇦🇷' },
  { code: 'cl', name: 'Chile', flag: '🇨🇱' },
  { code: 'pe', name: 'Peru', flag: '🇵🇪' },
  { code: 'co', name: 'Colombia', flag: '🇨🇴' },
  { code: 'za', name: 'South Africa', flag: '🇿🇦' },
  { code: 'eg', name: 'Egypt', flag: '🇪🇬' },
  { code: 'sa', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'il', name: 'Israel', flag: '🇮🇱' },
  { code: 'th', name: 'Thailand', flag: '🇹🇭' },
  { code: 'id', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'ph', name: 'Philippines', flag: '🇵🇭' },
  { code: 'vn', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'my', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'sg', name: 'Singapore', flag: '🇸🇬' },
  { code: 'nz', name: 'New Zealand', flag: '🇳🇿' },
  { code: 'pk', name: 'Pakistan', flag: '🇵🇰' },
  { code: 'bd', name: 'Bangladesh', flag: '🇧🇩' },
  { code: 'ua', name: 'Ukraine', flag: '🇺🇦' },
  { code: 'ke', name: 'Kenya', flag: '🇰🇪' }
];

export const CountryGrid = ({ onCountrySelect }: CountryGridProps) => {
  const [showAll, setShowAll] = useState(false);
  const displayedCountries = showAll ? COUNTRIES : COUNTRIES.slice(0, 12);

  return (
    <>
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Tv className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Ernest Garden TV</h1>
              <p className="text-sm text-slate-400">Global IPTV Streaming</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm mb-4">
            <Globe className="w-4 h-4" />
            <span>{COUNTRIES.length} Countries Available</span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Choose Your Region</h2>
          <p className="text-slate-400 text-lg">Select a country to browse live TV channels</p>
        </div>

        {/* Country Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          {displayedCountries.map((country) => (
            <button
              key={country.code}
              onClick={() => onCountrySelect(country)}
              className="group relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 hover:from-blue-600 hover:to-purple-600 border border-slate-700 hover:border-transparent rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20"
            >
              <div className="text-center space-y-3">
                <div className="text-5xl group-hover:scale-110 transition-transform duration-300">
                  {country.flag}
                </div>
                <div>
                  <p className="font-semibold text-white group-hover:text-white transition-colors">
                    {country.name}
                  </p>
                  <p className="text-xs text-slate-400 group-hover:text-blue-100 mt-1">
                    {country.code.toUpperCase()}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Show More Button */}
        {!showAll && (
          <div className="text-center">
            <button
              onClick={() => setShowAll(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors"
            >
              <ChevronDown className="w-5 h-5" />
              Show All {COUNTRIES.length} Countries
            </button>
          </div>
        )}
      </main>
    </>
  );
};