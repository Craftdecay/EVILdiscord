import {auth, db} from "./firebase.js";


import {
createUserWithEmailAndPassword,
signInWithEmailAndPassword,
onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    collection,
    addDoc,
    onSnapshot,
    serverTimestamp,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const messages = document.getElementById("messages");
const input = document.getElementById("messageInput");
const send = document.getElementById("send");


// Send message publicly
async function sendMessage(){

    if(input.value.trim() === "")
        return;


    await addDoc(collection(db,"messages"),{

        text: input.value,

        username: auth.currentUser.email,

        timestamp: serverTimestamp()

    });


    input.value = "";

}


send.onclick = sendMessage;


input.addEventListener("keydown",(e)=>{

    if(e.key === "Enter"){
        sendMessage();
    }

});


// Receive messages live
const messageQuery = query(
    collection(db,"messages"),
    orderBy("timestamp")
);


onSnapshot(messageQuery,(snapshot)=>{


    messages.innerHTML="";


    snapshot.forEach((doc)=>{

        let data = doc.data();


        messages.innerHTML += `

        <div class="message">

        <b>${data.username}</b>

        : ${data.text}

        </div>

        `;


    });


});
