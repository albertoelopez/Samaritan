import React, { useState } from 'react';
import { Star, ThumbsUp, MessageCircle, Flag, User } from 'lucide-react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Review, User as UserType } from '../../types';

interface RatingReviewProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  onSubmitReview?: (rating: number, comment: string) => Promise<void>;
  canReview?: boolean;
  loading?: boolean;
  className?: string;
}

interface ReviewFormProps {
  onSubmit: (rating: number, comment: string) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

interface ReviewItemProps {
  review: Review & {
    reviewer: UserType;
  };
  onHelpful?: (reviewId: string) => void;
  onReport?: (reviewId: string) => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ onSubmit, onCancel, loading }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState<{ rating?: string; comment?: string }>({});

  const validateForm = () => {
    const newErrors: { rating?: string; comment?: string } = {};
    
    if (rating === 0) {
      newErrors.rating = 'Por favor selecciona una calificación';
    }
    
    if (!comment.trim()) {
      newErrors.comment = 'Por favor escribe un comentario';
    } else if (comment.trim().length < 10) {
      newErrors.comment = 'El comentario debe tener al menos 10 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      await onSubmit(rating, comment.trim());
    }
  };

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Escribir Reseña</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating Stars */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Calificación <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center space-x-1">
            {Array.from({ length: 5 }, (_, i) => (
              <button
                key={i}
                type="button"
                className="focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
                onMouseEnter={() => setHoveredRating(i + 1)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(i + 1)}
                aria-label={`Calificar ${i + 1} estrella${i > 0 ? 's' : ''}`}
              >
                <Star
                  size={28}
                  className={`transition-colors ${
                    i < (hoveredRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300 hover:text-yellow-400'
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 text-sm text-gray-600">
              {rating > 0 && (
                <>
                  {rating} estrella{rating !== 1 ? 's' : ''}
                  {rating === 1 && ' - Muy malo'}
                  {rating === 2 && ' - Malo'}
                  {rating === 3 && ' - Regular'}
                  {rating === 4 && ' - Bueno'}
                  {rating === 5 && ' - Excelente'}
                </>
              )}
            </span>
          </div>
          {errors.rating && (
            <p className="mt-1 text-sm text-red-600">{errors.rating}</p>
          )}
        </div>

        {/* Comment */}
        <div>
          <label htmlFor="review-comment" className="block text-sm font-medium text-gray-700 mb-2">
            Comentario <span className="text-red-500">*</span>
          </label>
          <textarea
            id="review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            maxLength={500}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            placeholder="Comparte tu experiencia, qué tan profesional fue el trabajo, puntualidad, calidad, etc."
            aria-describedby={errors.comment ? 'comment-error' : 'comment-help'}
          />
          {errors.comment && (
            <p id="comment-error" className="mt-1 text-sm text-red-600">{errors.comment}</p>
          )}
          <p id="comment-help" className="mt-1 text-sm text-gray-500">
            {comment.length}/500 caracteres - Mínimo 10 caracteres
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            fullWidth
            className="sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={loading}
            fullWidth
            className="sm:w-auto"
            disabled={rating === 0 || comment.trim().length < 10}
          >
            Publicar Reseña
          </Button>
        </div>
      </form>
    </Card>
  );
};

const ReviewItem: React.FC<ReviewItemProps> = ({ review, onHelpful, onReport }) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  };

  const renderStars = (rating: number, size: number = 16) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={size}
        className={`${
          i < Math.floor(rating)
            ? 'fill-yellow-400 text-yellow-400'
            : i < rating
            ? 'fill-yellow-200 text-yellow-400'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="border-b border-gray-200 last:border-b-0 pb-4 last:pb-0">
      <div className="flex items-start space-x-3">
        {/* Reviewer Avatar */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <User size={20} className="text-primary-600" />
          </div>
        </div>

        {/* Review Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="text-sm font-semibold text-gray-900">
                Usuario Verificado
              </h4>
              <div className="flex items-center space-x-2 mt-1">
                <div className="flex space-x-0.5">
                  {renderStars(review.rating)}
                </div>
                <span className="text-sm text-gray-600">
                  {formatDate(review.createdAt)}
                </span>
              </div>
            </div>
            
            {/* Report Button */}
            <button
              onClick={() => onReport?.(review.id)}
              className="text-gray-400 hover:text-gray-600 p-1"
              aria-label="Reportar reseña"
            >
              <Flag size={14} />
            </button>
          </div>

          {/* Review Comment */}
          <p className="text-gray-700 text-sm leading-relaxed mb-3">
            {review.comment}
          </p>

          {/* Helpful Button */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onHelpful?.(review.id)}
              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Marcar como útil"
            >
              <ThumbsUp size={14} />
              <span>Útil</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const RatingReview: React.FC<RatingReviewProps> = ({
  reviews,
  averageRating,
  totalReviews,
  onSubmitReview,
  canReview = false,
  loading = false,
  className = '',
}) => {
  const [showReviewForm, setShowReviewForm] = useState(false);

  const handleSubmitReview = async (rating: number, comment: string) => {
    if (onSubmitReview) {
      await onSubmitReview(rating, comment);
      setShowReviewForm(false);
    }
  };

  const renderStars = (rating: number, size: number = 20) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={size}
        className={`${
          i < Math.floor(rating)
            ? 'fill-yellow-400 text-yellow-400'
            : i < rating
            ? 'fill-yellow-200 text-yellow-400'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[Math.floor(review.rating) as keyof typeof distribution]++;
    });
    return distribution;
  };

  const distribution = getRatingDistribution();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Rating Summary */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-8">
          {/* Average Rating */}
          <div className="text-center lg:text-left mb-6 lg:mb-0 lg:flex-shrink-0">
            <div className="flex items-center justify-center lg:justify-start space-x-2 mb-2">
              <span className="text-3xl sm:text-4xl font-bold text-gray-900">
                {averageRating.toFixed(1)}
              </span>
              <div className="flex space-x-0.5">
                {renderStars(averageRating, 24)}
              </div>
            </div>
            <p className="text-sm text-gray-600">
              {totalReviews} reseña{totalReviews !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="flex-1">
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((stars) => (
                <div key={stars} className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 w-16">
                    <span className="text-sm text-gray-600">{stars}</span>
                    <Star size={12} className="text-gray-400" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: totalReviews > 0 
                          ? `${(distribution[stars as keyof typeof distribution] / totalReviews) * 100}%`
                          : '0%'
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8 text-right">
                    {distribution[stars as keyof typeof distribution]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Write Review Button */}
        {canReview && !showReviewForm && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <Button
              onClick={() => setShowReviewForm(true)}
              icon={<MessageCircle size={16} />}
            >
              Escribir Reseña
            </Button>
          </div>
        )}
      </Card>

      {/* Review Form */}
      {showReviewForm && onSubmitReview && (
        <ReviewForm
          onSubmit={handleSubmitReview}
          onCancel={() => setShowReviewForm(false)}
          loading={loading}
        />
      )}

      {/* Reviews List */}
      {reviews.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Reseñas ({totalReviews})
          </h3>
          <div className="space-y-6">
            {reviews.map((review) => (
              <ReviewItem
                key={review.id}
                review={review as any}
                onHelpful={(id) => console.log('Mark helpful:', id)}
                onReport={(id) => console.log('Report review:', id)}
              />
            ))}
          </div>
        </Card>
      )}

      {/* No Reviews State */}
      {reviews.length === 0 && (
        <Card className="p-8 text-center">
          <MessageCircle size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Sin reseñas aún
          </h3>
          <p className="text-gray-600 mb-4">
            Sé el primero en compartir tu experiencia.
          </p>
          {canReview && !showReviewForm && (
            <Button
              onClick={() => setShowReviewForm(true)}
              icon={<MessageCircle size={16} />}
            >
              Escribir Primera Reseña
            </Button>
          )}
        </Card>
      )}
    </div>
  );
};

// Additional Rating Display Component for smaller spaces
interface RatingDisplayProps {
  rating: number;
  reviewCount: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
}

export const RatingDisplay: React.FC<RatingDisplayProps> = ({
  rating,
  reviewCount,
  size = 'md',
  showCount = true,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const starSizes = {
    sm: 14,
    md: 16,
    lg: 20,
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={starSizes[size]}
        className={`${
          i < Math.floor(rating)
            ? 'fill-yellow-400 text-yellow-400'
            : i < rating
            ? 'fill-yellow-200 text-yellow-400'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className={`flex items-center space-x-1 ${sizeClasses[size]} ${className}`}>
      <div className="flex space-x-0.5">
        {renderStars()}
      </div>
      <span className="text-gray-600 font-medium">
        {rating.toFixed(1)}
      </span>
      {showCount && (
        <span className="text-gray-500">
          ({reviewCount})
        </span>
      )}
    </div>
  );
};