import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Trash2, Image as ImageIcon, X, Lightbulb } from "lucide-react";
import notesService from "@/service/notes";

interface ImageGalleryProps {
  noteId: string;
  images: string[];
  imageUrls: string[];
  onImagesUpdate: (images: string[], imageUrls: string[]) => void;
  disabled?: boolean;
}

export default function ImageGallery({ 
  noteId, 
  images, 
  imageUrls, 
  onImagesUpdate, 
  disabled = false 
}: ImageGalleryProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const getImageUrl = (imageKey: string, index: number): string => {
    // First try to use the signed URL from the backend
    if (imageUrls[index]) {
      return imageUrls[index];
    }
    
    // Fallback: construct direct S3 URL
    // This assumes your S3 bucket allows public read access
    return `https://notes-images-bucket-sph.s3.ap-southeast-1.amazonaws.com/${imageKey}`;
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      await notesService.uploadImage(noteId, file);
      
      // Refresh note data to get updated images and URLs
      const updatedNote = await notesService.getNoteById(noteId);
      onImagesUpdate(updatedNote.images, updatedNote.image_urls || []);
      
      // Clear the file input
      event.target.value = '';
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageKey: string) => {
    try {
      setError(null);
      await notesService.deleteImage(noteId, imageKey);
      
      // Refresh note data to get updated images and URLs
      const updatedNote = await notesService.getNoteById(noteId);
      onImagesUpdate(updatedNote.images, updatedNote.image_urls || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete image");
    }
  };

  const openImageModal = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  return (
    <div className="space-y-4">
      {/* Header with upload button */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-800">Images</span>
          {images.length > 0 && (
            <Badge variant="outline" className="text-xs border-gray-300 text-gray-700 bg-gray-50">
              {images.length} image{images.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
            disabled={uploading || disabled}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('image-upload')?.click()}
            disabled={uploading || disabled}
            className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all touch-target"
          >
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">{uploading ? "Uploading..." : "Upload Image"}</span>
            <span className="sm:hidden">{uploading ? "..." : "+"}</span>
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="border-red-300">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Image Grid */}
      {images.length > 0 ? (
        <div className="mobile-grid gap-3 sm:gap-4">
          {images.map((imageKey, index) => (
            <Card key={index} className="group overflow-hidden border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200">
              <CardContent className="p-0">
                <div className="relative aspect-square">
                  <img
                    src={getImageUrl(imageKey, index)}
                    alt={`Note image ${index + 1}`}
                    className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                    onClick={() => openImageModal(getImageUrl(imageKey, index))}
                    onError={(e) => {
                      console.error(`Failed to load image: ${getImageUrl(imageKey, index)}`);
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <div class="w-full h-full flex items-center justify-center bg-gray-50 text-sm text-gray-600 p-2 border border-gray-200">
                            <div class="text-center">
                              <div class="h-8 w-8 mx-auto mb-2 text-gray-400">📷</div>
                              <div class="text-xs font-medium">${imageKey.split('/').pop()}</div>
                              <div class="text-xs text-red-500 mt-1">Failed to load</div>
                            </div>
                          </div>
                        `;
                      }
                    }}
                  />
                  
                  {/* Delete button */}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 touch-target bg-red-500 hover:bg-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteImage(imageKey);
                    }}
                    disabled={disabled}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed border-gray-300 bg-gradient-to-br from-gray-50/50 to-gray-100/50">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center space-y-3">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-2">
              <ImageIcon className="h-8 w-8 text-gray-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 mb-1">No images attached</p>
              <p className="text-xs text-gray-600">Upload images to enhance your note with visuals</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('image-upload')?.click()}
              disabled={uploading || disabled}
              className="mt-4 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Add your first image
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 safe-area-padding"
          onClick={closeImageModal}
        >
          <div className="relative max-w-4xl max-h-full w-full">
            <Button
              variant="outline"
              size="sm"
              className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm hover:bg-white touch-target"
              onClick={closeImageModal}
            >
              <X className="h-4 w-4" />
            </Button>
            <img
              src={selectedImage}
              alt="Full size image"
              className="w-full h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
