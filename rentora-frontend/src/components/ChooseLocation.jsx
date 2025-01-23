import React, { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat, toLonLat } from 'ol/proj'; 
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Feature } from 'ol';
import Point from 'ol/geom/Point';
import { Style, Icon } from 'ol/style';
import pinImage from '../assets/pin.png';

const ChooseLocation = ({ onLocationSelect, latitude, longitude }) => {
    const mapRef = useRef();
    const [map, setMap] = useState(null);
    const vectorSource = useRef(new VectorSource());
    const viewRef = useRef(null);

    const addMarker = (coordinates) => {
        vectorSource.current.clear();
        const marker = new Feature({
            geometry: new Point(coordinates),
        });

        marker.setStyle(
            new Style({
                image: new Icon({
                    src: pinImage,
                    scale: 0.1,
                    anchor: [0.5, 1],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'fraction',
                }),
            })
        );

        vectorSource.current.addFeature(marker);
    };

    useEffect(() => {
        if (mapRef.current && !map) {
            const vectorLayer = new VectorLayer({
                source: vectorSource.current
            });

            // Set initial center based on provided coordinates or defaults
            const initialCenter = latitude && longitude 
                ? fromLonLat([longitude, latitude])
                : fromLonLat([20, 44]); // Default to Serbia if no coordinates

            if (!viewRef.current) {
                viewRef.current = new View({
                    center: initialCenter,
                    zoom: latitude && longitude ? 12 : 7, // Zoom in if coordinates provided
                });
            }

            const initialMap = new Map({
                target: mapRef.current,
                layers: [
                    new TileLayer({
                        source: new OSM(),
                    }),
                    vectorLayer
                ],
                view: viewRef.current,
            });

            setMap(initialMap);

            // Add initial marker if coordinates are provided
            if (latitude && longitude) {
                addMarker(initialCenter);
            }

            initialMap.on('click', (event) => {
                const coordinates = event.coordinate;
                const lonLat = toLonLat(coordinates);
                const lat = lonLat[1];
                const lng = lonLat[0];
                
                onLocationSelect(lat, lng);
                addMarker(coordinates);
                
                viewRef.current.animate({
                    center: coordinates,
                    zoom: 12,
                    duration: 1000
                });
            });
        }

        return () => {
            if (map) {
                map.setTarget(undefined);
            }
        };
    }, [map, onLocationSelect, latitude, longitude]);

    return <div ref={mapRef} style={{ width: '100%', height: '400px' }} />;
};

export default ChooseLocation;