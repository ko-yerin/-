import express from 'express'
import nunjucks from 'nunjucks'
import { Wallet } from './wallet'
import axios from 'axios'
import { readFileSync } from 'fs'

const app = express()

//axios관련부분

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
app.post('/sendTransaction', (req, res) => {
    console.log(req.body)
    res.json({})
})

app.listen(3005, () => {
    console.log('지갑 서버 시작', 3005)
})

//npm run dev:ts ./wallet/server.ts
