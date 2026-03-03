import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * PROTECTED ROUTE WRAPPER
 * ----------------------
 * This component acts as a 'Security Gate'. 
 * It wraps any private page and checks if a user is logged in.
 */
const ProtectedRoute = ({ children }) => {
  // 1. ACCESSING THE SECURITY LOGS
  // We 'reach up' to the AuthContext to find out who is logged in.
  const { user, loading } = useContext(AuthContext);

  /**
   * 2. THE LOADING STATE (The "Wait" Phase)
   * On refresh, React takes a second to find the token in LocalStorage.
   * We must show a loading screen so we don't accidentally redirect 
   * a valid user while the 'checker' is still working.
   */
  if (loading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h2>Verifying Identity...</h2>
        <p>Please wait a moment.</p>
      </div>
    );
  }

  /**
   * 3. THE SECURITY CHECK (The "Bouncer" Phase)
   * If 'loading' is false and 'user' is still null, it means 
   * the token was missing, fake, or expired.
   */
  if (!user) {
    console.log("🚫 Bouncer says: No User Found. Redirecting to Login.");
    
    // <Navigate /> is a React Router component that 'teleports' 
    // the user to a different URL automatically.
    return <Navigate to="/login" />;
  }

  /**
   * 4. THE CLEARANCE (The "Welcome" Phase)
   * If we reached here, a user exists! 
   * We return 'children', which means the Dashboard or Profile 
   * will now be rendered exactly where the Bouncer was standing.
   */
  return children;
};

export default ProtectedRoute;