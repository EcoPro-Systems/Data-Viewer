/**
 * Copyright 2018 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import Immutable from "immutable";
import MapReducerCore from "_core/reducers/reducerFunctions/MapReducer";
import { layerModel } from "reducers/models/map";
import * as appStringsCore from "_core/constants/appStrings";

//IMPORTANT: Note that with Redux, state should NEVER be changed.
//State is considered immutable. Instead,
//create a copy of the state passed and set new values on the copy.

export default class MapReducer extends MapReducerCore {
    static getLayerModel() {
        return layerModel;
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
                    data = data !== false ? data : [];
                    data = Immutable.fromJS(
                        data.map((entry) => {
                            entry.layer = this.findLayerById(state, entry.layer);
                            return entry;
                        })
                    );

                    // set the coordinate as valid
                    pixelCoordinate = pixelCoordinate
                        .set("lat", coords.lat)
                        .set("lon", coords.lon)
                        .set("x", action.pixel[0])
                        .set("y", action.pixel[1])
                        .set("data", data)
                        .set("showData", data.size > 0)
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
