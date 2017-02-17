echo "stopping bikebump"
pm2 stop bikebump
echo "Updating web repo"
cd ~/code/bikebump/web/
git pull
echo
npm run production
echo
echo "Updating server repo"
echo 
cd ~/code/bikebump/server
git pull
echo
npm run production
echo
echo "restarting bikebump"
pm2 restart bikebump
