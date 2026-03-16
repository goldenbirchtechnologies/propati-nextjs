'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Building2, Upload, X, Loader2 } from 'lucide-react'

const listingTypes = [
  { value: 'rent', label: 'For Rent' },
  { value: 'sale', label: 'For Sale' },
  { value: 'short-let', label: 'Short-let' },
  { value: 'share', label: 'Shared Space' },
  { value: 'commercial', label: 'Commercial' },
]

const propertyTypes = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'duplex', label: 'Duplex' },
  { value: 'land', label: 'Land' },
  { value: 'office', label: 'Office' },
  { value: 'shop', label: 'Shop' },
  { value: 'warehouse', label: 'Warehouse' },
]

const pricePeriods = [
  { value: 'month', label: 'Per Month' },
  { value: 'year', label: 'Per Year' },
  { value: 'night', label: 'Per Night' },
  { value: 'total', label: 'Total' },
]

const amenitiesList = [
  '24/7 Power', 'Running Water', 'Security', 'CCTV', 'Swimming Pool',
  'Gym', 'Parking', 'Generator', 'Air Conditioning', 'Balcony',
  'Garden', 'Elevator', 'Smart Home', 'Internet', 'Laundry',
  'Gate House', 'Boys Quarter', 'Store Room',
]

const lagosAreas = [
  'Lekki', 'Victoria Island', 'Ikoyi', 'Ajah', 'Surulere', 'Yaba',
  'Ikeja', 'Maryland', 'Gbagada', 'Magodo', 'Ogba', 'Berger',
  'Festac', 'Apapa', 'Amuwo Odofin', 'Epe', 'Ikorodu', 'Badagry',
]

