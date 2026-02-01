import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Filter, X, ChevronDown, Star, DollarSign } from 'lucide-react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { JobCategory, Skill } from '../../types';

interface SearchFilters {
  query: string;
  location: {
    city: string;
    radius: number;
  };
  category?: JobCategory;
  skills: Skill[];
  payRate: {
    min?: number;
    max?: number;
    type?: 'hourly' | 'daily' | 'fixed';
  };
  rating: {
    min: number;
  };
  availability: 'all' | 'today' | 'week';
}

interface SearchFilterBarProps {
  searchType: 'jobs' | 'workers';
  onFiltersChange: (filters: SearchFilters) => void;
  categories?: JobCategory[];
  skills?: Skill[];
  initialFilters?: Partial<SearchFilters>;
  className?: string;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchType,
  onFiltersChange,
  categories = [],
  skills = [],
  initialFilters = {},
  className = '',
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    location: { city: '', radius: 10 },
    skills: [],
    payRate: {},
    rating: { min: 0 },
    availability: 'all',
    ...initialFilters,
  });

  const [showFilters, setShowFilters] = useState(false);
  const [showSkillsDropdown, setShowSkillsDropdown] = useState(false);
  const skillsRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (skillsRef.current && !skillsRef.current.contains(event.target as Node)) {
        setShowSkillsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const handleSkillToggle = (skill: Skill) => {
    const isSelected = filters.skills.find(s => s.id === skill.id);
    const newSkills = isSelected
      ? filters.skills.filter(s => s.id !== skill.id)
      : [...filters.skills, skill];
    
    updateFilters({ skills: newSkills });
  };

  const clearAllFilters = () => {
    const clearedFilters: SearchFilters = {
      query: '',
      location: { city: '', radius: 10 },
      skills: [],
      payRate: {},
      rating: { min: 0 },
      availability: 'all',
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.location.city) count++;
    if (filters.category) count++;
    if (filters.skills.length > 0) count++;
    if (filters.payRate.min || filters.payRate.max) count++;
    if (filters.rating.min > 0) count++;
    if (filters.availability !== 'all') count++;
    return count;
  };

  return (
    <div className={`bg-white shadow-sm border-b border-gray-200 ${className}`}>
      <div className="px-4 py-3">
        {/* Main Search Bar */}
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search Input */}
          <div className="flex-1">
            <Input
              type="text"
              placeholder={searchType === 'jobs' ? 'Buscar trabajos...' : 'Buscar trabajadores...'}
              value={filters.query}
              onChange={(e) => updateFilters({ query: e.target.value })}
              icon={<Search size={18} />}
              className="text-base"
            />
          </div>

          {/* Location Input */}
          <div className="lg:w-64">
            <Input
              type="text"
              placeholder="Ciudad, código postal"
              value={filters.location.city}
              onChange={(e) => updateFilters({ location: { ...filters.location, city: e.target.value } })}
              icon={<MapPin size={18} />}
              className="text-base"
            />
          </div>

          {/* Filter Button */}
          <div className="flex space-x-2">
            <Button
              variant={showFilters ? 'primary' : 'outline'}
              onClick={() => setShowFilters(!showFilters)}
              icon={<Filter size={18} />}
              className="flex-shrink-0"
            >
              <span className="hidden sm:inline">Filtros</span>
              {getActiveFilterCount() > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-primary-100 text-primary-800 rounded-full text-xs">
                  {getActiveFilterCount()}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
              <div className="flex space-x-2">
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Limpiar todo
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Category Filter (Jobs only) */}
              {searchType === 'jobs' && categories.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría
                  </label>
                  <select
                    value={filters.category?.id || ''}
                    onChange={(e) => {
                      const category = categories.find(c => c.id === e.target.value);
                      updateFilters({ category });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Todas las categorías</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Skills Filter */}
              <div ref={skillsRef} className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Habilidades
                </label>
                <button
                  type="button"
                  onClick={() => setShowSkillsDropdown(!showSkillsDropdown)}
                  className="w-full px-3 py-2 text-left border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 flex items-center justify-between"
                >
                  <span className="truncate">
                    {filters.skills.length === 0
                      ? 'Seleccionar habilidades'
                      : `${filters.skills.length} seleccionadas`}
                  </span>
                  <ChevronDown size={16} />
                </button>

                {showSkillsDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {skills.map((skill) => (
                      <label
                        key={skill.id}
                        className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={filters.skills.some(s => s.id === skill.id)}
                          onChange={() => handleSkillToggle(skill)}
                          className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{skill.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Pay Rate Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {searchType === 'jobs' ? 'Pago por hora' : 'Tarifa por hora'}
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.payRate.min || ''}
                    onChange={(e) => updateFilters({
                      payRate: { ...filters.payRate, min: e.target.value ? Number(e.target.value) : undefined }
                    })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.payRate.max || ''}
                    onChange={(e) => updateFilters({
                      payRate: { ...filters.payRate, max: e.target.value ? Number(e.target.value) : undefined }
                    })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Rating Filter (Workers only) */}
              {searchType === 'workers' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Calificación mínima
                  </label>
                  <select
                    value={filters.rating.min}
                    onChange={(e) => updateFilters({
                      rating: { min: Number(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value={0}>Cualquier calificación</option>
                    <option value={4}>4+ estrellas</option>
                    <option value={4.5}>4.5+ estrellas</option>
                  </select>
                </div>
              )}

              {/* Availability Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Disponibilidad
                </label>
                <select
                  value={filters.availability}
                  onChange={(e) => updateFilters({
                    availability: e.target.value as 'all' | 'today' | 'week'
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">Cualquier momento</option>
                  <option value="today">Disponible hoy</option>
                  <option value="week">Esta semana</option>
                </select>
              </div>

              {/* Distance Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Distancia máxima
                </label>
                <select
                  value={filters.location.radius}
                  onChange={(e) => updateFilters({
                    location: { ...filters.location, radius: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value={5}>5 millas</option>
                  <option value={10}>10 millas</option>
                  <option value={25}>25 millas</option>
                  <option value={50}>50 millas</option>
                  <option value={100}>100 millas</option>
                </select>
              </div>
            </div>

            {/* Selected Filters Pills */}
            {(filters.skills.length > 0 || filters.category || filters.payRate.min || filters.payRate.max || filters.rating.min > 0) && (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
                {filters.category && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800">
                    {filters.category.name}
                    <button
                      onClick={() => updateFilters({ category: undefined })}
                      className="ml-2 text-primary-600 hover:text-primary-800"
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}
                
                {filters.skills.map((skill) => (
                  <span key={skill.id} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-secondary-100 text-secondary-800">
                    {skill.name}
                    <button
                      onClick={() => handleSkillToggle(skill)}
                      className="ml-2 text-secondary-600 hover:text-secondary-800"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}

                {(filters.payRate.min || filters.payRate.max) && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                    <DollarSign size={14} className="mr-1" />
                    {filters.payRate.min && filters.payRate.max
                      ? `$${filters.payRate.min}-$${filters.payRate.max}`
                      : filters.payRate.min
                      ? `$${filters.payRate.min}+`
                      : `Hasta $${filters.payRate.max}`}
                    <button
                      onClick={() => updateFilters({ payRate: {} })}
                      className="ml-2 text-green-600 hover:text-green-800"
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}

                {filters.rating.min > 0 && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
                    <Star size={14} className="mr-1" />
                    {filters.rating.min}+ estrellas
                    <button
                      onClick={() => updateFilters({ rating: { min: 0 } })}
                      className="ml-2 text-yellow-600 hover:text-yellow-800"
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};