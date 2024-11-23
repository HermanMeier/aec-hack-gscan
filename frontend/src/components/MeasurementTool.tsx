import { useState, useEffect, useCallback } from 'react';
import { Ruler } from 'lucide-react';

interface Point {
    x: number;
    y: number;
    z: number;
}

interface CoordinateSpace {
    scales: number[];
    units: string[];
}

interface Viewer {
    displayDimensionRenderInfo: {
        displayDimensions: {
            value: {
                coordinateSpace: CoordinateSpace;
            };
        };
    };
    mouseState: {
        position: [number, number, number] | null;
    };
    coordinateSpace: {
        value: {
            units: string[];
        };
    };
}

interface MeasurementToolProps {
    mousePosition: Point;
    isActive: boolean;
    viewer: Viewer;
}

export default function MeasurementTool({ mousePosition, isActive, viewer }: MeasurementToolProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [startPoint, setStartPoint] = useState<Point | null>(null);
    const [endPoint, setEndPoint] = useState<Point | null>(null);
    const [isMeasuring, setIsMeasuring] = useState(false);
    const [temporaryEndPoint, setTemporaryEndPoint] = useState<Point | null>(null);

    const calculateDistance = useCallback((point1: Point, point2: Point): number => {
        const scales = viewer.displayDimensionRenderInfo.displayDimensions.value.coordinateSpace.scales;
        const dx = (point2.x - point1.x) * scales[0];
        const dy = (point2.y - point1.y) * scales[1];
        const dz = (point2.z - point1.z) * scales[2];
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }, [viewer]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isMeasuring && viewer.mouseState.position) {
            const [x, y, z] = viewer.mouseState.position;
            setTemporaryEndPoint({ x, y, z });
        }
    }, [isMeasuring, viewer.mouseState.position]);

    const handleMouseUp = useCallback(() => {
        if (!isActive || !viewer.mouseState.position) return;

        const [x, y, z] = viewer.mouseState.position;
        const currentPoint = { x, y, z };

        if (!startPoint) {
            setStartPoint(currentPoint);
            setIsMeasuring(true);
        } else if (isMeasuring) {
            setEndPoint(currentPoint);
            setIsMeasuring(false);
        }
    }, [isActive, startPoint, isMeasuring, viewer.mouseState.position]);

    useEffect(() => {
        if (!isActive) return;

        if (isMeasuring) {
            document.addEventListener('mousemove', handleMouseMove);
        }
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isActive, isMeasuring, handleMouseMove, handleMouseUp]);

    const handleReset = useCallback(() => {
        setStartPoint(null);
        setEndPoint(null);
        setTemporaryEndPoint(null);
        setIsMeasuring(false);
    }, []);

    const getMeasurementDisplay = useCallback(() => {
        if (!startPoint && !isMeasuring) {
            return "Click to start measuring";
        }

        if (isMeasuring && startPoint && temporaryEndPoint) {
            const distance = calculateDistance(startPoint, temporaryEndPoint);
            return `Current distance: ${distance.toFixed(6)} ${viewer.coordinateSpace.value.units[0]}`;
        }

        if (startPoint && endPoint) {
            const distance = calculateDistance(startPoint, endPoint);
            return `Final distance: ${distance.toFixed(6)} ${viewer.coordinateSpace.value.units[0]}`;
        }

        return `Current distance: 0 ${viewer.coordinateSpace.value.units[0]}`;
    }, [startPoint, endPoint, temporaryEndPoint, isMeasuring, calculateDistance, viewer.coordinateSpace.value.units]);

    return (
        <div className="fixed bottom-4 right-4 flex flex-col items-end gap-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-3 rounded-full shadow-lg transition-colors ${
                    isActive
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-400 text-white/50 cursor-not-allowed'
                }`}
                title={isActive ? "Measurement Tool" : "Measurement Tool (Disabled)"}
            >
                <Ruler className="h-6 w-6" />
            </button>

            {isOpen && (
                <div className="w-64 bg-black/50 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
                    <div className="flex items-center justify-between p-3 border-b border-white/10">
                        <h3 className="text-white font-semibold text-sm">Measurement Tool</h3>
                        <button
                            onClick={handleReset}
                            className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                        >
                            Reset
                        </button>
                    </div>
                    <div className="p-3">
                        <p className="text-white text-sm">
                            {getMeasurementDisplay()}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}