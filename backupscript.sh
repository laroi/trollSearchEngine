#!/bin/bash
MONGODUMP=$(which mongodump)
HOST="localhost:27017"
OUTPUT_FOLDER="/home/laroi/back"
ASSET_PATH='/home/laroi/development/trollSearchEngine/backend/assets'
$MONGODUMP  --host=$HOST --gzip --db=trolls --out $OUTPUT_FOLDER
tar -cvf "${OUTPUT_FOLDER}/asset.tar.xz" -C $ASSET_PATH .
tar -cvf "${OUTPUT_FOLDER}.tar.xz" -C ${OUTPUT_FOLDER} .