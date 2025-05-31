import React, { useState } from 'react';
import { MerchItem, MerchCategory, MerchSizeStock } from '../../types';
import { MerchService } from '../../services/merchService';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';

interface MerchCatalogProps {
  items: MerchItem[];
  onAddToCart?: (item: MerchItem, size: string, quantity: number) => void;
  publicView?: boolean;
}

export const MerchCatalog: React.FC<MerchCatalogProps> = ({
  items,
  onAddToCart,
  publicView = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MerchCategory | ''>('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock'>('name');
  const [selectedItems, setSelectedItems] = useState<Record<string, { size: string; quantity: number }>>({});

  const filteredItems = items
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price - b.price;
        case 'stock':
          return MerchService.calculateTotalStock(b.stock) - MerchService.calculateTotalStock(a.stock);
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...Object.values(MerchCategory).map(cat => ({
      value: cat,
      label: cat
    }))
  ];

  const sortOptions = [
    { value: 'name', label: 'Name A-Z' },
    { value: 'price', label: 'Price Low-High' },
    { value: 'stock', label: 'Stock High-Low' }
  ];

  const updateSelection = (itemId: string, field: 'size' | 'quantity', value: string | number) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value
      }
    }));
  };

  const getAvailableSizes = (stock: MerchSizeStock): string[] => {
    return Object.entries(stock)
      .filter(([_, quantity]) => quantity > 0)
      .map(([size]) => size);
  };

  const handleAddToCart = (item: MerchItem) => {
    if (!onAddToCart) return;
    
    const selection = selectedItems[item.id!];
    if (!selection?.size || !selection?.quantity) {
      alert('Please select size and quantity');
      return;
    }

    onAddToCart(item, selection.size, selection.quantity);
    
    setSelectedItems(prev => ({
      ...prev,
      [item.id!]: { size: '', quantity: 1 }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as MerchCategory | '')}
            options={categoryOptions}
          />
          
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'stock')}
            options={sortOptions}
          />
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {items.length === 0 
            ? 'No products available yet.' 
            : 'No products match your search criteria.'
          }
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => {
            const totalStock = MerchService.calculateTotalStock(item.stock);
            const availableSizes = getAvailableSizes(item.stock);
            const selection = selectedItems[item.id!] || { size: '', quantity: 1 };
            
            return (
              <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-w-1 aspect-h-1 w-full">
                  {item.imageUrls && item.imageUrls.length > 0 ? (
                    <img
                      src={item.imageUrls[0]}
                      alt={item.name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {item.name}
                    </h3>
                    <span className="text-lg font-bold text-blue-600">
                      €{item.price.toFixed(2)}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {item.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Stock:</span>
                      <span className={`font-medium ${
                        totalStock === 0 ? 'text-red-600' : 
                        MerchService.isLowStock(item) ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {totalStock === 0 ? 'Out of Stock' : 
                         MerchService.isLowStock(item) ? 'Low Stock' : 'In Stock'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Category:</span>
                      <span className="font-medium">{item.category}</span>
                    </div>
                  </div>

                  {onAddToCart && totalStock > 0 && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={selection.size}
                          onChange={(e) => updateSelection(item.id!, 'size', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                        >
                          <option value="">Size</option>
                          {availableSizes.map(size => (
                            <option key={size} value={size}>
                              {size} ({item.stock[size as keyof MerchSizeStock]})
                            </option>
                          ))}
                        </select>

                        <input
                          type="number"
                          min="1"
                          max={selection.size ? item.stock[selection.size as keyof MerchSizeStock] : 1}
                          value={selection.quantity}
                          onChange={(e) => updateSelection(item.id!, 'quantity', parseInt(e.target.value) || 1)}
                          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                          placeholder="Qty"
                        />
                      </div>

                      <button
                        onClick={() => handleAddToCart(item)}
                        disabled={!selection.size || totalStock === 0}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        Add to Cart
                      </button>
                    </div>
                  )}

                  {!publicView && (
                    <div className="mt-3 text-xs text-gray-500">
                      {item.sku && <div>SKU: {item.sku}</div>}
                      {item.cost && <div>Cost: €{item.cost.toFixed(2)}</div>}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
