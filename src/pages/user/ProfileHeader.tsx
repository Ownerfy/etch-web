import {useLocalState} from "irisdb-hooks"
import {useMemo, useState} from "react"
import {PublicKey} from "irisdb-nostr"
import {Link} from "react-router-dom"

import PublicKeyQRCodeButton from "@/shared/components/user/PublicKeyQRCodeButton"
import {FollowButton} from "@/shared/components/button/FollowButton.tsx"
import ProfileDetails from "@/pages/user/components/ProfileDetails.tsx"
import FollowerCount from "@/pages/user/components/FollowerCount.tsx"
import FollowsCount from "@/pages/user/components/FollowsCount.tsx"
import {PROFILE_AVATAR_WIDTH} from "@/shared/components/user/const"
import MiddleHeader from "@/shared/components/header/MiddleHeader"
import FollowedBy from "@/shared/components/user/FollowedBy"
import {Avatar} from "@/shared/components/user/Avatar.tsx"
import ProxyImg from "@/shared/components/ProxyImg.tsx"
import {Name} from "@/shared/components/user/Name.tsx"
import useProfile from "@/shared/hooks/useProfile.ts"
import Modal from "@/shared/components/ui/Modal.tsx"
// import socialGraph from "@/utils/socialGraph.ts"
import {Helmet} from "react-helmet"

const ProfileHeader = ({pubKey}: {pubKey: string}) => {
  const profile = useProfile(pubKey, true)
  const pubKeyHex = useMemo(
    () => (pubKey ? new PublicKey(pubKey).toString() : ""),
    [pubKey]
  )
  const [myPubKey] = useLocalState("user/publicKey", "", String)
  const [showProfilePhotoModal, setShowProfilePhotoModal] = useState(false)
  const [showBannerModal, setShowBannerModal] = useState(false)

  // useEffect(() => {
  //   const followDistance = socialGraph().getFollowDistance(pubKeyHex)
  //   console.log("ProfileHeader followDistance:", followDistance)
  // }, [pubKeyHex])

  return (
    <>
      <MiddleHeader>
        <Name pubKey={pubKeyHex} />
      </MiddleHeader>
      <div className="flex flex-col gap-4 w-full break-all">
        <div className="w-full h-48 md:h-72 bg-gradient-to-r from-primary to-primary-dark">
          {profile?.banner && (
            <ProxyImg
              src={profile?.banner}
              className="w-full h-48 md:h-72 object-cover cursor-pointer select-none"
              alt="Banner"
              onClick={() => setShowBannerModal(true)}
              hideBroken={true}
              width={655}
            />
          )}
        </div>
        {showBannerModal && (
          <Modal onClose={() => setShowBannerModal(false)} hasBackground={false}>
            <ProxyImg
              src={String(profile?.banner)}
              className="max-h-screen max-w-screen"
              alt="Banner"
            />
          </Modal>
        )}
        <div className="flex flex-col gap-4 px-4 -mt-16">
          <div className="flex flex-row items-end gap-8 mt-4 justify-between select-none">
            <span
              onClick={() => profile?.picture && setShowProfilePhotoModal(true)}
              className="cursor-pointer"
            >
              <Avatar pubKey={pubKey} showBadge={false} width={PROFILE_AVATAR_WIDTH} />
            </span>
            {showProfilePhotoModal && (
              <Modal
                onClose={() => setShowProfilePhotoModal(false)}
                hasBackground={false}
              >
                <ProxyImg
                  src={String(profile?.picture)}
                  className="max-h-screen max-w-screen"
                  alt="Profile"
                />
              </Modal>
            )}

            <div className="flex flex-row gap-2">
              <PublicKeyQRCodeButton publicKey={pubKey} />
              {myPubKey && myPubKey === pubKeyHex ? (
                <Link to="/settings/profile" className="btn btn-neutral">
                  Edit profile
                </Link>
              ) : (
                <FollowButton pubKey={pubKey} small={false} />
              )}
            </div>
          </div>
          <div className="text-2xl font-bold">
            <Name pubKey={pubKey} />
          </div>
          <ProfileDetails
            pubKey={pubKey}
            displayProfile={profile || undefined}
            externalIdentities={{github: ""}}
          />
        </div>
        <div className="flex flex-row gap-4 p-4 items-end flex-wrap">
          <FollowerCount pubKey={pubKeyHex} />
          <FollowsCount pubKey={pubKeyHex} />
        </div>
        {pubKeyHex !== myPubKey && (
          <div className="flex flex-row gap-4 px-4 mb-4 items-end flex-wrap">
            <FollowedBy pubkey={pubKeyHex} />
          </div>
        )}
        <Helmet>
          <title>
            {profile?.name ||
              profile?.display_name ||
              profile?.username ||
              profile?.nip05?.split("@")[0] ||
              "Profile"}{" "}
          </title>
        </Helmet>
      </div>
    </>
  )
}

export default ProfileHeader
