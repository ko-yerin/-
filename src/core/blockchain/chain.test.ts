import { Chain } from '@core/blockchain/chain'
import { Wallet } from '@core/wallet/wallet'

describe('Chain 함수 체크', () => {
    let ws: Chain = new Chain()

    let receivedTx = {
        sender: '03177913a4efcb4593a1889a6b0e5954ae640884adaead26f399a5af56bd81b057',
        received: '03a2c7d8efa5b5b9aae4a5cffc40964a666b9dd6',
        amount: 30,
        signature: {
            r: '1f918f8df4fc910ab1bcbe98ba8e624e2160ae97b590ae2ef59d5275962a0f7c',
            s: '93cf60ed3ed79192e24ef496fdb0e55c59801f36f1812fc1e41673d1f0ea35d',
            recoveryParam: 1,
        },
    }

    it('getChain() 함수 체크', () => {
        console.log(ws.getChain())
    })
    it('getLength() 함수 체크', () => {
        console.log(ws.getLength())
    })
    it('getLatestBlock() 함수 체크', () => {
        console.log(ws.getLatestBlock())
    })
    it('addBlock() 함수 체크', () => {
        // for (let i = 1; i <= 10; i++) {
        //     ws.miningBlock('0e5954ae640884adaead26f399a5af56bd81b057')
        //     //addBlock 의 역할이  현높이가 2일때  2번쨰 블럭을 가지고 오고 . 높이 3짜리 블럭을 만들떄
        //     //돌아가는 매서드임
        // }
        ws.miningBlock('0e5954ae640884adaead26f399a5af56bd81b057')
        ws.miningBlock('0e5954ae640884adaead26f399a5af56bd81b057')
        ws.miningBlock('0e5954ae640884adaead26f399a5af56bd81b057')
        ws.miningBlock('03a2c7d8efa5b5b9aae4a5cffc40964a666b9dd6')
        ws.miningBlock('03a2c7d8efa5b5b9aae4a5cffc40964a666b9dd6')
        ws.miningBlock('03a2c7d8efa5b5b9aae4a5cffc40964a666b9dd6')

        // console.log(ws.getChain())
        console.log(ws.getUnspentTxOuts())

        //마이닝블럭 매개변수에 22번쨰부터 27번쨰꺼까지의 account를 인자로 넣어줘서 그걸돌려서 나온값들이다
        //이값들은  getUnspentTxOuts()에 들어가 있다
        // [
        //     unspentTxOut {
        //       txOutId: '012d7d3b61ad4cefe57c388112bef80eddb9040ef621ac183879dc5f18778c45',
        //       txOutIndex: 0,
        //       account: '0e5954ae640884adaead26f399a5af56bd81b057',
        //       amount: 50
        //     },
        //     unspentTxOut {
        //       txOutId: '63a394943b73f040aee94dd9502241b6394de82b3aba38dda39af7b2937ef526',
        //       txOutIndex: 0,
        //       account: '0e5954ae640884adaead26f399a5af56bd81b057',
        //       amount: 50
        //     },
        //     unspentTxOut {
        //       txOutId: 'dad9877c63a29c016e699e67f9f845ddd16d6abf9254dceab7c93eff7c5e514f',
        //       txOutIndex: 0,
        //       account: '0e5954ae640884adaead26f399a5af56bd81b057',
        //       amount: 50
        //     },
        //     unspentTxOut {
        //       txOutId: '5cbfedbcab4f67a0950ede9685506e911e1592f48ba20b63ac38177ac187758e',
        //       txOutIndex: 0,
        //       account: '062739667c018b24604c86f54e2b63edbabe1234',
        //       amount: 50
        //     },
        //     unspentTxOut {
        //       txOutId: 'fa42e5aaa16e2f766997e0dcd8ece844b41c6fcca75ee7315ebe0838545ff5ad',
        //       txOutIndex: 0,
        //       account: '062739667c018b24604c86f54e2b63edbabe1234',
        //       amount: 50
        //     },
        //     unspentTxOut {
        //       txOutId: '554f35e31d8a73521ee49af6e636455d3a7a0a79f47d9eb024ae6b2de8aebf77',
        //       txOutIndex: 0,
        //       account: '062739667c018b24604c86f54e2b63edbabe1234',
        //       amount: 50
        //     }
        //   ]
        console.log(
            '0e5954ae640884adaead26f399a5af56bd81b057 총금액:',
            Wallet.getBalance('0e5954ae640884adaead26f399a5af56bd81b057', ws.getUnspentTxOuts()),
        )
    })

    it('sendTransaction 검증', () => {
        try {
            const tx = Wallet.sendTransaction(receivedTx, ws.getUnspentTxOuts())
            // console.log('tx', tx)
            //Transaction 내용을 가지고 UTXO최신화하기   .updateUTXO
            console.log('utxo내용:', ws.getUnspentTxOuts()) //원래내용 //6
            ws.appendTransactionPool(tx)
            ws.updateUTXO(tx) //7
            console.log('utxo바뀐내용:', ws.getUnspentTxOuts()) //바뀐내용  //7
            console.log('pool', ws.getTransactionPool())
        } catch (e) {
            if (e instanceof Error) console.log(e.message)
        }
    })

    it('채굴테스트', () => {
        try {
            //마이닝전 TxPool :1개
            ws.miningBlock('0e5954ae640884adaead26f399a5af56bd81b057')
            console.log(ws.getTransactionPool()) // //마이닝전 TxPool :0개
            console.log(ws.getChain()) //block 7개
            console.log(ws.getChain()[6]) //block data->transaction 2개
        } catch (e) {}
    })

    it('트랜잭션검증', () => {
        //TODO:지갑->서명을 확인하고 block Server로 데이터를 전달받아야되고
        //받은걸 가지고 UTXO에서 내용을 가지고 와서 현재 보내는 사람의 계정에 돈이 있는지 확인하고
        //트랜잭션을 만들어야된다
        //1.보내는  사람의 금액에 맞는 UTXO를 찾는 과정
        //2.TxIn만드는 과정
        //3.TxOut 만드는 과정
        //받는사람
        //보낼계정:ㅁㅇㅁㄴㅇㄹ
        //보낼금액:0.5
        //라는 객체를 만들수 있게끔
        //잔돈을 돌려받는 사람
        //보낼계정:인구     -----보내는 사람의 계정
        //보낼금액 :0.5     ----보낸금액-보낼양
        //트랜잭션이 발동이 되려면 어디서 부터 시작?
        //-->지갑(시작시점)--->sendTransaction()
    })
})
