import React from 'react';
import { Star, MapPin, Clock, CheckCircle, Shield } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Worker } from '../../types';

interface WorkerCardProps {
  worker: Worker;
  onViewProfile?: (workerId: string) => void;
  onContact?: (workerId: string) => void;
  compact?: boolean;
  showContactButton?: boolean;
}

export const WorkerCard: React.FC<WorkerCardProps> = ({
  worker,
  onViewProfile,
  onContact,
  compact = false,
  showContactButton = true,
}) => {
  const { profile } = worker;
  
  const formatHourlyRate = (rate: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(rate);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
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
    <Card 
      className={`${compact ? 'p-3' : 'p-4'} hover:shadow-lg transition-shadow`}
      hover
      padding="none"
    >
      <div className="flex flex-col space-y-3">
        {/* Header with avatar and basic info */}
        <div className="flex items-start space-x-3">
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={`${profile.firstName} ${profile.lastName}`}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <span className="text-primary-600 font-semibold text-lg">
                  {profile.firstName[0]}{profile.lastName[0]}
                </span>
              )}
            </div>
            {profile.verified && (
              <CheckCircle
                size={16}
                className="absolute -top-1 -right-1 text-green-500 bg-white rounded-full"
              />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {profile.firstName} {profile.lastName}
              </h3>
              {profile.verified && (
                <Shield size={16} className="text-green-500 flex-shrink-0" />
              )}
            </div>
            
            {/* Rating */}
            <div className="flex items-center space-x-1 mt-1">
              <div className="flex space-x-0.5">
                {renderStars(profile.rating)}
              </div>
              <span className="text-sm text-gray-600">
                {profile.rating.toFixed(1)} ({profile.reviewCount})
              </span>
            </div>
            
            {/* Location */}
            <div className="flex items-center space-x-1 mt-1">
              <MapPin size={14} className="text-gray-500" />
              <span className="text-sm text-gray-600 truncate">
                {profile.location.city}, {profile.location.state}
              </span>
            </div>
          </div>
          
          <div className="text-right flex-shrink-0">
            <div className="text-lg font-bold text-primary-600">
              {formatHourlyRate(profile.hourlyRate)}
            </div>
            <div className="text-xs text-gray-500">por hora</div>
          </div>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5">
          {profile.skills.slice(0, compact ? 3 : 5).map((skill) => (
            <span
              key={skill.id}
              className="px-2 py-1 bg-secondary-100 text-secondary-700 rounded-full text-xs font-medium"
            >
              {skill.name}
            </span>
          ))}
          {profile.skills.length > (compact ? 3 : 5) && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
              +{profile.skills.length - (compact ? 3 : 5)} más
            </span>
          )}
        </div>

        {/* Bio (only shown in full mode) */}
        {!compact && profile.bio && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {profile.bio}
          </p>
        )}

        {/* Experience and Availability */}
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Clock size={14} />
            <span>{profile.experience} años exp.</span>
          </div>
          {profile.availability.length > 0 && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Disponible</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {showContactButton && (
          <div className="flex space-x-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewProfile?.(worker.id)}
              fullWidth
            >
              Ver Perfil
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onContact?.(worker.id)}
              fullWidth
            >
              Contactar
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};