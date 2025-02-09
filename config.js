const USE_LOCAL_API = false; // Change to `false` when switching to RESTdb.io

const API_URL = USE_LOCAL_API
    ? "http://localhost:5000/listing"
    : "https://mokesell-0044.restdb.io/rest/listing";

const API_KEY = "67a89ea999fb60036de983c8"; // Only used for RESTdb.io
