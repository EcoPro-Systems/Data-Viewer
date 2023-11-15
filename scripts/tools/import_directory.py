import re
import os
import sys
import argparse
import requests
from tqdm import tqdm
from shutil import copytree

from geo.Geoserver import Geoserver


def get_args():
    parser = argparse.ArgumentParser(
        formatter_class=argparse.RawDescriptionHelpFormatter,
        description="Upload all the files in a directory to GeoServer",
    )
    parser.add_argument(
        "-i", "--input", help="Directory with the input files", default=os.getcwd()
    )
    parser.add_argument(
        "-t",
        "--type",
        help="The type of data",
        choices=["tiff", "geotiff", "gtiff", "shapefile", "shp"],
        default="tiff",
    )
    parser.add_argument(
        "-s",
        "--style",
        help="The name of the SLD style to use for these layers (raster only)",
        default=None,
    )
    parser.add_argument(
        "--geoserver-data-dir",
        dest="geoserver_data_dir",
        help="Path to the geoserver_data directory",
        default=os.path.join(os.getcwd(), "geoserver_data"),
    )
    parser.add_argument(
        "-f",
        "--filter",
        help="Regex to match filenames for selection (ignored for shapefiles)",
        default=r".tiff$",
    )
    parser.add_argument(
        "-w",
        "--workspace",
        help="The workspace",
        default="user_app",
    )
    parser.add_argument("--force", help="Continue despite errors.", action="store_true")
    parser.add_argument(
        "-g",
        "--geoserver",
        help="URL to geoserver instance",
        default="http://localhost:8080/geoserver",
    )
    parser.add_argument(
        "-u", "--username", help="admin username for geoserver", default="admin"
    )
    parser.add_argument(
        "-p", "--password", help="admin password for geoserver", default=None
    )
    parser.add_argument(
        "-e",
        "--env-password",
        dest="env_password",
        help="admin password for geoserver environment variable",
        default="ECOPRO_GEOSERVER_ADMIN_PASS",
    )
    return parser.parse_args()


def main():
    args = get_args()

    # get admin password from ENV or args
    user_pass = os.environ.get(args.env_password, args.password)

    # check input directory
    input_dir = args.input
    if not os.path.isdir(input_dir):
        print("ERROR: Input directory not found")
        sys.exit(1)

    dtype = args.type.lower()
    if dtype in ["tiff", "gtiff", "geotiff"]:
        # setup geoserver connection
        geo = Geoserver(args.geoserver, username=args.username, password=user_pass)

        # check if we had success
        if not geo:
            print("ERROR: Could not connect to GeoServer")
            sys.exit(1)

        # ensure a style is specified
        if args.style is None:
            print("ERROR: No style specified")
            sys.exit(1)

        # find files to upload
        for filename in tqdm(os.listdir(input_dir)):
            fpath = os.path.join(input_dir, filename)
            if os.path.isfile(fpath) and (
                args.filter is None or re.search(args.filter, filename)
            ):
                layer_name = "_".join(os.path.basename(filename).split(".")[:-1])

                # create a datastore and layer
                geo.create_coveragestore(
                    layer_name=layer_name, path=fpath, workspace=args.workspace
                )

                # link layer with style
                geo.publish_style(
                    layer_name=layer_name,
                    style_name=args.style,
                    workspace=args.workspace,
                )
    elif dtype in ["shapefile", "shp"]:
        # construct the data destination and validate it
        input_basename = os.path.basename(input_dir)
        gdata_dir = os.path.join(args.geoserver_data_dir, "data", args.workspace)
        if not os.path.isdir(gdata_dir):
            print(f"ERROR: {gdata_dir} is not a directory")
            sys.exit(1)

        dest_dir = os.path.join(gdata_dir, input_basename)
        if os.path.isdir(dest_dir) and not args.force:
            print(f"ERROR: {dest_dir} already exists")
            sys.exit(1)

        # copy the data into GeoServer's area of knowledge
        print("copying data...")
        copytree(input_dir, dest_dir, dirs_exist_ok=True)

        # construct headers/parms for the query
        headers = {
            "Content-type": "text/plain",
        }
        params = {
            "configure": "all",
        }
        data = f"file:///opt/geoserver_data/data/{args.workspace}/{input_basename}"
        url = f"{args.geoserver}/rest/workspaces/{args.workspace}/datastores/shapefiles/external.shp"

        print("querying geoserver...")
        response = requests.put(
            url,
            params=params,
            headers=headers,
            data=data,
            auth=(args.username, user_pass),
        )
        if not response.status_code == 201:
            print("ERROR: Bad response from server")
            try:
                print(response.text())
                response.raise_for_status()
            except:
                pass
            finally:
                sys.exit(1)
        else:
            print("done.")
    else:
        print("ERROR: Unrecognized type")
        sys.exit(1)


if __name__ == "__main__":
    main()
