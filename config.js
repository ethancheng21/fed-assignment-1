const USE_LOCAL_API = false; // Change to `false` when switching to RESTdb.io

const API_URL = USE_LOCAL_API
    ? "http://localhost:5000/listing"
    : "https://mokesell-5205.restdb.io/rest/listing";

const API_KEY = "67a8a93399fb60857de983d6"; // Only used for RESTdb.io
