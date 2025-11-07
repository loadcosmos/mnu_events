import React, { useState } from "react";
import "./style.css"; // подключаем твои стили

export default function SignInSignUpPage() {
  const [showSignup, setShowSignup] = useState(false);

  return (
    <div className="page-wrapper">
      {/* ---- Белая кнопка "Админ" в правом верхнем углу ---- */}
      <a
        id="adminSwitch"
        className="role-switch"
        href="/admin/login.html"       // ← замени на свой путь, если другой
        title="Войти как админ"
        style={{
          position: "fixed",
          top: 16,
          right: 20,
          background: "#fff",
          color: "#d62e1f",
          border: "1px solid rgba(0,0,0,.06)",
          borderRadius: 9999,
          padding: "8px 14px",
          fontWeight: 800,
          fontSize: 14,
          lineHeight: 1,
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          whiteSpace: "nowrap",
          boxShadow: "0 4px 12px rgba(16,24,40,.12)",
          zIndex: 2000,
        }}
      >
        Админ
      </a>

      {/* ---------- HEADER ---------- */}
      <header className="header container">
        <div className="left-section"></div>

        <div className="logo">
          <a href="/index.html">
            <img src="images/logo.png" alt="MNU Events" />
          </a>
        </div>
      </header>

      {/* ---------- LOGIN / SIGNUP CONTAINER ---------- */}
      <div className="login-container">
        {/* ---------- LOGIN FORM ---------- */}
        {!showSignup && (
          <div className="login-form" id="loginForm">
            <h2>Welcome Back</h2>

            <div className="form-message-container">
              <span>Please enter your details to sign in</span>
            </div>

            <form className="form-text">
              <input type="email" placeholder="Enter your email" />
              <input type="password" placeholder="Enter your password" />
              <button type="button">Sign In</button>
              <a href="#">Forgot Your Password?</a>
            </form>

            <p>
              Don't have an account?{" "}
              <a href="#" onClick={() => setShowSignup(true)}>
                Sign Up
              </a>
            </p>
          </div>
        )}

        {/* ---------- SIGNUP FORM ---------- */}
        {showSignup && (
          <div className="signup-form" id="signupForm">
            <h2>Create Account</h2>

            <div className="form-message-container">
              <span>Register with your @kazguu.kz account</span>
            </div>

            <form>
              <input type="email" placeholder="user@kazguu.kz" />
              <input type="password" placeholder="Create password" />
              <input type="password" placeholder="Confirm password" />
              <button type="button">Sign Up</button>
            </form>

            <p>
              Already have an account?{" "}
              <a href="#" onClick={() => setShowSignup(false)}>
                Sign In
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 

// ===== Sign in / Sign up toggle (robust) =====
(function () {
  const loginForm  = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const showSignup = document.getElementById('showSignup');
  const showLogin  = document.getElementById('showLogin');

  // если нет обеих форм — выходим (значит, это другая страница)
  if (!loginForm && !signupForm) return;

  // гарантируем наличие .hidden
  (function ensureHidden() {
    if (!document.querySelector('style[data-hidden-helper]')) {
      const s = document.createElement('style');
      s.setAttribute('data-hidden-helper', '1');
      s.textContent = '.hidden{display:none !important;}';
      document.head.appendChild(s);
    }
  })();

  // старт: логин виден, регистрация скрыта (если обе есть)
  if (loginForm && signupForm) {
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
  }

  // клик "Sign Up"
  if (showSignup && loginForm && signupForm) {
    showSignup.addEventListener('click', (e) => {
      e.preventDefault();
      loginForm.classList.add('hidden');
      signupForm.classList.remove('hidden');
    });
  }

  // клик "Sign In"
  if (showLogin && loginForm && signupForm) {
    showLogin.addEventListener('click', (e) => {
      e.preventDefault();
      signupForm.classList.add('hidden');
      loginForm.classList.remove('hidden');
    });
  }
})();
