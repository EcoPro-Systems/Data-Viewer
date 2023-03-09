import proj4js from "proj4";

export default class CustomCesiumProjection extends window.Cesium.GeographicProjection {
    constructor(options) {
        super(options);
        const { ellipsoid, projectionId, projectionString } = options;
        this._ellipsoid = ellipsoid || window.Cesium.Ellipsoid.WGS84;
        this._semimajorAxis = this._ellipsoid.maximumRadius;
        this._oneOverSemimajorAxis = 1.0 / this._semimajorAxis;
        this._projectionId = projectionId || "EPSG:4326";
        if (projectionString) {
            proj4js.defs(projectionId, projectionString);
        }
    }

    get ellipsoid() {
        return this._ellipsoid;
    }

    project(cartographic, result) {
        // convert incoming radians to degrees
        const lonDeg = window.Cesium.Math.toDegrees(cartographic.longitude);
        const latDeg = window.Cesium.Math.toDegrees(cartographic.latitude);

        // project the lat/lon to our custom projection
        const projCoord = proj4js("EPSG:4326", this._projectionId, [lonDeg, latDeg]);

        const x = projCoord[0];
        const y = projCoord[1];
        const z = cartographic.height;

        if (typeof result === "undefined") {
            return new window.Cesium.Cartesian3(x, y, z);
        }

        result.x = x;
        result.y = y;
        result.z = z;
        return result;
    }

    unproject(cartesian, result) {
        if (typeof cartesian === "undefined") {
            throw new Error("cartesian is required");
        }

        const projCoord = proj4js(this._projectionId, "EPSG:4326", [cartesian.x, cartesian.y]);

        // convert the radians to degrees
        const lonRad = window.Cesium.Math.toRadians(projCoord[0]);
        const latRad = window.Cesium.Math.toRadians(projCoord[1]);
        const height = cartesian.z;

        if (typeof result === "undefined") {
            return new window.Cesium.Cartographic(lonRad, latRad, height);
        }

        result.longitude = lonRad;
        result.latitude = latRad;
        result.height = height;
        return result;
    }

    _projectExtent(srcProj, extent) {
        const swSrc = [extent[0], extent[1]];
        const neSrc = [extent[2], extent[3]];
        const swDest = proj4js(srcProj, this._projectionId, swSrc);
        const neDest = proj4js(srcProj, this._projectionId, neSrc);
        return [swDest[0], swDest[1], neDest[0], neDest[1]]; // [minX, minY, maxX, maxY]
    }

    _unprojectExtent(destProj, extent) {
        const swSrc = [extent[0], extent[1]];
        const neSrc = [extent[2], extent[3]];
        const swDest = proj4js(this._projectionId, destProj, swSrc);
        const neDest = proj4js(this._projectionId, destProj, neSrc);
        return [swDest[0], swDest[1], neDest[0], neDest[1]]; // [minX, minY, maxX, maxY]
    }
}
