import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import fs from "fs";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 8080,
    https: {
      key: fs.readFileSync(".certs/key.pem"),
      cert: fs.readFileSync(".certs/cert.pem")
    }
  },
  plugins: [vue()]
});
