import { readCSV, writeCSV } from './fs'
import { summary_file, log_sheet_file } from './config'

let counts: Record<string, number> = {}

let rows = readCSV(log_sheet_file)
for (let row of rows) {
  let task = row.Task || ''
  let remark = row.Remark || ''
  let duration = +row['Duration (hour)'] || 0

  let tags = remark
    .split('\n')
    .map(line => line.match(/^(\w+): /)?.[1]?.trim()!)
    .filter(tag => tag)

  if (tags.length == 0 && remark.toLowerCase().includes('setup ')) {
    tags.push('devop')
  }

  if (tags.length == 0 && remark.toLowerCase().includes('add ')) {
    tags.push('dev')
  }

  if (tags.length == 0) {
    tags.push(task)
  }

  for (let tag of tags) {
    let count = counts[tag] || 0
    counts[tag] = count + duration / tags.length
  }
}

let summary = Object.entries(counts).map(([tag, count]) => ({
  'Task': tag,
  'Total Hour': count,
}))
writeCSV(summary_file, summary)
