import MapWrapperOpenlayersCore from "_core/utils/MapWrapperOpenlayers";
import * as appStringsCore from "_core/constants/appStrings";
import * as appStrings from "constants/appStrings";
import MapUtil from "utils/MapUtil";
import TileHandler from "utils/TileHandler";

export default class MapWrapperOpenlayers extends MapWrapperOpenlayersCore {
    initStaticClasses(container, options) {
        MapWrapperOpenlayersCore.prototype.initStaticClasses.call(this, container, options);
        this.mapUtil = MapUtil;
        this.tileHandler = TileHandler;
    }

    createLayer(layer, fromCache = true) {
        let mapLayer = MapWrapperOpenlayersCore.prototype.createLayer.call(this, layer, fromCache);
        if (mapLayer) {
            mapLayer.set("_layerRef", layer);
        }
        return mapLayer;
    }

    getDataAtPoint(coords, pixel, palettes) {
        try {
            let data = []; // the collection of pixel data to return
            let mapLayers = this.map.getLayers(); // the layers to search
            coords = this.getLatLonFromPixelCoordinate(pixel, false); // need deconstrained coords
            mapLayers.forEach((mapLayer) => {
                // check only data layers that are visible and have a viable palette
                const layer = mapLayer.get("_layerRef");
                if (
                    mapLayer.getVisible() &&
                    mapLayer.get("_layerType") === appStringsCore.LAYER_GROUP_TYPE_DATA &&
                    typeof mapLayer.getSource === "function"
                ) {
                    const source = mapLayer.getSource();
                    const tileGrid = source.getTileGrid(); // the tilegrid will give us tile coordinates and extents
                    const res = this.map.getView().getResolution();
                    const tileCoord = tileGrid.getTileCoordForCoordAndResolution(
                        [coords.lat, coords.lon],
                        res
                    );
                    if (source.tileCache.containsKey(tileCoord.join("/"))) {
                        const tile = source.tileCache.get(tileCoord.join("/"));
                        if (tile._processedImg) {
                            // calculate extents and scaling
                            const tileExtent = tileGrid.getTileCoordExtent(tileCoord);
                            const tileOrigin = [tileExtent[0], tileExtent[3]];
                            const tilePixelUL = this.map.getPixelFromCoordinate(tileOrigin);
                            const tilePixelBR = this.map.getPixelFromCoordinate([
                                tileExtent[2],
                                tileExtent[1],
                            ]);
                            const tileSize = tileGrid.getTileSize();
                            const tileWidth = tilePixelBR[0] - tilePixelUL[0];
                            const scale = tileWidth / tileSize;

                            // calculate offsets and index for the data. Round down to avoid and index >= tileSize
                            const imgDataX = Math.floor((pixel[0] - tilePixelUL[0]) / scale);
                            const imgDataY = Math.floor((pixel[1] - tilePixelUL[1]) / scale);

                            // retrieve RGBA of the displayed pixel
                            const ctx = tile._processedImg.getContext("2d", {
                                willReadFrequently: true,
                            });
                            const colorData = ctx
                                .getImageData(imgDataX, imgDataY, 1, 1)
                                .data.slice(0, 4);
                            const rgbColor = `rgba(${colorData.slice(0, 3).join(",")})`;
                            const hexColor = this.miscUtil.getHexFromColorString(rgbColor);

                            let palette = palettes.get(layer.getIn(["palette", "name"]));
                            if (typeof palette === "undefined") {
                                palette = palettes.get(layer.getIn(["palette", "base"]));
                            }

                            const value = this.mapUtil.mapColorToValue({
                                colorData,
                                palette,
                                handleAs: layer.getIn(["palette", "handleAs"]),
                                units: layer.get("units"),
                            });

                            data.push({
                                layer: layer.get("id"),
                                label: layer.get("title"),
                                subtitle: layer.get("subtitle"),
                                value: value,
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
            });
            return data.reverse(); // reverse the data so that when its displayed, the layer on top of the map will be first
        } catch (err) {
            console.warn("Error in MapWrapperOpenlayers.getDataAtPoint:", err);
            return [];
        }
    }

    getPixelFromCoordinate(coord) {
        try {
            return this.map.getPixelFromCoordinate(coord);
        } catch (err) {
            console.warn("Error in MapWrapperOpenlayers.getPixelFromCoordinate: ", err);
            return false;
        }
    }

    getLatLonFromPixelCoordinate(pixel, constrainCoords = true) {
        try {
            let coordinate = this.map.getCoordinateFromPixel(pixel);
            coordinate = constrainCoords
                ? this.mapUtil.constrainCoordinates(coordinate)
                : coordinate;
            if (
                typeof coordinate[0] !== "undefined" &&
                typeof coordinate[1] !== "undefined" &&
                !isNaN(coordinate[0]) &&
                !isNaN(coordinate[0])
            ) {
                return {
                    lat: coordinate[0],
                    lon: coordinate[1],
                    isValid: coordinate[1] <= 90 && coordinate[1] >= -90,
                };
            }
            return false;
        } catch (err) {
            console.warn("Error in MapWrapper_openlayers.getLatLonFromPixelCoordinate:", err);
            return false;
        }
    }
}
