import type { Receipt } from './types'

const STYLES = `
<style>
  @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400,600&display=swap');
  
  .receipt {
    max-width: 420px;
    padding: 24px;
    font-family: "Geist Mono", SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    background: #fff;
    color: #111;
    border: 1px solid #ddd;
  }
  
  .receipt__header {
    text-align: center;
    margin-bottom: 20px;
  }
  
  .receipt__header h1 {
    margin: 0 0 8px;
    font-size: 18px;
  }

  .receipt__identity {
    margin-top: 8px;
    font-size: 13px;
    color: #444;
  }

  .receipt__check-id {
    border-top: 1px dashed #aaa;
    padding-top: 20px;
    margin-top: 10px;
    text-align: center;
    font-size: 14px;
    color: #444;
  }
  
  .receipt__meta,
  .receipt__totals {
    border-top: 1px dashed #aaa;
    padding-top: 12px;
    margin-top: 6px;
    margin-bottom: 6px;
  }
  
  .receipt__meta div,
  .receipt__totals div {
    display: flex;
    justify-content: space-between;
    gap: 12px;
  }
  
  .receipt-position {
    border-top: 1px dashed #ccc;
    padding: 12px 0;
  }
  
  .receipt-position__main {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 8px;
  }
  
  .receipt-position__name {
    font-weight: 600;
  }
  
  .receipt-position__details {
    margin-top: 6px;
    font-size: 13px;
    color: #555;
    word-break: break-all;
  }

  .receipt-position__marked-details {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    word-break: normal;
  }

  .receipt-position__mark {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    width: 25px;
    height: 25px;
    color: #111;
  }

  .receipt-position__mark svg {
    width: 36px;
    height: 36px;
  }
</style>
`

export class ReceiptHtmlRenderer {
  public render(receipt: Receipt): string {
    return `
      <html lang="ru">
        <head>
          <title>${receipt.id}</title>
          <meta charset="utf-8">
          ${STYLES}
        </head>
        <body>
          <article class="receipt">
            ${this.renderHeader(receipt)}
            ${this.renderMeta(receipt)}
            ${this.renderPositions(receipt.positions)}
            ${this.renderTotals(receipt)}
            ${this.renderCheckId(receipt)}
          </article>
        </body>
      </html>
    `
  }

  private renderHeader(receipt: Receipt): string {
    return `
      <header class="receipt__header">
        <h1>${this.escape(receipt.orgName)}</h1>
        <div>${this.escape(receipt.orgPoint)}</div>
        <div>${this.escape(receipt.orgAddress)}</div>
        <div class="receipt__identity">
          <div>УНП: ${this.escape(receipt.orgPan)}</div>
        </div>
      </header>
    `
  }

  private renderMeta(receipt: Receipt): string {
    return `
      <section class="receipt__meta">
        <div><span>Дата:</span> ${this.escape(this.formatDate(receipt.issuedAt))}</div>
        <div><span>Касса:</span> ${this.escape(receipt.cashboxId)}</div>
        <div><span>Кассир:</span> ${this.escape(receipt.cashier)}</div>
        <div><span>Чек:</span> ${this.escape(receipt.receiptId)}</div>
      </section>
    `
  }

  private renderPositions(positions: Receipt['positions']): string {
    return `
      <section class="receipt__positions">
        ${positions.map((position, i) => this.renderPosition(position, i)).join('')}
      </section>
    `
  }

  private renderPosition(position: Receipt['positions'][number], index: number): string {
    return `
      <div class="receipt-position">
        <div class="receipt-position__main">
          <div class="receipt-position__name">${this.escape(position.name)}</div>
          <div class="receipt-position__amount">${this.formatMoney(position.amount)}</div>
        </div>
        ${this.renderPositionDetails(position, index)}
      </div>
    `
  }

