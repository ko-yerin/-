//wallet서버
import express from 'express' //node js의 라이브러리로 간편하게 웹서버를 구축할수 있게 도와준다
import nunjucks from 'nunjucks'
import { Wallet } from './wallet'
import axios from 'axios'
//axios
//백엔드랑 프론트엔드랑 통신을 쉽게하기 위해

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
        Authorization: 'Basic ' + baseAuth, //Basic다음  띄어쓰기 해야됨
        'Content-type': 'application/json', //변수명에 -를 사용할수없어서  스트링으로
    },
})

app.use(express.json())
app.set('view engine', 'html')
nunjucks.configure('views', {
    express: app,
    watch: true, //HTML 파일이 변경될 때에 템플릿 엔진을 reload
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
    const list = Wallet.getWalletList()
    res.json(list)
})

//view
app.get('/wallet/:account', async (req, res) => {
    const { account } = req.params //파람스?
    const privateKey = Wallet.getWalletPrivateKey(account) //private key가져오는거,
    const myWallet = new Wallet(privateKey)

    const response = await request.post('/getBalance', { account })
    console.log('바란스', response.data.balance)
    myWallet.balance = response.data.balance
    res.json(myWallet)
})

//sendTransaction(글쓰기)
app.post('/sendTransaction', async (req, res) => {
    console.log('req.body:', req.body)

    // req.body: {
    //     sender: {
    //       publicKey: '030224c3601cb70246640b5c8dca9dcc5afdef596fae97a8fbeb2b3f7123bcded2',
    //       account: 'ca9dcc5afdef596fae97a8fbeb2b3f7123bcded2'
    //     },
    //     received: '0e5954ae640884adaead26f399a5af56bd81b057',
    //     amount: 10
    //   }
    //   txObject: {
    //     sender: '030224c3601cb70246640b5c8dca9dcc5afdef596fae97a8fbeb2b3f7123bcded2',
    //     received: '0e5954ae640884adaead26f399a5af56bd81b057',
    //     amount: 10,
    //     signature: Signature {
    //       r: BN { negative: 0, words: [Array], length: 10, red: null },
    //       s: BN { negative: 0, words: [Array], length: 10, red: null },
    //       recoveryParam: 0
    //     }

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

    console.log('txObject:', txObject)

    const response = await request.post('/sendTransaction', txObject)
    console.log('response.data:', response.data)
    res.json({})
})

app.listen(3005, () => {
    console.log('지갑 서버 시작', 3005)
})

//npm run dev:ts ./wallet/server.ts
