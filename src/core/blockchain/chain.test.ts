import { Chain } from '@core/blockchain/chain'

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
        for (let i = 1; i <= 10; i++) {
            node.addBlock([])
            //addBlock 의 역할이  현높이가 2일때  2번쨰 블럭을 가지고 오고 . 높이 3짜리 블럭을 만들떄
            //돌아가는 매서드임
        }
        console.log(node.getChain())
    })
})
