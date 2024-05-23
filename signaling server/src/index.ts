//signaling server
//stunn serevr :- stun:stun.l.google.com:19302
import { RawData, WebSocket,  WebSocketServer } from "ws";


const wss = new WebSocketServer({port : 8080})

let senderSocket: null | WebSocket = null;
let receiverSocket: null | WebSocket = null;

// interface message {
//     message? : string | null
// }


wss.on('connection' , (ws)=>{
   
    console.log("Socket running")
    ws.on('error' , (err)=>{
        console.log(err)
    })

    ws.on('message' , (data: RawData)=>{
        try{
            const message = JSON.parse(data.toString())
            ws.send(JSON.stringify({message : 'Thanks For Connecting'}))
            
            if(message.type === 'identify-as-sender'){
                console.log('sender set')
      
                senderSocket = ws
            }

            else if (message.type === 'identify-as-receiver') {
                console.log('reciever set')
      
                receiverSocket = ws
            }

            else if (message.type === 'create-offer'){
                console.log('offer sent')
                receiverSocket?.send(JSON.stringify({type : "createOffer" , offer : message.offer}))
            }

            else if (message.type === 'create-answer'){
                console.log('answer sent')
                senderSocket?.send(JSON.stringify({type : "createAnswer" , answer : message.answer}))
            }

            else if (message.type === 'iceCandidate'){
               
                if(ws === senderSocket){
                    console.log('ice candidates of sender sent')
                    receiverSocket?.send(JSON.stringify({
                        type : 'iceCandidate' , candidate : message.candidate
                    }))
                   
                }

                else if( ws === receiverSocket) {
                    console.log('ice candidates of reciever sent')
                    senderSocket?.send(JSON.stringify({
                        type : 'iceCandidate' ,candidate : message.candidate
                    }))
                }
            }


        }
        catch(err : any) {
            console.log("ERROR ", err.message)
        }
      
    })
})
