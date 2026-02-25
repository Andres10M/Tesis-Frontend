// src/services/api.ts
//import axios from "axios";

//export const api = axios.create({
  // baseURL: "http://localhost:3000",
 // headers: {
    //"Content-Type": "application/json",
  //},
//});

import axios from "axios";

export const api = axios.create({
  baseURL: "http://72.60.10.162:4000",
  headers: {
    "Content-Type": "application/json",
  },
});

