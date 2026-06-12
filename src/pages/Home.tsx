import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, Loader } from 'impact-ui';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../types';
import { APP_CONFIG } from '../constants/app';
import './Home.css';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="home-container">
        <div className="page-loading">
          <Loader size="large" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const dropMenuOptions = [
    {
      label: user.name,
      onClick: () => {},
    },
    {
      label: user.email,
      onClick: () => {},
    },
    {
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  return (
    <div className="home-container">
      <Header
        title={APP_CONFIG.name}
        userName={user.name}
        dropMenuOptions={dropMenuOptions}
        avatarType="withoutPicture"
      />
      <div className="home-content">
        {/* Blank Home Page */}
      </div>
    </div>
  );
};
