export interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  images: string[];
  image_urls?: string[];
}

export interface NoteCreate {
  title: string;
  content: string;
}

export interface NoteUpdate {
  title?: string;
  content?: string;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface ImageUploadResponse {
  message: string;
  image_key: string;
}
