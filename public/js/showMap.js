mapboxgl.accessToken = mapboxToken;
const JSONobj = JSON.parse(campground);

const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/light-v10', // style URL
    center: JSONobj.geometry.coordinates, // starting position [lng, lat]
    zoom: 10 // starting zoom
});

map.addControl(new mapboxgl.NavigationControl(), "top-left");

new mapboxgl.Marker()
    .setLngLat(JSONobj.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({offset: 25})
        .setHTML(
            `<h6><strong>${JSONobj.title}</strong></h6><p>${JSONobj.location}</p>`
        )
    )
    .addTo(map)