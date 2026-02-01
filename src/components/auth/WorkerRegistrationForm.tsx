import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, User, MapPin, Star, FileText, Upload, CheckCircle } from 'lucide-react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Card } from '../common/Card';
import { WorkerProfile, Skill, Location } from '../../types';

interface WorkerRegistrationFormProps {
  onSubmit: (data: WorkerRegistrationData) => Promise<void>;
  onCancel: () => void;
  availableSkills?: Skill[];
  loading?: boolean;
}

export interface WorkerRegistrationData {
  // Basic Info
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  
  // Location
  location: Location;
  
  // Professional Info
  skills: Skill[];
  experience: number;
  hourlyRate: number;
  bio: string;
  
  // Documents (optional for later)
  profilePhoto?: File;
  idDocument?: File;
  
  // Terms
  acceptTerms: boolean;
  acceptBackgroundCheck: boolean;
}

const initialFormData: WorkerRegistrationData = {
  firstName: '',
  lastName: '',
  phone: '',
  dateOfBirth: '',
  location: {
    address: '',
    city: '',
    state: '',
    zipCode: '',
  },
  skills: [],
  experience: 0,
  hourlyRate: 15,
  bio: '',
  acceptTerms: false,
  acceptBackgroundCheck: false,
};

export const WorkerRegistrationForm: React.FC<WorkerRegistrationFormProps> = ({
  onSubmit,
  onCancel,
  availableSkills = [],
  loading = false,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<WorkerRegistrationData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof WorkerRegistrationData, string>>>({});
  const photoInputRef = useRef<HTMLInputElement>(null);
  const idInputRef = useRef<HTMLInputElement>(null);

  const totalSteps = 5;

  const updateFormData = (updates: Partial<WorkerRegistrationData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    // Clear related errors
    Object.keys(updates).forEach(key => {
      if (errors[key as keyof WorkerRegistrationData]) {
        setErrors(prev => ({ ...prev, [key]: undefined }));
      }
    });
  };

  const validateCurrentStep = (): boolean => {
    const newErrors: Partial<Record<keyof WorkerRegistrationData, string>> = {};

    switch (currentStep) {
      case 1: // Basic Info
        if (!formData.firstName.trim()) newErrors.firstName = 'El nombre es requerido';
        if (!formData.lastName.trim()) newErrors.lastName = 'El apellido es requerido';
        if (!formData.phone.trim()) newErrors.phone = 'El teléfono es requerido';
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'La fecha de nacimiento es requerida';
        break;
        
      case 2: // Location
        if (!formData.location.address.trim()) newErrors.location = 'La dirección es requerida';
        if (!formData.location.city.trim()) newErrors.location = 'La ciudad es requerida';
        if (!formData.location.state.trim()) newErrors.location = 'El estado es requerido';
        if (!formData.location.zipCode.trim()) newErrors.location = 'El código postal es requerido';
        break;
        
      case 3: // Professional Info
        if (formData.skills.length === 0) newErrors.skills = 'Selecciona al menos una habilidad';
        if (formData.experience < 0) newErrors.experience = 'La experiencia debe ser positiva';
        if (formData.hourlyRate < 10) newErrors.hourlyRate = 'La tarifa mínima es $10/hora';
        if (!formData.bio.trim()) newErrors.bio = 'La descripción personal es requerida';
        break;
        
      case 5: // Terms
        if (!formData.acceptTerms) newErrors.acceptTerms = 'Debes aceptar los términos y condiciones';
        if (!formData.acceptBackgroundCheck) newErrors.acceptBackgroundCheck = 'Debes aceptar la verificación de antecedentes';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep() && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateCurrentStep()) {
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

  const handleFileUpload = (file: File | undefined, type: 'profilePhoto' | 'idDocument') => {
    if (file) {
      updateFormData({ [type]: file });
    }
  };

  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div key={i} className="flex items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
              ${i + 1 <= currentStep ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'}
            `}>
              {i + 1 <= currentStep ? <CheckCircle size={16} /> : i + 1}
            </div>
            {i < totalSteps - 1 && (
              <div className={`
                w-12 h-1 mx-2
                ${i + 1 < currentStep ? 'bg-primary-600' : 'bg-gray-200'}
              `} />
            )}
          </div>
        ))}
      </div>
      <div className="text-sm text-gray-600 text-center">
        Paso {currentStep} de {totalSteps}
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <User className="mx-auto h-12 w-12 text-primary-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Información Personal</h2>
              <p className="text-gray-600">Cuéntanos sobre ti para empezar</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nombre"
                value={formData.firstName}
                onChange={(e) => updateFormData({ firstName: e.target.value })}
                error={errors.firstName}
                required
                autoComplete="given-name"
                aria-describedby="firstName-help"
              />
              <Input
                label="Apellido"
                value={formData.lastName}
                onChange={(e) => updateFormData({ lastName: e.target.value })}
                error={errors.lastName}
                required
                autoComplete="family-name"
                aria-describedby="lastName-help"
              />
            </div>

            <Input
              label="Teléfono"
              type="tel"
              value={formData.phone}
              onChange={(e) => updateFormData({ phone: e.target.value })}
              error={errors.phone}
              required
              autoComplete="tel"
              placeholder="(555) 123-4567"
              aria-describedby="phone-help"
            />

            <Input
              label="Fecha de Nacimiento"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => updateFormData({ dateOfBirth: e.target.value })}
              error={errors.dateOfBirth}
              required
              autoComplete="bday"
              max={new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
              aria-describedby="dob-help"
            />
            <p id="dob-help" className="text-xs text-gray-500 mt-1">
              Debes tener al menos 18 años para registrarte
            </p>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <MapPin className="mx-auto h-12 w-12 text-primary-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Ubicación</h2>
              <p className="text-gray-600">¿Dónde prestas tus servicios?</p>
            </div>

            <Input
              label="Dirección"
              value={formData.location.address}
              onChange={(e) => updateFormData({
                location: { ...formData.location, address: e.target.value }
              })}
              error={errors.location}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input
                label="Ciudad"
                value={formData.location.city}
                onChange={(e) => updateFormData({
                  location: { ...formData.location, city: e.target.value }
                })}
                required
                autoComplete="address-level2"
                placeholder="Ej: Los Angeles"
              />
              <Input
                label="Estado"
                value={formData.location.state}
                onChange={(e) => updateFormData({
                  location: { ...formData.location, state: e.target.value }
                })}
                required
                autoComplete="address-level1"
                placeholder="Ej: California"
              />
              <Input
                label="Código Postal"
                value={formData.location.zipCode}
                onChange={(e) => updateFormData({
                  location: { ...formData.location, zipCode: e.target.value }
                })}
                required
                autoComplete="postal-code"
                placeholder="12345"
                pattern="[0-9]{5}(-[0-9]{4})?"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Star className="mx-auto h-12 w-12 text-primary-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Información Profesional</h2>
              <p className="text-gray-600">Dinos sobre tus habilidades y experiencia</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Habilidades <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {availableSkills.map((skill) => (
                  <label
                    key={skill.id}
                    className={`
                      flex items-center p-3 border rounded-lg cursor-pointer transition-all
                      ${formData.skills.some(s => s.id === skill.id)
                        ? 'border-primary-300 bg-primary-50 hover:bg-primary-100'
                        : 'border-gray-300 hover:bg-gray-50'
                      }
                      focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-1
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={formData.skills.some(s => s.id === skill.id)}
                      onChange={() => handleSkillToggle(skill)}
                      className="mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      aria-describedby={`skill-${skill.id}-desc`}
                    />
                    <span className="text-sm font-medium text-gray-700 flex-1">{skill.name}</span>
                  </label>
                ))}
              </div>
              {errors.skills && (
                <p className="mt-1 text-sm text-red-600">{errors.skills}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Años de Experiencia"
                type="number"
                min="0"
                value={formData.experience.toString()}
                onChange={(e) => updateFormData({ experience: Number(e.target.value) })}
                error={errors.experience}
                required
              />
              <Input
                label="Tarifa por Hora (USD)"
                type="number"
                min="10"
                step="0.50"
                value={formData.hourlyRate.toString()}
                onChange={(e) => updateFormData({ hourlyRate: Number(e.target.value) })}
                error={errors.hourlyRate}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción Personal <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => updateFormData({ bio: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Describe tu experiencia, especialidades y lo que te hace único..."
              />
              {errors.bio && (
                <p className="mt-1 text-sm text-red-600">{errors.bio}</p>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Upload className="mx-auto h-12 w-12 text-primary-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Documentos</h2>
              <p className="text-gray-600">Sube documentos para verificar tu identidad (opcional)</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Foto de Perfil
                </label>
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {formData.profilePhoto ? (
                      <img
                        src={URL.createObjectURL(formData.profilePhoto)}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={32} className="text-gray-500" />
                    )}
                  </div>
                  <div>
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e.target.files?.[0], 'profilePhoto')}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => photoInputRef.current?.click()}
                    >
                      Subir Foto
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Identificación Oficial (Licencia de Conducir o Pasaporte)
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <input
                      ref={idInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload(e.target.files?.[0], 'idDocument')}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => idInputRef.current?.click()}
                      icon={<Upload size={16} />}
                      fullWidth
                    >
                      {formData.idDocument ? formData.idDocument.name : 'Subir Identificación'}
                    </Button>
                  </div>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Esto ayudará a verificar tu identidad y generar confianza con los contratistas.
                </p>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <FileText className="mx-auto h-12 w-12 text-primary-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Términos y Condiciones</h2>
              <p className="text-gray-600">Revisa y acepta los términos para completar tu registro</p>
            </div>

            <div className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 max-h-40 overflow-y-auto">
                <h4 className="font-semibold text-gray-900 mb-2">Términos y Condiciones</h4>
                <p className="text-sm text-gray-700">
                  Al registrarte en nuestra plataforma, aceptas cumplir con nuestros términos de servicio,
                  políticas de privacidad y estándares de conducta profesional. Te comprometes a proporcionar
                  información veraz y mantener un comportamiento profesional en todas las interacciones.
                </p>
              </div>

              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={(e) => updateFormData({ acceptTerms: e.target.checked })}
                  className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">
                  Acepto los términos y condiciones y la política de privacidad
                  <span className="text-red-500 ml-1">*</span>
                </span>
              </label>
              {errors.acceptTerms && (
                <p className="text-sm text-red-600">{errors.acceptTerms}</p>
              )}

              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={formData.acceptBackgroundCheck}
                  onChange={(e) => updateFormData({ acceptBackgroundCheck: e.target.checked })}
                  className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">
                  Acepto someterme a una verificación de antecedentes para mejorar la confianza y seguridad
                  en la plataforma <span className="text-red-500 ml-1">*</span>
                </span>
              </label>
              {errors.acceptBackgroundCheck && (
                <p className="text-sm text-red-600">{errors.acceptBackgroundCheck}</p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="p-4 sm:p-6 md:p-8">
        <form onSubmit={handleSubmit}>
          {renderProgressBar()}
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <div>
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  icon={<ChevronLeft size={16} />}
                >
                  Anterior
                </Button>
              )}
            </div>

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
              >
                Cancelar
              </Button>

              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  icon={<ChevronRight size={16} />}
                  className="flex-row-reverse"
                >
                  Siguiente
                </Button>
              ) : (
                <Button
                  type="submit"
                  loading={loading}
                >
                  Crear Cuenta
                </Button>
              )}
            </div>
          </div>
        </form>
        </Card>
      </div>
    </div>
  );
};