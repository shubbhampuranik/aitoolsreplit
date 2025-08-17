import { useState, Fragment } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Category {
  id: string;
  name: string;
  description?: string;
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
  categories = [],
  selectedCategories = [],
  onSelectionChange,
  placeholder = "Select categories...",
  className
}: MultiSelectCategoriesProps) {
  const [query, setQuery] = useState('');

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(query.toLowerCase()) &&
    !selectedCategories.some(selected => selected.id === category.id)
  );

  const handleSelect = (category: Category) => {
    if (category && !selectedCategories.find(selected => selected.id === category.id)) {
      onSelectionChange([...selectedCategories, category]);
      setQuery('');
    }
  };

  const handleRemove = (categoryId: string) => {
    onSelectionChange(selectedCategories.filter(cat => cat.id !== categoryId));
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Combobox value={selectedCategories} onChange={handleSelect}>
        <div className="relative mt-1">
          <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
            <Combobox.Input
              className="w-full border border-input bg-background py-2 pl-3 pr-10 text-sm leading-5 text-foreground focus:ring-0 focus:outline-none"
              displayValue={() => query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={selectedCategories.length > 0 ? "Add more categories..." : placeholder}
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronsUpDown
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </Combobox.Button>
          </div>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setQuery('')}
          >
            <Combobox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm border">
              {filteredCategories.length === 0 && query !== '' ? (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                  No categories found.
                </div>
              ) : (
                filteredCategories.map((category) => (
                  <Combobox.Option
                    key={category.id}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active ? 'bg-blue-600 text-white' : 'text-gray-900'
                      }`
                    }
                    value={category}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={`block truncate ${
                            selected ? 'font-medium' : 'font-normal'
                          }`}
                        >
                          {category.name}
                        </span>
                        {category.description && (
                          <span className={`block text-xs mt-1 ${
                            active ? 'text-blue-200' : 'text-gray-500'
                          }`}>
                            {category.description}
                          </span>
                        )}
                        {selected ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                              active ? 'text-white' : 'text-blue-600'
                            }`}
                          >
                            <Check className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Transition>
        </div>
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