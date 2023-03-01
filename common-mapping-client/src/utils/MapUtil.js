import MapUtilCore from "_core/utils/MapUtil";
import MiscUtil from "_core/utils/MiscUtil";
import * as appStrings from "constants/appStrings";
import * as appStringsCore from "_core/constants/appStrings";

export default class MapUtil extends MapUtilCore {
    static mapColorToValue(options) {
        const { colorData, palette, handleAs, units } = options;

        // extract value
        let value = appStrings.NO_DATA;
        const noData = parseInt(colorData[3]) === 0;
        if (!noData) {
            const paletteValueList = palette.get("values");
            const rgbColor = `rgba(${colorData.slice(0, 3).join(",")})`;
            const hexColor = MiscUtil.getHexFromColorString(rgbColor);
            if (handleAs === appStringsCore.COLORBAR_JSON_RELATIVE) {
                const firstColorEntry = paletteValueList.findEntry((entry) => {
                    return entry && entry.get("color") === hexColor;
                });
                if (typeof firstColorEntry !== "undefined") {
                    const min = parseFloat(layer.get("min"));
                    const max = parseFloat(layer.get("max"));

                    const firstIndex = firstColorEntry[0];
                    const firstColorMap = firstColorEntry[1];

                    // 0 index is mapped to no-data color
                    if (firstIndex === 1) {
                        firstIndex = 0;
                        firstColorMap = paletteValueList.get(0);
                    }

                    const firstScale = firstColorMap.get("value");
                    const firstValue = (min + (max - min) * parseFloat(firstScale)).toFixed(2);

                    const lastColorEntry = paletteValueList.findLastEntry((entry) => {
                        return entry && entry.get("color") === hexColor;
                    });
                    const lastIndex = lastColorEntry[0];
                    const lastColorMap = lastColorEntry[1];

                    const lastScale = lastColorMap.get("value");
                    const lastValue = (min + (max - min) * parseFloat(lastScale)).toFixed(2);

                    if (firstIndex === 0) {
                        value = `<= ${lastValue}`;
                    } else if (lastIndex === paletteValueList.size - 1) {
                        value = `>= ${firstValue}`;
                    } else {
                        const prevColorMap = paletteValueList.get(firstIndex - 1);
                        if (typeof prevColorMap !== "undefined") {
                            const prevScale = prevColorMap.get("value");
                            const prevValue = (min + (max - min) * parseFloat(prevScale)).toFixed(
                                2
                            );
                            value = `${prevValue} - ${lastValue}`;
                        } else {
                            prevColorMap = paletteValueList.get(firstIndex);
                            const prevScale = prevColorMap.get("value");
                            const prevValue = (min + (max - min) * parseFloat(prevScale)).toFixed(
                                2
                            );
                            value = `<= ${prevValue}`;
                        }
                    }

                    value = `${value}${units}`;
                }
            } else {
                const colorEntry = paletteValueList.findLastEntry((entry) => {
                    return entry && entry.get("color") === hexColor;
                });
                if (typeof colorEntry !== "undefined") {
                    const colorMap = colorEntry[1];
                    value = `${colorMap.get("value")}${units}`;
                } else {
                    value = appStrings.UNKNOWN;
                }
            }
        }
        return value;
    }
}
