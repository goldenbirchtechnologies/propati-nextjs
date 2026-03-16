const DOJAH_APP_ID    = process.env.DOJAH_APP_ID
const DOJAH_SECRET    = process.env.DOJAH_SECRET_KEY

export type DojahIdType = 'nin' | 'drivers_license' | 'voters_card'

export interface DojahResult {
  firstName:  string
  lastName:   string
  fullName:   string
  dob:        string
  gender:     string
  phone?:     string
  photo?:     string
  dojahRef:   string
}

export async function verifyIdentity(type: DojahIdType, number: string): Promise<DojahResult> {
  if (!DOJAH_APP_ID || !DOJAH_SECRET) {
    console.log(`[DOJAH MOCK] Verifying ${type}: ${number}`)
    return {
      firstName: 'ADAEZE',
      lastName:  'OKONKWO',
      fullName:  'ADAEZE CHIOMA OKONKWO',
      dob:       '1990-05-15',
      gender:    'Female',
      dojahRef:  `mock_${Date.now()}`,
    }
  }

  const endpoints: Record<DojahIdType, string> = {
    nin:             'https://api.dojah.io/api/v1/kyc/nin',
    drivers_license: 'https://api.dojah.io/api/v1/kyc/dl',
    voters_card:     'https://api.dojah.io/api/v1/kyc/vin',
  }

  const paramKeys: Record<DojahIdType, string> = {
    nin:             'nin',
    drivers_license: 'license_number',
    voters_card:     'vin',
  }

  const url = `${endpoints[type]}?${paramKeys[type]}=${encodeURIComponent(number)}`

  const res = await fetch(url, {
    headers: {
      'AppId':         DOJAH_APP_ID,
      'Authorization': DOJAH_SECRET,
      'Content-Type':  'application/json',
    },
  })

  const data = await res.json()

  if (!res.ok || data.error) {
    throw new Error(data.error ?? `Verification failed: ${res.status}`)
  }

  const e = data.entity ?? data
  const firstName = (e.firstname  ?? e.first_name  ?? '').toUpperCase().trim()
  const lastName  = (e.surname    ?? e.last_name   ?? '').toUpperCase().trim()

  return {
    firstName,
    lastName,
    fullName:  `${firstName} ${lastName}`.trim(),
    dob:       e.birthdate    ?? e.date_of_birth ?? '',
    gender:    e.gender       ?? '',
    phone:     e.mobile       ?? e.phone         ?? undefined,
    photo:     e.photo        ?? undefined,
    dojahRef:  data.entity?.ref ?? `dojah_${Date.now()}`,
  }
}

export function maskId(id: string): string {
  const clean = id.replace(/\s/g, '')
  if (clean.length <= 4) return clean
  return '*'.repeat(clean.length - 4) + clean.slice(-4)
}
