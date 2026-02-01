import React, { useState } from 'react';
import { Calendar, MapPin, DollarSign, Briefcase, Users, FileText } from 'lucide-react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Card } from '../common/Card';
import { Job, JobCategory, Skill, Location, PayRate } from '../../types';

interface JobPostingFormProps {
  onSubmit: (data: JobPostingData) => Promise<void>;
  onCancel: () => void;
  availableCategories?: JobCategory[];
  availableSkills?: Skill[];
  loading?: boolean;
  initialData?: Partial<JobPostingData>;
}

export interface JobPostingData {
  title: string;
  description: string;
  category: JobCategory | null;
  skills: Skill[];
  location: Location;
  startDate: string;
  endDate?: string;
  duration: string;
  payRate: PayRate;
  urgency: 'low' | 'medium' | 'high';
  workersNeeded: number;
  requirements: string[];
  benefits: string[];
}

const initialFormData: JobPostingData = {
  title: '',
  description: '',
  category: null,
  skills: [],
  location: {
    address: '',
    city: '',
    state: '',
    zipCode: '',
  },
  startDate: '',
  endDate: '',
  duration: '',
  payRate: {
    amount: 0,
    type: 'hourly',
    currency: 'USD',
  },
  urgency: 'medium',
  workersNeeded: 1,
  requirements: [],
  benefits: [],
};

