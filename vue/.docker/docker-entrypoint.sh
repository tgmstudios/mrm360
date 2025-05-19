#!/bin/bash

# Generate runtime environment configuration
envsubst < /usr/share/nginx/html/env.js.template > /usr/share/nginx/html/env.js

# Start nginx
exec "$@" 