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
        console.log(
            '062739667c018b24604c86f54e2b63edbabe10ea 총금액:',
            Wallet.getBalance('062739667c018b24604c86f54e2b63edbabe10ea', node.getUnspentTxOuts()),
        )
    })
})
