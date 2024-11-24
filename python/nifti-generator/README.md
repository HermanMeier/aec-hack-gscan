# NIfTI Generator

A tool to generate generate a NIfTI (nii.gz) file format from 3D numpy array where each voxel contains some value. It  
does not matter if it's normalized, represents scattering angles or something else - this is only a detail which  
will only have an effect on later visualization, not the NIfTI generation.

### Getting started

```bash
cd ./python/nifti-generator
uv sync
uv run nifti-generator -i input_reconstruction.pickle
```
