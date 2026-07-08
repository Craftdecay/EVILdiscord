import { auth, db } from "./firebase.js";

import {
    joinVoice,
    leaveVoice
} from "./voice.js";

document.querySelectorAll(".voice-channel").forEach(channel => {
    channel.addEventListener("click", () => {
        console.log("Clicked:", channel.dataset.channel);
        alert("Clicked " + channel.dataset.channel);
    });
});

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    collection,
    addDoc,
    onSnapshot,
    serverTimestamp,
    query,
    orderBy,
    doc,
    setDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const email = document.getElementById("email");
const password = document.getElementById("password");
const username = document.getElementById("username");

const messages = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const send = document.getElementById("send");


let currentUsername = "";

window.addEventListener("error", (e) => {
    console.error("Script error:", e.error || e.message);
});

// Create account
document.getElementById("register").onclick = async () => {
    try {

        if (username.value.trim() === "") {
            alert("Please enter a username");
            return;
        }

        const userCredential = await createUserWithEmailAndPassword(
            auth,
            email.value.trim(),
            password.value
        );

        await setDoc(
            doc(db, "users", userCredential.user.uid),
            {
                username: username.value.trim(),
                email: email.value.trim()
            }
        );

        alert("Account created!");

    } catch (error) {
        console.error(error);
        alert(error.code + "\n" + error.message);
    }
};



document.getElementById("login").onclick = async () => {
    try {

        const userCredential = await signInWithEmailAndPassword(
            auth,
            email.value.trim(),
            password.value
        );

        console.log(userCredential.user);
        alert("Logged in!");

    } catch (error) {
        console.error(error);
        alert(error.code + "\n" + error.message);
    }
};


// Check login status
onAuthStateChanged(auth, async(user)=>{

    if(user){

        const userData = await getDoc(
            doc(db,"users",user.uid)
        );


        if(userData.exists()){

            currentUsername = userData.data().username;

        }


        document.querySelector(".login").style.display="none";

        document.querySelector(".chat").style.display="flex";


        loadMessages();

    }

});



// Send messages
async function sendMessage(){

    if(messageInput.value.trim() === "")
        return;


    await addDoc(
        collection(db,"messages"),
        {
            text: messageInput.value,

            username: currentUsername,

            timestamp: serverTimestamp()
        }
    );


    messageInput.value="";

}


send.onclick = sendMessage;


messageInput.addEventListener("keydown",(e)=>{

    if(e.key === "Enter"){
        sendMessage();
    }

});



// Load messages live
function loadMessages(){

    const q = query(
        collection(db,"messages"),
        orderBy("timestamp")
    );


    onSnapshot(q,(snapshot)=>{

        messages.innerHTML="";


        snapshot.forEach((doc)=>{

            const data = doc.data();


            messages.innerHTML += `

            <div class="message">

                <b>${data.username}</b>: 
                ${data.text}

            </div>

            `;


        });


        messages.scrollTop = messages.scrollHeight;

    });

}
console.log("Bottom of script reached!");

document.querySelectorAll(".voice-channel").forEach(channel => {
    console.log("Found channel:", channel.dataset.channel);

    channel.addEventListener("click", () => {
        console.log("Clicked:", channel.dataset.channel);
        alert("Clicked " + channel.dataset.channel);
    });
});
