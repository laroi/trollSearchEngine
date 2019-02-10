docker stop backend && docker rm backend
docker run -dit --net=host -v /home/laroi/development/trollSearchEngine/backend/assets:/opt/app/assets -p 3000:3000 --name backend memefinder/backend
