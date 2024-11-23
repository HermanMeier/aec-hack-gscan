import {setupDefaultViewer} from "neuroglancer/unstable/ui/default_viewer_setup.js";

function Neuroglancer() {
    const viewer = setupDefaultViewer();

    // viewer.layerSpecification.add('new-layer', {
    //     source: 'precomputed://http://138.246.22.182:8081',
    //     type: 'image'
    // });
    //
    // // Set initial navigation state if needed
    // viewer.navigationState.reset();

    // console.log('viewer', viewer)
    // console.log('data', viewer.dataSourceProvider.dataSources.get("precomputed"))

    return (
        <>
        </>
    )
}

export default Neuroglancer
