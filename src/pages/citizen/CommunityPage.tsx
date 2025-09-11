import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const CommunityPage: React.FC = () => {
  const { user } = useAuth();
  const [showSystemReview, setShowSystemReview] = useState(false);
  const [systemReview, setSystemReview] = useState({
    title: '',
    content: '',
    rating: 5,
    category: ''
  });
  const [isSubmittingSystemReview, setIsSubmittingSystemReview] = useState(false);
  const [systemReviewSubmitted, setSystemReviewSubmitted] = useState(false);

  // Add state for system reviews
  const [systemReviews, setSystemReviews] = useState<any[]>([]);
  const [loadingSystemReviews, setLoadingSystemReviews] = useState(true);
  const [ratingFilter, setRatingFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Fetch all reviews on mount
  useEffect(() => {
    const fetchAllReviews = async () => {
      setLoadingSystemReviews(true);
      try {
        const response = await fetch('http://localhost:5000/api/v1/reviews');
        const data = await response.json();
        if (response.ok && data.data && data.data.reviews) {
          setSystemReviews(data.data.reviews);
        } else {
          setSystemReviews([]);
        }
      } catch (err) {
        setSystemReviews([]);
      } finally {
        setLoadingSystemReviews(false);
      }
    };
    fetchAllReviews();
  }, []);

  const handleSystemReviewChange = (field: 'title' | 'content' | 'rating' | 'category', value: string | number) => {
    setSystemReview(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitSystemReview = async () => {
    if (!systemReview.title.trim() || !systemReview.content.trim() || !systemReview.rating || !systemReview.category) {
      alert('Please fill in all fields, select a category, and select a rating.');
      return;
    }
    if (!user || !user.token) {
      alert('You must be logged in to submit a system review.');
      return;
    }
    setIsSubmittingSystemReview(true);
    try {
      const response = await fetch('http://localhost:5000/api/v1/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({
          type: 'system',
          title: systemReview.title,
          content: systemReview.content,
          rating: systemReview.rating,
          category: systemReview.category
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to submit system review');
      setSystemReviewSubmitted(true);
      setTimeout(() => {
        setSystemReview({ title: '', content: '', rating: 5, category: '' });
        setShowSystemReview(false);
        setSystemReviewSubmitted(false);
      }, 2000);
    } catch (error: any) {
      alert(error.message || 'Failed to submit system review.');
    } finally {
      setIsSubmittingSystemReview(false);
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleSystemReviewChange('rating', star)}
          className={`w-8 h-8 focus:outline-none ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300 hover:text-yellow-200'}`}
        >
          <Star className="w-full h-full" />
        </button>
      ))}
      <span className="ml-2 text-lg font-medium text-gray-900">{rating}/5</span>
    </div>
  );

  // Filter reviews before displaying
  const filteredReviews = systemReviews.filter((review: any) => {
    const matchesRating = ratingFilter === 'all' || review.rating === parseInt(ratingFilter);
    const matchesCategory = categoryFilter === 'all' || review.category === categoryFilter;
    return matchesRating && matchesCategory;
  });

  return (
    <div className="max-w-full mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl flex justify-center font-bold text-gray-900">System Reviews</h1>
        <p className="text-gray-600 mt-2 flex justify-center">Share your experience and help improve public services</p>
      </div>
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => setShowSystemReview(true)}
          className="inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Star className="w-5 h-5 mr-2" />
          Review the System
        </button>
      </div>
      {showSystemReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">System Review</h3>
                <button
                  onClick={() => {
                    setShowSystemReview(false);
                    setSystemReview({ title: '', content: '', rating: 5, category: '' });
                    setSystemReviewSubmitted(false);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              {systemReviewSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Thank you for your feedback!</h3>
                  <p className="text-gray-600 mb-4">Your system review has been submitted.</p>
                </div>
              ) : (
                <form onSubmit={e => { e.preventDefault(); handleSubmitSystemReview(); }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                    <select
                      value={systemReview.category}
                      onChange={e => handleSystemReviewChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    >
                      <option value="">Select a category</option>
                      <option value="electricity">Electricity</option>
                      <option value="water">Water supply</option>
                      <option value="roads">Roads</option>
                      <option value="sanitation">Sanitation</option>
                      <option value="street_lights">Street light</option>
                      <option value="drainage">Drainage</option>
                      <option value="public_transport">Public Transport</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                    <input
                      type="text"
                      value={systemReview.title}
                      onChange={e => handleSystemReviewChange('title', e.target.value)}
                      maxLength={100}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Feedback *</label>
                    <textarea
                      value={systemReview.content}
                      onChange={e => handleSystemReviewChange('content', e.target.value)}
                      rows={5}
                      maxLength={1000}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating *</label>
                    {renderStars(systemReview.rating)}
                  </div>
                  <div className="flex space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowSystemReview(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingSystemReview}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmittingSystemReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-center md:space-x-6 mb-8">
        <div className="mb-4 md:mb-0">
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Rating</label>
          <select
            value={ratingFilter}
            onChange={e => setRatingFilter(e.target.value)}
            className="w-full md:w-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Category</label>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="w-full md:w-56 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="electricity">Electricity</option>
            <option value="water">Water supply</option>
            <option value="roads">Roads</option>
            <option value="sanitation">Sanitation</option>
            <option value="street_lights">Street light</option>
            <option value="drainage">Drainage</option>
            <option value="public_transport">Public Transport</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">What Users Say About the Community</h2>
        {loadingSystemReviews ? (
          <div className="text-center text-gray-500 py-8">Loading reviews...</div>
        ) : systemReviews.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No system reviews yet. Be the first to share your feedback!</div>
        ) : (
          <div className="space-y-6">
            {filteredReviews.length === 0 ? (
              <div className="text-center text-gray-500 py-8">No reviews found for the selected filters.</div>
            ) : (
              <div className="space-y-6">
                {filteredReviews.map((review) => (
                  <div key={review._id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{review.title}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-5 h-5 ${star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                            />
                          ))}
                          <span className="text-sm text-gray-600">by {review.user?.name || 'Anonymous'}</span>
                          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs capitalize">{review.category?.replace('_', ' ')}</span>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
                      </div>
                    </div>
                    <p className="text-gray-700 mb-2 leading-relaxed">{review.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityPage;