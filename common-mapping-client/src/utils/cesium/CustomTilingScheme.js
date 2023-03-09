/**
 * Copyright 2017 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import CustomCesiumProjection from "utils/cesium/CustomProjection";

/**
 * Tiling scheme class for GIBS layers to render in cesium
 * copied from https://github.com/nasa-gibs/gibs-web-examples/blob/master/lib/gibs/gibs.js
 *
 * @export
 * @class CesiumTilingScheme_GIBS
 * @extends {window.Cesium.GeographicTilingScheme}
 */
export default class CustomCesiumTilingScheme extends window.Cesium.GeographicTilingScheme {
    constructor(options, mappingOptions = {}) {
        super(options);
        const { tileSize, extents, tileGrid, projection, ellipsoid, projectionString } =
            mappingOptions;

        const cesium = window.Cesium;
        const tilePixels = tileSize || 256;
        this._tilePixelSize = tilePixels;

        // initialize the projection
        const customProjection = new CustomCesiumProjection({
            projectionId: projection,
            projectionString,
            ellipsoid,
        });
        this._projection = customProjection;

        const latlonExtent = customProjection._unprojectExtent("EPSG:4326", extents);
        const rectangle = new cesium.Rectangle(
            cesium.Math.toRadians(latlonExtent[0]),
            cesium.Math.toRadians(latlonExtent[1]),
            cesium.Math.toRadians(latlonExtent[2]),
            cesium.Math.toRadians(latlonExtent[3])
        );
        this._rectangle = rectangle;
        this._nativeSouthWest = new window.Cesium.Cartesian2(extents[0], extents[1]);
        this._nativeNorthEast = new window.Cesium.Cartesian2(extents[2], extents[3]);

        // Resolution is pixel size in native projection units
        const levels = [];
        const maxInd = tileGrid.resolutions.length; // should be equal to tileGridSizes
        for (let i = 0; i < maxInd; ++i) {
            levels.push({
                width: tileGrid.tileGridSizes[i].width,
                height: tileGrid.tileGridSizes[i].height,
                resolution: tileGrid.resolutions[i],
            });
        }
        this._tileLevels = levels;

        this._numberOfLevelZeroTilesX = levels[0].width;
        this._numberOfLevelZeroTilesY = levels[0].height;
    }

    get ellipsoid() {
        return this._ellipsoid;
    }

    get rectangle() {
        return this._rectangle;
    }

    get projection() {
        return this._projection;
    }

    getNumberOfXTilesAtLevel(level) {
        if (level >= this._tileLevels.length) {
            return 0;
        }
        return this._tileLevels[level].width;
    }

    getNumberOfYTilesAtLevel(level) {
        if (level >= this._tileLevels.length) {
            return 0;
        }
        return this._tileLevels[level].height;
    }

    getResolutionAtLevel(level) {
        if (level >= this._tileLevels.length) {
            return 0;
        }
        return this._tileLevels[level].resolution;
    }

    rectangleToNativeRectangle(rectangle, result) {
        const projection = this._projection;
        const southwest = projection.project(window.Cesium.Rectangle.southwest(rectangle));
        const northeast = projection.project(window.Cesium.Rectangle.northeast(rectangle));

        if (typeof result === "undefined") {
            return new window.Cesium.Rectangle(southwest.x, southwest.y, northeast.x, northeast.y);
        }

        result.west = southwest.x;
        result.south = southwest.y;
        result.east = northeast.x;
        result.north = northeast.y;
        return result;
    }

    tileXYToNativeRectangle(x, y, level, result) {
        const xTiles = this.getNumberOfXTilesAtLevel(level);
        const yTiles = this.getNumberOfYTilesAtLevel(level);

        const xTileWidth = (this._nativeNorthEast.x - this._nativeSouthWest.x) / xTiles;
        const west = this._nativeSouthWest.x + x * xTileWidth;
        const east = this._nativeSouthWest.x + (x + 1) * xTileWidth;

        const yTileHeight = (this._nativeNorthEast.y - this._nativeSouthWest.y) / yTiles;
        const north = this._nativeNorthEast.y - y * yTileHeight;
        const south = this._nativeNorthEast.y - (y + 1) * yTileHeight;

        if (typeof result === "undefined") {
            return new window.Cesium.Rectangle(west, south, east, north);
        }

        result.west = west;
        result.south = south;
        result.east = east;
        result.north = north;
        return result;
    }

    // TODO
    tileXYToRectangle(x, y, level, result) {
        const projectedRectangle = this.tileXYToNativeRectangle(x, y, level, result);

        const projection = this._projection;
        const southwest = projection.unproject(
            new window.Cesium.Cartesian2(projectedRectangle.west, projectedRectangle.south)
        );
        const northeast = projection.unproject(
            new window.Cesium.Cartesian2(projectedRectangle.east, projectedRectangle.north)
        );

        projectedRectangle.west = southwest.longitude;
        projectedRectangle.south = southwest.latitude;
        projectedRectangle.east = northeast.longitude;
        projectedRectangle.north = northeast.latitude;
        return this._tileXYToRectangle_(x, y, level, result);
        return projectedRectangle;

    }

