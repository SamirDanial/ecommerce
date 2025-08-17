import React from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  Sparkles, 
  ShoppingBag, 
  Star, 
  Zap,
  ArrowRight,
  Gift,
  Heart,
  Shield
} from "lucide-react";

interface CategoryBannerProps {
  categoryName: string;
  productCount: number;
  categoryDescription?: string;
}

export const CategoryBanner: React.FC<CategoryBannerProps> = ({
  categoryName,
  productCount,
  categoryDescription
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl shadow-2xl mb-8 min-h-[240px]">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
        <div className="absolute top-1/2 right-0 w-24 h-24 bg-white rounded-full translate-x-12 -translate-y-12"></div>
        <div className="absolute bottom-0 left-1/4 w-20 h-20 bg-white rounded-full -translate-x-10 translate-y-10"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-4 right-8 animate-bounce">
        <Sparkles className="h-8 w-8 text-yellow-300" />
      </div>
      <div className="absolute bottom-4 left-8 animate-pulse">
        <Gift className="h-6 w-6 text-pink-300" />
      </div>
      <div className="absolute top-1/2 left-4 animate-float">
        <Heart className="h-5 w-5 text-red-300" />
      </div>

      <div className="relative px-6 py-4 text-white">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-4">
            <Badge 
              variant="secondary" 
              className="mb-2 bg-white/20 text-white border-white/30 hover:bg-white/30 transition-all duration-300"
            >
              <Zap className="h-3 w-3 mr-2" />
              {productCount} Products Available
            </Badge>
            
            <h2 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
              Discover Amazing {categoryName}
            </h2>
            
            <p className="text-base md:text-lg text-blue-100 mb-3 max-w-2xl mx-auto">
              {categoryDescription || `Explore our curated collection of ${categoryName.toLowerCase()}. Find the perfect style that matches your personality and taste.`}
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className="text-center group">
              <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/20 group-hover:bg-white/20 transition-all duration-300">
                <ShoppingBag className="h-6 w-6 mx-auto mb-2 text-green-300" />
                <h3 className="text-sm font-semibold mb-1">Premium Quality</h3>
                <p className="text-blue-100 text-xs">Handcrafted excellence</p>
              </div>
            </div>
            
            <div className="text-center group">
              <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/20 group-hover:bg-white/20 transition-all duration-300">
                <Star className="h-6 w-6 mx-auto mb-2 text-yellow-300" />
                <h3 className="text-sm font-semibold mb-1">Customer Favorites</h3>
                <p className="text-blue-100 text-xs">Highly rated items</p>
              </div>
            </div>
            
            <div className="text-center group">
              <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/20 group-hover:bg-white/20 transition-all duration-300">
                <Shield className="h-6 w-6 mx-auto mb-2 text-blue-300" />
                <h3 className="text-sm font-semibold mb-1">Fast Delivery</h3>
                <p className="text-blue-100 text-xs">Quick & secure</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-bold px-6 py-3 text-base rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 group"
              >
                <ShoppingBag className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                Shop {categoryName}
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="border-white/30 text-black bg-white hover:bg-gray-100 hover:text-gray-900 font-semibold px-5 py-3 text-base rounded-xl backdrop-blur-sm transition-all duration-300"
                onClick={() => navigate('/categories')}
              >
                View All Categories
              </Button>
            </div>
            
            <p className="text-blue-100 text-xs mt-2 opacity-80">
              Join thousands of satisfied customers in the {categoryName.toLowerCase()} category
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Wave Effect */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white/10 to-transparent"></div>
    </div>
  );
};
