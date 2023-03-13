/**
 * Copyright 2017 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import Immutable from "immutable";
import moment from "moment";
import * as appStrings from "constants/appStrings";
import * as coreConfig from "_core/constants/appConfig";

// the config as defined by CMC Core
const CORE_CONFIG = Immutable.fromJS(coreConfig);

// this config is defined in `src/config.js` for in ops changes
const OPS_CONFIG = Immutable.fromJS(window.APPLICATION_CONFIG);

// define your overrides for Core config here
const APP_CONFIG = Immutable.fromJS({
    DEFAULT_MAP_EXTENT: [-180 * 2, -90, 180 * 2, 90],
    DEFAULT_BBOX_EXTENT: [-128, 34, -113, 41],
    TILE_LAYER_UPDATE_STRATEGY: "replace_layer",
    DEFAULT_AVAILABLE_PROJECTIONS: coreConfig.DEFAULT_AVAILABLE_PROJECTIONS.concat([
        appStrings.ADDITIONAL_PROJECTIONS.NAD83,
    ]),
    // DEFAULT_PROJECTION: appStrings.ADDITIONAL_PROJECTIONS.NAD83,
    MAX_RESOLUTION: undefined,
    MAX_ZOOM: undefined,
    MIN_ZOOM: undefined,
    DEFAULT_DATE: moment("2014-01-01", "YYYY-MM-DD").toDate(),
});

const isList = Immutable.List.isList;
function merger(a, b) {
    if (a && a.mergeWith && !isList(a) && !isList(b)) {
        return a.mergeWith(merger, b);
    }
    return b;
}

// define and export the final config
const appConfig = merger(CORE_CONFIG.mergeDeep(APP_CONFIG), OPS_CONFIG).toJS();
window._MERGED_APPLICATION_CONFIG = appConfig;
export default appConfig;

// TODO - possible hint for single-file time dataset?
// Caused by: java.lang.IllegalArgumentException: Couldn't determine time units from unit string 'unknown'
