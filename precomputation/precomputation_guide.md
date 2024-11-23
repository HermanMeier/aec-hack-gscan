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
2. Generating scales info
```bash
generate-scales-info <output-dir-name>/info_fullres.json <output-dir-name>/
3. Doing the precomputation
```bash
volume-to-precomputed <input-nifti-file-path>.nii.gz <output-dir-name>/
```
4. Computing scales
```bash
compute-scales <output-dir-name>/
```

Technically, you can also supply a `--flat` option to `volume-to-precomputed`,
which should generate a flat file tree as desired. But, even if that doesn't
work, the next step shows how to flatten the file tree.

It also may be the case that this step produces `.gzip` chunk files. That may
have something to do with the fact that we use a `.gzip` NIFTI input file.


### Flattening
This step shows how to flatten a scale directory. For example, given
the following file tree:

```
80mm
  |-0-64
  |  |-0-64
  |  |  |-0-64.gz
  |  |  |-64-126.gz
  |  |-64-126
  |  |  |-0-64.gz
  |  |  |-64-126.gz
  |-64-119
  |  |-0-64
  |  |  |-0-64.gz
  |  |  |-64-126.gz
  |  |-64-126
  |  |  |-0-64.gz
  |  |  |-64-126.gz
```

we can produce the desired output running the following script `flatten.sh` by
running `./flatten.sh 80mm/`

```bash
#!/bin/bash

# check if a directory is provided
if [ -z "$1" ]; then
  echo "usage: $0 <directory>"
  exit 1
fi

input_dir="$1"

# verify the directory exists
if [ ! -d "$input_dir" ]; then
  echo "error: '$input_dir' is not a valid directory."
  exit 1
fi

# function to flatten files
flatten_directory() {
  local dir="$1"
  find "$dir" -type f | while read -r file; do
    # get the relative path, replace '/' with '_', and move file to root of input_dir
    relative_path="${file#$dir/}"
    flattened_name="${relative_path//\//_}"
    mv "$file" "$dir/$flattened_name"
  done

  # remove empty directories
  find "$dir" -type d -empty -delete
}

# execute the flattening
flatten_directory "$input_dir"

echo "flattening completed."
```


### Unzipping

In case the files are unzipped, we can simply run the oneliner
```bash
find 80mm/ -type f -name '*.gz' -exec gzip -d {} +
```


