# NIfTI Generator

A tool to generate generate a NIfTI (nii.gz) file format from 3D numpy array where each voxel contains some value. It  
does not matter if it's normalized, represents scattering angles or something else - this is only a detail which  
will only have an effect on later visualization, not the NIfTI generation.

### Prerequisites

- Python 3.11
- [Poetry](https://python-poetry.org/docs/#installing-with-pipx)

## Installing poetry dependencies

* `poetry install`

## Running Using Poetry

Run the following commands in the same folder as this README

* `poetry install`
* `poetry run nifti-generator -i input_reconstruction.pickle`
    * For more options, see:`poetry run nifti-generator --help