import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  User, 
  Shield, 
  CheckCircle, 
  Loader2
} from 'lucide-react';
import { UserSession } from '../services/profileService';
import { toast } from 'sonner';

interface SecuritySectionProps {
  sessions: UserSession[];
  sessionsLoading: boolean;
  sessionsError: any;
  revokeSessionMutation: any;
}

const SecuritySection: React.FC<SecuritySectionProps> = ({
  sessions,
  sessionsLoading,
  sessionsError,
  revokeSessionMutation
}) => {
  const handleRevokeSession = async (sessionId: number) => {
    try {
      await revokeSessionMutation.mutateAsync(sessionId);
      toast.success('Session revoked successfully');
    } catch (error) {
      toast.error('Failed to revoke session. Please try again.');
    }
  };

  const formatDeviceInfo = (deviceInfo: string) => {
    // Parse device info from backend and format it nicely
    try {
      const info = JSON.parse(deviceInfo);
      return `${info.browser || 'Unknown Browser'} on ${info.os || 'Unknown OS'}`;
    } catch {
      return deviceInfo || 'Unknown Device';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  return (
    <div className="space-y-6">
      {/* Security Summary */}
      <Card className="border-0 shadow-sm bg-transparent">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Shield className="h-5 w-5 text-green-600" />
            </div>
            Security Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:border-green-300 transition-colors">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-base font-semibold text-gray-900">Email Verified</p>
                <p className="text-sm text-gray-600">Your email is verified and secure</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 hover:border-blue-300 transition-colors">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-base font-semibold text-gray-900">Active Sessions</p>
                <p className="text-sm text-gray-600">{sessions.length} session{sessions.length !== 1 ? 's' : ''} active</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="border-0 shadow-sm bg-transparent">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Shield className="h-4 w-4 text-gray-600" />
            </div>
            Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-6">
          {/* Password Change Section */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Shield className="h-4 w-4 text-yellow-600" />
              </div>
              Change Password
            </h3>
            
            <div className="p-4 bg-white rounded-xl border border-yellow-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Password Change Temporarily Unavailable</p>
                  <p className="text-sm text-gray-600">
                    Password change functionality is not available in the current version. 
                    To change your password, please use the password reset feature or contact support.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Connected Accounts Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <div className="p-2 bg-blue-500 rounded-lg">
                <User className="h-4 w-4 text-white" />
              </div>
              Connected Accounts
            </h3>
            
            <div className="p-4 bg-white rounded-xl border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">OAuth Authentication</p>
                  <p className="text-sm text-gray-600">
                    You're signed in using a third-party service. 
                    Password changes are not applicable for OAuth accounts.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Login Sessions Section */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Shield className="h-4 w-4 text-white" />
              </div>
              Login Sessions
            </h3>
            
            <p className="text-sm text-gray-600 mb-6">
              Manage your active login sessions across different devices and browsers.
            </p>
            
            {sessionsLoading ? (
              <div className="flex items-center justify-center py-8 bg-white rounded-xl border border-purple-200">
                <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
                <span className="ml-2 text-gray-600">Loading sessions...</span>
              </div>
            ) : sessionsError ? (
              <div className="text-center py-8 bg-white rounded-xl border border-red-200">
                <p className="mb-2 text-red-600">Failed to load sessions</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.location.reload()}
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  Retry
                </Button>
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-xl border border-purple-200">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
                  <User className="h-8 w-8 text-purple-600" />
                </div>
                <p className="text-gray-600 mb-2">No active sessions found</p>
                <p className="text-sm text-gray-500">
                  This usually means you're only logged in on this device.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((session: UserSession) => (
                  <div key={session.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-purple-200 hover:border-purple-300 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                          <User className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{formatDeviceInfo(session.deviceInfo)}</p>
                          <p className="text-sm text-gray-600">
                            IP: {session.ipAddress}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 ml-11">
                        <p>Last activity: {formatTimeAgo(session.lastActivity)}</p>
                        <p>Created: {new Date(session.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {session.isActive ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
                          Current Session
                        </Badge>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleRevokeSession(session.id)}
                          disabled={revokeSessionMutation.isPending}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        >
                          {revokeSessionMutation.isPending ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            'Revoke'
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Session Management Tips */}
            <div className="mt-6 p-4 bg-white rounded-xl border border-blue-200">
              <h5 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-xs text-white">i</span>
                </div>
                Session Security Tips
              </h5>
              <ul className="text-sm text-blue-800 space-y-1 ml-6">
                <li>• Revoke sessions from devices you don't recognize</li>
                <li>• Keep your current session active for convenience</li>
                <li>• Sessions automatically expire after inactivity</li>
                <li>• Contact support if you notice suspicious activity</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecuritySection;
