import { useState } from "react";
import type { Note } from "@/types/notes";
import NotesList from "./NotesList";
import NoteEditor from "./NoteEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Lightbulb, Image, BookOpen } from "lucide-react";

export default function LumenLogs() {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showWelcome, setShowWelcome] = useState(true);

  const handleEditNote = (note: Note) => {
    setSelectedNote(note);
    setIsCreating(false);
    setIsEditorOpen(true);
    setShowWelcome(false);
  };

  const handleCreateNote = () => {
    setSelectedNote(null);
    setIsCreating(true);
    setIsEditorOpen(true);
    setShowWelcome(false);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setSelectedNote(null);
    setIsCreating(false);
  };

  const handleSaveNote = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleGetStarted = () => {
    setShowWelcome(false);
  };

  if (showWelcome) {
    return (
      <div className="min-h-screen">
        <div className="mobile-container py-8 sm:py-16">
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex items-center justify-center mb-6">
              <Lightbulb className="h-12 w-12 sm:h-16 sm:w-16 text-black mr-4" />
              <h1 className="text-responsive-xl font-bold text-black">
                Notes
              </h1>
            </div>
            <p className="text-lg sm:text-xl text-gray-700 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
              Organize your thoughts with simple, clean note-taking. Capture ideas, add images, and stay organized.
            </p>
            <Button 
              size="lg" 
              className="text-lg px-6 sm:px-8 py-3 sm:py-4 btn-black touch-target"
              onClick={handleGetStarted}
            >
              <BookOpen className="mr-2 h-5 w-5" />
              Start Writing
            </Button>
          </div>

          <div className="mobile-grid gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto">
            <Card className="text-center border-gray-200 shadow-lg hover:shadow-xl transition-shadow mobile-card">
              <CardHeader>
                <Plus className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-gray-600 mb-4" />
                <CardTitle className="text-gray-800 text-lg sm:text-xl">Create & Capture</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-sm sm:text-base">
                  Instantly create notes and capture your thoughts. Add images while writing for a complete experience.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-gray-200 shadow-lg hover:shadow-xl transition-shadow mobile-card">
              <CardHeader>
                <Image className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-gray-600 mb-4" />
                <CardTitle className="text-gray-800 text-lg sm:text-xl">Visual Stories</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-sm sm:text-base">
                  Enhance your notes with images. Upload photos while creating or editing to tell richer stories.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-gray-200 shadow-lg hover:shadow-xl transition-shadow mobile-card">
              <CardHeader>
                <Search className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-gray-600 mb-4" />
                <CardTitle className="text-gray-800 text-lg sm:text-xl">Find & Organize</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-sm sm:text-base">
                  Quickly search through your notes and find exactly what you need when you need it.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 sm:mt-16 text-center">
            <p className="text-gray-500 text-sm">
              Simple, clean note-taking
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mobile-container py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div className="flex items-center">
            <Lightbulb className="h-6 w-6 sm:h-8 sm:w-8 text-black mr-3" />
            <h1 className="text-2xl sm:text-3xl font-bold text-black">
              Notes
            </h1>
          </div>
          <Button 
            onClick={() => setShowWelcome(true)}
            variant="outline"
            className="btn-black-outline touch-target"
          >
            <Lightbulb className="h-4 w-4 mr-2" />
            About
          </Button>
        </div>
        
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
