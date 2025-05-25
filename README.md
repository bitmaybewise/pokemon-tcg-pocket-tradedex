# Pokémon Trade Dex

Mark the cards you own, set your Friend ID on your profile, share with friends, and discover what cards you can exchange with each other.

The cards are provided by https://github.com/chase-manning/pokemon-tcg-pocket-cards.

## Development

How to prepare localhost for development?

This project is built using [Google Firebase](https://firebase.google.com/) (Authentication and Firestore Database).

The emulators can be used for local development, but a dedicated project is recommended to simulate the environment it is deployed.

Copy the sample and fill the environment variable file with your Google Firebase project credentials:

```shell
$ cp .env.local.sample .env.local
```

Install [mise](https://mise.jdx.dev/).

```shell
$ mise install

$ npm install

$ npm install -g firebase-tools

$ firebase login

$ firebase use tradedex-localhost

# deploy firebase rules
$ firebase deploy --only firestore:rules

$ npm run dev
```
