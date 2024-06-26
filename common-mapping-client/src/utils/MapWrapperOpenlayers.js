import moment from "moment";
import chroma from "chroma-js";
import * as Ol_Proj from "ol/proj";
import Ol_Style from "ol/style/Style";
import Ol_Style_Stroke from "ol/style/Stroke";
import Ol_Style_Fill from "ol/style/Fill";
import Ol_Style_Circle from "ol/style/Circle";
import Ol_Layer_Vector from "ol/layer/Vector";
import Ol_Source_Cluster from "ol/source/Cluster";
import { unByKey } from "ol/Observable";
import MapWrapperOpenlayersCore from "_core/utils/MapWrapperOpenlayers";
import * as appStringsCore from "_core/constants/appStrings";
import * as appStrings from "constants/appStrings";
import MapUtil from "utils/MapUtil";
import TileHandler from "utils/TileHandler";
import appConfig from "constants/appConfig";

const TILE_STATE_IDLE = 0; // loading states found in ol.tile.js
const TILE_STATE_LOADING = 1;
const TILE_STATE_LOADED = 2;
const TILE_STATE_ERROR = 3;
const TILE_STATE_EMPTY = 4;
const TILE_STATE_ABORT = 5;
const NO_LOAD_STATES = [TILE_STATE_LOADING, TILE_STATE_LOADED, TILE_STATE_ERROR, TILE_STATE_EMPTY];
const LOAD_COMPLETE_STATES = [TILE_STATE_LOADED, TILE_STATE_ERROR, TILE_STATE_EMPTY];

export default class MapWrapperOpenlayers extends MapWrapperOpenlayersCore {
    initStaticClasses(container, options) {
        MapWrapperOpenlayersCore.prototype.initStaticClasses.call(this, container, options);
        this.mapUtil = MapUtil;
        this.tileHandler = TileHandler;
    }

    initObjects(container, options) {
        MapWrapperOpenlayersCore.prototype.initObjects.call(this, container, options);
        this.layerLoadCallback = undefined;
    }

    handleLayerLoad(layer, loading, error = false) {
        // run the call back (if it exists)
        if (typeof this.layerLoadCallback === "function") {
            // run async to avoid reducer block
            window.requestAnimationFrame(() => {
                this.layerLoadCallback({ layer, loading, error });
            });
        }
    }

    setLayerLoadCallback(callback) {
        if (typeof callback === "function") {
            this.layerLoadCallback = callback;
        }
    }

    createLayer(layer, date, fromCache = true) {
        let mapLayer;

        this.handleLayerLoad(layer.get("id"), true);

        // pull from cache if possible
        let cacheHash = this.getCacheHash(layer, date);
        if (fromCache && this.layerCache.get(cacheHash)) {
            let cachedLayer = this.layerCache.get(cacheHash);
            cachedLayer.setOpacity(layer.get("opacity"));
            cachedLayer.setVisible(layer.get("isActive"));

            mapLayer = cachedLayer;
        } else {
            mapLayer = MapWrapperOpenlayersCore.prototype.createLayer.call(
                this,
                layer,
                false // we don't want the parent class using the wrong cache key
            );
        }

        // add load tracking
        if (mapLayer && typeof mapLayer.getSource === "function") {
            if (mapLayer.getSource().get("_hasLoaded")) {
                this.handleLayerLoad(layer.get("id"), false);
            } else {
                this.addLayerLoadTracker(mapLayer);
            }
        }

        return mapLayer;
    }

