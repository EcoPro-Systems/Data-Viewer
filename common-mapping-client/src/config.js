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
    APP_TITLE: "EcoPro Data Viewer",
    DATE_SLIDER_ENABLED: true,
    DATE_PICKER_RESOLUTION: "years",
    DATE_SLIDER_RESOLUTIONS: _DATE_SLIDER_RESOLUTIONS,
    DEFAULT_DATE_SLIDER_RESOLUTION: _DATE_SLIDER_RESOLUTIONS[0],
    URLS: {
        paletteConfig: [
            "default-data/user_app/palettes.json",
            "default-data/user_app/tree_mortality.json",
            "default-data/user_app/reef.json",
        ],
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
                    "^user_app:gridRefEsri_treeMortality*": {
                        isDisabled: true,
                        min: 0,
                        max: 100,
                        units: " ",
                        palette: {
                            name: "tree_mortality",
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
                            url: "//localhost/geoserver/gwc/service/wmts?layer=user_app%3AgridRefEsri_treeMortalitySN_severity_byYear_wgs84_{Time}&tilematrixset={TileMatrixSet}&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/png&TileMatrix={TileMatrix}&TileCol={TileCol}&TileRow={TileRow}",
                        },
                    },
                    "^user_app:gridRefEsri_treeMortalitySN_severity_byYear_wgs84_2014$": {
                        isDisabled: false,
                        title: "Tree Mortality Severity (2014 - 2021)",
                    },
                    "^user_app:raster_nature_ssp*": {
                        min: 2012,
                        max: 2100,
                        units: " ",
                        palette: {
                            name: "reef",
                            handleAs: "json-fixed",
                        },
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
