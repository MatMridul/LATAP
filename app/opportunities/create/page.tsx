'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient, APIError } from '../../lib/apiClient';
import { handleAPIError } from '../../lib/errorHandler';
import type { 
  OpportunityCreateRequest, 
  OpportunityType, 
  JobType, 
  OpportunityVisibility,
  EducationLevel 
} from '../../types/api';

interface FormData {
  title: string;
  company_name: string;
  type: OpportunityType;
  location: string;
  remote_ok: boolean;
  description: string;
  required_skills: string[];
  min_experience: number;
  max_experience: number | null;
  required_degree: EducationLevel | null;
  salary_min: number | null;
  salary_max: number | null;
  job_types: JobType[];
  visibility: OpportunityVisibility;
  expires_at: string; // HTML date input format (YYYY-MM-DD)
}

const initialFormData: FormData = {
  title: '',
  company_name: '',
  type: 'job',
  location: '',
  remote_ok: false,
  description: '',
  required_skills: [],
  min_experience: 0,
  max_experience: null,
  required_degree: null,
  salary_min: null,
  salary_max: null,
  job_types: ['full_time'],
  visibility: 'institution_only',
  expires_at: ''
};

const opportunityTypes: { value: OpportunityType; label: string }[] = [
  { value: 'job', label: 'Full-time Job' },
  { value: 'internship', label: 'Internship' },
  { value: 'project', label: 'Project/Contract' }
];

const jobTypes: { value: JobType; label: string }[] = [
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'freelance', label: 'Freelance' }
];

const visibilityOptions: { value: OpportunityVisibility; label: string; description: string }[] = [
  { 
    value: 'institution_only', 
    label: 'Institution Only', 
    description: 'Only alumni from your institution can see this opportunity' 
  },
  { 
    value: 'all_verified', 
    label: 'All Verified Alumni', 
    description: 'All verified alumni across institutions can see this opportunity' 
  }
];

const degreeOptions: { value: EducationLevel; label: string }[] = [
  { value: 'high_school', label: 'High School' },
  { value: 'associate', label: 'Associate Degree' },
  { value: 'bachelor', label: 'Bachelor\'s Degree' },
  { value: 'master', label: 'Master\'s Degree' },
  { value: 'phd', label: 'PhD' }
];