    // TODO - different vector layer types/styling
    createVectorLayer(layer, fromCache = true) {
        try {
            this.handleLayerLoad(layer.get("id"), true);

            const defFill = new Ol_Style_Fill({
                color: "rgba(255,255,255,0)",
            });
            const defStroke = new Ol_Style_Stroke({
                color: "rgba(0,0,0,1)",
                width: 1.25,
            });
            let style;
            let sizeProp = layer.getIn(["mappingOptions", "displayProps", "size"]);
            let colorProp = layer.getIn(["mappingOptions", "displayProps", "color"]);
            if (sizeProp || colorProp) {
                sizeProp = sizeProp || colorProp;
                colorProp = colorProp || sizeProp;

                const maxSize = layer.getIn(["mappingOptions", "displayProps", "maxSize"]) || 20;
                const minSize = layer.getIn(["mappingOptions", "displayProps", "minSize"]) || 5;
                const maxScale =
                    layer.getIn(["mappingOptions", "displayProps", "maxScale"]) ||
                    layer.get("max") ||
                    100;
                const minScale =
                    layer.getIn(["mappingOptions", "displayProps", "minScale"]) ||
                    layer.get("min") ||
                    0;
                const colorScale = chroma
                    .scale(layer.getIn(["mappingOptions", "displayProps", "palette"]))
                    .mode("lab")
                    .correctLightness();

                style = (feature, res) => {
                    let sizeVal = 0;
                    let colorVal = 0;
                    const clusteredFeatures = feature.get("features");
                    if (clusteredFeatures) {
                        clusteredFeatures.forEach((feat) => {
                            sizeVal += parseFloat(feat.getProperties()[sizeProp]);
                            colorVal += parseFloat(feat.getProperties()[colorProp]);
                        });
                        // get average val
                        // sizeVal /= clusteredFeatures.length;
                        colorVal /= clusteredFeatures.length;
                    } else {
                        sizeVal = parseFloat(feature.getProperties()[sizeProp]);
                        colorVal = parseFloat(feature.getProperties()[colorProp]);
                    }

                    const view = this.map.getView();
                    const mapScale = Ol_Proj.getPointResolution(
                        view.getProjection(),
                        view.getResolution(),
                        view.getCenter(),
                        "m"
                    );
                    const colorScaler = (colorVal - minScale) / (maxScale - minScale);

                    sizeVal = Math.sqrt(sizeVal); // deal with area scaling
                    const scaledSize = sizeVal / mapScale;
                    const size = Math.min(Math.max(minSize, scaledSize), maxSize);

                    const fill = new Ol_Style_Fill({
                        color: colorScale(colorScaler),
                    });

                    return new Ol_Style({
                        image: new Ol_Style_Circle({
                            fill: fill,
                            stroke: defStroke,
                            radius: size,
                        }),
                        stroke: defStroke,
                        fill: fill,
                    });
                };
            } else {
                style = new Ol_Style({
                    image: new Ol_Style_Circle({
                        fill: defFill,
                        stroke: defStroke,
                        radius: 5,
                    }),
                    stroke: defStroke,
                    fill: defFill,
                });
            }

            let layerSource = this.createLayerSource(layer, {
                url: layer.get("url"),
            });

            if (layer.get("clusterVector")) {
                const distance =
                    layer.getIn(["mappingOptions", "displayProps", "clusterRange"]) || 5;
                layerSource = new Ol_Source_Cluster({ source: layerSource, distance });
            }

            const mapLayer = new Ol_Layer_Vector({
                source: layerSource,
                opacity: layer.get("opacity"),
                visible: layer.get("isActive"),
                extent: appConfig.DEFAULT_MAP_EXTENT,
                style,
            });

            // set custom load tracker
            const vectorSource = layer.get("clusterVector") ? layerSource.getSource() : layerSource;
            vectorSource.setLoader((extent, resolution, projection) => {
                layerSource.set("_hasLoaded", false);
                vectorSource.set("_hasLoaded", false);
                var url = vectorSource.getUrl();
                const onError = (err) => {
                    vectorSource.removeLoadedExtent(extent);
                    this.handleLayerLoad(layer.get("id"), false, err);
                };
                fetch(url)
                    .then((resp) => {
                        if (resp.status >= 400) {
                            onError(new Error("Failed to fetch", url));
                        } else {
                            return resp.text();
                        }
                    })
                    .then((text) => {
                        vectorSource.addFeatures(vectorSource.getFormat().readFeatures(text));
                        layerSource.set("_hasLoaded", true);
                        vectorSource.set("_hasLoaded", true);
                        this.handleLayerLoad(layer.get("id"), false);
                    })
                    .catch((err) => {
                        onError(err);
                    });
            });

            return mapLayer;
        } catch (err) {
            console.warn("Error in MapWrapperOpenlayers.createVectorLayer:", err);
            return false;
        }
    }

