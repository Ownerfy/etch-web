import {getStorage, ref, uploadBytesResumable, getDownloadURL} from "firebase/storage"
import {auth} from "@/shared/services/firebase.tsx"
// import socialGraph from "@/utils/socialGraph"
// import {NDKEvent} from "@nostr-dev-kit/ndk"
import {v4 as uuidv4} from "uuid"
// import {ndk} from "irisdb-nostr"

export async function uploadToFirebaseStorage(
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  const storage = getStorage()
  const uid = auth.currentUser?.uid
  const fileExtension = file.name.split(".").pop()?.toLowerCase()
  const uniqueFileName = `${uuidv4()}.${fileExtension}`
  const storageRef = ref(storage, `userDirectUploads/${uid}/${uniqueFileName}`)
  const uploadTask = uploadBytesResumable(storageRef, file)

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        if (onProgress) {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          onProgress(progress)
        }
      },
      (error) => {
        reject(new Error(`Upload to Firebase Storage failed: ${error.message}`))
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
          resolve(downloadURL)
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error)
          reject(new Error(`Failed to get download URL: ${errorMessage}`))
        }
      }
    )
  })
}

// export async function uploadFile(
//   file: File,
//   onProgress?: (progress: number) => void
// ): Promise<string> {
//   const fd = new FormData()
//   fd.append("fileToUpload", file)
//   fd.append("submit", "Upload Image")

//   const url = "https://nostr.build/api/v2/nip96/upload"

//   // Create a Nostr event for authentication
//   const event = new NDKEvent(ndk(), {
//     kind: 27235, // http authentication
//     tags: [
//       ["u", url],
//       ["method", "POST"],
//     ],
//     content: "",
//     created_at: Math.floor(Date.now() / 1000),
//     pubkey: [...socialGraph().getUsersByFollowDistance(0)][0],
//   })
//   await event.sign()
//   const nostrEvent = await event.toNostrEvent()

//   // Encode the event for the Authorization header
//   const encodedEvent = btoa(JSON.stringify(nostrEvent))

//   const headers = {
//     accept: "application/json",
//     authorization: `Nostr ${encodedEvent}`,
//   }

//   return new Promise((resolve, reject) => {
//     const xhr = new XMLHttpRequest()
//     xhr.open("POST", url)
//     Object.entries(headers).forEach(([key, value]) => {
//       xhr.setRequestHeader(key, value)
//     })

//     xhr.upload.onprogress = (event) => {
//       if (event.lengthComputable && onProgress) {
//         const percentComplete = (event.loaded / event.total) * 100
//         onProgress(percentComplete)
//       }
//     }

//     xhr.onload = () => {
//       if (xhr.status >= 200 && xhr.status < 300) {
//         try {
//           const data = JSON.parse(xhr.responseText)
//           const nip94Event = data.nip94_event
//           const urlTag = nip94Event.tags.find((tag: string[]) => tag[0] === "url")
//           if (urlTag && urlTag[1]) {
//             resolve(urlTag[1])
//           } else {
//             reject(new Error(`URL not found in response from ${url}`))
//           }
//         } catch (error) {
//           const errorMessage = error instanceof Error ? error.message : String(error)
//           reject(new Error(`Failed to parse response from ${url}: ${errorMessage}`))
//         }
//       } else {
//         reject(new Error(`No url received from ${url}`))
//       }
//     }

//     xhr.onerror = () => reject(new Error(`Upload to ${url} failed`))
//     xhr.send(fd)
//   })
// }
