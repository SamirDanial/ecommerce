/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Product } from '../types';
import { productService } from '../services/api';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ImageWithPlaceholder } from '../components/ui/image-with-placeholder';
import WishlistButton from '../components/WishlistButton';
import { useUserInteractionStore } from '../stores/userInteractionStore';
import { useClerkAuth } from '../hooks/useClerkAuth';
import { useCartStore } from '../stores/cartStore';
import { useCurrency } from '../contexts/CurrencyContext';
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
  Edit,
  Sparkles
} from 'lucide-react';
import ProductImageGallery from '../components/ProductImageGallery';
import SizeChart from '../components/SizeChart';
import FrequentlyBoughtTogether from '../components/FrequentlyBoughtTogether';
import { RecentlyViewedProducts } from '../components/RecentlyViewedProducts';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import RatingDisplay from '../components/ui/rating-display';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../components/ui/dialog';
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

  
  // Reviews state for authenticated users (includes pending + approved)
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsTotal, setReviewsTotal] = useState(0);

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
  
  // State to track if Q&A tab has been clicked (for lazy loading)
  const [qaTabClicked, setQaTabClicked] = useState(false);
  
  // Questions state for lazy loading
  const [questions, setQuestions] = useState<any[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionsPage, setQuestionsPage] = useState(1);
  const [questionsTotal, setQuestionsTotal] = useState(0);

  const [hasMoreQuestions, setHasMoreQuestions] = useState(true);
  const [questionsLoadingMore] = useState(false);
  
  // Question count state for eager loading
  const [questionCount, setQuestionCount] = useState(0);
  
  // Question replies state
  const [expandedQuestionReplies, setExpandedQuestionReplies] = useState<{[key: number]: boolean}>({});
  const [showReplyForm, setShowReplyForm] = useState<{[key: number]: boolean}>({});
  const [questionReplies, setQuestionReplies] = useState<{[key: number]: any[]}>({});
  const [questionRepliesLoading, setQuestionRepliesLoading] = useState<{[key: number]: boolean}>({});
  const [questionReplyForm, setQuestionReplyForm] = useState<{[key: number]: string}>({});
  const [submittingQuestionReply, setSubmittingQuestionReply] = useState<{[key: number]: boolean}>({});
  const [editingQuestionReplyId, setEditingQuestionReplyId] = useState<number | null>(null);
  const [editQuestionReplyForm, setEditQuestionReplyForm] = useState<{[key: number]: string}>({});
  
  // Delete confirmation dialog state
  const [showQuestionReplyDeleteDialog, setShowQuestionReplyDeleteDialog] = useState(false);
  const [questionReplyToDelete, setQuestionReplyToDelete] = useState<number | null>(null);
  const [showQuestionDeleteDialog, setShowQuestionDeleteDialog] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<number | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<{[key: number]: boolean}>({});
  const [expandedReplyTexts, setExpandedReplyTexts] = useState<{[key: number]: boolean}>({});
  
  const { addToRecentlyViewed, addInteraction } = useUserInteractionStore();
  const { isAuthenticated, getToken } = useClerkAuth();
  const { addToCart, removeFromCart, isInCart, getItemQuantity, updateQuantity, isProductInCart: isProductInCartAnyVariant, getProductVariants } = useCartStore();
  const { formatPrice } = useCurrency();

  // Get images for selected color (direct mapping approach)
  const getImagesForColor = (color: string) => {
    if (!product || !product.images) return [];
    
    console.log(`Getting images for color: ${color}`);
    console.log('Available images:', product.images);
    
    // Create a mapping of colors to images based on filename patterns
    const colorImageMap: Record<string, string[]> = {};
    
    product.images.forEach(img => {
      const fileName = img.url.toLowerCase();
      
      // Check for common color patterns in filenames
      if (fileName.includes('black') || fileName.includes('bk') || fileName.includes('dark')) {
        if (!colorImageMap['Black']) colorImageMap['Black'] = [];
        colorImageMap['Black'].push(img.url);
      } else if (fileName.includes('white') || fileName.includes('wt') || fileName.includes('light')) {
        if (!colorImageMap['White']) colorImageMap['White'] = [];
        colorImageMap['White'].push(img.url);
      } else if (fileName.includes('blue') || fileName.includes('bl')) {
        if (!colorImageMap['Blue']) colorImageMap['Blue'] = [];
        colorImageMap['Blue'].push(img.url);
      } else if (fileName.includes('red') || fileName.includes('rd')) {
        if (!colorImageMap['Red']) colorImageMap['Red'] = [];
        colorImageMap['Red'].push(img.url);
      } else if (fileName.includes('green') || fileName.includes('gr')) {
        if (!colorImageMap['Green']) colorImageMap['Green'] = [];
        colorImageMap['Green'].push(img.url);
      } else if (fileName.includes('yellow') || fileName.includes('yl')) {
        if (!colorImageMap['Yellow']) colorImageMap['Yellow'] = [];
        colorImageMap['Yellow'].push(img.url);
      } else if (fileName.includes('purple') || fileName.includes('pr')) {
        if (!colorImageMap['Purple']) colorImageMap['Purple'] = [];
        colorImageMap['Purple'].push(img.url);
      } else if (fileName.includes('pink') || fileName.includes('pk')) {
        if (!colorImageMap['Pink']) colorImageMap['Pink'] = [];
        colorImageMap['Pink'].push(img.url);
      } else if (fileName.includes('orange') || fileName.includes('or')) {
        if (!colorImageMap['Orange']) colorImageMap['Orange'] = [];
        colorImageMap['Orange'].push(img.url);
      } else if (fileName.includes('brown') || fileName.includes('br')) {
        if (!colorImageMap['Brown']) colorImageMap['Brown'] = [];
        colorImageMap['Brown'].push(img.url);
      } else if (fileName.includes('gray') || fileName.includes('grey') || fileName.includes('gy')) {
        if (!colorImageMap['Gray']) colorImageMap['Gray'] = [];
        colorImageMap['Gray'].push(img.url);
      }
    });
    
    console.log('Color image mapping:', colorImageMap);
    
    // Return color-specific images if available, otherwise fallback to main images
    const colorImages = colorImageMap[color];
    if (colorImages && colorImages.length > 0) {
      console.log(`Found ${colorImages.length} images for color ${color}:`, colorImages);
      return colorImages;
    } else {
      console.log(`No color-specific images found for ${color}, using default images`);
      return product.images.map(img => img.url);
    }
  };

  // Handle when new images are loaded for a color
  const handleImagesLoaded = (images: any[], color: string) => {
    console.log(`Loaded ${images.length} images for color: ${color}`);
    // You can add additional logic here if needed
  };



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



  // Function to fetch question count eagerly
  const fetchQuestionCount = useCallback(async () => {
    if (!product) return;
    
    try {
      const response = await reviewService.getProductQuestions(product.id, 1, 1);
      if (response.success) {
        setQuestionCount(response.total);
      }
    } catch (error) {
      console.error('Error fetching question count:', error);
    }
  }, [product]);

  // Function to fetch questions (approved + pending for current user)
  const fetchQuestions = useCallback(async (page: number = 1, append: boolean = false) => {
    if (!qaTabClicked || !product) return;
    

    setQuestionsLoading(true);
    try {
      let response: any = null;
      if (isAuthenticated) {
        const token = await getToken();
        if (token) {
          response = await reviewService.getProductQuestionsWithPending(
            product.id,
            token,
            page,
            10
          );
        }
      } else {
        response = await reviewService.getProductQuestions(product.id, page);
      }
      
      if (!response) return;
      

      if (response.success) {
        if (append) {
          // Append new questions for infinite scroll
          setQuestions(prev => [...prev, ...response.questions]);
        } else {
          // Replace questions for initial load or page change
          setQuestions(response.questions);
        }
        
        setQuestionsTotal(response.total);

        setHasMoreQuestions(response.totalPages > page);
        setQuestionsPage(page);

      } else {
        console.error('Failed to fetch questions');
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setQuestionsLoading(false);
    }
  }, [qaTabClicked, product, isAuthenticated, getToken]);

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

        setReviewsPage(response.page);
        setHasMoreReviews(page < response.totalPages);
        

        
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

  // Function to load more questions for infinite scroll
  const loadMoreQuestions = useCallback(async () => {
    if (hasMoreQuestions && !questionsLoadingMore && !questionsLoading) {
      await fetchQuestions(questionsPage + 1, true);
    }
  }, [hasMoreQuestions, questionsLoadingMore, questionsLoading, questionsPage, fetchQuestions]);

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

  // Lazy loading: Only load questions when Q&A tab is clicked
  const handleQATabClick = useCallback(() => {
    if (!qaTabClicked) {
      setQaTabClicked(true);
      fetchQuestions(1);
    }
  }, [qaTabClicked, fetchQuestions]);

  // Debounced filter effect to prevent rapid API calls (only when tab is clicked)
  useEffect(() => {
    if (!product || !reviewsTabClicked) return;
    
    const timer = setTimeout(() => {
      fetchReviews(1);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [selectedRating, sortBy, product, fetchReviews, reviewsTabClicked]);

  // Effect to fetch question count when product loads
  useEffect(() => {
    if (product) {
      fetchQuestionCount();
    }
  }, [product, fetchQuestionCount]);

  // Effect to fetch questions when Q&A tab is clicked
  useEffect(() => {
    if (!product || !qaTabClicked) return;
    
    fetchQuestions(1);
  }, [qaTabClicked, product, fetchQuestions]);

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

  // Intersection Observer for questions infinite scroll (only when Q&A tab is clicked)
  useEffect(() => {
    if (!hasMoreQuestions || questionsLoadingMore || !qaTabClicked) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadMoreQuestions();
          }
        });
      },
      {
        rootMargin: '100px', // Start loading when 100px away from bottom
        threshold: 0.1
      }
    );

    // Observe the last question element for infinite scroll
    const lastQuestionElement = document.querySelector('[data-question-item]:last-child');
    if (lastQuestionElement) {
      observer.observe(lastQuestionElement);
    }

    return () => {
      if (lastQuestionElement) {
        observer.unobserve(lastQuestionElement);
      }
    };
  }, [hasMoreQuestions, questionsLoadingMore, loadMoreQuestions, questions, qaTabClicked]);







  // Function to fetch replies for a question
  const fetchQuestionReplies = useCallback(async (questionId: number) => {
    if (!product) return;
    
    setQuestionRepliesLoading(prev => ({ ...prev, [questionId]: true }));
    try {
      const response = await reviewService.getQuestionReplies(questionId);
      if (response.success) {
        // Filter out any replies that might have isActive: false (for backward compatibility)
        const activeReplies = response.replies.filter((reply: any) => reply.isActive !== false);
        setQuestionReplies(prev => ({ ...prev, [questionId]: activeReplies }));
      }
    } catch (error) {
      console.error('Error fetching replies:', error);
    } finally {
      setQuestionRepliesLoading(prev => ({ ...prev, [questionId]: false }));
    }
  }, [product]);

  // Function to submit a reply
  const handleSubmitQuestionReply = useCallback(async (questionId: number) => {
    if (!isAuthenticated) {
      toast.error('Please log in to reply');
      return;
    }

    const replyText = questionReplyForm[questionId]?.trim();
    if (!replyText) {
      toast.error('Please enter a reply');
      return;
    }

    setSubmittingQuestionReply(prev => ({ ...prev, [questionId]: true }));
    try {
      const token = await getToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await reviewService.submitQuestionReply(questionId, replyText, token);
      if (response.success) {
        // Add the new reply to the list
        setQuestionReplies(prev => ({
          ...prev,
          [questionId]: [...(prev[questionId] || []), response.reply]
        }));
        
        // Clear the reply form
        setQuestionReplyForm(prev => ({ ...prev, [questionId]: '' }));
        
        // Hide the reply form after successful submission
        setShowReplyForm(prev => {
          const newState = { ...prev };
          delete newState[questionId];
          return newState;
        });
        
        // Update the local questions state to reflect the reply count change
        setQuestions(prev => prev.map(question => {
          if (question.id === questionId && question._count?.replies !== undefined) {
            return {
              ...question,
              _count: {
                ...question._count,
                replies: question._count.replies + 1
              }
            };
          }
          return question;
        }));
        
        // Refresh the questions list to update the reply count from backend
        if (qaTabClicked) {
          await fetchQuestions(1);
        }
        
        // Also refresh the question count for the tab header
        await fetchQuestionCount();
        
        toast.success('Reply submitted successfully!');
      } else {
        toast.error(response.message || 'Failed to submit reply');
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
      toast.error('Failed to submit reply. Please try again.');
    } finally {
      setSubmittingQuestionReply(prev => ({ ...prev, [questionId]: false }));
    }
  }, [isAuthenticated, getToken, questionReplyForm]);

  // Function to toggle replies expansion
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const toggleQuestionReplies = useCallback((questionId: number) => {
    setExpandedQuestionReplies(prev => {
      const newState = { ...prev, [questionId]: !prev[questionId] };
      // If expanding and replies haven't been loaded yet, fetch them
      if (newState[questionId] && !questionReplies[questionId]) {
        fetchQuestionReplies(questionId);
      }
      return newState;
    });
  }, [questionReplies, fetchQuestionReplies]);

  // Function to toggle reply form visibility
  const toggleReplyForm = useCallback((questionId: number) => {
    setShowReplyForm(prev => {
      const newState = { ...prev, [questionId]: !prev[questionId] };
      return newState;
    });
  }, []);

  // Function to start editing a question reply
  const startEditingQuestionReply = useCallback((replyId: number, currentText: string) => {
    setEditingQuestionReplyId(replyId);
    setEditQuestionReplyForm(prev => ({ ...prev, [replyId]: currentText }));
  }, []);

  // Function to cancel editing a question reply
  const cancelEditingQuestionReply = useCallback(() => {
    setEditingQuestionReplyId(null);
    setEditQuestionReplyForm(prev => ({}));
  }, []);

  // Function to submit edited question reply
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSubmitEditedQuestionReply = useCallback(async (replyId: number) => {
    const editedText = editQuestionReplyForm[replyId]?.trim();
    if (!editedText) {
      toast.error('Please enter a reply');
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await reviewService.updateQuestionReply(replyId, editedText, token);
      if (response.success) {
        // Update the reply in the local state
        setQuestionReplies(prev => {
          const newState = { ...prev };
          Object.keys(newState).forEach(questionIdStr => {
            const questionId = parseInt(questionIdStr);
            if (newState[questionId]) {
              newState[questionId] = newState[questionId].map((reply: any) => 
                reply.id === replyId 
                  ? { ...reply, reply: editedText, updatedAt: new Date().toISOString() }
                  : reply
              );
            }
          });
          return newState;
        });

        // Clear edit state
        setEditingQuestionReplyId(null);
        setEditQuestionReplyForm(prev => ({}));
        
        // Refresh the questions list to update the reply count from backend
        if (qaTabClicked) {
          await fetchQuestions(1);
        }
        
        // Also refresh the question count for the tab header
        await fetchQuestionCount();
        
        toast.success('Reply updated successfully!');
      } else {
        toast.error(response.message || 'Failed to update reply');
      }
    } catch (error) {
      console.error('Error updating reply:', error);
      toast.error('Failed to update reply. Please try again.');
    }
  }, [editQuestionReplyForm, getToken, qaTabClicked, fetchQuestions, fetchQuestionCount]);

  // Function to show delete confirmation dialog
  const showDeleteQuestionReplyDialog = useCallback((replyId: number) => {
    setQuestionReplyToDelete(replyId);
    setShowQuestionReplyDeleteDialog(true);
  }, []);

  // Function to show question delete confirmation dialog
  const showDeleteQuestionDialog = useCallback((questionId: number) => {
    setQuestionToDelete(questionId);
    setShowQuestionDeleteDialog(true);
  }, []);

  // Function to toggle question expansion
  const toggleQuestionExpansion = useCallback((questionId: number) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  }, []);

  // Function to toggle reply text expansion
  const toggleReplyTextExpansion = useCallback((replyId: number) => {
    setExpandedReplyTexts(prev => ({
      ...prev,
      [replyId]: !prev[replyId]
    }));
  }, []);

  // Function to delete a question reply
  const handleDeleteQuestionReply = useCallback(async (replyId: number) => {

    try {
      const token = await getToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await reviewService.deleteQuestionReply(replyId, token);
      if (response.success) {
        // Clear edit state if it was the edited reply
        if (editingQuestionReplyId === replyId) {
          setEditingQuestionReplyId(null);
          setEditQuestionReplyForm(prev => ({}));
        }

        // Find which question this reply belongs to and update its local state
        let questionId: number | null = null;
        setQuestionReplies(prev => {
          const newState = { ...prev };
          Object.keys(newState).forEach(qIdStr => {
            const qId = parseInt(qIdStr);
            if (newState[qId]) {
              const replyIndex = newState[qId].findIndex((reply: any) => reply.id === replyId);
              if (replyIndex !== -1) {
                questionId = qId;
                newState[qId] = newState[qId].filter((reply: any) => reply.id !== replyId);
              }
            }
          });
          return newState;
        });

        // Update the local questions state to reflect the reply count change
        if (questionId) {
          setQuestions(prev => prev.map(question => {
            if (question.id === questionId && question._count?.replies) {
              return {
                ...question,
                _count: {
                  ...question._count,
                  replies: Math.max(0, question._count.replies - 1)
                }
              };
            }
            return question;
          }));
        }

        // Refresh the questions list to update the reply count from backend
        if (qaTabClicked) {
          await fetchQuestions(1);
        }
        
        // Also refresh the question count for the tab header
        await fetchQuestionCount();

        toast.success('Reply deleted successfully!');
      } else {
        toast.error(response.message || 'Failed to delete reply');
      }
    } catch (error) {
      console.error('Error deleting reply:', error);
      toast.error('Failed to delete reply. Please try again.');
    }
  }, [getToken, editingQuestionReplyId, qaTabClicked, fetchQuestions, fetchQuestionCount]);





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
        const colorImages = getImagesForColor(selectedColor);
        const selectedImage = colorImages.length > 0 ? colorImages[0] : product.images?.[0]?.url;
        addToCart(product, quantity, selectedColor, selectedSize, selectedImage);
        
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
        const colorImages = getImagesForColor(selectedColor);
        const selectedImage = colorImages.length > 0 ? colorImages[0] : product.images?.[0]?.url;
        addToCart(product, quantity, selectedColor, selectedSize, selectedImage);
        
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
        
        // Refresh questions to show the new question immediately
        if (qaTabClicked) {
          await fetchQuestions(1);
        }
        
        // Refresh question count
        await fetchQuestionCount();
        
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
        // Refresh questions to show the updated question immediately
        if (qaTabClicked) {
          await fetchQuestions(1);
        }
        // Refresh question count
        await fetchQuestionCount();
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
    if (!questionToDelete) {
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
        // Refresh questions to show the updated list immediately
        if (qaTabClicked) {
          await fetchQuestions(1);
        }
        // Refresh question count
        await fetchQuestionCount();
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
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-24 w-24 sm:h-32 sm:w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-destructive mb-4">Product Not Found</h2>
          <p className="text-muted-foreground mb-4 text-sm sm:text-base">{error || 'The product you are looking for does not exist.'}</p>
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
      <div className="container mx-auto px-4 py-2 sm:py-4">
        <nav className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground truncate">Home</Link>
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
          <Link to="/products" className="hover:text-foreground truncate">Products</Link>
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
          <span className="text-foreground truncate max-w-[120px] sm:max-w-none">{product.name}</span>
        </nav>
      </div>

      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <ProductImageGallery
              images={images}
              productName={product.name}
              colorImages={{
                [selectedColor]: getImagesForColor(selectedColor)
              }}
              defaultImages={images.map(img => img.url)}
              selectedColor={selectedColor}
              productId={product.id}
              onImagesLoaded={handleImagesLoaded}
              enableLazyLoading={false}
            />
          </div>

          {/* Product Info */}
          <div className="space-y-4 sm:space-y-6">
            {/* Product Header */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <h1 className="text-2xl sm:text-3xl font-bold leading-tight">{product.name}</h1>
                  <div className="flex flex-wrap gap-2">
                    {isProductInCart && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 text-xs">
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        In Cart ({cartItemQuantity})
                      </Badge>
                    )}
                    {!isProductInCart && isProductInCartAnyVariantCheck && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        In Cart (No Variants)
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <WishlistButton product={product} size="icon" />
                  <Button size="sm" variant="outline" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Rating */}
              <div className="mb-4">
                <RatingDisplay
                  rating={product.averageRating}
                  reviewCount={product.reviewCount}
                  size="md"
                  showCount={false}
                />
                <span className="text-sm text-muted-foreground">
                  {product.averageRating ? `${product.averageRating.toFixed(1)} out of 5` : 'No rating yet'} 
                  {product.reviewCount && product.reviewCount > 0 ? ` (${product.reviewCount} reviews)` : ''}
                </span>
              </div>

              {/* Price */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
                <div className="flex items-center gap-2 sm:gap-4">
                  <span className="text-2xl sm:text-3xl font-bold text-primary">
                    {formatPrice(product.salePrice || product.price)}
                  </span>
                  {product.comparePrice && product.comparePrice > product.price && (
                    <span className="text-lg sm:text-xl text-muted-foreground line-through">
                      {formatPrice(product.comparePrice)}
                    </span>
                  )}
                </div>
                {product.isOnSale && (
                  <Badge className="bg-red-500 w-fit">
                    {Math.round(((product.comparePrice || 0) - (product.salePrice || product.price)) / (product.comparePrice || 1) * 100)}% OFF
                  </Badge>
                )}
              </div>
            </div>

            {/* Size Selection */}
            {availableSizes.length > 0 && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                  <h3 className="text-sm font-medium">Size: {selectedSize}</h3>
                  <SizeChart />
                </div>
                <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => handleSizeChange(size)}
                      className={`px-3 py-2 border rounded-md transition-all text-sm ${
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
                <h3 className="text-sm font-medium mb-3">Color: {selectedColor}</h3>
                <div className="grid grid-cols-6 sm:flex sm:flex-wrap gap-3">
                  {Array.from(new Set(product.variants.map(v => v.color))).map((colorName) => {
                    const variant = product.variants?.find(v => v.color === colorName);
                    const inStock = variant ? variant.stock > 0 : false;
                    return (
                      <button
                        key={colorName}
                        onClick={() => handleColorChange(colorName)}
                        disabled={!inStock}
                        className={`
                          w-10 h-10 sm:w-8 sm:h-8 rounded-full border-2 transition-all relative
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
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="h-12 w-12 sm:h-10 sm:w-10 p-0"
                >
                  <Minus className="h-5 w-5 sm:h-4 sm:w-4" />
                </Button>
                <span className="w-20 sm:w-16 text-center text-lg font-semibold px-3 py-2 bg-muted rounded-md">
                  {quantity}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuantityChange(1)}
                  className="h-12 w-12 sm:h-10 sm:w-10 p-0"
                >
                  <Plus className="h-5 w-5 sm:h-4 sm:w-4" />
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
            <div className="flex flex-col gap-3">
              <Button 
                size="lg" 
                className={`w-full h-14 sm:h-12 ${
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
                    <Check className="h-5 w-5 sm:h-4 sm:w-4 mr-2" />
                    {isProductInCart ? 'Cart Updated!' : 'Added to Cart!'}
                  </>
                ) : isProductInCart ? (
                  <>
                    <ShoppingCart className="h-5 w-5 sm:h-4 sm:w-4 mr-2" />
                    Update Cart
                  </>
                ) : isProductInCartAnyVariantCheck ? (
                  <>
                    <ShoppingCart className="h-5 w-5 sm:h-4 sm:w-4 mr-2" />
                    Add with Variants
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5 sm:h-4 sm:w-4 mr-2" />
                    Add to Cart
                  </>
                )}
              </Button>
              <Button size="lg" variant="outline" className="w-full h-14 sm:h-12">
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

            {/* Cart Variants Section - Show all variants of this product in cart */}
            {product && getProductVariants(product.id).length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-blue-600" />
                  Cart Variants ({getProductVariants(product.id).length})
                </h4>
                <div className="space-y-3">
                  {getProductVariants(product.id).map((cartItem, index) => (
                    <div 
                      key={`${cartItem.id}-${cartItem.selectedColor}-${cartItem.selectedSize}`}
                      className={`flex items-center justify-between p-3 rounded-md border ${
                        cartItem.selectedColor === selectedColor && cartItem.selectedSize === selectedSize
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md overflow-hidden">
                          <img 
                            src={cartItem.image || '/placeholder-image.jpg'} 
                            alt={cartItem.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{cartItem.name}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            {cartItem.selectedColor && (
                              <span className="flex items-center gap-1">
                                <span className="w-3 h-3 rounded-full border border-gray-300" 
                                      style={{ backgroundColor: cartItem.selectedColor }}></span>
                                {cartItem.selectedColor}
                              </span>
                            )}
                            {cartItem.selectedSize && (
                              <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                                Size: {cartItem.selectedSize}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          Qty: {cartItem.quantity}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            removeFromCart(cartItem.id, cartItem.selectedColor, cartItem.selectedSize);
                            addInteraction({
                              type: 'cart_remove',
                              targetId: cartItem.id.toString(),
                              targetType: 'product',
                              data: { 
                                productName: cartItem.name, 
                                color: cartItem.selectedColor, 
                                size: cartItem.selectedSize 
                              }
                            });
                          }}
                          className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 h-8 px-2"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-600 mt-3">
                  💡 You can add the same product with different colors and sizes. Each variant is treated as a separate cart item.
                </p>
              </div>
            )}

            {/* Helpful Tip for Multiple Variants */}
            {product && getProductVariants(product.id).length === 0 && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  Shopping Tip
                </h4>
                <p className="text-sm text-blue-800">
                  💡 Want to try different sizes or colors? You can add the same product multiple times with different variants! 
                  Each combination of color and size will be treated as a separate cart item, making it easy to compare and choose.
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

        {/* Product Details Tabs - Clean & Simple Design */}
        <div className="mt-12 sm:mt-16">
          <Tabs value={activeTab} onValueChange={(value) => {
            setActiveTab(value);
            if (value === 'reviews') {
              handleReviewsTabClick();
            } else if (value === 'qa') {
              handleQATabClick();
            }
          }}>
            <TabsList className="flex w-full bg-gradient-to-br from-slate-50 via-white to-slate-50 p-1.5 rounded-xl shadow-md border border-slate-200/50 gap-1">
              <TabsTrigger 
                value="description" 
                className="h-10 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-slate-100 text-center relative overflow-hidden group"
              >
                Description
              </TabsTrigger>
              
              <TabsTrigger 
                value="reviews" 
                className="h-10 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-slate-100 text-center relative overflow-hidden group"
              >
                Reviews {product.reviewCount && product.reviewCount > 0 ? `(${product.reviewCount})` : ''}
              </TabsTrigger>
              
              <TabsTrigger 
                value="qa" 
                className="h-10 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-slate-100 text-center relative overflow-hidden group"
              >
                Q&A {questionCount > 0 ? `(${questionCount})` : ''}
              </TabsTrigger>
              
              <TabsTrigger 
                value="shipping" 
                className="h-10 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-slate-100 text-center relative overflow-hidden group"
              >
                Shipping
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-4 sm:mt-6">
              <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-slate-50/30">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl sm:text-2xl font-bold text-center sm:text-left bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    Product Description
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  <div className="bg-white/60 p-4 sm:p-6 rounded-xl border border-slate-200/50 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium text-slate-600 uppercase tracking-wide">About This Product</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed text-base sm:text-lg font-medium">
                      {product.description}
                    </p>
                  </div>
                  
                  {product.tags && product.tags.length > 0 && (
                    <div className="bg-white/60 p-4 sm:p-6 rounded-xl border border-slate-200/50 shadow-sm">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <h4 className="font-semibold text-lg sm:text-xl text-slate-800">
                          Product Tags
                        </h4>
                      </div>
                      <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                        {product.tags.map((tag) => (
                          <Badge 
                            key={tag} 
                            variant="secondary" 
                            className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 shadow-sm"
                          >
                            #{tag}
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
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                        <span>Customer Reviews</span>
                        {product.reviewCount && product.reviewCount > 0 && (
                          <Badge variant="secondary" className="text-sm w-fit">
                            {product.reviewCount} reviews
                          </Badge>
                        )}
                      </CardTitle>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                        <div className="flex flex-col items-center sm:items-start">
                          <RatingDisplay
                            rating={product.averageRating}
                            reviewCount={product.reviewCount}
                            size="md"
                            showCount={false}
                          />
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 mt-1 text-center sm:text-left">
                            {product.averageRating ? (
                              <>
                                <span className="text-xl sm:text-lg font-semibold text-primary">
                                  {product.averageRating.toFixed(1)}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  out of 5
                                </span>
                              </>
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                No rating yet
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Rating Distribution Chart - Mobile Optimized */}
                        {product.reviews && product.reviews.length > 0 && (
                          <div className="flex-1 max-w-xs sm:max-w-none">
                            <h4 className="text-sm font-medium mb-3 text-center sm:text-left">Rating Distribution</h4>
                            <div className="space-y-2">
                              {[5, 4, 3, 2, 1].map((rating) => {
                                const count = product.reviews?.filter(r => r.rating === rating).length || 0;
                                const percentage = product.reviewCount ? (count / product.reviewCount) * 100 : 0;
                                return (
                                  <div key={rating} className="flex items-center gap-2 sm:gap-3">
                                    <div className="flex items-center gap-1 w-6 sm:w-8">
                                      <span className="text-xs text-muted-foreground">{rating}</span>
                                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    </div>
                                    <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-[60px]">
                                      <div 
                                        className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${percentage}%` }}
                                      />
                                    </div>
                                    <span className="text-xs text-muted-foreground w-6 sm:w-8 text-right">
                                      {count}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      {!userHasReviewed && (
                        <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full sm:w-auto">
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
                        <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-muted-foreground text-center sm:text-left">
                          <Star className="h-4 w-4 text-green-600" />
                          <span>You have already reviewed this product</span>
                        </div>
                      )}
                    </div>
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
                      {/* Review Filters - Mobile Optimized */}
                      <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
                        {/* Rating Filter */}
                        <div className="space-y-2">
                          <span className="text-sm font-medium block">Filter by Rating:</span>
                          <div className="grid grid-cols-5 gap-2">
                            {[5, 4, 3, 2, 1].map((rating) => (
                              <Button
                                key={rating}
                                variant={selectedRating === rating ? "default" : "outline"}
                                size="sm"
                                className="h-10 px-2 text-xs"
                                onClick={() => handleRatingFilter(selectedRating === rating ? null : rating)}
                              >
                                {rating}★
                              </Button>
                            ))}
                          </div>
                        </div>
                        
                        {/* Sort Options */}
                        <div className="space-y-2">
                          <span className="text-sm font-medium block">Sort by:</span>
                          <div className="flex flex-wrap gap-2">
                            <Button 
                              variant={sortBy === 'recent' ? "default" : "outline"}
                              size="sm" 
                              className="h-10 px-3 text-xs flex-1 sm:flex-none"
                              onClick={() => handleSortChange('recent')}
                            >
                              Most Recent
                            </Button>
                            <Button 
                              variant={sortBy === 'helpful' ? "default" : "outline"}
                              size="sm" 
                              className="h-10 px-3 text-xs flex-1 sm:flex-none"
                              onClick={() => handleSortChange('helpful')}
                            >
                              Only Helpful
                            </Button>
                          </div>
                        </div>
                        
                        {/* Clear Filters */}
                        {(selectedRating !== null || sortBy !== 'recent') && (
                          <div className="pt-2 border-t">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="w-full h-10 text-red-600 hover:text-red-800"
                              onClick={resetFilters}
                            >
                              Clear All Filters
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Filter Description */}
                      <div className="text-xs text-muted-foreground px-3 text-center sm:text-left">
                        <span className="font-medium">Helpful Filter:</span> Shows only reviews that have been marked as helpful by other users
                      </div>

                      {/* Filter Summary - Mobile Optimized */}
                      {(selectedRating !== null || sortBy !== 'recent') && (
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-blue-800 text-center sm:text-left">Active Filters:</span>
                            <div className="flex flex-wrap justify-center sm:justify-start gap-2">
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
                            </div>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-center sm:text-left">
                            <span className="text-sm text-blue-600">
                              {filtersLoading ? 'Updating...' : `${reviewsTotal} reviews found`}
                            </span>
                            {sortBy === 'helpful' && !filtersLoading && (
                              <span className="text-xs text-blue-600">
                                ({reviews.filter((r: any) => r.helpfulCount > 0).length} with helpful votes)
                              </span>
                            )}
                            {filtersLoading && (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto sm:mx-0"></div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Reviews List - Mobile Optimized */}
                      {reviews.map((review) => (
                        <div key={review.id} data-review-item className="border-b pb-6 last:border-b-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                            <div className="flex items-start gap-3">
                              <UserAvatar user={review.user} size="md" />
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                  <p className="font-medium text-base">{review.user?.name || 'Anonymous'}</p>
                                  <div className="flex flex-wrap gap-2">
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
                                </div>
                                
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`h-4 w-4 sm:h-3 sm:w-3 ${
                                            i < review.rating
                                              ? 'fill-yellow-400 text-yellow-400'
                                              : 'text-gray-300'
                                          }`}
                                        />
                                      ))}
                                    </div>
                                    <span className="text-sm text-muted-foreground font-medium">
                                      {review.rating}.0
                                    </span>
                                  </div>
                                  {review.helpfulCount > 0 && (
                                    <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                      ✓ {review.helpfulCount} helpful
                                    </span>
                                  )}
                                </div>
                                
                                {review.title && (
                                  <h4 className="font-medium mb-2 text-base">{review.title}</h4>
                                )}
                                <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">{review.comment}</p>
                                
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
                          
                          {/* Review Actions - Horizontal & Left-Aligned */}
                          {editingReviewId !== review.id && replyingToReview !== review.id && (
                            <div className="mt-4">
                              {review.status === 'APPROVED' ? (
                                <div className="flex items-center gap-3">
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
                                </div>
                              ) : review.status === 'PENDING' && isAuthenticated ? (
                                <div className="flex items-center gap-3">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => startEditingReview(review)}
                                    className="h-8 px-3 text-xs"
                                    disabled={replyingToReview === review.id}
                                  >
                                    <Edit className="h-3 w-3 mr-1" />
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteReview(review.id)}
                                    className="h-8 px-3 text-xs text-red-500 hover:text-red-700"
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

            <TabsContent value="qa" className="mt-4 sm:mt-6">
              <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-slate-50/30">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="text-center sm:text-left">
                      <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
                        Questions & Answers
                      </CardTitle>
                      <Badge variant="secondary" className="text-sm bg-blue-100 text-blue-700 border-blue-200">
                        {qaTabClicked && questionsTotal > 0 ? questionsTotal : '0'} questions
                      </Badge>
                    </div>
                    <Dialog open={showQuestionDialog} onOpenChange={setShowQuestionDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full sm:w-auto h-10 sm:h-9">
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
                  {!qaTabClicked ? (
                    // Show placeholder when Q&A tab hasn't been clicked yet
                    <div className="text-center py-6 sm:py-8">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-200/50">
                        <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold mb-2 text-slate-800">Click to load Q&A</h3>
                      <p className="text-sm sm:text-base text-slate-600 mb-4 px-4">
                        Click on the Q&A tab to load questions and answers for this product
                      </p>
                    </div>
                  ) : questionsLoading ? (
                    // Show loading state
                    <div className="text-center py-6 sm:py-8">
                      <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <span className="text-sm sm:text-base text-slate-600">Loading questions...</span>
                    </div>
                  ) : questions.length > 0 ? (
                    // Show loaded questions
                    <div className="space-y-4 sm:space-y-6">
                      {questions.map((question) => (
                        <div key={question.id} className={`p-4 sm:p-6 border rounded-xl shadow-sm ${
                          question.status === 'PENDING' ? 'border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100/50' : 
                          question.status === 'ANSWERED' ? 'border-purple-300 bg-gradient-to-br from-purple-50 to-purple-100/50' :
                          question.status === 'REJECTED' ? 'border-red-300 bg-gradient-to-br from-red-50 to-red-100/50' :
                          'border-slate-200 bg-gradient-to-br from-white to-slate-50/50'
                        }`} data-question-item>
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                            <div className="flex items-center gap-3">
                              {question.user?.avatar ? (
                                <img 
                                  src={question.user.avatar} 
                                  alt={question.user.name || 'User'} 
                                  className="w-10 h-10 sm:w-8 sm:h-8 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 sm:w-8 sm:h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-medium text-primary">
                                    {question.user?.name?.charAt(0) || 'U'}
                                  </span>
                                </div>
                              )}
                              <div>
                                <p className="font-semibold text-base sm:text-sm text-slate-800">{question.user?.name || 'Anonymous'}</p>
                                <p className="text-xs text-slate-600">
                                  {formatDate(question.createdAt)}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              {/* Only show status badge for non-approved questions */}
                              {question.status !== 'APPROVED' && (
                                <Badge variant="outline" className={`text-xs px-2 py-1 ${
                                  question.status === 'PENDING' ? 'bg-blue-100 text-blue-700 border-blue-300' : 
                                  question.status === 'ANSWERED' ? 'bg-purple-100 text-purple-700 border-purple-300' :
                                  question.status === 'REJECTED' ? 'bg-gray-100 text-gray-700 border-gray-300' :
                                  'bg-gray-100 text-gray-700 border-gray-300'
                                }`}>
                                  {question.status === 'PENDING' ? 'Pending' : 
                                   question.status === 'ANSWERED' ? 'Answered' : 
                                   question.status === 'REJECTED' ? 'Rejected' : 'Unknown'}
                                </Badge>
                              )}
                              {/* Show edit/delete buttons only for pending questions owned by current user */}
                              {question.status === 'PENDING' && isAuthenticated && currentUserDbId === question.userId && (
                                <div className="flex items-center gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => startEditingQuestion(question)}
                                    className="h-8 w-8 sm:h-6 sm:w-6 p-0"
                                  >
                                    <Edit className="h-4 w-4 sm:h-3 sm:w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => showDeleteQuestionDialog(question.id)}
                                    className="h-8 w-8 sm:h-6 sm:w-6 p-0 text-red-500 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4 sm:h-3 sm:w-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            {editingQuestionId === question.id ? (
                              // Edit Mode
                              <div className="space-y-3">
                                <Textarea
                                  value={editQuestionForm.question}
                                  onChange={(e) => setEditQuestionForm(prev => ({ ...prev, question: e.target.value }))}
                                  placeholder="Your question"
                                  rows={3}
                                  className="text-sm border-slate-200 focus:border-blue-500 resize-none"
                                />
                                <div className="flex items-center gap-3">
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={saveQuestionEdit} 
                                    className="h-8 px-3 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium"
                                  >
                                    Save
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={cancelEdit} 
                                    className="h-8 px-3 text-sm text-slate-600 hover:text-slate-700 hover:bg-slate-50 font-medium"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              // Display Mode
                              <>
                                <div className="mb-3">
                                  <p 
                                    className={`text-base sm:text-sm font-medium text-slate-800 leading-relaxed transition-all duration-300 ${
                                      expandedQuestions[question.id] ? '' : 'line-clamp-[3]'
                                    }`}
                                  >
                                    {question.question}
                                  </p>
                                  {question.question.length > 100 && (
                                    <button
                                      onClick={() => toggleQuestionExpansion(question.id)}
                                      className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
                                    >
                                      {expandedQuestions[question.id] ? (
                                        <>
                                          <span>Show less</span>
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                          </svg>
                                        </>
                                      ) : (
                                        <>
                                          <span>Show more</span>
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                          </svg>
                                        </>
                                      )}
                                    </button>
                                  )}
                                </div>
                                {question.answer && (
                                  <div className="pl-4 border-l-2 border-primary/20">
                                    <p className="text-sm text-muted-foreground mb-1">
                                      <span className="font-medium text-primary">Answer:</span>
                                    </p>
                                    <p className="text-sm">{question.answer}</p>
                                  </div>
                                )}
                              </>
                            )}
                          </div>

                          {/* Question Replies Section */}
                          <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                            {/* Reply Button - Only visible when NOT showing reply form AND question is approved */}
                            {isAuthenticated && !showReplyForm[question.id] && question.status === 'APPROVED' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleReplyForm(question.id)}
                                className="w-full sm:w-auto h-10 sm:h-8 text-sm font-medium border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
                              >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                Reply
                              </Button>
                            )}

                            {/* Reply Form - Shows in place of Reply button when active AND question is approved */}
                            {isAuthenticated && showReplyForm[question.id] && question.status === 'APPROVED' && (
                              <div className="w-full sm:w-auto">
                                <div className="space-y-3">
                                                                      <Textarea
                                      placeholder="Write a reply..."
                                      value={questionReplyForm[question.id] || ''}
                                      onChange={(e) => setQuestionReplyForm(prev => ({ 
                                        ...prev, 
                                        [question.id]: e.target.value 
                                      }))}
                                      className="w-full text-sm sm:text-base border-blue-200 focus:border-blue-500 focus:ring-blue-500 resize-none"
                                      rows={3}
                                      disabled={submittingQuestionReply[question.id]}
                                    />
                                  <div className="flex items-center gap-3">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleSubmitQuestionReply(question.id)}
                                      disabled={submittingQuestionReply[question.id] || !questionReplyForm[question.id]?.trim()}
                                      className="h-8 px-3 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium"
                                    >
                                      {submittingQuestionReply[question.id] ? (
                                        <>
                                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                                          Sending...
                                        </>
                                      ) : (
                                        'Submit'
                                      )}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => toggleReplyForm(question.id)}
                                      className="h-8 px-3 text-sm text-slate-600 hover:text-slate-700 hover:bg-slate-50 font-medium"
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Pending Question Message - Shows when question is pending */}
                            {question.status === 'PENDING' && (
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Question pending approval - replies will be enabled once approved</span>
                              </div>
                            )}

                            {/* Show Replies Button - Only visible if there are replies */}
                            {question._count?.replies > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleQuestionReplies(question.id)}
                                className="w-full sm:w-auto h-10 sm:h-8 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                              >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                                {expandedQuestionReplies[question.id] ? 'Hide' : 'Show'} Replies
                                <span className="ml-2 text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded-full font-medium">
                                  {question._count.replies}
                                </span>
                              </Button>
                            )}
                          </div>

                                                    {/* Replies Display */}
                          {expandedQuestionReplies[question.id] && (
                            <div className="mt-4 space-y-3">
                              {/* Replies Display */}
                              {question._count?.replies > 0 && (
                                <div>
                                  {questionRepliesLoading[question.id] ? (
                                    <div className="text-center py-4">
                                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                      <span className="text-sm text-slate-600">Loading replies...</span>
                                    </div>
                                  ) : questionReplies[question.id]?.length > 0 ? (
                                                                        <div className="max-h-96 overflow-y-auto space-y-4 pl-4 sm:pl-6 border-l-2 border-blue-200 pr-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 hover:scrollbar-thumb-slate-400 relative">
                                      {/* Scroll indicator overlay */}
                                      <div className="absolute top-0 right-0 w-2 h-8 bg-gradient-to-b from-slate-200/50 to-transparent pointer-events-none rounded-l-full"></div>
                                      <div className="absolute bottom-0 right-0 w-2 h-8 bg-gradient-to-t from-slate-200/50 to-transparent pointer-events-none rounded-l-full"></div>
                                      {questionReplies[question.id].map((reply) => (
                                        <div key={reply.id} className="py-3 px-4 bg-white/60 rounded-lg border border-slate-200/50 shadow-sm">
                                          <div className="flex items-start gap-3 mb-3">
                                            {reply.user?.avatar ? (
                                              <img 
                                                src={reply.user.avatar} 
                                                alt={reply.user.name || 'User'} 
                                                className="w-8 h-8 sm:w-6 sm:h-6 rounded-full object-cover"
                                              />
                                            ) : (
                                              <div className="w-8 h-8 sm:w-6 sm:h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                                <span className="text-sm sm:text-xs font-medium text-white">
                                                  {reply.user?.name?.charAt(0) || 'U'}
                                                </span>
                                              </div>
                                            )}
                                            <div className="flex-1">
                                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                                <span className="text-base sm:text-sm font-semibold text-slate-800">{reply.user?.name || 'Anonymous'}</span>
                                                {reply.user?.role === 'ADMIN' && (
                                                  <Badge variant="secondary" className="w-fit text-xs bg-purple-100 text-purple-700 border-purple-300">
                                                    Author
                                                  </Badge>
                                                )}
                                                <span className="text-xs text-slate-600">
                                                  {formatDate(reply.createdAt)}
                                                </span>
                                              </div>
                                            
                                            {/* Reply Content - Edit Mode or Display Mode */}
                                            {editingQuestionReplyId === reply.id ? (
                                              <div className="mt-3">
                                                <Textarea
                                                  value={editQuestionReplyForm[reply.id] || ''}
                                                  onChange={(e) => setEditQuestionReplyForm(prev => ({ 
                                                    ...prev, 
                                                    [reply.id]: e.target.value 
                                                  }))}
                                                  className="text-sm sm:text-base mb-3 border-slate-200 focus:border-blue-500 resize-none"
                                                  rows={3}
                                                />
                                                <div className="flex items-center gap-3">
                                                  <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleSubmitEditedQuestionReply(reply.id)}
                                                    className="h-8 px-3 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium"
                                                  >
                                                    Save
                                                  </Button>
                                                  <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={cancelEditingQuestionReply}
                                                    className="h-8 px-3 text-sm text-slate-600 hover:text-slate-700 hover:bg-slate-50 font-medium"
                                                  >
                                                    Cancel
                                                  </Button>
                                                </div>
                                              </div>
                                            ) : (
                                              <div>
                                                <p 
                                                  className={`text-sm sm:text-base text-slate-700 leading-relaxed transition-all duration-300 ${
                                                    expandedReplyTexts[reply.id] ? '' : 'line-clamp-[3]'
                                                  }`}
                                                >
                                                  {reply.reply}
                                                </p>
                                                {reply.reply.length > 80 && (
                                                  <button
                                                    onClick={() => toggleReplyTextExpansion(reply.id)}
                                                    className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
                                                  >
                                                    {expandedReplyTexts[reply.id] ? (
                                                      <>
                                                        <span>Show less</span>
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                        </svg>
                                                      </>
                                                    ) : (
                                                      <>
                                                        <span>Show more</span>
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                      </>
                                                    )}
                                                  </button>
                                                )}
                                              </div>
                                            )}
                                            
                                            {/* Action Buttons - Only show for the reply author when NOT editing */}
                                            {isAuthenticated && currentUserDbId && reply.user?.id === currentUserDbId && editingQuestionReplyId !== reply.id && (
                                              <div className="flex items-center gap-2 mt-3">
                                                <Button
                                                  size="sm"
                                                  variant="ghost"
                                                  onClick={() => startEditingQuestionReply(reply.id, reply.reply)}
                                                  className="h-8 sm:h-6 px-3 sm:px-2 text-xs sm:text-xs text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                                                >
                                                  <svg className="w-3 h-3 sm:w-3 sm:h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                  </svg>
                                                  Edit
                                                </Button>
                                                <Button
                                                  size="sm"
                                                  variant="ghost"
                                                  onClick={() => showDeleteQuestionReplyDialog(reply.id)}
                                                  className="h-8 sm:h-6 px-3 sm:px-2 text-xs sm:text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                  <svg className="w-3 h-3 sm:w-3 sm:h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                  </svg>
                                                  Delete
                                                </Button>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                    </div>
                                  ) : (
                                    <div className="text-center py-6 px-4">
                                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                      </div>
                                      <p className="text-sm text-slate-600 font-medium">No replies yet</p>
                                      <p className="text-xs text-slate-500 mt-1">Be the first to share your thoughts!</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Infinite Scroll Loading Indicator */}
                      {questionsLoadingMore && (
                        <div className="flex items-center justify-center gap-2 mt-6 py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                          <span className="text-sm text-muted-foreground">Loading more questions...</span>
                        </div>
                      )}
                      
                      {/* End of Questions Message */}
                      {!hasMoreQuestions && questions.length > 0 && (
                        <div className="text-center py-6 text-sm text-muted-foreground">
                          <div className="w-8 h-8 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-2">
                            <MessageSquare className="h-4 w-4" />
                          </div>
                          You've reached the end of all questions
                        </div>
                      )}
                    </div>
                  ) : (
                    // Show no questions message
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
                  )}
                  
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


                    
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="shipping" className="mt-4 sm:mt-6">
              <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-slate-50/30">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl sm:text-2xl font-bold text-center sm:text-left bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    Shipping & Returns
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 sm:space-y-8">
                  <div className="bg-white/60 p-4 sm:p-6 rounded-xl border border-slate-200/50 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-lg sm:text-xl text-slate-800">Shipping Information</h4>
                    </div>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 p-2 rounded-lg hover:bg-blue-50/50 transition-colors">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <span className="text-sm sm:text-base text-slate-700 font-medium">Free shipping on orders over $50</span>
                          <p className="text-xs text-slate-500 mt-1">No hidden fees or additional charges</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3 p-2 rounded-lg hover:bg-blue-50/50 transition-colors">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <span className="text-sm sm:text-base text-slate-700 font-medium">Standard delivery: 3-5 business days</span>
                          <p className="text-xs text-slate-500 mt-1">Most popular shipping option</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3 p-2 rounded-lg hover:bg-blue-50/50 transition-colors">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <span className="text-sm sm:text-base text-slate-700 font-medium">Express delivery: 1-2 business days</span>
                          <p className="text-xs text-slate-500 mt-1">Priority handling and faster delivery</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3 p-2 rounded-lg hover:bg-blue-50/50 transition-colors">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <span className="text-sm sm:text-base text-slate-700 font-medium">International shipping available</span>
                          <p className="text-xs text-slate-500 mt-1">Worldwide delivery to most countries</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-white/60 p-4 sm:p-6 rounded-xl border border-slate-200/50 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-lg sm:text-xl text-slate-800">Return Policy</h4>
                    </div>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 p-2 rounded-lg hover:bg-green-50/50 transition-colors">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <span className="text-sm sm:text-base text-slate-700 font-medium">30-day return window</span>
                          <p className="text-xs text-slate-500 mt-1">Plenty of time to decide if it's right for you</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3 p-2 rounded-lg hover:bg-green-50/50 transition-colors">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <span className="text-sm sm:text-base text-slate-700 font-medium">Free returns for defective items</span>
                          <p className="text-xs text-slate-500 mt-1">We cover all return shipping costs</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3 p-2 rounded-lg hover:bg-green-50/50 transition-colors">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <span className="text-sm sm:text-base text-slate-700 font-medium">Return shipping label provided</span>
                          <p className="text-xs text-slate-500 mt-1">Pre-paid label for easy returns</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3 p-2 rounded-lg hover:bg-green-50/50 transition-colors">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <span className="text-sm sm:text-base text-slate-700 font-medium">Full refund or exchange available</span>
                          <p className="text-xs text-slate-500 mt-1">Your choice - money back or different item</p>
                        </div>
                      </li>
                    </ul>
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
        <div className="mt-8 sm:mt-16">
          <FrequentlyBoughtTogether 
            currentProduct={product}
            relatedProducts={relatedProducts}
          />
        </div>

        {/* Recently Viewed Products */}
        <div className="mt-8 sm:mt-16">
          <RecentlyViewedProducts />
        </div>

        {/* Related Products */}
        <div className="mt-8 sm:mt-16">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {relatedProducts.slice(0, 8).map((product) => (
                  <Card 
                    key={product.id} 
                    className="group cursor-pointer transition-all hover:shadow-lg hover:scale-105"
                    onClick={() => window.location.href = `/products/${product.slug}`}
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
                      
                      <RatingDisplay
                        rating={product.averageRating}
                        reviewCount={product.reviewCount}
                        size="sm"
                        className="mb-2"
                      />

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {product.comparePrice && product.comparePrice > product.price ? (
                            <>
                              <span className="font-semibold text-primary">
                                {formatPrice(product.price)}
                              </span>
                              <span className="text-sm text-muted-foreground line-through">
                                {formatPrice(product.comparePrice)}
                              </span>
                            </>
                          ) : (
                            <span className="font-semibold text-primary">
                              {formatPrice(product.price)}
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
                          window.location.href = `/products/${product.slug}`;
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

      {/* Delete Question Confirmation Dialog */}
      <Dialog open={showQuestionDeleteDialog} onOpenChange={setShowQuestionDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              Delete Question
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this question? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                This question and all its replies will be permanently removed.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowQuestionDeleteDialog(false);
                  setQuestionToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  if (questionToDelete) {
                    await handleDeleteQuestion(questionToDelete);
                    setShowQuestionDeleteDialog(false);
                    setQuestionToDelete(null);
                  }
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Question
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Question Reply Confirmation Dialog */}
      <Dialog open={showQuestionReplyDeleteDialog} onOpenChange={setShowQuestionReplyDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              Delete Reply
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this reply? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                This reply will be permanently removed from the question.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowQuestionReplyDeleteDialog(false);
                  setQuestionReplyToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  if (questionReplyToDelete) {
                    await handleDeleteQuestionReply(questionReplyToDelete);
                    setShowQuestionReplyDeleteDialog(false);
                    setQuestionReplyToDelete(null);
                  }
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Reply
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductDetail;
