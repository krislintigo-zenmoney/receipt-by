export interface ReceiptSuccessResponse {
  status: 'success'
  code: number
  message: {
    /** TODO: clarify */
    STATUS: 1

    /** Status message **/
    success: string

    /** Name of cashier */
    cashier: string

    /** DD/MM/YYYY, HH:MM:SS */
    issued_at: string

    /**
     *
     * AMOUNTS AND CURRENCY
     *
     * */

    /** Operation currency
     * @example "BYN"
     *  */
    currency: string
    /** Receipt amount */
    total_amount: number
    /** Discount amount */
    another_amount: number
    /** Amount to pay */
    payment_amount: number
    /** Amount paid by cash */
    cash_amount: number
    /** Amount paid by card */
    clearing_amount: number

    /** TODO: clarify */
    payment_type: 1
    /** TODO: clarify */
    margin: 0

    /**
     * String of positions in the receipt.
     * Provided as JSON array of objects.
     * Does not have a constant schema.
     * */
    positions: string

    /**
     *
     * ORGANIZATION AND ADDRESS
     *
     * */

    /** Legal organization name */
    name_spd: string
    /** Receipt point name */
    name_to: string
    /** Locality type */
    type_np: string
    /** Locality name */
    name_np: string
    /** Street address part */
    street_to: string
    /** Building address part */
    house_to: string

    /** SOATO code */
    kod_soato: string
    /** SOATO state code */
    oblast_soato: string | null
    /** SOATO region code */
    rayon_soato: string | null
    /** SOATO subregion code */
    selsovet_soato: string | null

    /**
     *
     * TECHNICAL INFORMATION
     *
     * */

    /** Receipt ID number **/
    ui: string
    /** Receipt internal number */
    doc_num: string
    /** Cashbox ID */
    cashbox_number: number
    /** SKNO device number */
    skno_number: string
    /** Organization PAN */
    unp: string
  }
}

export interface ReceiptErrorResponse {
  status: 'warning'
  code: number
}

export type ReceiptResponse = ReceiptSuccessResponse | ReceiptErrorResponse

export interface ReceiptPosition {
  //
  section_number?: string
  gtin_code?: string
  /** Product count (number of pieces, weight, etc.) */
  product_count?: string
  /** Sum amount */
  amount?: string
  /** Discount amount */
  discount_amount?: string
  surcharge_amount?: string
  /** TODO: clarify */
  tag?: '0' | '1'
  /** Marking code, `None` if not presented */
  marking_code?: string
  /** UKZ, `None` if not presented */
  ukz_code?: string
  /** Name of the product */
  product_name?: string
  //

  ean?: string // sibling of `gtin_code`
  count?: string // sibling of `product_count`
  margin?: string // sibling of `surcharge_amount`
}

export interface Receipt {
  id: string

  receiptId: string
  cashboxId: string
  orgPan: string
  cashier: string
  issuedAt: string

  orgName: string
  orgPoint: string
  orgAddress: string

  positions: {
    name: string
    count: number
    amount: number
    discount: number
    surcharge: number
    gtin: string
    mark: string | null
    ukz: string | null
  }[]

  totalAmount: number
  discountAmount: number
  paymentAmount: number
  cashAmount: number
  cardAmount: number
}
