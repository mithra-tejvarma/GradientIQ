import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/auth';
import './Page.css';

// DEMO ONLY - Temporary dummy credentials for hackathon/demo purposes
const DEMO_CREDENTIALS = {
  student: {
    email: 'student@demo.com',
    password: 'Student@123',
    role: 'student'
  },
  faculty: {
    email: 'faculty@demo.com',
    password: 'Faculty@123',
    role: 'faculty'
  }
};

function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(''); // Clear error on input change
  };

  // DEMO ONLY - Autofill demo credentials
  const handleDemoFill = (userType) => {
    setFormData({
      email: DEMO_CREDENTIALS[userType].email,
      password: DEMO_CREDENTIALS[userType].password,
    });
    setError('');
  };

  // DEMO ONLY - Check if credentials match demo credentials
  const isDemoCredentials = (email, password) => {
    return (
      (email === DEMO_CREDENTIALS.student.email && password === DEMO_CREDENTIALS.student.password) ||
      (email === DEMO_CREDENTIALS.faculty.email && password === DEMO_CREDENTIALS.faculty.password)
    );
  };

  // DEMO ONLY - Get role from demo credentials
  const getDemoRole = (email) => {
    if (email === DEMO_CREDENTIALS.student.email) return 'student';
    if (email === DEMO_CREDENTIALS.faculty.email) return 'faculty';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // DEMO ONLY - Check if using demo credentials (frontend-only for hackathon)
      if (isDemoCredentials(formData.email, formData.password)) {
        // Simulate successful login with demo credentials
        const demoRole = getDemoRole(formData.email);
        
        // Store mock token and role in localStorage
        localStorage.setItem('authToken', 'DEMO_TOKEN_' + Date.now());
        localStorage.setItem('userRole', demoRole);
        localStorage.setItem('userEmail', formData.email);
        localStorage.setItem('isDemoUser', 'true');
        
        // Redirect to dashboard
        navigate('/');
        return;
      }

      // Fall back to real backend authentication
      await login(formData.email, formData.password);
      navigate('/'); // Redirect to dashboard on success
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
          Login to GradientIQ
        </h1>

        {error && (
          <div style={{
            background: '#fee',
            color: '#c33',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '20px',
            border: '1px solid #fcc'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '500',
              color: '#555'
            }}>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: '16px',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '500',
              color: '#555'
            }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: '16px',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? '#ccc' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => !loading && (e.target.style.background = '#5568d3')}
            onMouseLeave={(e) => !loading && (e.target.style.background = '#667eea')}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* DEMO ONLY - Demo Credentials Info Box */}
        <div style={{
          marginTop: '30px',
          padding: '20px',
          background: '#f0f7ff',
          border: '2px solid #667eea',
          borderRadius: '8px',
        }}>
          <h3 style={{
            margin: '0 0 15px 0',
            fontSize: '14px',
            fontWeight: '600',
            color: '#667eea',
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            🎓 Demo Credentials (For Hackathon Use)
          </h3>
          
          <div style={{ marginBottom: '15px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <div>
                <p style={{
                  margin: '0 0 4px 0',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#333'
                }}>
                  👨‍🎓 Student
                </p>
                <p style={{
                  margin: 0,
                  fontSize: '12px',
                  color: '#666',
                  fontFamily: 'monospace'
                }}>
                  {DEMO_CREDENTIALS.student.email}<br/>
                  {DEMO_CREDENTIALS.student.password}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDemoFill('student')}
                style={{
                  padding: '8px 12px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#5568d3'}
                onMouseLeave={(e) => e.target.style.background = '#667eea'}
              >
                Use Student Demo
              </button>
            </div>
          </div>

          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <p style={{
                  margin: '0 0 4px 0',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#333'
                }}>
                  👨‍🏫 Faculty
                </p>
                <p style={{
                  margin: 0,
                  fontSize: '12px',
                  color: '#666',
                  fontFamily: 'monospace'
                }}>
                  {DEMO_CREDENTIALS.faculty.email}<br/>
                  {DEMO_CREDENTIALS.faculty.password}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDemoFill('faculty')}
                style={{
                  padding: '8px 12px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#5568d3'}
                onMouseLeave={(e) => e.target.style.background = '#667eea'}
              >
                Use Faculty Demo
              </button>
            </div>
          </div>
        </div>

        <div style={{ 
          marginTop: '20px', 
          textAlign: 'center',
          color: '#666'
        }}>
          Don't have an account?{' '}
          <Link 
            to="/register" 
            style={{ 
              color: '#667eea', 
              textDecoration: 'none',
              fontWeight: '600'
            }}
          >
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
