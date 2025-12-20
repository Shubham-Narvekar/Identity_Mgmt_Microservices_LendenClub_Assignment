import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Register.css';

const Register = () => {
  const navigate = useNavigate();
  const { register, loading, error, clearError, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    aadhaar: '',
    name: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Clear errors when component mounts or form changes
  useEffect(() => {
    clearError();
  }, [clearError]);

  /**
   * Handle input change
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Format Aadhaar input (only numbers, max 12 digits)
    if (name === 'aadhaar') {
      const numericValue = value.replace(/\D/g, '').slice(0, 12);
      setFormData((prev) => ({
        ...prev,
        [name]: numericValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }

    // Clear confirmPassword error when password changes
    if (name === 'password' && formErrors.confirmPassword) {
      setFormErrors((prev) => ({
        ...prev,
        confirmPassword: '',
      }));
    }
  };

  /**
   * Handle input blur (for validation)
   */
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    // Validate field
    validateField(name, formData[name]);
  };

  /**
   * Validate individual field
   */
  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'email':
        if (!value.trim()) {
          error = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Please enter a valid email address';
        }
        break;

      case 'password':
        if (!value) {
          error = 'Password is required';
        } else if (value.length < 6) {
          error = 'Password must be at least 6 characters';
        } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          error = 'Password must contain uppercase, lowercase, and number';
        }
        break;

      case 'confirmPassword':
        if (!value) {
          error = 'Please confirm your password';
        } else if (value !== formData.password) {
          error = 'Passwords do not match';
        }
        break;

      case 'aadhaar':
        if (!value) {
          error = 'Aadhaar number is required';
        } else if (value.length !== 12) {
          error = 'Aadhaar number must be exactly 12 digits';
        } else if (/^(\d)\1{11}$/.test(value)) {
          error = 'Aadhaar number cannot be all the same digit';
        }
        break;

      case 'name':
        if (value.trim() && value.trim().length < 2) {
          error = 'Name must be at least 2 characters';
        } else if (value.trim() && !/^[a-zA-Z\s'-]+$/.test(value)) {
          error = 'Name can only contain letters, spaces, hyphens, and apostrophes';
        }
        break;

      default:
        break;
    }

    setFormErrors((prev) => ({
      ...prev,
      [name]: error,
    }));

    return !error;
  };

  /**
   * Validate entire form
   */
  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // Validate email
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Validate password
    if (!formData.password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
      isValid = false;
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (formData.confirmPassword !== formData.password) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    // Validate Aadhaar
    if (!formData.aadhaar) {
      errors.aadhaar = 'Aadhaar number is required';
      isValid = false;
    } else if (formData.aadhaar.length !== 12) {
      errors.aadhaar = 'Aadhaar number must be exactly 12 digits';
      isValid = false;
    } else if (/^(\d)\1{11}$/.test(formData.aadhaar)) {
      errors.aadhaar = 'Aadhaar number cannot be all the same digit';
      isValid = false;
    }

    // Validate name (optional but if provided, must be valid)
    if (formData.name.trim() && formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
      isValid = false;
    } else if (formData.name.trim() && !/^[a-zA-Z\s'-]+$/.test(formData.name)) {
      errors.name = 'Name can only contain letters, spaces, hyphens, and apostrophes';
      isValid = false;
    }

    setFormErrors(errors);
    setTouched({
      email: true,
      password: true,
      confirmPassword: true,
      aadhaar: true,
      name: true,
    });

    return isValid;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      await register({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        aadhaar: formData.aadhaar,
        name: formData.name.trim() || undefined,
      });

      // Navigate to dashboard on success
      navigate('/dashboard');
    } catch (error) {
      // Error is already handled in AuthContext
      console.error('Registration failed:', error);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1>Create Account</h1>
          <p>Sign up to get started with your account.</p>
        </div>

        {/* Display error message from context */}
        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Name Field (Optional) */}
          <div className="form-group">
            <label htmlFor="name">Full Name (Optional)</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={formErrors.name && touched.name ? 'error' : ''}
              placeholder="Enter your full name"
              disabled={loading}
              autoComplete="name"
            />
            {formErrors.name && touched.name && (
              <span className="field-error">{formErrors.name}</span>
            )}
          </div>

          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={formErrors.email && touched.email ? 'error' : ''}
              placeholder="Enter your email"
              disabled={loading}
              autoComplete="email"
              required
            />
            {formErrors.email && touched.email && (
              <span className="field-error">{formErrors.email}</span>
            )}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={formErrors.password && touched.password ? 'error' : ''}
              placeholder="Enter your password"
              disabled={loading}
              autoComplete="new-password"
              required
            />
            {formErrors.password && touched.password && (
              <span className="field-error">{formErrors.password}</span>
            )}
            <small className="field-hint">
              Must be at least 6 characters with uppercase, lowercase, and number
            </small>
          </div>

          {/* Confirm Password Field */}
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              className={formErrors.confirmPassword && touched.confirmPassword ? 'error' : ''}
              placeholder="Confirm your password"
              disabled={loading}
              autoComplete="new-password"
              required
            />
            {formErrors.confirmPassword && touched.confirmPassword && (
              <span className="field-error">{formErrors.confirmPassword}</span>
            )}
          </div>

          {/* Aadhaar Field */}
          <div className="form-group">
            <label htmlFor="aadhaar">Aadhaar Number *</label>
            <input
              type="text"
              id="aadhaar"
              name="aadhaar"
              value={formData.aadhaar}
              onChange={handleChange}
              onBlur={handleBlur}
              className={formErrors.aadhaar && touched.aadhaar ? 'error' : ''}
              placeholder="Enter 12-digit Aadhaar number"
              disabled={loading}
              maxLength={12}
              required
            />
            {formErrors.aadhaar && touched.aadhaar && (
              <span className="field-error">{formErrors.aadhaar}</span>
            )}
            <small className="field-hint">
              Enter your 12-digit Aadhaar number
            </small>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Login Link */}
        <div className="register-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="link">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

