#!/bin/sh
cd /server/apps/backend
echo "Starting Medusa server..."
exec npx medusa start
