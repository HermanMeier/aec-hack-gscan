import argparse
import time
from pathlib import Path

import neuroglancer
import neuroglancer.cli
import numpy as np


def main(neuroglancer_viewer_state):
    # Path to pkl file with Muon scan scatter angle data [milliradian] with shape (951, 1001, 1001)
    data_dir = Path.cwd() / "data"
    file_name = "aec_hackathon_gscan_example_smaller_data.pkl"
    pkl_path = data_dir / file_name

    print(f"Loading scatter angle data from {pkl_path} into memory...")
    with open(pkl_path, "rb") as f:
        scatter_angle = np.load(f, allow_pickle=True)

    scatter_angle = scatter_angle.astype(np.uint8)

    print("Adding dimensions to viewer...")
    dimensions = neuroglancer.CoordinateSpace(
        names=["x", "y", "z"], units="cm", scales=[10, 10, 10]
    )
    neuroglancer_viewer_state.dimensions = dimensions

    print("Adding scatter_angle layer to viewer...")
    neuroglancer_viewer_state.layers.append(
        name="scatter_angle",
        layer=neuroglancer.LocalVolume(
            data=scatter_angle,
            dimensions=neuroglancer.CoordinateSpace(
                names=["x", "y", "z"],
                units=["cm", "cm", "cm"],
                # Voxel spacing along each dimension.
                scales=[10, 10, 10],
            ),
        ),
    )

    return scatter_angle


def try_loading_pickle():
    # Path to pkl file with Muon scan scatter angle data [milliradian] with shape (951, 1001, 1001)
    pkl_path = Path.cwd() / "data" / "aec_hackathon_gscan_example_data.pkl"

    print(f"Loading scatter angle data from {pkl_path} into memory...")
    try:
        with open(pkl_path, "rb") as f:
            scatter_angle = np.load(f, allow_pickle=True)
        scatter_angle = scatter_angle.astype(np.uint8)
    except Exception as e:
        print(e)

    print(f"scatter_angle.shape: {scatter_angle.shape}")
    print(f"scatter_angle.dtype: {scatter_angle.dtype}")
    # print(f"scatter_angle.min: {scatter_angle.min()}")
    # print(f"scatter_angle.max: {scatter_angle.max()}")


if __name__ == "__main__":
    # try_loading_pickle()

    ap = argparse.ArgumentParser()
    neuroglancer.cli.add_server_arguments(ap)
    args = ap.parse_args()
    neuroglancer.cli.handle_server_arguments(args)
    viewer = neuroglancer.Viewer()
    print("Viewer started. No layers yet. Viewer url:")
    print(viewer)
    with viewer.txn() as state:
        _ = main(state)
    print("Added layers to viewer. Viewer url:")
    print(viewer)

    try:
        while True:
            time.sleep(100)  # Sleep to reduce CPU usage
    except KeyboardInterrupt:
        print("\nServer stopped by user.")