export default function CreateOpportunityPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [skillInput, setSkillInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSkillAdd = () => {
    const skill = skillInput.trim();
    if (skill && !formData.required_skills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        required_skills: [...prev.required_skills, skill]
      }));
      setSkillInput('');
    }
  };

  const handleSkillRemove = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      required_skills: prev.required_skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleJobTypeChange = (jobType: JobType, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      job_types: checked 
        ? [...prev.job_types, jobType]
        : prev.job_types.filter(type => type !== jobType)
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.title.trim()) return 'Title is required';
    if (!formData.company_name.trim()) return 'Company name is required';
    if (!formData.location.trim()) return 'Location is required';
    if (!formData.description.trim()) return 'Description is required';
    if (!formData.expires_at) return 'Expiration date is required';
    if (formData.job_types.length === 0) return 'At least one job type must be selected';
    
    const expirationDate = new Date(formData.expires_at);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (expirationDate <= today) {
      return 'Expiration date must be in the future';
    }

    if (formData.salary_min !== null && formData.salary_max !== null) {
      if (formData.salary_min > formData.salary_max) {
        return 'Minimum salary cannot be greater than maximum salary';
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Convert form data to API format
      const requestData: OpportunityCreateRequest = {
        title: formData.title,
        company_name: formData.company_name,
        opportunity_type: formData.type,
        location: formData.location,
        is_remote: formData.remote_ok,
        description: formData.description,
        job_type: formData.job_types[0], // Use first job type for backend
        required_skills: formData.required_skills,
        min_experience: formData.min_experience,
        max_experience: formData.max_experience || 0,
        required_degree: formData.required_degree || 'high_school',
        salary_min: formData.salary_min,
        salary_max: formData.salary_max,
        currency: 'USD',
        visibility: formData.visibility,
        expires_at: new Date(formData.expires_at).toISOString()
      };

      const response = await apiClient.createOpportunity(requestData);
      
      // Success - redirect to the created opportunity
      router.push(`/opportunities/${response.opportunity_id}`);
      
    } catch (err) {
      if (err instanceof APIError) {
        const action = handleAPIError(err);
        if (action.type === 'redirect' && action.redirectTo) {
          router.push(action.redirectTo);
        } else {
          setError(action.message);
        }
      } else {
        setError('Failed to create opportunity. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-50)' }}>
      {/* Navigation */}
      <nav className="nav-primary">
        <div className="nav-container">
          <Link href="/" className="nav-brand">
            <div className="nav-logo">L</div>
            <div>
              <div className="nav-title">LATAP</div>
              <div className="nav-subtitle">Create Opportunity</div>
            </div>
          </Link>
          <div className="nav-actions">
            <Link href="/opportunities" className="btn btn-ghost btn-sm">
              Back to Opportunities
            </Link>
            <button 
              onClick={logout}
              className="btn btn-ghost btn-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="container" style={{ padding: '2rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h1 style={{ 
              fontSize: '2.5rem', 
              fontWeight: 'bold', 
              color: 'var(--text-primary)', 
              marginBottom: '0.5rem' 
            }}>
              Create New Opportunity
            </h1>
            <p style={{ 
              fontSize: '1.125rem', 
              color: 'var(--text-secondary)',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Post a job, internship, or project opportunity for talented alumni
            </p>
          </div>

          {/* Form */}
          <div style={{ 
            background: 'var(--white)', 
            borderRadius: '16px', 
            padding: '2rem', 
            border: '1px solid var(--surface-200)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
          }}>
            {error && (
              <div style={{
                background: 'var(--error-50)',
                border: '1px solid var(--error-200)',
                color: 'var(--error-700)',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '2rem',
                fontSize: '0.875rem'
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '2rem' }}>
              {/* Basic Information */}
              <div>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '600', 
                  color: 'var(--text-primary)', 
                  marginBottom: '1.5rem' 
                }}>
                  Basic Information
                </h3>
                
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  <div className="form-group">
                    <label className="form-label required">Opportunity Title</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="e.g., Senior Software Engineer"
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label required">Company Name</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.company_name}
                        onChange={(e) => handleInputChange('company_name', e.target.value)}
                        placeholder="e.g., Tech Corp Inc."
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label required">Opportunity Type</label>
                      <select
                        className="form-input"
                        value={formData.type}
                        onChange={(e) => handleInputChange('type', e.target.value as OpportunityType)}
                        required
                      >
                        {opportunityTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'end' }}>
                    <div className="form-group">
                      <label className="form-label required">Location</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="e.g., San Francisco, CA"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: 'var(--text-primary)'
                      }}>
                        <input
                          type="checkbox"
                          checked={formData.remote_ok}
                          onChange={(e) => handleInputChange('remote_ok', e.target.checked)}
                          style={{ margin: 0 }}
                        />
                        Remote OK
                      </label>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label required">Description</label>
                    <textarea
                      className="form-input"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe the role, responsibilities, and what you're looking for..."
                      rows={6}
                      style={{ resize: 'vertical' }}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Requirements */}
              <div>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '600', 
                  color: 'var(--text-primary)', 
                  marginBottom: '1.5rem' 
                }}>
                  Requirements
                </h3>

                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  <div className="form-group">
                    <label className="form-label">Required Skills</label>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <input
                        type="text"
                        className="form-input"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        placeholder="e.g., JavaScript, React, Node.js"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSkillAdd();
                          }
                        }}
                        style={{ flex: 1 }}
                      />
                      <button
                        type="button"
                        onClick={handleSkillAdd}
                        className="btn btn-secondary"
                        disabled={!skillInput.trim()}
                      >
                        Add
                      </button>
                    </div>
                    {formData.required_skills.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {formData.required_skills.map((skill, index) => (
                          <span
                            key={index}
                            style={{
                              background: 'var(--accent-100)',
                              color: 'var(--accent-700)',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '12px',
                              fontSize: '0.875rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => handleSkillRemove(skill)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--accent-600)',
                                cursor: 'pointer',
                                padding: 0,
                                fontSize: '1rem'
                              }}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Min Experience (years)</label>
                      <input
                        type="number"
                        className="form-input"
                        value={formData.min_experience}
                        onChange={(e) => handleInputChange('min_experience', parseInt(e.target.value) || 0)}
                        min="0"
                        max="50"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Max Experience (years)</label>
                      <input
                        type="number"
                        className="form-input"
                        value={formData.max_experience || ''}
                        onChange={(e) => handleInputChange('max_experience', e.target.value ? parseInt(e.target.value) : null)}
                        min="0"
                        max="50"
                        placeholder="No limit"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Required Degree</label>
                      <select
                        className="form-input"
                        value={formData.required_degree || ''}
                        onChange={(e) => handleInputChange('required_degree', e.target.value || null)}
                      >
                        <option value="">No requirement</option>
                        {degreeOptions.map(degree => (
                          <option key={degree.value} value={degree.value}>
                            {degree.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Job Types</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem' }}>
                      {jobTypes.map(jobType => (
                        <label
                          key={jobType.value}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.875rem',
                            color: 'var(--text-secondary)'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={formData.job_types.includes(jobType.value)}
                            onChange={(e) => handleJobTypeChange(jobType.value, e.target.checked)}
                          />
                          {jobType.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Compensation & Settings */}
              <div>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '600', 
                  color: 'var(--text-primary)', 
                  marginBottom: '1.5rem' 
                }}>
                  Compensation & Settings
                </h3>

                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Minimum Salary (USD)</label>
                      <input
                        type="number"
                        className="form-input"
                        value={formData.salary_min || ''}
                        onChange={(e) => handleInputChange('salary_min', e.target.value ? parseInt(e.target.value) : null)}
                        min="0"
                        placeholder="e.g., 80000"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Maximum Salary (USD)</label>
                      <input
                        type="number"
                        className="form-input"
                        value={formData.salary_max || ''}
                        onChange={(e) => handleInputChange('salary_max', e.target.value ? parseInt(e.target.value) : null)}
                        min="0"
                        placeholder="e.g., 120000"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label required">Visibility</label>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                      {visibilityOptions.map(option => (
                        <label
                          key={option.value}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.75rem',
                            padding: '1rem',
                            border: `2px solid ${formData.visibility === option.value ? 'var(--accent-500)' : 'var(--surface-200)'}`,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            background: formData.visibility === option.value ? 'var(--accent-50)' : 'var(--white)'
                          }}
                        >
                          <input
                            type="radio"
                            name="visibility"
                            value={option.value}
                            checked={formData.visibility === option.value}
                            onChange={(e) => handleInputChange('visibility', e.target.value as OpportunityVisibility)}
                            style={{ marginTop: '0.125rem' }}
                          />
                          <div>
                            <div style={{ 
                              fontWeight: '600', 
                              color: 'var(--text-primary)', 
                              marginBottom: '0.25rem' 
                            }}>
                              {option.label}
                            </div>
                            <div style={{ 
                              fontSize: '0.875rem', 
                              color: 'var(--text-secondary)' 
                            }}>
                              {option.description}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label required">Expires On</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.expires_at}
                      onChange={(e) => handleInputChange('expires_at', e.target.value)}
                      min={getMinDate()}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div style={{ 
                borderTop: '1px solid var(--surface-200)', 
                paddingTop: '2rem',
                display: 'flex',
                gap: '1rem',
                justifyContent: 'flex-end'
              }}>
                <Link href="/opportunities" className="btn btn-secondary">
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary"
                  style={{ minWidth: '150px' }}
                >
                  {isSubmitting ? 'Creating...' : 'Create Opportunity'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer style={{
        padding: '2rem 0',
        textAlign: 'center',
        borderTop: '1px solid var(--surface-200)',
        background: 'var(--white)',
        marginTop: '3rem'
      }}>
        <p style={{
          fontSize: '0.875rem',
          color: 'var(--text-muted)'
        }}>
          © 2026 Infinitra Innovations. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