    // TODO
    positionToTileXY(position, level, result) {
        const rectangle = this._rectangle;
        if (!window.Cesium.Rectangle.contains(rectangle, position)) {
            // outside the bounds of the tiling scheme
            return undefined;
        }

        const xTiles = this.getNumberOfXTilesAtLevel(level);
        const yTiles = this.getNumberOfYTilesAtLevel(level);

        const overallWidth = this._nativeNorthEast.x - this._nativeSouthWest.x;
        const xTileWidth = overallWidth / xTiles;
        const overallHeight = this._nativeNorthEast.y - this._nativeSouthWest.y;
        const yTileHeight = overallHeight / yTiles;

        const projection = this._projection;

        const nativePosition = projection.project(position);
        const distanceFromWest = nativePosition.x - this._nativeSouthWest.x;
        const distanceFromNorth = this._nativeNorthEast.y - nativePosition.y;

        let xTileCoordinate = (distanceFromWest / xTileWidth) | 0;
        if (xTileCoordinate >= xTiles) {
            xTileCoordinate = xTiles - 1;
        }
        let yTileCoordinate = (distanceFromNorth / yTileHeight) | 0;
        if (yTileCoordinate >= yTiles) {
            yTileCoordinate = yTiles - 1;
        }

        if (typeof result === "undefined") {
            return new window.Cesium.Cartesian2(xTileCoordinate, yTileCoordinate);
        }

        result.x = xTileCoordinate;
        result.y = yTileCoordinate;
        return result;
    }

    // TODO - WHY THE FUCK ARE THESE HITTING AN UNDEFINED?!!??!
    _tileXYToRectangle_(x, y, level, result) {
        const rectangle = this._rectangle;

        const xTiles = this.getNumberOfXTilesAtLevel(level);
        const yTiles = this.getNumberOfYTilesAtLevel(level);

        const xTileWidth = rectangle.width / xTiles;
        const west = x * xTileWidth + rectangle.west;
        const east = (x + 1) * xTileWidth + rectangle.west;

        const yTileHeight = rectangle.height / yTiles;
        const north = rectangle.north - y * yTileHeight;
        const south = rectangle.north - (y + 1) * yTileHeight;

        if (typeof result === "undefined") {
            result = new window.Cesium.Rectangle(0, 0, 0, 0);
        }

        result.west = west;
        result.south = south;
        result.east = east;
        result.north = north;
        return result;
    }

    // tileXYToRectangle(x, y, level, result) {
    //     // const trueRes = this._tileXYToRectangle_(x, y, level, result);
    //     const xTiles = this.getNumberOfXTilesAtLevel(level);
    //     const yTiles = this.getNumberOfYTilesAtLevel(level);
    //     let resolution = this.getResolutionAtLevel(level);

    //     let xTileWidth = resolution * this._tilePixelSize;
    //     let west = x * xTileWidth + this._nativeSouthWest.x;
    //     let east = (x + 1) * xTileWidth + this._nativeSouthWest.x;

    //     let yTileHeight = resolution * this._tilePixelSize;
    //     let north = this._nativeNorthEast.y - y * yTileHeight;
    //     let south = this._nativeNorthEast.y - (y + 1) * yTileHeight;

    //     const projNorthEast = this.projection.unproject(new window.Cesium.Cartesian2(north, east));
    //     const projSouthWest = this.projection.unproject(new window.Cesium.Cartesian2(south, west));

    //     west = projSouthWest.longitude;
    //     east = projNorthEast.longitude;
    //     south = projSouthWest.latitude;
    //     north = projNorthEast.latitude;

    //     if (typeof result === "undefined") {
    //         result = new window.Cesium.Rectangle(0, 0, 0, 0);
    //     }

    //     result.west = west;
    //     result.south = south;
    //     result.east = east;
    //     result.north = north;

    //     return result;
    // }

    // positionToTileXY(position, level, result) {
    //     if (!window.Cesium.Rectangle.contains(this._rectangle, position)) {
    //         return undefined;
    //     }

    //     const nativePosition = this.projection.project(position);

    //     let xTiles = this._tileLevels[level].width;
    //     let yTiles = this._tileLevels[level].height;
    //     let resolution = this._tileLevels[level].resolution;

    //     let xTileWidth = resolution * this._tilePixelSize;
    //     let yTileHeight = resolution * this._tilePixelSize;

    //     let west = nativePosition.x;
    //     let xTileCoordinate = ((west - this._nativeSouthWest.x) / xTileWidth) | 0;
    //     if (xTileCoordinate >= xTiles) {
    //         xTileCoordinate = xTiles - 1;
    //     }

    //     let north = nativePosition.y;
    //     let yTileCoordinate = ((this._nativeNorthEast.y - north) / yTileHeight) | 0;
    //     if (yTileCoordinate > yTiles) {
    //         yTileCoordinate = yTiles - 1;
    //     }

    //     if (typeof result === "undefined") {
    //         result = new window.Cesium.Cartesian2(0, 0);
    //     }
    //     result.x = xTileCoordinate;
    //     result.y = yTileCoordinate;
    //     return result;
    // }
}
