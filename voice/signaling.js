import {
    createPeer,
    peerConnections,
    currentVoiceChannel
} from "./voice.js";

import {
    db,
    auth
} from "../firebase.js";

import {
    collection,
    addDoc,
    onSnapshot,
    query,
    where,
    serverTimestamp,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


let signalListener = null;
let userPresenceDoc = null;


export async function startSignaling(channelName) {

    const user = auth.currentUser;

    if (!user) {
        console.error("No logged in user");
        return;
    }


    const uid = user.uid;


    /*
        Add ourselves to voice channel
    */

    const presenceRef = await addDoc(
        collection(
            db,
            "voiceChannels",
            channelName,
            "participants"
        ),
        {
            uid,
            joinedAt: serverTimestamp()
        }
    );


    userPresenceDoc = presenceRef;



    /*
        Watch for signals
    */

    const signals = collection(
        db,
        "voiceChannels",
        channelName,
        "signals"
    );


    const signalQuery = query(
        signals,
        where("target", "==", uid)
    );


    signalListener = onSnapshot(
        signalQuery,
        async snapshot => {


            for (const change of snapshot.docChanges()) {


                if (change.type !== "added")
                    continue;


                const data = change.doc.data();



                /*
                    Ignore our own signals
                */

                if (data.sender === uid)
                    continue;



                await handleSignal(
                    data,
                    channelName
                );



                await deleteDoc(
                    doc(
                        db,
                        "voiceChannels",
                        channelName,
                        "signals",
                        change.doc.id
                    )
                );

            }

        }
    );



    /*
        Watch participants
        to connect to new users
    */


    const participants = collection(
        db,
        "voiceChannels",
        channelName,
        "participants"
    );


    onSnapshot(
        participants,
        snapshot => {


            snapshot.forEach(async p => {


                const other = p.data().uid;


                if(other === uid)
                    return;



                /*
                    Only the newer user creates offer
                */

                if(uid > other)
                    return;



                if(peerConnections.has(other))
                    return;



                await createOffer(
                    other,
                    channelName
                );


            });

        }
    );



    console.log(
        "Voice signaling started:",
        channelName
    );

}





async function createOffer(
    userId,
    channelName
){


    const pc = await createPeer(userId);


    const offer =
        await pc.createOffer();


    await pc.setLocalDescription(
        offer
    );



    await sendSignal(
        channelName,
        {
            type:"offer",
            target:userId,
            offer,
            sender:auth.currentUser.uid
        }
    );

}





async function handleSignal(
    data,
    channelName
){


    const sender = data.sender;


    const pc =
        await createPeer(sender);



    if(data.type === "offer"){


        await pc.setRemoteDescription(
            data.offer
        );


        const answer =
            await pc.createAnswer();


        await pc.setLocalDescription(
            answer
        );


        await sendSignal(
            channelName,
            {
                type:"answer",
                target:sender,
                answer,
                sender:auth.currentUser.uid
            }
        );

    }



    if(data.type === "answer"){


        await pc.setRemoteDescription(
            data.answer
        );

    }



    if(data.type === "ice"){


        await pc.addIceCandidate(
            data.candidate
        );

    }


}





export async function sendSignal(
    channelName,
    data
){


    await addDoc(

        collection(
            db,
            "voiceChannels",
            channelName,
            "signals"
        ),

        {
            ...data,
            createdAt:serverTimestamp()
        }

    );

}





export async function stopSignaling(){


    if(signalListener){
        signalListener();
        signalListener=null;
    }


    if(userPresenceDoc){

        await deleteDoc(
            userPresenceDoc
        );

        userPresenceDoc=null;
    }


    console.log(
        "Voice signaling stopped"
    );

}