export default function NewListingPage() {
  const router = useRouter()
  const { locale } = useParams()
  const prefix = `/${locale}/landlord`

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [photos, setPhotos] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])

  const [form, setForm] = useState({
    title: '',
    listingType: 'rent',
    propertyType: 'apartment',
    address: '',
    area: '',
    state: 'Lagos',
    price: '',
    pricePeriod: 'year',
    cautionDeposit: '',
    serviceCharge: '',
    bedrooms: '',
    bathrooms: '',
    toilets: '',
    sizeSqm: '',
    parkingSpaces: '',
    furnished: false,
    description: '',
    amenities: [] as string[],
  })

  function updateForm(field: string, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function toggleAmenity(amenity: string) {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }))
  }

  function handlePhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    const total = photos.length + files.length
    if (total > 10) {
      setError('Maximum 10 photos allowed')
      return
    }
    setPhotos((prev) => [...prev, ...files])
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setPhotoPreviews((prev) => [...prev, ev.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.title || !form.address || !form.area || !form.price) {
      setError('Please fill in all required fields')
      return
    }

    setSubmitting(true)
    try {
      // 1. Create the listing
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          listingType: form.listingType,
          propertyType: form.propertyType,
          address: form.address,
          area: form.area,
          state: form.state,
          price: parseFloat(form.price),
          pricePeriod: form.pricePeriod,
          cautionDeposit: form.cautionDeposit ? parseFloat(form.cautionDeposit) : null,
          serviceCharge: form.serviceCharge ? parseFloat(form.serviceCharge) : null,
          bedrooms: form.bedrooms ? parseInt(form.bedrooms) : null,
          bathrooms: form.bathrooms ? parseInt(form.bathrooms) : null,
          toilets: form.toilets ? parseInt(form.toilets) : null,
          sizeSqm: form.sizeSqm ? parseFloat(form.sizeSqm) : null,
          parkingSpaces: form.parkingSpaces ? parseInt(form.parkingSpaces) : 0,
          furnished: form.furnished,
          description: form.description,
          amenities: form.amenities,
        }),
      })

      const data = await res.json()
      if (!data.success) {
        setError(data.error || 'Failed to create listing')
        setSubmitting(false)
        return
      }

      const listingId = data.listing.id

      // 2. Upload photos if any
      if (photos.length > 0) {
        const formData = new FormData()
        photos.forEach((photo) => formData.append('images', photo))
        await fetch(`/api/listings/${listingId}/images`, {
          method: 'POST',
          body: formData,
        })
      }

      router.push(`${prefix}/listings`)
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Add New Listing</h1>
        <p className="text-sm text-muted-foreground">Fill in the details for your property</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <section className="rounded-xl border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => updateForm('title', e.target.value)}
                placeholder="e.g. Luxurious 3 Bedroom Apartment in Lekki"
                className="w-full rounded-lg border px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Listing Type *</label>
                <select
                  value={form.listingType}
                  onChange={(e) => updateForm('listingType', e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                >
                  {listingTypes.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Property Type *</label>
                <select
                  value={form.propertyType}
                  onChange={(e) => updateForm('propertyType', e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                >
                  {propertyTypes.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Address *</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => updateForm('address', e.target.value)}
                placeholder="Full street address"
                className="w-full rounded-lg border px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Area *</label>
                <select
                  value={form.area}
                  onChange={(e) => updateForm('area', e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                  required
                >
                  <option value="">Select area</option>
                  {lagosAreas.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">State</label>
                <input
                  type="text"
                  value={form.state}
                  onChange={(e) => updateForm('state', e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="rounded-xl border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Pricing</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Price (₦) *</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => updateForm('price', e.target.value)}
                placeholder="e.g. 3000000"
                className="w-full rounded-lg border px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Price Period</label>
              <select
                value={form.pricePeriod}
                onChange={(e) => updateForm('pricePeriod', e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              >
                {pricePeriods.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Caution Deposit (₦)</label>
              <input
                type="number"
                value={form.cautionDeposit}
                onChange={(e) => updateForm('cautionDeposit', e.target.value)}
                placeholder="Optional"
                className="w-full rounded-lg border px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Service Charge (₦)</label>
              <input
                type="number"
                value={form.serviceCharge}
                onChange={(e) => updateForm('serviceCharge', e.target.value)}
                placeholder="Optional"
                className="w-full rounded-lg border px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>
          </div>
        </section>

        {/* Property Details */}
        <section className="rounded-xl border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Property Details</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Bedrooms</label>
              <input
                type="number"
                value={form.bedrooms}
                onChange={(e) => updateForm('bedrooms', e.target.value)}
                min="0"
                className="w-full rounded-lg border px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Bathrooms</label>
              <input
                type="number"
                value={form.bathrooms}
                onChange={(e) => updateForm('bathrooms', e.target.value)}
                min="0"
                className="w-full rounded-lg border px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Toilets</label>
              <input
                type="number"
                value={form.toilets}
                onChange={(e) => updateForm('toilets', e.target.value)}
                min="0"
                className="w-full rounded-lg border px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Size (sqm)</label>
              <input
                type="number"
                value={form.sizeSqm}
                onChange={(e) => updateForm('sizeSqm', e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Parking Spaces</label>
              <input
                type="number"
                value={form.parkingSpaces}
                onChange={(e) => updateForm('parkingSpaces', e.target.value)}
                min="0"
                className="w-full rounded-lg border px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={form.furnished}
                  onChange={(e) => updateForm('furnished', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-gold focus:ring-gold"
                />
                Furnished
              </label>
            </div>
          </div>
        </section>

        {/* Description */}
        <section className="rounded-xl border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Description</h2>
          <textarea
            value={form.description}
            onChange={(e) => updateForm('description', e.target.value)}
            placeholder="Describe your property — highlight key features, nearby landmarks, and what makes it special"
            rows={5}
            className="w-full rounded-lg border px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
          />
        </section>

        {/* Amenities */}
        <section className="rounded-xl border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Amenities</h2>
          <div className="flex flex-wrap gap-2">
            {amenitiesList.map((amenity) => (
              <button
                key={amenity}
                type="button"
                onClick={() => toggleAmenity(amenity)}
                className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                  form.amenities.includes(amenity)
                    ? 'bg-gold text-white'
                    : 'border bg-white text-muted-foreground hover:bg-muted'
                }`}
              >
                {amenity}
              </button>
            ))}
          </div>
        </section>

        {/* Photos */}
        <section className="rounded-xl border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Photos</h2>
          <p className="mb-3 text-sm text-muted-foreground">Upload up to 10 photos. First photo will be the cover image.</p>

          {photoPreviews.length > 0 && (
            <div className="mb-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
              {photoPreviews.map((src, i) => (
                <div key={i} className="group relative aspect-square overflow-hidden rounded-lg">
                  <img src={src} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                  {i === 0 && (
                    <span className="absolute left-1 top-1 rounded bg-gold px-1.5 py-0.5 text-[10px] font-medium text-white">
                      Cover
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {photos.length < 10 && (
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors hover:border-gold hover:bg-gold/5">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Click to upload photos</span>
              <span className="text-xs text-muted-foreground">{photos.length}/10 photos</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotos}
                className="hidden"
              />
            </label>
          )}
        </section>

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border px-6 py-2.5 text-sm font-medium hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 rounded-lg bg-gold px-6 py-2.5 text-sm font-medium text-white hover:bg-gold/90 disabled:opacity-50"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? 'Creating...' : 'Submit Listing'}
          </button>
        </div>
      </form>
    </div>
  )
}
