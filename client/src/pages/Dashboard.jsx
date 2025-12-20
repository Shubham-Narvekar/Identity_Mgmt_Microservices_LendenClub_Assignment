import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading, error, logout, fetchProfile, clearError } = useAuth();
  
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [showFullAadhaar, setShowFullAadhaar] = useState(false);

  /**
   * Fetch user profile on component mount
   * Only fetch if we don't already have profile data with aadhaar from AuthContext
   */
  useEffect(() => {
    // If user data exists and has aadhaar, use it directly (already fetched by AuthContext)
    if (user && user.aadhaar) {
      setProfileData(user);
      setProfileLoading(false);
    } else if (user && !user.aadhaar) {
      // User exists but no aadhaar, fetch full profile
      loadProfile();
    } else if (!loading && !user) {
      // No user and not loading, try to fetch
      loadProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  /**
   * Load user profile with decrypted Aadhaar
   */
  const loadProfile = async () => {
    try {
      setProfileLoading(true);
      setProfileError(null);
      clearError();

      const profile = await fetchProfile();
      setProfileData(profile);
    } catch (error) {
      setProfileError(error.message || 'Failed to load profile. Please try again.');
      console.error('Profile fetch error:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  /**
   * Handle logout
   */
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      return dateString;
    }
  };

  /**
   * Format Aadhaar for display (mask middle digits for security)
   */
  const formatAadhaar = (aadhaar, showFull = false) => {
    if (!aadhaar) return 'N/A';
    if (aadhaar.length !== 12) return aadhaar;
    if (showFull) {
      // Show full Aadhaar with spacing for readability
      return `${aadhaar.slice(0, 4)} ${aadhaar.slice(4, 8)} ${aadhaar.slice(8)}`;
    }
    // Show first 4 and last 4 digits, mask middle 4
    return `${aadhaar.slice(0, 4)} XXXX ${aadhaar.slice(8)}`;
  };

  // Show loading state
  if (loading || profileLoading) {
    return (
      <div className="dashboard-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || profileError) {
    return (
      <div className="dashboard-container">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h2>Error Loading Profile</h2>
          <p>{error || profileError}</p>
          <div className="error-actions">
            <button onClick={loadProfile} className="retry-button">
              Retry
            </button>
            <button onClick={handleLogout} className="logout-button-secondary">
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show profile data
  const displayProfile = profileData || user;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Profile Dashboard</h1>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {displayProfile?.name ? (
                displayProfile.name.charAt(0).toUpperCase()
              ) : (
                displayProfile?.email?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
            <div className="profile-title">
              <h2>{displayProfile?.name || 'User'}</h2>
              <p className="profile-email">{displayProfile?.email}</p>
            </div>
          </div>

          <div className="profile-details">
            <div className="detail-section">
              <h3>Personal Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Full Name</span>
                  <span className="detail-value">
                    {displayProfile?.name || 'Not provided'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email Address</span>
                  <span className="detail-value">{displayProfile?.email}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">User ID</span>
                  <span className="detail-value detail-id">
                    {displayProfile?._id || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Identity Information</h3>
              <div className="detail-grid">
                <div className="detail-item full-width">
                  <span className="detail-label">Aadhaar Number</span>
                  <span className="detail-value aadhaar-value">
                    {displayProfile?.aadhaar ? (
                      <>
                        <span className="aadhaar-display">
                          {formatAadhaar(displayProfile.aadhaar, showFullAadhaar)}
                        </span>
                        <button
                          className="show-full-button"
                          onClick={() => setShowFullAadhaar(!showFullAadhaar)}
                          title={showFullAadhaar ? "Hide full Aadhaar" : "Show full Aadhaar"}
                        >
                          {showFullAadhaar ? 'Hide' : 'Show Full'}
                        </button>
                      </>
                    ) : (
                      'Not available'
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Account Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Account Created</span>
                  <span className="detail-value">
                    {formatDate(displayProfile?.createdAt)}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Last Updated</span>
                  <span className="detail-value">
                    {formatDate(displayProfile?.updatedAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-actions">
            <button onClick={loadProfile} className="refresh-button">
              🔄 Refresh Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

