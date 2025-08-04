import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (query: string, filters?: SearchFilters) => void;
  showFilters?: boolean;
  categories?: Array<{id: string; name: string}>;
}

interface SearchFilters {
  categories?: string[];
  pricing?: string[];
  ratings?: number;
}

export default function SearchBar({ 
  placeholder = "Search...", 
  value = "",
  onChange,
  onSearch,
  showFilters = true,
  categories = []
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState(value);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchQuery, filters);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearFilters = () => {
    setFilters({});
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.categories?.length) count += filters.categories.length;
    if (filters.pricing?.length) count += filters.pricing.length;
    if (filters.ratings) count += 1;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            className="pl-10 pr-4 h-12 text-base"
          />
        </div>
        
        {showFilters && (
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="lg" className="relative">
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Filters</h4>
                  {activeFilterCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearFilters}
                      className="h-auto p-1 text-xs"
                    >
                      Clear all
                    </Button>
                  )}
                </div>

                {/* Categories */}
                <div>
                  <h5 className="text-sm font-medium mb-2">Categories</h5>
                  <div className="space-y-2">
                    {categories.slice(0, 8).map((category) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={category.id}
                          checked={filters.categories?.includes(category.name) || false}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFilters(prev => ({
                                ...prev,
                                categories: [...(prev.categories || []), category.name]
                              }));
                            } else {
                              setFilters(prev => ({
                                ...prev,
                                categories: prev.categories?.filter(c => c !== category.name)
                              }));
                            }
                          }}
                        />
                        <label htmlFor={category.id} className="text-sm">
                          {category.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pricing */}
                <div>
                  <h5 className="text-sm font-medium mb-2">Pricing</h5>
                  <div className="space-y-2">
                    {['Free', 'Freemium', 'Free Trial', 'Paid'].map((pricing) => (
                      <div key={pricing} className="flex items-center space-x-2">
                        <Checkbox
                          id={pricing}
                          checked={filters.pricing?.includes(pricing) || false}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFilters(prev => ({
                                ...prev,
                                pricing: [...(prev.pricing || []), pricing]
                              }));
                            } else {
                              setFilters(prev => ({
                                ...prev,
                                pricing: prev.pricing?.filter(p => p !== pricing)
                              }));
                            }
                          }}
                        />
                        <label htmlFor={pricing} className="text-sm">
                          {pricing}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <h5 className="text-sm font-medium mb-2">Minimum Rating</h5>
                  <div className="space-y-2">
                    {[4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center space-x-2">
                        <Checkbox
                          id={`rating-${rating}`}
                          checked={filters.ratings === rating}
                          onCheckedChange={(checked) => {
                            setFilters(prev => ({
                              ...prev,
                              ratings: checked ? rating : undefined
                            }));
                          }}
                        />
                        <label htmlFor={`rating-${rating}`} className="text-sm flex items-center">
                          {rating}+ ⭐
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setIsFilterOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      handleSearch();
                      setIsFilterOpen(false);
                    }}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}

        <Button onClick={handleSearch} size="lg" className="px-6">
          Search
        </Button>
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex gap-2 mt-3 flex-wrap">
          {filters.categories?.map((category) => (
            <Badge key={category} variant="secondary" className="flex items-center gap-1">
              {category}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => {
                  setFilters(prev => ({
                    ...prev,
                    categories: prev.categories?.filter(c => c !== category)
                  }));
                }}
              />
            </Badge>
          ))}
          {filters.pricing?.map((pricing) => (
            <Badge key={pricing} variant="secondary" className="flex items-center gap-1">
              {pricing}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => {
                  setFilters(prev => ({
                    ...prev,
                    pricing: prev.pricing?.filter(p => p !== pricing)
                  }));
                }}
              />
            </Badge>
          ))}
          {filters.ratings && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {filters.ratings}+ ⭐
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => {
                  setFilters(prev => ({
                    ...prev,
                    ratings: undefined
                  }));
                }}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
