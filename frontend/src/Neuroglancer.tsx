import './App.css'
import "neuroglancer";
import {setupDefaultViewer} from "neuroglancer/unstable/ui/default_viewer_setup.js";
// import {DataSourceProvider} from "neuroglancer/unstable/datasource";

function App() {
    // const datasourceProvider = {normalizeUrl: 'precomputed://http://138.246.22.182:8081'}
    // const dataSources: Map<string, DataSourceProvider> = new Map(['img', datasourceProvider])
    // setupDefaultViewer( {
    //     dataSourceProvider: {
    //         dataSources: {'img' {normalizeUrl: 'precomputed://http://138.246.22.182:8081'}}
    //     }
    // });
    setupDefaultViewer();
    return (
        <>
        </>
    )
}

export default App
