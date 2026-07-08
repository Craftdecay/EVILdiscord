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
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";



const email = document.getElementById("email");
const password = document.getElementById("password");


document.getElementById("register").onclick = async()=>{

await createUserWithEmailAndPassword(
auth,
email.value,
password.value
);

};



document.getElementById("login").onclick = async()=>{

await signInWithEmailAndPassword(
auth,
email.value,
password.value
);

};



onAuthStateChanged(auth,user=>{

if(user){

document.querySelector(".login").style.display="none";

document.querySelector(".chat").style.display="flex";

loadMessages();

}

});



const messages=document.getElementById("messages");


async function sendMessage(){

let input=document.getElementById("messageInput");


if(input.value.trim()=="")
return;


await addDoc(collection(db,"messages"),{

text:input.value,

user:auth.currentUser.email,

time:serverTimestamp()

});


input.value="";

}


document.getElementById("send").onclick=sendMessage;



function loadMessages(){

const q=query(
collection(db,"messages"),
orderBy("time")
);


onSnapshot(q,(snapshot)=>{

messages.innerHTML="";


snapshot.forEach(doc=>{

let data=doc.data();


messages.innerHTML +=
`
<div>
<b>${data.user}</b>: ${data.text}
</div>
`;

});


});

}
