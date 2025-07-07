import { useState } from "react";
import type { Note } from "@/types/notes";
import NotesList from "./NotesList";
import NoteEditor from "./NoteEditor";

export default function NotesPage() {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleEditNote = (note: Note) => {
    setSelectedNote(note);
    setIsCreating(false);
    setIsEditorOpen(true);
  };

  const handleCreateNote = () => {
    setSelectedNote(null);
    setIsCreating(true);
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setSelectedNote(null);
    setIsCreating(false);
  };

  const handleSaveNote = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen simple-bg">
      <div className="mobile-container py-6 sm:py-8">
        <NotesList
          onEditNote={handleEditNote}
          onCreateNote={handleCreateNote}
          refreshTrigger={refreshTrigger}
        />
        
        <NoteEditor
          note={selectedNote}
          isOpen={isEditorOpen}
          onClose={handleCloseEditor}
          onSave={handleSaveNote}
          isCreating={isCreating}
        />
      </div>
    </div>
  );
}
