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

        }

        currentVoiceChannel = channelName;

        document.getElementById("voiceControls").style.display = "flex";

        document.getElementById("voiceStatus").textContent =
            "Connected to " + channelName;

        console.log("Joined voice:", channelName);

    } catch (err) {

        console.error(err);

        alert("Couldn't access your microphone.");

    }

}

export function leaveVoice() {

    peerConnections.forEach(pc => pc.close());
    peerConnections.clear();

    if (localStream) {

        localStream.getTracks().forEach(track => track.stop());

    }

    localStream = null;
    currentVoiceChannel = null;

    document.getElementById("voiceControls").style.display = "none";

    console.log("Left voice");

}

export async function createPeer(userId) {

    if (peerConnections.has(userId))
        return peerConnections.get(userId);

    const pc = new RTCPeerConnection(rtcConfig);

    peerConnections.set(userId, pc);

    localStream.getTracks().forEach(track => {

        pc.addTrack(track, localStream);

    });

    pc.onconnectionstatechange = () => {

        console.log(
            userId,
            pc.connectionState
        );

    };

    pc.oniceconnectionstatechange = () => {

        console.log(
            userId,
            pc.iceConnectionState
        );

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

    return pc;

}
