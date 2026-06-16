import { useState } from 'react';
import { getSession, saveSession, clearSession } from './auth/session';
import HomePage from './pages/HomePage';
import SignInPage from './pages/SignInPage';
import DirectoryPage from './pages/DirectoryPage';
import './App.css';

export default function App() {
  const [session, setSession] = useState(() => getSession());
  const [view, setView] = useState(() => (getSession() ? 'directory' : 'home'));

  const handleSignIn = (data) => {
    saveSession(data);
    setSession(data);
    setView('directory');
  };

  const handleSignOut = () => {
    clearSession();
    setSession(null);
    setView('home');
  };

  if (view === 'home') {
    return <HomePage onSignIn={() => setView('signin')} />;
  }

  if (view === 'signin') {
    return (
      <SignInPage
        onBack={() => setView('home')}
        onSignIn={handleSignIn}
      />
    );
  }

  return <DirectoryPage session={session} onSignOut={handleSignOut} />;
}
