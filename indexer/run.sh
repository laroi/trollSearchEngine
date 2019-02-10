docker stop indexer && docker rm indexer
docker run --net=host -dit --name 'indexer' memefinder/indexer
