# Pokémon Trade Dex

Mark the cards you own, set your Friend ID on your profile, share with friends, and discover what cards you can exchange with each other.

The cards are provided by https://github.com/chase-manning/pokemon-tcg-pocket-cards.

## Development

How to prepare localhost for development:

```shell
$ cp .env.local.sample .env.local
```

Fill the environment variables with your Google Firebase project credentials.

```shell
$ npm install

$ npm install -g firebase-tools

$ firebase login

$ firebase use tradedex-localhost

# deploy firebase rules
$ firebase deploy --only firestore:rules

$ npm run dev
```
