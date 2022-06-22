//blockchain서버
import { BlockChain } from '@core/index' //현재위치가 어디에있던  core부터시작하고 싶으면   @core라고 시작하면된다
import { P2PServer, Message, MessageType } from './src/serve/p2p'
import peers from './peer.json'
import express from 'express' //node js의 라이브러리로 간편하게 웹서버를 구축할수 있게 도와준다
import { ReceivedTx, Wallet } from '@core/wallet/wallet'
//여기서는  P2P.ts를  import했고 P2P.ts 폴더에서는 웹소켓을 사용하기 위해 websocket라이브러리를 import해서 사용하고 있다
//지갑서버에서는  사용자가 요청을 했을때만  블럭서버에 요청을 보내고 응답을 받아서 답을 해주는 방식으로 이루어지니까
//웹소켓통신을 안해도 되지만
//블록체인 서버에서는  블록끼리 계속 연결되서 서로 검증을 해야되기 때문에 웹소켓 통신을 해야된다

//peer.json파일안에는  체인을 연결할  ip주소들을  배열형태로 넣어준다(peer.json파일을 만든이유는 연결할 ip주소를 넣어줄 목적.1명하고만 연결할거면 1명꺼만 넣어줘도됨)
//peer.json에 적어주면 100명의 유저와 직접연결되는거고
//예를 들어 안적어줘도 총 100명의 유저가 있으면  내가 1명만 직접적으로 연결되도 통하고 통해서 간접적으로 100명과 다 연결될수도 있는것이다

const app = express()
const bc = new BlockChain()
const ws = new P2PServer()

//JSON은 JavaScript Object Notation 의 약자입니다.
//직역하면 '자바 스크립트 객체 표기법'으로
//{key:value}와 같은 데이터를 읽고 사용할 수 있습니다
app.use(express.json())

// http://web7722:1234@localhost:3000
app.use((req, res, next) => {
    //3번쨰 인자값은 선택으로 next만 들갈수있는데  선택에따라 써도되고 안써도되고
    //인자3개?
    const baseAuth: string = (req.headers.authorization || '').split(' ')[1] // ||''는  오류처리해준거
    //인코딩은  자동으로 됨
    //그걸확인하는 코드가  req.headers.authorization
    //그럼 Basic d2ViNzcyMjoxMjM0  이렇게뜸
    //우리는  d2ViNzcyMjoxMjM0  이게 무슨소린지 몰라서 다시 디코딩해서 쓸거라서 앞에 Basic은  필요업음
    //그래서 문자열을 분해하여 배열을 반환하는 splite매서드를 사용, 공백을 기준으로 분해하겟다. index 1번쨰것만 가져오겠다
    //그럼  [basic,d2ViNzcyMjoxMjM0] 여기에서 d2ViNzcyMjoxMjM0  이 값만  변수에 담김
    console.log(req.headers.authorization)
    console.log('base:', baseAuth)

    if (baseAuth === '') return res.status(401).send() //만일  baseAuth  이변수값이  빈값이면  401에러를 반환하고 클라이언트에게 (빈값)을 보내겠다

    //401에러
    //클라이언트가 인증되지 않았거나, 유효한 인증 정보가 부족하여 요청이 거부되었음을 의미하는 상태값이다.
    //즉, 클라이언트가 인증되지 않았기 때문에 요청을 정상적으로 처리할 수 없다고 알려주는 것이다.
    //401(Unauthorized) 응답을 받는 대표적인 경우는 로그인이 되어 있지 않은 상태에서 무언가 요청을 하는 경우

    const [userid, userpw] = Buffer.from(baseAuth, 'base64').toString().split(':')
    //Buffer.from(baseAuth, 'base64')   이건 다시 인코딩하는 코드
    //근데  <Buffer 79 63 65 66 66 6f 72 74> 이런식으로 나오기 때문에   .toString()  매서드를 사용했고
    //그래서  이렇게 나옴  web7722:1234
    //근데 우리는  id와  비번을 따로따로 맞는지 확인하기 위해  split(':') 매서드를 사용해서 :를  기준으로 분해하고 배열에 담아주었다
    //[web7722,1234]
    //그리고 [userid,userpw] 로 써서 구조분해 할당을 해서  web7722    1234 만  뽑아주었다

    //     Buffer란 Node.js 에서 제공하는 Binary 의 데이터를 담을 수 있는 Object 입니다.
    // 바이너리 데이터라는 말 그대로 01001010... 과 같은 데이터가 Buffer 객체에 담긴다는 말 입니다

    if (userid !== 'web7722' || userpw !== '1234') return res.status(401).send() // ||는  또는

    next() //위에 코드가 트루면  53번쨰 코드가 return되는데 펄스면 처리해주는 코드대신  이걸쓴거!!  다음으로 넘어가게 해주는 매서드이다
})

