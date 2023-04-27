export const EXTRACT_DATA_OL = "extractData_OL";
export const EXTRACT_DATA_CS = "extractData_CS";

export const TREE_MORTALITY_URL = "tree_mortality_url";

export const NO_DATA = "No Data";
export const UNKNOWN = "Unknown";

export const ADDITIONAL_PROJECTIONS = {
    NAD83: {
        code: "EPSG:3310",
        proj4Def:
            "+proj=aea +lat_0=0 +lon_0=-120 +lat_1=34 +lat_2=40.5 +x_0=0 +y_0=-4000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs",
        extent: [-5198207.57, -1564155.99, 6820717.07, 5283999.14],
        aliases: ["NAD83", "California Albers", "urn:ogc:def:crs:EPSG::3310"],
    },
};
