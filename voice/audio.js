export function playRemoteAudio(id, stream) {

    let audio = document.getElementById("audio-" + id);

    if (!audio) {

        audio = document.createElement("audio");

        audio.id = "audio-" + id;

        audio.autoplay = true;

        document.body.appendChild(audio);

    }

    audio.srcObject = stream;

}
