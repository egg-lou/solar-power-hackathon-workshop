from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uuid
import boto3
import json
import os
from datetime import datetime
from boto3.dynamodb.conditions import Key

# Initialize FastAPI app
app = FastAPI(title="Notes API", description="Simple Notes API with DynamoDB and S3")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# AWS Configuration
DYNAMODB_TABLE = os.getenv("DYNAMODB_TABLE", "notes-table-sph")
S3_BUCKET = os.getenv("S3_BUCKET", "notes-images-bucket-sph")

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb')
s3_client = boto3.client('s3')
table = dynamodb.Table(DYNAMODB_TABLE)  # type:ignore 

# Helper function to generate signed URLs
def generate_signed_urls(image_keys: List[str]) -> List[str]:
    signed_urls = []
    for image_key in image_keys:
        try:
            signed_url = s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': S3_BUCKET, 'Key': image_key},
                ExpiresIn=3600  # 1 hour
            )
            signed_urls.append(signed_url)
        except Exception as e:
            print(f"Failed to generate signed URL for {image_key}: {str(e)}")
            # Fallback to direct S3 URL (if bucket is public) or empty string
            signed_urls.append(f"https://{S3_BUCKET}.s3.ap-southeast-1.amazonaws.com/{image_key}")
    return signed_urls 

# Pydantic models
class NoteCreate(BaseModel):
    title: str
    content: str

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None

class Note(BaseModel):
    id: str
    title: str
    content: str
    created_at: str
    updated_at: str
    images: List[str] = []
    image_urls: List[str] = []

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "notes-api"}

# Create a new note
@app.post("/notes", response_model=Note)
async def create_note(note: NoteCreate):
    note_id = str(uuid.uuid4())
    timestamp = datetime.utcnow().isoformat()
    
    item = {
        'id': note_id,
        'title': note.title,
        'content': note.content,
        'created_at': timestamp,
        'updated_at': timestamp,
        'images': [],
        'image_urls': []
    }
    
    try:
        table.put_item(Item=item)
        return Note(**item)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create note: {str(e)}")

@app.get("/")
async def root():
    return {"message": "Server is running"}

# Get all notes
@app.get("/notes", response_model=List[Note])
async def get_all_notes():
    try:
        response = table.scan()
        notes = []
        for item in response['Items']:
            # Generate signed URLs for images
            if item.get('images'):
                item['image_urls'] = generate_signed_urls(item['images'])
            else:
                item['image_urls'] = []
            notes.append(Note(**item))
        return notes
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch notes: {str(e)}")

# Get note by ID
@app.get("/notes/{note_id}", response_model=Note)
async def get_note(note_id: str):
    try:
        response = table.get_item(Key={'id': note_id})
        if 'Item' not in response:
            raise HTTPException(status_code=404, detail="Note not found")
        
        note_data = response['Item']
        # Generate signed URLs for images
        if note_data.get('images'):
            note_data['image_urls'] = generate_signed_urls(note_data['images'])
        else:
            note_data['image_urls'] = []
        
        return Note(**note_data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch note: {str(e)}")

# Update note
@app.put("/notes/{note_id}", response_model=Note)
async def update_note(note_id: str, note_update: NoteUpdate):
    try:
        # Check if note exists
        response = table.get_item(Key={'id': note_id})
        if 'Item' not in response:
            raise HTTPException(status_code=404, detail="Note not found")
        
        # Prepare update expression
        update_expression = "SET updated_at = :updated_at"
        expression_values = {':updated_at': datetime.utcnow().isoformat()}
        
        if note_update.title is not None:
            update_expression += ", title = :title"
            expression_values[':title'] = note_update.title
            
        if note_update.content is not None:
            update_expression += ", content = :content"
            expression_values[':content'] = note_update.content
        
        # Update the item
        table.update_item(
            Key={'id': note_id},
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_values
        )
        
        # Return updated note
        updated_response = table.get_item(Key={'id': note_id})
        return Note(**updated_response['Item'])
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update note: {str(e)}")

# Delete note
@app.delete("/notes/{note_id}")
async def delete_note(note_id: str):
    try:
        # Check if note exists and get images
        response = table.get_item(Key={'id': note_id})
        if 'Item' not in response:
            raise HTTPException(status_code=404, detail="Note not found")
        
        # Delete images from S3
        images = response['Item'].get('images', [])
        for image_key in images:
            try:
                s3_client.delete_object(Bucket=S3_BUCKET, Key=image_key)
            except Exception as e:
                print(f"Failed to delete image {image_key}: {str(e)}")
        
        # Delete note from DynamoDB
        table.delete_item(Key={'id': note_id})
        
        return {"message": "Note deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete note: {str(e)}")

# Upload image to note
@app.post("/notes/{note_id}/images")
async def upload_image(note_id: str, file: UploadFile = File(...)):
    try:
        # Check if note exists
        response = table.get_item(Key={'id': note_id})
        if 'Item' not in response:
            raise HTTPException(status_code=404, detail="Note not found")
        
        # Generate unique filename
        file_extension = file.filename.split('.')[-1] if file.filename and '.' in file.filename else 'jpg'
        image_key = f"notes/{note_id}/{uuid.uuid4()}.{file_extension}"
        
        # Upload to S3
        s3_client.upload_fileobj(
            file.file,
            S3_BUCKET,
            image_key,
            ExtraArgs={'ContentType': file.content_type}
        )
        
        # Update note with new image
        current_images = response['Item'].get('images', [])
        current_images.append(image_key)
        
        table.update_item(
            Key={'id': note_id},
            UpdateExpression="SET images = :images, updated_at = :updated_at",
            ExpressionAttributeValues={
                ':images': current_images,
                ':updated_at': datetime.utcnow().isoformat()
            }
        )
        
        return {"message": "Image uploaded successfully", "image_key": image_key}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")

# Delete image from note
@app.delete("/notes/{note_id}/images/{image_key:path}")
async def delete_image(note_id: str, image_key: str):
    try:
        # Check if note exists
        response = table.get_item(Key={'id': note_id})
        if 'Item' not in response:
            raise HTTPException(status_code=404, detail="Note not found")
        
        current_images = response['Item'].get('images', [])
        if image_key not in current_images:
            raise HTTPException(status_code=404, detail="Image not found")
        
        # Delete from S3
        s3_client.delete_object(Bucket=S3_BUCKET, Key=image_key)
        
        # Update note
        current_images.remove(image_key)
        table.update_item(
            Key={'id': note_id},
            UpdateExpression="SET images = :images, updated_at = :updated_at",
            ExpressionAttributeValues={
                ':images': current_images,
                ':updated_at': datetime.utcnow().isoformat()
            }
        )
        
        return {"message": "Image deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete image: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
