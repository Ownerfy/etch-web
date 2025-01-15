import {NDKUserProfile} from "@nostr-dev-kit/ndk"
import {useNavigate} from "react-router-dom"
import {Avatar} from "@mui/material"

import defaultProfilePic from "@/assets/default_profile_pic.jpg"

interface ProfileAvatarProps {
  profile: NDKUserProfile | null | undefined
  pubkey: string
}

function ProfileAvatar({profile, pubkey}: ProfileAvatarProps) {
  const navigate = useNavigate()

  const handleUserNameClick = () => {
    navigate(`/${pubkey}`)
  }

  // ndk's fetchProfile returns a profile with .image
  // but kind 0 events have profiles with .picture
  let image = profile?.image
  if (!image && typeof profile?.picture === "string") image = profile?.picture

  return (
    <Avatar
      className="ProfileAvatar cursor-pointer"
      src={image ? image : defaultProfilePic}
      onClick={handleUserNameClick}
    ></Avatar>
  )
}

export default ProfileAvatar
