import Immutable from "immutable";
import moment from "moment";
import TileHandlerCore from "_core/utils/TileHandler";
import * as appStrings from "constants/appStrings";
import MiscUtil from "_core/utils/MiscUtil";

export default class TileHandler extends TileHandlerCore {
    static getUrlFunction(functionString = "") {
        switch (functionString) {
            case appStrings.TREE_MORTALITY_URL:
                return (options) => {
                    return this._treeMortalityUrl(options);
                };
            case appStrings.KVP_TIME_PARAM_URL:
                return (options) => {
                    return this._kvpTimeParamUrlWms(options);
                };
            default:
                return super.getUrlFunction.call(this, functionString);
        }
    }

    static getTileFunction(functionString = "") {
        switch (functionString) {
            case appStrings.EXTRACT_DATA_OL:
                return this._dataExtraction_OL;
            case appStrings.EXTRACT_DATA_CS:
                return this._dataExtraction_CS;
            default:
                return super.getTileFunction.call(this, functionString);
        }
    }

    static _treeMortalityUrl(options) {
        let { layer, mapLayer, url } = options;
        url = super._defaultKVPUrlWmts.call(this, options);

        let timeStr =
            typeof mapLayer.get === "function" ? mapLayer.get("_layerTime") : mapLayer._layerTime;
        if (
            layer.getIn(["mappingOptions", "timeAliases"]) &&
            typeof layer.getIn(["mappingOptions", "timeAliases", timeStr]) !== "undefined"
        ) {
            timeStr = layer.getIn(["mappingOptions", "timeAliases", timeStr]);
            if (url.indexOf("{") >= 0) {
                url = url
                    .replace("{Time}", timeStr)
                    .replace("{TIME}", timeStr)
                    .replace("{time}", timeStr);
            } else {
                url = `${url}&TIME=${timeStr}`;
            }
            console.log(url);
            return url;
        } else {
            return undefined;
        }
    }

    static _kvpTimeParamUrlWms(options) {
        let { url, layer, mapDate } = options;

        let timeStr = MiscUtil.formatDateWithStr(mapDate, layer.get("timeFormat"));
        if (typeof timeStr !== "undefined") {
            if (url.indexOf("{") >= 0) {
                url = url.replace("{Time}", timeStr);
            } else {
                url = url + "&TIME=" + timeStr;
            }
        }

        return url;
    }

    static _dataExtraction_OL(options) {
        const { layer, mapLayer, tile, url, defaultFunc } = options;

        // state valued found in ol source
        const STATE_LOADING = 1;
        const STATE_LOADED = 2;

        // call the function that handles the tile load event.
        // this will clear the listeners for the image load event
        // which will allow us to be more in control of when
        // change events occur that will cause the tile be drawn on
        // the map.
        tile.handleImageLoad_();

        // make sure we have a way to get the img node
        if (typeof tile._origGetImageFunc === "undefined") {
            tile._origGetImageFunc = tile.getImage;

            // do NOT use an arrow function (loses context)
            tile.getImage = function (optContext) {
                if (typeof this._processedImg !== "undefined") {
                    return this._processedImg;
                }

                return this._origGetImageFunc(optContext);
            };

            // get the image node
            let img = tile._origGetImageFunc(tile);

            // load in the image with crossOrigin allowances
            tile.state = STATE_LOADING;
            TileHandler._loadImage({
                node: img,
                url: tile.src_,
                extractData: true,
                filterFunction: layer.get("filterFunction"),
            })
                .then((options) => {
                    // store the processed img and data
                    tile._processedImg = options.img;
                    tile._processedImg.id = "image_tile_" + tile.getTileCoord().join("-");
                    tile._imgData = options.imgData;
                    tile.state = STATE_LOADED;
                    mapLayer.changed();
                    mapLayer.getSource().changed();
                })
                .catch((err) => {
                    console.warn("Error in TileHandler_Extended._dataExtraction_OL:", err);
                });

            return img;
        }

        // return what was originally created
        return options.processedTile;
    }

