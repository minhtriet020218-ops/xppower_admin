import { useState } from 'react';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { AuthService } from './services/AuthService';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => AuthService.isAuthenticated());

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    AuthService.logout();
    setIsLoggedIn(false);
  };

  return (
    <div className="app-container">
      {!isLoggedIn ? (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      ) : (
        <DashboardPage onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;