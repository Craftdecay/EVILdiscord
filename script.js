import { auth, db } from "./firebase.js";

import {
    joinVoice,
    leaveVoice
} from "./voice/voice.js";

import {
    collection,
    doc,
    setDoc,
    deleteDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    addDoc,
    onSnapshot,
    serverTimestamp,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const email = document.getElementById("email");
const password = document.getElementById("password");
const username = document.getElementById("username");

const messages = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const send = document.getElementById("send");


let currentUsername = "";
let currentVoiceChannel = null;
let unsubscribeVoice = null;
let peerConnection = null;
let localStream = null;

const rtcConfig = {
    iceServers: [
        {
            urls: [
                "stun:stun.l.google.com:19302",
                "stun:stun1.l.google.com:19302"
            ]
        }
    ]
};

async function createPeerConnection() {

    peerConnection = new RTCPeerConnection(rtcConfig);

    localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
    });

    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });

    peerConnection.onconnectionstatechange = () => {

        console.log(
            "Connection:",
            peerConnection.connectionState
        );

    };

    async function createOffer(){

    const callDoc = doc(
        collection(db,"calls")
    );

    const offerCandidates = collection(
        callDoc,
        "offerCandidates"
    );

    const answerCandidates = collection(
        callDoc,
        "answerCandidates"
    );

    peerConnection.onicecandidate = async(event)=>{

        if(event.candidate){

            await addDoc(
                offerCandidates,
                event.candidate.toJSON()
            );

        }

    };

    const offer =
        await peerConnection.createOffer();

        await createOffer();

    await peerConnection.setLocalDescription(
        offer
    );

    await setDoc(callDoc,{
        offer:{
            sdp:offer.sdp,
            type:offer.type
        }
    });

    console.log(
        "Call ID:",
        callDoc.id
    );

}
    
    peerConnection.oniceconnectionstatechange = () => {

        console.log(
            "ICE:",
            peerConnection.iceConnectionState
        );

    };

}

async function joinVoiceChannel(channelName) {

    currentVoiceChannel = channelName;
    
    await createPeerConnection();
    
    await setDoc(
        doc(db, "voiceChannels", channelName, "participants", auth.currentUser.uid),
        {
            username: currentUsername,
            joinedAt: serverTimestamp()
        }
    );

    document.getElementById("voiceStatus").textContent =
        "Connected to " + channelName;

    document.getElementById("voiceControls").style.display = "flex";

    watchVoiceChannel(channelName);
}

async function leaveVoiceChannel() {

    if (!currentVoiceChannel) return;

    await deleteDoc(
        doc(
            db,
            "voiceChannels",
            currentVoiceChannel,
            "participants",
            auth.currentUser.uid
        )
    );

    currentVoiceChannel = null;

    if (unsubscribeVoice) {
        unsubscribeVoice();
        unsubscribeVoice = null;
    }

    document.getElementById("voiceControls").style.display = "none";
}

function watchVoiceChannel(channelName) {

    if (unsubscribeVoice) unsubscribeVoice();

    unsubscribeVoice = onSnapshot(
        collection(db, "voiceChannels", channelName, "participants"),
        (snapshot) => {

            console.clear();

            console.log("Voice channel:", channelName);

            snapshot.forEach(user => {

                console.log(user.data().username);

            });

        }
    );

}

document.querySelectorAll(".voice-channel").forEach(channel => {

    channel.onclick = () => {

        joinVoiceChannel(channel.dataset.channel);
    };

});

document.getElementById("leaveVoice").onclick =
    leaveVoiceChannel;

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
