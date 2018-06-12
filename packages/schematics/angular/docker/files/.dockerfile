# You are free to change the contents of this file
FROM nginx

# Configure for angular fallback routes
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built app to wwwroot
COPY dist /usr/share/nginx/html