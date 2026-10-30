import React, { useState } from 'react';
import { LoginRequestDTOBuilder } from '../dtos/AuthDTO';
import { sanitizeInput, RateLimiter } from '../utils/security';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [logoutMsg, setLogoutMsg] = useState('Đã đăng xuất thành công!');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!RateLimiter.checkAllowed()) {
      setErrorMsg('Thao tác quá nhiều lần. Vui lòng thử lại sau 1 phút.');
      return;
    }

    try {
      // Áp dụng Builder Pattern & Sanitization
      const loginDTO = new LoginRequestDTOBuilder()
        .setUsername(sanitizeInput(username))
        .setPassword(sanitizeInput(password))
        .setRememberMe(rememberMe)
        .build();

      // OWASP Validation check
      if (loginDTO.username === 'admin' && password === 'admin123') {
        RateLimiter.reset();
        onLoginSuccess();
      } else {
        RateLimiter.recordFailedAttempt();
        setErrorMsg('Tên đăng nhập hoặc mật khẩu không chính xác!');
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* Left Sidebar Form */}
      <div style={{
        width: '380px',
        backgroundColor: '#2A5C36',
        color: '#fff',
        padding: '40px 30px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <h1 style={{ fontSize: '22px', textAlign: 'center', fontWeight: 'bold', marginBottom: '15px' }}>
          CHÀO MỪNG ĐẾN VỚI<br />HỆ THỐNG QUẢN LÝ TÀI SẢN
        </h1>
        <p style={{ fontStyle: 'italic', fontSize: '13px', textAlign: 'center', color: '#d0e0d0', marginBottom: '5px' }}>
          "Thời gian là tài sản quý giá nhất mà chúng ta có."
        </p>
        <span style={{ fontSize: '12px', fontStyle: 'italic', color: '#b0c0b0', marginBottom: '30px' }}>
          - Benjamin Franklin
        </span>

        <h2 style={{ color: '#4CAF50', opacity: 0.6, fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
          ĐĂNG NHẬP
        </h2>

        {/* Alert Notification */}
        {logoutMsg && (
          <div style={{
            backgroundColor: '#D4EDDA',
            color: '#155724',
            padding: '10px 15px',
            borderRadius: '12px',
            width: '100%',
            fontSize: '13px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {logoutMsg}
          </div>
        )}

        {errorMsg && (
          <div style={{
            backgroundColor: '#F8D7DA',
            color: '#721C24',
            padding: '10px 15px',
            borderRadius: '12px',
            width: '100%',
            fontSize: '13px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div style={{ marginBottom: '15px', position: 'relative' }}>
            <input
              type="text"
              placeholder="👤  Tên đăng nhập"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 20px',
                borderRadius: '25px',
                border: 'none',
                backgroundColor: '#5C9A69',
                color: '#fff',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <input
              type="password"
              placeholder="🔒  Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 20px',
                borderRadius: '25px',
                border: 'none',
                backgroundColor: '#5C9A69',
                color: '#fff',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#000', fontWeight: 'bold', marginBottom: '25px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ marginRight: '5px' }}
              />
              Ghi nhớ đăng nhập
            </label>
            <a href="#forgot" style={{ color: '#000', textDecoration: 'none' }}>Quên mật khẩu?</a>
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '25px',
              border: 'none',
              backgroundColor: '#23522B',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            ĐĂNG NHẬP
          </button>
        </form>
      </div>

      {/* Right Gradient Background */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(135deg, #4A63E7 0%, #7B42A6 50%, #9B42A6 100%)'
      }} />
    </div>
  );
};