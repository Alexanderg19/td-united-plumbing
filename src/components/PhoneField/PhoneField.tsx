'use client'

import { useState, type ComponentProps, type Ref } from 'react'
import PhoneInput, { type Country } from 'react-phone-number-input'
import flags from 'react-phone-number-input/flags'
import en from 'react-phone-number-input/locale/en.json'
import es from 'react-phone-number-input/locale/es.json'
import type { Locale } from '@/app/[lang]/dictionaries'
import 'react-phone-number-input/style.css'

const LABELS = { en, es }
const DEFAULT_COUNTRY: Country = 'US'

// The library forwards `ref` to the <input/> at runtime, but its typings declare
// the inner class component instead.
type PhoneInputRef = ComponentProps<typeof PhoneInput>['ref']

interface Props {
  id: string
  lang: Locale
  inputRef: Ref<HTMLInputElement>
  onChange: (value: string) => void
}

// Country selector (default +1 US) with a non-editable calling code, so the
// input's own text is always an international number ("+1 954 555 0199")
// that forms can read straight from the ref and validate with libphonenumber.
export default function PhoneField({ id, lang, inputRef, onChange }: Props) {
  const [value, setValue] = useState<string>()

  return (
    <PhoneInput
      id={id}
      name="phone"
      autoComplete="tel"
      ref={inputRef as PhoneInputRef}
      value={value}
      onChange={(next) => {
        setValue(next)
        onChange(next ?? '')
      }}
      defaultCountry={DEFAULT_COUNTRY}
      international
      countryCallingCodeEditable={false}
      limitMaxLength
      flags={flags}
      labels={LABELS[lang]}
      countryOptionsOrder={[DEFAULT_COUNTRY, '|', '...']}
    />
  )
}
