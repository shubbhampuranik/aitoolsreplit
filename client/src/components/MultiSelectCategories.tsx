import { useState, useEffect, useRef } from 'react';
import { Combobox } from '@headlessui/react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  slug: string;
  toolCount: number;
}

interface MultiSelectCategoriesProps {
  categories: Category[];
  selectedCategories: Category[];
  onSelectionChange: (categories: Category[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelectCategories({
  categories,
  selectedCategories,
  onSelectionChange,
  placeholder = "Select categories...",
  className
}: MultiSelectCategoriesProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  // Handle clicks outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-headlessui-combobox]')) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const filteredCategories = query === ''
    ? categories.filter(cat => !selectedCategories.find(selected => selected.id === cat.id))
    : categories.filter(cat => {
        const isAlreadySelected = selectedCategories.find(selected => selected.id === cat.id);
        const matchesQuery = cat.name.toLowerCase().includes(query.toLowerCase()) ||
                           cat.description?.toLowerCase().includes(query.toLowerCase());
        return !isAlreadySelected && matchesQuery;
      });

  const handleSelect = (category: Category) => {
    if (!selectedCategories.find(selected => selected.id === category.id)) {
      onSelectionChange([...selectedCategories, category]);
    }
    setQuery('');
  };

  const handleRemove = (categoryId: string) => {
    onSelectionChange(selectedCategories.filter(cat => cat.id !== categoryId));
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Combobox as="div" value={selectedCategories} onChange={handleSelect}>
        <div className="relative">
          <Combobox.Input
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            displayValue={() => query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder={selectedCategories.length > 0 ? "Add more categories..." : placeholder}
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronsUpDown
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
          </Combobox.Button>
        </div>

        <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-background border border-input py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          {filteredCategories.length === 0 && query !== '' ? (
            <div className="relative cursor-default select-none py-2 px-4 text-muted-foreground">
              No categories found.
            </div>
          ) : (
            filteredCategories.map((category) => (
              <Combobox.Option
                key={category.id}
                className={({ active }) =>
                  cn(
                    'relative cursor-pointer select-none py-2 pl-10 pr-4',
                    active ? 'bg-accent text-accent-foreground' : 'text-foreground'
                  )
                }
                value={category}
              >
                {({ selected, active }) => (
                  <>
                    <span className={cn('block truncate', selected ? 'font-medium' : 'font-normal')}>
                      {category.name}
                    </span>
                    {category.description && (
                      <span className="block text-xs text-muted-foreground mt-1">
                        {category.description}
                      </span>
                    )}
                    {selected ? (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-accent-foreground">
                        <Check className="h-4 w-4" aria-hidden="true" />
                      </span>
                    ) : null}
                  </>
                )}
              </Combobox.Option>
            ))
          )}
        </Combobox.Options>
      </Combobox>

      {/* Selected Categories */}
      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCategories.map((category) => (
            <Badge
              key={category.id}
              variant="secondary"
              className="flex items-center gap-1 pr-1"
            >
              <span>{category.name}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => handleRemove(category.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}