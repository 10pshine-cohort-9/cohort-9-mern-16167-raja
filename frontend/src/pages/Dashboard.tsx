import React, { useEffect, useState, FormEvent, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthResponse, ApiErrorResponse } from './Login';
import { getValidSession } from '../components/ProtectedRoute';

import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import DOMPurify from 'dompurify'; 

import { io } from 'socket.io-client';

export interface Note {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
}

const Dashboard = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [formError, setFormError] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const navigate = useNavigate();
  const userInfo = getValidSession();

  // --- NEW: Stable primitive dependencies for Socket.IO ---
  const token = userInfo?.token;
  const userId = userInfo?._id;

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get<Note[]>('/api/notes', config);
      setNotes(data);
    } catch (err: unknown) {
      if (axios.isAxiosError<ApiErrorResponse>(err)) {
        setError(err.response?.data?.message || 'Failed to fetch notes');
      } else {
        setError('An unexpected error occurred while fetching notes');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- UPDATED: Secure, Stable Real-time Socket.IO Sync ---
  useEffect(() => {
    if (!token || !userId) return;

    // Use environment variable fallback for production readiness
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    
    // Pass the token securely in the handshake
    const socket = io(SOCKET_URL, {
      auth: { token }
    });

    socket.on('noteCreated', (newNote: Note) => {
      setNotes((currentNotes) => {
        if (currentNotes.find((n) => n._id === newNote._id)) return currentNotes;
        return [newNote, ...currentNotes];
      });
    });

    socket.on('noteUpdated', (updatedNote: Note) => {
      setNotes((currentNotes) =>
        currentNotes.map((n) => (n._id === updatedNote._id ? updatedNote : n))
      );
    });

    socket.on('noteDeleted', (deletedNoteId: string) => {
      setNotes((currentNotes) => currentNotes.filter((n) => n._id !== deletedNoteId));
    });

    return () => {
      socket.disconnect();
    };
  }, [token, userId]); // <-- Effect only re-runs if these string values change

  const handleSubmitNote = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError('');

    if (!content || content === '<p><br></p>') {
      setFormError('Note content cannot be empty.');
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const cleanContent = DOMPurify.sanitize(content);
      
      if (editingNoteId) {
        const { data } = await axios.put<Note>(`/api/notes/${editingNoteId}`, { title, content: cleanContent }, config);
        setNotes((currentNotes) => currentNotes.map((note) => (note._id === editingNoteId ? data : note)));
      } else {
        const { data } = await axios.post<Note>('/api/notes', { title, content: cleanContent }, config);
        
        // FIX: Check if Socket.IO already added this note before pushing it to state
        setNotes((currentNotes) => {
          if (currentNotes.some((n) => n._id === data._id)) return currentNotes;
          return [data, ...currentNotes];
        });
      }
      
      setTitle('');
      setContent('');
      setShowForm(false);
      setEditingNoteId(null);
    } catch (err: unknown) {
      if (axios.isAxiosError<ApiErrorResponse>(err)) {
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
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`/api/notes/${id}`, config);
      setNotes((currentNotes) => currentNotes.filter((note) => note._id !== id));
    } catch (err: unknown) {
      alert('Failed to delete note');
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

  const handleExportNotes = () => {
    if (notes.length === 0) {
      alert('You have no notes to export!');
      return;
    }
    const dataStr = JSON.stringify(notes, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `10P_Notes_Export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportNotes = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        if (!Array.isArray(importedData)) throw new Error('Invalid format');

        const isValid = importedData.every(item => item !== null && typeof item === 'object' && !Array.isArray(item));
        if (!isValid) throw new Error('Invalid format');

        setIsLoading(true);
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        // FIX: Cap import size
        const MAX_IMPORT = 200;
        if (importedData.length > MAX_IMPORT) {
          throw new Error(`Import is limited to ${MAX_IMPORT} notes per file.`);
        }

        let imported = 0;
        let failed = 0;
        
        // FIX: Try/catch each individual post so one failure doesn't stop the rest
        for (const note of importedData) {
          const cleanContent = DOMPurify.sanitize(note.content || '');
          try {
            await axios.post<Note>('/api/notes', { title: note.title || 'Imported Note', content: cleanContent }, config);
            imported += 1;
          } catch {
            failed += 1;
          }
        }

        await fetchNotes();
        alert(`Imported ${imported} note(s). ${failed} failed.`);
      } catch (err: any) {
        alert(err.message || 'Failed to import notes. Please ensure it is a valid JSON file.');
      } finally {
        setIsLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = ''; 
      }
    };
    reader.readAsText(file);
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link'],
      ['clean']
    ],
  };

  // FIX: Helper function to strip HTML tags for accurate searching
  const toPlainText = (html: string) => {
    const el = document.createElement('div');
    el.innerHTML = DOMPurify.sanitize(html);
    return el.textContent || '';
  };

  // FIX: Search now uses toPlainText so users don't accidentally search raw HTML tags
  const filteredNotes = notes.filter((note) => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    toPlainText(note.content).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', fontFamily: '"Inter", "Segoe UI", sans-serif' }}>
      
      <nav style={{ backgroundColor: '#ffffff', padding: '16px 32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#111827', fontWeight: 700 }}>
          <span style={{ color: '#3b82f6' }}>10P</span> Notes
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ color: '#4b5563', fontWeight: 500 }}>Hello, {userInfo?.name?.split(' ')[0]}</span>
          
          <Link to="/profile" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 600 }}>
            Profile
          </Link>

          <button 
            onClick={handleLogout} 
            style={{ padding: '8px 16px', backgroundColor: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
          >
            Logout
          </button>
        </div>
      </nav>

      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '1.75rem', color: '#111827' }}>My Dashboard</h2>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={() => fileInputRef.current?.click()}
              style={{ padding: '10px 16px', backgroundColor: '#ffffff', color: '#4b5563', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              Import
            </button>
            <input 
              type="file" 
              accept=".json" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleImportNotes}
            />

            <button 
              onClick={handleExportNotes}
              style={{ padding: '10px 16px', backgroundColor: '#ffffff', color: '#4b5563', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              Export
            </button>

            <button 
              onClick={handleToggleForm}
              style={{ padding: '10px 20px', backgroundColor: showForm ? '#6b7280' : '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)', transition: 'background-color 0.2s' }}
            >
              {showForm ? 'Close Editor' : '+ Create New Note'}
            </button>
          </div>
        </div>

        {error && <div style={{ padding: '12px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '20px', border: '1px solid #fecaca' }}>{error}</div>}

        {showForm && (
          <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', marginBottom: '40px', border: '1px solid #e5e7eb', animation: 'fadeIn 0.3s ease-in-out' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#111827', fontSize: '1.25rem' }}>{editingNoteId ? 'Edit Note' : 'Create Note'}</h3>
            {formError && <div style={{ color: '#ef4444', marginBottom: '16px', fontSize: '0.875rem' }}>{formError}</div>}
            
            <form onSubmit={handleSubmitNote} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input 
                type="text" placeholder="Give your note a title..." value={title} onChange={(e) => setTitle(e.target.value)} required 
                style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem', outline: 'none' }}
              />
              
              <div style={{ marginBottom: '40px' }}>
                <ReactQuill 
                  theme="snow" 
                  value={content} 
                  onChange={setContent} 
                  modules={modules}
                  style={{ height: '200px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={handleToggleForm} style={{ padding: '10px 20px', backgroundColor: 'transparent', color: '#4b5563', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '10px 24px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3)' }}>
                  {editingNoteId ? 'Save Changes' : 'Publish Note'}
                </button>
              </div>
            </form>
          </div>
        )}

        {!isLoading && notes.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <input 
              type="text" 
              placeholder="Search notes by title or content..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', padding: '14px 16px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem', outline: 'none', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
            />
          </div>
        )}

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div style={{ width: '40px', height: '40px', border: '4px solid #e5e7eb', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        ) : notes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px dashed #d1d5db' }}>
            <h3 style={{ color: '#4b5563', margin: '0 0 8px 0' }}>It's quiet here...</h3>
            <p style={{ color: '#9ca3af', margin: 0 }}>Click the button above to create your first note.</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>
            <p>No notes match your search for "{searchQuery}".</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
            {filteredNotes.map((note) => (
              <div key={note._id} style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', cursor: 'default' }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <h4 style={{ margin: '0 0 12px 0', color: '#111827', fontSize: '1.25rem', lineHeight: '1.4' }}>{note.title}</h4>
                
                <div 
                  style={{ margin: '0 0 20px 0', color: '#4b5563', lineHeight: '1.6', flexGrow: 1, fontSize: '0.95rem', overflowWrap: 'break-word' }}
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(note.content) }}
                />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #f3f4f6' }}>
                  <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
                    {new Date(note.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleEditClick(note)} style={{ padding: '6px 12px', backgroundColor: '#fef3c7', color: '#d97706', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                      Edit
                    </button>
                    <button onClick={() => handleDeleteNote(note._id)} style={{ padding: '6px 12px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;