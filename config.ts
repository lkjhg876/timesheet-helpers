import { mkdirSync } from 'fs'
import { join } from 'path'

mkdirSync('res', { recursive: true })

export let log_sheet_file = 'res/log-sheet.csv'
export let summary_file = 'res/summary.csv'
export let text_file = join(process.env.HOME!, 'timesheet.txt')
export let draft_file = 'res/draft.csv'
