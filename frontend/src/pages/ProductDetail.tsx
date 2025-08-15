import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Product } from '../types';
import { productService } from '../services/api';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ImageWithPlaceholder } from '../components/ui/image-with-placeholder';
import WishlistButton from '../components/WishlistButton';
import { useUserInteractionStore } from '../stores/userInteractionStore';
import { useClerkAuth } from '../hooks/useClerkAuth';
import { useCartStore } from '../stores/cartStore';
import { 
  Star, 
  ShoppingCart, 
  Share2, 
  Truck, 
  RotateCcw, 
  Shield, 
  ChevronRight,
  Minus,
  Plus,
  Zap,
  TrendingUp,
  ThumbsUp,
  MessageSquare,
  Flag,
  Check,
  Trash2,
  Clock,
  Edit
} from 'lucide-react';
import ProductImageGallery from '../components/ProductImageGallery';
import SizeChart from '../components/SizeChart';
import FrequentlyBoughtTogether from '../components/FrequentlyBoughtTogether';
import { RecentlyViewedProducts } from '../components/RecentlyViewedProducts';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { toast } from 'sonner';
import { reviewService } from '../services/reviewService';
import UserAvatar from '../components/UserAvatar';

const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [activeTab, setActiveTab] = useState('description');
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [showAddedToCart, setShowAddedToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  
  // Review and Q&A form states
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<number | null>(null);
  const [showReplyDeleteConfirmDialog, setShowReplyDeleteConfirmDialog] = useState(false);
  const [replyToDelete, setReplyToDelete] = useState<number | null>(null);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reviewToReport, setReviewToReport] = useState<number | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [selectedReportReason, setSelectedReportReason] = useState<string>('');
  const [replyingToReview, setReplyingToReview] = useState<number | null>(null);
  const [replyForm, setReplyForm] = useState({ reply: '' });
  const [replies, setReplies] = useState<{ [reviewId: number]: any[] }>({});
  const [repliesLoading, setRepliesLoading] = useState<{ [reviewId: number]: boolean }>({});
  const [expandedReplies, setExpandedReplies] = useState<{ [reviewId: number]: boolean }>({});
  const [helpfulInteractions, setHelpfulInteractions] = useState<{ [reviewId: number]: { count: number; isHelpful: boolean } }>({});
  const [reportInteractions, setReportInteractions] = useState<{ [reviewId: number]: { isReported: boolean } }>({});
  const [editingReplyId, setEditingReplyId] = useState<number | null>(null);
  const [editReplyForm, setEditReplyForm] = useState({ reply: '' });
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    comment: ''
  });
  const [questionForm, setQuestionForm] = useState({
    question: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  
  // Hover rating state for better UX
  const [hoverRating, setHoverRating] = useState(0);
  
  // User's pending submissions (only visible to them)
  const [userPendingReviews, setUserPendingReviews] = useState<any[]>([]);
  const [userPendingQuestions, setUserPendingQuestions] = useState<any[]>([]);
  
  // Reviews state for authenticated users (includes pending + approved)
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsTotal, setReviewsTotal] = useState(0);
  const [reviewsTotalPages, setReviewsTotalPages] = useState(0);
  const [hasMoreReviews, setHasMoreReviews] = useState(true);
  const [reviewsLoadingMore, setReviewsLoadingMore] = useState(false);
  
  // Editing states
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
  const [editReviewForm, setEditReviewForm] = useState({
    rating: 5,
    title: '',
    comment: ''
  });
  const [editQuestionForm, setEditQuestionForm] = useState({
    question: ''
  });
  
  // Current user's database ID for comparison
  const [currentUserDbId, setCurrentUserDbId] = useState<number | null>(null);
  
  // Track if current user has already reviewed this product
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  
  // Review filters and sorting
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'helpful'>('recent');
  const [filtersLoading, setFiltersLoading] = useState(false);
  
  // State to track if Reviews tab has been clicked (for lazy loading)
  const [reviewsTabClicked, setReviewsTabClicked] = useState(false);
  
  const { addToRecentlyViewed, addInteraction } = useUserInteractionStore();
  const { isAuthenticated, getToken, user } = useClerkAuth();
  const { addToCart, removeFromCart, isInCart, getItemQuantity, updateQuantity, isProductInCart: isProductInCartAnyVariant } = useCartStore();

  // Utility function to format dates
  const formatDate = (dateString: string | Date): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Recently';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Recently';
    }
  };

  // Check if current product variant is in cart
  const isProductInCart = product ? isInCart(product.id, selectedColor, selectedSize) : false;
  // Check if product exists in cart regardless of variants
  const isProductInCartAnyVariantCheck = product ? isProductInCartAnyVariant(product.id) : false;
  const cartItemQuantity = product ? getItemQuantity(product.id, selectedColor, selectedSize) : 0;

  // Update local quantity when cart quantity changes or variants change
  useEffect(() => {
    if (isProductInCart && cartItemQuantity > 0) {
      setQuantity(cartItemQuantity);
    } else {
      setQuantity(1);
    }
  }, [isProductInCart, cartItemQuantity, selectedColor, selectedSize]);

  // Reset success state when variants change
  useEffect(() => {
    setShowAddedToCart(false);
  }, [selectedColor, selectedSize]);

  // Scroll to top when component mounts or slug changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Function to fetch current user's database ID
  const fetchCurrentUserDbId = useCallback(async () => {
    if (!isAuthenticated) {
      setCurrentUserDbId(null);
      return;
    }

    try {
      const token = await getToken();
      if (token) {
        const response = await reviewService.getCurrentUser(token);
        if (response.success) {
          setCurrentUserDbId(response.user.id);
          
          // Check if user has already reviewed this product
          if (reviews.length > 0) {
            const userReview = reviews.find((r: any) => r.userId === response.user.id);
            setUserHasReviewed(!!userReview);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch current user:', error);
    }
  }, [isAuthenticated, getToken, reviews]);

  const fetchHelpfulInteractions = useCallback(async (reviewId: number) => {
    if (!isAuthenticated) return;

    try {
      const token = await getToken();
      if (token) {
        const response = await reviewService.getReviewInteractions(reviewId, token);
        if (response.success) {
          setHelpfulInteractions(prev => ({
            ...prev,
            [reviewId]: {
              count: response.helpfulCount,
              isHelpful: response.isHelpful
            }
          }));
          
          setReportInteractions(prev => ({
            ...prev,
            [reviewId]: {
              isReported: response.isReported
            }
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching review interactions:', error);
    }
  }, [isAuthenticated, getToken]);



  // Function to fetch reviews (with pending if authenticated)
  const fetchReviews = useCallback(async (page: number = 1, append: boolean = false) => {
    if (!product) return;
    if (append) {
      setReviewsLoadingMore(true);
    } else {
      setReviewsLoading(true);
    }
    
    try {
      let response: any = null;
      if (isAuthenticated) {
        const token = await getToken();
        if (token) {
          response = await reviewService.getProductReviewsWithPending(
            product.id,
            token,
            page,
            10,
            selectedRating || undefined,
            sortBy === 'helpful' ? 'helpful' : undefined
          );
        }
      } else {
        response = await reviewService.getProductReviews(
          product.id,
          page,
          10,
          selectedRating || undefined,
          sortBy === 'helpful' ? 'helpful' : undefined
        );
      }
      
      if (!response) return;
      
      if (response.success) {
        if (append) {
          // Append new reviews for infinite scroll
          setReviews(prev => [...prev, ...response.reviews]);
        } else {
          // Replace reviews for initial load or page change
          setReviews(response.reviews);
        }
        setReviewsTotal(response.total);
        setReviewsTotalPages(response.totalPages);
        setReviewsPage(response.page);
        setHasMoreReviews(page < response.totalPages);
        
        // Also set pending reviews for backward compatibility
        setUserPendingReviews(response.reviews.filter((r: any) => r.status === 'PENDING'));
        
        // Check if current user has already reviewed this product
        if (currentUserDbId) {
          const userReview = response.reviews.find((r: any) => r.userId === currentUserDbId);
          setUserHasReviewed(!!userReview);
        }
        
        // Clear expanded replies and helpful interactions when reviews change
        if (!append) {
          setExpandedReplies({});
          setHelpfulInteractions({});
        }
        
        // Don't fetch replies automatically - only fetch when needed
        // This improves performance by avoiding unnecessary API calls
        
        // Fetch helpful interactions for new reviews only (only when tab is clicked)
        if (reviewsTabClicked) {
          response.reviews.forEach((review: any) => {
            fetchHelpfulInteractions(review.id);
          });
        }
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      if (append) {
        setReviewsLoadingMore(false);
      } else {
        setReviewsLoading(false);
      }
      setFiltersLoading(false);
    }
  }, [isAuthenticated, product, getToken, fetchHelpfulInteractions, currentUserDbId, selectedRating, sortBy, reviewsTabClicked]);

  const loadMoreReviews = useCallback(async () => {
    if (hasMoreReviews && !reviewsLoadingMore && !reviewsLoading) {
      await fetchReviews(reviewsPage + 1, true);
    }
  }, [hasMoreReviews, reviewsLoadingMore, reviewsLoading, reviewsPage, fetchReviews]);

  // Handle rating filter change
  const handleRatingFilter = useCallback((rating: number | null) => {
    setSelectedRating(rating);
    setReviewsPage(1); // Reset to first page
    setHasMoreReviews(true); // Reset pagination
    setFiltersLoading(true);
    // Clear expanded replies and helpful interactions when filters change
    setExpandedReplies({});
    setHelpfulInteractions({});
  }, []);

  // Handle sort change
  const handleSortChange = useCallback((sort: 'recent' | 'helpful') => {
    setSortBy(sort);
    setReviewsPage(1); // Reset to first page
    setHasMoreReviews(true); // Reset pagination
    setFiltersLoading(true);
    // Clear expanded replies and helpful interactions when filters change
    setExpandedReplies({});
    setHelpfulInteractions({});
  }, []);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setSelectedRating(null);
    setSortBy('recent');
    setReviewsPage(1);
    setHasMoreReviews(true);
    setFiltersLoading(true);
    // Clear expanded replies and helpful interactions when filters are reset
    setExpandedReplies({});
    setHelpfulInteractions({});
  }, []);

  // Lazy loading: Only load reviews when Reviews tab is clicked
  const handleReviewsTabClick = useCallback(() => {
    if (!reviewsTabClicked) {
      setReviewsTabClicked(true);
      fetchReviews(1);
    }
  }, [reviewsTabClicked, fetchReviews]);

  // Debounced filter effect to prevent rapid API calls (only when tab is clicked)
  useEffect(() => {
    if (!product || !reviewsTabClicked) return;
    
    const timer = setTimeout(() => {
      fetchReviews(1);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [selectedRating, sortBy, product, fetchReviews, reviewsTabClicked]);

  // Intersection Observer for infinite scroll (only when Reviews tab is clicked)
  useEffect(() => {
    if (!hasMoreReviews || reviewsLoadingMore || !reviewsTabClicked) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadMoreReviews();
          }
        });
      },
      {
        rootMargin: '100px', // Start loading when 100px away from bottom
        threshold: 0.1
      }
    );

    // Observe the last review element for infinite scroll
    const lastReviewElement = document.querySelector('[data-review-item]:last-child');
    if (lastReviewElement) {
      observer.observe(lastReviewElement);
    }

    return () => {
      if (lastReviewElement) {
        observer.unobserve(lastReviewElement);
      }
    };
  }, [hasMoreReviews, reviewsLoadingMore, loadMoreReviews, reviews, reviewsTabClicked]);



  // Function to refetch pending items (for backward compatibility)
  const refetchPendingItems = useCallback(async () => {
    if (isAuthenticated && product) {
      try {
        const token = await getToken();
        if (token) {
          const response = await reviewService.getProductPendingItems(product.id, token);
          if (response.success) {
            setUserPendingQuestions(response.pendingQuestions);
          }
        }
      } catch (error) {
        console.error('Failed to load pending items:', error);
      }
    }
  }, [isAuthenticated, product, getToken]);



  // Fetch current user's database ID when authentication status changes
  useEffect(() => {
    fetchCurrentUserDbId();
  }, [fetchCurrentUserDbId]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        const data = await productService.getBySlug(slug);
        setProduct(data);
        
        // Track product view
        addToRecentlyViewed(data);
        addInteraction({
          type: 'product_view',
          targetId: data.id.toString(),
          targetType: 'product',
          data: { slug: data.slug, name: data.name }
        });
        
        // Set default color and size
        if (data.variants && data.variants.length > 0) {
          const firstVariant = data.variants[0];
          setSelectedColor(firstVariant.color);
          setSelectedSize(firstVariant.size);
        }

        // Fetch related products
        try {
          const related = await productService.getRelated(data.id);
          setRelatedProducts(related);
        } catch (err) {
          console.error('Error fetching related products:', err);
        }
      } catch (err) {
        setError('Failed to fetch product details');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug, addToRecentlyViewed, addInteraction]);

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    
    // Reset size selection if the new color doesn't have the currently selected size
    if (product) {
      const colorVariants = product.variants?.filter(v => v.color === color) || [];
      const availableSizesForColor = Array.from(new Set(colorVariants.map(v => v.size)));
      
      if (!availableSizesForColor.includes(selectedSize as any)) {
        setSelectedSize(availableSizesForColor[0] || '');
      }
    }
  };

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = Math.max(1, quantity + change);
    setQuantity(newQuantity);
  };

  const handleAddToCart = () => {
    if (product && selectedColor && selectedSize) {
      if (isProductInCart) {
        // Update existing cart item quantity
        updateQuantity(product.id, quantity, selectedColor, selectedSize);
        
        addInteraction({
          type: 'cart_add',
          targetId: product.id.toString(),
          targetType: 'product',
          data: { 
            productName: product.name, 
            quantity,
            action: 'quantity_updated',
            color: selectedColor, 
            size: selectedSize 
          }
        });
      } else if (isProductInCartAnyVariantCheck) {
        // Product is in cart without variants, remove it and add with variants
        // First, find and remove the variant-less version
        const cartItems = useCartStore.getState().items;
        const variantLessItem = cartItems.find(item => 
          item.id === product.id && 
          !item.selectedColor && 
          !item.selectedSize
        );
        
        if (variantLessItem) {
          removeFromCart(product.id, undefined, undefined);
        }
        
        // Now add the product with selected variants
        addToCart(product, quantity, selectedColor, selectedSize);
        
        addInteraction({
          type: 'cart_add',
          targetId: product.id.toString(),
          targetType: 'product',
          data: { 
            productName: product.name, 
            quantity, 
            color: selectedColor, 
            size: selectedSize,
            action: 'variant_added'
          }
        });
      } else {
        // Add new item to cart
        addToCart(product, quantity, selectedColor, selectedSize);
        
        addInteraction({
          type: 'cart_add',
          targetId: product.id.toString(),
          targetType: 'product',
          data: { 
            productName: product.name, 
            quantity, 
            color: selectedColor, 
            size: selectedSize 
          }
        });
      }
      
      // Show success state
      setShowAddedToCart(true);
      setTimeout(() => setShowAddedToCart(false), 3000);
    } else {
      // Show error for missing selection
      // You could add a toast notification here later
    }
  };

  const handleRemoveFromCart = () => {
    if (product && selectedColor && selectedSize) {
      removeFromCart(product.id, selectedColor, selectedSize);
      
      // Track interaction
      addInteraction({
        type: 'cart_remove',
        targetId: product.id.toString(),
        targetType: 'product',
        data: { 
          productName: product.name, 
          color: selectedColor, 
          size: selectedSize 
        }
      });
      
      // Reset quantity to 1 and show removed state briefly
      setQuantity(1);
      setShowAddedToCart(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
        // You could add a toast notification here
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      if (product) {
        navigator.clipboard.writeText(window.location.href);
        // You could add a toast notification here
      }
    }
  };

  const handleReviewSubmit = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to submit a review');
      return;
    }

    if (!reviewForm.title.trim() || !reviewForm.comment.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setSubmittingReview(true);
    try {
      const token = await getToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      // Submit review to backend
      const response = await reviewService.submitReview({
        productId: product!.id,
        rating: reviewForm.rating,
        title: reviewForm.title,
        comment: reviewForm.comment
      }, token);

      if (response.success) {
              // Reset form and close dialog
      setReviewForm({ rating: 5, title: '', comment: '' });
      setHoverRating(0);
      setShowReviewDialog(false);
      // Cancel any active edit or reply
      setEditingReviewId(null);
      setReplyingToReview(null);
      setEditReviewForm({ rating: 5, title: '', comment: '' });
      setReplyForm({ reply: '' });
        
        // Refresh reviews to show the new review immediately
        await fetchReviews(1);
        
        // Update user review status
        setUserHasReviewed(true);
        
        toast.success('Review submitted successfully! It will be visible after approval.');
        
        // Track interaction
        addInteraction({
          type: 'review_submit',
          targetId: product!.id.toString(),
          targetType: 'product',
          data: { rating: reviewForm.rating, title: reviewForm.title }
        });
      } else {
        toast.error(response.message || 'Failed to submit review');
      }

    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleQuestionSubmit = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to ask a question');
      return;
    }

    if (!questionForm.question.trim()) {
      toast.error('Please enter your question');
      return;
    }

    setSubmittingQuestion(true);
    try {
      const token = await getToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      // Submit question to backend
      const response = await reviewService.submitQuestion({
        productId: product!.id,
        question: questionForm.question
      }, token);

      if (response.success) {
              // Reset form and close dialog
      setQuestionForm({ question: '' });
      setShowQuestionDialog(false);
      // Cancel any active edit or reply
      setEditingReviewId(null);
      setReplyingToReview(null);
      setEditReviewForm({ rating: 5, title: '', comment: '' });
      setReplyForm({ reply: '' });
      setHoverRating(0);
        
        // Refresh reviews to show the new question immediately
        await fetchReviews(1);
        
        toast.success('Question submitted successfully! It will be visible after approval.');
        
        // Track interaction
        addInteraction({
          type: 'question_submit',
          targetId: product!.id.toString(),
          targetType: 'product',
          data: { question: questionForm.question }
        });
      } else {
        toast.error(response.message || 'Failed to submit question');
      }

    } catch (error) {
      console.error('Error submitting question:', error);
      toast.error('Failed to submit question. Please try again.');
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const handleEditReview = async (reviewId: number, updatedData: { rating: number; title: string; comment: string }) => {
    try {
      const token = await getToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await reviewService.updateReview(reviewId, {
        productId: product!.id,
        ...updatedData
      }, token);

      if (response.success) {
        // Refresh reviews to show the updated review immediately
        await fetchReviews(1);
        toast.success('Review updated successfully!');
        // Cancel any active reply
        setReplyingToReview(null);
        setReplyForm({ reply: '' });
      } else {
        toast.error(response.message || 'Failed to update review');
      }
    } catch (error) {
      console.error('Error updating review:', error);
      toast.error('Failed to update review. Please try again.');
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    setReviewToDelete(reviewId);
    setShowDeleteConfirmDialog(true);
    // Cancel any active edit or reply
    setEditingReviewId(null);
    setReplyingToReview(null);
    setEditReviewForm({ rating: 5, title: '', comment: '' });
    setReplyForm({ reply: '' });
    setHoverRating(0);
  };

  const confirmDeleteReview = async () => {
    if (!reviewToDelete) return;

    try {
      const token = await getToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await reviewService.deleteReview(reviewToDelete, token);

      if (response.success) {
        // Refresh reviews to show the updated list immediately
        await fetchReviews(1);
        
        // Update user review status
        setUserHasReviewed(false);
        
        toast.success('Review deleted successfully!');
      } else {
        toast.error(response.message || 'Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review. Please try again.');
    } finally {
      setShowDeleteConfirmDialog(false);
      setReviewToDelete(null);
      // Cancel any active edit or reply
      setEditingReviewId(null);
      setReplyingToReview(null);
      setEditReviewForm({ rating: 5, title: '', comment: '' });
      setReplyForm({ reply: '' });
      setHoverRating(0);
    }
  };

  const startReply = (reviewId: number) => {
    setReplyingToReview(reviewId);
    setEditingReviewId(null);
    setReplyForm({ reply: '' });
    setEditReviewForm({ rating: 5, title: '', comment: '' });
    setHoverRating(0);
  };

  const cancelReply = () => {
    setReplyingToReview(null);
    setEditingReviewId(null);
    setReplyForm({ reply: '' });
    setEditReviewForm({ rating: 5, title: '', comment: '' });
    setHoverRating(0);
  };

  const startEditingReply = (replyId: number, currentReply: string) => {
    setEditingReplyId(replyId);
    setEditReplyForm({ reply: currentReply });
    setReplyingToReview(null);
    setEditingReviewId(null);
  };

  const cancelEditReply = () => {
    setEditingReplyId(null);
    setEditReplyForm({ reply: '' });
  };

  const submitEditReply = async () => {
    if (!editReplyForm.reply.trim() || !editingReplyId) {
      toast.error('Please enter a reply');
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await reviewService.updateReply(editingReplyId, editReplyForm.reply, token);

      if (response.success) {
        toast.success('Reply updated successfully!');
        setEditingReplyId(null);
        setEditReplyForm({ reply: '' });
        
        // Refresh replies for all reviews
        Object.keys(replies).forEach(reviewId => {
          fetchReplies(parseInt(reviewId));
        });
      } else {
        toast.error(response.message || 'Failed to update reply');
      }
    } catch (error) {
      console.error('Error updating reply:', error);
      toast.error('Failed to update reply. Please try again.');
    }
  };

  const handleDeleteReply = async (replyId: number) => {
    setReplyToDelete(replyId);
    setShowReplyDeleteConfirmDialog(true);
  };

  const fetchReplies = async (reviewId: number) => {
    try {
      setRepliesLoading(prev => ({ ...prev, [reviewId]: true }));
      const response = await reviewService.getReplies(reviewId);
      if (response.success) {
        setReplies(prev => ({ ...prev, [reviewId]: response.replies }));
      }
    } catch (error) {
      console.error('Error fetching replies:', error);
    } finally {
      setRepliesLoading(prev => ({ ...prev, [reviewId]: false }));
    }
  };

  const toggleRepliesExpansion = async (reviewId: number) => {
    const isCurrentlyExpanded = expandedReplies[reviewId];
    
    if (isCurrentlyExpanded) {
      // Collapse replies
      setExpandedReplies(prev => ({ ...prev, [reviewId]: false }));
    } else {
      // Expand replies - fetch if not already loaded
      setExpandedReplies(prev => ({ ...prev, [reviewId]: true }));
      
      if (!replies[reviewId]) {
        // Only fetch replies if they haven't been loaded yet
        await fetchReplies(reviewId);
      }
    }
  };

  const submitReply = async (reviewId: number) => {
    if (!replyForm.reply.trim()) {
      toast.error('Please enter a reply');
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await reviewService.createReply(reviewId, replyForm.reply, token);

      if (response.success) {
        toast.success('Reply submitted successfully!');
        setReplyingToReview(null);
        setEditingReviewId(null);
        setEditingReplyId(null);
        setReplyForm({ reply: '' });
        setEditReplyForm({ reply: '' });
        setEditReviewForm({ rating: 5, title: '', comment: '' });
        setHoverRating(0);
        
        // Refresh replies for this review
        await fetchReplies(reviewId);
        // Refresh reviews to show the updated list
        await fetchReviews(1);
      } else {
        toast.error(response.message || 'Failed to submit reply');
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
      toast.error('Failed to submit reply. Please try again.');
    }
  };

  const handleEditQuestion = async (questionId: number, updatedQuestion: string) => {
    try {
      const token = await getToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await reviewService.updateQuestion(questionId, {
        productId: product!.id,
        question: updatedQuestion
      }, token);

      if (response.success) {
        // Refresh reviews to show the updated question immediately
        await fetchReviews(1);
        toast.success('Question updated successfully!');
        // Cancel any active edit or reply
        setEditingReviewId(null);
        setReplyingToReview(null);
        setEditReviewForm({ rating: 5, title: '', comment: '' });
        setReplyForm({ reply: '' });
        setHoverRating(0);
      } else {
        toast.error(response.message || 'Failed to update question');
      }
    } catch (error) {
      console.error('Error updating question:', error);
      toast.error('Failed to update question. Please try again.');
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await reviewService.deleteQuestion(questionId, token);

      if (response.success) {
        // Refresh reviews to show the updated list immediately
        await fetchReviews(1);
        toast.success('Question deleted successfully!');
      } else {
        toast.error(response.message || 'Failed to delete question');
      }
          } catch (error) {
        console.error('Error deleting question:', error);
        toast.error('Failed to delete question. Please try again.');
      } finally {
        // Cancel any active edit or reply
        setEditingReviewId(null);
        setReplyingToReview(null);
        setEditReviewForm({ rating: 5, title: '', comment: '' });
        setReplyForm({ reply: '' });
        setHoverRating(0);
      }
    };

  const startEditingReview = (review: any) => {
    setEditingReviewId(review.id);
    setReplyingToReview(null);
    setEditReviewForm({
      rating: review.rating,
      title: review.title || '',
      comment: review.comment || ''
    });
    setReplyForm({ reply: '' });
  };

  const startEditingQuestion = (question: any) => {
    setEditingQuestionId(question.id);
    setEditQuestionForm({
      question: question.question
    });
    // Cancel any active edit or reply
    setEditingReviewId(null);
    setReplyingToReview(null);
    setEditReviewForm({ rating: 5, title: '', comment: '' });
    setReplyForm({ reply: '' });
    setHoverRating(0);
  };

  const saveReviewEdit = async () => {
    if (editingReviewId) {
      await handleEditReview(editingReviewId, editReviewForm);
      setEditingReviewId(null);
      setReplyingToReview(null);
      setEditReviewForm({ rating: 5, title: '', comment: '' });
      setReplyForm({ reply: '' });
      setHoverRating(0);
    }
  };

  const saveQuestionEdit = async () => {
    if (editingQuestionId) {
      await handleEditQuestion(editingQuestionId, editQuestionForm.question);
      setEditingQuestionId(null);
      setEditQuestionForm({ question: '' });
      // Cancel any active edit or reply
      setEditingReviewId(null);
      setReplyingToReview(null);
      setEditReviewForm({ rating: 5, title: '', comment: '' });
      setReplyForm({ reply: '' });
      setHoverRating(0);
    }
  };

  const cancelEdit = () => {
    setEditingReviewId(null);
    setEditingQuestionId(null);
    setReplyingToReview(null);
    setEditReviewForm({ rating: 5, title: '', comment: '' });
    setEditQuestionForm({ question: '' });
    setReplyForm({ reply: '' });
    setHoverRating(0);
  };

  const confirmDeleteReply = async () => {
    if (!replyToDelete) return;

    try {
      const token = await getToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await reviewService.deleteReply(replyToDelete, token);

      if (response.success) {
        toast.success('Reply deleted successfully!');
        
        // Refresh replies for all reviews
        Object.keys(replies).forEach(reviewId => {
          fetchReplies(parseInt(reviewId));
        });
      } else {
        toast.error(response.message || 'Failed to delete reply');
      }
    } catch (error) {
      console.error('Error deleting reply:', error);
      toast.error('Failed to delete reply. Please try again.');
    } finally {
      setShowReplyDeleteConfirmDialog(false);
      setReplyToDelete(null);
    }
  };

  const handleMarkHelpful = async (reviewId: number) => {
    if (!isAuthenticated) {
      toast.error('Please log in to mark reviews as helpful');
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await reviewService.markReviewHelpful(reviewId, token);

      if (response.success) {
        // Update the helpful interaction state
        setHelpfulInteractions(prev => ({
          ...prev,
          [reviewId]: {
            count: response.isHelpful 
              ? (prev[reviewId]?.count || 0) + 1 
              : Math.max(0, (prev[reviewId]?.count || 0) - 1),
            isHelpful: response.isHelpful
          }
        }));

        toast.success(response.isHelpful ? 'Review marked as helpful!' : 'Helpful mark removed');
      } else {
        toast.error(response.message || 'Failed to mark review as helpful');
      }
    } catch (error) {
      console.error('Error marking review as helpful:', error);
      toast.error('Failed to mark review as helpful. Please try again.');
    }
  };

  const handleReportReview = async (reviewId: number) => {
    if (!isAuthenticated) {
      toast.error('Please log in to report reviews');
      return;
    }

    // Check if review is already reported
    if (reportInteractions[reviewId]?.isReported) {
      // If already reported, remove the report directly
      try {
        const token = await getToken();
        if (!token) {
          toast.error('Authentication required');
          return;
        }

        const response = await reviewService.reportReview(reviewId, '', token);

        if (response.success) {
          // Update the report interaction state
          setReportInteractions(prev => ({
            ...prev,
            [reviewId]: {
              isReported: response.isReported
            }
          }));

          toast.success('Report removed successfully');
        } else {
          toast.error(response.message || 'Failed to remove report');
        }
      } catch (error) {
        console.error('Error removing report:', error);
        toast.error('Failed to remove report. Please try again.');
      }
    } else {
      // If not reported, open the report dialog
      setReviewToReport(reviewId);
      setReportReason('');
      setSelectedReportReason('');
      setShowReportDialog(true);
    }
  };

  const submitReport = async () => {
    if (!reviewToReport || (!selectedReportReason && !reportReason.trim())) {
      toast.error('Please select a reason or provide a custom reason for reporting');
      return;
    }

    // Use selected reason if it's not "Other", otherwise use custom reason
    const finalReason = selectedReportReason === 'Other' ? reportReason.trim() : selectedReportReason;

    if (selectedReportReason === 'Other' && !reportReason.trim()) {
      toast.error('Please provide a custom reason for reporting');
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await reviewService.reportReview(reviewToReport, finalReason, token);

      if (response.success) {
        // Update the report interaction state
        setReportInteractions(prev => ({
          ...prev,
          [reviewToReport]: {
            isReported: response.isReported
          }
        }));

        toast.success(response.isReported ? 'Review reported successfully!' : 'Report removed successfully');
        setShowReportDialog(false);
        setReviewToReport(null);
        setReportReason('');
        setSelectedReportReason('');
      } else {
        toast.error(response.message || 'Failed to report review');
      }
    } catch (error) {
      console.error('Error reporting review:', error);
      toast.error('Failed to report review. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-4">Product Not Found</h2>
          <p className="text-muted-foreground mb-4">{error || 'The product you are looking for does not exist.'}</p>
          <Button asChild>
            <Link to="/products">Back to Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  const images = Array.isArray(product.images) ? product.images : [];
  
  // Fix Set iteration issues by using Array.from
  const availableSizes = Array.from(new Set(product.variants?.map(v => v.size) || []));

  // Color swatches data is now handled directly in the component

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/products" className="hover:text-foreground">Products</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{product.name}</span>
        </nav>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <ProductImageGallery
              images={images}
              productName={product.name}
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Product Header */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold">{product.name}</h1>
                  {isProductInCart && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                      <ShoppingCart className="h-3 w-3 mr-1" />
                      In Cart ({cartItemQuantity})
                    </Badge>
                  )}
                  {!isProductInCart && isProductInCartAnyVariantCheck && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                      <ShoppingCart className="h-3 w-3 mr-1" />
                      In Cart (No Variants)
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <WishlistButton product={product} size="icon" />
                  <Button size="sm" variant="outline" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(product.averageRating || 0)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.averageRating?.toFixed(1)} ({product.reviewCount || 0} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-3xl font-bold text-primary">
                  ${product.salePrice || product.price}
                </span>
                {product.comparePrice && product.comparePrice > product.price && (
                  <span className="text-xl text-muted-foreground line-through">
                    ${product.comparePrice}
                  </span>
                )}
                {product.isOnSale && (
                  <Badge className="bg-red-500">
                    {Math.round(((product.comparePrice || 0) - (product.salePrice || product.price)) / (product.comparePrice || 1) * 100)}% OFF
                  </Badge>
                )}
              </div>
            </div>

            {/* Size Selection */}
            {availableSizes.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">Size: {selectedSize}</h3>
                  <SizeChart />
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => handleSizeChange(size)}
                      className={`px-4 py-2 border rounded-md transition-all ${
                        selectedSize === size
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {product.variants && product.variants.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">Color: {selectedColor}</h3>
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set(product.variants.map(v => v.color))).map((colorName) => {
                    const variant = product.variants?.find(v => v.color === colorName);
                    const inStock = variant ? variant.stock > 0 : false;
                    return (
                      <button
                        key={colorName}
                        onClick={() => handleColorChange(colorName)}
                        disabled={!inStock}
                        className={`
                          w-8 h-8 rounded-full border-2 transition-all relative
                          ${!inStock ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-110'}
                          ${selectedColor === colorName 
                            ? 'border-primary scale-110' 
                            : 'border-border hover:border-primary/50'
                          }
                        `}
                        style={{ backgroundColor: variant?.colorCode || '#ccc' }}
                        title={`${colorName}${!inStock ? ' - Out of Stock' : ''}`}
                      >
                        {selectedColor === colorName && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="text-sm font-medium mb-2">
                {isProductInCart ? 'Update Cart Quantity' : 'Quantity to Add'}
              </h3>
              {isProductInCart && (
                <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-xs text-blue-700">
                    Currently <span className="font-semibold">{cartItemQuantity}</span> in cart
                  </p>
                </div>
              )}
              {!isProductInCart && isProductInCartAnyVariantCheck && (
                <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-xs text-blue-700">
                    Product is in cart without variants. Adding with selected variants will replace the existing item.
                  </p>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="h-10 w-10 p-0"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-16 text-center text-lg font-semibold px-3 py-2 bg-muted rounded-md">
                  {quantity}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuantityChange(1)}
                  className="h-10 w-10 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {isProductInCart 
                  ? `Adjust the quantity above and click "Update Cart" to save changes.`
                  : 'Select the quantity you want to add to your cart'
                }
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className={`flex-1 ${
                  showAddedToCart 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : isProductInCart 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : ''
                }`}
                onClick={handleAddToCart}
                disabled={showAddedToCart}
              >
                {showAddedToCart ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    {isProductInCart ? 'Cart Updated!' : 'Added to Cart!'}
                  </>
                ) : isProductInCart ? (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Update Cart
                  </>
                ) : isProductInCartAnyVariantCheck ? (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add with Variants
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </>
                )}
              </Button>
              <Button size="lg" variant="outline" className="flex-1">
                Buy Now
              </Button>
            </div>

            {/* Remove from Cart Button (when item is in cart) */}
            {isProductInCart && (
              <div className="flex justify-center">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleRemoveFromCart}
                  className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove from Cart
                </Button>
              </div>
            )}
            
            {/* Success Message */}
            {showAddedToCart && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800 flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  {isProductInCart 
                    ? `Cart updated successfully! Quantity is now ${quantity}.`
                    : `${quantity} ${quantity === 1 ? 'item' : 'items'} added to cart successfully!`
                  }
                </p>
              </div>
            )}
            
            {/* Cart Status Message */}
            {isProductInCart && !showAddedToCart && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800 flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  This item is already in your cart ({cartItemQuantity} {cartItemQuantity === 1 ? 'item' : 'items'}). 
                  You can remove it or adjust the quantity above.
                </p>
              </div>
            )}

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 py-4 border-t">
              <div className="flex items-center space-x-2">
                <Truck className="h-4 w-4 text-primary" />
                <span className="text-sm">Free Shipping</span>
              </div>
              <div className="flex items-center space-x-2">
                <RotateCcw className="h-4 w-4 text-primary" />
                <span className="text-sm">30-Day Returns</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-sm">1 Year Warranty</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-sm">Fast Delivery</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="reviews" onClick={handleReviewsTabClick}>
                Reviews ({product.reviewCount || 0})
              </TabsTrigger>
              <TabsTrigger value="qa">Q&A</TabsTrigger>
              <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                  
                  {product.tags && product.tags.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {product.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Customer Reviews
                        {product.reviewCount && product.reviewCount > 0 && (
                          <Badge variant="secondary" className="text-sm">
                            {product.reviewCount} reviews
                          </Badge>
                        )}
                      </CardTitle>
                      {product.averageRating && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.floor(product.averageRating!)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-lg font-semibold text-primary">
                            {product.averageRating.toFixed(1)}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            out of 5
                          </span>
                        </div>
                      )}
                      
                      {/* Rating Distribution Chart */}
                      {product.reviews && product.reviews.length > 0 && (
                        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                          <h4 className="text-sm font-medium mb-3">Rating Distribution</h4>
                          <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map((rating) => {
                              const count = product.reviews?.filter(r => r.rating === rating).length || 0;
                              const percentage = product.reviewCount ? (count / product.reviewCount) * 100 : 0;
                              return (
                                <div key={rating} className="flex items-center gap-3">
                                  <div className="flex items-center gap-1 w-8">
                                    <span className="text-xs text-muted-foreground">{rating}</span>
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  </div>
                                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-muted-foreground w-8 text-right">
                                    {count}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                    {!userHasReviewed && (
                      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Star className="h-4 w-4 mr-2" />
                            Write a Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Write a Review</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            {/* Rating Selection */}
                            <div>
                              <Label htmlFor="rating">Rating</Label>
                              <div className="flex items-center gap-2 mt-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                                    className={`p-1 rounded transition-colors ${
                                      (hoverRating >= star || reviewForm.rating >= star)
                                        ? 'text-yellow-400' 
                                        : 'text-gray-300'
                                    }`}
                                  >
                                    <Star className="h-5 w-5 fill-current" />
                                  </button>
                                ))}
                                <span className="ml-2 text-sm text-muted-foreground">
                                  {hoverRating > 0 ? hoverRating : reviewForm.rating} out of 5
                                </span>
                              </div>
                            </div>

                            {/* Review Title */}
                            <div>
                              <Label htmlFor="title">Title</Label>
                              <Input
                                id="title"
                                value={reviewForm.title}
                                onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Summarize your experience"
                                className="mt-1"
                              />
                            </div>

                            {/* Review Comment */}
                            <div>
                              <Label htmlFor="comment">Review</Label>
                              <Textarea
                                id="comment"
                                value={reviewForm.comment}
                                onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                                placeholder="Share your thoughts about this product..."
                                rows={4}
                                className="mt-1"
                              />
                            </div>

                            {/* Submit Button */}
                            <Button 
                              onClick={handleReviewSubmit}
                              disabled={submittingReview}
                              className="w-full"
                            >
                              {submittingReview ? 'Submitting...' : 'Submit Review'}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                    
                    {/* Show message when user has already reviewed */}
                    {userHasReviewed && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Star className="h-4 w-4 text-green-600" />
                        You have already reviewed this product
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {reviewsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading reviews...</p>
                    </div>
                  ) : reviews && reviews.length > 0 ? (
                    <div className="space-y-6">
                      {/* Review Filters */}
                      <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm font-medium">Filter by:</span>
                          <div className="flex items-center gap-2">
                            {[5, 4, 3, 2, 1].map((rating) => (
                              <Button
                                key={rating}
                                variant={selectedRating === rating ? "default" : "outline"}
                                size="sm"
                                className="h-8 px-3 text-xs"
                                onClick={() => handleRatingFilter(selectedRating === rating ? null : rating)}
                              >
                                {rating}★
                              </Button>
                            ))}
                          </div>
                          <Separator orientation="vertical" className="h-6" />
                          <Button 
                            variant={sortBy === 'recent' ? "default" : "outline"}
                            size="sm" 
                            className="h-8 px-3 text-xs"
                            onClick={() => handleSortChange('recent')}
                          >
                            Most Recent
                          </Button>
                          <Button 
                            variant={sortBy === 'helpful' ? "default" : "outline"}
                            size="sm" 
                            className="h-8 px-3 text-xs"
                            onClick={() => handleSortChange('helpful')}
                          >
                            Only Helpful
                          </Button>
                          {(selectedRating !== null || sortBy !== 'recent') && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 px-3 text-xs text-red-600 hover:text-red-800"
                              onClick={resetFilters}
                            >
                              Clear Filters
                            </Button>
                          )}
                        </div>

                      {/* Filter Description */}
                      <div className="text-xs text-muted-foreground px-3">
                        <span className="font-medium">Helpful Filter:</span> Shows only reviews that have been marked as helpful by other users
                      </div>

                      {/* Filter Summary */}
                      {(selectedRating !== null || sortBy !== 'recent') && (
                        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                          <span className="text-sm font-medium text-blue-800">Active Filters:</span>
                          {selectedRating && (
                            <Badge variant="secondary" className="text-xs">
                              {selectedRating}★ Rating
                            </Badge>
                          )}
                          {sortBy === 'helpful' && (
                            <Badge variant="secondary" className="text-xs">
                              Only Helpful Reviews
                            </Badge>
                          )}
                          <span className="text-sm text-blue-600">
                            {filtersLoading ? 'Updating...' : `${reviewsTotal} reviews found`}
                          </span>
                          {sortBy === 'helpful' && !filtersLoading && (
                            <span className="text-xs text-blue-600">
                              ({reviews.filter((r: any) => r.helpfulCount > 0).length} with helpful votes)
                            </span>
                          )}
                          {filtersLoading && (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          )}
                        </div>
                      )}

                      {/* Reviews List */}
                      {reviews.map((review) => (
                        <div key={review.id} data-review-item className="border-b pb-6 last:border-b-0">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start space-x-3">
                              <UserAvatar user={review.user} size="md" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-medium">{review.user?.name || 'Anonymous'}</p>
                                  {review.status === 'PENDING' && (
                                    <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-700 border-yellow-300">
                                      Pending Approval
                                    </Badge>
                                  )}
                                  {review.isVerified && review.status === 'APPROVED' && (
                                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                      ✓ Verified Purchase
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-3 w-3 ${
                                          i < review.rating
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm text-muted-foreground">
                                    {review.rating}.0
                                  </span>
                                  {review.helpfulCount > 0 && (
                                    <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                      ✓ {review.helpfulCount} helpful
                                    </span>
                                  )}
                                </div>
                                {review.title && (
                                  <h4 className="font-medium mb-2 text-base">{review.title}</h4>
                                )}
                                <p className="text-muted-foreground leading-relaxed">{review.comment}</p>
                                
                                {/* Display Replies */}
                                {review.status === 'APPROVED' && (
                                  <div className="mt-4">
                                    {/* Replies toggle and display - only show if there are replies */}
                                    {review._count?.replies > 0 && (
                                      <div className="mb-3">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 px-3 text-xs text-blue-600 hover:text-blue-800"
                                          onClick={() => toggleRepliesExpansion(review.id)}
                                        >
                                          <MessageSquare className="h-3 w-3 mr-1" />
                                          {expandedReplies[review.id] ? 'Hide Replies' : 'Show Replies'}
                                          <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                            {review._count.replies}
                                          </span>
                                        </Button>
                                      </div>
                                    )}
                                    
                                    {/* Show replies only when expanded */}
                                    {expandedReplies[review.id] && (
                                      <>
                                        {/* Show existing replies */}
                                        {replies[review.id] && replies[review.id].length > 0 ? (
                                          <div className="space-y-3">
                                            <h5 className="text-sm font-medium text-muted-foreground">Replies:</h5>
                                            {replies[review.id].map((reply: any) => (
                                              <div key={reply.id} className="pl-4 border-l-2 border-muted">
                                                <div className="flex items-start gap-2">
                                                  <UserAvatar user={reply.user} size="sm" />
                                                  <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                      <p className="text-sm font-medium">{reply.user?.name || 'Anonymous'}</p>
                                                      <span className="text-xs text-muted-foreground">
                                                        {formatDate(reply.createdAt)}
                                                      </span>
                                                    </div>
                                                    {/* Show edit form or reply content */}
                                                    {editingReplyId === reply.id ? (
                                                      <div className="mt-2">
                                                        <Textarea
                                                          value={editReplyForm.reply}
                                                          onChange={(e) => setEditReplyForm({ reply: e.target.value })}
                                                          placeholder="Edit your reply..."
                                                          rows={2}
                                                          className="w-full text-sm"
                                                        />
                                                        <div className="flex items-center gap-2 mt-2">
                                                          <Button
                                                            size="sm"
                                                            className="h-6 px-2 text-xs"
                                                            onClick={() => submitEditReply()}
                                                          >
                                                            Save
                                                          </Button>
                                                          <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-6 px-2 text-xs"
                                                            onClick={cancelEditReply}
                                                          >
                                                            Cancel
                                                          </Button>
                                                        </div>
                                                      </div>
                                                    ) : (
                                                      <>
                                                        <p className="text-sm text-muted-foreground">{reply.reply}</p>
                                                        
                                                        {/* Reply Actions - Edit/Delete for own replies */}
                                                        {isAuthenticated && currentUserDbId && reply.userId === currentUserDbId && (
                                                          <div className="flex items-center gap-2 mt-2">
                                                            <Button
                                                              variant="ghost"
                                                              size="sm"
                                                              className="h-6 px-2 text-xs text-blue-600 hover:text-blue-800"
                                                              onClick={() => startEditingReply(reply.id, reply.reply)}
                                                            >
                                                              <Edit className="h-3 w-3 mr-1" />
                                                              Edit
                                                            </Button>
                                                            <Button
                                                              variant="ghost"
                                                              size="sm"
                                                              className="h-6 px-2 text-xs text-red-600 hover:text-red-800"
                                                              onClick={() => handleDeleteReply(reply.id)}
                                                            >
                                                              <Trash2 className="h-3 w-3 mr-1" />
                                                              Delete
                                                            </Button>
                                                          </div>
                                                        )}
                                                      </>
                                                    )}
                                                  </div>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        ) : (
                                          <div className="text-center py-4 text-sm text-muted-foreground">
                                            No replies yet. Be the first to reply!
                                          </div>
                                        )}
                                        
                                        {/* Loading indicator for replies */}
                                        {repliesLoading[review.id] && (
                                          <div className="mt-3 pl-4 border-l-2 border-muted">
                                            <div className="flex items-center gap-2">
                                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                              <span className="text-sm text-muted-foreground">Loading replies...</span>
                                            </div>
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            <span className="text-sm text-muted-foreground flex-shrink-0">
                              {formatDate(review.createdAt)}
                            </span>
                          </div>

                          {/* Edit Review Form */}
                          {editingReviewId === review.id && (
                            <div className="mt-4 p-4 bg-muted/50 rounded-lg border">
                              <h4 className="font-medium mb-3">Edit Review</h4>
                              <div className="space-y-4">
                                {/* Rating */}
                                <div>
                                  <label className="block text-sm font-medium mb-2">Rating</label>
                                  <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((rating) => (
                                      <Button
                                        key={rating}
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className={`h-8 px-2 ${
                                          editReviewForm.rating >= rating
                                            ? 'text-yellow-400'
                                            : 'text-gray-300'
                                        }`}
                                        onClick={() => setEditReviewForm(prev => ({ ...prev, rating }))}
                                        onMouseEnter={() => setHoverRating(rating)}
                                        onMouseLeave={() => setHoverRating(0)}
                                      >
                                        <Star
                                          className={`h-4 w-4 ${
                                            (hoverRating || editReviewForm.rating) >= rating
                                              ? 'fill-current'
                                              : 'fill-none'
                                          }`}
                                        />
                                      </Button>
                                    ))}
                                  </div>
                                </div>

                                {/* Title */}
                                <div>
                                  <label className="block text-sm font-medium mb-2">Title</label>
                                  <Input
                                    type="text"
                                    value={editReviewForm.title}
                                    onChange={(e) => setEditReviewForm(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Add a title to your review"
                                    className="w-full"
                                  />
                                </div>

                                {/* Comment */}
                                <div>
                                  <label className="block text-sm font-medium mb-2">Comment</label>
                                  <Textarea
                                    value={editReviewForm.comment}
                                    onChange={(e) => setEditReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                                    placeholder="Share your thoughts about this product"
                                    rows={3}
                                    className="w-full"
                                  />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2">
                                  <Button onClick={saveReviewEdit} size="sm">
                                    Save Changes
                                  </Button>
                                  <Button variant="outline" onClick={cancelEdit} size="sm">
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Reply Form */}
                          {replyingToReview === review.id && (
                            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                              <h4 className="font-medium mb-3 text-blue-800">Reply to Review</h4>
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-medium mb-2">Your Reply</label>
                                  <Textarea
                                    value={replyForm.reply}
                                    onChange={(e) => setReplyForm({ reply: e.target.value })}
                                    placeholder="Write your reply to this review..."
                                    rows={3}
                                    className="w-full"
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button onClick={() => submitReply(review.id)} size="sm">
                                    Submit Reply
                                  </Button>
                                  <Button variant="outline" onClick={cancelReply} size="sm">
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}


                          
                          {/* Helpful Count Display */}
                          {(helpfulInteractions[review.id]?.count > 0 || review.helpfulCount > 0) && (
                            <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                              <ThumbsUp className="h-4 w-4 text-green-600" />
                              <span>
                                {helpfulInteractions[review.id]?.count || review.helpfulCount || 0} people found this review helpful
                              </span>
                            </div>
                          )}
                          
                          {/* Review Actions */}
                          {editingReviewId !== review.id && replyingToReview !== review.id && (
                            <div className="flex items-center gap-4 ml-13">
                              {review.status === 'APPROVED' ? (
                                <>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className={`h-8 px-3 text-xs ${
                                      helpfulInteractions[review.id]?.isHelpful 
                                        ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' 
                                        : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                    onClick={() => handleMarkHelpful(review.id)}
                                    disabled={editingReviewId === review.id || replyingToReview === review.id}
                                  >
                                    <ThumbsUp className={`h-3 w-3 mr-1 ${
                                      helpfulInteractions[review.id]?.isHelpful ? 'fill-current' : ''
                                    }`} />
                                    Helpful
                                    {(helpfulInteractions[review.id]?.count > 0 || review.helpfulCount > 0) && (
                                      <span className="ml-1 text-xs bg-muted px-2 py-1 rounded-full">
                                        {helpfulInteractions[review.id]?.count || review.helpfulCount || 0}
                                      </span>
                                    )}
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 px-3 text-xs"
                                    onClick={() => startReply(review.id)}
                                    disabled={
                                      replyingToReview === review.id || 
                                      editingReviewId === review.id
                                    }
                                  >
                                    <MessageSquare className="h-3 w-3 mr-1" />
                                    Reply
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className={`h-8 px-3 text-xs ${
                                      reportInteractions[review.id]?.isReported 
                                        ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                                        : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                    onClick={() => handleReportReview(review.id)}
                                    disabled={editingReviewId === review.id || replyingToReview === review.id}
                                  >
                                    <Flag className={`h-3 w-3 mr-1 ${
                                      reportInteractions[review.id]?.isReported ? 'fill-current' : ''
                                    }`} />
                                    {reportInteractions[review.id]?.isReported ? 'Remove Report' : 'Report'}
                                  </Button>
                                </>
                                                          ) : review.status === 'PENDING' && isAuthenticated ? (
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => startEditingReview(review)}
                                  className="h-6 px-2 text-xs"
                                  disabled={replyingToReview === review.id}
                                >
                                  <Edit className="h-3 w-3 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteReview(review.id)}
                                  className="h-6 px-2 text-xs text-red-500 hover:text-red-700"
                                  disabled={replyingToReview === review.id}
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            ) : null}
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Infinite Scroll Loading Indicator */}
                      {reviewsLoadingMore && (
                        <div className="flex items-center justify-center gap-2 mt-6 py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                          <span className="text-sm text-muted-foreground">Loading more reviews...</span>
                        </div>
                      )}
                      
                      {/* End of Reviews Message */}
                      {!hasMoreReviews && reviews.length > 0 && (
                        <div className="text-center py-6 text-sm text-muted-foreground">
                          <div className="w-8 h-8 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Star className="h-4 w-4" />
                          </div>
                          You've reached the end of all reviews
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      {filtersLoading ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      ) : (
                        <>
                          <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Star className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <h3 className="text-lg font-medium mb-2">
                            {selectedRating || sortBy !== 'recent' 
                              ? sortBy === 'helpful' 
                                ? 'No helpful reviews found' 
                                : 'No reviews found matching your filters'
                              : 'No reviews yet'
                            }
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            {selectedRating || sortBy !== 'recent'
                              ? sortBy === 'helpful'
                                ? 'No reviews have been marked as helpful yet. Try clearing the filter to see all reviews.'
                                : 'Try adjusting your filters or clear them to see all reviews.'
                              : 'Be the first to share your experience with this product!'
                            }
                          </p>
                          {(selectedRating || sortBy !== 'recent') ? (
                            <Button variant="outline" onClick={resetFilters}>
                              Clear Filters
                            </Button>
                          ) : (
                            <Button onClick={() => setShowReviewDialog(true)}>
                              <Star className="h-4 w-4 mr-2" />
                              Write the First Review
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="qa" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      Questions & Answers
                      <Badge variant="secondary" className="text-sm">
                        0 questions
                      </Badge>
                    </CardTitle>
                    <Dialog open={showQuestionDialog} onOpenChange={setShowQuestionDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Ask a Question
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Ask a Question</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="question">Your Question</Label>
                            <Textarea
                              id="question"
                              value={questionForm.question}
                              onChange={(e) => setQuestionForm(prev => ({ ...prev, question: e.target.value }))}
                              placeholder="What would you like to know about this product?"
                              rows={4}
                              className="mt-1"
                            />
                          </div>
                          <Button 
                            onClick={handleQuestionSubmit}
                            disabled={submittingQuestion}
                            className="w-full"
                          >
                            {submittingQuestion ? 'Submitting...' : 'Submit Question'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No questions yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Have a question about this product? Ask and get answers from other customers!
                    </p>
                    <Button onClick={() => setShowQuestionDialog(true)}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Ask the First Question
                    </Button>
                  </div>
                  
                  {/* Q&A Search and Filters */}
                  <div className="mt-8 p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-medium mb-3">Q&A Guidelines</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Ask specific questions about product features, sizing, or usage</li>
                      <li>• Be respectful and helpful to other community members</li>
                      <li>• Questions are typically answered within 24-48 hours</li>
                      <li>• Verified purchasers can mark answers as helpful</li>
                    </ul>
                  </div>

                  {/* User's Pending Questions */}
                  {isAuthenticated && userPendingQuestions.length > 0 && (
                    <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-4 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Your Pending Questions
                      </h4>
                      <div className="space-y-4">
                        {userPendingQuestions.map((pendingQuestion) => (
                          <div key={pendingQuestion.id} className="p-3 bg-white border border-blue-300 rounded-lg">
                            {editingQuestionId === pendingQuestion.id ? (
                              // Edit Mode
                              <div className="space-y-3">
                                <Textarea
                                  value={editQuestionForm.question}
                                  onChange={(e) => setEditQuestionForm(prev => ({ ...prev, question: e.target.value }))}
                                  placeholder="Your question"
                                  rows={3}
                                  className="text-sm"
                                />
                                <div className="flex items-center gap-2">
                                  <Button size="sm" onClick={saveQuestionEdit}>
                                    Save
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={cancelEdit}>
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              // Display Mode
                              <>
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-300">
                                      Pending Approval
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">
                                      {formatDate(pendingQuestion.createdAt)}
                                    </span>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => startEditingQuestion(pendingQuestion)}
                                      className="h-6 w-6 p-0"
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleDeleteQuestion(pendingQuestion.id)}
                                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground">{pendingQuestion.question}</p>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-blue-700 mt-3">
                        Your questions will be visible to other customers after approval by our team.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="shipping" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Shipping & Returns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Shipping Information</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Free shipping on orders over $50</li>
                        <li>• Standard delivery: 3-5 business days</li>
                        <li>• Express delivery: 1-2 business days</li>
                        <li>• International shipping available</li>
                      </ul>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-2">Return Policy</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• 30-day return window</li>
                        <li>• Free returns for defective items</li>
                        <li>• Return shipping label provided</li>
                        <li>• Full refund or exchange available</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Review</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Are you sure you want to delete this review? This action cannot be undone.
              </p>
              <div className="flex items-center gap-2">
                <Button 
                  variant="destructive" 
                  onClick={confirmDeleteReview}
                  className="w-full"
                >
                  Delete Review
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteConfirmDialog(false)}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reply Delete Confirmation Dialog */}
        <Dialog open={showReplyDeleteConfirmDialog} onOpenChange={setShowReplyDeleteConfirmDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Reply</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Are you sure you want to delete this reply? This action cannot be undone.
              </p>
              <div className="flex items-center gap-2">
                <Button 
                  variant="destructive" 
                  onClick={confirmDeleteReply}
                  className="w-full"
                >
                  Delete Reply
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowReplyDeleteConfirmDialog(false)}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Report Review Dialog */}
        <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Report Review</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Please select a reason for reporting this review. This helps us understand the issue and take appropriate action.
              </p>
              
              {/* Common Report Reasons */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Select a reason:</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="reason-inappropriate"
                      name="report-reason"
                      value="Inappropriate content"
                      checked={selectedReportReason === 'Inappropriate content'}
                      onChange={(e) => setSelectedReportReason(e.target.value)}
                      className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                    />
                    <Label htmlFor="reason-inappropriate" className="text-sm cursor-pointer">
                      Inappropriate content
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="reason-spam"
                      name="report-reason"
                      value="Spam or misleading"
                      checked={selectedReportReason === 'Spam or misleading'}
                      onChange={(e) => setSelectedReportReason(e.target.value)}
                      className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                    />
                    <Label htmlFor="reason-spam" className="text-sm cursor-pointer">
                      Spam or misleading
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="reason-offensive"
                      name="report-reason"
                      value="Offensive language"
                      checked={selectedReportReason === 'Offensive language'}
                      onChange={(e) => setSelectedReportReason(e.target.value)}
                      className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                    />
                    <Label htmlFor="reason-offensive" className="text-sm cursor-pointer">
                      Offensive language
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="reason-fake"
                      name="report-reason"
                      value="Fake review or rating"
                      checked={selectedReportReason === 'Fake review or rating'}
                      onChange={(e) => setSelectedReportReason(e.target.value)}
                      className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                    />
                    <Label htmlFor="reason-fake" className="text-sm cursor-pointer">
                      Fake review or rating
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="reason-other"
                      name="report-reason"
                      value="Other"
                      checked={selectedReportReason === 'Other'}
                      onChange={(e) => setSelectedReportReason(e.target.value)}
                      className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                    />
                    <Label htmlFor="reason-other" className="text-sm cursor-pointer">
                      Other
                    </Label>
                  </div>
                </div>
              </div>
              
              {/* Custom Reason Textarea - Only shown when "Other" is selected */}
              {selectedReportReason === 'Other' && (
                <div>
                  <Label htmlFor="report-reason">Custom Reason</Label>
                  <Textarea
                    id="report-reason"
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    placeholder="Please describe your reason for reporting this review..."
                    rows={3}
                    className="mt-1"
                  />
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="destructive" 
                  onClick={submitReport}
                  className="w-full"
                  disabled={!selectedReportReason || (selectedReportReason === 'Other' && !reportReason.trim())}
                >
                  Submit Report
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowReportDialog(false);
                    setReviewToReport(null);
                    setReportReason('');
                    setSelectedReportReason('');
                  }}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Frequently Bought Together */}
        <div className="mt-16">
          <FrequentlyBoughtTogether 
            currentProduct={product}
            relatedProducts={relatedProducts}
          />
        </div>

        {/* Recently Viewed Products */}
        <div className="mt-16">
          <RecentlyViewedProducts />
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                You Might Also Like
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Discover more products that complement your selection
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.slice(0, 8).map((product) => (
                  <Card 
                    key={product.id} 
                    className="group cursor-pointer transition-all hover:shadow-lg hover:scale-105"
                    onClick={() => window.location.href = `/product/${product.slug}`}
                  >
                    <div className="relative overflow-hidden">
                      <ImageWithPlaceholder
                        src={product.images && product.images.length > 0 ? product.images[0].url : ''}
                        alt={product.name}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {product.comparePrice && product.comparePrice > product.price && (
                        <Badge variant="destructive" className="absolute top-2 left-2">
                          -{Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}%
                        </Badge>
                      )}
                      {product.isFeatured && (
                        <Badge variant="secondary" className="absolute top-2 right-2 bg-yellow-500 text-yellow-900">
                          Featured
                        </Badge>
                      )}
                    </div>
                    
                    <CardContent className="p-4">
                      <h4 className="font-medium text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                        {product.name}
                      </h4>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < Math.floor(product.averageRating || 0) 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          ({product.reviewCount || 0})
                        </span>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {product.comparePrice && product.comparePrice > product.price ? (
                            <>
                              <span className="font-semibold text-primary">
                                ${product.price.toFixed(2)}
                              </span>
                              <span className="text-sm text-muted-foreground line-through">
                                ${product.comparePrice.toFixed(2)}
                              </span>
                            </>
                          ) : (
                            <span className="font-semibold text-primary">
                              ${product.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>

                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `/product/${product.slug}`;
                        }}
                      >
                        View Product
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
