import React, { useState } from 'react';
import { getCurrentUser } from '@aws-amplify/auth';

function NoteInput({ onNoteSaved }) {
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [summary, setSummary] = useState('');
  const [beginnerNote, setBeginnerNote] = useState('');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      alert(`You selected: ${file.name}`);
    }
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h2>Enter Your Note</h2>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter note title"
        style={{ width: '100%', marginBottom: '0.5rem', padding: '0.5rem' }}
      />

      <textarea
        rows="6"
        value={note}
        onChange={(e) => {
          console.log("You typed:", e.target.value);
          setNote(e.target.value);
        }}
        style={{ width: '100%', marginBottom: '1rem' }}
        placeholder="Paste your note here..."
      />

      <input
        type="file"
        accept=".pdf,.txt,.png,.jpg"
        onChange={handleFileUpload}
        style={{ marginBottom: '1rem' }}
      />
      {fileName && <p>File selected: <strong>{fileName}</strong></p>}

      <button onClick={handleSummarize} disabled={loading}>
        {loading ? "Summarizing..." : "Summarize & Save Note"}
      </button>

      {(summary || beginnerNote) && (
        <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
          {summary && (
            <>
              <h3 style={{ textAlign: 'left' }}>Summary (Key Concepts):</h3>
              <p style={{ textAlign: 'left' }}>{summary}</p>
            </>
          )}
          {beginnerNote && (
            <>
              <h3 style={{ textAlign: 'left' }}>Beginner-Friendly Explanation:</h3>
              <p style={{ textAlign: 'left' }}>{beginnerNote}</p>
            </>
          )}
          
          <p style={{ textAlign: 'left', marginTop: '1rem', fontStyle: 'italic', color: '#666' }}>
            Note: This note has been automatically saved to your collection.
          </p>
        </div>
      )}
    </div>
  );
}

export default NoteInput;