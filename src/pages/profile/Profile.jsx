import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [originalData, setOriginalData] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminAPI.getProfile();
      
      if (response.success && response.data) {
        const adminData = response.data;
        const profileData = {
          fullName: adminData.name || '',
          email: adminData.email || '',
          phone: adminData.phone || '',
          role: adminData.role || 'admin',
        };
        setFormData(profileData);
        setOriginalData(profileData);
      } else {
        setError('Failed to load profile data');
      }
    } catch (err) {
      setError(err.message || 'Failed to load profile');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCancel = () => {
    if (originalData) {
      setFormData(originalData);
    }
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="page">
        <div className="profile-card">
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="profile-card">
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p style={{ color: 'red' }}>{error}</p>
            <button onClick={fetchProfile} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const emailInitial = (formData.email?.[0] || formData.fullName?.[0] || 'A').toUpperCase();

  return (
    <div className="page">
      <div className="profile-card">
        <div className="profile-card__body">
          <div className="profile-card__aside">
            <div className="profile-card__avatar-wrapper profile-card__avatar-wrapper--initial">
              <div className="profile-card__avatar-initial">{emailInitial}</div>
            </div>
            <div className="profile-card__identity">
              <h2 className="profile-card__name">{formData.fullName || 'Admin User'}</h2>
              <span className="profile-card__badge">{formData.role || 'admin'}</span>
            </div>
          </div>

          <div className="profile-card__content">
            <h3 className="profile-card__section-title">Profile Details</h3>
            <div className="profile-card__rows">
              <div className="profile-card__row">
                <label className="profile-card__label" htmlFor="fullName">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="profile-card__input"
                />
              </div>

              <div className="profile-card__row">
                <label className="profile-card__label" htmlFor="email">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="profile-card__input"
                />
              </div>
{/* 
              <div className="profile-card__row">
                <label className="profile-card__label" htmlFor="phone">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="profile-card__input"
                />
              </div> */}

              <div className="profile-card__row">
                <label className="profile-card__label" htmlFor="role">
                  Role
                </label>
                <input
                  type="text"
                  id="role"
                  name="role"
                  value={formData.role}
                  readOnly
                  className="profile-card__input profile-card__input--readonly"
                />
              </div>
            </div>

            <div className="profile-card__actions profile-card__actions--row">
              <button
                type="button"
                onClick={handleCancel}
                className="profile-card__cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
