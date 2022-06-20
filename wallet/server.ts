import express from 'express'
import nunjucks from 'nunjucks'
import { Wallet } from './wallet'
import axios from 'axios'

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
//view
//sendTransaction(글쓰기)

app.listen(3005, () => {
    console.log('지갑 서버 시작', 3005)
})

//npm run dev:ts ./wallet/server.ts
