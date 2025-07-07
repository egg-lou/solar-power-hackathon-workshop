# Notes API Workshop - FastAPI with DynamoDB and S3

A simplified Notes API built with FastAPI, deployed as a Lambda container using AWS Lambda Web Adapter. This workshop teaches the basics of integrating FastAPI with AWS services (DynamoDB and S3) using boto3.

## Workshop Overview (1.5 hours)

This workshop covers:
- FastAPI basics and CRUD operations
- DynamoDB integration with boto3
- S3 file upload/delete operations
- Container deployment to AWS Lambda

## Project Structure

```
├── main.py          # Main FastAPI application
├── requirements.txt # Python dependencies
├── Dockerfile      # Container configuration for Lambda
└── README.md       # This file
```

## Prerequisites

- Python 3.11+
- AWS CLI configured
- Docker installed
- AWS account with appropriate permissions

## Local Development

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Set Environment Variables

```bash
export DYNAMODB_TABLE=notes-table
export S3_BUCKET=notes-images-bucket
```

### 3. Run Locally

```bash
python main.py
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Notes CRUD Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/notes` | Create a new note |
| GET | `/notes` | Get all notes |
| GET | `/notes/{id}` | Get note by ID |
| PUT | `/notes/{id}` | Update note |
| DELETE | `/notes/{id}` | Delete note |

### Image Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/notes/{id}/images` | Upload image to note |
| DELETE | `/notes/{id}/images/{image_key}` | Delete image from note |

## Data Models

### Note
```json
{
  "id": "uuid",
  "title": "string",
  "content": "string",
  "created_at": "ISO datetime",
  "updated_at": "ISO datetime",
  "images": ["s3_key1", "s3_key2"]
}
```

## AWS Resources Required

### DynamoDB Table
- Table name: `notes-table`
- Partition key: `id` (String)

### S3 Bucket
- Bucket name: `notes-images-bucket`
- Used for storing note images

## Key Learning Points

### 1. DynamoDB Operations with boto3
```python
# Initialize DynamoDB resource
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('notes-table')

# Create item
table.put_item(Item=item)

# Get item
response = table.get_item(Key={'id': note_id})

# Update item
table.update_item(
    Key={'id': note_id},
    UpdateExpression="SET title = :title",
    ExpressionAttributeValues={':title': new_title}
)

# Delete item
table.delete_item(Key={'id': note_id})

# Scan all items
response = table.scan()
```

### 2. S3 Operations with boto3
```python
# Initialize S3 client
s3_client = boto3.client('s3')

# Upload file
s3_client.upload_fileobj(
    file.file,
    bucket_name,
    object_key,
    ExtraArgs={'ContentType': file.content_type}
)

# Delete object
s3_client.delete_object(Bucket=bucket_name, Key=object_key)
```

### 3. FastAPI File Upload
```python
from fastapi import UploadFile, File

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    # Process file upload
    pass
```

## Deployment to AWS Lambda

### 1. Build Container
```bash
docker build -t notes-api .
```

### 2. Tag for ECR
```bash
docker tag notes-api:latest {account-id}.dkr.ecr.{region}.amazonaws.com/notes-api:latest
```

### 3. Push to ECR
```bash
aws ecr get-login-password --region {region} | docker login --username AWS --password-stdin {account-id}.dkr.ecr.{region}.amazonaws.com
docker push {account-id}.dkr.ecr.{region}.amazonaws.com/notes-api:latest
```

### 4. Create Lambda Function
- Use container image deployment
- Set environment variables for DynamoDB table and S3 bucket
- Configure appropriate IAM role with DynamoDB and S3 permissions

## Testing the API

### Create a Note
```bash
curl -X POST "http://localhost:8000/notes" \
  -H "Content-Type: application/json" \
  -d '{"title": "My First Note", "content": "This is the content"}'
```

### Get All Notes
```bash
curl -X GET "http://localhost:8000/notes"
```

### Upload Image
```bash
curl -X POST "http://localhost:8000/notes/{note-id}/images" \
  -F "file=@image.jpg"
```

## Workshop Activities

1. **Setup and Run Locally** (15 mins)
   - Install dependencies
   - Set up local environment
   - Test health endpoint

2. **Explore DynamoDB Integration** (30 mins)
   - Create notes
   - Read notes
   - Update notes
   - Delete notes

3. **Explore S3 Integration** (30 mins)
   - Upload images to notes
   - View image associations
   - Delete images

4. **Deploy to Lambda** (15 mins)
   - Build container
   - Deploy to AWS Lambda
   - Test deployed API

## Common Issues and Solutions

### DynamoDB Access
- Ensure your AWS credentials have DynamoDB permissions
- Check table name matches environment variable

### S3 Access
- Ensure your AWS credentials have S3 permissions
- Check bucket name matches environment variable
- Verify bucket exists in the correct region

### Lambda Deployment
- Ensure Lambda execution role has DynamoDB and S3 permissions
- Check environment variables are set in Lambda configuration

## Next Steps

After completing this workshop, consider:
- Adding authentication/authorization
- Implementing pagination for large datasets
- Adding input validation and error handling
- Setting up monitoring and logging
- Implementing CI/CD pipeline
