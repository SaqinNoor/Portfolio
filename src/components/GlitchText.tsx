import { useState, useEffect, useCallback } from 'react';

interface GlitchTextProps {
  originalText: string;
  alternateText: string;
}

export default function GlitchText({ originalText, alternateText }: GlitchTextProps) {
  const [isGlitching, setIsGlitching] = useState(false);
  const [currentText, setCurrentText] = useState(originalText);
  const [isOriginalText, setIsOriginalText] = useState(true);

  const toggleText = useCallback(() => {
    setIsGlitching(true);
    setTimeout(() => {
      setCurrentText(isOriginalText ? alternateText : originalText);
      setIsOriginalText(!isOriginalText);
      setIsGlitching(false);
    }, 150);
  }, [isOriginalText, originalText, alternateText]);

  const handleMouseLeave = useCallback(() => {
    setIsGlitching(true);
    setTimeout(() => {
      setCurrentText(originalText);
      setIsOriginalText(true);
      setIsGlitching(false);
    }, 150);
  }, [originalText]);

  return (
    <div className="text-wrapper" onMouseEnter={toggleText} onMouseLeave={handleMouseLeave}>
      <div className={`text ${isGlitching ? 'glitching' : ''}`} data-text={currentText}>
        {currentText}
      </div>
    </div>
  );
}