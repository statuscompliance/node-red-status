@echo off

REM Construir la imagen Docker
docker build -t node-red-status .

REM Ejecutar el contenedor Docker
docker run -it -p 1880:1880 --name node-red-status -v "%cd%:/data" node-red-status