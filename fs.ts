import {
  csv_to_json,
  from_csv,
  json_to_csv,
  to_csv,
} from '@beenotung/tslib/csv'
import { readFileSync, writeFileSync } from 'fs'

export function readFile(file: string) {
  console.log(`reading from file: ${file}`)
  return readFileSync(file, 'utf-8')
}

export function writeFile(file: string, text: string) {
  console.log(`writing to file: ${file}`)
  writeFileSync(file, text)
}

export function readCSV(file: string) {
  return csv_to_json(from_csv(readFile(file)))
}

export function writeCSV(file: string, rows: object[]) {
  writeFile(file, to_csv(json_to_csv(rows)))
}
