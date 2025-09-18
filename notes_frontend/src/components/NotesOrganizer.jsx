import React, { useState, useEffect } from "react";

// REST API integration points: swap out localStorage with fetch calls

const fetchNotes = async () => {
  const notes = JSON.parse(localStorage.getItem("notes") || "[]");
  return notes;
};
const saveNotes = (notes) => {
  localStorage.setItem("notes", JSON.stringify(notes));
};
const generateId = () => "_" + Math.random().toString(36).substr(2, 9);

// PUBLIC_INTERFACE
export default function NotesOrganizer() {
  const [notes, setNotes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchNotes().then((n) => setNotes(n));
  }, []);

  const selectNote = (id) => {
    setSelectedId(id);
    setEditingNote(null);
    setIsEditing(false);
    setErrorMsg("");
  };

  const handleNewNote = () => {
    setEditingNote({ id: "", title: "", content: "" });
    setIsEditing(true);
    setSelectedId(null);
    setErrorMsg("");
  };

  const handleEditNote = () => {
    const note = notes.find((n) => n.id === selectedId);
    if (note) {
      setEditingNote({ ...note });
      setIsEditing(true);
      setErrorMsg("");
    }
  };

  // PUBLIC_INTERFACE
  const handleDeleteNote = () => {
    if (selectedId) {
      const newNotes = notes.filter((n) => n.id !== selectedId);
      saveNotes(newNotes);
      setNotes(newNotes);
      setSelectedId(null);
      setEditingNote(null);
      setIsEditing(false);
      setErrorMsg("");
    }
  };

  // PUBLIC_INTERFACE
  const handleSaveNote = (ev) => {
    ev.preventDefault();
    const { id, title, content } = editingNote;
    if (!title.trim()) {
      setErrorMsg("Title is required.");
      return;
    }
    let updatedNotes;
    if (id && notes.some((n) => n.id === id)) {
      updatedNotes = notes.map((n) =>
        n.id === id ? { ...n, title, content } : n
      );
    } else {
      const newNote = {
        id: generateId(),
        title,
        content,
        created: new Date().toISOString(),
      };
      updatedNotes = [newNote, ...notes];
      setSelectedId(newNote.id);
    }
    saveNotes(updatedNotes);
    setNotes(updatedNotes);
    setIsEditing(false);
    setEditingNote(null);
    setErrorMsg("");
  };

  const handleCancelEdit = () => {
    setEditingNote(null);
    setIsEditing(false);
    setErrorMsg("");
  };

  const handleInputChange = (e) => {
    setEditingNote({ ...editingNote, [e.target.name]: e.target.value });
  };

  return (
    <div className="notes-app-container">
      <nav className="sidebar shadow">
        <h1 className="app-title">Notes</h1>
        <button className="new-btn shadow-hover" onClick={handleNewNote}>
          <span className="plus">+</span> New Note
        </button>
        <ul className="nav-list">
          {notes.map((note) => (
            <li
              key={note.id}
              className={note.id === selectedId ? "active" : ""}
              onClick={() => selectNote(note.id)}
            >
              <div className="note-title">{note.title}</div>
              {note.id === selectedId ? (
                <span className="selected-indicator"></span>
              ) : null}
            </li>
          ))}
        </ul>
      </nav>
      <section className="notes-list-panel shadow">
        <header>
          <h2 className="notes-list-title">
            <i className="icon-notes"></i> All Notes
          </h2>
        </header>
        <ul className="notes-list">
          {notes.length === 0 && (
            <li className="empty">
              No notes yet. Click "+" to add your first note.
            </li>
          )}
          {notes.map((note) => (
            <li
              key={note.id}
              className={note.id === selectedId ? "active" : ""}
              onClick={() => selectNote(note.id)}
            >
              <div className="note-title-list">{note.title}</div>
              <div className="note-date">
                {new Date(note.created || "").toLocaleDateString()}
              </div>
            </li>
          ))}
        </ul>
      </section>
      <section className="note-panel shadow">
        {isEditing ? (
          <form className="note-edit-form" onSubmit={handleSaveNote}>
            <h2>{editingNote?.id ? "Edit Note" : "New Note"}</h2>
            {errorMsg && <div className="error">{errorMsg}</div>}
            <label>
              Title
              <input
                type="text"
                name="title"
                value={editingNote.title}
                onChange={handleInputChange}
                className="input"
                required
                maxLength={100}
                placeholder="Note title"
              />
            </label>
            <label>
              Content
              <textarea
                name="content"
                value={editingNote.content}
                onChange={handleInputChange}
                className="textarea"
                rows={8}
                placeholder="Write your note here..."
              ></textarea>
            </label>
            <div className="edit-actions">
              <button
                type="submit"
                className="save-btn shadow-hover"
              >
                {editingNote.id ? "Update" : "Create"}
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : selectedId ? (
          (() => {
            const note = notes.find((n) => n.id === selectedId);
            if (!note) return null;
            return (
              <>
                <h2 className="note-title-detail">{note.title}</h2>
                <div className="note-meta">
                  <span className="note-date">
                    {new Date(note.created || "").toLocaleString()}
                  </span>
                </div>
                <p className="note-content">{note.content}</p>
                <div className="detail-actions">
                  <button className="edit-btn" onClick={handleEditNote}>
                    Edit
                  </button>
                  <button className="delete-btn" onClick={handleDeleteNote}>
                    Delete
                  </button>
                </div>
              </>
            );
          })()
        ) : (
          <div className="empty-detail">
            <div className="empty-text">
              Select or create a note to view/edit here.
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
