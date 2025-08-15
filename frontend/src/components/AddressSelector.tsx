import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { MapPin, Plus, Edit, Trash2, CheckCircle } from 'lucide-react';
import { ShippingAddress } from '../stores/cartStore';

interface AddressSelectorProps {
  savedAddresses: any[]; // Using any for now to avoid type conflicts
  selectedAddress: any | null;
  onSelectAddress: (address: any) => void;
  onAddNewAddress: () => void;
  onEditAddress: (address: any) => void;
  onDeleteAddress: (addressId: string) => void;
  isEditing?: boolean;
  isSidebarOpen?: boolean; // New prop to track sidebar state
}

const AddressSelector: React.FC<AddressSelectorProps> = ({
  savedAddresses,
  selectedAddress,
  onSelectAddress,
  onAddNewAddress,
  onEditAddress,
  onDeleteAddress,
  isEditing = false
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleDelete = (addressId: string) => {
    onDeleteAddress(addressId);
    setShowDeleteConfirm(null);
  };

  const formatAddress = (address: ShippingAddress) => {
    return `${address.address}, ${address.city}, ${address.state} ${address.postalCode}, ${address.country}`;
  };

  const getAddressType = (address: ShippingAddress) => {
    // You can add logic here to determine address type based on usage patterns
    return 'Primary'; // For now, just show Primary
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Saved Addresses</h3>
        <Button 
          onClick={onAddNewAddress}
          variant="outline"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Address
        </Button>
      </div>

      {savedAddresses.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-6 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No saved addresses found</p>
            <Button onClick={onAddNewAddress}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Address
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {savedAddresses.map((address) => (
            <Card 
              key={address.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedAddress?.id === address.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => onSelectAddress(address)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">
                        {address.firstName} {address.lastName}
                      </h4>
                      <Badge variant="secondary" className="text-xs">
                        {getAddressType(address)}
                      </Badge>
                      {selectedAddress?.id === address.id && (
                        <CheckCircle className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-1">
                      {address.email} • {address.phone}
                    </p>
                    
                    <p className="text-sm">
                      {formatAddress(address)}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditAddress(address);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteConfirm(address.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Delete Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Are you sure you want to delete this address? This action cannot be undone.</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="flex-1"
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AddressSelector;
