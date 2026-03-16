import axios from 'axios'

const paystack = axios.create({
  baseURL: 'https://api.paystack.co',
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json',
  },
})

export async function initializeTransaction(params: {
  email: string
  amount: number // in kobo
  reference: string
  callback_url?: string
  metadata?: Record<string, unknown>
}) {
  const { data } = await paystack.post('/transaction/initialize', params)
  return data.data as { authorization_url: string; access_code: string; reference: string }
}

export async function verifyTransaction(reference: string) {
  const { data } = await paystack.get(`/transaction/verify/${reference}`)
  return data.data
}

export { paystack }
