import './App.css'
import "neuroglancer";

interface NeuroglancerProps {
    viewer: any;
}

function Neuroglancer({ viewer }: NeuroglancerProps) {
    if (!viewer) {
        return null;
    }

    return <div className="w-full h-full" />;
}

export default Neuroglancer;