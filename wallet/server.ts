import express from 'express'
import nunjucks from 'nunjucks'
import { Wallet } from './wallet'
import axios from 'axios'

const app = express()

// const userid = 'web7722'
// const userpw = '1234'

// const baseAuth = Buffer.from(userid + ':' + userpw).toString('base64')

const userid = process.env.USERID || 'web7722'
const userpw = process.env.USERPW || '1234'
const baseURL = process.env.BASEURL || 'http://localhost:3000'

const baseAuth = Buffer.from(userid + ':' + userpw).toString('base64')

//axios관련부분
const request = axios.create({
    baseURL, //http://localhost:3000를 칠때마다 안치고 default로 깔려있게  그래서 /만 치면됨
    headers: {
        Authorization: 'Basic' + baseAuth,
        'Content-type': 'application/json', //변수명에 -를 사용할수없어서  스트링으로
    },
})

app.use(express.json())
app.set('view engine', 'html')
nunjucks.configure('views', {
    express: app,
    watch: true,
})

app.get('/', (req, res) => {
    res.render('index', { data: new Wallet() })
})

app.post('/newWallet', (req, res) => {
    res.json(new Wallet())
})

//만들거
//list
app.post('/walletList', (req, res) => {
    console.log('wallet list')
    const list = Wallet.getWalletList()
    res.json(list)
})

//view
app.get('/wallet/:account', (req, res) => {
    const { account } = req.params //파람스?
    console.log('wallet', account)
    const privateKey = Wallet.getWalletPrivateKey(account) //private key가져오는거
    res.json(new Wallet(privateKey))
})

//sendTransaction(글쓰기)
app.post('/sendTransaction', async (req, res) => {
    console.log(req.body)

    const {
        sender: { account, publicKey },
        received,
        amount,
    } = req.body

    //서명만들떄 필요한값  SHA256(보낼사람:공개키+받는사람:계정, 보낼양).toString
    //HASH + PrivateKey-->서명
    const signature = Wallet.createSign(req.body)
    //보낼사람:공개키,  받는사람:계정, 보낼양, 서명
    const txObject = {
        sender: publicKey,
        received,
        amount,
        signature,
    }

    console.log(txObject)

    const response = await request.post('/sendTransaction')
    console.log(response.data)
    res.json({})
})

app.listen(3005, () => {
    console.log('지갑 서버 시작', 3005)
})

//npm run dev:ts ./wallet/server.ts
