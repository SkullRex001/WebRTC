import { useEffect, useRef, useState } from "react"

const Receiver = () => {

    const [socket , useSocket] = useState<WebSocket|null>(null)
    const [pc , setPc] = useState<RTCPeerConnection| null>(null)
    const videoRef = useRef<HTMLVideoElement>(null)

    useEffect(()=>{
        const socket = new WebSocket('ws://localhost:8080/');
        socket.onopen = () => {
            socket.send(JSON.stringify({type :"identify-as-receiver"}))
        }
        useSocket(socket)
        
        socket.onmessage = async (event) => {
            console.log('Event of Reciver' , event)
            const message = JSON.parse(event.data)
            if(message.type === 'createOffer')
                {
                    const pc = new RTCPeerConnection()
                    setPc(pc) 
                    pc.setRemoteDescription(message.offer)

                    pc.onicecandidate = (event)=>{
                        console.log("Stunn server returned the ice candidates of Reciever")
                        if(event.candidate){
                            socket?.send(JSON.stringify({type : 'iceCandidate' , candidate : event.candidate }))
                        }
                    }
                    
                    //i think i will move this later
                    pc.ontrack = (event)=>{
                        console.log("Media Recievend")
                        const video = document.createElement('video')
                        document.body.appendChild(video)
                        video.srcObject  = new MediaStream([event.track]);
                        video.play()
                    }


                    const answer = await pc.createAnswer()
                    await pc.setLocalDescription(answer)
                    socket.send(JSON.stringify({
                        type : 'create-answer' , answer
                    }))

                }
                else if (message.type ==='iceCandidate' ){
                    console.log('Peer Connection From State Variable' , pc)
                    pc?.addIceCandidate(message.candidate)
                    
                }

        }




    } ,[])


  return (
    <>
    <div>Receiver</div>
    <video ref={videoRef}></video>
    </>
  )
}

export default Receiver