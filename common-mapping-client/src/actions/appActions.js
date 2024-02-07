/**
 * Copyright 2018 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import Immutable from "immutable";
import moment from "moment";
import appConfig from "constants/appConfig";
import * as typesCore from "_core/constants/actionTypes";
import * as types from "constants/actionTypes";
import * as mapActions from "actions/mapActions";
import * as mapActionsCore from "_core/actions/mapActions";
import * as chartActions from "actions/chartActions";
import * as subsettingActions from "actions/subsettingActions";
import * as alertActions from "_core/actions/alertActions";
import * as appStrings from "constants/appStrings";
import * as appStringsCore from "_core/constants/appStrings";
import MapUtil from "utils/MapUtil";
import SearchUtil from "utils/SearchUtil";
import GeoServerUtil from "utils/GeoServerUtil";

export function runUrlConfig(params) {
    // Takes an array of key value pairs and dispatches associated actions for each
    // one.

    return (dispatch) => {
        const keys = Object.keys(params);
        return Promise.all(
            keys.map((key) => {
                return dispatch(translateUrlParamToActionDispatch({ key, value: params[key] }));
            })
        ).catch((err) => {
            console.warn("Error in appActions.runUrlConfig:", err);
            dispatch(
                alertActions.addAlert({
                    title: appStringsCore.ALERTS.URL_CONFIG_FAILED.title,
                    body: appStringsCore.ALERTS.URL_CONFIG_FAILED.formatString,
                    severity: appStringsCore.ALERTS.URL_CONFIG_FAILED.severity,
                    time: new Date(),
                })
            );
        });
    };
}

export function translateUrlParamToActionDispatch(param) {
    switch (param.key) {
        case appConfig.URL_KEYS.INSITU_LAYERS:
            return addTracksFromUrl(param.value.split(","));
        case appConfig.URL_KEYS.SATELLITE_LAYERS:
            return addSatelliteLayersFromUrl(param.value.split(","));
        case appConfig.URL_KEYS.BASEMAP:
            return param.value === "__NONE__"
                ? mapActionsCore.hideBasemap()
                : mapActionsCore.setBasemap(param.value);
        case appConfig.URL_KEYS.VIEW_EXTENT:
            return mapActionsCore.setMapView({ extent: param.value.split(",") }, true);
        case appConfig.URL_KEYS.DATE:
            return mapActions.setDate(moment.utc(param.value).toDate());
        case appConfig.URL_KEYS.DATE_INTERVAL:
            return mapActions.setDateInterval(
                parseInt(param.value.split("__")[0]),
                param.value.split("__")[1]
            );
        case appConfig.URL_KEYS.SEARCH_AREA:
            return setSearchArea(param.value.split(",").map((x) => parseFloat(x)));
        case appConfig.URL_KEYS.SEARCH_TIME:
            return setSearchDateRange(
                moment(param.value.split(",")[0], "YYYY-MM-DD").toDate(),
                moment(param.value.split(",")[1], "YYYY-MM-DD").toDate()
            );
        case appConfig.URL_KEYS.INSITU_SEARCH_PARAMS:
            return setTrackSearchFacetsFromUrl(JSON.parse(param.value));
        case appConfig.URL_KEYS.SATELLITE_SEARCH_PARAMS:
            return setSatelliteSearchFacetsFromUrl(JSON.parse(param.value));
        case appConfig.URL_KEYS.REFERENCE_LAYER:
            return setReferenceLayer(param.value);
        case appConfig.URL_KEYS.ANIMATION_DATE_RANGE:
            return setAnimationRange(
                moment.utc(param.value.split(",")[0]).toDate(),
                moment.utc(param.value.split(",")[1]).toDate()
            );
        case appConfig.URL_KEYS.LAYER_INFO:
            return setLayerInfoFromUrl(param.value);
        case appConfig.URL_KEYS.CHARTS:
            return setChartsFromUrl(param.value.split(","));
        case appConfig.URL_KEYS.MENU_TAB:
            return setMainMenuTabIndex(parseInt(param.value));
        default:
            return { type: typesCore.NO_ACTION };
    }
}
