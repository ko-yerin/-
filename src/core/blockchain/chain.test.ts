import { Chain } from '@core/blockchain/chain'
import { Wallet } from '@core/wallet/wallet'

describe('Chain 함수 체크', () => {
    let node: Chain = new Chain()

    it('getChain() 함수 체크', () => {
        console.log(node.getChain())
    })
    it('getLength() 함수 체크', () => {
        console.log(node.getLength())
    })
    it('getLatestBlock() 함수 체크', () => {
        console.log(node.getLatestBlock())
    })
    it('addBlock() 함수 체크', () => {
        // for (let i = 1; i <= 10; i++) {
        //     node.miningBlock('062739667c018b24604c86f54e2b63edbabe10ea')
        //     //addBlock 의 역할이  현높이가 2일때  2번쨰 블럭을 가지고 오고 . 높이 3짜리 블럭을 만들떄
        //     //돌아가는 매서드임
        // }
        node.miningBlock('062739667c018b24604c86f54e2b63edbabe10ea')
        node.miningBlock('062739667c018b24604c86f54e2b63edbabe10ea')
        node.miningBlock('062739667c018b24604c86f54e2b63edbabe10ea')
        node.miningBlock('062739667c018b24604c86f54e2b63edbabe1234')
        node.miningBlock('062739667c018b24604c86f54e2b63edbabe1234')
        node.miningBlock('062739667c018b24604c86f54e2b63edbabe1234')
        // console.log(node.getChain())
        console.log(node.getUnspentTxOuts())

        //마이닝블럭 매개변수에 22번쨰부터 27번쨰꺼까지의 account를 인자로 넣어줘서 그걸돌려서 나온값들이다
        //이값들은  getUnspentTxOuts()에 들어가 있다
        // [
        //     unspentTxOut {
        //       txOutId: '012d7d3b61ad4cefe57c388112bef80eddb9040ef621ac183879dc5f18778c45',
        //       txOutIndex: 0,
        //       account: '062739667c018b24604c86f54e2b63edbabe10ea',
        //       amount: 50
        //     },
        //     unspentTxOut {
        //       txOutId: '63a394943b73f040aee94dd9502241b6394de82b3aba38dda39af7b2937ef526',
        //       txOutIndex: 0,
        //       account: '062739667c018b24604c86f54e2b63edbabe10ea',
        //       amount: 50
        //     },
        //     unspentTxOut {
        //       txOutId: 'dad9877c63a29c016e699e67f9f845ddd16d6abf9254dceab7c93eff7c5e514f',
        //       txOutIndex: 0,
        //       account: '062739667c018b24604c86f54e2b63edbabe10ea',
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
            '062739667c018b24604c86f54e2b63edbabe10ea 총금액:',
            Wallet.getBalance('062739667c018b24604c86f54e2b63edbabe10ea', node.getUnspentTxOuts()),
        )
    })
})
