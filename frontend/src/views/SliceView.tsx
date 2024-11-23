import "neuroglancer";
import MeasurementTool from "../MeasurementTool.tsx";
import {useEffect, useMemo, useState} from "react";
import {setupDefaultViewer} from "neuroglancer/unstable/ui/default_viewer_setup";

interface Point {
    x: number;
    y: number;
    z: number;
}

function SliceView() {
    const [mousePosition, setMousePosition] = useState<Point>({x: 0, y: 0, z: 0});
    const [isActive, setIsActive] = useState(false);
    const [viewer, setViewer] = useState<any>(null);
    const newViewer = useMemo(() => setupDefaultViewer(), []);

    console.log('creating slice view')

    useEffect(() => {

        setViewer(newViewer);

        const handleMouseStateChange = () => {
            if (newViewer.mouseState?.position) {
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
            newViewer?.mouseState.changed.remove(handleMouseStateChange);
            newViewer.dispose();
        };
    }, [newViewer]);

    return (
        <>
            {viewer && (
                <MeasurementTool
                    mousePosition={mousePosition}
                    isActive={isActive}
                    viewer={viewer}
                />
            )}
        </>
    )

}

export default SliceView
