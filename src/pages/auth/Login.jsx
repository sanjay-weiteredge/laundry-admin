import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../../styles/auth.css';
import loginIllustration from '../../assets/login.png';
import Button from '../../components/ui/Button';
import InputField from '../../components/ui/InputField';
import useAuth from '../../hooks/useAuth';

const Login = () => {
  const [formValues, setFormValues] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(formValues);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err.message || 'Unable to log in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-content">
          <span className="login-brand">LAUNDRY</span>
          <h1 className="login-title">
            Welcome to Laundry
            <br />
            Admin Panel
          </h1>
          <p className="login-subtitle">
            Manage your business with ease.
          </p>

          <form className="login-form" onSubmit={handleSubmit}>
            <InputField
              label="Email address"
              name="email"
              type="email"
              placeholder="super@laundry.app"
              autoComplete="email"
              required
              value={formValues.email}
              onChange={handleChange}
            />
            <InputField
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
              value={formValues.password}
              onChange={handleChange}
            />

            <div className="login-links-row">
              <button type="button" className="ui-button ui-button--link">
                Forgot password?
              </button>
            </div>

            {error && <p className="text-danger small">{error}</p>}

            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Signing in...' : 'Log In'}
            </Button>
          </form>

          <p className="login-footer">
            Need an account?{' '}
            <button type="button" className="ui-button ui-button--link">
              Contact support
            </button>
          </p>
        </div>

        <div className="login-illustration-panel">
          <img
            src={loginIllustration}
            alt="Laundry illustration"
            className="login-illustration"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;


