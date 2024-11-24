# GSCAN Infra Vision AEC Hackathon

#### Problem

Efficiently render large (10 to 100s GBs) voxel (like a minecraft model) datasets in the browser.

#### Why?

[GSCAN](https://www.gscan.eu/) uses [Muon tomography](https://en.wikipedia.org/wiki/Muon_tomography) to image the inside (like X-ray) of infrastructure assests such as bridges. 

The results give insight in the location of rebars and potential defects in the reinforced concrete.

Infrastructure asset owners / managers want to be able to easily view the muon tomography results. For this GScan wants to create a web app.

The problem is that the result muon tomography voxel models are very large (10 to 100s GBs), and can therefore not be loaded into the browser completely.

#### Solution

1. [Convert voxel data to NIFTI](#1-convert-voxel-data-to-nifti)
2. [Precomputing slices of voxel data](#2-precomputing-slices-of-voxel-data)
3. [Serving the precomputed slices on an HTTP server](#3-serving-the-precomputed-slices-on-an-http-server)
4. [Run the GScan Infra Vision + `neuroglancer` frontend](#4-run-the-gscan-infra-vision--neuroglancer-frontend)

# 1. Convert voxel data to NIFTI

A tool to generate generate a NIfTI (nii.gz) file format from 3D numpy array where each voxel contains some value. It   does not matter if it's normalized, represents scattering angles or something else - this is only a detail which will only have an effect on later visualization, not the NIfTI generation.

```bash
cd ./python/nifti-generator
uv sync
uv run nifti-generator -i input_reconstruction.pickle
```

#### [NIfTI Generator README.md](./python/nifti-generator/README.md)

# 2. Precomputing slices of voxel data

A comprehensive guide on precomputing the voxel model slices can be found in the [precomputation README.md](./python/precomputation/README.md)

To run the precomputation bash script:

```bash
cd ./python/nifti-generator
uv sync
bash precompute.sh <input_nifti_file_path> <output_dir_path>
```

# 3. Serving the precomputed slices on an HTTP server or cloud storage

Static file hosting is fine.


# 4. Run the GScan Infra Vision + [`neuroglancer`](https://github.com/google/neuroglancer) frontend

Frontend code for visualizing slices of large voxel spaces

## Requirements

* [Node 20](https://nodejs.org/en)

## Getting started

Clean install of Node packages:
1. `npm ci`

There is a gotcha with running the frontend  

2. `npm run build`
3. `npm run preview`

## Developing

* `npm ci`
* `npm run dev`
