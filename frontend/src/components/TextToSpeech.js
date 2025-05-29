import React, { useState } from 'react';

function TextToSpeech({ text, label = "Listen" }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);

  const playText = async () => {
    
    if (isPlaying && currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setIsPlaying(false);
      setCurrentAudio(null);
      return;
    }

    if (!text || text.trim().length === 0) {
      alert('No text to read');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Requesting text-to-speech for:', text.substring(0, 100) + '...');

      const response = await fetch('https://sn64mlzf08.execute-api.us-east-1.amazonaws.com/textToSpeech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate speech');
      }

      console.log('Received audio data');

      
      const audioData = atob(data.audioData);
      const audioArray = new Uint8Array(audioData.length);
      for (let i = 0; i < audioData.length; i++) {
        audioArray[i] = audioData.charCodeAt(i);
      }
      
      const audioBlob = new Blob([audioArray], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      setCurrentAudio(audio);
      
      audio.onplay = () => {
        console.log('Audio started playing');
        setIsPlaying(true);
      };
      
      audio.onended = () => {
        console.log('Audio finished playing');
        setIsPlaying(false);
        setCurrentAudio(null);
        URL.revokeObjectURL(audioUrl); 
      };
      
      audio.onerror = (error) => {
        console.error('Audio playback error:', error);
        setIsPlaying(false);
        setCurrentAudio(null);
        alert('Error playing audio');
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();

    } catch (error) {
      console.error('Text-to-speech error:', error);
      alert(`Failed to generate speech: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={playText}
      disabled={isLoading}
      className={`btn ${isPlaying ? 'btn-secondary' : 'btn-primary'}`}
      style={{ marginLeft: '0.5rem', fontSize: '12px' }}
    >
      {isLoading ? '🔄 Loading...' : isPlaying ? '⏹️ Stop' : `🔊 ${label}`}
    </button>
  );
}

export default TextToSpeech;