/** Converts receipt date from DD/MM/YYYY, HH:MM:SS to ISO-8601 */
export const convertReceiptDate = (date: string): string => {
  const [datePart, timePart] = date.split(', ')
  const [day, month, year] = datePart.split('/')
  const iso = `${year}-${month}-${day}T${timePart}+03:00`
  return new Date(iso).toISOString()
}
