export let localStream = null;
export let currentVoiceChannel = null;

export async function joinVoice(channelName){

    try{

        localStream = await navigator.mediaDevices.getUserMedia({
            audio:true,
            video:false
        });

        currentVoiceChannel = channelName;

        document.getElementById("voiceControls").style.display="flex";

        document.getElementById("voiceStatus").textContent =
            "Connected to " + channelName;

        console.log("Joined",channelName);

    }catch(err){

        alert("Microphone permission denied.");

    }

}

export function leaveVoice(){

    if(localStream){

        localStream.getTracks().forEach(track=>track.stop());

    }

    localStream = null;
    currentVoiceChannel = null;

    document.getElementById("voiceControls").style.display="none";

    console.log("Left voice");

}
