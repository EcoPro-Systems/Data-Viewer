FROM ghcr.io/osgeo/gdal:ubuntu-full-3.7.2

RUN apt-get update && apt-get install -y python3-pip

RUN mkdir /ecopro
COPY . /ecopro
WORKDIR /ecopro

RUN pip install -e .[dev]

ENTRYPOINT [ "bash" ]
