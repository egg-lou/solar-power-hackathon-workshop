import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Note } from "@/types/notes";
import notesService from "@/service/notes";
import { Trash2, Edit, Plus, Image as ImageIcon, RefreshCw, Lightbulb, Sparkles } from "lucide-react";

interface NotesListProps {
  onEditNote: (note: Note) => void;
  onCreateNote: () => void;
  refreshTrigger: number;
}

export default function NotesList({ onEditNote, onCreateNote, refreshTrigger }: NotesListProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedNotes = await notesService.getAllNotes();
      setNotes(fetchedNotes.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch notes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [refreshTrigger]);

  const handleDeleteNote = async (noteId: string) => {
    try {
      await notesService.deleteNote(noteId);
      setNotes(notes.filter(note => note.id !== noteId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete note");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex items-center gap-2 text-lg text-gray-700">
          <RefreshCw className="h-5 w-5 animate-spin text-gray-500" />
          Loading your notes...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>Error: {error}</AlertDescription>
        </Alert>
        <Button onClick={fetchNotes} variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-gray-800">Your Notes</h2>
          {notes.length > 0 && (
            <Badge variant="secondary" className="text-sm bg-gray-100 text-gray-800 border-gray-200">
              {notes.length} note{notes.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        <Button 
          onClick={onCreateNote} 
          className="flex items-center gap-2 btn-black shadow-lg"
        >
          <Plus className="h-4 w-4" />
          New Note
        </Button>
      </div>

      {notes.length === 0 ? (
        <Card className="border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Lightbulb className="h-16 w-16 text-gray-400 mb-4" />
            <div className="text-gray-800 text-xl font-semibold mb-2">No notes yet</div>
            <p className="text-gray-600 mb-6 max-w-md">
              Start capturing your thoughts! Create your first note to organize ideas and visual stories.
            </p>
            <Button 
              onClick={onCreateNote} 
              className="flex items-center gap-2 btn-black shadow-lg"
            >
              <Plus className="h-4 w-4" />
              Create your first note
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <Card 
              key={note.id} 
              className="hover:shadow-xl transition-all duration-300 cursor-pointer group border-gray-200 hover:border-gray-300 bg-gradient-to-br from-white to-gray-50/30"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2 group-hover:text-gray-700 transition-colors text-gray-800">
                      {note.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600/70">
                      Updated {formatDate(note.updated_at)}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditNote(note);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100 text-gray-700"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                          className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Note</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{note.title}"? This action cannot be undone and will also delete any attached images.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteNote(note.id)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent onClick={() => onEditNote(note)} className="space-y-3">
                <p className="text-gray-700 line-clamp-3">{note.content}</p>
                
                {/* Image Preview Section */}
                {note.images.length > 0 && (
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-gray-500" />
                      <Badge variant="outline" className="text-xs border-gray-300 text-gray-700 bg-gray-50">
                        {note.images.length} image{note.images.length > 1 ? 's' : ''}
                      </Badge>
                    </div>
                    
                    {/* Show first few image thumbnails */}
                    <div className="flex -space-x-2">
                      {note.image_urls?.slice(0, 3).map((imageUrl, index) => (
                        <Avatar key={index} className="h-8 w-8 border-2 border-white shadow-sm">
                          <AvatarImage 
                            src={imageUrl} 
                            alt={`Preview ${index + 1}`}
                            className="object-cover"
                          />
                          <AvatarFallback className="text-xs bg-gray-100">
                            <ImageIcon className="h-3 w-3 text-gray-500" />
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {note.images.length > 3 && (
                        <div className="h-8 w-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center shadow-sm">
                          <span className="text-xs text-gray-700 font-medium">+{note.images.length - 3}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
