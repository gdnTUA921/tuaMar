# Use official Python base image
FROM python:3.10

# Set working directory
WORKDIR /app

# Copy project files into the container
COPY . .

# Set environment variables to improve pip reliability
ENV PIP_DEFAULT_TIMEOUT=100 \
    PIP_RETRIES=10

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libmariadb-dev \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip to the latest version that supports --resume-retries
RUN pip install --upgrade pip

# Install core Python dependencies (split for better cache and error recovery)
RUN pip install --no-cache-dir --prefer-binary --resume-retries=5 \
    flask \
    flask-cors \
    pandas \
    numpy \
    scikit-learn \
    sqlalchemy \
    mysql-connector-python \
    python-dotenv 

# Install heavy and flaky packages separately
RUN pip install --no-cache-dir --prefer-binary --resume-retries=5 \
    sentence-transformers

# Expose the port Flask runs on
EXPOSE 8080

# Start Flask app
CMD ["python", "ai-recommendation.py"]
