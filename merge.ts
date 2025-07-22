import { summary_file } from './config'
import { readCSV, writeCSV } from './fs'

/**
 * Example Input Content (from res/summary.csv):
 * ```
 * Task,Total Hour
 * media-search,1.0
 * media-search,0.5
 * format-html-cli,0.2
 * ```
 *
 * Example Output Content (to res/summary.csv):
 * ```
 * Task,Total Hour
 * media-search,1.5
 * format-html-cli,0.2
 * ```
 */

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
