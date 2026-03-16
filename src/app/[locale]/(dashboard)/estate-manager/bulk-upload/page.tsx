import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Upload, FileSpreadsheet, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function getAuthUserId() {
  try {
    const { auth } = require('@clerk/nextjs/server')
    return auth().userId as string | null
  } catch {
    return null
  }
}

export default async function EMBulkUpload({
  params,
}: {
  params: { locale: string }
}) {
  const clerkUserId = await getAuthUserId()
  if (!clerkUserId) redirect(`/${params.locale}/sign-in`)

  const dbUser = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true },
  })
  if (!dbUser) redirect(`/${params.locale}/onboarding`)

  const org = await prisma.organisation.findFirst({
    where: { ownerId: dbUser.id },
  })

  const prefix = `/${params.locale}/estate-manager`

  if (!org) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <Upload className="h-10 w-10 text-blue-600" />
        <h1 className="text-2xl font-bold">No Organisation</h1>
        <p className="text-sm text-muted-foreground">Create an organisation first.</p>
        <Link
          href={`${prefix}/create-org`}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Create Organisation
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bulk Import</h1>
        <p className="text-sm text-muted-foreground">Import multiple properties at once for {org.name}</p>
      </div>

      {/* Upload area */}
      <div className="rounded-xl border border-dashed bg-white p-12 text-center">
        <Upload className="mx-auto h-12 w-12 text-blue-400" />
        <h2 className="mt-4 text-lg font-semibold">Upload CSV or Excel File</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Upload a spreadsheet with your property data. We support .csv, .xlsx, and .xls files.
        </p>
        <button className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
          <Upload className="h-4 w-4" />
          Choose File
        </button>
      </div>

      {/* Template download */}
      <div className="rounded-xl border bg-white p-6">
        <h3 className="font-semibold">Download Template</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Use our template to ensure your data is formatted correctly.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50">
            <FileSpreadsheet className="h-4 w-4 text-green-600" />
            Download CSV Template
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50">
            <FileSpreadsheet className="h-4 w-4 text-green-600" />
            Download Excel Template
          </button>
        </div>
      </div>

      {/* Required fields */}
      <div className="rounded-xl border bg-white p-6">
        <h3 className="font-semibold">Required Fields</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {[
            'Title', 'Address', 'Area', 'State', 'Listing Type',
            'Property Type', 'Price', 'Price Period', 'Bedrooms',
            'Bathrooms', 'Description',
          ].map((field) => (
            <div key={field} className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              {field}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
