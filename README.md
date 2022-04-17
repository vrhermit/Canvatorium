# Canvatorium

An experimental design lab for spatial computing built in Vue JS and Babylon JS.

Canvatorium is a place where I'm experimenting with UI/UX ideas in WebXR, mostly in the context of VR.

- Read about the project [here](https://radicalappdev.com/2022/01/20/canvatorium/)
- Issues and ideas can be found [here](https://github.com/users/vrhermit/projects/3/views/4)

---

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

## Local network SSL certs

WebXR scenes need to be served over HTTPS. While working on the project locally, I often need to test the scene on another device such as an Oculus Quest 2. I followed the steps in the article linked below and configured the project with some self-signed certs that will work for local network testing. The browser may still warn or block these certs, but you can click past the warning and access the scene. If you are working with a VR headset attached to your PC, then you can remove the https object from `vue.config.js`.

Alternative: you can use ngrok to forward your local dev server to a URL. I found this to be really slow and prone to errors...

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

Babylon JS 5.0 is in beta as of time of writing. With updates shipping often, it find it best to install all of the dependencies at once after a new release.
Install the latest Babylon JS 5.0 Preview

```
npm install --save babylonjs@preview babylonjs-gui@preview babylonjs-loaders@preview
npm install --save babylonjs-materials@preview
npm install --save-dev babylonjs-inspector@preview

```