app.get('/', (req, res) => {
    res.send('hello?')
})

//블록내용보는 api
app.get('/chains', (req, res) => {
    res.json(ws.getChain())
})

//블록채굴하는 api
app.post('/mineBlock', (req, res) => {
    const { data } = req.body
    //트랜잭션 객체를 채우는 정보를 위해 data(account)를 받는다  원래 스트링으로 넣어놓은것을 바꾸기 전역타입으로 만들었다
    const newBlock = ws.miningBlock(data)
    if (newBlock.isError) return res.status(500).json(newBlock.error)
    //if가 트룽일때  실행하는 코드
    //500에러를 응답해주고 newblock변수안에있는  error스트링을 json타입으로 응답하겠다

    //if가  false일떄 실행하는코드
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
        //forEach는 배열의 매서드
        //배열안에있는애들을  index값을 부여해서 0번부터 끝까지 뽑겟다
        ws.connectToPeer(peer)
    })
})
// peer 확인
app.get('/peers', (req, res) => {
    const sockets = ws.getSockets().map((s: any) => s._socket.remoteAddress + ':' + s._socket.remotePort) // 그냥 이렇게 쓰면 접속한 인간의 ip주소와 port번호를 알수있다
    res.json(sockets)
})

app.post('/sendTransaction', (req, res) => {
    console.log('req.body:', req.body)
    // req.body: {
    //     sender: '0247e791d2eaeec32cbdc4a7c044d4b85cb9a48d6c6e422307022d7750cd663b36',
    //     received: '0e5954ae640884adaead26f399a5af56bd81b057',
    //     amount: 10,
    //     signature: {
    //       r: 'd8c55f7ed87c28552e5098d9814b03a447fc3c2f19e131d27274d9b928d7dfc1',
    //       s: 'd3bdb95c8fc3fa2252e169f5e3952bb2ec8742be9a6a5d56a7d6db5b10ca559d',
    //       recoveryParam: 1
    //     }
    // }

    // Wallet.sendTransaction()
    try {
        const receivedTx: ReceivedTx = req.body //에러가 없을경우 실행
        //  ReceivedTx는  core/wallet/wallet.ts 에서 적어준  interface 이름
        //@types는  전역으로 속성을 관리해주는 곳으로 앞에 declare를  붙여준다
        //그럼 import로 가지고 오지 않아도 사용가능

        //하지만 ReceivedTx는  전역으로 설정한게 아니라 import로 가져와서 사용해 주었다

        //그리고 class에 사용할땐  implements로 가져와서 쓰지만
        //여긴 변수에 사용하는거라 : 뒤에 interface이름을 적어서 가져와서 쓴다

        //?왜  얘는 전역으로 안했을까?? ReceivedTx 는 wallet과 관련이 있어서 거기에 적어줬고 모든걸 전역으로 관리하면 heap메모리에 무리가 가서?

        /** 선언방법
         * interface 인터페이스 이름 {
         *  key: type;    //타입이나 속성등의 내용을 넣어줌
         *  key: type;
         * }
         */

        Wallet.sendTransaction(receivedTx, ws.getUnspentTxOuts())
    } catch (e) {
        if (e instanceof Error) console.log(e.message) //에러가 있을경우실행
        //에러중에서도 발생한 에러가 e instanceof Error 이거면   콘솔로 찍어라
    }
    res.json([]) //json형태로 응답을 한다 {key:value}
})

app.listen(3000, () => {
    console.log('서버시작 3000')
    ws.listen()
})

//npm run dev:ts index.ts
