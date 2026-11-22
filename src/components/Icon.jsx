const paths = {
  logo: 'M4 7h8m-8 5h5m-5 5h8m0-5 3 3 5-7',
  grid: 'M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z',
  list: 'M9 6h12M9 12h12M9 18h12M4 6h.01M4 12h.01M4 18h.01',
  clock: 'M12 8v4l3 2m6-2a9 9 0 1 1-18 0 9 9 0 1 1 18 0Z',
  check: 'm5 12 4 4L19 6',
  circle: 'm8 12 3 3 5-6m5 3a9 9 0 1 1-18 0 9 9 0 1 1 18 0Z',
  chart: 'M4 19h16M7 15v-4m5 4V7m5 8V4',
  edit: 'm13 6 5 5M4 20l5-1L21 7l-5-5L4 14z',
  trash: 'M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15m-8 4v7m4-7v7',
  plus: 'M12 5v14M5 12h14',
  calendar: 'M3 6h18v15H3zM3 10h18M8 3v5m8-5v5',
  search: 'm16 16 4 4m-2-9a7 7 0 1 1-14 0 7 7 0 1 1 14 0Z',
  chevron: 'm6 9 6 6 6-6',
}

export default function Icon({ name, size = 20 }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[name]} />
    </svg>
  )
}
