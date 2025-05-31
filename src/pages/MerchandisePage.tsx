import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../hooks/redux';
import { MerchService } from '../services/merchService';
import { MainLayout } from '../components/layout/MainLayout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Modal } from '../components/ui/Modal';
import { MerchItem, MerchSale, MerchCategory, MerchSubcategory, MerchSaleChannel, MerchSizeStock } from '../types';

export const MerchandisePage: React.FC = () => {
  const { currentUser } = useAppSelector((state) => state.user);
  
  const [items, setItems] = useState<MerchItem[]>([]);
  const [sales, setSales] = useState<MerchSale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MerchItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<MerchItem | null>(null);
  
  const [itemFormData, setItemFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: MerchCategory.CLOTHING,
    subcategory: '',
    stockS: '0',
    stockM: '0',
    stockL: '0',
    stockXL: '0',
    stockXXL: '0',
    lowStockThreshold: '5',
    sku: '',
    cost: ''
  });

  const [saleFormData, setSaleFormData] = useState({
    size: 'M',
    quantity: '1',
    channel: MerchSaleChannel.CONCERT
  });

  useEffect(() => {
    fetchData();
  }, [currentUser?.groupId]);

  const fetchData = async () => {
    if (!currentUser?.groupId) return;
    
    setIsLoading(true);
    try {
      const [fetchedItems, fetchedSales] = await Promise.all([
        MerchService.fetchItems(currentUser.groupId),
        MerchService.fetchSales(currentUser.groupId)
      ]);
      setItems(fetchedItems);
      setSales(fetchedSales);
    } catch (error) {
      console.error('Failed to fetch merchandise data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.groupId) return;

    const stock: MerchSizeStock = {
      S: parseInt(itemFormData.stockS) || 0,
      M: parseInt(itemFormData.stockM) || 0,
      L: parseInt(itemFormData.stockL) || 0,
      XL: parseInt(itemFormData.stockXL) || 0,
      XXL: parseInt(itemFormData.stockXXL) || 0
    };

    try {
      const itemData: Omit<MerchItem, 'id'> = {
        name: itemFormData.name,
        description: itemFormData.description,
        price: parseFloat(itemFormData.price),
        category: itemFormData.category,
        subcategory: itemFormData.subcategory ? itemFormData.subcategory as MerchSubcategory : undefined,
        stock,
        groupId: currentUser.groupId,
        lowStockThreshold: parseInt(itemFormData.lowStockThreshold) || 5,
        sku: itemFormData.sku || undefined,
        cost: itemFormData.cost ? parseFloat(itemFormData.cost) : undefined,
        updatedAt: new Date()
      };

      if (editingItem) {
        await MerchService.updateItem(editingItem.id!, itemData);
      } else {
        await MerchService.addItem(itemData);
      }
      
      await fetchData();
      setShowItemModal(false);
      resetItemForm();
    } catch (error) {
      console.error('Failed to save item:', error);
    }
  };

  const handleSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem?.id || !currentUser?.groupId) return;

    try {
      const saleData: Omit<MerchSale, 'id'> = {
        itemId: selectedItem.id,
        size: saleFormData.size,
        quantity: parseInt(saleFormData.quantity),
        channel: saleFormData.channel,
        groupId: currentUser.groupId,
        date: new Date()
      };

      await MerchService.recordSale(saleData);
      
      // Update stock
      const newStock = { ...selectedItem.stock };
      const quantity = parseInt(saleFormData.quantity);
      
      switch (saleFormData.size) {
        case 'S': newStock.S = Math.max(0, newStock.S - quantity); break;
        case 'M': newStock.M = Math.max(0, newStock.M - quantity); break;
        case 'L': newStock.L = Math.max(0, newStock.L - quantity); break;
        case 'XL': newStock.XL = Math.max(0, newStock.XL - quantity); break;
        case 'XXL': newStock.XXL = Math.max(0, newStock.XXL - quantity); break;
      }
      
      await MerchService.updateStock(selectedItem.id, newStock);
      
      await fetchData();
      setShowSaleModal(false);
      resetSaleForm();
    } catch (error) {
      console.error('Failed to record sale:', error);
    }
  };

  const handleEditItem = (item: MerchItem) => {
    setEditingItem(item);
    setItemFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      subcategory: item.subcategory || '',
      stockS: item.stock.S.toString(),
      stockM: item.stock.M.toString(),
      stockL: item.stock.L.toString(),
      stockXL: item.stock.XL.toString(),
      stockXXL: item.stock.XXL.toString(),
      lowStockThreshold: item.lowStockThreshold.toString(),
      sku: item.sku || '',
      cost: item.cost?.toString() || ''
    });
    setShowItemModal(true);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this item? This will also delete all related sales.')) {
      try {
        await MerchService.deleteItem(itemId);
        await fetchData();
      } catch (error) {
        console.error('Failed to delete item:', error);
      }
    }
  };

  const openSaleModal = (item: MerchItem) => {
    setSelectedItem(item);
    setShowSaleModal(true);
  };

  const resetItemForm = () => {
    setEditingItem(null);
    setItemFormData({
      name: '',
      description: '',
      price: '',
      category: MerchCategory.CLOTHING,
      subcategory: '',
      stockS: '0',
      stockM: '0',
      stockL: '0',
      stockXL: '0',
      stockXXL: '0',
      lowStockThreshold: '5',
      sku: '',
      cost: ''
    });
  };

  const resetSaleForm = () => {
    setSaleFormData({
      size: 'M',
      quantity: '1',
      channel: MerchSaleChannel.CONCERT
    });
  };

  const categoryOptions = Object.values(MerchCategory).map(cat => ({
    value: cat,
    label: cat
  }));

  const sizeOptions = [
    { value: 'S', label: 'S' },
    { value: 'M', label: 'M' },
    { value: 'L', label: 'L' },
    { value: 'XL', label: 'XL' },
    { value: 'XXL', label: 'XXL' }
  ];

  const channelOptions = Object.values(MerchSaleChannel).map(channel => ({
    value: channel,
    label: channel
  }));

  const lowStockItems = MerchService.getLowStockItems(items);
  const topSellingItems = MerchService.getTopSellingItems(items, sales, 3);
  const totalRevenue = MerchService.calculateRevenue(items, sales);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Merchandise</h1>
            <p className="text-gray-600">Manage your band's merchandise inventory and sales</p>
          </div>
          <Button onClick={() => setShowItemModal(true)}>
            Add Item
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Items</h3>
            <p className="text-2xl font-bold text-gray-900">{items.length}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Sales</h3>
            <p className="text-2xl font-bold text-blue-600">{sales.length}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Low Stock Items</h3>
            <p className="text-2xl font-bold text-red-600">{lowStockItems.length}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
            <p className="text-2xl font-bold text-green-600">€{totalRevenue.toFixed(2)}</p>
          </div>
        </div>

        {/* Items Grid */}
        {isLoading ? (
          <div className="text-center py-12">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No merchandise items yet. Add your first item to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-gray-600">{item.category}</p>
                    <p className="text-xl font-bold text-gray-900 mt-2">€{item.price}</p>
                  </div>
                  
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEditItem(item)}
                      className="text-blue-600 hover:text-blue-900 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id!)}
                      className="text-red-600 hover:text-red-900 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4">{item.description}</p>

                {/* Stock Information */}
                <div className="space-y-2 mb-4">
                  <div className="text-sm">
                    <span className="font-medium">Total Stock:</span> {MerchService.calculateTotalStock(item.stock)}
                  </div>
                  
                  {item.category === MerchCategory.CLOTHING && (
                    <div className="text-sm">
                      <span className="font-medium">Sizes:</span> 
                      S({item.stock.S}) M({item.stock.M}) L({item.stock.L}) XL({item.stock.XL}) XXL({item.stock.XXL})
                    </div>
                  )}
                  
                  {MerchService.isLowStock(item) && (
                    <div className="text-sm text-red-600 font-medium">⚠️ Low Stock</div>
                  )}
                </div>

                <div className="space-y-2">
                  <Button
                    size="sm"
                    onClick={() => openSaleModal(item)}
                    className="w-full"
                    disabled={MerchService.calculateTotalStock(item.stock) === 0}
                  >
                    Record Sale
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Item Modal */}
        <Modal
          isOpen={showItemModal}
          onClose={() => {
            setShowItemModal(false);
            resetItemForm();
          }}
          title={editingItem ? 'Edit Item' : 'Add New Item'}
          size="xl"
        >
          <form onSubmit={handleItemSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Name"
                value={itemFormData.name}
                onChange={(e) => setItemFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Item name"
                required
              />

              <Input
                label="Price (€)"
                type="number"
                step="0.01"
                value={itemFormData.price}
                onChange={(e) => setItemFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="0.00"
                required
              />
            </div>

            <Textarea
              label="Description"
              value={itemFormData.description}
              onChange={(e) => setItemFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Item description..."
              rows={3}
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Category"
                value={itemFormData.category}
                onChange={(e) => setItemFormData(prev => ({ ...prev, category: e.target.value as MerchCategory }))}
                options={categoryOptions}
              />

              <Input
                label="SKU (Optional)"
                value={itemFormData.sku}
                onChange={(e) => setItemFormData(prev => ({ ...prev, sku: e.target.value }))}
                placeholder="Product code"
              />
            </div>

            {/* Stock Management */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stock by Size</label>
              <div className="grid grid-cols-5 gap-2">
                <Input
                  label="S"
                  type="number"
                  min="0"
                  value={itemFormData.stockS}
                  onChange={(e) => setItemFormData(prev => ({ ...prev, stockS: e.target.value }))}
                />
                <Input
                  label="M"
                  type="number"
                  min="0"
                  value={itemFormData.stockM}
                  onChange={(e) => setItemFormData(prev => ({ ...prev, stockM: e.target.value }))}
                />
                <Input
                  label="L"
                  type="number"
                  min="0"
                  value={itemFormData.stockL}
                  onChange={(e) => setItemFormData(prev => ({ ...prev, stockL: e.target.value }))}
                />
                <Input
                  label="XL"
                  type="number"
                  min="0"
                  value={itemFormData.stockXL}
                  onChange={(e) => setItemFormData(prev => ({ ...prev, stockXL: e.target.value }))}
                />
                <Input
                  label="XXL"
                  type="number"
                  min="0"
                  value={itemFormData.stockXXL}
                  onChange={(e) => setItemFormData(prev => ({ ...prev, stockXXL: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Low Stock Threshold"
                type="number"
                min="0"
                value={itemFormData.lowStockThreshold}
                onChange={(e) => setItemFormData(prev => ({ ...prev, lowStockThreshold: e.target.value }))}
              />

              <Input
                label="Cost (€, Optional)"
                type="number"
                step="0.01"
                value={itemFormData.cost}
                onChange={(e) => setItemFormData(prev => ({ ...prev, cost: e.target.value }))}
                placeholder="0.00"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowItemModal(false);
                  resetItemForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingItem ? 'Update' : 'Add'} Item
              </Button>
            </div>
          </form>
        </Modal>

        {/* Record Sale Modal */}
        <Modal
          isOpen={showSaleModal}
          onClose={() => {
            setShowSaleModal(false);
            resetSaleForm();
          }}
          title={`Record Sale - ${selectedItem?.name}`}
        >
          <form onSubmit={handleSaleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Size"
                value={saleFormData.size}
                onChange={(e) => setSaleFormData(prev => ({ ...prev, size: e.target.value }))}
                options={sizeOptions}
              />

              <Input
                label="Quantity"
                type="number"
                min="1"
                value={saleFormData.quantity}
                onChange={(e) => setSaleFormData(prev => ({ ...prev, quantity: e.target.value }))}
                required
              />
            </div>

            <Select
              label="Sales Channel"
              value={saleFormData.channel}
              onChange={(e) => setSaleFormData(prev => ({ ...prev, channel: e.target.value as MerchSaleChannel }))}
              options={channelOptions}
            />

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">
                <p><strong>Price:</strong> €{selectedItem?.price}</p>
                <p><strong>Total:</strong> €{((selectedItem?.price || 0) * parseInt(saleFormData.quantity || '1')).toFixed(2)}</p>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowSaleModal(false);
                  resetSaleForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                Record Sale
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </MainLayout>
  );
};
