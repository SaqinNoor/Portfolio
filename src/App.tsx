import { useState, useEffect } from 'react';
import GlitchText from './components/GlitchText';
import SocialButtons from './components/SocialButtons';
import Spotlight from './components/Spotlight';
import VisitCounter from './components/VisitCounter';

function App() {
  const [mode, setMode] = useState<'dark-mode' | 'light-mode'>('dark-mode');
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem('mode') as 'dark-mode' | 'light-mode';
    if (savedMode) {
      setMode(savedMode);
      document.body.className = savedMode;
    } else {
      document.body.className = mode;
    }
  }, [mode]);

  const toggleMode = () => {
    setIsGlitching(true);
    setTimeout(() => {
      const newMode = mode === 'dark-mode' ? 'light-mode' : 'dark-mode';
      setMode(newMode);
      document.body.className = newMode;
      localStorage.setItem('mode', newMode);
      setTimeout(() => {
        setIsGlitching(false);
      }, 300);
    }, 150);
  };

  const handleAboutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsGlitching(true);
    setTimeout(() => {
      window.location.href = 'about.html';
    }, 300);
  };

  return (
    <>
      <Spotlight />
      <div className="container">
        <GlitchText originalText="Hi, I'm Saqin." alternateText="BEISC 08-E-01" />
        <SocialButtons />
      </div>
      <button
        className="mode-toggle"
        onClick={toggleMode}
        data-text={mode === 'dark-mode' ? 'Light Mode' : 'Dark Mode'}
      >
        {mode === 'dark-mode' ? 'Light Mode' : 'Dark Mode'}
      </button>
      <a
        href="about.html"
        className="about-button"
        onClick={handleAboutClick}
        data-text="About Me"
      >
        About Me
      </a>
      <div className={`glitch-overlay ${isGlitching ? 'active' : ''}`} />
      <VisitCounter />
    </>
  );
}

export default App;