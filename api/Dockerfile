# Use AWS Lambda Python runtime
FROM python:3.13-alpine

# Copy Lambda Web Adapter
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.9.1 /lambda-adapter ${LAMBDA_RUNTIME_DIR}

# Set environment variables for Lambda Web Adapter
ENV AWS_LWA_INVOKE_MODE=RESPONSE_STREAM
ENV AWS_LWA_PORT=8000

# Copy requirements and install dependencies
COPY requirements.txt ${LAMBDA_TASK_ROOT}
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY main.py ${LAMBDA_TASK_ROOT}

# Set the CMD to your handler
CMD ["python", "main.py"]
