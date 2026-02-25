// src/services/api.ts
//import axios from "axios";

//export const api = axios.create({
  // baseURL: "http://localhost:3000",
 // headers: {
    //"Content-Type": "application/json",
  //},
//});

import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_URL || "/api";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});