# EcoPro Data Viewer

Application bundle that includes a Common Mapping Client frontend and GeoServer backend.

### Requirements

- [Docker](https://www.docker.com/) runtime ([Rancher](https://rancherdesktop.io/) should work too)
- [git-lfs](https://git-lfs.github.com/)
  - `brew install git-lfs` for MacOS

### Getting Started

- Enable `git lfs` for your account: `git lfs install --skip-smudge`
  - Disable the smudge filter to avoid more painful initial clone
- Clone repo: `git clone git@github.jpl.nasa.gov:EcoPro/Data-Viewer.git`
- For JPL users only
  - Some pre-built assets are stored for development use
  - Pull down git lfs artifacts: `git lfs pull`
  - Reinstate the smudge filter: `git lfs install --force`
  - Unpack the GeoServer data bundle: `./scripts/unpack.sh`
- Populate `docker/.env`
  - `ECOPRO_DATA_DIR` path to the directory where the EcoPro data files are located (usually something like `./data_files`)
  - `ECOPRO_GEOSERVER_DATA_DIR` path to the geoserver_data directory (usually something like `./geoserver_data`)
- Start services: `./scripts/start.sh`
  - wait a few minutes for GeoServer to start up
  - use `-d` to run docker services in detached (in the background)
- Go to `http://localhost` for the data viewer
- Go to `http://localhost/geoserver` for the GeoServer admin portal

### Scripts

- `pack.sh` - packs the geoserver_data directory into a tarball for transferring
- `unpack.sh` - unpacks the geoserver_data tarball for serving
- `build.sh`- builds the docker images and sets up data directories
- `start.sh`- builds and starts the docker containers (optional `-d` to start container in the background)
- `stop.sh`- stops and removes all the running containers
- Python scripts:
  - `convert_kelp_biomass`: Converts NetCDF of Kelp Biomass data to a bunch of Shapefiles or MBTiles
  - `import_directory`: Bulk import all raster data files (GeoTIFF, Shapefiles, or MBTiles) in a directory into GeoServer
  - Docker image for python
    - GDAL can be unpredictably upgraded and suddenly all of the versions won't match on MacOS, so use Docker instead
    - `docker compose -f docker/docker-compose.dev.yml build ecoprodev`
    - `docker compose -f docker/docker-compose.dev.yml run ecoprodev`

### Note on Docker

Docker can tend to get clogged up with cached layers, especially if one is repeatedly stopping/rebuilding/starting these containers. These out of date containers and image layers can lead to some unreliability with the GeoServer backend. As such, it is recommended to run `docker system prune` regularly to keep this cruft from interfering. This issue has been noted particularly on Apple M1 systems.

### GeoServer management

Contact Flynn for the currently configured GeoServer admin password
