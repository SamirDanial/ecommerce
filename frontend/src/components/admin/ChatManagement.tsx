import React, { useState, useEffect } from "react";
import {
  MessageCircle,
  FileText,
  Users,
  Eye,
  X,
  BarChart3,
  AlertCircle,
} from "lucide-react";
import { getApiBaseUrl } from "../../config/api";
import { useClerkAuth } from "../../hooks/useClerkAuth";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";

interface ChatSession {
  id: number;
  sessionId: string;
  userId: number | null;
  userEmail: string | null;
  userName: string | null;
  status: string;
  lastActivity: Date;
  messages: Array<{
    id: number;
    content: string;
    type: string;
    createdAt: Date;
  }>;
}

interface CustomerInquiry {
  id: number;
  sessionId: number | null;
  userId: number | null;
  userEmail: string;
  userName: string;
  subject: string;
  message: string;
  category: string;
  priority: string;
  status: string;
  createdAt: Date;
}

const ChatManagement: React.FC = () => {
  const { getToken } = useClerkAuth();
  const [activeTab, setActiveTab] = useState<"sessions" | "inquiries">(
    "sessions"
  );
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [inquiries, setInquiries] = useState<CustomerInquiry[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(
    null
  );

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      if (activeTab === "sessions") {
        const response = await fetch(`${getApiBaseUrl()}/admin/chat/sessions`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (response.ok) {
          const data = await response.json();
          setSessions(data.data);
        }
      } else {
        const response = await fetch(
          `${getApiBaseUrl()}/admin/chat/inquiries`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setInquiries(data.data);
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-2 sm:p-3 md:p-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-indigo-600/20 rounded-xl sm:rounded-2xl md:rounded-3xl blur-3xl group-hover:blur-2xl transition-all duration-700"></div>
          <div className="relative bg-white/80 backdrop-blur-2xl rounded-xl sm:rounded-2xl md:rounded-3xl p-2 sm:p-4 md:p-8 border border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-500">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="p-3 bg-gradient-to-br from-purple-500 via-blue-600 to-indigo-600 rounded-2xl shadow-lg">
                      <MessageCircle className="w-7 h-7 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      Chat Management
                    </h1>
                    <p className="text-slate-600 text-sm sm:text-base font-medium">
                      Monitor customer chat sessions and manage support
                      inquiries
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
        <Card>
          <CardContent className="p-4 sm:p-5 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Sessions
                </p>
                <p className="text-xl sm:text-2xl font-bold text-blue-600">
                  {sessions.length}
                </p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-5 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Inquiries
                </p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">
                  {inquiries.length}
                </p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-5 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  High Priority
                </p>
                <p className="text-xl sm:text-2xl font-bold text-red-600">
                  {inquiries.filter((i) => i.priority === "HIGH").length}
                </p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-5 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-xl sm:text-2xl font-bold text-yellow-600">
                  {inquiries.filter((i) => i.status === "PENDING").length}
                </p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("sessions")}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === "sessions"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center space-x-2">
              <MessageCircle size={16} />
              <span>Active Sessions ({sessions.length})</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("inquiries")}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === "inquiries"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center space-x-2">
              <FileText size={16} />
              <span>Customer Inquiries ({inquiries.length})</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Content Area */}
      <div className="space-y-6">
        {/* Sessions Tab */}
        {activeTab === "sessions" && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Active Chat Sessions
              </h2>
            </div>

            {sessions.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No active chat sessions
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {sessions.map((session) => (
                  <div key={session.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900">
                          {session.userName || "Guest User"}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {session.userEmail || "No email"}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center">
                            <MessageCircle className="w-3 h-3 mr-1" />
                            {session.messages.length} messages
                          </span>
                          <span className="flex items-center">
                            <FileText className="w-3 h-3 mr-1" />
                            Last active:{" "}
                            {new Date(
                              session.lastActivity
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={() => setSelectedSession(session)}
                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        <Eye size={14} className="mr-2" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Inquiries Tab */}
        {activeTab === "inquiries" && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Customer Inquiries
              </h2>
            </div>

            {inquiries.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No inquiries found
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {inquiries.map((inquiry) => (
                  <div
                    key={inquiry.id}
                    className="p-6 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {inquiry.subject}
                          </h3>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              inquiry.priority === "HIGH"
                                ? "bg-red-100 text-red-800"
                                : inquiry.priority === "MEDIUM"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {inquiry.priority}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {inquiry.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          From:{" "}
                          <span className="font-medium">
                            {inquiry.userName}
                          </span>{" "}
                          ({inquiry.userEmail})
                        </p>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <p className="text-sm text-gray-800 leading-relaxed">
                            {inquiry.message}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                          <span className="flex items-center">
                            <FileText className="w-3 h-3 mr-1" />
                            {new Date(inquiry.createdAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center">
                            <Users className="w-3 h-3 mr-1" />
                            Status: {inquiry.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Session Detail Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-6 border-0 w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2 shadow-2xl rounded-lg bg-white">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Chat Session Details
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  User: {selectedSession.userName || "Guest User"}
                  {selectedSession.userEmail && (
                    <span className="ml-2">({selectedSession.userEmail})</span>
                  )}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Session ID: {selectedSession.sessionId}
                </p>
              </div>
              <button
                onClick={() => setSelectedSession(null)}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto mb-6 p-4 bg-gray-50 rounded-lg border">
              <div className="space-y-4">
                {selectedSession.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.type === "USER" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs px-4 py-3 rounded-lg shadow-sm ${
                        message.type === "USER"
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-800 border border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium opacity-75">
                          {message.type === "USER" ? "Customer" : "Assistant"}
                        </span>
                        <span className="text-xs opacity-75">
                          {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">
                        {message.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-200">
              <Button
                onClick={() => setSelectedSession(null)}
                className="px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 font-medium"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatManagement;
