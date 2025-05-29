import React, { useEffect, useState, useCallback } from 'react';
import { getCurrentUser } from '@aws-amplify/auth';

import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import './App.css';

import NoteInput from './components/NoteInput';
import TextToSpeech from './components/TextToSpeech';


const FormattedText = ({ text }) => {
  if (!text) return '';
  

  const formattedText = text
    .replace(/(\d+\.\s[^.]*\.)\s+/g, '$1\n\n') 
    .replace(/([.!?])\s+(?=\d+\.)/g, '$1\n\n')  
    .trim();

  const lines = formattedText.split('\n');

  return (
    <div>
      {lines.map((line, index) => {
        if (!line.trim()) return <div key={index} style={{ height: '0.8rem' }} />;
        
        return (
          <div key={index} style={{ marginBottom: '0.8rem', lineHeight: '2.2' }}>
            {line}
          </div>
        );
      })}
    </div>
  );
};

function Header() {
  const { user, signOut } = useAuthenticator((context) => [context.user]);

  return (
    <div className="app-header">
      <div className="header-left">
        <img src="/logo.png" alt="AI Notes Icon" className="logo" />
        <div>
          <h1 className="app-title">AI-Powered Study Note Assistant</h1>
          <p className="app-subtitle"><em>Summarize, Quiz, Listen</em></p>
        </div>
      </div>
      <div>
        <p className="user-info">{user?.username}</p>
        <button onClick={signOut} className="btn btn-secondary">Sign Out</button>
      </div>
    </div>
  );
}

function App() {
  const [userId, setUserId] = useState(null);
  const [notes, setNotes] = useState([]);
  const [editingNote, setEditingNote] = useState(null);

  const fetchNotes = useCallback(() => {
    if (!userId) return;
    
    console.log("Fetching notes from DynamoDB...");
    fetch(`https://sn64mlzf08.execute-api.us-east-1.amazonaws.com/getNotes?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        setNotes(data.notes || []);
      })
      .catch(error => {
        console.error("Error fetching notes:", error);
      });
  }, [userId]);

  useEffect(() => {
    getCurrentUser()
      .then(user => {
        const id = user.username || user.userId || user.attributes?.sub;
        setUserId(id);
      })
      .catch(() => {
        console.log("No user logged in");
      });
  }, []);

  useEffect(() => {
    if (userId) {
      fetchNotes();
    }
  }, [userId, fetchNotes]);

  const handleDelete = (noteId) => {
    console.log("Sending delete request with:", {
      userId,
      noteId
    });

    fetch(`https://sn64mlzf08.execute-api.us-east-1.amazonaws.com/deleteNote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, noteId }),
    })
      .then(res => res.json())
      .then(() => {
        setNotes(notes.filter(n => n.noteId !== noteId));
      })
      .catch(err => console.error("Delete failed:", err));
  };

  const handleEditSummaryAndBeginner = (note) => {
    setEditingNote({
      ...note,
      editedSummary: note.summary,
      editedBeginnerNote: note.beginnerNote
    });
  };

  const handleSaveSummaryAndBeginner = () => {
    if (!editingNote) return;

    fetch(`https://sn64mlzf08.execute-api.us-east-1.amazonaws.com/editSummaryAndBeginner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        noteId: editingNote.noteId,
        newSummary: editingNote.editedSummary,
        newBeginnerNote: editingNote.editedBeginnerNote
      }),
    })
      .then(res => res.json())
      .then(() => {
        setNotes(notes.map(n =>
          n.noteId === editingNote.noteId 
            ? { ...n, summary: editingNote.editedSummary, beginnerNote: editingNote.editedBeginnerNote }
            : n
        ));
        setEditingNote(null);
        alert("Summary and explanation updated successfully!");
      })
      .catch(err => {
        console.error("Edit summary/beginner failed:", err);
        alert("Failed to save changes. Please try again.");
      });
  };

  const handleCancelEdit = () => {
    setEditingNote(null);
  };

  return (
    <Authenticator>
      {({ signOut }) => (
        <div className="App">
          <Header />
          <NoteInput onNoteSaved={fetchNotes} />

          <hr className="section-divider" />
          <h2 className="section-title">Saved Notes</h2>
          {notes.length === 0 ? (
            <p>No notes found.</p>
          ) : (
            <ul className="notes-list">
              {notes.map((note, i) => (
                <li key={i} className="note-item">
                  <div className="note-field">
                    <strong>📝 Title:</strong>
                    <span className="text-content" style={{ display: 'inline', marginLeft: '0.5rem' }}>
                      <FormattedText text={note.title || 'Untitled'} />
                    </span>
                  </div>
                  <div className="note-field">
                    <strong>📄 Original Note:</strong>
                    <div className="text-content" style={{ marginTop: '0.5rem' }}>
                      <FormattedText text={note.originalNote} />
                    </div>
                  </div>
                  
                  {editingNote && editingNote.noteId === note.noteId ? (
                    
                    <div>
                      <div className="note-field">
                        <strong>📋 Summary:</strong><br />
                        <textarea
                          className="edit-textarea summary"
                          value={editingNote.editedSummary}
                          onChange={(e) => setEditingNote({...editingNote, editedSummary: e.target.value})}
                        />
                      </div>
                      
                      <div className="note-field">
                        <strong>🌱 Beginner-Friendly Explanation:</strong><br />
                        <textarea
                          className="edit-textarea beginner"
                          value={editingNote.editedBeginnerNote}
                          onChange={(e) => setEditingNote({...editingNote, editedBeginnerNote: e.target.value})}
                        />
                      </div>
                      
                      <button 
                        onClick={handleSaveSummaryAndBeginner} 
                        className="btn btn-success"
                      >
                        Save Changes
                      </button>
                      <button 
                        onClick={handleCancelEdit} 
                        className="btn btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    
                    <div>
                      <div className="note-field">
                        <strong>📋 Summary:</strong>
                        <div className="text-content" style={{ marginTop: '0.5rem' }}>
                          <FormattedText text={note.summary} />
                        </div>
                        <TextToSpeech text={note.summary} label="Listen to Summary" />
                      </div>
                      <div className="note-field">
                        <strong>🌱 Beginner-Friendly Explanation:</strong>
                        <div className="text-content" style={{ marginTop: '0.5rem' }}>
                          <FormattedText text={note.beginnerNote} />
                        </div>
                        <TextToSpeech text={note.beginnerNote} label="Listen to Explanation" />
                      </div>
                      
                      <button 
                        onClick={() => handleEditSummaryAndBeginner(note)} 
                        className="btn btn-edit"
                      >
                        Edit Summary & Explanation
                      </button>
                      <button 
                        onClick={() => handleDelete(note.noteId)}
                        className="btn btn-danger"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Authenticator>
  );
}

export default App;