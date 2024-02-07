import throttle from "lodash.throttle";
import queryString from "query-string";
import * as appStringsCore from "_core/constants/appStrings";
import * as appStrings from "constants/appStrings";
import MiscUtil from "_core/utils/MiscUtil";
import appConfig from "constants/appConfig";
import moment from "moment";

const constructFullURLWithParams = (params) => {
    // Return full URL for params where params is an object of
    // url key -> values
    return (
        window.location.protocol +
        "//" +
        window.location.host +
        window.location.pathname +
        "?" +
        queryString.stringify(params)
    );
};

const updateUrl = (store) => {
    const state = store.getState();

    if (!state.view.get("initialLoadComplete")) {
        return;
    }

    // extract active layer information
    const layers = state.map.get("layers");
    const basemapLayers = layers
        .get(appStringsCore.LAYER_GROUP_TYPE_BASEMAP)
        .filter((layer) => !layer.get("isDisabled") && layer.get("isActive"))
        .toList()
        .sort(MiscUtil.getImmutableObjectSort("displayIndex"))
        .map((x) => x.get("id"))
        .join(",");
    const dataLayers = layers
        .get(appStringsCore.LAYER_GROUP_TYPE_DATA)
        .filter((layer) => !layer.get("isDisabled") && layer.get("isActive"))
        .toList()
        .sort(MiscUtil.getImmutableObjectSort("displayIndex"))
        .map((x) => x.get("id"))
        .join(",");

    // extract map view info
    const viewExtent = state.map.getIn(["view", "extent"]).join(",");

    // extract date info
    const date = moment.utc(state.map.get("date")).toISOString();
    const date_res = this.props.dateSliderResolution.get("label").toLowerCase();

    const parsed = {
        [appConfig.URL_KEYS.ACTIVE_LAYERS]: dataLayers || undefined,
        [appConfig.URL_KEYS.BASEMAP]: basemapLayers || "__NONE__",
        [appConfig.URL_KEYS.VIEW_EXTENT]: viewExtent || undefined,
        [appConfig.URL_KEYS.DATE]: date || undefined,
        [appConfig.URL_KEYS.TIMELINE_RES]: date_res || undefined,
        // ENABLE_PLACE_LABLES
        // ENABLE_POLITICAL_BOUNDARIES
    };
    const newURL = constructFullURLWithParams(parsed);

    window.history.replaceState({ path: newURL }, "", newURL);
};

const throttledUpdateUrl = throttle(updateUrl, 150, {
    leading: true,
    trailing: true,
});

const actionsTriggeringURLUpdate = {
    SET_MAP_VIEW: true,
    ADD_LAYER: true,
    REMOVE_LAYER: true,
    SET_LAYER_OPACITY: true,
    MOVE_LAYER_UP: true,
    MOVE_LAYER_DOWN: true,
    SET_BASEMAP: true,
    HIDE_BASEMAP: true,
    SET_LAYER_ACTIVE: true,
    SET_MAP_DATE: true,
    SET_DATE_INTERVAL: true,
    SET_DATE_RESOLUTION: true,
};

export const urlParamMiddleware = (store) => (next) => (action) => {
    const returnValue = next(action);
    if (actionsTriggeringURLUpdate[action.type]) {
        throttledUpdateUrl(store);
    }
    return returnValue;
};
