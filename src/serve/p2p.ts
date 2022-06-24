import { WebSocket } from 'ws'
import { Chain } from '@core/blockchain/chain'

export enum MessageType { //type이 아닌 데이터값을 정해줄때   enum을 사용한다
    latest_block = 0,
    all_block = 1,
    receivedChain = 2,
    receivedTx = 3,
}

// interface MessageType2 {  //type을 정해줄때   interface를  사용한다
//     latest_block: number
//     all_block: any
//     receivedChain: string
// }

export interface Message {
    type: MessageType
    payload: any
}

//Chain

//서버 시작하는 실행코드//
export class P2PServer extends Chain {
    private sockets: WebSocket[]

    constructor() {
        super()
        this.sockets = []
    }

    getSockets() {
        return this.sockets
    }

    // 서버 컴퓨터(client가 연결을 시도했을때만 실행되는 코드임)
    listen() {
        const server = new WebSocket.Server({ port: 7545 }) //서버에서 웹소켓을 받을거다
        server.on('connection', (socket) => {
            // on 웹소켓 매서드- 이벤트를 실행시킬수 있다
            console.log(`websocket connection 하이`)

            this.connectSocket(socket)
        })
    }

    //client 연결코드//[....,....,...]
    connectToPeer(newPeer: string) {
        const socket = new WebSocket(newPeer)
        socket.on('open', () => {
            //websocket매서드 on
            this.connectSocket(socket)
        })
    }

    connectSocket(socket: WebSocket) {
        //서버쪽과 클라이언트 컴퓨터가 둘다 실행되는 코드
        this.sockets.push(socket)
        this.messageHandler(socket)

        //{type:'',data:''}  //actions
        //응답  string ->object 요청  string

        const data: Message = {
            type: MessageType.latest_block,
            payload: [],
        }
        this.errorHandler(socket)
        this.send(socket)(data)
    }

    messageHandler(socket: WebSocket) {
        const callback = (data: string) => {
            // export interface Message{
            //     type:MessageType
            //     payload:any
            // }
            //data에 위 객체가 들가면됨

            // console.log(data) //buffer내용이 찍힘
            const result: Message = P2PServer.dataParse<Message>(data)
            const send = this.send(socket)

            switch (result.type) {
                case MessageType.latest_block: {
                    //내용
                    const message: Message = {
                        type: MessageType.all_block,
                        payload: [this.getLatestBlock()], //getLatestBlock이건 상대방이 나에게 준거
                    }
                    send(message) //나에게 메시지를 요청한사람한테 답장
                    break
                }
                case MessageType.all_block: {
                    //메시지를 받는부분
                    const message: Message = {
                        type: MessageType.receivedChain,
                        payload: this.getChain(),
                    }
                    //블록검증코드이후 블록을 넣을지말지
                    //TODO:내체인에 넣을지 말지
                    //내 블록의  해쉬와 상대방 블록의 previoushash값과 같은가(해쉬만 검사함)
                    //내체인에 상대방 블록을 넣으면 된다(내체인에 넣을때는 철처한 검증을 거치고 넣어야 된다)

                    const [receivedBlock] = result.payload // [this.getLatestBlock()]
                    const isValid = this.addToChain(receivedBlock)
                    if (!isValid.isError) break

                    send(message)
                    break
                }

                case MessageType.receivedChain: {
                    const receivedChain: IBlock[] = result.payload // receivedChain  이건 상대방 체인
                    this.handleChainResponse(receivedChain)
                    //체인바꿔주는 코드
                    //긴체인 선택하기
                    break
                }

                case MessageType.receivedTx: {
                    const receivedTransaction: ITransaction = result.payload
                    if (receivedTransaction === null) break

                    const withTransaction = this.getTransactionPool().find((_tx: ITransaction) => {
                        return _tx.hash === receivedTransaction.hash
                    })

                    if (!withTransaction) {
                        //받은트랜잭션 내용이 내 트랜잭션풀에 없다면
                        this.appendTransactionPool(receivedTransaction) //내풀에 넣어주면됨
                    }

                    const message: Message = {
                        type: MessageType.receivedTx,
                        payload: receivedTransaction,
                    }
                    this.broadcast(message) //받는사람의 코드는 끗

                    break
                }
            }
        }
        socket.on('message', callback)
    }

    errorHandler(socket: WebSocket) {
        const close = () => {
            this.sockets.splice(this.sockets.indexOf(socket), 1)
            //오늘은 배열과 문자열에서 사용 가능한, 검색을 위한 메서드인 indexOf 메서드
            //메서드의 첫 번째 인자로는 검색할 대상이 들어옵니다.
            //그리고 생략 가능한 두 번째 인자는 검색을 시작할 index입니다.
            //만약 배열이라면 배열의 index값 (0 부터 시작해서 하나씩 증가)을 의미하며,
            //문자열이라면 문자열 각각의 문자 하나하나를 의미합니다. (마찬가지로 첫 번째 글자부터 0, 1, 2, 3 ...)
        }
        socket.on('close', close)
        socket.on('error', close)
    }

