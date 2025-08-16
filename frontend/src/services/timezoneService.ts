export interface TimezoneOption {
  value: string;
  label: string;
  offset: string;
}

export const timezoneService = {
  // Get browser's default timezone
  getBrowserTimezone: (): string => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    } catch (error) {
      console.warn('Failed to detect browser timezone, falling back to UTC:', error);
      return 'UTC';
    }
  },

  // Get all available timezones with offsets
  getAvailableTimezones: (): TimezoneOption[] => {
    const now = new Date();
    
    return [
      // Major US Timezones
      { value: 'America/New_York', label: 'Eastern Time (ET)', offset: getTimezoneOffset('America/New_York', now) },
      { value: 'America/Chicago', label: 'Central Time (CT)', offset: getTimezoneOffset('America/Chicago', now) },
      { value: 'America/Denver', label: 'Mountain Time (MT)', offset: getTimezoneOffset('America/Denver', now) },
      { value: 'America/Los_Angeles', label: 'Pacific Time (PT)', offset: getTimezoneOffset('America/Los_Angeles', now) },
      { value: 'America/Anchorage', label: 'Alaska Time (AKT)', offset: getTimezoneOffset('America/Anchorage', now) },
      { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)', offset: getTimezoneOffset('Pacific/Honolulu', now) },
      
      // Major European Timezones
      { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)', offset: getTimezoneOffset('Europe/London', now) },
      { value: 'Europe/Paris', label: 'Central European Time (CET)', offset: getTimezoneOffset('Europe/Paris', now) },
      { value: 'Europe/Berlin', label: 'Central European Time (CET)', offset: getTimezoneOffset('Europe/Berlin', now) },
      { value: 'Europe/Rome', label: 'Central European Time (CET)', offset: getTimezoneOffset('Europe/Rome', now) },
      { value: 'Europe/Madrid', label: 'Central European Time (CET)', offset: getTimezoneOffset('Europe/Madrid', now) },
      { value: 'Europe/Amsterdam', label: 'Central European Time (CET)', offset: getTimezoneOffset('Europe/Amsterdam', now) },
      { value: 'Europe/Stockholm', label: 'Central European Time (CET)', offset: getTimezoneOffset('Europe/Stockholm', now) },
      { value: 'Europe/Vienna', label: 'Central European Time (CET)', offset: getTimezoneOffset('Europe/Vienna', now) },
      { value: 'Europe/Zurich', label: 'Central European Time (CET)', offset: getTimezoneOffset('Europe/Zurich', now) },
      { value: 'Europe/Dublin', label: 'Greenwich Mean Time (GMT)', offset: getTimezoneOffset('Europe/Dublin', now) },
      { value: 'Europe/Oslo', label: 'Central European Time (CET)', offset: getTimezoneOffset('Europe/Oslo', now) },
      { value: 'Europe/Copenhagen', label: 'Central European Time (CET)', offset: getTimezoneOffset('Europe/Copenhagen', now) },
      { value: 'Europe/Helsinki', label: 'Eastern European Time (EET)', offset: getTimezoneOffset('Europe/Helsinki', now) },
      { value: 'Europe/Athens', label: 'Eastern European Time (EET)', offset: getTimezoneOffset('Europe/Athens', now) },
      { value: 'Europe/Istanbul', label: 'Eastern European Time (EET)', offset: getTimezoneOffset('Europe/Istanbul', now) },
      { value: 'Europe/Moscow', label: 'Moscow Time (MSK)', offset: getTimezoneOffset('Europe/Moscow', now) },
      
      // Major Asian Timezones
      { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)', offset: getTimezoneOffset('Asia/Tokyo', now) },
      { value: 'Asia/Shanghai', label: 'China Standard Time (CST)', offset: getTimezoneOffset('Asia/Shanghai', now) },
      { value: 'Asia/Seoul', label: 'Korea Standard Time (KST)', offset: getTimezoneOffset('Asia/Seoul', now) },
      { value: 'Asia/Singapore', label: 'Singapore Time (SGT)', offset: getTimezoneOffset('Asia/Singapore', now) },
      { value: 'Asia/Bangkok', label: 'Indochina Time (ICT)', offset: getTimezoneOffset('Asia/Bangkok', now) },
      { value: 'Asia/Jakarta', label: 'Western Indonesian Time (WIB)', offset: getTimezoneOffset('Asia/Jakarta', now) },
      { value: 'Asia/Manila', label: 'Philippine Time (PHT)', offset: getTimezoneOffset('Asia/Manila', now) },
      { value: 'Asia/Kolkata', label: 'India Standard Time (IST)', offset: getTimezoneOffset('Asia/Kolkata', now) },
      { value: 'Asia/Dubai', label: 'Gulf Standard Time (GST)', offset: getTimezoneOffset('Asia/Dubai', now) },
      { value: 'Asia/Riyadh', label: 'Arabia Standard Time (AST)', offset: getTimezoneOffset('Asia/Riyadh', now) },
      { value: 'Asia/Tehran', label: 'Iran Standard Time (IRST)', offset: getTimezoneOffset('Asia/Tehran', now) },
      { value: 'Asia/Karachi', label: 'Pakistan Standard Time (PKT)', offset: getTimezoneOffset('Asia/Karachi', now) },
      { value: 'Asia/Dhaka', label: 'Bangladesh Standard Time (BST)', offset: getTimezoneOffset('Asia/Dhaka', now) },
      
      // Major Oceanic Timezones
      { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)', offset: getTimezoneOffset('Australia/Sydney', now) },
      { value: 'Australia/Melbourne', label: 'Australian Eastern Time (AET)', offset: getTimezoneOffset('Australia/Melbourne', now) },
      { value: 'Australia/Perth', label: 'Australian Western Time (AWT)', offset: getTimezoneOffset('Australia/Perth', now) },
      { value: 'Australia/Adelaide', label: 'Australian Central Time (ACT)', offset: getTimezoneOffset('Australia/Adelaide', now) },
      { value: 'Pacific/Auckland', label: 'New Zealand Standard Time (NZST)', offset: getTimezoneOffset('Pacific/Auckland', now) },
      
      // Major African Timezones
      { value: 'Africa/Cairo', label: 'Eastern European Time (EET)', offset: getTimezoneOffset('Africa/Cairo', now) },
      { value: 'Africa/Johannesburg', label: 'South Africa Standard Time (SAST)', offset: getTimezoneOffset('Africa/Johannesburg', now) },
      { value: 'Africa/Lagos', label: 'West Africa Time (WAT)', offset: getTimezoneOffset('Africa/Lagos', now) },
      { value: 'Africa/Nairobi', label: 'East Africa Time (EAT)', offset: getTimezoneOffset('Africa/Nairobi', now) },
      { value: 'Africa/Casablanca', label: 'Western European Time (WET)', offset: getTimezoneOffset('Africa/Casablanca', now) },
      
      // Major South American Timezones
      { value: 'America/Sao_Paulo', label: 'Brasilia Time (BRT)', offset: getTimezoneOffset('America/Sao_Paulo', now) },
      { value: 'America/Argentina/Buenos_Aires', label: 'Argentina Time (ART)', offset: getTimezoneOffset('America/Argentina/Buenos_Aires', now) },
      { value: 'America/Santiago', label: 'Chile Time (CLT)', offset: getTimezoneOffset('America/Santiago', now) },
      { value: 'America/Lima', label: 'Peru Time (PET)', offset: getTimezoneOffset('America/Lima', now) },
      { value: 'America/Bogota', label: 'Colombia Time (COT)', offset: getTimezoneOffset('America/Bogota', now) },
      { value: 'America/Mexico_City', label: 'Central Time (CT)', offset: getTimezoneOffset('America/Mexico_City', now) },
      
      // UTC and GMT
      { value: 'UTC', label: 'Coordinated Universal Time (UTC)', offset: '+00:00' },
      { value: 'GMT', label: 'Greenwich Mean Time (GMT)', offset: '+00:00' },
    ].sort((a, b) => {
      // Sort by offset (UTC first, then by time difference)
      if (a.value === 'UTC' || a.value === 'GMT') return -1;
      if (b.value === 'UTC' || b.value === 'GMT') return 1;
      return a.offset.localeCompare(b.offset);
    });
  }
};

// Helper function to get timezone offset
function getTimezoneOffset(timezone: string, date: Date): string {
  try {
    const utc = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const local = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    const diff = (local.getTime() - utc.getTime()) / (1000 * 60 * 60);
    
    const sign = diff >= 0 ? '+' : '-';
    const hours = Math.abs(Math.floor(diff));
    const minutes = Math.abs(Math.floor((diff % 1) * 60));
    
    return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  } catch (error) {
    return '+00:00';
  }
}

