#!/bin/bash

pm2 stop bikebump

cd ~/code/bikebump/web/

git pull

npm run production

cd ~/code/bikebump/server

git pull

npm run production

pm2 restart bikebump

