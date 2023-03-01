# CMC-GeoServer

Application bundle that includes a Common Mapping Client frontend and GeoServer backend.
Fork this and start building

### Getting Started
 * Make sure you have [git-lfs](https://git-lfs.github.com/) installed
    * `brew install git-lfs` (or whatever your OS says to do) - adds LFS support to git cli on your machine
    * `git lfs install` - enables git lfs for your user account
 * Make sure you have a [Docker](https://www.docker.com/) runtime installed ([Rancher](https://rancherdesktop.io/) should work too)
 * `./scripts/unpack.sh`
 * `./scripts/start.sh`
    * wait a few minutes for GeoServer to start up
 * Go to `http://localhost` for the data viewer
 * Go to `http://localhost/geoserver` for the GeoServer admin portal

### Scripts
 * `pack.sh` - packs the geoserver_data directory into a tarball for transferring
 * `unpack.sh` - unpacks the geoserver_data tarball for serving
 * `build.sh`- builds the docker images and sets up data directories
 * `start.sh`- builds and starts the docker containers (optional `-d` to start container in the background)
 * `stop.sh`- stops and removes all the running containers

 ### Note on Docker
 Docker can tend to get clogged up with cached layers, especially if one is repeatedly stopping/rebuilding/starting these containers. These out of date containers and image layers can lead to some unreliability with the GeoServer backend. As such, it is recommended to run `docker system prune` regularly to keep this cruft from interfering. This issue has been noted particularly on Apple M1 systems.

### common-mapping-client_build
Once you have run `./scripts/start.sh -d` there should be a new directory present called `common-mapping-client_build`. This directory contains the built and deployed assets for the frontend common-mapping-client viewer, its contents are mounted from the Docker container serving the files. You can modify the `config.js` and `*.json` in this directory and have them reflected in the active deployment. Note that you must duplicate these changes in the `common-mapping-client` source directory if you plan on rebuilding the frontend in the future, otherwise the changes will be overwritten.


### GeoServer management
The admin username:pass is set as `admin:cmc_geoserver` it is highly advised to change this
