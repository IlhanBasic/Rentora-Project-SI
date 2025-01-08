import React, { useEffect } from 'react';
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

const Mapa = ({ locations }) => {
  useEffect(() => {
    if (locations.length === 0 || !document.getElementById('popup')) return;

    // Kreiranje VectorSource sa lokacijama
    const vectorSource = new VectorSource({
      features: locations.map(car => {
        const feature = new Feature({
          geometry: new Point(fromLonLat([car.longitude, car.latitude])),
        });
        feature.set('street', car.street);
        feature.set('streetNumber', car.streetNumber);
        feature.set('city', car.city);
        feature.set('country', car.country);
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
      target: 'map',
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
      element: document.getElementById('popup'),
      autoPan: true,
    });
    map.addOverlay(overlay);

    // Fokusiranje mape na sve lokacije
    if (locations.length > 0) {
      const extent = vectorSource.getExtent();
      view.fit(extent, { padding: [50, 50, 50, 50] });
    }

    // Dodavanje funkcionalnosti za prikaz informacija o lokacijama
    map.on('click', function (evt) {
      const feature = map.forEachFeatureAtPixel(evt.pixel, (feature) => feature);
      if (feature) {
        const coordinates = feature.getGeometry().getCoordinates();
        overlay.setPosition(coordinates);

        const street = feature.get('street');
        const streetNumber = feature.get('streetNumber');
        const city = feature.get('city');
        const country = feature.get('country');

        document.getElementById('popup-content').innerHTML = `
          <strong>Ulica:</strong> ${street} ${streetNumber} <br/>
          <strong>Grad:</strong> ${city} <br/>
          <strong>Država:</strong> ${country}
        `;
        overlay.getElement().style.display = 'block';
      } else {
        overlay.getElement().style.display = 'none';
      }
    });

    // Čišćenje mape prilikom demontiranja komponente
    return () => {
      map.setTarget(undefined);
    };
  }, [locations]);

  return (
    <div>
      <div id="map" style={{ width: '100%', height: '500px' }}></div>
      <div id="popup" className="ol-popup" style={{ display: 'none' }}>
        <a href="#" id="popup-closer" className="ol-popup-closer"></a>
        <div id="popup-content"></div>
      </div>
    </div>
  );
};

export default Mapa;
