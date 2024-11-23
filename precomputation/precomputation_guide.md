# Guide to generating precomputed data
This is a guide on generating precomputed data from NIFTI files.

## Input format
The input data should be in NIFTI format. It suffices if it's gzipped
(`.gzip`), so unzipping is unnecessary.

## Output format
The precomputed files chunks are generated in a flattened hierarchy. That is,
for a given scale (e.g. 80mm), the files in the directory for that scale are listed
directly. For example:
```
0-64_0-64_0-64
0-64_0-64_64-126
0-64_64-126_0-64
0-64_64-126_64-126
64-119_0-64_0-64
64-119_0-64_64-126
64-119_64-126_0-64
64-119_64-126_64-126
```

Each filename represents the subvolume ranges in each coordinate, so
`64-119_0-64_64-126` means the subvolume spanning
- `[64, 119)` in the x-coordinate
- `[0-64)` in the y-coordinate
- `[64, 126)` in the z-coordinate

Additionally, the `data_type` in the `info` file must be `uint8`, as specified.
[Source](https://github.com/google/neuroglancer/blob/master/src/datasource/precomputed/volume.md):
> The subvolume data for the chunk is encoded as a 1- or 3-channel JPEG image.
> To use this encoding, the "data_type" must be "uint8" and "num_channels" must
> be 1 or 3.


## Procedure

### Precomputation
For the precomputation, we make use of `neuroglancer-scripts`
([link](https://neuroglancer-scripts.readthedocs.io/en/latest/index.html)).

We base our approach on this
[guide](https://neuroglancer-scripts.readthedocs.io/en/latest/examples.html#jubrain).


1. Generating info
```bash
volume-to-precomputed \
    --generate-info \
    <input-nifti-file-path>.nii.gz \
    <output-dir-name>/`
```

*CRUCIAL*: we need to change `data_type` to `uint8` here.

```bash
jq '.data_type = "uint8"' <output-dir-name>/info_fullres.json > tmp.json && mv tmp.json <output-dir-name>/info_fullres.json
```
2. Generating scales info.
```bash
generate-scales-info <output-dir-name>/info_fullres.json <output-dir-name>/
```
3. Doing the precomputation
- ```bash
  volume-to-precomputed --flat --no-gzip <input-nifti-file-path>.nii.gz <output-dir-name>/
  ```
  1. The flag `--flat` ensures that the file tree of each scale is flattened, so that
  the output files are in the format `scale/64-119_0-64_64-126`, instead of
  `scale/64-119/0-64/64-126` (nested)
  2. The flag `--no-gzip` ensures that the chunks are not compressed.


4. Computing scales
- ```bash
  compute-scales --flat --no-gzip <output-dir-name>/
  ```
  1. The flag `--flat` ensures that the file tree of each scale is flattened, so that
  the output files are in the format `scale/64-119_0-64_64-126`, instead of
  `scale/64-119/0-64/64-126` (nested)
  2. The flag `--no-gzip` ensures that the chunks are not compressed.

5. (Optional) Converting the raw chunks to compressed JPEG
    1. `generate-scales-info --encoding=jpeg <output-dir-name>/info jpeg/`
        1. This produces the following warning, which we do not understand at
           the moment.
             > WARNING: the source info JSON contains multiple scales, only the
             > first one will be used.
    2. `convert-chunks --flat <output-dir-name>/ jpeg/`
