import { summary_file } from './config'
import { readCSV, writeCSV } from './fs'

let counts: Record<string, number> = {}

let rows = readCSV(summary_file)
for (let row of rows) {
  let task = row.Task || ''
  let duration = +row['Total Hour'] || 0
  let count = counts[task] || 0
  counts[task] = count + duration
}

let summary = Object.entries(counts).map(([task, count]) => ({
  'Task': task,
  'Total Hour': count,
}))
writeCSV(summary_file, summary)
