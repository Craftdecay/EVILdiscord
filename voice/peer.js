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

const peers = new Map();

export function getPeer(id) {
    return peers.get(id);
}

export function removePeer(id) {

    if (!peers.has(id)) return;

    peers.get(id).close();

    peers.delete(id);

}

export function createPeer(id, stream) {

    if (peers.has(id))
        return peers.get(id);

    const pc = new RTCPeerConnection(rtcConfig);

    peers.set(id, pc);

    stream.getTracks().forEach(track => {

        pc.addTrack(track, stream);

    });

    pc.onconnectionstatechange = () => {

        console.log(
            id,
            pc.connectionState
        );

    };

    pc.oniceconnectionstatechange = () => {

        console.log(
            id,
            pc.iceConnectionState
        );

    };

    pc.ontrack = (event) => {

        let audio = document.getElementById("audio-" + id);

        if (!audio) {

            audio = document.createElement("audio");

            audio.id = "audio-" + id;

            audio.autoplay = true;

            document.body.appendChild(audio);

        }

        audio.srcObject = event.streams[0];

    };

    return pc;

}
