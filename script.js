const messages = document.getElementById("messages");
const input = document.getElementById("messageInput");
const send = document.getElementById("send");

function sendMessage(){

    if(input.value.trim()=="") return;

    const div = document.createElement("div");
    div.className="message";
    div.innerHTML="<b>You:</b> "+input.value;

    messages.appendChild(div);

    input.value="";

    messages.scrollTop=messages.scrollHeight;
}

send.onclick=sendMessage;

input.addEventListener("keypress",e=>{
    if(e.key==="Enter"){
        sendMessage();
    }
});
