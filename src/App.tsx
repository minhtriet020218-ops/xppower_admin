import { useState } from 'react';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';

function App() {
  // Quản lý trạng thái đăng nhập đơn giản cho Frontend Prototype
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  return (
    <div className="app-container">
      {!isLoggedIn ? (
        <LoginPage onLoginSuccess={() => setIsLoggedIn(true)} />
      ) : (
        <DashboardPage />
      )}
    </div>
  );
}

export default App;