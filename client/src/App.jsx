import { useState, useEffect } from 'react';

// Simple landing page until we can get the full React app working
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication status
    fetch('/api/user')
      .then(response => {
        if (response.ok) {
          setIsAuthenticated(true);
        }
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, []);

  const handleLogin = () => {
    window.location.href = '/api/login';
  };

  if (isLoading) {
    return React.createElement('div', {
      style: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }
    }, React.createElement('div', {
      style: { textAlign: 'center' }
    }, [
      React.createElement('div', {
        key: 'spinner',
        style: {
          marginBottom: '16px'
        }
      }, React.createElement('div', {
        style: {
          display: 'inline-block',
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }
      })),
      React.createElement('p', {
        key: 'text',
        style: { color: '#666', margin: 0 }
      }, 'Loading AI Community Portal...')
    ]));
  }

  return React.createElement('div', {
    style: {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto'
    }
  }, [
    // Header
    React.createElement('header', {
      key: 'header',
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 0',
        borderBottom: '1px solid #eee',
        marginBottom: '40px'
      }
    }, [
      React.createElement('h1', {
        key: 'title',
        style: { margin: 0, color: '#333' }
      }, '🤖 AI Community Portal'),
      
      isAuthenticated 
        ? React.createElement('div', {
            key: 'user-menu',
            style: { display: 'flex', gap: '10px' }
          }, [
            React.createElement('a', {
              key: 'admin',
              href: '/admin',
              style: {
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px'
              }
            }, 'Admin Panel'),
            React.createElement('a', {
              key: 'logout',
              href: '/api/logout',
              style: {
                padding: '8px 16px',
                backgroundColor: '#6c757d',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px'
              }
            }, 'Logout')
          ])
        : React.createElement('button', {
            key: 'login',
            onClick: handleLogin,
            style: {
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }
          }, 'Sign In')
    ]),

    // Main content
    React.createElement('main', {
      key: 'main'
    }, [
      React.createElement('div', {
        key: 'welcome',
        style: {
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          marginBottom: '40px'
        }
      }, [
        React.createElement('h2', {
          key: 'title',
          style: { marginBottom: '20px', color: '#333' }
        }, 'Welcome to AI Community Portal'),
        React.createElement('p', {
          key: 'description',
          style: { marginBottom: '30px', color: '#666', fontSize: '18px' }
        }, 'Discover and review the best AI tools, prompts, courses, and models. Join our community of AI enthusiasts and professionals.'),
        
        isAuthenticated 
          ? React.createElement('div', {
              key: 'auth-content',
              style: { marginTop: '30px' }
            }, [
              React.createElement('h3', {
                key: 'auth-title'
              }, '✅ You are signed in!'),
              React.createElement('p', {
                key: 'auth-text',
                style: { marginBottom: '20px' }
              }, 'Access the admin panel to manage tools, reviews, and platform settings.'),
              React.createElement('a', {
                key: 'admin-link',
                href: '/admin',
                style: {
                  display: 'inline-block',
                  padding: '12px 24px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontSize: '16px'
                }
              }, 'Go to Admin Panel')
            ])
          : React.createElement('div', {
              key: 'guest-content'
            }, [
              React.createElement('p', {
                key: 'guest-text',
                style: { marginBottom: '20px' }
              }, 'Sign in to access all features including the admin panel.'),
              React.createElement('button', {
                key: 'guest-login',
                onClick: handleLogin,
                style: {
                  padding: '12px 24px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }
              }, 'Sign In with Replit')
            ])
      ]),

      // Features section
      React.createElement('div', {
        key: 'features',
        style: {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }
      }, [
        React.createElement('div', {
          key: 'feature-1',
          style: {
            padding: '20px',
            border: '1px solid #ddd',
            borderRadius: '8px'
          }
        }, [
          React.createElement('h3', { key: 'title' }, '🛠️ AI Tools Directory'),
          React.createElement('p', { key: 'desc' }, 'Discover and review the latest AI tools and software solutions.')
        ]),
        React.createElement('div', {
          key: 'feature-2',
          style: {
            padding: '20px',
            border: '1px solid #ddd',
            borderRadius: '8px'
          }
        }, [
          React.createElement('h3', { key: 'title' }, '⚙️ Admin Panel'),
          React.createElement('p', { key: 'desc' }, 'WordPress-style admin interface for managing content and users.')
        ]),
        React.createElement('div', {
          key: 'feature-3',
          style: {
            padding: '20px',
            border: '1px solid #ddd',
            borderRadius: '8px'
          }
        }, [
          React.createElement('h3', { key: 'title' }, '🔐 Authentication'),
          React.createElement('p', { key: 'desc' }, 'Secure login with Replit Auth and user session management.')
        ])
      ])
    ])
  ]);
}

export default App;