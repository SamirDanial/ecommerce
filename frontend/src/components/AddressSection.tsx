import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import {
  MapPin,
  User,
  Settings,
  CreditCard,
  Truck,
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  Phone,
  Loader2,
} from "lucide-react";
import { Address } from "../types";

interface AddressSectionProps {
  addresses: Address[];
  addressesLoading: boolean;
  addressesError: any;
  addAddressMutation: any;
  updateAddressMutation: any;
  deleteAddressMutation: any;
  countries: Array<{ code: string; name: string }>;
}

const AddressSection: React.FC<AddressSectionProps> = ({
  addresses,
  addressesLoading,
  addressesError,
  addAddressMutation,
  updateAddressMutation,
  deleteAddressMutation,
  countries,
}) => {
  // State for address management
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddressDetailOpen, setIsAddressDetailOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);
  const [addressToView, setAddressToView] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState({
    type: "SHIPPING" as "SHIPPING" | "BILLING",
    isDefault: false,
    firstName: "",
    lastName: "",
    company: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
    phone: "",
  });

  // Reset address form
  const resetAddressForm = () => {
    setAddressForm({
      type: "SHIPPING",
      isDefault: false,
      firstName: "",
      lastName: "",
      company: "",
      address1: "",
      address2: "",
      city: "",
      state: "",
      postalCode: "",
      country: countries.length > 0 ? countries[0].code : "US",
      phone: "",
    });
    setEditingAddress(null);
  };

  // Open add address modal
  const openAddAddressModal = () => {
    resetAddressForm();
    setIsAddressModalOpen(true);
  };

  // Open edit address modal
  const openEditAddressModal = (address: Address) => {
    setAddressForm({
      type: address.type,
      isDefault: address.isDefault,
      firstName: address.firstName,
      lastName: address.lastName,
      company: address.company || "",
      address1: address.address1,
      address2: address.address2 || "",
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone,
    });
    setEditingAddress(address);
    setIsAddressModalOpen(true);
  };

  // Close address modal
  const closeAddressModal = () => {
    setIsAddressModalOpen(false);
    resetAddressForm();
  };

  // Handle address form changes
  const handleAddressFormChange = (field: string, value: string | boolean) => {
    setAddressForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle address form submission
  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingAddress) {
      // Update existing address
      updateAddressMutation.mutate(
        {
          addressId: editingAddress.id,
          address: addressForm,
        },
        {
          onSuccess: () => {
            closeAddressModal();
          },
        }
      );
    } else {
      // Add new address
      addAddressMutation.mutate(addressForm, {
        onSuccess: () => {
          closeAddressModal();
        },
      });
    }
  };

  // Handle edit address
  const handleEditAddress = async (addressId: number) => {
    const address = addresses.find((addr: Address) => addr.id === addressId);
    if (address) {
      openEditAddressModal(address);
    }
  };

  // Confirm delete address
  const confirmDeleteAddress = (address: Address) => {
    setAddressToDelete(address);
    setIsDeleteDialogOpen(true);
  };

  // Open address detail
  const openAddressDetail = (address: Address) => {
    setAddressToView(address);
    setIsAddressDetailOpen(true);
  };

  // Execute delete address
  const executeDeleteAddress = async () => {
    if (addressToDelete) {
      deleteAddressMutation.mutate(addressToDelete.id);
      setIsDeleteDialogOpen(false);
      setAddressToDelete(null);
    }
  };

  if (addressesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading addresses...</span>
      </div>
    );
  }

  if (addressesError) {
    return (
      <div className="text-center py-12 px-4">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <MapPin className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Error loading addresses
        </h3>
        <p className="text-gray-600">Please try again later</p>
      </div>
    );
  }

  return (
    <>
      {/* Address List */}
      <Card className="border-0 shadow-sm bg-transparent">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <MapPin className="h-5 w-5 text-green-600" />
              </div>
              Saved Addresses
            </CardTitle>
            <Button
              onClick={openAddAddressModal}
              className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 h-auto text-base font-semibold"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add New Address
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {addresses.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <MapPin className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No addresses saved
              </h3>
              <p className="text-gray-600 max-w-sm mx-auto">
                Add an address to make checkout faster and easier
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {addresses.map((address: Address) => (
                <div
                  key={address.id}
                  className="bg-white border-0 shadow-lg rounded-2xl p-5 sm:p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 overflow-hidden relative group cursor-pointer"
                  onClick={() => openAddressDetail(address)}
                >
                  {/* Decorative gradient border */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-2xl"></div>
                  <div className="relative z-10">
                    {/* Header with badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <Badge
                        variant={address.isDefault ? "default" : "secondary"}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium"
                      >
                        <MapPin className="h-3.5 w-3.5" />
                        {address.type === "SHIPPING" ? "Shipping" : "Billing"}
                      </Badge>
                      {address.isDefault && (
                        <Badge
                          variant="outline"
                          className="border-green-200 text-green-700 bg-green-50 px-3 py-1.5 text-sm font-medium"
                        >
                          <CheckCircle className="h-3.5 w-3.5 mr-1" />
                          Default
                        </Badge>
                      )}
                    </div>

                    {/* Address content */}
                    <div className="space-y-3 mb-5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <p className="font-bold text-lg text-gray-900">
                          {address.firstName} {address.lastName}
                        </p>
                      </div>

                      {address.company && (
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <Settings className="h-4 w-4 text-gray-600" />
                          </div>
                          <p className="text-base font-medium text-gray-700">
                            {address.company}
                          </p>
                        </div>
                      )}

                      <div className="space-y-2">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-gray-100 rounded-lg mt-1">
                            <MapPin className="h-4 w-4 text-gray-600" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-base text-gray-900 font-medium break-words">
                              {address.address1}
                            </p>
                            {address.address2 && (
                              <p className="text-sm text-gray-600 break-words">
                                {address.address2}
                              </p>
                            )}
                            <p className="text-base text-gray-900 font-medium">
                              {address.city}, {address.state}{" "}
                              {address.postalCode}
                            </p>
                            <p className="text-base text-gray-900 font-medium">
                              {address.country}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <Phone className="h-4 w-4 text-gray-600" />
                          </div>
                          <p className="text-base text-gray-900 font-medium">
                            {address.phone}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-100">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openAddressDetail(address);
                        }}
                        className="h-10 font-medium hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors"
                      >
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Details</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditAddress(address.id);
                        }}
                        className="h-10 font-medium hover:bg-green-50 hover:border-green-200 hover:text-green-700 transition-colors"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10 font-medium text-destructive border-destructive hover:bg-destructive/10 hover:border-destructive/30 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmDeleteAddress(address);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Delete</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Address Form Modal */}
      <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          {/* Header */}
          <DialogHeader className="mb-4 sm:mb-6">
            <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              {editingAddress ? "Edit Address" : "Add New Address"}
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={handleAddressSubmit}
            className="space-y-4 sm:space-y-6"
          >
            {/* Address Type & Default Section */}
            <div className="border border-gray-200 rounded-lg p-3 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                  <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
                Address Configuration
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="type"
                    className="text-sm font-medium text-gray-700 mb-2 block"
                  >
                    Address Type *
                  </Label>
                  <Select
                    value={addressForm.type}
                    onValueChange={(value: string) =>
                      handleAddressFormChange("type", value)
                    }
                  >
                    <SelectTrigger className="h-12 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors">
                      <SelectValue placeholder="Select address type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        value="SHIPPING"
                        className="flex items-center gap-2"
                      >
                        <Truck className="h-4 w-4" />
                        Shipping Address
                      </SelectItem>
                      <SelectItem
                        value="BILLING"
                        className="flex items-center gap-2"
                      >
                        <CreditCard className="h-4 w-4" />
                        Billing Address
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <Checkbox
                    id="isDefault"
                    checked={addressForm.isDefault}
                    onCheckedChange={(checked: boolean | "indeterminate") =>
                      handleAddressFormChange("isDefault", checked === true)
                    }
                    className="h-5 w-5 border-2 border-blue-500 data-[state=checked]:bg-blue-500"
                  />
                  <Label
                    htmlFor="isDefault"
                    className="text-base font-medium text-gray-900 cursor-pointer"
                  >
                    Set as default address
                  </Label>
                </div>
              </div>
            </div>

            {/* Personal Information Section */}
            <div className="border border-gray-200 rounded-lg p-3 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="p-1.5 sm:p-2 bg-indigo-100 rounded-lg">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
                </div>
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="firstName"
                    className="text-sm font-medium text-gray-700 mb-2 block"
                  >
                    First Name *
                  </Label>
                  <Input
                    id="firstName"
                    value={addressForm.firstName}
                    onChange={(e) =>
                      handleAddressFormChange("firstName", e.target.value)
                    }
                    placeholder="Enter first name"
                    required
                    className="h-12 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="lastName"
                    className="text-sm font-medium text-gray-700 mb-2 block"
                  >
                    Last Name *
                  </Label>
                  <Input
                    id="lastName"
                    value={addressForm.lastName}
                    onChange={(e) =>
                      handleAddressFormChange("lastName", e.target.value)
                    }
                    placeholder="Enter last name"
                    required
                    className="h-12 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label
                    htmlFor="company"
                    className="text-sm font-medium text-gray-700 mb-2 block"
                  >
                    Company (Optional)
                  </Label>
                  <Input
                    id="company"
                    value={addressForm.company}
                    onChange={(e) =>
                      handleAddressFormChange("company", e.target.value)
                    }
                    placeholder="Enter company name"
                    className="h-12 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Address Information Section */}
            <div className="border border-gray-200 rounded-lg p-3 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
                Address Information
              </h3>

              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="address1"
                    className="text-sm font-medium text-gray-700 mb-2 block"
                  >
                    Street Address *
                  </Label>
                  <Input
                    id="address1"
                    value={addressForm.address1}
                    onChange={(e) =>
                      handleAddressFormChange("address1", e.target.value)
                    }
                    placeholder="Enter street address"
                    required
                    className="h-12 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="address2"
                    className="text-sm font-medium text-gray-700 mb-2 block"
                  >
                    Apartment, suite, etc. (Optional)
                  </Label>
                  <Input
                    id="address2"
                    value={addressForm.address2}
                    onChange={(e) =>
                      handleAddressFormChange("address2", e.target.value)
                    }
                    placeholder="Enter apartment or suite number"
                    className="h-12 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label
                      htmlFor="city"
                      className="text-sm font-medium text-gray-700 mb-2 block"
                    >
                      City *
                    </Label>
                    <Input
                      id="city"
                      value={addressForm.city}
                      onChange={(e) =>
                        handleAddressFormChange("city", e.target.value)
                      }
                      placeholder="Enter city"
                      required
                      className="h-12 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="state"
                      className="text-sm font-medium text-gray-700 mb-2 block"
                    >
                      State/Province *
                    </Label>
                    <Input
                      id="state"
                      value={addressForm.state}
                      onChange={(e) =>
                        handleAddressFormChange("state", e.target.value)
                      }
                      placeholder="Enter state"
                      required
                      className="h-12 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="postalCode"
                      className="text-sm font-medium text-gray-700 mb-2 block"
                    >
                      Postal Code *
                    </Label>
                    <Input
                      id="postalCode"
                      value={addressForm.postalCode}
                      onChange={(e) =>
                        handleAddressFormChange("postalCode", e.target.value)
                      }
                      placeholder="Enter postal code"
                      required
                      className="h-12 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="country"
                      className="text-sm font-medium text-gray-700 mb-2 block"
                    >
                      Country *
                    </Label>
                    <Select
                      value={addressForm.country}
                      onValueChange={(value: string) =>
                        handleAddressFormChange("country", value)
                      }
                    >
                      <SelectTrigger className="h-12 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label
                      htmlFor="phone"
                      className="text-sm font-medium text-gray-700 mb-2 block"
                    >
                      Phone Number *
                    </Label>
                    <Input
                      id="phone"
                      value={addressForm.phone}
                      onChange={(e) =>
                        handleAddressFormChange("phone", e.target.value)
                      }
                      placeholder="Enter phone number"
                      required
                      className="h-12 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={closeAddressModal}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  addAddressMutation.isPending ||
                  updateAddressMutation.isPending
                }
                className="flex-1"
              >
                {addAddressMutation.isPending ||
                updateAddressMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {editingAddress ? "Updating..." : "Adding..."}
                  </>
                ) : editingAddress ? (
                  "Update Address"
                ) : (
                  "Add Address"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Address Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              Delete Address
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete this address? This action cannot
              be undone.
            </p>

            {addressToDelete && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <MapPin className="h-4 w-4 text-gray-600" />
                  </div>
                  <p className="font-medium text-gray-900">
                    {addressToDelete.firstName} {addressToDelete.lastName}
                  </p>
                </div>
                <p className="text-sm text-gray-600 break-words">
                  {addressToDelete.address1}
                  {addressToDelete.address2 && `, ${addressToDelete.address2}`}
                </p>
                <p className="text-sm text-gray-600">
                  {addressToDelete.city}, {addressToDelete.state}{" "}
                  {addressToDelete.postalCode}
                </p>
                <p className="text-sm text-gray-600">
                  {addressToDelete.country}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={executeDeleteAddress}
              disabled={deleteAddressMutation.isPending}
              className="flex-1"
            >
              {deleteAddressMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Address"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Address Detail Dialog */}
      <Dialog open={isAddressDetailOpen} onOpenChange={setIsAddressDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          {/* Header */}
          <DialogHeader className="mb-4 sm:mb-6">
            <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              Address Details
            </DialogTitle>
          </DialogHeader>

          {/* Address Details Content */}
          {addressToView && (
            <div className="space-y-4 sm:space-y-6">
              {/* Personal Information */}
              <div className="border border-gray-200 rounded-lg p-3 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="p-1.5 sm:p-2 bg-indigo-100 rounded-lg">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
                  </div>
                  Personal Information
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <User className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Full Name</p>
                      <p className="font-medium text-gray-900">
                        {addressToView.firstName} {addressToView.lastName}
                      </p>
                    </div>
                  </div>

                  {addressToView.company && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Settings className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Company</p>
                        <p className="font-medium text-gray-900">
                          {addressToView.company}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Phone Number</p>
                      <p className="font-medium text-gray-900">
                        {addressToView.phone}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="border border-gray-200 rounded-lg p-3 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  </div>
                  Address Information
                </h3>

                <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900 mb-2">
                        {addressToView.firstName} {addressToView.lastName}
                      </p>

                      <div className="space-y-1 text-gray-600">
                        <p>{addressToView.address1}</p>
                        {addressToView.address2 && (
                          <p>{addressToView.address2}</p>
                        )}
                        <p>
                          {addressToView.city}, {addressToView.state}{" "}
                          {addressToView.postalCode}
                        </p>
                        <p className="font-medium">{addressToView.country}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Type & Status */}
              <div className="border border-gray-200 rounded-lg p-3 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  </div>
                  Address Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                      Address Type
                    </label>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant={
                          addressToView.type === "SHIPPING"
                            ? "default"
                            : "secondary"
                        }
                        className="text-base px-3 py-1"
                      >
                        {addressToView.type === "SHIPPING"
                          ? "Shipping"
                          : "Billing"}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                      Status
                    </label>
                    <div className="flex items-center gap-2 mt-2">
                      {addressToView.isDefault ? (
                        <Badge
                          variant="outline"
                          className="border-green-200 text-green-700 bg-green-50 text-base px-3 py-1"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Default Address
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="text-base px-3 py-1"
                        >
                          Regular Address
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => setIsAddressDetailOpen(false)}
                  className="flex-1"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setIsAddressDetailOpen(false);
                    handleEditAddress(addressToView.id);
                  }}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Address
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddressSection;
