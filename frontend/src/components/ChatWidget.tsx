import React, { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import { MessageCircle, Send, X, HelpCircle, FileText } from "lucide-react";
import { getApiBaseUrl } from "../config/api";

interface ChatMessage {
  id: number;
  type: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
  createdAt: Date;
}

interface FAQEntry {
  id: number;
  question: string;
  answer: string;
  category: string;
  tags: string[];
}

interface ChatSession {
  id: number;
  sessionId: string;
  userId?: number;
  userEmail?: string;
  userName?: string;
  status: string;
  lastActivity: Date;
  messages: ChatMessage[];
}

const ChatWidget: React.FC = () => {
  const { user, isSignedIn } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [faqEntries, setFaqEntries] = useState<FAQEntry[]>([]);
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({
    subject: "",
    message: "",
    category: "GENERAL",
  });
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize chat session when widget opens
  useEffect(() => {
    if (isOpen && !session) {
      initializeChatSession();
      loadSuggestedQuestions();
    }
  }, [isOpen]);

  const initializeChatSession = async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/chat/session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userEmail: isSignedIn
            ? user?.primaryEmailAddress?.emailAddress
            : undefined,
          userName: isSignedIn ? user?.fullName : undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSession(data.data);
        setMessages(data.data.messages || []);
      }
    } catch (error) {
      console.error("Error initializing chat session:", error);
    }
  };

  const loadSuggestedQuestions = async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/chat/faq/suggested`);
      if (response.ok) {
        const data = await response.json();
        setFaqEntries(data.data);
      }
    } catch (error) {
      console.error("Error loading suggested questions:", error);
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || !session) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      type: "USER",
      content: content.trim(),
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Add message to session
      await fetch(
        `${getApiBaseUrl()}/chat/session/${session.sessionId}/message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: content.trim(),
            type: "USER",
          }),
        }
      );

      // Simulate typing indicator and response
      setTimeout(() => {
        const botMessage: ChatMessage = {
          id: Date.now() + 1,
          type: "ASSISTANT",
          content:
            "Thank you for your message. I'll get back to you soon. In the meantime, feel free to check our FAQ section for quick answers.",
          createdAt: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      console.error("Error sending message:", error);
      setIsLoading(false);
    }
  };

  const handleFAQClick = async (faq: FAQEntry) => {
    // Increment view count
    try {
      await fetch(`${getApiBaseUrl()}/chat/faq/${faq.id}/view`, {
        method: "POST",
      });
    } catch (error) {
      console.error("Error incrementing FAQ view count:", error);
    }

    const botMessage: ChatMessage = {
      id: Date.now(),
      type: "ASSISTANT",
      content: `**${faq.question}**\n\n${faq.answer}`,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, botMessage]);
    setShowInquiryForm(false);
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryForm.subject.trim() || !inquiryForm.message.trim()) return;

    setIsSubmittingInquiry(true);

    try {
      const response = await fetch(`${getApiBaseUrl()}/chat/inquiry`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: session?.id,
          userEmail: isSignedIn
            ? user?.primaryEmailAddress?.emailAddress
            : "guest@example.com",
          userName: isSignedIn ? user?.fullName : "Guest User",
          subject: inquiryForm.subject.trim(),
          message: inquiryForm.message.trim(),
          category: inquiryForm.category,
        }),
      });

      if (response.ok) {
        const botMessage: ChatMessage = {
          id: Date.now(),
          type: "ASSISTANT",
          content:
            "Thank you for your inquiry! We've received your message and will get back to you via email within 24 hours.",
          createdAt: new Date(),
        };

        setMessages((prev) => [...prev, botMessage]);
        setShowInquiryForm(false);
        setInquiryForm({ subject: "", message: "", category: "GENERAL" });
      }
    } catch (error) {
      console.error("Error submitting inquiry:", error);
    } finally {
      setIsSubmittingInquiry(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputMessage);
    }
  };

  const toggleWidget = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
    }
  };

  const minimizeWidget = () => {
    setIsMinimized(!isMinimized);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={toggleWidget}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-110"
          aria-label="Open chat"
        >
          <MessageCircle size={24} />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={`bg-white rounded-lg shadow-2xl border border-gray-200 transition-all duration-300 ${
          isMinimized ? "w-80 h-12" : "w-96 h-[500px]"
        }`}
      >
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageCircle size={20} />
            <span className="font-semibold">Customer Support</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={minimizeWidget}
              className="hover:bg-blue-700 p-1 rounded transition-colors"
            >
              <X size={16} />
            </button>
            <button
              onClick={toggleWidget}
              className="hover:bg-blue-700 p-1 rounded transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto h-80">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <MessageCircle
                    size={32}
                    className="mx-auto mb-2 text-gray-300"
                  />
                  <p>How can we help you today?</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.type === "USER"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs px-3 py-2 rounded-lg ${
                          message.type === "USER"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <div className="whitespace-pre-wrap">
                          {message.content}
                        </div>
                        <div
                          className={`text-xs mt-1 ${
                            message.type === "USER"
                              ? "text-blue-100"
                              : "text-gray-500"
                          }`}
                        >
                          {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg">
                        <div className="flex items-center space-x-1">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-500 ml-2">
                            Typing...
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* FAQ Suggestions or Inquiry Form */}
            {!showInquiryForm && messages.length === 0 && (
              <div className="p-4 border-t border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <HelpCircle size={16} className="mr-2" />
                  Quick Questions
                </h4>
                <div className="space-y-2">
                  {faqEntries.slice(0, 4).map((faq) => (
                    <button
                      key={faq.id}
                      onClick={() => handleFAQClick(faq)}
                      className="w-full text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded transition-colors"
                    >
                      {faq.question}
                    </button>
                  ))}
                  <button
                    onClick={() => setShowInquiryForm(true)}
                    className="w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors flex items-center"
                  >
                    <FileText size={14} className="mr-2" />
                    Ask a different question
                  </button>
                </div>
              </div>
            )}

            {/* Inquiry Form */}
            {showInquiryForm && (
              <div className="p-4 border-t border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <FileText size={16} className="mr-2" />
                  Submit Your Question
                </h4>
                <form onSubmit={handleInquirySubmit} className="space-y-3">
                  <input
                    type="text"
                    placeholder="Subject"
                    value={inquiryForm.subject}
                    onChange={(e) =>
                      setInquiryForm((prev) => ({
                        ...prev,
                        subject: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <select
                    value={inquiryForm.category}
                    onChange={(e) =>
                      setInquiryForm((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="GENERAL">General</option>
                    <option value="TECHNICAL">Technical</option>
                    <option value="PAYMENT">Payment</option>
                    <option value="RETURNS">Returns</option>
                    <option value="SHIPPING">Shipping</option>
                    <option value="PRODUCT_INFORMATION">
                      Product Information
                    </option>
                    <option value="OTHER">Other</option>
                  </select>
                  <textarea
                    placeholder="Your message"
                    value={inquiryForm.message}
                    onChange={(e) =>
                      setInquiryForm((prev) => ({
                        ...prev,
                        message: e.target.value,
                      }))
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    required
                  />
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      disabled={isSubmittingInquiry}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {isSubmittingInquiry ? "Sending..." : "Submit"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowInquiryForm(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Input Area */}
            {!showInquiryForm && (
              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  <button
                    onClick={() => sendMessage(inputMessage)}
                    disabled={!inputMessage.trim() || isLoading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChatWidget;
