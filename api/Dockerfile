# Base image with Python
FROM python:3.9-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# Install system-level dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libeccodes-dev \
    python3-dev \
    bash \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy project files
COPY . /app

# Install Python dependencies
RUN pip install --upgrade pip \
    && pip install -r requirements.txt

# Expose port if needed (e.g., for a Flask or FastAPI app)
EXPOSE 8080

# This line should exists for GCloud deployment !
# Start the app using Gunicorn instead of Flask's built-in server
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "api:app"]
