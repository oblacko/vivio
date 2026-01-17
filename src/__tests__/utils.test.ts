import { cn } from '@/lib/utils'

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2')
  })

  it('should handle conditional classes', () => {
    expect(cn('class1', true && 'class2', false && 'class3')).toBe('class1 class2')
  })

  it('should merge conflicting Tailwind classes', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('should handle undefined and null values', () => {
    expect(cn('class1', undefined, null, 'class2')).toBe('class1 class2')
  })

  it('should handle empty strings', () => {
    expect(cn('class1', '', 'class2')).toBe('class1 class2')
  })

  it('should handle object syntax', () => {
    expect(cn({ 'class1': true, 'class2': false, 'class3': true })).toBe('class1 class3')
  })

  it('should handle mixed inputs', () => {
    expect(cn('base', { 'conditional': true }, ['array1', 'array2'])).toBe('base conditional array1 array2')
  })

  it('should return empty string for no inputs', () => {
    expect(cn()).toBe('')
  })

  it('should handle single input', () => {
    expect(cn('single-class')).toBe('single-class')
  })
})