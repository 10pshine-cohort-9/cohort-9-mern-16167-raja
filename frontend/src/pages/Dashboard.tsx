import React, { useEffect, useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthResponse } from './Login';
import { getValidSession } from '../components/ProtectedRoute'; // Importing our new safe parser

export interface Note {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
}

const Dashboard = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [error, setError] = useState('');
  
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [formError, setFormError] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  
  const navigate = useNavigate();

  // Use the safe helper instead of direct JSON.parse
  const userInfo = getValidSession();

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
      return;
    }
    fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const fetchNotes = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
      const { data } = await axios.get<Note[]>('/api/notes', config);
      setNotes(data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to fetch notes');
      } else {
        setError('An unexpected error occurred while fetching notes');
      }
    }
  };

  const handleSubmitNote = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError('');

    try {
      const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
      
      if (editingNoteId) {
        const { data } = await axios.put<Note>(`/api/notes/${editingNoteId}`, { title, content }, config);
        // FIX: Use functional state update to prevent race conditions
        setNotes((currentNotes) => 
          currentNotes.map((note) => (note._id === editingNoteId ? data : note))
        );
      } else {
        const { data } = await axios.post<Note>('/api/notes', { title, content }, config);
        // FIX: Use functional state update
        setNotes((currentNotes) => [data, ...currentNotes]);
      }
      
      setTitle('');
      setContent('');
      setShowForm(false);
      setEditingNoteId(null);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setFormError(err.response?.data?.message || `Failed to ${editingNoteId ? 'update' : 'create'} note`);
      } else {
        setFormError('An unexpected error occurred');
      }
    }
  };

  const handleEditClick = (note: Note) => {
    setTitle(note.title);
    setContent(note.content);
    setEditingNoteId(note._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteNote = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    try {
      const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
      await axios.delete(`/api/notes/${id}`, config);
      
      // FIX: Use functional state update
      setNotes((currentNotes) => currentNotes.filter((note) => note._id !== id));
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || 'Failed to delete note');
      } else {
        alert('An unexpected error occurred while deleting');
      }
    }
  };

  const handleToggleForm = () => {
    if (showForm) {
      setTitle('');
      setContent('');
      setEditingNoteId(null);
      setFormError('');
    }
    setShowForm(!showForm);
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Welcome, {userInfo?.name}!</h2>
        <button onClick={handleLogout} style={{ padding: '8px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Logout
        </button>
      </div>

      <hr style={{ margin: '20px 0', border: '1px solid #eee' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>My Notes</h3>
        <button onClick={handleToggleForm} style={{ padding: '8px 15px', backgroundColor: showForm ? '#6c757d' : '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {showForm ? 'Cancel' : '+ Create Note'}
        </button>
      </div>

      {error && <div style={{ color: 'red', marginBottom: '15px', padding: '10px', backgroundColor: '#f8d7da', borderRadius: '4px' }}>{error}</div>}

      {showForm && (
        <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #ddd' }}>
          <h4 style={{ marginTop: 0 }}>{editingNoteId ? 'Edit Note' : 'Create a New Note'}</h4>
          {formError && <div style={{ color: 'red', marginBottom: '10px' }}>{formError}</div>}
          <form onSubmit={handleSubmitNote} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input 
              type="text" placeholder="Note Title" value={title} onChange={(e) => setTitle(e.target.value)} required 
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <textarea 
              placeholder="Write your note details here..." value={content} onChange={(e) => setContent(e.target.value)} required rows={4}
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' }}
            />
            <button type="submit" style={{ padding: '10px', backgroundColor: editingNoteId ? '#ffc107' : '#007bff', color: editingNoteId ? 'black' : 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              {editingNoteId ? 'Update Note' : 'Save Note'}
            </button>
          </form>
        </div>
      )}

      {notes.length === 0 ? (
        <p style={{ color: '#666', fontStyle: 'italic' }}>No notes found. Create your first note!</p>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {notes.map((note) => (
            <div key={note._id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>{note.title}</h4>
              <p style={{ margin: '0 0 15px 0', color: '#555', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{note.content}</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <small style={{ color: '#999' }}>{new Date(note.createdAt).toLocaleDateString()}</small>
                <div>
                  <button onClick={() => handleEditClick(note)} style={{ padding: '5px 10px', marginRight: '5px', backgroundColor: '#ffc107', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => handleDeleteNote(note._id)} style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;