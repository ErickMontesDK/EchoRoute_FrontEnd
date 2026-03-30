import { Home, MapPin, Package, Store, User } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import MapPanel from './MapPanel';
import './MapDisplay.css';

declare const L: any;


export interface MarkerProps {
    lat: number;
    lng: number;
    popup: string;
    icon?: string;
    type?: string;
    code?: string;
    address?: string;
    sector?: string;
    market?: string;
    is_active?: boolean;
    id?: number;
    visit_id?: number;
    visit_date?: string;
    visit_time?: string;
    is_productive?: boolean;
    notes?: string;
    deliverer_name?: string;
    is_valid?: boolean;
}

export interface MapDisplayProps {
    markers?: MarkerProps[];
    config?: Record<string, { color: string; icon: string }>;
    focusedVisitId?: number | null;
    setFocusedVisitId?: (id: number | null) => void;
}



export default function MapDisplay({ markers, config, focusedVisitId, setFocusedVisitId }: MapDisplayProps) {
    const mapRef = useRef<any | null>(null);
    const markerRefs = useRef<Record<number, any>>({});

    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markersLayerRef = useRef<any>(null);


    const [selectedMarker, setSelectedMarker] = useState<MarkerProps | null>(null);
    const selectedLeafletMarkerRef = useRef<any>(null);
    const setFocusedVisitIdRef = useRef(setFocusedVisitId);

    useEffect(() => {
        setFocusedVisitIdRef.current = setFocusedVisitId;
    }, [setFocusedVisitId]);

    useEffect(() => {
        if (!focusedVisitId || !mapRef.current) return;

        const marker = markerRefs.current[focusedVisitId];
        if (!marker) return;

        const latlng = marker.getLatLng();
        mapRef.current.flyTo(latlng, 16, { animate: true, duration: 1 });


        if (selectedLeafletMarkerRef.current) {
            selectedLeafletMarkerRef.current.getElement()
                ?.querySelector('.map-marker-icon')
                ?.classList.remove('selected');
        }
        marker.getElement()
            ?.querySelector('.map-marker-icon')
            ?.classList.add('selected');
        selectedLeafletMarkerRef.current = marker;

        const markerData = markers?.find(m =>
            m.visit_id === focusedVisitId ||
            m.id === focusedVisitId
        );
        if (markerData) {
            setTimeout(() => setSelectedMarker(markerData), 100);
        }
    }, [focusedVisitId, markers]);

    useEffect(() => {
        if (mapContainerRef.current && !mapInstanceRef.current) {
            mapInstanceRef.current = L.map(mapContainerRef.current).setView([0, 0], 13);
            mapRef.current = mapInstanceRef.current;

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(mapInstanceRef.current);

            markersLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    const defaultIconHTML = useMemo(() => renderToStaticMarkup(
        <div
            className="map-marker-icon"
            style={{ backgroundColor: 'var(--primary-color)' }}
        >
            <Store size={18} />
        </div>
    ), []);

    useEffect(() => {
        if (mapInstanceRef.current && markersLayerRef.current) {
            markersLayerRef.current.clearLayers();
            setSelectedMarker(null);

            if (markers && markers.length > 0) {
                const bounds = L.latLngBounds([]);

                markers.forEach((marker) => {
                    const latLng: [number, number] = [Number(marker.lat), Number(marker.lng)];
                    let iconHTML = defaultIconHTML;
                    if (marker.type !== undefined && config && config[marker.type]) {
                        const IconComponent = () => {
                            switch (config[marker.type!].icon) {
                                case "Store": return <Store size={18} />;
                                case "Home": return <Home size={18} />;
                                case "Package": return <Package size={18} />;
                                case "User": return <User size={18} />;
                                case "MapPin": return <MapPin size={18} />;
                                default: return <Store size={18} />;
                            }
                        };

                        iconHTML = renderToStaticMarkup(
                            <div
                                className="map-marker-icon"
                                style={{ backgroundColor: config[marker.type].color || 'var(--primary-color)' }}
                            >
                                <IconComponent />
                            </div>
                        );
                    }

                    const leafletMarker = L.marker(latLng, {
                        icon: L.divIcon({
                            html: iconHTML,
                            className: 'custom-map-marker',
                            iconSize: [38, 38],
                            iconAnchor: [19, 19],
                            popupAnchor: [0, -19],
                        })
                    }).addTo(markersLayerRef.current);

                    if (marker.visit_id !== undefined) {
                        markerRefs.current[marker.visit_id] = leafletMarker;
                    }

                    if (marker.id !== undefined) {
                        markerRefs.current[marker.id] = leafletMarker;
                    }

                    leafletMarker.on('click', () => {
                        if (selectedLeafletMarkerRef.current) {
                            selectedLeafletMarkerRef.current.getElement()
                                ?.querySelector('.map-marker-icon')
                                ?.classList.remove('selected');
                        }

                        leafletMarker.getElement()
                            ?.querySelector('.map-marker-icon')
                            ?.classList.add('selected');

                        selectedLeafletMarkerRef.current = leafletMarker;
                        setSelectedMarker(marker);
                        if (setFocusedVisitIdRef.current) {
                            setFocusedVisitIdRef.current(marker.visit_id ?? marker.id ?? null);
                        }
                        console.log(marker);
                    });

                    bounds.extend(latLng);
                });

                mapInstanceRef.current.fitBounds(bounds, {
                    padding: [50, 50],
                    maxZoom: 15
                });
            } else {
                const DEFAULT_COORDINATES = [-12.0464, -77.0428];
                mapInstanceRef.current.setView(DEFAULT_COORDINATES, 13);
            }
        }
    }, [markers, config, defaultIconHTML]);

    return (
        <div className="map-display-wrapper">
            <div
                ref={mapContainerRef}
                className="map-container rounded shadow-sm border"
                id="map-container"
            />

            {selectedMarker && (
                <MapPanel
                    marker={selectedMarker}
                    config={config}
                    onClose={() => setSelectedMarker(null)}
                />
            )}
        </div>
    );
}
