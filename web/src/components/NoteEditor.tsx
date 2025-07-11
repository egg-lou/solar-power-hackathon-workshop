import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ImageGallery from "@/components/ImageGallery";
import type { Note, NoteCreate, NoteUpdate } from "@/types/notes";
import notesService from "@/service/notes";
import { Save, X, Image, Plus, Lightbulb, Sparkles } from "lucide-react";

interface NoteEditorProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  isCreating: boolean;
}

export default function NoteEditor({ note, isOpen, onClose, onSave, isCreating }: NoteEditorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loading, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdNote, setCreatedNote] = useState<Note | null>(null);
  const [showImageSection, setShowImageSection] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setImages(note.images);
      setImageUrls(note.image_urls || []);
      setCreatedNote(note);
      setShowImageSection(false);
    } else {
      setTitle("");
      setContent("");
      setImages([]);
      setImageUrls([]);
      setCreatedNote(null);
      setShowImageSection(false);
    }
    setError(null);
  }, [note, isOpen]);

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (isCreating) {
        const noteData: NoteCreate = {
          title: title.trim(),
          content: content.trim(),
        };
        const newNote = await notesService.createNote(noteData);
        setCreatedNote(newNote);
        setShowImageSection(true);
        // Don't close the dialog yet - allow user to add images
      } else if (note) {
        const noteData: NoteUpdate = {
          title: title.trim(),
          content: content.trim(),
        };
        await notesService.updateNote(note.id, noteData);
        onSave();
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  const handleImagesUpdate = (newImages: string[], newImageUrls: string[]) => {
    setImages(newImages);
    setImageUrls(newImageUrls);
  };

  const handleFinishCreating = () => {
    onSave();
    onClose();
  };

  const currentNote = createdNote || note;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-black simple-bg border-gray-300 shadow-2xl">
        <DialogHeader className="pb-4 border-b border-gray-300/60">
          <DialogTitle className="flex items-center gap-2 text-xl">
            {isCreating ? (
              createdNote ? (
                <>
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                    <Image className="h-4 w-4 text-gray-600" />
                  </div>
                  <span className="text-black">Add Images to Your Note</span>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-black">
                    <Plus className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-black">Create New Note</span>
                </>
              )
            ) : (
              <>
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                  <Lightbulb className="h-4 w-4 text-gray-600" />
                </div>
                <span className="text-black">Edit Note</span>
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-responsive">
          {error && (
            <Alert variant="destructive" className="border-red-300 bg-red-50">
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {/* Show form fields only if not in image-adding mode */}
          {!(isCreating && createdNote) && (
            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-2 text-gray-800">
                  Title <span className="text-red-500">*</span>
                </label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter your title"
                  className="w-full text-gray-900 placeholder:text-gray-400"
                />
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium mb-2 text-gray-800">
                  Content
                </label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your content..."
                  className="w-full min-h-[200px] sm:min-h-[250px] text-gray-900 placeholder:text-gray-400 resize-none"
                />
              </div>
            </div>
          )}

          {/* Show success message and image section after creation */}
          {isCreating && createdNote && (
            <div className="space-y-4">
              
              <div className="p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="h-5 w-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-800 text-lg">{createdNote.title}</h3>
                </div>
                {createdNote.content && (
                  <p className="text-gray-700 text-sm leading-relaxed">{createdNote.content}</p>
                )}
              </div>
            </div>
          )}

          {/* Image gallery - show for existing notes or newly created notes */}
          {currentNote && (showImageSection || !isCreating) && (
            <div className="space-y-4 p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-gray-100/80 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2">
                <Image className="h-5 w-5 text-gray-500" />
                <label className="text-sm font-medium text-gray-800">
                  Visual Elements
                </label>
              </div>
              <ImageGallery
                noteId={currentNote.id}
                images={images}
                imageUrls={imageUrls}
                onImagesUpdate={handleImagesUpdate}
                disabled={loading}
              />
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-300/60">
            <Button 
              variant="outline" 
              onClick={onClose} 
              disabled={loading}
              className="order-2 sm:order-1 btn-black-outline touch-target"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            
            {isCreating && createdNote ? (
              <Button 
                onClick={handleFinishCreating}
                className="order-1 sm:order-2 btn-black touch-target shadow-lg"
              >
                <Save className="h-4 w-4 mr-2" />
                Finish & Close
              </Button>
            ) : (
              <Button 
                onClick={handleSave} 
                disabled={loading || !title.trim()}
                className="order-1 sm:order-2 btn-black touch-target shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </span>
                ) : isCreating ? (
                  "Create & Add Images"
                ) : (
                  "Save Changes"
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
