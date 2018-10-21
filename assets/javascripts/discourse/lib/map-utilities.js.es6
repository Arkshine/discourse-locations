/* global L */

import { emojiUnescape } from 'discourse/lib/text';
import DiscourseURL from 'discourse/lib/url';

const generateMap = function(opts) {
  const element = document.createElement('div');
  let attrs = {
    zoomControl: false,
    attributionControl: false,
    zoomSnap: 0.1
  };

  const defaultZoom = Discourse.SiteSettings.location_map_zoom;
  attrs['zoom'] = opts['zoom'] !== undefined ? opts['zoom'] : defaultZoom;

  const defaultLat = Discourse.SiteSettings.location_map_center_lat;
  const defaultLon = Discourse.SiteSettings.location_map_center_lon;
  attrs['center'] = opts['center'] !== undefined ? opts['center'] : [defaultLat, defaultLon];

  const map = L.map(element, attrs);

  let tileOpts = {
    attribution: Discourse.SiteSettings.location_map_attribution,
    maxZoom: 19
  };

  const subdomains = Discourse.SiteSettings.location_map_tile_layer_subdomains;
  if (subdomains) {
    tileOpts['subdomains'] = subdomains;
  }

  L.tileLayer(Discourse.SiteSettings.location_map_tile_layer, tileOpts).addTo(map);

  L.Icon.Default.imagePath = '/plugins/discourse-locations/leaflet/images/';

  L.control.zoom({ position: 'bottomleft' }).addTo(map);

  let attribution = L.control.attribution({ position: 'bottomright', prefix: ''});

  return { element, map, attribution };
};

const setupMap = function(map, markers, boundingbox, zoom, center) {
  if (boundingbox) {
    let b = boundingbox;
    // fitBounds needs: south lat, west lon, north lat, east lon
    map.fitBounds([[b[0], b[2]],[b[1], b[3]]]);
  } else if (markers) {
    const maxZoom = Discourse.SiteSettings.location_map_marker_zoom;
    map.fitBounds(markers.getBounds().pad(0.1), { maxZoom });
  } else {
    const defaultLat = Number(Discourse.SiteSettings.location_map_center_lat);
    const defaultLon = Number(Discourse.SiteSettings.location_map_center_lon);
    const defaultZoom = Discourse.SiteSettings.location_map_zoom;
    const setZoom = zoom === undefined ? defaultZoom : zoom;
    const setView = center === undefined ? [defaultLat, defaultLon] : center;
    map.setView(setView);
    map.setZoom(setZoom);
  }
};

const buildMarker = function(rawMarker) {
  const marker = L.marker({
    lat: rawMarker.lat,
    lon: rawMarker.lon
  }, rawMarker.options);

  if (rawMarker.options.routeTo) {
    marker.on('click', () => {
      DiscourseURL.routeTo(rawMarker.options.routeTo);
    });
  }

  if (rawMarker.options && rawMarker.options.title) {
    const title = emojiUnescape(rawMarker.options.title);
    marker.bindTooltip(title,
      {
        permanent: true,
        direction: 'top',
        className: 'topic-title-map-tooltip'
      }
    ).openTooltip();
  }

  return marker;
};

const addCircleMarkersToMap = function(rawCircleMarkers, map, context) {
  rawCircleMarkers.forEach((cm) => {
    const marker = L.circleMarker({
      lat: cm.lat,
      lon: cm.lon
    }, cm.options);

    if (cm.options.routeTo) {
      marker.on('click', () => {
        context.toggleExpand();
        DiscourseURL.routeTo(cm.options.routeTo);
      });
    }

    marker.addTo(map);
  });
};

const addMarkersToMap = function(rawMarkers, map) {
  let markers = L.markerClusterGroup({
    spiderfyDistanceMultiplier: 6
  });

  rawMarkers.forEach((raw) => {
    markers.addLayer(buildMarker(raw, map));
  });

  map.addLayer(markers);

  return markers;
};

export { generateMap, setupMap, addMarkersToMap, addCircleMarkersToMap };
