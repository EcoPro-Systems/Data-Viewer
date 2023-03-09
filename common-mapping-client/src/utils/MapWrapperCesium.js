import MapWrapperCesiumCore from "_core/utils/MapWrapperCesium";
import * as appStringsCore from "_core/constants/appStrings";
import * as appStrings from "constants/appStrings";
import CustomCesiumTilingScheme from "utils/cesium/CustomTilingScheme";
import TileHandler from "utils/TileHandler";
import MapUtil from "utils/MapUtil";

export default class MapWrapperCesium extends MapWrapperCesiumCore {
    initStaticClasses(container, options) {
        MapWrapperCesiumCore.prototype.initStaticClasses.call(this, container, options);
        this.mapUtil = MapUtil;
        this.tileHandler = TileHandler;
    }

    createLayer(layer) {
        let mapLayer = MapWrapperCesiumCore.prototype.createLayer.call(this, layer);
        if (mapLayer) {
            mapLayer._layerRef = layer;
        }
        return mapLayer;
    }

    getDataAtPoint(coords, pixel, palettes) {
        try {
            const data = [];
            const mapLayers = this.getMapLayers();

            // convert positions to better options for cesium
            const cartesian = this.map.scene.camera.pickEllipsoid(
                { x: pixel[0], y: pixel[1] },
                this.map.scene.globe.ellipsoid
            );
            const coordsRad = this.map.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
            // const coordsRad = new this.cesium.Cartographic.fromDegrees(coords.lat, coords.lon);

            // search through all imagery layers
            for (let i = 0; i < mapLayers.length; ++i) {
                const mapLayer = mapLayers.get(i);

                // only applicable to data layers
                if (mapLayer._layerType === appStringsCore.LAYER_GROUP_TYPE_DATA) {
                    const imageryProvider = mapLayer.imageryProvider;
                    const tilingScheme = imageryProvider.tilingScheme;
                    const layer = mapLayer._layerRef;

                    // check if this layer has extracted data
                    if (typeof mapLayer._extractedTileData !== "undefined") {
                        let dataStore = mapLayer._extractedTileData;

                        // find the highest resolution tile data
                        const bestTile = dataStore.reduce((acc, tileEntry, tileCoord) => {
                            tileCoord = tileCoord.split(",").map((str) => {
                                return parseInt(str.split(":").slice(-1)[0]); // deal with coords like EPSG:4326:9
                            });
                            const tileRect = tilingScheme.tileXYToRectangle(
                                tileCoord[1],
                                tileCoord[2],
                                tileCoord[0]
                            );
                            // check if the point is in this tile
                            if (this.cesium.Rectangle.contains(tileRect, coordsRad)) {
                                // check if its the highest zoom level tile
                                if (!acc || acc.tileCoord[0] < tileCoord[0]) {
                                    return { tileCoord, tileEntry, tileRect };
                                }
                            }
                            return acc;
                        }, false);

                        if (bestTile) {
                            const tileEntry = bestTile.tileEntry;

                            // find tile extent
                            const tileULRad = this.cesium.Rectangle.northwest(bestTile.tileRect);
                            const tileBRRad = this.cesium.Rectangle.southeast(bestTile.tileRect);
                            const tileHRad = this.cesium.Rectangle.computeHeight(bestTile.tileRect);
                            const tileWRad = this.cesium.Rectangle.computeWidth(bestTile.tileRect);

                            // create a smaller rect to compute offsets
                            const coordRect = new this.cesium.Rectangle(
                                tileULRad.longitude,
                                coordsRad.latitude,
                                coordsRad.longitude,
                                tileULRad.latitude
                            );
                            const coordRectHRad = this.cesium.Rectangle.computeHeight(coordRect);
                            const coordRectWRad = this.cesium.Rectangle.computeWidth(coordRect);

                            // calculate relative offsets
                            const widthRelOffset = coordRectWRad / tileWRad;
                            const heightRelOffset = coordRectHRad / tileHRad;

                            // get index into data
                            const imgData = tileEntry.get("imgData");
                            const imgDataX = Math.floor(imgData.width * widthRelOffset);
                            const imgDataY = Math.floor(imgData.height * heightRelOffset);

                            // retrieve RGBA of the displayed pixel
                            const canvas = tileEntry.get("img");
                            const ctx = canvas.getContext("2d");
                            const colorData = ctx
                                .getImageData(imgDataX, imgDataY, 1, 1)
                                .data.slice(0, 4);
                            const rgbColor = `rgba(${colorData.slice(0, 3).join(",")})`;
                            const hexColor = this.miscUtil.getHexFromColorString(rgbColor);

                            const palette = palettes.get(layer.getIn(["palette", "name"]));
                            if (typeof palette === "undefined") {
                                palette = palettes.get(layer.getIn(["palette", "base"]));
                            }

                            const value = this.mapUtil.mapColorToValue({
                                colorData,
                                palette,
                                handleAs: layer.getIn(["palette", "handleAs"]),
                                units: layer.get("units"),
                            });

                            // store the retrieved data and color
                            data.push({
                                layer: layer.get("id"),
                                label: layer.get("title"),
                                subtitle: layer.get("subtitle"),
                                value,
                                color: hexColor,
                            });
                        } else {
                            data.push({
                                layer: layer.get("id"),
                                label: layer.get("title"),
                                subtitle: layer.get("subtitle"),
                                value: appStrings.NO_DATA,
                                color: "#00000000",
                            });
                        }
                    } else {
                        data.push({
                            layer: layer.get("id"),
                            label: layer.get("title"),
                            subtitle: layer.get("subtitle"),
                            value: appStrings.NO_DATA,
                            color: "#00000000",
                        });
                    }
                }
            }
            return data.reverse(); // reverse the order so that when its displayed, the layer on top of the map will be first
        } catch (err) {
            console.warn("Error in MapWrapperCesium.getDataAtCoordinate:", err);
            return [];
        }
    }

    createTilingScheme(options, tileSchemeOptions) {
        if (
            options.projection === appStringsCore.PROJECTIONS.latlon.code ||
            appStringsCore.PROJECTIONS.latlon.aliases.indexOf(options.projection) !== -1
        ) {
            return MapWrapperCesiumCore.prototype.createTilingScheme.call(
                this,
                options,
                tileSchemeOptions
            );
        } else if (
            options.projection === appStringsCore.PROJECTIONS.webmercator.code ||
            appStringsCore.PROJECTIONS.webmercator.aliases.indexOf(options.projection) !== -1
        ) {
            return MapWrapperCesiumCore.prototype.createTilingScheme.call(
                this,
                options,
                tileSchemeOptions
            );
        }
        return new CustomCesiumTilingScheme(options, tileSchemeOptions);
    }
}
