import { uniqBy } from 'lodash'

// 7 x 7
export const puzzleByType = {
  LEFT:
    [
      '......x',
      '......x',
      '.......',
      '.......',
      '.......',
      '.......',
      '...xxxx',
    ],
  CENTER: [
    'x.....x',
    '.......',
    '.......',
    '.......',
    '.......',
    '.......',
    '...xxxx',
  ],
}

export const ROWS = 7
export const COLS = 7

// 8
const items = [
  [
    'x...',
    'xxxx',
  ],
  [
    'x..',
    'xxx',
    '..x',
  ],
  [
    '..xx',
    'xxx.',
  ],
  [
    'xxxx',
    '..x.',
  ],
  [
    '.xx',
    'xxx',
  ],
  [
    'xxx',
    'x.x',
  ],
  [
    'xxx',
    'xxx',
  ],
  [
    'x..',
    'x..',
    'xxx',
  ],
]

const rotate = (item: string[]) => {
  const n = item.length
  const m = item[0].length
  const ret: any[] = []
  for (let i = 0; i < m; ++i) {
    ret.push([])
    for (let j = 0; j < n; ++j) {
      ret[i].push(item[j][m - i - 1])
    }
  }
  return ret.map(v => v.join(''))
}

const flip = (item: string[]) => {
  const n = item.length
  const m = item[0].length
  const ret: any[] = []
  for (let i = 0; i < m; ++i) {
    ret.push([])
    for (let j = 0; j < n; ++j) {
      ret[i].push(item[j][i])
    }
  }
  return ret.map(v => v.join(''))
}

// 8 * ? * ['???','???']
export const itemMasks = items.map(item => {
  const ret = [
    item,
  ]
  // rotate
  for (let i = 1; i < 4; ++i) {
    ret.push(rotate(ret[i - 1]))
  }
  for (let i = 4; i < 8; ++i) {
    ret.push(flip(ret[i - 4]))
  }
  return uniqBy(ret, x => x.join('\n'))
})
// 8 * ?
export const firstXCols = itemMasks.map(masks => masks.map(mask => mask[0].indexOf('x')))


export function solve(board: string[][]) {
  const ret: ({ index: number, j: number })[][] = []
  const solution: ({ index: number, j: number } | null)[] = items.map(() => null)
  let count = 0
  const canPlace = (index: number, i: number, j: number) => {
    const row = Math.floor(index / COLS)
    const col = index % COLS
    const mask = itemMasks[i][j]
    const n = mask.length
    const m = mask[0].length
    const firstXCol = firstXCols[i][j]
    if (row + n > ROWS) {
      return false
    }
    if (col - firstXCol < 0 || col + m - firstXCol > COLS) {
      return false
    }
    for (let r = 0; r < n; ++r) {
      for (let c = 0; c < m; ++c) {
        if (mask[r][c] === 'x' && board[row + r][col + c - firstXCol] === 'x') {
          return false
        }
      }
    }
    return true
  }

  const place = (index: number, i: number, j: number) => {
    const row = Math.floor(index / COLS)
    const col = index % COLS
    const mask = itemMasks[i][j]
    const n = mask.length
    const m = mask[0].length
    const firstXCol = firstXCols[i][j]
    for (let r = 0; r < n; ++r) {
      for (let c = 0; c < m; ++c) {
        if (mask[r][c] === 'x') {
          board[row + r][col + c - firstXCol] = 'x'
        }
      }
    }
  }

  const unPlace = (index: number, i: number, j: number) => {
    const row = Math.floor(index / COLS)
    const col = index % COLS
    const mask = itemMasks[i][j]
    const n = mask.length
    const m = mask[0].length
    const firstXCol = firstXCols[i][j]
    for (let r = 0; r < n; ++r) {
      for (let c = 0; c < m; ++c) {
        if (mask[r][c] === 'x') {
          board[row + r][col + c - firstXCol] = '.'
        }
      }
    }
  }


  const dfs: any = (index: number) => {
    count += 1
    const row = Math.floor(index / COLS)
    const col = index % COLS
    if (row >= ROWS) {
      ret.push(solution.map(s => s!))
      return true
    }
    if (board[row][col] === 'x') {
      return dfs(index + 1)
    }
    for (let i = 0; i < items.length; ++i) {
      if (!solution[i]) {
        for (let j = 0; j < itemMasks[i].length; ++j) {
          if (canPlace(index, i, j)) {
            place(index, i, j)
            solution[i] = { index, j }
            dfs(index + 1)
            solution[i] = null
            unPlace(index, i, j)
          }
        }
      }
    }
    return false
  }

  dfs(0)
  console.log(`搜索次数: ${count}`)
  return ret
}