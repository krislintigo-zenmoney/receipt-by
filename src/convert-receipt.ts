import fs from 'node:fs/promises'
import * as process from 'node:process'
import readline from 'node:readline/promises'

import { convertReceiptDate } from './converters'
import { ReceiptHtmlRenderer } from './receipt-html-renderer'
import type { Receipt, ReceiptPosition, ReceiptResponse } from './types'

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

const number = await rl.question('Receipt number (24 digits): ')
const date = await rl.question('Date (YYYY-MM-DD): ')

if (!date || !number) {
  throw new Error('Missing receipt date or number')
}

const requestData = new FormData()
requestData.append('orig_date', date)
requestData.append('orig_ui', number)

const response = await fetch('https://ch.info-center.by/ajax/check1.php', {
  method: 'POST',
  body: requestData,
})

const data = (await response.json()) as ReceiptResponse

if (data.status === 'warning') {
  throw new Error('Receipt is not found!')
}

const issuedAt = convertReceiptDate(data.message.issued_at)
const rawPositions = JSON.parse(data.message.positions) as ReceiptPosition[]

const receipt: Receipt = {
  id: data.message.ui,

  receiptId: data.message.doc_num,
  cashboxId: data.message.cashbox_number.toString(),
  orgPan: data.message.unp,
  cashier: data.message.cashier.trim(),
  issuedAt,

  orgName: data.message.name_spd,
  orgPoint: data.message.name_to,
  orgAddress: `${data.message.type_np} ${data.message.name_np}, ${data.message.street_to} ${data.message.house_to}`,

  positions: rawPositions.map((rawPosition) => {
    const name = rawPosition.product_name ?? rawPosition.gtin_code ?? rawPosition.ean ?? 'UNKNOWN'
    const gtin = rawPosition.gtin_code ?? rawPosition.ean ?? 'UNKNOWN'
    const count = Number(rawPosition.product_count) || Number(rawPosition.count) || 0
    const amount = Number(rawPosition.amount) || 0
    const discount = Number(rawPosition.discount_amount) || 0
    const surcharge = Number(rawPosition.surcharge_amount) || 0
    const mark = rawPosition.marking_code === 'None' ? null : (rawPosition.marking_code ?? null)
    const ukz = rawPosition.ukz_code === 'None' ? null : (rawPosition.ukz_code ?? null)

    return { name, gtin, count, amount, discount, surcharge, mark, ukz }
  }),

  totalAmount: data.message.total_amount,
  discountAmount: data.message.another_amount,
  paymentAmount: data.message.payment_amount,
  cashAmount: data.message.cash_amount,
  cardAmount: data.message.clearing_amount,
}

const renderer = new ReceiptHtmlRenderer()

await fs.mkdir(`./.data/${receipt.id}`, { recursive: true })
await fs.writeFile(`./.data/${receipt.id}/${receipt.id}.json`, JSON.stringify(receipt, null, 2))
await fs.writeFile(`./.data/${receipt.id}/${receipt.id}.raw.json`, JSON.stringify(data, null, 2))
await fs.writeFile(`./.data/${receipt.id}/${receipt.id}.html`, renderer.render(receipt))

console.log(`Result saved in .data/${receipt.id}`)

process.exit(0)
