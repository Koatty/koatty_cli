#!/bin/bash

echo "install nodejs modules ----------------------------------"

if [ -f "/data/pnpm-lock.lock" ]; then
  # used pnpm
  cd /data && pnpm install --production
elif [ -f "/data/yarn.lock" ]; then
  # used yarn  
  cd /data && yarn install --production
else
  # used npm
  cd /data && npm install --production
fi

echo "start pm2 -----------------------------------------------"
pm2 startOrGracefulReload /pm2.json

echo "running -------------------------------------------------"
pm2 log
