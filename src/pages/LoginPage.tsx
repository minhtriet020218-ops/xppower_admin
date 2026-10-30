import React, { useState } from 'react';
import { LoginRequestDTOBuilder } from '../dtos/AuthDTO';
import { sanitizeInput, RateLimiter } from '../utils/security';

interface LoginPageProps {
  onLoginSuccess: () => void;
  showLogoutMessage?: boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, showLogoutMessage = false }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [logoutMsg, setLogoutMsg] = useState(showLogoutMessage ? 'Đã đăng xuất thành công!' : '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Kiểm tra Rate Limiter chống brute-force
    if (!RateLimiter.checkAllowed()) {
      setErrorMsg('Thao tác quá nhiều lần. Vui lòng thử lại sau 1 phút.');
      return;
    }

    try {
      setIsLoading(true);

      // Áp dụng Builder Pattern & Sanitization bảo mật OWASP
      const loginDTO = new LoginRequestDTOBuilder()
        .setUsername(sanitizeInput(username))
        .setPassword(sanitizeInput(password))
        .setRememberMe(rememberMe)
        .build();

      // Kiểm tra xác thực (Mock authentication)
      if (loginDTO.username === 'admin' && password === 'admin123') {
        RateLimiter.reset();
        onLoginSuccess();
      } else {
        RateLimiter.recordFailedAttempt();
        setErrorMsg('Tên đăng nhập hoặc mật khẩu không chính xác!');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Đã có lỗi xảy ra.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex p-0 font-sans">
      <div className="row g-0 w-100">
        {/* Left Form Section */}
        <div 
          className="col-12 col-lg-5 col-xl-4 text-white p-4 p-md-5 d-flex flex-column justify-content-center align-items-center shadow-lg" 
          style={{ backgroundColor: '#2A5C36' }}
        >
          <div className="w-100" style={{ maxWidth: '380px' }}>
            <h1 className="fs-5 text-center fw-bold mb-3">
              CHÀO MỪNG ĐẾN VỚI<br />HỆ THỐNG QUẢN LÝ TÀI SẢN
            </h1>
            <p className="fst-italic text-center small text-light opacity-75 mb-1">
              "Thời gian là tài sản quý giá nhất mà chúng ta có."
            </p>
            <div className="text-center small fst-italic text-light opacity-50 mb-4">
              - Benjamin Franklin
            </div>

            <h2 className="text-center fs-4 fw-bold mb-4" style={{ color: '#4CAF50', opacity: 0.8 }}>
              ĐĂNG NHẬP
            </h2>

            {/* Thông báo đăng xuất thành công */}
            {logoutMsg && (
              <div className="alert alert-success py-2 text-center small rounded-pill mb-3 shadow-sm d-flex justify-content-between align-items-center px-3" role="alert">
                <span>{logoutMsg}</span>
                <button 
                  type="button" 
                  className="btn-close btn-close-sm" 
                  style={{ fontSize: '10px' }} 
                  onClick={() => setLogoutMsg('')}
                  aria-label="Close"
                ></button>
              </div>
            )}

            {/* Thông báo lỗi */}
            {errorMsg && (
              <div className="alert alert-danger py-2 text-center small rounded-pill mb-3 shadow-sm" role="alert">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Ô nhập Tên đăng nhập với Icon cố định bên trái */}
              <div className="input-group mb-3 shadow-sm rounded-pill overflow-hidden">
                <span className="input-group-text border-0 text-white ps-3 pe-2" style={{ backgroundColor: '#5C9A69' }}>
                  👤
                </span>
                <input
                  type="text"
                  placeholder="Tên đăng nhập"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (logoutMsg) setLogoutMsg('');
                  }}
                  className="form-control border-0 text-white py-2 shadow-none"
                  style={{ backgroundColor: '#5C9A69', color: '#fff' }}
                  required
                />
              </div>

              {/* Ô nhập Mật khẩu với Icon cố định bên trái */}
              <div className="input-group mb-3 shadow-sm rounded-pill overflow-hidden">
                <span className="input-group-text border-0 text-white ps-3 pe-2" style={{ backgroundColor: '#5C9A69' }}>
                  🔒
                </span>
                <input
                  type="password"
                  placeholder="Mật khẩu"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (logoutMsg) setLogoutMsg('');
                  }}
                  className="form-control border-0 text-white py-2 shadow-none"
                  style={{ backgroundColor: '#5C9A69', color: '#fff' }}
                  required
                />
              </div>

              <div className="d-flex justify-content-between align-items-center small fw-bold mb-4 px-1">
                <label className="d-flex align-items-center cursor-pointer text-white">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="form-check-input me-2 mt-0 shadow-sm"
                  />
                  Ghi nhớ đăng nhập
                </label>
                <a href="#forgot" className="text-white text-decoration-none opacity-75">Quên mật khẩu?</a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn w-100 rounded-pill py-2 fw-bold text-white shadow"
                style={{ backgroundColor: '#23522B' }}
              >
                {isLoading ? (
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                ) : null}
                ĐĂNG NHẬP
              </button>
            </form>
          </div>
        </div>

        {/* Right Gradient Background Section */}
        <div 
          className="col-lg-7 col-xl-8 d-none d-lg-block"
          style={{ background: 'linear-gradient(135deg, #4A63E7 0%, #7B42A6 50%, #9B42A6 100%)' }}
        />
      </div>
    </div>
  );
};