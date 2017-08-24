# Tutorial: Using three.js and anime.js to make Tell Me When My Chromebook Gets Play Store

The code for the [tutorial at ryannjohnson.com](https://ryannjohnson.com/using-animejs-and-threejs-to-make-tell-me-when-chromebook-gets-play-store/).

## Compile

Run the following in your terminal:

```bash
$ npm install && npm run build
```

You can then open up `public/index.html` in your browser directly or alternatively run `npm run server` and navigate to <http://127.0.0.1:8080/>.

### Development

The `package.json` file contains some scripts for watching changes to files.

```bash
$ npm run watch-css &
$ npm run watch-js &
```

As written above, these commands run in the background. Pull them forward with `fg` and cancel them with `ctrl+c` before exiting your terminal.