  private renderPositionDetails(position: Receipt['positions'][number], index: number): string {
    const details = [
      `<div>#${index + 1} · x${this.formatNumber(position.count)} · ${position.gtin}</div>`,
      position.discount ? `<div>Скидка: ${this.formatMoney(position.discount)}</div>` : '',
      position.surcharge ? `<div>Надбавка: ${this.formatMoney(position.surcharge)}</div>` : '',
    ].filter(Boolean)

    if (!position.mark) {
      return `
        <div class="receipt-position__details">
          ${details.join('')}
        </div>
      `
    }

    return `
      <div class="receipt-position__details receipt-position__marked-details">
        <div>
          ${details.join('')}
        </div>

        <div class="receipt-position__mark" aria-label="QR-код">
          ${this.renderQrIcon()}
        </div>
      </div>
    `
  }

  private renderTotals(receipt: Receipt): string {
    const totalPart = `
      <div>
          <span>Итого</span>
          <strong>${this.formatMoney(receipt.totalAmount)}</strong>
      </div>
    `
    const discountPart = `
      <div>
          <span>Скидка</span>
          <strong>${this.formatMoney(receipt.discountAmount)}</strong>
      </div>
    `
    const paymentPart = `
      <div>
          <span>К оплате</span>
          <strong>${this.formatMoney(receipt.paymentAmount)}</strong>
      </div>
    `
    const cashPart = `
      <div>
          <span>Наличными</span>
          <strong>${this.formatMoney(receipt.cashAmount)}</strong>
      </div>
    `
    const cardPart = `
      <div>
          <span>Картой</span>
          <strong>${this.formatMoney(receipt.cardAmount)}</strong>
      </div>
    `

    return `
      <section class="receipt__totals">
        ${totalPart}
        ${receipt.discountAmount ? discountPart : ''}
        ${receipt.discountAmount ? paymentPart : ''}
        ${receipt.cashAmount ? cashPart : ''}
        ${receipt.cardAmount ? cardPart : ''}
      </section>
    `
  }

  private renderCheckId(receipt: Receipt): string {
    return `
      <div class="receipt__check-id">ID: ${this.escape(receipt.id)}</div>
    `
  }

  private renderQrIcon(): string {
    return `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M4 3h3s1 0 1 1v3s0 1 -1 1H4S3 8 3 7V4s0 -1 1 -1" stroke-width="2"></path>
        <path
          d="M17 3h3s1 0 1 1v3s0 1 -1 1h-3s-1 0 -1 -1V4s0 -1 1 -1"
          stroke-width="2"
        ></path>
        <path
          d="M4 16h3s1 0 1 1v3s0 1 -1 1H4s-1 0 -1 -1v-3s0 -1 1 -1"
          stroke-width="2"
        ></path>
        <path d="M21 16h-3a2 2 0 0 0 -2 2v3" stroke-width="2"></path>
        <path d="M21 21v0.01" stroke-width="2"></path>
        <path d="M12 7v3a2 2 0 0 1 -2 2H7" stroke-width="2"></path>
        <path d="M3 12h0.01" stroke-width="2"></path>
        <path d="M12 3h0.01" stroke-width="2"></path>
        <path d="M12 16v0.01" stroke-width="2"></path>
        <path d="M16 12h1" stroke-width="2"></path>
        <path d="M21 12v0.01" stroke-width="2"></path>
        <path d="M12 21v-1" stroke-width="2"></path>
      </svg>
    `
  }

  private formatMoney(value: number): string {
    return (
      new Intl.NumberFormat('ru-BY', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value) + ' BYN'
    )
  }

  private formatNumber(value: number): string {
    return new Intl.NumberFormat('ru-BY', {
      maximumFractionDigits: 3,
    }).format(value)
  }

  private formatDate(value: string): string {
    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return value
    }

    return new Intl.DateTimeFormat('ru-BY', {
      dateStyle: 'short',
      timeStyle: 'medium',
    }).format(date)
  }

  private escape(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;')
  }
}
