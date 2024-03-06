# Use the official PostgreSQL image from Docker Hub
FROM postgres:latest

ENV POSTGRES_PASSWORD=mainpassword

# Copy initialization scripts to the container
COPY init.sql /docker-entrypoint-initdb.d/
