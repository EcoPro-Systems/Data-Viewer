FROM ghcr.io/osgeo/gdal:ubuntu-full-3.7.2

# install ecopro scripts
RUN apt-get update && apt-get install -y python3-pip
RUN mkdir /ecopro
COPY . /ecopro
RUN cd /ecopro && pip install -e .[dev]

# install tippecanoe
RUN apt-get update && apt-get -y install \
    cmake wget git ca-certificates build-essential
RUN apt-get update && apt-get -y install \
    libsqlite3-dev zlib1g-dev
RUN cd && git clone https://github.com/mapbox/tippecanoe.git tippecanoe \
    && cd tippecanoe \
    && make -j \
    && make install

# finish up
WORKDIR /ecopro
ENTRYPOINT [ "bash" ]
