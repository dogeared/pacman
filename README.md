# Pure JS Pac-Man

This is based on the excellent work from [https://github.com/daleharvey/pacman](https://github.com/daleharvey/pacman)

The only major differences are breaking up the monolothic [pacman.js](https://github.com/daleharvey/pacman/blob/master/pacman.js) 
file into [modules](modules).

## Running

The requirements for running locally or in a deployed environment are minimal.

* node.js
* express


To run locally do the following:

```
npm install
SPLIT_AUTH_KEY=<your split client auth key> npm start
```

## DEPLOYING

You can easily deploy to Heroku using the purple button:

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)