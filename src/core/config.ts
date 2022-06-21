/*
    난이도 조정 블록 범위 10개
*/
export const DIFFICULTY_ADJUSTMENT_INTERVAL: number = 10
/*
    블럭 생성 시간 10* 60 = 600
*/
export const DIFFICULTY_GENERATION_INTERVAL: number = 10
/*
    생성 시간 단위
*/
// export const BLOCK_GENERATION_TIME: number = 60

export const UNIT: number = 60 //unit:단위

// export const GENESIS: IBlock = {
//     version: '1.0.0',
//     height: 0,
//     hash: '0'.repeat(64),
//     timestamp: 123235346,
//     previousHash: '0'.repeat(64),
//     merkleRoot: '0'.repeat(64),
//     nonce: 0,
//     difficulty: 0,
//     data: ['기역'],
// }

export const GENESIS: IBlock = {
    version: '1.0.0',
    height: 0,
    timestamp: Number(new Date(2022, 5, 15)),
    previousHash: '0'.repeat(64),
    merkleRoot: '0'.repeat(64),
    hash: '0'.repeat(64),
    nonce: 0,
    difficulty: 0,
    data: [],
}
