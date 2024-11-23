import './App.css'
import "neuroglancer";
import { setupDefaultViewer } from "neuroglancer/unstable/ui/default_viewer_setup.js";
import { useEffect, useState } from 'react';
import Neuroglancer from "./Neuroglancer";
import MeasurementTool from './MeasurementTool';

interface Point {
    x: number;
    y: number;
    z: number;
}

function App() {
    const [mousePosition, setMousePosition] = useState<Point>({ x: 0, y: 0, z: 0 });
    const [isActive, setIsActive] = useState(false);
    const [viewer, setViewer] = useState<any>(null);

    useEffect(() => {
        const newViewer = setupDefaultViewer();
        setViewer(newViewer);

        const handleMouseStateChange = () => {
            if (newViewer.mouseState.position) {
                setMousePosition({
                    x: newViewer.mouseState.position[0],
                    y: newViewer.mouseState.position[1],
                    z: newViewer.mouseState.position[2]
                });
                setIsActive(newViewer.mouseState.active);
            }
        };

        newViewer.mouseState.changed.add(handleMouseStateChange);

        return () => {
            newViewer.mouseState.changed.remove(handleMouseStateChange);
            newViewer.dispose();
        };
    }, []);

    return (
        <div className="relative w-full h-screen">
            <Neuroglancer viewer={viewer} />
            {viewer && (
                <MeasurementTool
                    mousePosition={mousePosition}
                    isActive={isActive}
                    viewer={viewer}
                />
            )}
        </div>
    );
}

export default App;