import axios, { type AxiosInstance } from 'axios'

let _paystack: AxiosInstance | null = null
function getPaystack() {
  if (!_paystack) {
    _paystack = axios.create({
      baseURL: 'https://api.paystack.co',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    })
  }
  return _paystack
}

export async function initializeTransaction(params: {
  email: string
  amount: number // in kobo
  reference: string
  callback_url?: string
  metadata?: Record<string, unknown>
}) {
  const { data } = await getPaystack().post('/transaction/initialize', params)
  return data.data as { authorization_url: string; access_code: string; reference: string }
}

export async function verifyTransaction(reference: string) {
  const { data } = await getPaystack().get(`/transaction/verify/${reference}`)
  return data.data
}

export { getPaystack as paystack }
