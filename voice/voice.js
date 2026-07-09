import { startSignaling, stopSignaling } from "./signaling.js";
import { auth } from "../firebase.js";

export let localStream = null;
export let currentVoiceChannel = null;

export const peerConnections = new Map();

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

export async function joinVoice(channelName) {
    
    try {

        if (!localStream) {

            localStream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false
            });

            console.log("Microphone stream:", localStream);
            console.log("Tracks:", localStream.getAudioTracks());
            console.log("Track state:", localStream.getAudioTracks()[0].readyState);

        }

        currentVoiceChannel = channelName;

        const controls = document.getElementById("voiceControls");
        if (controls) {
            controls.style.display = "flex";
        }

        const status = document.getElementById("voiceStatus");
        if (status) {
            status.textContent = "Connected to " + channelName;
        }

        console.log("Joined voice:", channelName);


        // Start WebRTC signaling
        await startSignaling(channelName);

    } catch (err) {

        console.error(err);
        alert("Couldn't access your microphone.");

    }

}

export async function leaveVoice() {
    
    await stopSignaling();

    peerConnections.forEach(pc => pc.close());
    peerConnections.clear();

    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }

    localStream = null;
    currentVoiceChannel = null;

    const controls = document.getElementById("voiceControls");
    if (controls) {
        controls.style.display = "none";
    }

    const status = document.getElementById("voiceStatus");
    if (status) {
        status.textContent = "Not connected";
    }

    console.log("Left voice");

}

export async function createPeer(userId) {

    pc.onicecandidate = (event)=>{

    if(event.candidate){

        import("./signaling.js")
        .then(module=>{

            module.sendSignal(
                currentVoiceChannel,
                {
                    type:"ice",
                    target:userId,
                    candidate:event.candidate,
                    sender:auth.currentUser.uid
                }
            );

        });
    
    if (peerConnections.has(userId)) {
        return peerConnections.get(userId);
    }

    const pc = new RTCPeerConnection(rtcConfig);

    peerConnections.set(userId, pc);

    if (localStream) {
        localStream.getTracks().forEach(track => {
            pc.addTrack(track, localStream);
        });
    }

    pc.onconnectionstatechange = () => {
        console.log(`${userId} Connection: ${pc.connectionState}`);
    };

    pc.oniceconnectionstatechange = () => {
        console.log(`${userId} ICE: ${pc.iceConnectionState}`);
    };

    pc.ontrack = (event) => {

        let audio = document.getElementById("audio-" + userId);

        if (!audio) {

            audio = document.createElement("audio");
            audio.id = "audio-" + userId;
            audio.autoplay = true;

            document.body.appendChild(audio);

        }

        audio.srcObject = event.streams[0];

    };

    pc.onicecandidate = (event) => {

    if (!event.candidate) return;


    import("./signaling.js")
        .then(({ sendSignal }) => {

            sendSignal(
                currentVoiceChannel,
                {
                    type: "ice",
                    target: userId,
                    candidate: event.candidate,
                    sender: auth.currentUser.uid
                }
            );

        });
    
    return pc;
    }
}
