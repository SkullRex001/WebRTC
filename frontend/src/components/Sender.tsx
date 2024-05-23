import { useEffect, useState } from "react"

const Sender = () => {
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8080/');
        socket.onopen = () => {
            socket.send(JSON.stringify({
                type: 'identify-as-sender'
            }))
        }

        setSocket(socket)

    }, [])

    async function startSendingVideo() {
        //create an offer
        if (!socket) return;
        const pc = new RTCPeerConnection();

        pc.onnegotiationneeded = async () => {
            console.log("On negotiation needed")
            const offer = await pc.createOffer(); //sdp
            await pc.setLocalDescription(offer);
            socket?.send(JSON.stringify({ type: 'create-offer', offer }))
            //or
            // socket?.send(JSON.stringify({type : 'create-offer' ,  offer : pc.localDescription}))

        }

        pc.onicecandidate = (event) => {
            console.log("Stunn server sent Sender's ice candidates")
            if (event.candidate) {
                socket.send(JSON.stringify({ type: 'iceCandidate', candidate: event.candidate }))
            }
        }

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'createAnswer') {
                pc.setRemoteDescription(data.answer)
            }
            else if (data.type === 'iceCandidate') {
                pc.addIceCandidate(data.candidate)
            }

        }

        // socket.close() can kill the connection after all the ice candidates have been sent

        const stream = await navigator.mediaDevices.getUserMedia({video : true , audio : true})
        
        pc.addTrack(stream.getVideoTracks()[0] )
        //this will on negotiation needed

        const video = document.createElement('video')
        document.body.appendChild(video)
        video.srcObject = stream;
        video.play()

    }



    return (
        <div>
            Sender
            <button onClick={startSendingVideo}> Send Video</button>
        </div>
    )
}

export default Sender