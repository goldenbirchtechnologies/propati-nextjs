export default function NairaCurrency({ amount }: { amount: number }) {
  return <span>₦{amount.toLocaleString('en-NG')}</span>
}
