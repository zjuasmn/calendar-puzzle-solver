import React from 'react'
import './App.css'
import { flatten, range } from 'lodash'
import { COLS, firstXCols, itemDirections, items, puzzleByType, solve } from './solver'

type puzzleType =
  | 'LEFT'
  | 'CENTER'

class Calendar extends React.PureComponent<{
  type: puzzleType,
  month: number,
  day: number,
  onChange: (params: { month: number, day: number }) => any
}> {
  monthNames = [
    'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
    'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
  ]

  render() {
    const { type, month, day, onChange } = this.props
    return (
      <div className="Calendar">
        {type === 'LEFT' && (
          <>
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
          </>
        )}
        {type === 'CENTER' && (
          <>
            <div className="item empty" />
            {range(0, 5).map(m => (
              <div
                className={`item month ${month === m ? 'selected' : ''}`}
                key={m}
                onClick={() => onChange({ month: m, day })}
              >
                {this.monthNames[m]}
              </div>
            ))}
            <div className="item empty" />
            {range(5, 12).map(m => (
              <div
                className={`item month ${month === m ? 'selected' : ''}`}
                key={m}
                onClick={() => onChange({ month: m, day })}
              >
                {this.monthNames[m]}
              </div>
            ))}
          </>
        )}

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

    return (
      <div className="SolutionView">
        {items.map((item, i) => {
          const { index, j } = solution[i]
          const row = Math.floor(index / COLS)
          const col = index % COLS
          const firstXCol = firstXCols[i][j]
          const direction = itemDirections[i][j]

          const hwDiff = item.length - item[0].length
          const needDiff = (direction === 1 || direction === 3 || direction === 4 || direction === 6)
          return (
            <div
              key={i}
              className="SolutionViewItem"
              style={{
                top: row * 50,
                left: (col - firstXCol) * 50,
                width: item[0].length * 50,
                height: item.length * 50,
                transform: [
                  `translate3d(${needDiff ? hwDiff * 25 : 0}px, ${needDiff ? hwDiff * -25 : 0}px, 0px)`,
                  `rotate3d(1, 1, 0, ${Math.floor(direction / 4) * 180}deg)`,
                  `rotate3d(0, 0, 1, -${direction % 4 * 90}deg)`,
                ].join(' '),
              }}
              data-direction={direction}
            >
              {flatten(
                item.map((s, r) => s.split('').map(
                  (_1, c) => (
                    <div
                      key={`${r}_${c}`}
                      className="SolutionViewCell"
                      style={item[r][c] === 'x' ? { backgroundColor: this.colors[i] } : {}}
                    />
                  )),
                ),
              )}
            </div>
          )
        })}
      </div>
    )
  }
}

class TypeSwitch extends React.PureComponent<{
  value: puzzleType,
  onChange: (type: puzzleType) => any,
}> {
  render() {
    const { value, onChange } = this.props
    return (
      <div className="TypeSwitch">
        <div
          className={`TypeSwitchItem ${value === 'LEFT' ? 'selected' : ''}`}
          onClick={() => onChange('LEFT')}
        >
          原版
        </div>
        <div
          className={`TypeSwitchItem ${value === 'CENTER' ? 'selected' : ''}`}
          onClick={() => onChange('CENTER')}
        >
          改版
        </div>
      </div>
    )
  }
}

type AppState = {
  type: puzzleType,
  month: number, // 0 - 11
  day: number, // 1 - 31
  solutions: { index: number, j: number }[][],
  index: number,
}

export default class App extends React.PureComponent<{}, AppState> {
  solve = (type: puzzleType, month: number, day: number) => {
    const board = puzzleByType[type].map(row => row.split(''))
    if (type === 'LEFT') {
      board[Math.floor(month / 6)][month % 6] = 'x'
    }
    if (type === 'CENTER') {
      if (month < 5) {
        board[0][month + 1] = 'x'
      } else {
        board[1][month - 5] = 'x'
      }
    }
    board[Math.floor((day - 1) / 7) + 2][(day - 1) % 7] = 'x'
    return solve(board)
  }

  state: AppState = {
    type: 'LEFT',
    month: new Date().getMonth(), // 0 - 11
    day: new Date().getDate(), // 1 - 31
    solutions: this.solve('LEFT', new Date().getMonth(), new Date().getDate()),
    index: 0,
  }

  handleChange = ({ month, day }: { month: number, day: number }) => this.setState(({ type }) => ({
    month, day, solutions: this.solve(type, month, day), index: 0,
  }))

  handleTypeChange = (type: puzzleType) => this.setState(({ month, day }) => ({
    type, solutions: this.solve(type, month, day), index: 0,
  }))

  render() {
    const { type, month, day, solutions, index } = this.state
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
        {/*<TypeSwitch value={type} onChange={this.handleTypeChange} />*/}
        <div className="Container">
          <Calendar type={type} month={month} day={day} onChange={this.handleChange} />
          {solutions[index] && <SolutionView solution={solutions[index]} />}
        </div>
        <div style={{ color: '#333' }}>
          {`当前展示${month + 1}月${day}日解法${index + 1}(共${solutions.length}种)`}
        </div>
        {solutions.length > 0
          ? (
            <div className="Solutions">
              {solutions?.map((solution, i) => (
                <div
                  className={`SolutionItem ${i === index ? 'selected' : ''}`}
                  key={i}
                  onClick={() => {
                    this.setState({ index: i })
                    window.scrollTo({ top: 0 })
                  }}
                >
                  {`解法${i + 1}`}
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
