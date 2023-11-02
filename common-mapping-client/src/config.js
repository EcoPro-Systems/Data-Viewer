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


NOTES:

cannot use single layer because WMTS doesn't support env for band selection
cannot use WMS because URL modification is not built out

*/

_DATE_SLIDER_RESOLUTIONS = [
    {
        label: "months",
        resolution: "months",
        format: "YYYY MMM DD",
        visMajorFormat: "YYYY",
    },
    {
        label: "years",
        resolution: "years",
        format: "YYYY MMM DD",
        visMajorFormat: "YYYY",
    },
];

APPLICATION_CONFIG = {
    APP_TITLE: "EcoPro Data Viewer",
    DATE_SLIDER_ENABLED: true,
    DATE_PICKER_RESOLUTION: "months",
    DATE_SLIDER_RESOLUTIONS: _DATE_SLIDER_RESOLUTIONS,
    DEFAULT_DATE_SLIDER_RESOLUTION: _DATE_SLIDER_RESOLUTIONS[0],
    DELETE_LAYER_PARTIALS: true,
    URLS: {
        paletteConfig: [
            "default-data/user_app/palettes/palettes.json",
            "default-data/user_app/palettes/tree_mortality.json",
            "default-data/user_app/palettes/tree_mortality_aet.json",
            "default-data/user_app/palettes/tree_mortality_cwd.json",
            "default-data/user_app/palettes/tree_mortality_pck.json",
            "default-data/user_app/palettes/tree_mortality_pet.json",
            "default-data/user_app/palettes/tree_mortality_ppt.json",
            "default-data/user_app/palettes/tree_mortality_rch.json",
            "default-data/user_app/palettes/tree_mortality_run.json",
            "default-data/user_app/palettes/tree_mortality_str.json",
            "default-data/user_app/palettes/tree_mortality_tmn.json",
            "default-data/user_app/palettes/tree_mortality_tmx.json",
            "default-data/user_app/palettes/reef.json",
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
                defaultOptions: [
                    {
                        key: "__ALL__",
                        options: {
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
                    },

                    {
                        key: "^user_app:gridRefEsri_treeMortalitySN_severity_byYear_wgs84*",
                        options: {
                            isDisabled: true,
                            min: 0,
                            max: 100,
                            units: " ",
                            group: ["Tree Mortality - Sierra Nevada"],
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
                    },
                    {
                        key: "^user_app:gridRefEsri_treeMortalitySN_severity_byYear_wgs84_2014$",
                        options: {
                            isDisabled: false,
                            title: "Tree Mortality Severity (2014 - 2021)",
                        },
                    },

                    {
                        key: "^user_app:bcmv8_[a-z]{3}_[0-9]{4}.*",
                        options: {
                            isDisabled: true,
                            units: " ",
                            group: ["Tree Mortality - Sierra Nevada", "Climate Data (1980 - 2022)"],
                            updateParameters: {
                                time: true,
                            },
                            timeFormat: "YYYY",
                            mappingOptions: {
                                urlFunctions: {
                                    openlayers: "kvpTimeParam_wmts",
                                    cesium: "kvpTimeParam_wmts",
                                },
                            },
                        },
                    },
                    {
                        key: "^user_app:bcmv8_aet_1980_unco$",
                        options: {
                            isDisabled: false,
                            title: "Actual Evapotranspiration",
                            min: 0,
                            max: 1200,
                            units: "mm",
                            palette: {
                                name: "tree_mortality_aet",
                                handleAs: "json-fixed",
                            },
                            mappingOptions: {
                                url: "//localhost/geoserver/gwc/service/wmts?layer=user_app%3Abcmv8_aet_{Time}_unco&tilematrixset={TileMatrixSet}&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/png&TileMatrix={TileMatrix}&TileCol={TileCol}&TileRow={TileRow}",
                            },
                        },
                    },
                    {
                        key: "^user_app:bcmv8_cwd_1980_unco$",
                        options: {
                            isDisabled: false,
                            title: "Climatic Water Deficit",
                            min: 0,
                            max: 1700,
                            units: "mm",
                            palette: {
                                name: "tree_mortality_cwd",
                                handleAs: "json-fixed",
                            },
                            mappingOptions: {
                                url: "//localhost/geoserver/gwc/service/wmts?layer=user_app%3Abcmv8_cwd_{Time}_unco&tilematrixset={TileMatrixSet}&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/png&TileMatrix={TileMatrix}&TileCol={TileCol}&TileRow={TileRow}",
                            },
                        },
                    },
                    {
                        key: "^user_app:bcmv8_pck_1980_unco$",
                        options: {
                            isDisabled: false,
                            title: "Snow Pack",
                            min: 0,
                            max: 12000,
                            units: "mm",
                            palette: {
                                name: "tree_mortality_pck",
                                handleAs: "json-fixed",
                            },
                            mappingOptions: {
                                url: "//localhost/geoserver/gwc/service/wmts?layer=user_app%3Abcmv8_pck_{Time}_unco&tilematrixset={TileMatrixSet}&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/png&TileMatrix={TileMatrix}&TileCol={TileCol}&TileRow={TileRow}",
                            },
                        },
                    },
                    {
                        key: "^user_app:bcmv8_pet_1980_unco$",
                        options: {
                            isDisabled: false,
                            title: "Potential Evapotranspiration",
                            min: 500,
                            max: 16000,
                            units: "mm",
                            palette: {
                                name: "tree_mortality_pet",
                                handleAs: "json-fixed",
                            },
                            mappingOptions: {
                                url: "//localhost/geoserver/gwc/service/wmts?layer=user_app%3Abcmv8_pet_{Time}_unco&tilematrixset={TileMatrixSet}&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/png&TileMatrix={TileMatrix}&TileCol={TileCol}&TileRow={TileRow}",
                            },
                        },
                    },
                    {
                        key: "^user_app:bcmv8_ppt_1980_unco$",
                        options: {
                            isDisabled: false,
                            title: "Precipitation",
                            min: 0,
                            max: 5000,
                            units: "mm",
                            palette: {
                                name: "tree_mortality_ppt",
                                handleAs: "json-fixed",
                            },
                            mappingOptions: {
                                url: "//localhost/geoserver/gwc/service/wmts?layer=user_app%3Abcmv8_ppt_{Time}_unco&tilematrixset={TileMatrixSet}&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/png&TileMatrix={TileMatrix}&TileCol={TileCol}&TileRow={TileRow}",
                            },
                        },
                    },
                    {
                        key: "^user_app:bcmv8_rch_1980_unco$",
                        options: {
                            isDisabled: false,
                            title: "Recharge",
                            min: 0,
                            max: 2500,
                            units: "mm",
                            palette: {
                                name: "tree_mortality_rch",
                                handleAs: "json-fixed",
                            },
                            mappingOptions: {
                                url: "//localhost/geoserver/gwc/service/wmts?layer=user_app%3Abcmv8_rch_{Time}_unco&tilematrixset={TileMatrixSet}&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/png&TileMatrix={TileMatrix}&TileCol={TileCol}&TileRow={TileRow}",
                            },
                        },
                    },
                    {
                        key: "^user_app:bcmv8_run_1980_unco$",
                        options: {
                            isDisabled: false,
                            title: "Runoff",
                            min: 0,
                            max: 3000,
                            units: "mm",
                            palette: {
                                name: "tree_mortality_run",
                                handleAs: "json-fixed",
                            },
                            mappingOptions: {
                                url: "//localhost/geoserver/gwc/service/wmts?layer=user_app%3Abcmv8_run_{Time}_unco&tilematrixset={TileMatrixSet}&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/png&TileMatrix={TileMatrix}&TileCol={TileCol}&TileRow={TileRow}",
                            },
                        },
                    },
                    {
                        key: "^user_app:bcmv8_str_1980_unco$",
                        options: {
                            isDisabled: false,
                            title: "Soil Storage",
                            min: 0,
                            max: 25000,
                            units: "mm",
                            palette: {
                                name: "tree_mortality_str",
                                handleAs: "json-fixed",
                            },
                            mappingOptions: {
                                url: "//localhost/geoserver/gwc/service/wmts?layer=user_app%3Abcmv8_str_{Time}_unco&tilematrixset={TileMatrixSet}&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/png&TileMatrix={TileMatrix}&TileCol={TileCol}&TileRow={TileRow}",
                            },
                        },
                    },
                    {
                        key: "^user_app:bcmv8_tmn_1980_unco$",
                        options: {
                            isDisabled: false,
                            title: "Minimum Temperature",
                            min: -20,
                            max: 10,
                            units: "°C",
                            palette: {
                                name: "tree_mortality_tmn",
                                handleAs: "json-fixed",
                            },
                            mappingOptions: {
                                url: "//localhost/geoserver/gwc/service/wmts?layer=user_app%3Abcmv8_tmn_{Time}_unco&tilematrixset={TileMatrixSet}&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/png&TileMatrix={TileMatrix}&TileCol={TileCol}&TileRow={TileRow}",
                            },
                        },
                    },
                    {
                        key: "^user_app:bcmv8_tmx_1980_unco$",
                        options: {
                            isDisabled: false,
                            title: "Maximum Temperature",
                            min: 10,
                            max: 50,
                            units: "°C",
                            palette: {
                                name: "tree_mortality_tmx",
                                handleAs: "json-fixed",
                            },
                            mappingOptions: {
                                url: "//localhost/geoserver/gwc/service/wmts?layer=user_app%3Abcmv8_tmx_{Time}_unco&tilematrixset={TileMatrixSet}&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image/png&TileMatrix={TileMatrix}&TileCol={TileCol}&TileRow={TileRow}",
                            },
                        },
                    },

                    {
                        key: "^user_app:raster_nature_ssp*",
                        options: {
                            min: 2012,
                            max: 2100,
                            units: " ",
                            group: "Reef Mortality",
                            palette: {
                                name: "reef",
                                handleAs: "json-fixed",
                            },
                        },
                    },

                    {
                        key: "^user_app:kelp_*",
                        options: {
                            isDisabled: true,
                            handleAs: "vector_geojson",
                            url: "http://localhost/geoserver/ows?service=WFS&version=1.1.0&request=GetFeature&typeNames=user_app:kelp_{Time}14&outputFormat=application/json&exceptions=application/json",
                            clusterVector: true,
                            mappingOptions: {
                                displayProps: {
                                    size: "area",
                                    color: "biomass",
                                    minScale: 0,
                                    maxScale: 20000,
                                    minSize: 7,
                                    maxSize: 30,
                                    clusterRange: 40,
                                    palette: "YlOrRd",
                                },
                            },
                            min: 0,
                            max: 20000,
                            palette: {
                                name: "YlOrRd",
                                handleAs: "dynamic",
                            },
                            updateParameters: {
                                time: true,
                            },
                            timeFormat: "YYYYMM _r_ month,+1,%3,-1",
                            urlFunctions: {
                                openlayers: "kvpTimeParam",
                                cesium: "kvpTimeParam",
                            },
                            units: "Kg",
                            metadata: {
                                hoverDisplayProps: {
                                    location: {
                                        lat: "latitude",
                                        lon: "longitude",
                                    },
                                    altProps: [
                                        {
                                            label: "Biomass (wet Kg)",
                                            value: "biomass",
                                        },
                                        {
                                            label: "Area (m^2)",
                                            value: "area",
                                        },
                                    ],
                                },
                            },
                        },
                    },
                    {
                        key: "user_app:kelp_19840214",
                        options: {
                            isDisabled: false,
                            title: "Kelp Biomass",
                            group: "Kelp Mortality",
                        },
                    },
                ],
            },
            {
                url: "default-data/user_app/layers.json",
                type: "json",
            },
        ],
    },
};
