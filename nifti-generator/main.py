import nibabel as nib
import numpy as np
import click


NIFTI_OUTPUT_FILE_DEFAULT = 'output.nii.gz'
NUMPY_OUTPUT_FILE_DEFAULT = 'output.pickle'

def convert_pickle_to_nifti(input_pickle_file: str, output_file: str, voxel_size: float = None) -> None:
    """
    Convert pickle of 3D numpy array of voxel data to nifti file
    :param input_pickle_file: location of the pickle
    :param output_file: name of the output file , should end with .nii or .nii.gz extension
    :param voxel_size: size of the voxel in mm, will be embedded in nifti affinity matrix
    """
    print(f'Creating NIfTI image from {input_pickle_file}')
    data = np.load(input_pickle_file, allow_pickle=True)

    used_voxel_size = np.eye(4) if voxel_size is None else voxel_size

    affine = np.diag([used_voxel_size, used_voxel_size, used_voxel_size, 1])

    convert_numpy_to_nifti(data=data, output_file=output_file, original_affine=affine)


def convert_numpy_to_nifti(data: np.ndarray, output_file: str, original_affine: object) -> object:
    """
    Convert 3D numpy array of voxel data to nifti file
    :param data: 3D numpy array with a value for each voxel
    :param output_file: name of the output file , should end with .nii or .nii.gz extension
    :param original_affine: affinity matrix representing sizes in mm
    """
    data = data.astype(np.float32)

    # Affinity matrix used to give real
    affine = np.eye(4) if original_affine is None else original_affine

    nifti_img = nib.Nifti1Image(data, affine)

    nib.save(nifti_img, output_file)
    print(f'NIfTI image saved successfully to {output_file}')

if __name__ == "__main__":
    convert_pickle_to_nifti('modified_voi.pickle', 'output.nii.gz', voxel_size=1)

@click.command()
@click.option('-i', '--input-file', type=str,
              help='the path containing the pickle for 3D Numpy array or nifti file if reverse option selected',
              required=True)
@click.option('-o', '--output-file', type=str, help=f'the output file',
              default='')
@click.option('-v', '--voxel-size', type=float, help=f'voxel size in mm for the original data. Can be used when converting from numpy to nifti', default=None)
def cli(input_file: str, output_file: str, voxel_size: float) -> None:
        convert_pickle_to_nifti(input_pickle_file=input_file, output_file=output_file, voxel_size=voxel_size)
