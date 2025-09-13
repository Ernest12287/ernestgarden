import { Card, CardContent } from "@/components/ui/card";
import { Category } from "@/types/iptv";

interface CategoryGridProps {
  categories: Category[];
  onCategorySelect: (category: Category) => void;
}

export const CategoryGrid = ({ categories, onCategorySelect }: CategoryGridProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {categories.map((category) => (
        <Card 
          key={category.id} 
          className="cursor-pointer hover:bg-accent transition-colors group"
          onClick={() => onCategorySelect(category)}
        >
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-primary/20 rounded-full flex items-center justify-center group-hover:bg-primary/30 transition-colors">
              <span className="text-2xl text-primary">📺</span>
            </div>
            <h3 className="font-semibold text-foreground capitalize">{category.name}</h3>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};