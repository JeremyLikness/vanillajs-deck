# Vanilla.js Deck

![Build and Deploy Vanilla.js](https://github.com/JeremyLikness/vanillajs-deck/workflows/Build%20and%20Deploy%20Vanilla.js/badge.svg)

👀 [View the live demo](https://jlik.me/vanilla-js)

A Vanilla.js Single Page App (SPA) slide deck for a presentation about Vanilla.js. Yes, this is inception! No builds (unless you
count the included Docker image) and no frameworks, just pure JavaScript for a SPA application that features:

- Routing (yes, you can bookmark/return to a slide)
- Transitions
- Reusable components
- Data-binding

## Getting Started

Optionally fork then clone the repo:

`git clone https://github.com/JeremyLikness/vanillajs-deck.git`

Spin up your favorite web server and point it to the root directory. There are no builds involved.

One simple approach is to use Node.js and `http-server`: 

`npm i -g http-server`

`cd vanillajs-deck`

`http-server .`

Navigate to one of the URLs with `index.html` as the path.

### Docker setup

If you prefer, you can build a Docker image and run the presentation from there.

`cd vanillajs-deck`

`docker build -t vanillajs-deck .`

`docker run --rm -d -p 8080:80 vanillajs-deck`

Navigate to `http://localhost:8080/index.html` to start the show.
