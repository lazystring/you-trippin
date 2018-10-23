## Development

Start up a tile server using tileserver-gl or similar. Or just go out into the internets and find an existing tileserver (mapbox has some). Replace the `tileserver` url in `environment.ts`.

To start a local instance of the app, just run `ng serve --open` and you're good to go.

## Features

* Search through recorded trips.
* Visualize distribution of speeds as color gradient.
* Hover over parts of the trip to see the recorded speed.
* View computed stats from the trip.
* View chart of speed over time.
* Wonder aimlessly around the map until you find cool things.

## Requirements

* Read JSON files of trip data sampled at 1 Hz.
* Visualize trips on a map.
* Visualize distribution of speed along a trip.
* Data must be read / processed client-sided.

## TODO:

* Use GMaps API or similar to look up start and end locations to display.
* Support fine tuning analysis to specific segments of the trip.

![trippin](http://memecrunch.com/meme/B4U5/man-you-trippin/image.jpg)
