import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { NetWorthChart, MiniBars } from './charts'

const history    = [14820, 15010, 15240, 15680, 15940, 16210, 16480, 16820, 17100, 17380, 17680, 18420]
const forecast12m = [18420, 18760, 19120, 19490, 19880, 20290, 20720, 21180, 21650, 22150, 22680, 23230]

describe('NetWorthChart', () => {
  it('renders an SVG element', () => {
    const { container } = render(<NetWorthChart history={history} forecast={forecast12m} />)
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('renders history and forecast paths', () => {
    const { container } = render(<NetWorthChart history={history} forecast={forecast12m} />)
    const paths = container.querySelectorAll('path')
    expect(paths.length).toBeGreaterThanOrEqual(2)
  })

  it('renders axis labels', () => {
    const { getByText } = render(<NetWorthChart history={history} forecast={forecast12m} />)
    expect(getByText('heute')).toBeDefined()
    expect(getByText('−12M')).toBeDefined()
    expect(getByText('+12M')).toBeDefined()
  })
})

describe('MiniBars', () => {
  it('renders correct number of bars', () => {
    const data = [38, 42, 45, 48, 44, 42, 48]
    const { container } = render(<MiniBars data={data} />)
    const rects = container.querySelectorAll('rect')
    expect(rects.length).toBe(7)
  })

  it('renders nothing for empty data', () => {
    const { container } = render(<MiniBars data={[]} />)
    expect(container.querySelector('svg')).toBeNull()
  })
})
