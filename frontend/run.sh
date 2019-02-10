docker stop frontend && docker rm frontend
docker run -dit -p 8081:80 --name frontend memefinder/frontend
