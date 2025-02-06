// Import the function to detect file type from a Uint8Array.
// Depending on your build/environment, you may need to adjust the import.
// For example, for a browser build you might need: import { fileTypeFromBuffer } from 'file-type/core';
import {fileTypeFromBuffer} from "file-type/core"
/**
 * Detects the media type ("image" or "video") of the resource at the given URL
 * by reading from the response stream.
 *
 * @param url - The URL of the media resource.
 * @returns A Promise that resolves to a string: either "image" or "video".
 * @throws An error if the media type cannot be determined or is unsupported.
 */
export async function detectFileType(url: string): Promise<string> {
  // Fetch the URL using GET so that we obtain the response body.
  const response = await fetch(url, {method: "GET", redirect: "follow"})
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  if (!response.body) {
    throw new Error("No response body available")
  }

  console.log("response---------------", response)

  // Create a reader from the response body stream.
  const reader = response.body.getReader()

  // We'll accumulate chunks until we have enough data to detect the file type.
  const chunks: Uint8Array[] = []
  let totalLength = 0
  const MIN_BYTES = 4100 // 4100 bytes is usually enough for file-type detection.

  while (totalLength < MIN_BYTES) {
    const {done, value} = await reader.read()
    if (done) break
    if (value) {
      chunks.push(value)
      totalLength += value.length
    }
  }

  // Concatenate the chunks into a single Uint8Array.
  const buffer = new Uint8Array(totalLength)
  let offset = 0
  for (const chunk of chunks) {
    buffer.set(chunk, offset)
    offset += chunk.length
  }
  console.log("buffer---------------", buffer)

  // Use file-type to detect the file type from the buffer.
  const result = await fileTypeFromBuffer(buffer)
  if (!result || !result.mime) {
    throw new Error("Could not detect file type")
  }

  console.log("result---------------", result)

  // Return "image" if the MIME type starts with "image/", or "video" if it starts with "video/".
  if (result.mime.startsWith("image/")) {
    return "image"
  } else if (result.mime.startsWith("video/")) {
    return "video"
  } else {
    throw new Error(`Unsupported media type: ${result.mime}`)
  }
}