    getDataAtPoint(coords, pixel, palettes) {
        try {
            coords = this.getLatLonFromPixelCoordinate(pixel, false); // need deconstrained coords

            // get raster layer data
            let rasterData = [];
            this.map.forEachLayerAtPixel(
                pixel,
                (mapLayer) => {
                    const layer = mapLayer.get("_layerRef");
                    const source = mapLayer.getSource();
                    const tileGrid = source.getTileGrid(); // the tilegrid will give us tile coordinates and extents
                    const res = this.map.getView().getResolution();
                    const tileCoord = tileGrid.getTileCoordForCoordAndResolution(
                        coords.originalCoord,
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
                            const tileSize = tileGrid.getTileSize() || tileGrid.getTileSize(0);
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

                            rasterData.push({
                                layer: layer.get("id"),
                                label: layer.get("title"),
                                subtitle: layer.get("subtitle"),
                                value: value,
                                color: hexColor,
                            });
                        } else {
                            rasterData.push({
                                layer: layer.get("id"),
                                label: layer.get("title"),
                                subtitle: layer.get("subtitle"),
                                value: appStrings.NO_DATA,
                                color: "#00000000",
                            });
                        }
                    } else {
                        rasterData.push({
                            layer: layer.get("id"),
                            label: layer.get("title"),
                            subtitle: layer.get("subtitle"),
                            value: appStrings.NO_DATA,
                            color: "#00000000",
                        });
                    }
                },
                {
                    layerFilter: (mapLayer) => {
                        // check only data layers that are visible and have a viable palette
                        return (
                            mapLayer.getVisible() &&
                            mapLayer.get("_layerType") === appStringsCore.LAYER_GROUP_TYPE_DATA &&
                            mapLayer.get("_layerRef").get("handleAs").indexOf("raster") !== -1 &&
                            typeof mapLayer.getSource === "function"
                        );
                    },
                }
            );

            // collect vector feature data
            const featureData = [];
            this.map.forEachFeatureAtPixel(
                pixel,
                (feature, mapLayer) => {
                    const layer = mapLayer.get("_layerRef");
                    if (layer.getIn(["metadata", "hoverDisplayProps"])) {
                        let properties = feature.getProperties();

                        // try to resolve a color
                        let colorStr = "#000000";
                        try {
                            colorStr = mapLayer.getStyle()(feature).getFill().getColor().hex();
                        } catch (err) {}

                        // aggregate values from cluster
                        const clusteredFeatures = feature.get("features");
                        if (clusteredFeatures) {
                            properties = clusteredFeatures.reduce((acc, feat) => {
                                const featureProps = feat.getProperties();
                                for (let key in featureProps) {
                                    const val = featureProps[key];
                                    if (typeof val === "number") {
                                        if (!acc[key]) {
                                            acc[key] = val;
                                        } else {
                                            acc[key] += val;
                                        }
                                    }
                                }
                                return acc;
                            }, {});
                        }

                        featureData.push({
                            layer: mapLayer.get("_layerId"),
                            properties: properties,
                            coords: coords,
                            color: colorStr,
                        });
                    }
                },
                {
                    layerFilter: (mapLayer) => {
                        return (
                            mapLayer.getVisible() &&
                            mapLayer.get("_layerType") === appStringsCore.LAYER_GROUP_TYPE_DATA
                        );
                    },
                }
            );

            // reverse the data so that when its displayed, the layer on top of the map will be first
            return { raster: rasterData.reverse(), vector: featureData.reverse() };
        } catch (err) {
            console.warn("Error in MapWrapperOpenlayers.getDataAtPoint:", err);
            return {};
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
            let latLonCoord = Ol_Proj.transform(
                coordinate,
                this.map.getView().getProjection().getCode(),
                appStringsCore.PROJECTIONS.latlon.code
            );
            latLonCoord = constrainCoords
                ? this.mapUtil.constrainCoordinates(latLonCoord)
                : latLonCoord;
            if (
                typeof latLonCoord[0] !== "undefined" &&
                typeof latLonCoord[1] !== "undefined" &&
                !isNaN(latLonCoord[0]) &&
                !isNaN(latLonCoord[0])
            ) {
                return {
                    lat: latLonCoord[0],
                    lon: latLonCoord[1],
                    isValid: latLonCoord[1] <= 90 && latLonCoord[1] >= -90,
                    originalCoord: coordinate,
                };
            }
            return false;
        } catch (err) {
            console.warn("Error in MapWrapper_openlayers.getLatLonFromPixelCoordinate:", err);
            return false;
        }
    }

    getCacheHash(layer, date = false) {
        date = date || this.mapDate;
        return `${layer.get("id")}_${this.miscUtil.formatDateWithStr(
            this.mapDate,
            layer.get("timeFormat")
        )}`;
    }

    addLayerLoadTracker(mapLayer) {
        if (mapLayer.get("_layerRef").get("handleAs").indexOf("raster") !== -1) {
            this.addRasterLayerLoadListeners(mapLayer);
        }
    }

    addRasterLayerLoadListeners(mapLayer) {
        // handle the tile loading complete
        const loadEvent = () => {
            const { isLoaded } = this.getLoadingStatus(mapLayer);
            if (isLoaded) {
                mapLayer.getSource().set("_hasLoaded", true);
                this.clearLayerTileListeners(mapLayer);
            }
            this.handleLayerLoad(mapLayer.get("_layerRef").get("id"), !isLoaded);
        };

        // start listening for the tile load events if the source hasn't already loaded
        let source = mapLayer.getSource();
        if (!source.get("_hasLoaded")) {
            if (typeof source.get("_tileLoadEndListener") === "undefined") {
                source.set(
                    "_tileLoadEndListener",
                    source.on("tileloadend", () => loadEvent())
                );
            }
            if (typeof source.get("_tileLoadErrorListener") === "undefined") {
                source.set(
                    "_tileLoadErrorListener",
                    source.on("tileloaderror", () => loadEvent())
                );
            }
            if (typeof source.get("_changeEventListener") === "undefined") {
                source.set(
                    "_changeEventListener",
                    source.on("change", () => loadEvent())
                );
            }
        }
    }

    clearLayerTileListeners(mapLayer) {
        unByKey(mapLayer.getSource().get("_tileLoadEndListener"));
        mapLayer.getSource().unset("_tileLoadEndListener");
        unByKey(mapLayer.getSource().get("_tileLoadErrorListener"));
        mapLayer.getSource().unset("_tileLoadErrorListener");
        unByKey(mapLayer.getSource().get("_changeEventListener"));
        mapLayer.getSource().unset("_changeEventListener");
    }

    getLoadingStatus(mapLayer) {
        if (mapLayer.get("_layerRef").get("handleAs").indexOf("raster") !== -1) {
            return this.getRasterLayerLoadingStatus(mapLayer);
        } else if (mapLayer.get("_layerRef").get("handleAs").indexOf("raster") !== -1) {
            return this.getVectorLayerLoadingStatus(mapLayer);
        }
        return {
            isLoaded: false,
            tilesTotal: -1,
            tilesLoaded: -1,
        };
    }

    getRasterLayerLoadingStatus(mapLayer) {
        let source = mapLayer.getSource();

        // to determine if all tiles are loaded, we check if all the expected tiles
        // are in the tileCache and have a loaded state
        let tilesTotal = 0;
        let tilesLoaded = 0;
        let tileGrid = source.getTileGrid();
        let extent = this.map.getView().calculateExtent(this.map.getSize());
        let resolution = this.map.getView().getResolution();
        let zoom = tileGrid.getZForResolution(resolution);
        tileGrid.forEachTileCoord(extent, zoom, (tileCoord) => {
            let tileCoordStr = tileCoord.join("/");
            if (
                source.tileCache.containsKey(tileCoordStr) &&
                LOAD_COMPLETE_STATES.indexOf(source.tileCache.get(tileCoordStr).state) !== -1
            ) {
                tilesLoaded++;
            }
            tilesTotal++;
        });

        let isLoaded = tilesTotal === tilesLoaded && tilesTotal !== 0;

        return { isLoaded, ratio: tilesLoaded / tilesTotal };
    }
}