    send(_socket: WebSocket) {
        return (_data: Message) => {
            _socket.send(JSON.stringify(_data)) //JavaScript 객체를 JSON 문자열로 변환.
        }
    }

    broadcast(message: Message): void {
        this.sockets.forEach((socket) => this.send(socket)(message))
    }

    //체인검증하는 코드
    public handleChainResponse(receivedChain: IBlock[]): Failable<Message | undefined, string> {
        //여기다 broadcast를 넣을거임
        //1번쨰 확인   :전달받은 체인이 일단 올바른가?
        const isValidChain = this.isValidChain(receivedChain)
        if (isValidChain.isError) return { isError: true, error: isValidChain.error }

        const isValid = this.replaceChain(receivedChain)
        if (isValid.isError) return { isError: true, error: isValid.error }

        //broadcast를 다던져주면됨

        const message: Message = {
            //이코드가 실행된건  받은체인이 더길다는뜻
            type: MessageType.receivedChain,
            payload: receivedChain,
        }
        this.broadcast(message)
        return { isError: false, value: undefined }
    }

    public static dataParse<T>(_data: string): T {
        return JSON.parse(Buffer.from(_data).toString()) //JSON 문자열의 구문을 분석하고, 그 결과에서 JavaScript 값이나 객체를 생성합니다
    }
}
//옵션값   public, private

//class문법에서는  default로 옵션값이  public으로 설정되어있다

//public 접근 제한자: class P2PServer extends Chain   이런식으로  extends로 클래스를 가져왔을때
//Chain class안에있는 값을 복사해서 다 가져오는건데  그럼 현재 P2PServer에  Chain내용이 다 들어있는거라
//Chain안에 있는  public이 붙은  모든것은  this.connectSocket  이런식으로  가져와서 쓸수 있다
//(P2PServer.connectSocket또는  Chain.connectSocket으로도 쓸수없고  this. 으로 써줘야 한다 )
//그런데  private가 붙은 것들은  가져와서 쓸수없다

//private 접근 제한자: 단어 뜻 그대로 개인적인 것이라 외부에서 사용될 수 없도록 합니다.
//________________________________________________________________________________________________________________
//단방향이란  client는 요청만   서버는 응답만 할수있다
//양방향이란  client, server둘다  요청, 응답을 할수있다.

//그래서 client,server가 딱 정해져있지않고  하는역할에따라서 client도 될수있고  server도 될수있다
//p2p는  양방향이다
//우리는 그 네트워킹 방법중  p2p네트워킹을  블록체인에 사용할것이다
//왜 양방향인 p2p네트워킹을 이용하는가?
//중앙화=단방향,  탈중앙화= 양방향
//중앙화는  중앙에서 관리(중앙을 통해서만 요청과응답 가능) 그럼 거기만 털리면 다털림
//탈중앙화는 개인들이 관리 (하는역할에 따라 server도 되고 client도 될수있음) 그럼 털려면  그이전해쉬필요,그걸털려면 또그이전해쉬필요 해킹힘듬,보안강화
//그리고 모두가 같은 정보를 가지고 있기때문에 한사람께 털렸다고 해도 문제가 되지않음
//그리고 조작을 하려고 해도 전부거를 다해야됨  그건 불가능
//컴퓨터는  클라이언트 ,서버 둘다가능
//vs code는  컴퓨터가 어떤역할(client, server)을 할지 알려주는 메모장 같은역할
//브라우저는  client
//_________________________________________________________________________________________________________________________________
//p2p란? (peer-to-peer network) 혹은 동등 계층간 통신망

//동등계층간 연결구조,  여러대의 컴퓨터가 동등한 개념으로 망을 이룹니다

//우리에게 익숙한 구조는 다수의 컴퓨터가 서버컴퓨터에 요청하면 요청에 맞는 응답을 해주는 구조이다

//P2P는 컴퓨터끼리 서로 연결되어 데이터를 주고 받는 구조이다
//요청하는 컴퓨터와 서비스를 제공하는 컴퓨터가 따로 존재하지 않는다
//누구든 서버와 클라이언트역할을 둘다한다고 보면 된다
//_________________________________________________________________________________________________________________________________

//체인은  그냥 배열임   이름을 체인이라고 정한거  그안에 블럭이 들어가는거임
//블럭을 넣는행위를 체이닝이라고함
//블럭은  예를들면 현재 100번까지 만들어져있다 그럼  거기까지의 블럭을 가져오는거고 그이후 101번째부터 내가만드는거임
//근데 내컴이 느리면  게속못만들고 단사람이 만들수도있음  연산을 빠르게해주는 gpu를 이용하기위해서 그래픽카드를 사서 컴에 꽂아서 하는거
//그리고 내가 5번쨰 블럭을 만들었는데 최신으로만들어진 블럭이 100번쨰이다 그럼 100번쨰까지 덮어씌우고 그이후블록을 만드는거
//_______________________________________________________________________________________________________________________________

