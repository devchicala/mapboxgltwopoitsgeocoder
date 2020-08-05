import { environment } from './../environments/environment';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import * as Mapboxgl from 'mapbox-gl';
import { Map, MapboxGeoJSONFeature } from 'mapbox-gl';
import * as MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';
import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { HttpClient } from '@angular/common/http';
import { Geometry, FeatureCollection, Feature } from 'geojson';

declare var $: any
declare var H: any;


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'here-project'
  geometry: any = {}

  maxBoundsSouth: Mapboxgl.LngLatLike = {
    lng: 17.873887,
    lat: -11.202692
  }
  maxBoundsNorth: Mapboxgl.LngLatLike = {
    lng: 17.045116,
    lat: -8.6551242
  }

  origem = {
    lng: 13.2309291,
    lat: -8.8292388
  }

  destino = {
    lng: 13.239833,
    lat: -8.819146
  }

  public constructor(private http: HttpClient) {
  }

  token = (Mapboxgl as any).accessToken = environment.mapboxKey;
  mapa: Mapboxgl.Map



  public ngOnInit() {
    this.token;
    this.mapa = new Map({
      container: 'mapa-mapbox', // container id
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [this.origem.lng, this.origem.lat],
      zoom: 14, // starting zoom
  
      //maxBounds: new Mapboxgl.LngLatBounds(this.maxBoundsSouth, this.maxBoundsNorth)
    });




    this.mapa.on('load', () => {
      this.getRoute(this.origem, this.destino).subscribe(result => {
        //if (result) {
          const coordinates = result.routes[0].geometry.coordinates
          console.log('Funcionou ...')
          this.geometry = result.routes[0].geometry
          this.mapa.addSource('route', {
            'type': 'geojson',
            'data': {
              'type': 'Feature',
              'properties': {},
              'geometry': this.geometry
            }
          })
          this.mapa.addLayer({
            'id': 'route',
            'type': 'line',
            'source': 'route',
            'layout': {
              'line-join': 'round',
              'line-cap': 'round'
            },
            'paint': {
              'line-color': '#888',
              'line-width': 8
            }
          });
          const bounds = coordinates.reduce(function(bounds, coord) {
            return bounds.extend(coord);
            }, new Mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
            this.mapa.fitBounds(bounds, {
            padding: 40
            });
        }
      ,
        error => {
          console.log(error)
          return null
        })
    });


    let geocoder: MapboxGeocoder = new MapboxGeocoder({
      accessToken: this.token,
      marker: { color: 'orange' },
      mapboxgl: Mapboxgl,
      language: 'pt',
      countries: 'ao'
    });

    this.mapa.addControl(geocoder);

    geocoder.on('result', (e) => {
      //console.log(JSON.stringify(e))
      console.log(e.result.geometry.coordinates)
    })

    /*this.mapa.addControl(
      new MapboxDirections({
        accessToken: this.token
      }),
      'top-left'
    );*/

    /*var directions = new Mapboxgl.diDirections({
      unit: 'metric',
      profile: 'cycling'
    });*/

    this.createMarker(this.origem.lng, this.origem.lat)
    this.createMarker(this.destino.lng, this.destino.lat)
  }

  createMarker(lg: number, lt: number,) {
    const marker = new Mapboxgl.Marker({
      draggable: false
    })
      .setLngLat([lg, lt])
      .addTo(this.mapa);
    /*marker.on('dragend', () => {
      console.log(marker.getLngLat())
    });*/
  }

  getRoute(origem: { lng: number, lat: number }, destino: { lng: number, lat: number }) {
    const BASE_URL = "https://api.mapbox.com/directions/v5/mapbox/walking/"
    const ACCESS_TOKEN = "pk.eyJ1IjoiZWRzb25wYXVsbzI0IiwiYSI6ImNrZDNoeTlwbDFuYnMycm12dmZveDNsODYifQ.HOUGZFFlv-xHQ4uTZXDwyA"
    const FULL_URL = `${BASE_URL}${origem.lng},${origem.lat};${destino.lng},${destino.lat}?geometries=geojson&access_token=${ACCESS_TOKEN}`
    return this.http.get<any>(FULL_URL)
  }
}
