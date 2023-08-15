/**
 * Copyright 2018 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import Immutable from "immutable";
import chroma from "chroma-js";
import MapReducerCore from "_core/reducers/reducerFunctions/MapReducer";
import { layerModel } from "reducers/models/map";
import * as appStrings from "constants/appStrings";
import * as appStringsCore from "_core/constants/appStrings";

//IMPORTANT: Note that with Redux, state should NEVER be changed.
//State is considered immutable. Instead,
//create a copy of the state passed and set new values on the copy.

function roundTo(x, precision) {
    const scale = 10 ** precision;
    return Math.round(x * scale) / scale;
}

function linearInterval(min, max, total_intervals) {
    const step = (max - min) / total_intervals;
    const result = [min];

    for (let i = 1; i < total_intervals; i++) {
        result.push(min + i * step);
    }

    result.push(max);
    return result;
}

export default class MapReducer extends MapReducerCore {
    static getLayerModel() {
        return layerModel;
    }

    static mergeLayers(state, action) {
        state = super.mergeLayers(state, action);

        // populate some dynamic palettes
        const layers = state.getIn(["layers", appStringsCore.LAYER_GROUP_TYPE_DATA]);
        layers.forEach((layer, ind) => {
            if (layer.getIn(["palette", "handleAs"]) === appStrings.COLORBAR_DYNAMIC) {
                const paletteName = layer.getIn(["palette", "name"]);
                const min = layer.get("min");
                const max = layer.get("max");
                const paletteId = layer.get("id");

                const bins = 255;
                const intervals = linearInterval(min, max, bins);

                const colorScale = chroma.scale(paletteName).mode("lab").correctLightness();
                const colors = colorScale.colors(bins);

                const JSONPalette = {
                    name: layer.get("id"),
                    values: [],
                };
                for (let i = 0; i < intervals.length - 1; ++i) {
                    const number = intervals[i];
                    const nextNumber = intervals[i + 1];
                    const color = colors[i];

                    JSONPalette.values.push([
                        `${roundTo(number, 0)} - ${roundTo(nextNumber, 0)}`,
                        color,
                    ]);
                }
                state = state.setIn(["palettes", paletteId], this.readPalette(JSONPalette));

                const newLayer = layer
                    .setIn(["palette", "handleAs"], appStringsCore.COLORBAR_JSON_FIXED)
                    .setIn(["palette", "name"], layer.get("id"));
                state = state.setIn(
                    ["layers", appStringsCore.LAYER_GROUP_TYPE_DATA, ind],
                    newLayer
                );
            }
        });

        return state;
    }

    static ingestLayerConfig(state, action) {
        let newPartials = [];
        const currPartials = state.getIn(["layers", appStringsCore.LAYER_GROUP_TYPE_PARTIAL]);
        if (action.options.type === appStringsCore.LAYER_CONFIG_JSON) {
            newPartials = this.generatePartialsListFromJson(action.config, action.options);
        } else if (action.options.type === appStringsCore.LAYER_CONFIG_WMTS_XML) {
            newPartials = this.generatePartialsListFromWmtsXml(action.config, action.options);
        } else if (action.options.type === appStringsCore.LAYER_CONFIG_WMS_XML) {
            newPartials = this.generatePartialsListFromWmsXml(action.config, action.options);
        } else {
            console.warn("Unknown layer config type");
            return state;
        }

        // merge in default options from config
        if (action.options.defaultOptions) {
            const { defaultOptions } = action.options;
            newPartials = newPartials.map((partial) => {
                let mergedPartial = partial;
                if (defaultOptions.__ALL__) {
                    mergedPartial = mergedPartial.mergeDeep(defaultOptions.__ALL__);
                }
                for (const key in defaultOptions) {
                    // skip all since we already applied it
                    if (key !== "__ALL__") {
                        const re = new RegExp(key, "gi");
                        if (mergedPartial.get("id").match(re)) {
                            mergedPartial = mergedPartial.mergeDeep(defaultOptions[key]);
                        }
                    }
                }
                return mergedPartial;
            });
        }

        return state.setIn(
            ["layers", appStringsCore.LAYER_GROUP_TYPE_PARTIAL],
            currPartials.concat(newPartials)
        );
    }

    static pixelHover(state, action) {
        let pixelCoordinate = state.getIn(["view", "pixelHoverCoordinate"]).set("isValid", false);
        state.get("maps").forEach((map) => {
            if (map.isActive) {
                let data = [];
                let coords = map.getLatLonFromPixelCoordinate(action.pixel);
                if (coords.isValid) {
                    // find data if any
                    data = map.getDataAtPoint(coords, action.pixel, state.get("palettes"));
                    data = data || { raster: [], vector: [] };
                    data = Immutable.fromJS({
                        raster: data.raster.map((entry) => {
                            entry.layer = this.findLayerById(state, entry.layer);
                            return entry;
                        }),
                        vector: data.vector.map((entry) => {
                            entry.layer = this.findLayerById(state, entry.layer);
                            return entry;
                        }),
                    });

                    // set the coordinate as valid
                    pixelCoordinate = pixelCoordinate
                        .set("lat", coords.lat)
                        .set("lon", coords.lon)
                        .set("x", action.pixel[0])
                        .set("y", action.pixel[1])
                        .set("data", data)
                        .set("showRasterData", data.get("raster").size > 0)
                        .set("showVectorData", data.get("vector").size > 0)
                        .set("isValid", true);
                } else {
                    pixelCoordinate = pixelCoordinate.set("isValid", false);
                }
            }
            return true;
        });
        return state.setIn(["view", "pixelHoverCoordinate"], pixelCoordinate);
    }
}
