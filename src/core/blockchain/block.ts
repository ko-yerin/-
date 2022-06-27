import { SHA256 } from 'crypto-js'
import merkle from 'merkle'
import { DIFFICULTY_ADJUSTMENT_INTERVAL, DIFFICULTY_GENERATION_INTERVAL, GENESIS, UNIT } from '../config'
import hexToBinary from 'hex-to-binary'

export class BlockHeader implements IBlockHeader {
    public version: string
    public height: number
    public timestamp: number
    public previousHash: string

    constructor(_previousBlock: IBlock) {
        this.version = BlockHeader.getVersion()
        this.timestamp = BlockHeader.getTime()
        this.height = _previousBlock.height + 1
        this.previousHash = _previousBlock.hash
    }

    public static getVersion() {
        return '1.0.0'
    }

    public static getTime() {
        return new Date().getTime()
    }
}

export class Block extends BlockHeader implements IBlock {
    //1
    public hash: string
    public merkleRoot: string
    public nonce: number
    public difficulty: number
    public data: ITransaction[]

    constructor(_previousBlock: Block, _data: ITransaction[], _adjustmentBlock: Block = _previousBlock) {
        super(_previousBlock) // BlockHeader 자식의 생성자를 참조한다.

        const merkleRoot = Block.getMerkleRoot(_data)
        this.merkleRoot = merkleRoot
        this.hash = Block.createBlockHash(this)
        this.nonce = 0
        this.difficulty = Block.getDifficulty(this, _adjustmentBlock, _previousBlock)
        this.data = _data
    }

    public static getGENESIS(): Block {
        return GENESIS
    }

    public static getMerkleRoot<T>(_data: T[]): string {
        //TODO: Transaction Hash 값 구하기
        //Tx.hash:string  <---txIns+txOuts
        const merkleTree = merkle('sha256').sync(_data)
        return merkleTree.root() || '0'.repeat(64)
    }

    public static createBlockHash({
        version,
        timestamp,
        merkleRoot,
        previousHash,
        height,
        difficulty,
        nonce,
    }: Block): string {
        // console.log('result :', _block)
        // console.log('크리에이트: ', Object.values(_block))
        const values: string = `${version}${timestamp}${merkleRoot}${previousHash}${height}${difficulty}${nonce}`
        return SHA256(values).toString()
    }

    public static generateBlock(_previousBlock: Block, _data: ITransaction[], _adjustmentBlock: Block): Block {
        const generateBlock = new Block(_previousBlock, _data, _adjustmentBlock)
        //2
        //generateBlock매서드 안에서 Block객체를 생성하는데 변수 generateBlock에 담아주었다
        // super(_previousBlock) // BlockHeader 자식의 생성자를 참조한다.

        // const merkleRoot = Block.getMerkleRoot(_data)
        // this.merkleRoot = merkleRoot
        // this.hash = Block.createBlockHash(this)
        // this.nonce = 0
        // this.difficulty = Block.getDifficulty(this, _adjustmentBlock, _previousBlock)
        // this.data = _data

        //근데 아직 마이닝은 안된상태라 nonce값을 통해서 hash값을  구해야된다 (=마이닝)

        const newBlock = Block.findBlock(generateBlock)
        //findBlock매서드에 인자값으로  generateBlock(블럭을 통해 생성된 객체)을 넣어주었고
        //findBlock매서드를 통해 마이닝을 해주었고 그 return값을 newBlock에 담아준것이다
        //즉 generateBlock을 통해서는  아직 nonce값을 구하지 않은 블럭객체를 생성
        //그 generateBlock을 가지고 findBlock에서 논스값을 구하고 해쉬값을 구해서 마이닝 진행
        //즉 newBlock 은 마이닝이 완료된 블럭
        return newBlock //generateBlock매서드에서 newBlock통해나온 리턴
    } //??export는  식을 내보내는거 /  return은  답을 내보내는거

    public static findBlock(_generateBlock: Block): Block {
        //3
        //difficulty에 따른 nonce값을 구하고 hash값 변경
        // 마이닝 작업
        let hash: string
        let nonce: number = 0
        while (true) {
            nonce++
            console.log(nonce)
            _generateBlock.nonce = nonce
            hash = Block.createBlockHash(_generateBlock)
            const binary = hexToBinary(hash)
            const result: boolean = binary.startsWith('0'.repeat(_generateBlock.difficulty))
            if (result) {
                _generateBlock.hash = hash
                return _generateBlock
            }
        }
        console.log(hexToBinary(_generateBlock.hash))
        return _generateBlock
    }

    public static getDifficulty(_newBlock: Block, _adjustmentBlock: Block, _previousBlock: Block): number {
        if (_adjustmentBlock.height === 0) return 0
        if (_newBlock.height < 9) return 0
        if (_newBlock.height < 10) return 1
        if (_newBlock.height % DIFFICULTY_GENERATION_INTERVAL !== 0) return _previousBlock.difficulty
        //나머지가 0이아닐경우 즉  나눴을때 딱떨어지지 않았을경우 true로  리턴

        const timeTaken: number = _newBlock.timestamp - _adjustmentBlock.timestamp

        // 60 * 10 * 10
        const timeExpected: number = UNIT * DIFFICULTY_GENERATION_INTERVAL * DIFFICULTY_ADJUSTMENT_INTERVAL

        if (timeTaken < timeExpected / 2) {
            // console.log('new:', _newBlock.difficulty)
            // console.log('adjust:', _adjustmentBlock.difficulty + 1)
            return _adjustmentBlock.difficulty + 1
        } else if (timeTaken > timeExpected * 2) return _adjustmentBlock.difficulty - 1

        return _adjustmentBlock.difficulty
    }

    // 블럭을 검증
    // height: 10
    // height: 10, height : 9
    public static isValidNewBlock(_newBlock: Block, _previousBlock: Block): Failable<Block, string> {
        // TODO
        // 1. 이전블럭의 높이 +1 이 새로생긴 블럭 높이와 같나?
        // 2. 이전 블럭의 해시 가 새로생긴 블럭 해시와 같나?
        // 3. _newBlock 받아온 애들로 해시 새로 만든 것과 _newBlock.hash 가 같나?
        if (_previousBlock.height + 1 !== _newBlock.height) return { isError: true, error: '블록 높이가 다릅니다.' }
        if (_previousBlock.hash !== _newBlock.previousHash) return { isError: true, error: '이전 해시값이 다릅니다.' }
        if (Block.createBlockHash(_newBlock) !== _newBlock.hash)
            return { isError: true, error: '블록해시가 올바르지 않습니다.' }
        return { isError: false, value: _newBlock }
    }
}
