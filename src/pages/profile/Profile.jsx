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

  // Icon components
  const AvatarSvg = () => (
    <svg width="100" height="100" viewBox="0 0 131 131" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0.5" y="0.5" width="130" height="130" rx="65" fill="white" />
      <rect x="0.5" y="0.5" width="130" height="130" rx="65" stroke="#ECECEC" />
      <rect x="18.5" y="18.5" width="94" height="94" rx="47" fill="#F3F4F6" />
      <rect x="18.5" y="18.5" width="94" height="94" rx="47" stroke="#E9E9E9" />
      <path
        d="M46.3333 80.0003C46.3333 77.525 47.3167 75.151 49.067 73.4007C50.8174 71.6503 53.1913 70.667 55.6667 70.667H74.3333C76.8087 70.667 79.1827 71.6503 80.933 73.4007C82.6833 75.151 83.6667 77.525 83.6667 80.0003C83.6667 81.238 83.175 82.425 82.2998 83.3002C81.4247 84.1753 80.2377 84.667 79 84.667H51C49.7623 84.667 48.5753 84.1753 47.7002 83.3002C46.825 82.425 46.3333 81.238 46.3333 80.0003Z"
        stroke="#787878"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M65 61.3335C68.866 61.3335 72 58.1995 72 54.3335C72 50.4675 68.866 47.3335 65 47.3335C61.134 47.3335 58 50.4675 58 54.3335C58 58.1995 61.134 61.3335 65 61.3335Z" stroke="#787878" strokeWidth="2" />
    </svg>
  );

  const PersonIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20.59 22C20.59 18.13 16.74 15 12 15C7.26 15 3.41 18.13 3.41 22" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const EnvelopeIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 20C3.45 20 2.97933 19.8043 2.588 19.413C2.19667 19.0217 2.00067 18.5507 2 18V6C2 5.45 2.196 4.97933 2.588 4.588C2.98 4.19667 3.45067 4.00067 4 4H20C20.55 4 21.021 4.196 21.413 4.588C21.805 4.98 22.0007 5.45067 22 6V18C22 18.55 21.8043 19.021 21.413 19.413C21.0217 19.805 20.5507 20.0007 20 20H4ZM12 13L4 8V18H20V8L12 13ZM12 11L20 6H4L12 11ZM4 8V6V18V8Z" fill="#464646"/>
    </svg>
    
  );

  const PhoneIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7292C21.7209 20.9842 21.5573 21.2131 21.3522 21.4012C21.1472 21.5893 20.9053 21.7325 20.6391 21.8222C20.373 21.9118 20.0882 21.9462 19.805 21.923C16.7426 21.5856 13.787 20.5341 11.19 18.85C8.77382 17.3147 6.72533 15.2662 5.19 12.85C3.49997 10.2412 2.44824 7.27099 2.12 4.2C2.09689 3.91848 2.13087 3.63521 2.21982 3.36943C2.30877 3.10365 2.45055 2.86172 2.637 2.657C2.82345 2.45228 3.05055 2.28849 3.30421 2.17578C3.55787 2.06308 3.83297 2.00391 4.11 2H7.11C7.58719 1.99522 8.05398 2.16708 8.41458 2.48365C8.77517 2.80022 9.00399 3.23945 9.06 3.72C9.20479 4.68007 9.43919 5.62274 9.76 6.54C9.89856 6.93791 9.93265 7.36877 9.85852 7.78591C9.78439 8.20305 9.60458 8.59235 9.34 8.92L8.09 10.17C9.51355 12.9352 11.5648 14.9865 14.33 16.41L15.58 15.16C15.9077 14.8954 16.297 14.7156 16.7141 14.6415C17.1313 14.5674 17.5621 14.6015 17.96 14.74C18.8773 15.0608 19.8199 15.2952 20.78 15.44C21.2651 15.496 21.7091 15.7275 22.0264 16.0916C22.3437 16.4557 22.5132 16.9267 22.5 17.41L22 16.92Z" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const ShieldIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  return (
    <div className="page">
      <div className="profile-card">
        <div className="profile-card__banner"></div>
        <div className="profile-card__avatar-container">
          <div className="profile-card__avatar-wrapper">
            <AvatarSvg />
          </div>
        </div>
        
        <div className="profile-card__content">
          <div className="profile-card__fields-grid">
            <div className="profile-card__field">
              <label className="profile-card__label" htmlFor="fullName">
                <PersonIcon />
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName || 'Admin name'}
                readOnly
                className="profile-card__input profile-card__input--readonly"
              />
            </div>

            <div className="profile-card__field">
              <label className="profile-card__label" htmlFor="email">
                <EnvelopeIcon />
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email || 'Admin@.com'}
                readOnly
                className="profile-card__input profile-card__input--readonly"
              />
            </div>

            <div className="profile-card__field">
              <label className="profile-card__label" htmlFor="phone">
                <PhoneIcon />
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone || '133546987'}
                readOnly
                className="profile-card__input profile-card__input--readonly"
              />
            </div>

            <div className="profile-card__field">
              <label className="profile-card__label" htmlFor="role">
                <ShieldIcon />
                Role
              </label>
              <input
                type="text"
                id="role"
                name="role"
                value={formData.role || 'Administrator'}
                readOnly
                className="profile-card__input profile-card__input--readonly"
              />
            </div>
          </div>

          <div className="profile-card__actions">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="profile-card__save-btn"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
