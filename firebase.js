import { initializeApp } from 
"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import { getAuth }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { getFirestore }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyCD29E2T1SwYxrNEnM10Xg_fd7N3zjXIwU",
  authDomain: "evildiscord.firebaseapp.com",
  projectId: "evildiscord",
  storageBucket: "evildiscord.firebasestorage.app",
  messagingSenderId: "400229577654",
  appId: "1:400229577654:web:e23abf19c9e1493a680717"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);