//difficulty를  10으로 했다  그럼 nonce값을 1부터 넣어보면서  hash값을  hex를 통해 2진수로 바꾼값에서 0이 10개가 될떄 까지 찾는데
//10개이상이면 되고  즉  11개  12개 여도 노상관  10개보다 적으면 안되는거
// 찾으면   마이닝(채굴)한거!!
//_____________________________________________________________________________________________________________________________
//static

//static은   매서드앞에만 쓸수있다
//static은  외부에서 가져다쓸수있냐 없냐 그차이가 아니라  시점의 차이이다
//static이 붙은 매서드는  시점을  인스턴스가 생성되기 전으로 보고  안붙은 매서드는  시점을 인스턴스가 생성된 이후로 본다

//**new생성자를 사용해서 new Block을 하면 인스턴스가 생성되는건 맞는데
//Block class 안에   코드를 첨부터 쭉읽고  constructor(){}가 되는 시점에 인스턴스가 생성되는 것이다
//**new생성자를 붙이지 않고 Block만 써주면 Block class를 가져와서 코드를 첨부터 읽는데 인스턴스를 생성시키지 않기 때문에
//constructor(){}부분은 실행하지않는다

//그래서 static이 붙은 매서드호출은  constructor(){}에서 해줄게 아니면 new 클래스를 붙이지 않고 Block 만 써줘서 Block class를
//가져와서도 가능한데 static이 안붙은 매서드 호출은 this객체가 생성된 이후만 가능해서 무조건 new생성자를 써줘서
//constructor(){}가 실행되야 하고 그이후에만 호출이 가능하다

//static이 붙은  매서드를 호출할때는 constructor(){}이후에 써줘도 this(인스턴스)가 생성되기 전으로 보기때문에
//this.getMerkleRoot() 이아닌   Block.getMerkleRoot()로 호출한다(근데 constructor(){}이후에서 호출해줘도 마찬가지)
//static이 안붙은  매서드는 this(인스턴스)가 생성되고 실행되기 때문에 constructor(){}가 끝나기전에서는 호출해줄수없고
//그이후에 호출이가능하다 그래서 호출할때도 this.getMerkleRoot() 으로 호출해주게 된다

//static이 붙건 안붙건  public이 붙은 매서드는  extends 한 class안에서도 사용가능한데
//그땐  둘다 this.으로 사용해주게 된다
//대신  static이 붙은 매서드 호출은  this.으로 해주더라도 시점이 인스턴스 생성전이란걸 기억하자
//___________________________________________________________________________________________________________________________________
//클래스에 포함된 매서드는 클래스에 포함된거라  export해주는개념이 아니라 클래스를 export해주는 거다
//___________________________________________________________________________________________________________________________________
// 마이닝

// 마이닝을 하기위해서:
// 블럭이 생성되는 평균시간을 구해야됨
// 평균적으로 블럭을 생성할때 10분 정도 걸리게 하고싶다
// 평균시간을 구하는 블럭갯수를 10개로 하겠다
// 그럼 블럭을 담을수있는공간필요

// #작업순서 ##목적은 마이닝구현
// ->마이닝을 구현하려면 난이도가 필요하고 난이도를 구현하려면 체인필요

// 1.체인구현 2.난이도 구현 3.마이닝 구현

// 해쉬값은 16진수(0~9, a~f)로 구성되어있다(64글자)
// 16진수를 2진수로 바꾼다면 1개의글자를 4글자로 치환할수있다 (64\*4 글자)

// 16진수는 2진수(0,1)랑 친구다

// 16진수 1글자 4 bit
// 16진수 2글자 8 bit

// 8bit=1byte=2nible

// 왜16진수를 2진수로 바꾸려고 하는가
// 작업증명중 pow는 hash값을 통해서
// 앞에있는 자릿수0이 몇개들어갔는가를 찾는거

// difficulty=4 라면
// hash값으로 변환했을때
// 0이 앞에 4개있는걸 찾는거
// 0000

// 첫번쨰 순서는 hash에서 2진수로 바꿀줄 알아야됨
//_________________________________________________________________________________________________________________________________________
//작업증명

//difficulty를 만족하는 논스값을 찾는것
//논스값을 1부터 넣어서 difficulty로정해준  0의 갯수와 일치하게되면  논스값을 찾은것으로 채굴(마이닝)성공=블록생성
//채굴(마이닝)은 블록체인네트워크를 유지시키기위해시키는데 중요, 채굴한 사람에게는 작업증명의 대가로 일정한 개수의 암호화폐를 지급

//-->ex)16진수로 되어있는 해쉬값을 2진수로 바꿨을떄  앞자리가 4개가 0 이상인 해시값을 만들수 있도록 하는 논스값을 찾아라
//즉 논스값을 몇으로 설정해야 앞자리 4개가 0인 값을 찾느냐 하는것

//채굴(마이닝)=블럭생성
//difficulty 난이도를 이용해 블럭생성을 쉽게못하게 하는게 작업증명:POW=16진수를 2진수로 바깟을때 앞에 0이 몇개 붙었는가 찾는거
//작업증명의 대가로 일정한 개수의 암호화폐를 지급받는 것을 채굴(採掘) 또는 마이닝
//___________________________________________________________________________________________________________________________________________
