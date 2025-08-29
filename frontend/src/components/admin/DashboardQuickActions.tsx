import React from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  ShoppingCart,
  Users,
  Package,
  Star,
  MessageCircle,
  BarChart3,
  Settings,
} from "lucide-react";

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
  bgColor: string;
}

const QuickAction: React.FC<QuickActionProps> = ({
  title,
  description,
  icon,
  href,
  color,
  bgColor,
}) => {
  return (
    <Link
      to={href}
      className="block p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 hover:scale-105 group"
    >
      <div className="flex items-center space-x-4">
        <div
          className={`p-3 rounded-xl ${bgColor} group-hover:scale-110 transition-transform duration-200`}
        >
          <div className={`w-8 h-8 ${color}`}>{icon}</div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        <div className="text-gray-400 group-hover:text-blue-500 transition-colors">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
};

export const DashboardQuickActions: React.FC = () => {
  const actions = [
    {
      title: "Add Product",
      description: "Create a new product listing",
      icon: <Plus className="w-8 h-8" />,
      href: "/admin/products",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "View Orders",
      description: "Manage customer orders",
      icon: <ShoppingCart className="w-8 h-8" />,
      href: "/admin/orders",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Manage Users",
      description: "View and manage customers",
      icon: <Users className="w-8 h-8" />,
      href: "/admin/customers",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Product Catalog",
      description: "Browse all products",
      icon: <Package className="w-8 h-8" />,
      href: "/admin/products",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Reviews",
      description: "Manage product reviews",
      icon: <Star className="w-8 h-8" />,
      href: "/admin/reviews",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Chat Management",
      description: "Handle customer inquiries",
      icon: <MessageCircle className="w-8 h-8" />,
      href: "/admin/chat",
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
    {
      title: "Analytics",
      description: "View detailed reports",
      icon: <BarChart3 className="w-8 h-8" />,
      href: "/admin/analytics",
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
    {
      title: "Settings",
      description: "Configure system options",
      icon: <Settings className="w-8 h-8" />,
      href: "/admin/localization",
      color: "text-gray-600",
      bgColor: "bg-gray-100",
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        <p className="text-sm text-gray-600 mt-1">
          Access common admin functions quickly
        </p>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((action, index) => (
            <QuickAction key={index} {...action} />
          ))}
        </div>
      </div>
    </div>
  );
};
