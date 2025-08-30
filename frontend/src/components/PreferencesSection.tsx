import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { SearchableSelect } from "./ui/searchable-select";
import {
  Settings,
  Mail,
  Phone,
  Star,
  Truck,
  Zap,
  Clock,
  Globe,
  CreditCard,
  Loader2,
} from "lucide-react";
import { UserPreferences } from "../services/profileService";
import { toast } from "sonner";

interface PreferencesSectionProps {
  preferences: UserPreferences | undefined;
  localPreferences: UserPreferences | undefined;
  setLocalPreferences: React.Dispatch<React.SetStateAction<UserPreferences>>;
  updatePreferencesMutation: any;
  languages:
    | Array<{ code: string; name: string; nativeName: string }>
    | undefined;
  languagesLoading: boolean;
  languagesError: any;
  currencies: Array<{
    code: string;
    name: string;
    symbol: string;
    position: "before" | "after";
  }>;
  currenciesLoading: boolean;
  currenciesError: any;
  timezones: Array<{ value: string; label: string; offset: string }>;
}

const PreferencesSection: React.FC<PreferencesSectionProps> = ({
  preferences,
  localPreferences,
  setLocalPreferences,
  updatePreferencesMutation,
  languages,
  languagesLoading,
  languagesError,
  currencies,
  currenciesLoading,
  currenciesError,
  timezones,
}) => {
  // Handle save preferences
  const handleSavePreferences = async () => {
    if (!localPreferences) {
      toast.error("No preferences to save");
      return;
    }

    // Validate required fields
    if (!localPreferences.currency) {
      toast.error("Please select a currency");
      return;
    }

    try {
      await updatePreferencesMutation.mutateAsync(localPreferences);
      toast.success("Preferences saved successfully!");
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Failed to save preferences. Please try again.");
    }
  };

  return (
    <Card className="border-0 shadow-sm bg-transparent">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Settings className="h-5 w-5 text-purple-600" />
          </div>
          Notification Preferences
          {localPreferences &&
            preferences &&
            JSON.stringify(localPreferences) !==
              JSON.stringify(preferences) && (
              <Badge
                variant="secondary"
                className="text-xs ml-2 bg-orange-100 text-orange-700 border-orange-200"
              >
                Modified
              </Badge>
            )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-6">
        <p className="text-sm text-gray-600 mb-6 text-center sm:text-left">
          Choose how you want to receive notifications and updates from us.
        </p>

        {/* Notification Preferences Section */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="p-2 bg-purple-500 rounded-lg">
              <Settings className="h-4 w-4 text-white" />
            </div>
            Communication Preferences
          </h3>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-white rounded-xl border border-purple-200 hover:border-purple-300 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Mail className="h-4 w-4 text-blue-600" />
                  </div>
                  <Label
                    htmlFor="emailNotifs"
                    className="text-base font-semibold text-gray-900"
                  >
                    Email Notifications
                  </Label>
                </div>
                <p className="text-sm text-gray-600">
                  Receive order updates and promotions via email
                </p>
              </div>
              <div className="flex-shrink-0">
                <Checkbox
                  id="emailNotifs"
                  checked={localPreferences?.emailNotifications}
                  onCheckedChange={(checked: boolean) =>
                    setLocalPreferences(
                      (prev: UserPreferences | undefined) => ({
                        ...prev,
                        emailNotifications: checked,
                      })
                    )
                  }
                  className="h-5 w-5 border-2 border-purple-500 data-[state=checked]:bg-purple-500"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-white rounded-xl border border-purple-200 hover:border-purple-300 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Phone className="h-4 w-4 text-green-600" />
                  </div>
                  <Label
                    htmlFor="smsNotifs"
                    className="text-base font-semibold text-gray-900"
                  >
                    SMS Notifications
                  </Label>
                </div>
                <p className="text-sm text-gray-600">
                  Receive order updates via text message
                </p>
              </div>
              <div className="flex-shrink-0">
                <Checkbox
                  id="smsNotifs"
                  checked={localPreferences?.smsNotifications}
                  onCheckedChange={(checked: boolean) =>
                    setLocalPreferences(
                      (prev: UserPreferences | undefined) => ({
                        ...prev,
                        smsNotifications: checked,
                      })
                    )
                  }
                  className="h-5 w-5 border-2 border-purple-500 data-[state=checked]:bg-purple-500"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-white rounded-xl border border-purple-200 hover:border-purple-300 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Star className="h-4 w-4 text-orange-600" />
                  </div>
                  <Label
                    htmlFor="marketingEmails"
                    className="text-base font-semibold text-gray-900"
                  >
                    Marketing Emails
                  </Label>
                </div>
                <p className="text-sm text-gray-600">
                  Receive promotional offers and newsletters
                </p>
              </div>
              <div className="flex-shrink-0">
                <Checkbox
                  id="marketingEmails"
                  checked={localPreferences?.marketingEmails}
                  onCheckedChange={(checked: boolean) =>
                    setLocalPreferences(
                      (prev: UserPreferences | undefined) => ({
                        ...prev,
                        marketingEmails: checked,
                      })
                    )
                  }
                  className="h-5 w-5 border-2 border-purple-500 data-[state=checked]:bg-purple-500"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-white rounded-xl border border-purple-200 hover:border-purple-300 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Truck className="h-4 w-4 text-blue-600" />
                  </div>
                  <Label
                    htmlFor="orderUpdates"
                    className="text-base font-semibold text-gray-900"
                  >
                    Order Updates
                  </Label>
                </div>
                <p className="text-sm text-gray-600">
                  Receive notifications about order status changes
                </p>
              </div>
              <div className="flex-shrink-0">
                <Checkbox
                  id="orderUpdates"
                  checked={localPreferences?.orderUpdates}
                  onCheckedChange={(checked: boolean) =>
                    setLocalPreferences(
                      (prev: UserPreferences | undefined) => ({
                        ...prev,
                        orderUpdates: checked,
                      })
                    )
                  }
                  className="h-5 w-5 border-2 border-purple-500 data-[state=checked]:bg-purple-500"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-white rounded-xl border border-purple-200 hover:border-purple-300 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Zap className="h-4 w-4 text-yellow-600" />
                  </div>
                  <Label
                    htmlFor="promotionalOffers"
                    className="text-base font-semibold text-gray-900"
                  >
                    Promotional Offers
                  </Label>
                </div>
                <p className="text-sm text-gray-600">
                  Receive special deals and discounts
                </p>
              </div>
              <div className="flex-shrink-0">
                <Checkbox
                  id="promotionalOffers"
                  checked={localPreferences?.promotionalOffers}
                  onCheckedChange={(checked: boolean) =>
                    setLocalPreferences(
                      (prev: UserPreferences | undefined) => ({
                        ...prev,
                        promotionalOffers: checked,
                      })
                    )
                  }
                  className="h-5 w-5 border-2 border-purple-500 data-[state=checked]:bg-purple-500"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-white rounded-xl border border-purple-200 hover:border-purple-300 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Clock className="h-4 w-4 text-indigo-600" />
                  </div>
                  <Label
                    htmlFor="newsletter"
                    className="text-base font-semibold text-gray-900"
                  >
                    Newsletter
                  </Label>
                </div>
                <p className="text-sm text-gray-600">
                  Receive our monthly newsletter
                </p>
              </div>
              <div className="flex-shrink-0">
                <Checkbox
                  id="newsletter"
                  checked={localPreferences?.newsletter}
                  onCheckedChange={(checked: boolean) =>
                    setLocalPreferences(
                      (prev: UserPreferences | undefined) => ({
                        ...prev,
                        newsletter: checked,
                      })
                    )
                  }
                  className="h-5 w-5 border-2 border-purple-500 data-[state=checked]:bg-purple-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Currency & Region Section */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Globe className="h-4 w-4 text-white" />
            </div>
            Language & Region
          </h3>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <p className="text-sm text-gray-600">
              Customize your language, currency, and timezone preferences for a
              personalized experience.
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              {!currenciesLoading && (
                <span className="flex items-center gap-1">
                  <CreditCard className="h-3 w-3" />
                  {currencies.length} currencies available
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label
                htmlFor="language"
                className="text-sm font-medium text-gray-700 mb-2 block"
              >
                Language
              </Label>
              {languagesLoading ? (
                <div className="h-12 border-2 border-blue-200 rounded-md flex items-center justify-center bg-gray-50">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                </div>
              ) : languagesError ? (
                <div className="h-12 border-2 border-red-200 rounded-md flex items-center justify-center bg-red-50 text-red-600 text-sm">
                  Failed to load languages
                </div>
              ) : (
                <SearchableSelect
                  options={(languages || [])
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((lang) => ({
                      value: lang.code,
                      label: lang.name,
                      description: lang.nativeName,
                    }))}
                  value={localPreferences?.language}
                  onValueChange={(value: string) =>
                    setLocalPreferences((prev: UserPreferences) => ({
                      ...prev,
                      language: value,
                    }))
                  }
                  placeholder="Select a language"
                  searchPlaceholder="Search languages by name, code, or native name..."
                  emptyMessage="No languages found."
                  triggerClassName="h-12 border-2 border-blue-200 focus:border-blue-500 transition-colors"
                  contentClassName="w-[400px]"
                />
              )}
            </div>

            <div>
              <Label
                htmlFor="currency"
                className="text-sm font-medium text-gray-700 mb-2 block"
              >
                Currency
              </Label>
              {currenciesLoading ? (
                <div className="h-12 border-2 border-blue-200 rounded-md flex items-center justify-center bg-gray-50">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                </div>
              ) : currenciesError ? (
                <div className="h-12 border-2 border-red-200 rounded-md flex items-center justify-center bg-red-50 text-red-600 text-sm">
                  Failed to load currencies
                </div>
              ) : (
                <SearchableSelect
                  options={currencies.map((currency) => ({
                    value: currency.code,
                    label: `${
                      currency.position === "before" ? currency.symbol : ""
                    } ${currency.code} ${
                      currency.position === "after" ? currency.symbol : ""
                    }`,
                    description: currency.name,
                  }))}
                  value={localPreferences?.currency}
                  onValueChange={(value: string) =>
                    setLocalPreferences((prev: UserPreferences) => ({
                      ...prev,
                      currency: value as "USD" | "EUR" | "PKR",
                    }))
                  }
                  placeholder="Select a currency"
                  searchPlaceholder="Search currencies..."
                  emptyMessage="No currencies found."
                  triggerClassName="h-12 border-2 border-blue-200 focus:border-blue-500 transition-colors"
                  contentClassName="w-[400px]"
                />
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label
                  htmlFor="timezone"
                  className="text-sm font-medium text-gray-700"
                >
                  Timezone
                </Label>
                {!preferences?.id && localPreferences?.timezone && (
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full border border-blue-200">
                    🕐 Auto-detected: {localPreferences.timezone}
                  </span>
                )}
              </div>

              <SearchableSelect
                options={timezones.map((tz) => ({
                  value: tz.value,
                  label: tz.label,
                  description: tz.offset,
                }))}
                value={localPreferences?.timezone}
                onValueChange={(value: string) =>
                  setLocalPreferences((prev: UserPreferences | undefined) => ({
                    ...prev,
                    timezone: value,
                  }))
                }
                placeholder="Select your timezone"
                searchPlaceholder="Search timezones..."
                emptyMessage="No timezones found."
                triggerClassName="h-12 border-2 border-blue-200 focus:border-blue-500 transition-colors"
                contentClassName="w-[400px] max-h-96"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={() => preferences && setLocalPreferences(preferences)}
            disabled={updatePreferencesMutation.isPending}
            className="h-12 px-8 text-base font-medium"
          >
            Reset to Saved
          </Button>
          <Button
            onClick={handleSavePreferences}
            disabled={updatePreferencesMutation.isPending}
            className="h-12 px-8 text-base font-medium bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {updatePreferencesMutation.isPending ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Saving Preferences...
              </>
            ) : (
              <>
                <Settings className="h-5 w-5 mr-2" />
                Save Preferences
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PreferencesSection;
