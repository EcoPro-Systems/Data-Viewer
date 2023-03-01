/**
 * Copyright 2017 California Institute of Technology.
 *
 * This source code is licensed under the APACHE 2.0 license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

// View Actions
export const COMPLETE_INITIAL_LOAD = "COMPLETE_INITIAL_LOAD";
export const SET_LAYER_MENU_OPEN = "SET_LAYER_MENU_OPEN";
export const OPEN_LAYER_INFO = "OPEN_LAYER_INFO";
export const CLOSE_LAYER_INFO = "CLOSE_LAYER_INFO";
export const SET_CURRENT_METADATA = "SET_CURRENT_METADATA";
export const SET_HELP_OPEN = "SET_HELP_OPEN";
export const SET_SHARE_OPEN = "SET_SHARE_OPEN";
export const TOGGLE_SHARE_UPDATE_FLAG = "TOGGLE_SHARE_UPDATE_FLAG";
export const SELECT_HELP_PAGE = "SELECT_HELP_PAGE";
export const DISMISS_ALERT = "DISMISS_ALERT";
export const DISMISS_ALL_ALERTS = "DISMISS_ALL_ALERTS";
export const SET_FULL_SCREEN = "SET_FULL_SCREEN";
export const SET_SETTINGS_OPEN = "SET_SETTINGS_OPEN";
export const SET_DISTRACTION_FREE_MODE = "SET_DISTRACTION_FREE_MODE";
export const SET_MAP_CONTROL_TOOLS_OPEN = "SET_MAP_CONTROL_TOOLS_OPEN";
export const SET_MAP_CONTROL_BASEMAP_PICKER_OPEN = "SET_MAP_CONTROL_BASEMAP_PICKER_OPEN";
export const HIDE_MAP_CONTROLS = "HIDE_MAP_CONTROLS";

// Draw Actions
export const ENABLE_DRAWING = "ENABLE_DRAWING";
export const DISABLE_DRAWING = "DISABLE_DRAWING";

// Measure Actions
export const ENABLE_MEASURING = "ENABLE_MEASURING";
export const DISABLE_MEASURING = "DISABLE_MEASURING";

// Map Actions
export const SET_LAYER_ACTIVE = "SET_LAYER_ACTIVE";
export const SET_LAYER_DISABLED = "SET_LAYER_DISABLED";
export const SET_MAP_VIEW_MODE = "SET_MAP_VIEW_MODE";
export const RESET_ORIENTATION = "RESET_ORIENTATION";
export const SET_LAYER_OPACITY = "SET_LAYER_OPACITY";
export const SET_LAYER_PALETTE = "SET_LAYER_PALETTE";
export const INITIALIZE_MAP = "INITIALIZE_MAP";
export const SET_MAP_VIEW = "SET_MAP_VIEW";
export const PAN_MAP = "PAN_MAP";
export const ZOOM_IN = "ZOOM_IN";
export const ZOOM_OUT = "ZOOM_OUT";
export const SET_TERRAIN_ENABLED = "SET_TERRAIN_ENABLED";
export const SET_TERRAIN_EXAGGERATION = "SET_TERRAIN_EXAGGERATION";
export const SET_SCALE_UNITS = "SET_SCALE_UNITS";
export const SET_BASEMAP = "SET_BASEMAP";
export const HIDE_BASEMAP = "HIDE_BASEMAP";
export const SET_MAP_DATE = "SET_MAP_DATE";
export const INGEST_LAYER_CONFIG = "INGEST_LAYER_CONFIG";
export const MERGE_LAYERS = "MERGE_LAYERS";
export const ACTIVATE_DEFAULT_LAYERS = "ACTIVATE_DEFAULT_LAYERS";
export const PIXEL_HOVER = "PIXEL_HOVER";
export const INVALIDATE_PIXEL_HOVER = "INVALIDATE_PIXEL_HOVER";
export const PIXEL_CLICK = "PIXEL_CLICK";
export const MOVE_LAYER_TO_TOP = "MOVE_LAYER_TO_TOP";
export const MOVE_LAYER_TO_BOTTOM = "MOVE_LAYER_TO_BOTTOM";
export const MOVE_LAYER_UP = "MOVE_LAYER_UP";
export const MOVE_LAYER_DOWN = "MOVE_LAYER_DOWN";
export const INGEST_LAYER_PALETTES = "INGEST_LAYER_PALETTES";
export const ADD_GEOMETRY_TO_MAP = "ADD_GEOMETRY_TO_MAP";
export const ADD_MEASUREMENT_LABEL_TO_GEOMETRY = "ADD_MEASUREMENT_LABEL_TO_GEOMETRY";
export const REMOVE_ALL_DRAWINGS = "REMOVE_ALL_DRAWINGS";
export const REMOVE_ALL_MEASUREMENTS = "REMOVE_ALL_MEASUREMENTS";

// Async Actions
export const SET_ASYNC_LOADING_STATE = "SET_ASYNC_LOADING_STATE";

// Date Slider Actions
export const BEGIN_DRAGGING = "BEGIN_DRAGGING";
export const END_DRAGGING = "END_DRAGGING";
export const HOVER_DATE = "HOVER_DATE";
export const TIMELINE_MOUSE_OUT = "TIMELINE_MOUSE_OUT";
export const SET_DATE_RESOLUTION = "SET_DATE_RESOLUTION";

// Analytics
export const SET_ANALYTICS_ENABLED = "SET_ANALYTICS_ENABLED";
export const SEND_ANALYTICS_BATCH = "SEND_ANALYTICS_BATCH";

// Misc
export const SET_AUTO_UPDATE_URL = "SET_AUTO_UPDATE_URL";
export const RESET_APPLICATION_STATE = "RESET_APPLICATION_STATE";
export const CHECK_BROWSER_FUNCTIONALITIES = "CHECK_BROWSER_FUNCTIONALITIES";
export const ADD_ALERT = "ADD_ALERT";
export const NO_ACTION = "NO_ACTION";
