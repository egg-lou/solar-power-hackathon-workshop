FROM python:3.13-alpine
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.9.1 /lambda-adapter /opt/extensions/lambda-adapter
ENV PORT=8000
WORKDIR /var/task
COPY requirements.txt ./
RUN python -m pip install -r requirements.txt
COPY *.py ./
CMD exec uvicorn --port=$PORT --host=0.0.0.0 --timeout-keep-alive=5 --limit-max-uploads=10 --limit-concurrency=100 --access-log main:app