    static _dataExtraction_CS(options) {
        // get some object references
        let { layer, mapLayer, tileCoord, url, success, fail } = options;

        // load in the image with crossOrigin allowances
        TileHandler._loadImage({
            url: url,
            extractData: true,
            filterFunction: layer.get("filterFunction"),
        })
            .then((options) => {
                // check if we have a store already
                if (typeof mapLayer._extractedTileData === "undefined") {
                    mapLayer._extractedTileData = Immutable.Map({});
                }

                // store the processed img
                mapLayer._extractedTileData = mapLayer._extractedTileData.set(
                    tileCoord.join(","),
                    Immutable.Map({ imgData: options.imgData, img: options.img })
                );

                // resolve the img
                success(options.img);
            })
            .catch((err) => {
                console.warn("Error in TileHandler_Extended._dataExtraction_CS:", err);
                fail(err);
            });
    }

    /* helpers */

    static _extractImageData(img, canvas = false) {
        if (!canvas) {
            //create a new canvas element
            canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
        }

        // draw the loaded image on the canvas
        let context = canvas.getContext("2d");
        context.drawImage(img, 0, 0);

        // extract the image data from the canvas as data
        let imgData = context.getImageData(0, 0, canvas.width, canvas.height);

        // send back the canvas and data
        return { img: canvas, imgData };
    }

    static _loadImage(options) {
        const url = options.url;
        const node = options.node;
        const extractData = options.extractData;
        const filterFunction = options.filterFunction;

        // make this async
        return new Promise((resolve, reject) => {
            const img = node || new Image();
            // wait for the load
            img.onload = () => {
                let retImg = img;
                let imgData = undefined;

                // extract data if needed
                if (extractData) {
                    let extractedData = TileHandler._extractImageData(retImg);
                    retImg = extractedData.img;
                    imgData = extractedData.imgData;
                }

                if (filterFunction) {
                    TileHandler._processImage({ canvas: retImg, filter: filterFunction });
                }

                // send the image back up
                resolve({ img: retImg, imgData });
            };

            // handle a failed request
            img.onerror = (err) => {
                reject(err);
            };

            // allow for cross-origin data
            img.crossOrigin = "Anonymous";

            const imgUrl = url || node.src;

            if (typeof imgUrl !== "undefined") {
                img.src = imgUrl;
            } else {
                reject("No URL available");
            }
        });
    }

    static _processImage(options) {
        let canvas = options.canvas;
        let imgData = options.imgData;

        // check if we don't have image data and canvas is actually an <image />
        if (typeof imgData === "undefined" && typeof canvas.getContext === "undefined") {
            let extractedData = TileHandler._extractImageData(canvas);
            canvas = extractedData.img;
            imgData = extractedData.imgData;
        } else if (typeof imgData === "undefined") {
            imgData = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height);
        }

        // apply filter to data
        let processedData = TileHandler._applyFilter(imgData, options.filter);

        // put it back on the canvas
        canvas.getContext("2d").putImageData(processedData, 0, 0);
    }

    static _applyFilter(imgData, filterFunction) {
        let data = imgData.data; // get the Uint8Array of data
        let newData = new Uint8ClampedArray(imgData.data.length); // store in a new clamped array
        let octets = imgData.width * imgData.height * 4; // each pixel of data covers 4 indices
        // iterate over each pixel
        for (let i = 0; i < octets; i += 4) {
            // Get indices of pixel n and pixel n+1
            let rIndex = i + 0;
            let gIndex = i + 1;
            let bIndex = i + 2;
            let aIndex = i + 3;
            let pixel = [data[rIndex], data[gIndex], data[bIndex], data[aIndex]];

            // Calculate value of new pixel
            let newPixel = filterFunction(pixel);
            newData[rIndex] = newPixel[0];
            newData[gIndex] = newPixel[1];
            newData[bIndex] = newPixel[2];
            newData[aIndex] = newPixel[3];
        }

        return new ImageData(newData, imgData.width, imgData.height);
    }
}
