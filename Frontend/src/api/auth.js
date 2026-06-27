// src/api/auth.js
import client from "./client";

export const apiSignup = (data) =>
  client.post("/signup", data);           // returns { user, access_token }

export const apiSubmitKYC = (formData) =>
  client.post("/kyc/submit", formData);   // multipart/form-data

export const apiLogin = (data) =>
  client.post("/login", data);            // returns { access_token }