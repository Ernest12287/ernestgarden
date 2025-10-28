import { Card, CardContent } from "@/components/ui/card";
import { Category } from "@/types/iptv";

interface CategoryGridProps {
  categories: Category[];
  onCategorySelect: (category: Category) => void;
}

const categoryIcons: Record<string, string> = {
  'news': '📰',
  'sports': '⚽',
  'movies': '🎬',
  'music': '🎵',
  'kids': '🧸',
  'entertainment': '🎭',
  'documentary': '📚',
  'lifestyle': '💡',
  'general': '📺',
};

export const CategoryGrid = ({ categories, onCategorySelect }: CategoryGridProps) => {
  const getIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    for (const [key, icon] of Object.entries(categoryIcons)) {
      if (lowerName.includes(key)) return icon;
    }
    return '📺';
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {categories.map((category) => (
        <Card 
          key={category.id} 
          className="cursor-pointer hover:bg-accent transition-all duration-300 group hover:scale-105 hover:shadow-lg hover:shadow-primary/10 border-border/50 hover:border-primary/50"
          onClick={() => onCategorySelect(category)}
        >
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/10 transition-all duration-300 group-hover:rotate-6">
              <span className="text-3xl">{getIcon(category.name)}</span>
            </div>
            <h3 className="font-semibold text-foreground capitalize group-hover:text-primary transition-colors">
              {category.name}
            </h3>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};