import { readFileSync, writeFileSync } from 'fs'
import { draft_file, text_file } from './config'
import { timeStamp } from 'console'
import { writeCSV, writeFile } from './fs'

/**
 * e.g.
 * ```
 * ---
 *
 * media-search
 *
 * Mon 21 Apr 2025 10:35:08 PM HKT
 * Mon 21 Apr 2025 10:53:03 PM HKT
 *
 * wip: add types and wrapper functions for bing and duckduckgo image search
 *
 * Mon 21 Apr 2025 11:43:14 PM HKT
 * Tue 22 Apr 2025 12:20:23 AM HKT
 *
 * feat: add types and wrapper functions for bing and duckduckgo image search
 *
 * Tue 22 Apr 2025 12:04:50 PM HKT
 * Tue 22 Apr 2025 12:29:38 PM HKT
 *
 * feat: add next page function for duckduckgo image search
 * chore: validate search response with cast.ts
 *
 * Tue 22 Apr 2025 12:29:38 PM HKT
 * Tue 22 Apr 2025 01:03:24 PM HKT
 *
 * feat: add a unified function to search image from multiple sources
 *
 * ---
 *
 * format-html-cli
 *
 * Fri 25 Apr 2025 02:50:06 AM +04
 * Fri 25 Apr 2025 03:12:10 AM +04
 *
 * init: finish project setup based on format-json-cli
 * feat: restore the casing for DOCTYPE formatted by prettier
 *
 * ---
 * ```
 */

let text = readFileSync(text_file, 'utf-8').trim().replaceAll('\r', '')
let lines = text.split('\n')

// e.g. 'Sat 25 May 2024 10:07:32 PM HKT'
// e.g. 'Fri 25 Apr 2025 02:50:06 AM +04'
function is_time(line: string): boolean {
  let parts = line.split(' ')

  // e.g. 'Sat'
  if (parts[0]?.length != 3) return false

  // e.g. 25
  if (!+parts[1]) return false

  // e.g. May
  if (parts[2]?.length != 3) return false

  // e.g. 2024
  if (!+parts[3]) return false

  // e.g. '10:07:32'
  if (parts[4]?.length != 8) return false
  if (Number.isNaN(+parts[4].slice(0, 2))) return false
  if (parts[4][2] != ':') return false
  if (Number.isNaN(+parts[4].slice(3, 5))) return false
  if (parts[4][5] != ':') return false
  if (Number.isNaN(+parts[4].slice(6, 8))) return false

  // e.g. 'PM'
  if (parts[5]?.length != 2) return false

  // e.g. 'HKT'
  if (parts[6]?.length != 3) return false

  if (parts.length != 7) return false

  return true
}

// e.g. 'Sat 25 May 2024 10:07:32 PM HKT' -> '2024-05-25 10:07:32'
// e.g. 'Fri 25 Apr 2025 02:50:06 AM +04' -> '2025-04-25 02:50:06'
function parse_time(line: string): string {
  let parts = line.split(' ')
  let day = parts[1].padStart(2, '0')
  let month = parse_month(parts[2]).toString().padStart(2, '0')
  let year = parts[3]
  let time = parts[4]
  let [hour, minute, second] = time.split(':')
  let am_pm = parts[5] as 'AM' | 'PM'
  if (hour == '12' && am_pm == 'AM') {
    hour = '00'
  } else if (hour != '12' && am_pm == 'PM') {
    hour = (+hour + 12).toString()
  }

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

function parse_month(month: string): number {
  let months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  let index = months.indexOf(month)
  if (index == -1) {
    console.error('unknown month:', JSON.stringify(month))
    process.exit(1)
  }
  return index + 1
}

enum Mode {
  find_task_start,
  find_task_name,
  find_time_start,
  find_time_end,
  find_remark,
}

let mode = Mode.find_task_start

let task_name = ''
let time_start = ''
let time_end = ''
let remark = ''

type Entry = {
  'Task': string
  'From': string
  'To': string
  'Duration (hour)': ''
  'Duration (minute)': ''
  'Cost': ''
  'acc': ''
  'Remark': string
}

let entries: Entry[] = []

function add_entry() {
  remark = remark.trim()
  if (!time_start || !time_end || !remark) {
    console.error('missing fields', {
      index,
      task_name,
      time_start,
      time_end,
      remark,
    })
    process.exit(1)
  }
  entries.push({
    'Task': task_name,
    'From': parse_time(time_start),
    'To': parse_time(time_end),
    'Duration (hour)': '',
    'Duration (minute)': '',
    'Cost': '',
    'acc': '',
    'Remark': remark,
  })
  time_start = ''
  time_end = ''
  remark = ''
}

let index = 0
for (; index < lines.length; index++) {
  let line = lines[index]
  if (mode == Mode.find_task_start && line == '---') {
    mode = Mode.find_task_name
    continue
  }
  if (mode == Mode.find_task_name) {
    if (line.trim()) {
      task_name = line
      mode = Mode.find_time_start
    }
    continue
  }
  if (mode == Mode.find_time_start) {
    if (line.trim()) {
      time_start = line
      mode = Mode.find_time_end
    }
    continue
  }
  if (mode == Mode.find_time_end && line) {
    time_end = line
    mode = Mode.find_remark
    continue
  }
  if (mode == Mode.find_remark && is_time(line)) {
    add_entry()
    time_start = line
    mode = Mode.find_time_end
    continue
  }
  if (mode == Mode.find_remark && line !== '---') {
    remark = remark + line + '\n'
    continue
  }
  if (mode === Mode.find_remark && line === '---') {
    add_entry()
    mode = Mode.find_task_name
    continue
  }
  console.error('unknown state:', { mode: Mode[mode], index, line })
  process.exit(1)
}

writeCSV(draft_file, entries)
