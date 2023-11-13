#!/usr/bin/env python3

# Always prefer setuptools over distutils
from setuptools import setup, find_packages

setup(
    name="ecopro_tools",
    version="1.0.0",
    description="A collection of command line scripts that are useful for EcoPro Data Viewer.",
    package_dir={"": "scripts/tools/"},
    packages=find_packages(),
    python_requires=">=3.8, <4",
    install_requires=[
        "GDAL == 3.*",
        "geoserver-rest == 2.5.1",
        "matplotlib == 3.*",
        "pandas == 2.*",
        "numpy == 1.*",
        "tqdm == 4.*",
        "requests == 2.*",
    ],
    extras_require={  # Optional
        "dev": [
            "flake8 == 4.*",
            "black >= 22.1.0",
        ],
    },
    entry_points={  # Optional
        "console_scripts": [
            "convert_kelp_biomass=convert_kelp_biomass:main",
            "import_directory=import_directory:main",
        ],
    },
)
