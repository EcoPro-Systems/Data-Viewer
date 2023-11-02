import re
import os
import sys
import argparse
from tqdm import tqdm

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
        "-s",
        "--style",
        help="The name of the SLD style to use for these layers",
        default=None,
    )
    parser.add_argument(
        "-f",
        "--filter",
        help="Regex to match filenames for selection",
        default=r".tiff$",
    )
    parser.add_argument(
        "-w",
        "--workspace",
        help="The workspace",
        default="user_app",
    )
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
    admin_pass = os.environ.get(args.env_password, args.password)

    # setup geoserver connection
    geo = Geoserver(args.geoserver, username=args.username, password=admin_pass)

    # check if we had success
    if not geo:
        print("ERROR: Could not connect to GeoServer")
        sys.exit(1)

    # check input directory
    input_dir = args.input
    if not os.path.isdir(input_dir):
        print("ERROR: Input directory not found")
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
            layer_name = os.path.basename(filename).split(".")[0]

            # create a datastore and layer
            geo.create_coveragestore(
                layer_name=layer_name, path=fpath, workspace=args.workspace
            )

            # link layer with style
            geo.publish_style(
                layer_name=layer_name, style_name=args.style, workspace=args.workspace
            )


if __name__ == "__main__":
    main()
