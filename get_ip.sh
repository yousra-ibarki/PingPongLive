#!/bin/bash

# Remove existing HOST_IP line if it exists
if [ -f .env ]; then
    sed -i '' '/^HOST_IP=/d' .env
    
    # Add newline if file doesn't end with one
    if [ -s .env ] && [ "$(tail -c1 .env)" != "" ]; then
        echo "" >> .env
    fi
fi

# Get IP and append it
ip=$(ifconfig | grep 'inet ' | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1)
echo "HOST_IP=$ip" >> .env
echo "Updated HOST_IP to $ip in .env"