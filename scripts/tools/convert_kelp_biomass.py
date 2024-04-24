import os
import sys
import datetime
import subprocess
import numpy
import json
import uuid
import pandas as pd
import geopandas
from time import sleep
from shapely.geometry import Point
from osgeo import gdal
import argparse
from tqdm import tqdm


def get_args():
    parser = argparse.ArgumentParser(
        formatter_class=argparse.RawDescriptionHelpFormatter,
        description="Convert kelp data from NetCDF to GeoTIFF files",
    )
    parser.add_argument(
        "-i",
        "--input",
        help="The input file",
        default="LandsatKelpBiomass_2022_Q4_withmetadata.nc",
    )
    parser.add_argument(
        "-o",
        "--output",
        help="The directory to output all the files",
    )
    parser.add_argument(
        "-v",
        "--vars",
        help="List of variables to parse from the data file",
        nargs="+",
        default=["biomass", "biomass_se", "area", "area_se"],
    )
    parser.add_argument(
        "--primaryvar",
        help="Primary variable",
        default="biomass",
    )
    parser.add_argument(
        "--format",
        help="Output format",
        choices=["shapefile", "shp", "geojson", "json", "mbtiles"],
        default="shp",
    )
    parser.add_argument(
        "--fixed", help="Fix the day value to a specified string", default=None
    )
    parser.add_argument(
        "--suffix",
        help="Filename: kelp_[suffix]_[date]",
    )
    parser.add_argument(
        "--limit",
        help="Limit files to this amount. -1 for all time slices",
        type=int,
        default=-1,
    )
    parser.add_argument(
        "--start",
        help="The earliest time to include",
        type=lambda s: datetime.datetime.strptime(s, "%Y-%m-%d"),
    )
    parser.add_argument(
        "--end",
        help="The latest time to include",
        type=lambda s: datetime.datetime.strptime(s, "%Y-%m-%d"),
    )
    parser.add_argument(
        "--nodata",
        help="The no data value",
        default=-1,
    )
    parser.add_argument(
        "--preserve",
        help="Preserve intermediate files",
        action="store_true",
    )
    return parser.parse_args()


def serial_date_to_string(srl_no, fixed_date):
    new_date = datetime.datetime(1970, 1, 1, 0, 0) + datetime.timedelta(srl_no - 1)
    format_str = f"%Y%m{fixed_date}" if fixed_date else "%Y%m%d"
    return (new_date.strftime(format_str), new_date)


def main():
    args = get_args()

    input_file = os.path.abspath(args.input)
    output_dir = args.output
    variable_keys = args.vars
    primary_var = args.primaryvar
    fixed_date = args.fixed
    suffix = args.suffix
    limit = args.limit
    start_date = args.start
    end_date = args.end
    no_data_val = args.nodata
    file_format = args.format
    preserve = args.preserve

    if not os.path.isfile(input_file):
        print("Input file does not exist")
        sys.exit(1)

    # read data file
    ds = gdal.OpenEx(input_file, gdal.OF_MULTIDIM_RASTER)
    rootGroup = ds.GetRootGroup()

    # extract variables
    var_time = rootGroup.OpenMDArray("time")
    var_lat = rootGroup.OpenMDArray("latitude")
    var_lon = rootGroup.OpenMDArray("longitude")
    var_targets = [(key, rootGroup.OpenMDArray(key)) for key in variable_keys]

    # read data arrays
    data_lat = var_lat.ReadAsArray(
        buffer_datatype=gdal.ExtendedDataType.Create(gdal.GDT_Float64)
    )
    data_lon = var_lon.ReadAsArray(
        buffer_datatype=gdal.ExtendedDataType.Create(gdal.GDT_Float64)
    )
    data_time = var_time.ReadAsArray(
        buffer_datatype=gdal.ExtendedDataType.Create(gdal.GDT_Float64)
    )
    data_targets = [
        (
            var_t[0],
            var_t[1].ReadAsArray(
                buffer_datatype=gdal.ExtendedDataType.Create(gdal.GDT_Float64)
            ),
        )
        for var_t in var_targets
    ]

    # create output area
    if not output_dir:
        short_id = str(uuid.uuid4())[:6]
        output_dir = f"./kelp_conversion_{short_id}"
    output_dir = os.path.abspath(output_dir)
    if not os.path.isdir(output_dir):
        os.mkdir(output_dir)

    # iterate through the variable, assume its shape is (time,station)
    # for idx in tqdm(range(1)):
    max_iter = limit if limit > -1 else data_time.shape[0]
    for idx in tqdm(range(max_iter)):
        # get time
        val_time = data_time[idx]
        (time_str, date) = serial_date_to_string(val_time, fixed_date)
        if (start_date and date < start_date) or (end_date and date > end_date):
            sleep(0.1)
            continue

        # construct a data frame
        data_dict = {"longitude": data_lon, "latitude": data_lat}
        for data_t in data_targets:
            data_dict[data_t[0]] = data_t[1][idx]
        data_frame = pd.DataFrame(data=data_dict)

        # mask out useless data points
        masks = [data_frame[key] > 0.0 for key in [primary_var]]
        data_frame = data_frame[masks[0]]

        # add a geometry column with a shapely point
        data_frame["geometry"] = data_frame.apply(
            lambda x: Point((x.longitude, x.latitude)), axis=1
        )

        # convert to a GeoDataFrame
        data_frame = geopandas.GeoDataFrame(data_frame, geometry="geometry")
        data_frame.crs = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs"

        # construct base output name
        output_file = os.path.join(
            output_dir, f"kelp_{suffix}_{time_str}" if suffix else f"kelp_{time_str}"
        )

        # dump file
        if file_format in ["shapefile", "shp"]:
            data_frame.to_file(f"{output_file}.shp", driver="ESRI Shapefile")
        elif file_format in ["geojson", "json", "mbtiles"]:
            data_frame.to_file(f"{output_file}.geojson", driver="GeoJSON")

            # use tippecanoe to convert to mbtiles
            if file_format == "mbtiles":
                accu_args = []
                # for var_t in var_targets:
                #     accu_args.append(f"--accumulate-attribute={var_t[0]}:sum")
                #     accu_args.append(f"--accumulate-attribute={var_t[0]}_mean:mean")
                # subprocess.run(
                #     [
                #         "tippecanoe",
                #         "-q",
                #         "-o",
                #         f"{output_file}.mbtiles",
                #         "-s",
                #         "EPSG:4326",
                #         "-r1",
                #         "-z17",
                #         "-kg",
                #         "--cluster-distance=20",
                #         *accu_args,
                #         f"{output_file}.geojson",
                #     ],
                #     check=True,
                # )
                subprocess.run(
                    [
                        "tippecanoe",
                        "-q",
                        "-o",
                        f"{output_file}.mbtiles",
                        "-s",
                        "EPSG:4326",
                        "-zg",
                        "--maximum-tile-features=250",
                        "--drop-densest-as-needed",
                        "--extend-zooms-if-still-dropping",
                        f"{output_file}.geojson",
                    ],
                    check=True,
                )
                if not preserve:
                    os.remove(f"{output_file}.geojson")
        else:
            print(f"ERROR: unknown format - {file_format}")
    print(f"done.\noutput: {output_dir}")


if __name__ == "__main__":
    main()
