import { Block } from '@core/blockchain/block'
import { GENESIS } from '@core/config'

describe('Block 검증', () => {
    // 어차피 제네시스블럭은 하드코딩한 값이야
    let newBlock: Block

    it('블록생성', () => {
        const data: ITransaction[] = []
        // newBlock = new Block(genesisBlock, data)
        newBlock = Block.generateBlock(GENESIS, data, GENESIS)
    })

    it('블록 검증 테스트', () => {
        const isValidBlock = Block.isValidNewBlock(newBlock, GENESIS)

        if (isValidBlock.isError) {
            console.error(isValidBlock.error)
            return expect(true).toBe(false)
        }
        expect(isValidBlock.isError).toBe(false)
        // try {
        //     const isValidBlock = Block.isValidNewBlock(newBlock, genesisBlock)
        //     if (isValidBlock.isError) throw new Error(isValidBlock.error)
        //     // console.log(isValidBlock.value)
        //     expect(isValidBlock.isError).toBe(false)
        // } catch (e) {
        //     if (e instanceof Error) console.error(e.message)
        //     expect(false).toBe(true)
        // }
    })

    it('블록난이도 가져오기 테스트', () => {
        const data = ['hello world']
    })
})
