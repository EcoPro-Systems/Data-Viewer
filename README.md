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
- Pull down git lfs artifacts: `git lfs pull`
- Reinstate the smudge filter: `git lfs install --force`
- Unpack the GeoServer data bundle: `./scripts/unpack.sh`
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
  - Setup
    - Create virtualenv: `python -m venv pyvenv`
      - `source pyvenv/bin/activate`
    - Install: `pip install -e .[dev]`
  - Scripts:
    - `convert_kelp_biomass`: Converts NetCDF of Kelp Biomass historical data to a bunch of Shapefiles
    - `import_directory`: Bulk import all raster data files (GeoTIFF) or shapefiles in a directory into GeoServer
- Docker image for python
  - GDAL can be unpredictably upgraded and suddenly all of the versions won't match on MacOS, so use Docker instead
  - `docker compose build ecoprodev`
  - `docker compose run ecoprodev`
### Note on Docker

Docker can tend to get clogged up with cached layers, especially if one is repeatedly stopping/rebuilding/starting these containers. These out of date containers and image layers can lead to some unreliability with the GeoServer backend. As such, it is recommended to run `docker system prune` regularly to keep this cruft from interfering. This issue has been noted particularly on Apple M1 systems.

### common-mapping-client_build

Once you have run `./scripts/start.sh -d` there should be a new directory present called `common-mapping-client_build`. This directory contains the built and deployed assets for the frontend common-mapping-client viewer, its contents are mounted from the Docker container serving the files. You can modify the `config.js` and `*.json` in this directory and have them reflected in the active deployment. Note that you must duplicate these changes in the `common-mapping-client` source directory if you plan on rebuilding the frontend in the future, otherwise the changes will be overwritten.

### GeoServer management

Contact Flynn for the currently configured GeoServer admin password
