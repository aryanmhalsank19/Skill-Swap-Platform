#!/bin/bash

# Install requirements (assuming you're already in your Anaconda environment)
pip install -r requirements.txt

# Create Django project
django-admin startproject core .

# Create core app
python manage.py startapp api

# Make migrations
python manage.py makemigrations

# Run migrations
python manage.py migrate

echo "Django project setup complete!"
echo "To run the server: python manage.py runserver" 