import React from 'react'
import './App.css'
import { flatten, range } from 'lodash'
import { COLS, firstXCols, itemMasks, puzzle, ROWS, solve } from './solver'

class Calendar extends React.PureComponent<{
  month: number,
  day: number,
  onChange: (params: { month: number, day: number }) => any
}> {
  monthNames = [
    'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
    'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
  ]

  render() {
    const { month, day, onChange } = this.props
    return (
      <div className="Calendar">
        {range(0, 6).map(m => (
          <div
            className={`item month ${month === m ? 'selected' : ''}`}
            key={m}
            onClick={() => onChange({ month: m, day })}
          >
            {this.monthNames[m]}
          </div>
        ))}
        <div className="item empty" />
        {range(6, 12).map(m => (
          <div
            className={`item month ${month === m ? 'selected' : ''}`}
            key={m}
            onClick={() => onChange({ month: m, day })}
          >
            {this.monthNames[m]}
          </div>
        ))}
        <div className="item empty" />
        {range(1, 32).map(d => (
          <div
            className={`item ${day === d ? 'selected' : ''}`}
            key={d}
            onClick={() => onChange({ month, day: d })}
          >
            {d}
          </div>
        ))}
      </div>
    )
  }
}

class SolutionView extends React.PureComponent<{
  solution: { index: number, j: number } [],
}> {
  colors = [
    '#6B7280',
    '#EF4444',
    '#F59E0B',
    '#10B981',
    '#3B82F6',
    '#6366F1',
    '#8B5CF6',
    '#EC4899',
  ]

  render() {
    const { solution } = this.props
    const board = range(ROWS).map(() => range(COLS).map(() => -1))

    itemMasks.forEach((masks, i) => {
      const { index, j } = solution[i]
      const row = Math.floor(index / COLS)
      const col = index % COLS
      const mask = masks[j]
      const n = mask.length
      const m = mask[0].length
      const firstXCol = firstXCols[i][j]

      for (let r = 0; r < n; ++r) {
        for (let c = 0; c < m; ++c) {
          if (mask[r][c] === 'x') {
            board[row + r][col + c - firstXCol] = i
          }
        }
      }
    })

    return (
      <div className="SolutionView">
        {flatten(range(ROWS).map(row => range(COLS).map(col => (
          <div key={`${row}_${col}`} className="item" style={
            board[row][col] >= 0
              ? { backgroundColor: this.colors[board[row][col]] }
              : { backgroundColor: 'transparent' }
          } />
        ))))}
      </div>
    )
  }
}

export default class App extends React.PureComponent<{}> {
  solve = (month: number, day: number) => {
    const board = puzzle.map(row => row.split(''))
    board[Math.floor(month / 6)][month % 6] = 'x'
    board[Math.floor((day - 1) / 7) + 2][(day - 1) % 7] = 'x'
    return solve(board)
  }

  state = {
    month: new Date().getMonth(), // 0 - 11
    day: new Date().getDate(), // 1 - 31
    solutions: this.solve(new Date().getMonth(), new Date().getDate()),
    index: 0,
  }

  handleChange = ({ month, day }: { month: number, day: number }) => this.setState({
    month, day, solutions: this.solve(month, day), index: 0,
  })

  render() {
    const { month, day, solutions, index } = this.state
    return (
      <div className="App">
        <h1>
          Calendar Puzzle Solver
        </h1>
        <div>
          <a href="https://www.dragonfjord.com/product/a-puzzle-a-day/">原问题</a>
          <a href="https://github.com/zjuasmn/calendar-puzzle-solver" style={{ marginLeft: 16 }}>Github源码</a>
          <a href="https://jandan.net" style={{ marginLeft: 16 }}>煎蛋</a>
        </div>
        <div className="Container">
          <Calendar month={month} day={day} onChange={this.handleChange} />
          {solutions[index] && <SolutionView solution={solutions[index]} />}
        </div>
        {solutions.length > 0
          ? (
            <div className="Solutions">
              {solutions?.map((solution, i) => (
                <div
                  className={`SolutionItem ${i === index ? 'selected' : ''}`}
                  key={i}
                  onClick={() => this.setState({ index: i })}
                >
                  {`解法${i}`}
                </div>
              ))}
            </div>
          )
          : (
            <div>无解？？？！！</div>
          )}
      </div>
    )
  }
}
