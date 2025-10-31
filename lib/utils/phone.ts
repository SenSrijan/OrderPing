export function formatPhoneE164(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')
  
  // If starts with 91 (India), ensure it has + prefix
  if (digits.startsWith('91') && digits.length === 12) {
    return `+${digits}`
  }
  
  // If 10 digits, assume Indian number
  if (digits.length === 10) {
    return `+91${digits}`
  }
  
  // If already has country code but no +
  if (digits.length > 10 && !phone.startsWith('+')) {
    return `+${digits}`
  }
  
  return phone
}

export function validatePhoneE164(phone: string): boolean {
  const e164Regex = /^\+[1-9][0-9]{7,15}$/
  return e164Regex.test(phone)
}

export function formatPhoneDisplay(phone: string): string {
  if (phone.startsWith('+91')) {
    const number = phone.slice(3)
    return `+91 ${number.slice(0, 5)} ${number.slice(5)}`
  }
  return phone
}