import { downloadFile, readFileAsText } from '../utils/fileIO'

describe('downloadFile', () => {
  it('creates an object URL, clicks a download link, then revokes the URL', async () => {
    vi.useFakeTimers()
    const createObjectURL = vi.fn(() => 'blob:mock-url')
    const revokeObjectURL = vi.fn()
    Object.assign(URL, { createObjectURL, revokeObjectURL })
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    try {
      downloadFile('export.json', '{"a":1}')

      expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob))
      const link = click.mock.contexts[0] as HTMLAnchorElement
      expect(link.download).toBe('export.json')
      expect(link.href).toBe('blob:mock-url')
      expect(link.isConnected).toBe(false) // removed after click

      vi.runAllTimers()
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
    } finally {
      click.mockRestore()
      vi.useRealTimers()
    }
  })
})

describe('readFileAsText', () => {
  it('reads text with File.text()', async () => {
    await expect(readFileAsText(new File(['hello'], 'a.txt'))).resolves.toBe('hello')
  })

  it('falls back to FileReader when File.text() is unavailable', async () => {
    const file = new File(['fallback'], 'b.txt')
    Object.defineProperty(file, 'text', { value: undefined })
    await expect(readFileAsText(file)).resolves.toBe('fallback')
  })
})
