#!/bin/bash

set -euo pipefail
IFS=$'\n\t'

log() {
  local level="$1"
  local message="$2"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$level] $message"
}

error_exit() {
  local message="$1"
  log "ERROR" "$message"
  exit 1
}

check_command() {
  command -v "$1" >/dev/null 2>&1 || error_exit "Required command '$1' not found. Please install it."
}

# verify required commands are available
for cmd in volume-to-precomputed jq generate-scales-info compute-scales gzip find mv; do
  check_command "$cmd"
done

# display help if insufficient arguments are provided
if [ "$#" -lt 2 ]; then
  echo "Usage: $0 <input_nifti_file_path> <output_dir_path>"
  echo
  echo "<input_nifti_file_path>: Path to the input NIfTI file (e.g., /data/input_data.nii)"
  echo "<output_dir_path>: Path to the output directory where processed data will be stored"
  exit 1
fi

# assign input arguments
input_nifti_file_path="$1"
output_dir_path="$2"

if [ ! -f "$input_nifti_file_path" ]; then
  error_exit "Input NIfTI file not found: $input_nifti_file_path"
fi

log "INFO" "Starting script execution."

if [ ! -d "$output_dir_path" ]; then
  log "INFO" "Output directory not found. Creating and processing: $output_dir_path"

  log "INFO" "Generating info for $input_nifti_file_path"
  if ! volume-to-precomputed --generate-info "$input_nifti_file_path" "$output_dir_path/"; then
    error_exit "Failed to generate info for $input_nifti_file_path"
  fi

  log "INFO" "Updating data_type in info_fullres.json"
  if ! jq '.data_type = "uint8"' "$output_dir_path/info_fullres.json" >tmp.json; then
    error_exit "Failed to update data_type in info_fullres.json"
  fi
  mv tmp.json "$output_dir_path/info_fullres.json"

  log "INFO" "Generating scales info"
  if ! generate-scales-info "$output_dir_path/info_fullres.json" "$output_dir_path/"; then
    error_exit "Failed to generate scales info."
  fi

  log "INFO" "Running precomputation"
  if ! volume-to-precomputed "$input_nifti_file_path" "$output_dir_path/"; then
    error_exit "Failed to run precomputation."
  fi

  log "INFO" "Computing scales"
  if ! compute-scales "$output_dir_path/"; then
    error_exit "Failed to compute scales."
  fi

else
  log "INFO" "Output directory already exists: $output_dir_path. Skipping processing."
fi


# Convert if encoding not already JPEG
if ! jq ".scales[].encoding" "$output_dir_path/info" | grep -q jpeg; then
  log "INFO" "Converting raw chunks to JPEG"
  generate-scales-info --encoding=jpeg "$output_dir_path"/info jpeg/
  convert-chunks --flat "$output_dir_path"/ jpeg/
fi

flatten_directory() {
  local dir="$1"
  log "INFO" "Flattening directory: $dir"
  find "$dir" -type f | while read -r file; do
    local relative_path="${file#"$dir"/}"
    local flattened_name="${relative_path//\//_}"
    mv "$file" "$dir/$flattened_name" || error_exit "Failed to move $file to $dir/$flattened_name"
  done

  find "$dir" -type d -empty -delete || error_exit "Failed to remove empty directories in $dir"
}

folders=$(find "$output_dir_path" -maxdepth 1 -mindepth 1 -type d)
for folder in $folders; do
  flatten_directory "$folder"
done

decompress_gz_in_folder() {
  local dir="$1"
  log "INFO" "Decompressing files in folder: $dir"
  find "$dir" -type f -name '*.gz' -exec gzip -d {} + || error_exit "Failed to decompress files in $dir"
}

find "$output_dir_path" -type d | while read -r folder; do
  decompress_gz_in_folder "$folder"
done

log "INFO" "Script execution completed successfully."
