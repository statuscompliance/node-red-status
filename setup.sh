#!/bin/bash

# Construir la imagen Docker
docker build -t node-red-status .

# Ejecutar el contenedor Docker
docker run -it -p 1880:1880 --name node-red-status -v "$(pwd):/data" node-red-status