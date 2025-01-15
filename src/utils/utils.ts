import {sha512} from "@noble/hashes/sha512"
import * as ed25519 from "@noble/ed25519"
import bencode from "bencode"

export const getLanguageFromFilename = (filename: string) => {
  const basename = filename.split("/").pop()
  const extension = filename.split(".").pop()

  switch (basename) {
    case "go.mod":
    case "go.sum":
      return "ini"
    default:
      break
  }

  switch (extension) {
    case "js":
      return "javascript"
    case "ts":
      return "typescript"
    case "jsx":
      return "javascript" // Monaco uses 'javascript' for JSX as well
    case "tsx":
      return "typescript" // Monaco uses 'typescript' for TSX as well
    case "html":
      return "html"
    case "css":
      return "css"
    case "json":
      return "json"
    case "py":
      return "python"
    case "java":
      return "java"
    case "c":
      return "c"
    case "cpp":
      return "cpp" // Check Monaco's documentation for C++ identifier
    case "cs":
      return "csharp"
    case "rb":
      return "ruby"
    case "go":
      return "go"
    case "php":
      return "php"
    case "md":
      return "markdown"
    case "xml":
      return "xml"
    case "sql":
      return "sql"
    case "yaml":
    case "yml":
      return "yaml"
    case "bat":
      return "bat"
    default:
      return "plaintext"
  }
}

export const statCalc = (n: number) => {
  if (n < 1000) return n + " "

  // If the number is 1000 or greater, format it
  return (n / 1000).toFixed(1).replace(".0", "") + "k "
}

export const formatFileSize = (size: number): string => {
  if (size < 1024) {
    return `${size} bytes`
  } else if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} KB`
  } else if (size < 1024 * 1024 * 1024) {
    return `${(size / 1024 / 1024).toFixed(2)} MB`
  } else {
    return `${(size / 1024 / 1024 / 1024).toFixed(2)} GB`
  }
}

export function generateEd25519Keypair(privateKeyHex: string) {
  // additional polyfills for the ed25519 library
  ed25519.etc.sha512Sync = (...m) => sha512(ed25519.etc.concatBytes(...m))

  const privateKeyBytes = new Uint8Array(privateKeyHex.length / 2)
  for (let i = 0; i < privateKeyHex.length; i += 2) {
    privateKeyBytes[i / 2] = parseInt(privateKeyHex.slice(i, i + 2), 16)
  }

  // Clamp the private key for Ed25519 usage
  const clampedPrivateKey = new Uint8Array(privateKeyBytes)
  clampedPrivateKey[0] &= 248 // Clear the lowest 3 bits
  clampedPrivateKey[31] &= 127 // Clear the highest bit
  clampedPrivateKey[31] |= 64 // Set the second highest bit

  return {
    privateKey: clampedPrivateKey,
    publicKey: ed25519.getPublicKey(clampedPrivateKey),
  }
}

// Create a BitTorrent DHT payload to be signed with the DHT key (ed25519)
export async function createSignedDHTPayload(
  privateKey: Uint8Array, // DHT privKey (as Uint8Array)
  value: string // (JSON string, e.g. relay list)
) {
  // Additional polyfills for the ed25519 library
  ed25519.etc.sha512Sync = (...m) => sha512(ed25519.etc.concatBytes(...m))

  const payload = {
    seq: Math.floor(Date.now() / 1000),
    v: value, // Value is the JSON string
  }

  const encodedPayload = bencode.encode(payload) // Bencode the payload

  const signature: Uint8Array = await ed25519.signAsync(encodedPayload, privateKey)

  return {
    payload: encodedPayload,
    dht_sig: signature,
  }
}

export function uint8ArrayToHexString(uint8Array: Uint8Array): string {
  return Array.from(uint8Array, (byte) => byte.toString(16).padStart(2, "0")).join("")
}
