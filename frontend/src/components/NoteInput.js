import React, { useState } from 'react';
import { getCurrentUser } from '@aws-amplify/auth';

function NoteInput({ onNoteSaved }) {
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [summary, setSummary] = useState('');
  const [beginnerNote, setBeginnerNote] = useState('');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [extractingText, setExtractingText] = useState(false);

  const handleSummarize = async () => {
    if (!note.trim() || !title.trim()) {
      alert("Please enter both title and note.");
      return;
    }

    setLoading(true);
    setSummary('');
    setBeginnerNote('');

    try {
      const user = await getCurrentUser();
      const userId = user?.username || user?.userId || user?.attributes?.sub;

      if (!userId) {
        alert("No user ID found. Please sign in again.");
        return;
      }

      const payload = { note, title, userId };

      console.log("Note:", note);
      console.log("Title:", title);
      console.log("userId:", userId);
      console.log("Payload sent to Lambda:", JSON.stringify(payload));

      const response = await fetch("https://sn64mlzf08.execute-api.us-east-1.amazonaws.com/summarizeNote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok && data.summary) {
        setSummary(data.summary);
        setBeginnerNote(data.beginnerNote || '');
        
        alert("Note summarized and saved successfully!");
        
        // Clear the form
        setTitle('');
        setNote('');
        setFileName('');
        
        // Notify parent component to refresh the notes list
        if (onNoteSaved) {
          onNoteSaved();
        }
      } else {
        console.error("Lambda summary response error:", data);
        alert("Failed to summarize. Please try again.");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      alert("Network or authentication error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      
      
      if (file.type.startsWith('image/')) {
        
        await processImageFile(file);
      } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        
        await processTextFile(file);
      } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        
        await processPdfFile(file);
      } else {
        alert(`File type not supported: ${file.type || 'Unknown'}\nSupported: Images (PNG, JPG), PDF, TXT files`);
      }
    }
  };

  // Process image files with Textract
  const processImageFile = async (file) => {
    setExtractingText(true);
    
    try {
      const base64 = await fileToBase64(file);
      
      console.log('Sending image to Textract...');
      
      const response = await fetch("https://sn64mlzf08.execute-api.us-east-1.amazonaws.com/textractImage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageData: base64 })
      });

      const data = await response.json();

      if (response.ok && data.extractedText) {
        setNote(data.extractedText);
        
        if (!title.trim()) {
          const firstLine = data.extractedText.split('\n')[0];
          const autoTitle = firstLine.substring(0, 50) + (firstLine.length > 50 ? '...' : '');
          setTitle(autoTitle);
        }
        
        alert(`Text extracted from image! Confidence: ${data.confidence}%`);
      } else {
        console.error("Textract error:", data);
        alert("Failed to extract text from image. Please try again.");
      }
    } catch (error) {
      console.error("Image processing error:", error);
      alert("Error processing image. Please try again.");
    } finally {
      setExtractingText(false);
    }
  };

  // Process text files directly
  const processTextFile = async (file) => {
    setExtractingText(true);
    
    try {
      const text = await file.text();
      setNote(text);
      
      if (!title.trim()) {
        const firstLine = text.split('\n')[0];
        const autoTitle = firstLine.substring(0, 50) + (firstLine.length > 50 ? '...' : '');
        setTitle(autoTitle);
      }
      
      alert("Text file loaded successfully!");
    } catch (error) {
      console.error("Text file processing error:", error);
      alert("Error reading text file. Please try again.");
    } finally {
      setExtractingText(false);
    }
  };

  // Process PDF files with Textract
  const processPdfFile = async (file) => {
    setExtractingText(true);
    
    try {
      const base64 = await fileToBase64(file);
      
      console.log('Sending PDF to Textract...');
      
      const response = await fetch("https://sn64mlzf08.execute-api.us-east-1.amazonaws.com/textractImage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageData: base64 })
      });

      const data = await response.json();

      if (response.ok && data.extractedText) {
        setNote(data.extractedText);
        
        if (!title.trim()) {
          const firstLine = data.extractedText.split('\n')[0];
          const autoTitle = firstLine.substring(0, 50) + (firstLine.length > 50 ? '...' : '');
          setTitle(autoTitle);
        }
        
        alert(`Text extracted from PDF! Confidence: ${data.confidence}%`);
      } else {
        console.error("PDF Textract error:", data);
        alert("Failed to extract text from PDF. Please try again.");
      }
    } catch (error) {
      console.error("PDF processing error:", error);
      alert("Error processing PDF. Please try again.");
    } finally {
      setExtractingText(false);
    }
  };

  
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  return (
    <div className="note-input-container">
      <h2>✨ Create Your Note</h2>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter note title..."
        style={{ 
          width: '100%', 
          marginBottom: '1rem', 
          padding: '0.75rem',
          fontSize: '18px'
        }}
      />

      <textarea
        rows="6"
        value={note}
        onChange={(e) => {
          console.log("You typed:", e.target.value);
          setNote(e.target.value);
        }}
        style={{ 
          width: '100%', 
          marginBottom: '1.5rem',
          padding: '0.75rem',
          fontSize: '17px',
          lineHeight: '1.6'
        }}
        placeholder="Write, paste, or upload files to extract text (Images, PDF, TXT)..."
      />

      <div style={{ marginBottom: '1.5rem' }}>
        <input
          type="file"
          accept="image/*,.pdf,.txt"
          onChange={handleFileUpload}
          disabled={extractingText}
          style={{ marginBottom: '0.5rem' }}
        />
        {fileName && (
          <p style={{ 
            marginBottom: '0.5rem', 
            color: 'var(--zen-text-secondary)',
            fontSize: '14px'
          }}>
            📎 Selected: <strong>{fileName}</strong>
          </p>
        )}
        {extractingText && (
          <p style={{ 
            color: 'var(--zen-royal-blue)',
            fontSize: '14px',
            fontStyle: 'italic'
          }}>
            🔄 Extracting text from image...
          </p>
        )}
      </div>

      <button 
        onClick={handleSummarize} 
        disabled={loading || extractingText}
        className={`btn ${loading ? 'btn-secondary' : 'btn-primary'}`}
        style={{ fontSize: '18px', padding: '0.875rem 2rem' }}
      >
        {loading ? "✨ Creating..." : "✨ Summarize & Save Note"}
      </button>

      {(summary || beginnerNote) && (
        <div style={{ 
          marginTop: '2rem', 
          padding: '2rem', 
          background: 'var(--zen-bg-accent)',
          border: '1px solid var(--zen-border)',
          borderRadius: '12px'
        }}>
          {summary && (
            <>
              <h3 style={{ 
                textAlign: 'left',
                color: 'var(--zen-text-primary)',
                fontSize: '1.1rem',
                fontWeight: '600',
                marginBottom: '1rem'
              }}>
                📋 Summary
              </h3>
              <p style={{ 
                textAlign: 'left',
                lineHeight: '1.7',
                color: 'var(--zen-text-secondary)'
              }}>
                {summary}
              </p>
            </>
          )}
          {beginnerNote && (
            <>
              <h3 style={{ 
                textAlign: 'left',
                color: 'var(--zen-text-primary)',
                fontSize: '1.1rem',
                fontWeight: '600',
                marginBottom: '1rem',
                marginTop: '1.5rem'
              }}>
                🌱 Beginner-Friendly Explanation
              </h3>
              <p style={{ 
                textAlign: 'left',
                lineHeight: '1.7',
                color: 'var(--zen-text-secondary)'
              }}>
                {beginnerNote}
              </p>
            </>
          )}
          
          <p style={{ 
            textAlign: 'center', 
            marginTop: '2rem', 
            fontStyle: 'italic', 
            color: 'var(--zen-text-muted)',
            fontSize: '14px'
          }}>
            ✅ Note saved to your collection
          </p>
        </div>
      )}
    </div>
  );
}

export default NoteInput;