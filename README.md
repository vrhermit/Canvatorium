# Canvatorium

An experimental design lab for spatial computing.

## Notes about local development

Set up project

```
npm install
```

Run local dev server

```
npm run dev
```

## Local network SSL certs

Used for testing the WebXR scene on an Oculus Quest while connected to the dev server over the local network.
More info: https://bharathvaj.me/blog/use-ssl-with-vue-cli-locally

run

```
mkdir -p .certs
```

then

```
mkcert -key-file ./.certs/key.pem -cert-file ./.certs/cert.pem "localhost"
```

If you don't want to use these certs just disable the following lines in `vue.config.js`

```
 https: {
      key: fs.readFileSync(".certs/key.pem"),
      cert: fs.readFileSync(".certs/cert.pem")
    },
```

## NGROK NOTES

To test this on a standalone device such as an Oculus Quest 2, use ngrok to to tunnel the local dev server to an endpoint. I have ngrok installed at `c://DevTools/`.

```
c://DevTools/ngrok.exe http 3000

c://DevTools/ngrok.exe http 3000 -host-header="localhost:3000"
```

Install the latest Babylon JS 5.0 Preview

```
npm i --save @babylonjs/core@preview @babylonjs/gui@preview @babylonjs/loaders@preview

```
