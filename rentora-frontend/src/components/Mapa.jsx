import React, { useEffect, useRef } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import { Feature } from 'ol';
import Point from 'ol/geom/Point';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Style, Icon } from 'ol/style';
import Overlay from 'ol/Overlay';
import "./Mapa.css";

const Mapa = ({ locations }) => {
  const mapRef = useRef(null);
  const overlayRef = useRef(null);
  const popupRef = useRef(null);
  const popupCloserRef = useRef(null);
  const popupContentRef = useRef(null);

  useEffect(() => {
    if (locations.length === 0) return;

    // Kreiranje VectorSource sa lokacijama
    const vectorSource = new VectorSource({
      features: locations.map(car => {
        const feature = new Feature({
          geometry: new Point(fromLonLat([car.longitude, car.latitude])),
          properties: {
            street: car.street,
            streetNumber: car.streetNumber,
            city: car.city,
            country: car.country
          }
        });
        
        feature.setStyle(new Style({
          image: new Icon({
            src: '/pin.png',
            scale: 0.1,
          }),
        }));
        return feature;
      }),
    });

    // Kreiranje sloja sa lokacijama
    const vectorLayer = new VectorLayer({
      source: vectorSource,
    });

    // Kreiranje mape
    const view = new View({
      center: fromLonLat([20.5169, 43.1371]),
      zoom: 7,
    });

    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        vectorLayer,
      ],
      view: view,
    });

    // Kreiranje Overlay za popup
    const overlay = new Overlay({
      element: popupRef.current,
      autoPan: {
        animation: {
          duration: 250,
        },
      },
    });
    
    map.addOverlay(overlay);
    overlayRef.current = overlay;

    // Fokusiranje mape na sve lokacije
    if (locations.length > 0) {
      const extent = vectorSource.getExtent();
      view.fit(extent, { padding: [50, 50, 50, 50] });
    }

    // Zatvaranje popup-a
    const closer = popupCloserRef.current;
    if (closer) {
      closer.onclick = function() {
        overlay.setPosition(undefined);
        closer.blur();
        return false;
      };
    }

    // Dodavanje funkcionalnosti za prikaz informacija o lokacijama
    map.on('click', function(evt) {
      const feature = map.forEachFeatureAtPixel(evt.pixel, feature => feature);
      
      if (feature) {
        const coordinates = feature.getGeometry().getCoordinates();
        const props = feature.getProperties().properties;
        
        if (props && popupContentRef.current) {
          popupContentRef.current.innerHTML = `
            <strong>Ulica:</strong> ${props.street} ${props.streetNumber}<br>
            <strong>Grad:</strong> ${props.city}<br>
            <strong>Država:</strong> ${props.country}
          `;
          overlay.setPosition(coordinates);
        }
      } else {
        overlay.setPosition(undefined);
      }
    });

    // Promena kursora kada je iznad markera
    map.on('pointermove', function(evt) {
      const pixel = map.getEventPixel(evt.originalEvent);
      const hit = map.hasFeatureAtPixel(pixel);
      map.getTarget().style.cursor = hit ? 'pointer' : '';
    });

    return () => {
      map.setTarget(undefined);
    };
  }, [locations]);

  return (
    <div>
      <div ref={mapRef} style={{ width: '100%', height: '500px' }}></div>
      <div ref={popupRef} className="ol-popup">
        <a href="#" ref={popupCloserRef} className="ol-popup-closer"></a>
        <div ref={popupContentRef}></div>
      </div>
    </div>
  );
};

export default Mapa;