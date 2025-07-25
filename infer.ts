import { extract_lines } from '@beenotung/tslib/string'
import { log_sheet_file } from './config'
import { readCSV } from './fs'

/**
 * Example Input Content:
 * ```
 * Task,Remark
 * website,implement email subscribe form
 * website,restore animation and youtube iframe in home page
 * image-ai-builder,exp: discuss rotation and zoom with elly
 * image-ai-builder,exp: implement way to drag to move/zoom bounding box
 * image-ai-builder,team: dev with elly
 * animal-ai,team: brief cat beard formula and image classify ai model training to sofia and lanna
 * animal-ai,team: discuss with benny and trevor on car beard direction calculation
 * ,team: demo sofia and lanna on box model training with colab
 * ,team: demo to lanna and sofia on colab box model training
 * ,exp: try hammer js with elly to zoom in and rotate the bounding box
 * ,team: brief idmm dataset export, import, extract tasks to lok
 *  - pose -> pose (crop bounding box)
 *  - pose -> classify (crop box)
 * ```
 *
 * Example Output Content:
 * ```
 * Task,Remark
 * website,implement email subscribe form
 * website,restore animation and youtube iframe in home page
 * image-ai-builder,exp: discuss rotation and zoom with elly
 * image-ai-builder,exp: implement way to drag to move/zoom bounding box
 * image-ai-builder,team: dev with elly
 * animal-ai,team: brief cat beard formula and image classify ai model training to sofia and lanna
 * animal-ai,team: discuss with benny and trevor on car beard direction calculation
 * animal-ai,team: demo sofia and lanna on box model training with colab
 * animal-ai,team: demo to lanna and sofia on colab box model training
 * image-ai-builder,exp: try hammer js with elly to zoom in and rotate the bounding box
 * image-ai-builder,team: brief idmm dataset export, import, extract tasks to lok
 *  - pose -> pose (crop bounding box)
 *  - pose -> classify (crop box)
 * ```
 *
 * With console output highlight the auto inferred Task.
 * ```
 * animal-ai <- team: demo sofia and lanna on box model training with colab
 *
 * animal-ai <- team: demo to lanna and sofia on colab box model training
 *
 * image-ai-builder <- exp: try hammer js with elly to zoom in and rotate the bounding box
 *
 * image-ai-builder <- team: brief idmm dataset export, import, extract tasks to lok
 *  - pose -> pose (crop bounding box)
 *  - pose -> classify (crop box)
 * ```
 *
 * Todo: interactively show all the possible tasks, ranked by similarity and let user select the best one.
 */

/**
 * Overall Plan
 * 1. collect remark examples with task name
 * 2. infer task using remark (each word -> task similarity)
 * 3. show all the possible tasks, ranked by similarity and let user select the best one.
 */

let rows = readCSV(log_sheet_file)

type Word = {
  word: string
  total_occurrence: number
  tasks: {
    // task name -> occurrence
    [task_name: string]: number
  }
}

// word -> Word Entry
let word_entries: Record<string, Word> = {}

let skip_words = extract_lines(`
is
an
the
and
or
not
of
on
of
to
`)

let symbols = '():-.,'

function extract_words(remark: string) {
  let words = remark.split(/\s+/)
  for (let symbol of symbols) {
    words = words.map(word => word.replaceAll(symbol, ''))
  }
  return words.filter(word => word.length > 0 && !skip_words.includes(word))
}

/**
 * 1. collect remark examples with task name
 */
for (let row of rows) {
  let task = row.Task || ''
  let remark = row.Remark || ''

  if (!task) continue

  let words = extract_words(remark)

  for (let word of words) {
    let word_entry = word_entries[word] || {
      word,
      total_occurrence: 0,
      tasks: {},
    }

    word_entry.total_occurrence++

    let task_occurrence = word_entry.tasks[task] || 0
    word_entry.tasks[task] = task_occurrence + 1

    word_entries[word] = word_entry
  }
}

/**
 * 2. infer task using remark
 */

for (let row of rows) {
  let task = row.Task || ''
  let remark = row.Remark || ''

  if (task) continue

  let words = extract_words(remark)

  for (let word of words) {
    let word_entry = word_entries[word]

    if (!word_entry) continue

    console.log('word_entry:', word_entry)
  }
}
