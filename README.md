# Canvatorium

An experimental design lab for spatial computing.

## Project setup

```
npm install
```

### Compiles and hot-reloads for development

```
npm run serve
```

### Compiles and minifies for production

```
npm run build
```

### Lints and fixes files

```
npm run lint
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).

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

### Babylon JS

Install the latest Babylon JS 5.0 Preview

```
npm install --save babylonjs@preview babylonjs-gui@preview babylonjs-materials@preview

```
