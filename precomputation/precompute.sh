#!/bin/bash

input_nifti_file_path='../data/aec_hackathon_gscan_example_data.nii'
output_dir_path='./output'
rm -rf $output_dir_path

# Generate info
volume-to-precomputed \
  --generate-info \
  $input_nifti_file_path \
  $output_dir_path/

# Updating data_type
jq '.data_type = "uint8"' $output_dir_path/info_fullres.json >tmp.json
mv tmp.json $output_dir_path/info_fullres.json

# Generate scales info
generate-scales-info $output_dir_path/info_fullres.json $output_dir_path/

# Precomputation
volume-to-precomputed $input_nifti_file_path $output_dir_path/

# Computing scales
compute-scales $output_dir_path/

# Flattening
flatten_directory() {
  local dir="$1"
  find "$dir" -type f | while read -r file; do
    # get the relative path, replace '/' with '_', and move file to root of input_dir
    relative_path="${file#"$dir"/}"
    flattened_name="${relative_path//\//_}"
    mv "$file" "$dir/$flattened_name"
  done

  # remove empty directories
  find "$dir" -type d -empty -delete
}

folders=$(find "$output_dir_path" -maxdepth 1 -mindepth 1 -type d)
for folder in $folders; do
  echo "Flatten folder: $folder"
  flatten_directory "$folder"
done

# Unzipping
decompress_gz_in_folder() {
  local dir="$1"
  echo "Decompressing folder: $dir"
  find "$dir" -type f -name '*.gz' -exec gzip -d {} +
}

# iterate over all directories
find . -type d | while read -r folder; do
  decompress_gz_in_folder "$folder"
done
