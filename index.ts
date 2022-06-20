import { BlockChain } from '@core/index'
import { P2PServer, Message, MessageType } from './src/serve/p2p'
import peers from './peer.json'
import express from 'express'

const app = express()
const bc = new BlockChain()
const ws = new P2PServer()

app.use(express.json())

// http://web7722:1234@localhost:3000
app.use((req, res, next) => {
    const baseAuth: string = (req.headers.authorization || '').split(' ')[1]
    console.log(req.headers.authorization)
    console.log(baseAuth)

    if (baseAuth === '') return res.status(401).send()

    const [userid, userpw] = Buffer.from(baseAuth, 'base64').toString().split(':')
    if (userid !== 'web7722' || userpw !== '1234') return res.status(401).send()

    next()
})

app.get('/', (req, res) => {
    res.send('hellO?')
})

// 블록 내용
app.get('/chains', (req, res) => {
    res.json(ws.getChain())
})
// 블록 채굴
app.post('/mineBlock', (req, res) => {
    const { data } = req.body
    const newBlock = ws.addBlock(data)
    if (newBlock.isError) return res.status(500).json(newBlock.error)
    const msg: Message = {
        type: MessageType.latest_block,
        payload: {},
    }
    ws.broadcast(msg)
    res.json(newBlock.value)
})
// ws
app.post('/addToPeer', (req, res) => {
    const { peer } = req.body
    console.log(peer)
    ws.connectToPeer(peer)
})
// app.get('/blockServer/:text', (req, res) => {
//     const { text } = req.body
//
//     ws.searchData(text)
// })

app.get('/addPeers', (req, res) => {
    peers.forEach((peer) => {
        ws.connectToPeer(peer)
    })
})
// peer 확인
app.get('/peers', (req, res) => {
    const sockets = ws.getSockets().map((s: any) => s._socket.remoteAddress + ':' + s._socket.remotePort)
    res.json(sockets)
})

app.post('/sendTransaction', (req, res) => {
    res.json([])
})

app.listen(3000, () => {
    console.log('서버시작 3000')
    ws.listen()
})
