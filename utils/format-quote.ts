export interface QuoteParts {
  isQuote: boolean
  quoteBody: string
  attribution: string | null
  regularText: string
}

/**
 * Detects and parses quote text from content.
 * Quotes are identified by attribution patterns like "- Author Name" at the end.
 */
export function parseQuoteContent(content: string): QuoteParts {
  // Pattern to match attribution at the end (e.g., "- Robert Frost", "— Author Name")
  // Matches lines starting with "-" or "—" followed by text
  const attributionPattern = /(\r?\n\s*[-–—]\s*[^\r\n]+)\s*$/
  
  const match = content.match(attributionPattern)
  
  if (!match) {
    return {
      isQuote: false,
      quoteBody: '',
      attribution: null,
      regularText: content,
    }
  }
  
  const attribution = match[1].trim()
  const quoteBody = content.substring(0, match.index).trim()
  
  // Check if quote body has sufficient content (at least a few words)
  // This helps avoid false positives
  const wordCount = quoteBody.split(/\s+/).filter(word => word.length > 0).length
  
  if (wordCount < 3) {
    return {
      isQuote: false,
      quoteBody: '',
      attribution: null,
      regularText: content,
    }
  }
  
  return {
    isQuote: true,
    quoteBody,
    attribution,
    regularText: '',
  }
}

