# balance-the-chemical-equation
Brute-force attempts to balance a chemical equation written in pure javascript

## Features
- Accepts parentheses (even nested brackets work). Examples: (OH)2
- Result maintains original equation form (not expanded)
- Async ( returns a promise )
- Returns the simplified result
- Lightweight ( only 1 dependency and written in pure javascript )

## Start
`
npm install
`

## Using it
`
node main.js "<left side of equation> -> <right side of equation>"
`

## Example
`
node main.js 'CH4 + S -> CS2 + H2S'
`
returns "CH4 + 4S -> CS2 + 2H2S"
