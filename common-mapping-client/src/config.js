/**
 * Copyright 2017 California Institute of Technology.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**************/
/* App Config */
/**************/

/*
Add configuration entries to this that should be editable
in operations (i.e. after build). This config file is loaded
directly in index.html, without going through webpack.

see `src/constants/appConfig.js` for all configuration options

Note that configuration settings that are not expected to change
during deployment should be made in `src/constants/appConfig.js` directly

EXAMPLE:
The following configuration will change the display title for
the application.
```
APPLICATION_CONFIG = {
	APP_TITLE: "New Title"
};
```

*/

_DATE_SLIDER_RESOLUTIONS = [
    {
        label: "years",
        resolution: "years",
        format: "YYYY MMM",
        visMajorFormat: "YYYY",
    },
];

APPLICATION_CONFIG = {
    APP_TITLE: "CMC + GeoServer",
    DATE_SLIDER_ENABLED: true,
    DATE_SLIDER_RESOLUTIONS: _DATE_SLIDER_RESOLUTIONS,
    DEFAULT_DATE_SLIDER_RESOLUTION: _DATE_SLIDER_RESOLUTIONS[0],
    MAX_DATE: new Date("2100-01-01"),
    DATE_PICKER_RESOLUTION: "years",
    DEFAULT_MAP_EXTENT: [-180 * 2, -40, 180 * 2, 60],
    DEFAULT_BBOX_EXTENT: [-180, -40, 180, 60],
    URLS: {
        paletteConfig: ["default-data/user_app/palettes.json", "default-data/user_app/heat.json"],
        layerConfig: [
            {
                url: "//gibs.earthdata.nasa.gov/wmts/epsg4326/best/1.0.0/WMTSCapabilities.xml",
                type: "wmts/xml",
            },
            {
                url: "//localhost/geoserver/gwc/service/wmts?REQUEST=GetCapabilities",
                // url: "/geoserver/gwc/service/wmts?REQUEST=GetCapabilities",
                type: "wmts/xml",
                defaultOptions: {
                    __ALL__: {
                        type: "data",
                        handleAs: "wmts_raster",
                        updateParameters: {
                            time: false,
                        },
                        mappingOptions: {
                            tileFunctions: {
                                openlayers: "extractData_OL",
                                cesium: "extractData_CS",
                            },
                        },
                    },
                    "^user_app:nabove2090s*": {
                        isDisabled: true,
                        min: 0,
                        max: 365,
                        units: " ",
                        palette: {
                            name: "heat",
                            handleAs: "json-fixed",
                        },
                        updateParameters: {
                            time: true,
                        },
                        timeFormat: "YYYY",
                        mappingOptions: {
                            urlFunctions: {
                                openlayers: "kvpTimeParam_wmts",
                                cesium: "kvpTimeParam_wmts",
                            },
                            url: "//localhost/geoserver/gwc/service/wmts?layer=user_app%3Anabove2090s_{Time}&tilematrixset={TileMatrixSet}&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/png&TileMatrix={TileMatrix}&TileCol={TileCol}&TileRow={TileRow}",
                        },
                    },
                    "^user_app:nabove2090s_2005$": {
                        title: "nabove2090s (2005/2035/2055/2095)",
                        isDisabled: false,
                    },
                },
            },
            {
                url: "default-data/user_app/layers.json",
                type: "json",
            },
        ],
    },
};
