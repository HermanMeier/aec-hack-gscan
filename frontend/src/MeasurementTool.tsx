import { useState, useEffect, useCallback } from 'react';
import { Ruler } from 'lucide-react';

interface Point {
    x: number;
    y: number;
    z: number;
}

interface MeasurementToolProps {
    mousePosition: Point;
    isActive: boolean;
    viewer: {
        mouseState: {
            position: [number, number, number] | null;
            changed: {
                add: (callback: () => void) => void;
                remove: (callback: () => void) => void;
            };
        };
    };
}

export default function MeasurementTool({ mousePosition, isActive, viewer }: MeasurementToolProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [startPoint, setStartPoint] = useState<Point | null>(null);
    const [endPoint, setEndPoint] = useState<Point | null>(null);
    const [isMeasuring, setIsMeasuring] = useState(false);
    const [temporaryEndPoint, setTemporaryEndPoint] = useState<Point | null>(null);
    const [isMouseDown, setIsMouseDown] = useState(false);

    const calculateDistance = useCallback((point1: Point, point2: Point): number => {
        const dx = point2.x - point1.x;
        const dy = point2.y - point1.y;
        const dz = point2.z - point1.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }, []);

    // Only update temporary end point when actually measuring
    useEffect(() => {
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

        setIsMouseDown(false);
    }, [isActive, isMouseDown, startPoint, isMeasuring, viewer.mouseState.position]);

    useEffect(() => {
        if (!isActive) return;

        // Add event listeners to the document
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            // Clean up event listeners
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isActive, handleMouseUp]);

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
            return `Current distance: ${distance.toFixed(2)} units`;
        }

        if (startPoint && endPoint) {
            const distance = calculateDistance(startPoint, endPoint);
            return `Final distance: ${distance.toFixed(2)} units`;
        }

        return "Click to set end point";
    }, [startPoint, endPoint, temporaryEndPoint, isMeasuring, calculateDistance]);

    return (
        <div className="fixed bottom-4 right-4 flex flex-col items-end gap-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-3 text-white rounded-full shadow-lg transition-colors ${
                    isActive
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-gray-400 cursor-not-allowed'
                }`}
                title={isActive ? "Measurement Tool" : "Measurement Tool (Disabled)"}
            >
                <Ruler className="h-6 w-6" />
            </button>

            {isOpen && (
                <div className="w-64 bg-black/50 rounded-lg shadow-lg overflow-hidden">
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