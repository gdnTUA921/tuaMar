# Use PHP with Apache
FROM php:8.2-apache

# Set timezone environment variable
ENV TZ=Asia/Singapore

# Install packages and PHP extensions
RUN apt-get update && \
    apt-get install -y tzdata unzip git && \
    ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone && \
    docker-php-ext-install pdo pdo_mysql fileinfo && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Enable mod_rewrite
RUN a2enmod rewrite

# Apache upload size fix
RUN echo "LimitRequestBody 20971520" >> /etc/apache2/apache2.conf

# PHP upload size limits
RUN echo "file_uploads=On"                     >  /usr/local/etc/php/conf.d/uploads.ini \
 && echo "upload_max_filesize=20M"             >> /usr/local/etc/php/conf.d/uploads.ini \
 && echo "post_max_size=20M"                   >> /usr/local/etc/php/conf.d/uploads.ini \
 && echo "max_file_uploads=20"                 >> /usr/local/etc/php/conf.d/uploads.ini \
 && echo "memory_limit=256M"                   >> /usr/local/etc/php/conf.d/uploads.ini

# Make Apache listen on port 8080 for Cloud Run
RUN sed -i 's/Listen 80/Listen 8080/' /etc/apache2/ports.conf \
 && sed -i 's/:80>/:8080>/' /etc/apache2/sites-available/000-default.conf

# Set PHP timezone config
RUN echo "date.timezone=$TZ" > /usr/local/etc/php/conf.d/timezone.ini

# Set working directory
WORKDIR /var/www/html

# Copy composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy project files
COPY . .

# Install dependencies
RUN composer install --no-interaction --prefer-dist --optimize-autoloader \
 && composer require kreait/firebase-php --no-interaction --prefer-dist

# Fix permissions
RUN chown -R www-data:www-data /var/www/html

# Expose Cloud Run port
EXPOSE 8080