export const JobPostingForm: React.FC<JobPostingFormProps> = ({
  onSubmit,
  onCancel,
  availableCategories = [],
  availableSkills = [],
  loading = false,
  initialData = {},
}) => {
  const [formData, setFormData] = useState<JobPostingData>({
    ...initialFormData,
    ...initialData,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof JobPostingData, string>>>({});
  const [newRequirement, setNewRequirement] = useState('');
  const [newBenefit, setNewBenefit] = useState('');

  const updateFormData = (updates: Partial<JobPostingData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    // Clear related errors
    Object.keys(updates).forEach(key => {
      if (errors[key as keyof JobPostingData]) {
        setErrors(prev => ({ ...prev, [key]: undefined }));
      }
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof JobPostingData, string>> = {};

    // Required fields validation
    if (!formData.title.trim()) newErrors.title = 'El título es requerido';
    if (!formData.description.trim()) newErrors.description = 'La descripción es requerida';
    if (!formData.category) newErrors.category = 'La categoría es requerida';
    if (formData.skills.length === 0) newErrors.skills = 'Selecciona al menos una habilidad';
    if (!formData.location.address.trim()) newErrors.location = 'La dirección es requerida';
    if (!formData.location.city.trim()) newErrors.location = 'La ciudad es requerida';
    if (!formData.location.state.trim()) newErrors.location = 'El estado es requerido';
    if (!formData.location.zipCode.trim()) newErrors.location = 'El código postal es requerido';
    if (!formData.startDate) newErrors.startDate = 'La fecha de inicio es requerida';
    if (!formData.duration.trim()) newErrors.duration = 'La duración es requerida';
    if (formData.payRate.amount <= 0) newErrors.payRate = 'El pago debe ser mayor a 0';
    if (formData.workersNeeded < 1) newErrors.workersNeeded = 'Debe necesitar al menos 1 trabajador';

    // Date validation
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end <= start) {
        newErrors.endDate = 'La fecha de fin debe ser posterior a la de inicio';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      await onSubmit(formData);
    }
  };

  const handleSkillToggle = (skill: Skill) => {
    const isSelected = formData.skills.find(s => s.id === skill.id);
    const newSkills = isSelected
      ? formData.skills.filter(s => s.id !== skill.id)
      : [...formData.skills, skill];
    updateFormData({ skills: newSkills });
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      updateFormData({
        requirements: [...formData.requirements, newRequirement.trim()]
      });
      setNewRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    updateFormData({
      requirements: formData.requirements.filter((_, i) => i !== index)
    });
  };

  const addBenefit = () => {
    if (newBenefit.trim()) {
      updateFormData({
        benefits: [...formData.benefits, newBenefit.trim()]
      });
      setNewBenefit('');
    }
  };

  const removeBenefit = (index: number) => {
    updateFormData({
      benefits: formData.benefits.filter((_, i) => i !== index)
    });
  };

  const getUrgencyColor = (urgency: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
    };
    return colors[urgency as keyof typeof colors];
  };

  const getUrgencyText = (urgency: string) => {
    const texts = {
      low: 'Baja',
      medium: 'Media',
      high: 'Alta',
    };
    return texts[urgency as keyof typeof texts];
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Card className="p-4 sm:p-6 lg:p-8">
          <div className="mb-6 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Publicar Trabajo</h1>
            <p className="text-gray-600">Encuentra el trabajador perfecto para tu proyecto</p>
          </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <section>
            <div className="flex items-center space-x-2 mb-4">
              <Briefcase className="h-5 w-5 text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-900">Información Básica</h2>
            </div>
            
            <div className="space-y-4">
              <Input
                label="Título del Trabajo"
                value={formData.title}
                onChange={(e) => updateFormData({ title: e.target.value })}
                error={errors.title}
                placeholder="Ej: Construcción de cerca de madera"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category?.id || ''}
                  onChange={(e) => {
                    const category = availableCategories.find(c => c.id === e.target.value) || null;
                    updateFormData({ category });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Seleccionar categoría</option>
                  {availableCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción del Trabajo <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateFormData({ description: e.target.value })}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Describe detalladamente el trabajo a realizar, materiales necesarios, condiciones especiales, etc."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>
            </div>
          </section>

          {/* Skills Required */}
          <section>
            <div className="flex items-center space-x-2 mb-4">
              <Users className="h-5 w-5 text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-900">Habilidades Requeridas</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {availableSkills.map((skill) => (
                <label
                  key={skill.id}
                  className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={formData.skills.some(s => s.id === skill.id)}
                    onChange={() => handleSkillToggle(skill)}
                    className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">{skill.name}</span>
                </label>
              ))}
            </div>
            {errors.skills && (
              <p className="mt-2 text-sm text-red-600">{errors.skills}</p>
            )}
          </section>

          {/* Location */}
          <section>
            <div className="flex items-center space-x-2 mb-4">
              <MapPin className="h-5 w-5 text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-900">Ubicación</h2>
            </div>
            
            <div className="space-y-4">
              <Input
                label="Dirección del Trabajo"
                value={formData.location.address}
                onChange={(e) => updateFormData({
                  location: { ...formData.location, address: e.target.value }
                })}
                error={errors.location}
                placeholder="123 Main St"
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Ciudad"
                  value={formData.location.city}
                  onChange={(e) => updateFormData({
                    location: { ...formData.location, city: e.target.value }
                  })}
                  required
                />
                <Input
                  label="Estado"
                  value={formData.location.state}
                  onChange={(e) => updateFormData({
                    location: { ...formData.location, state: e.target.value }
                  })}
                  required
                />
                <Input
                  label="Código Postal"
                  value={formData.location.zipCode}
                  onChange={(e) => updateFormData({
                    location: { ...formData.location, zipCode: e.target.value }
                  })}
                  required
                />
              </div>
            </div>
          </section>

          {/* Schedule & Duration */}
          <section>
            <div className="flex items-center space-x-2 mb-4">
              <Calendar className="h-5 w-5 text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-900">Horario y Duración</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Fecha de Inicio"
                type="date"
                value={formData.startDate}
                onChange={(e) => updateFormData({ startDate: e.target.value })}
                error={errors.startDate}
                required
              />
              <Input
                label="Fecha de Finalización (Opcional)"
                type="date"
                value={formData.endDate || ''}
                onChange={(e) => updateFormData({ endDate: e.target.value || undefined })}
                error={errors.endDate}
              />
              <Input
                label="Duración Estimada"
                value={formData.duration}
                onChange={(e) => updateFormData({ duration: e.target.value })}
                placeholder="Ej: 3 días, 1 semana, 2-4 horas"
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urgencia
                </label>
                <div className="flex space-x-3">
                  {(['low', 'medium', 'high'] as const).map((urgency) => (
                    <label key={urgency} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="urgency"
                        value={urgency}
                        checked={formData.urgency === urgency}
                        onChange={(e) => updateFormData({ urgency: e.target.value as any })}
                        className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500"
                      />
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(urgency)}`}>
                        {getUrgencyText(urgency)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Payment */}
          <section>
            <div className="flex items-center space-x-2 mb-4">
              <DollarSign className="h-5 w-5 text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-900">Pago</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Cantidad"
                type="number"
                min="0"
                step="0.01"
                value={formData.payRate.amount.toString()}
                onChange={(e) => updateFormData({
                  payRate: { ...formData.payRate, amount: Number(e.target.value) }
                })}
                error={errors.payRate}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Pago
                </label>
                <select
                  value={formData.payRate.type}
                  onChange={(e) => updateFormData({
                    payRate: { ...formData.payRate, type: e.target.value as 'hourly' | 'daily' | 'fixed' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="hourly">Por Hora</option>
                  <option value="daily">Por Día</option>
                  <option value="fixed">Precio Fijo</option>
                </select>
              </div>
              <Input
                label="Trabajadores Necesarios"
                type="number"
                min="1"
                value={formData.workersNeeded.toString()}
                onChange={(e) => updateFormData({ workersNeeded: Number(e.target.value) })}
                error={errors.workersNeeded}
                required
              />
            </div>
          </section>

          {/* Requirements & Benefits */}
          <section>
            <div className="flex items-center space-x-2 mb-4">
              <FileText className="h-5 w-5 text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-900">Requisitos y Beneficios</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Requirements */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Requisitos Adicionales
                </label>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newRequirement}
                      onChange={(e) => setNewRequirement(e.target.value)}
                      placeholder="Ej: Experiencia con herramientas eléctricas"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                    />
                    <Button
                      type="button"
                      onClick={addRequirement}
                      disabled={!newRequirement.trim()}
                    >
                      Agregar
                    </Button>
                  </div>
                  <div className="space-y-1">
                    {formData.requirements.map((req, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded">
                        <span className="text-sm">{req}</span>
                        <button
                          type="button"
                          onClick={() => removeRequirement(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Beneficios Ofrecidos
                </label>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newBenefit}
                      onChange={(e) => setNewBenefit(e.target.value)}
                      placeholder="Ej: Almuerzo incluido"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                    />
                    <Button
                      type="button"
                      onClick={addBenefit}
                      disabled={!newBenefit.trim()}
                    >
                      Agregar
                    </Button>
                  </div>
                  <div className="space-y-1">
                    {formData.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded">
                        <span className="text-sm">{benefit}</span>
                        <button
                          type="button"
                          onClick={() => removeBenefit(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-gray-200 space-y-3 sm:space-y-0">
            <div className="text-sm text-gray-600">
              Tu trabajo será revisado antes de ser publicado
            </div>
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {/* Save as draft logic */}}
              >
                Guardar Borrador
              </Button>
              <Button
                type="submit"
                loading={loading}
              >
                Publicar Trabajo
              </Button>
            </div>
          </div>
        </form>
        </Card>
      </div>
    </div>
  );
};