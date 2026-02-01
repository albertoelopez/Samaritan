import React from 'react';
import { MapPin, Calendar, DollarSign, Clock, Users, Star, CheckCircle } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Job, JobStatus } from '../../types';

interface JobCardProps {
  job: Job;
  onApply?: (jobId: string) => void;
  onViewDetails?: (jobId: string) => void;
  userType?: 'worker' | 'contractor';
  applicationStatus?: 'none' | 'pending' | 'accepted' | 'rejected';
  compact?: boolean;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  onApply,
  onViewDetails,
  userType = 'worker',
  applicationStatus = 'none',
  compact = false,
}) => {
  const formatPayRate = (payRate: typeof job.payRate) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: payRate.currency || 'USD',
      minimumFractionDigits: 0,
    });
    
    const rateText = {
      hourly: 'por hora',
      daily: 'por día',
      fixed: 'precio fijo'
    };
    
    return `${formatter.format(payRate.amount)} ${rateText[payRate.type]}`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-US', {
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  const getStatusColor = (status: JobStatus) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-700',
      active: 'bg-green-100 text-green-700',
      filled: 'bg-blue-100 text-blue-700',
      completed: 'bg-purple-100 text-purple-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status];
  };

  const getStatusText = (status: JobStatus) => {
    const texts = {
      draft: 'Borrador',
      active: 'Activo',
      filled: 'Ocupado',
      completed: 'Completado',
      cancelled: 'Cancelado',
    };
    return texts[status];
  };

  const getApplicationStatusColor = (status: string) => {
    const colors = {
      none: '',
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors];
  };

  const getApplicationStatusText = (status: string) => {
    const texts = {
      none: '',
      pending: 'Pendiente',
      accepted: 'Aceptado',
      rejected: 'Rechazado',
    };
    return texts[status as keyof typeof texts];
  };

  return (
    <Card 
      className={`${compact ? 'p-3' : 'p-4'} hover:shadow-lg transition-shadow`}
      hover
      padding="none"
    >
      <div className="flex flex-col space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {job.title}
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                {getStatusText(job.status)}
              </span>
            </div>
            
            {/* Contractor info */}
            {job.contractor && (
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-6 h-6 bg-secondary-100 rounded-full flex items-center justify-center">
                  {job.contractor.profile.logo ? (
                    <img
                      src={job.contractor.profile.logo}
                      alt={job.contractor.profile.companyName}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-secondary-600 font-semibold text-xs">
                      {job.contractor.profile.companyName[0]}
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-600 truncate">
                  {job.contractor.profile.companyName}
                </span>
                {job.contractor.profile.verified && (
                  <CheckCircle size={14} className="text-green-500" />
                )}
                <div className="flex items-center space-x-1">
                  <Star size={12} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-xs text-gray-600">
                    {job.contractor.profile.rating.toFixed(1)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Application Status Badge */}
          {applicationStatus !== 'none' && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getApplicationStatusColor(applicationStatus)}`}>
              {getApplicationStatusText(applicationStatus)}
            </span>
          )}
        </div>

        {/* Job Details Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
          {/* Location */}
          <div className="flex items-center space-x-1">
            <MapPin size={14} className="text-gray-500 flex-shrink-0" />
            <span className="truncate">
              {job.location.city}, {job.location.state}
            </span>
          </div>
          
          {/* Pay Rate */}
          <div className="flex items-center space-x-1">
            <DollarSign size={14} className="text-gray-500 flex-shrink-0" />
            <span className="truncate text-primary-600 font-semibold">
              {formatPayRate(job.payRate)}
            </span>
          </div>
          
          {/* Start Date */}
          <div className="flex items-center space-x-1">
            <Calendar size={14} className="text-gray-500 flex-shrink-0" />
            <span>Inicia {formatDate(job.startDate)}</span>
          </div>
          
          {/* Duration */}
          <div className="flex items-center space-x-1">
            <Clock size={14} className="text-gray-500 flex-shrink-0" />
            <span>{job.duration}</span>
          </div>
        </div>

        {/* Skills Required */}
        <div className="flex flex-wrap gap-1.5">
          {job.skills.slice(0, compact ? 3 : 4).map((skill) => (
            <span
              key={skill.id}
              className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium"
            >
              {skill.name}
            </span>
          ))}
          {job.skills.length > (compact ? 3 : 4) && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
              +{job.skills.length - (compact ? 3 : 4)}
            </span>
          )}
        </div>

        {/* Description (only shown in full mode) */}
        {!compact && (
          <p className="text-sm text-gray-700 line-clamp-3">
            {job.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          {/* Applicant Count (for contractors) */}
          {userType === 'contractor' ? (
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <Users size={14} />
              <span>{job.applicants.length} aplicaciones</span>
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              Publicado {formatDate(job.createdAt)}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails?.(job.id)}
            >
              Ver Detalles
            </Button>
            
            {userType === 'worker' && job.status === 'active' && applicationStatus === 'none' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onApply?.(job.id)}
              >
                Aplicar
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};