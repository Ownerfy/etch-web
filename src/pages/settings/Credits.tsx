import {
  getCreditPlans,
  createStripeCheckoutSessionForBuyCredits,
  fetchUserCredits,
} from "../../shared/services/BackendServices"
import {useEffect, useState, useCallback} from "react"
import {auth} from "@/shared/services/firebase"
type CreditPlan = {
  id: string
  name: string
  price: number
  nftCredits: number
  message: string
}

function Credits() {
  const [creditPlans, setCreditPlans] = useState<CreditPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [userCredits, setUserCredits] = useState(0)
  // Check for success parameter on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("success") === "true") {
      setShowSuccessModal(true)
      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname)
    }
  }, [])

  useEffect(() => {
    // Check auth state and fetch credits if user is logged in
    const checkAuthAndFetchCredits = async () => {
      if (auth.currentUser) {
        await getUserCredits()
      }
    }

    // Initial check
    checkAuthAndFetchCredits()

    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        getUserCredits()
      }
    })

    // Fetch credits when page is focused (for navigation)
    const handleFocus = () => {
      if (auth.currentUser) {
        getUserCredits()
      }
    }
    window.addEventListener("focus", handleFocus)

    // Cleanup
    return () => {
      unsubscribe()
      window.removeEventListener("focus", handleFocus)
    }
  }, [])

  const getUserCredits = async () => {
    try {
      const response = await fetchUserCredits()
      const {nftCredits = 0} = response || {}
      setUserCredits(nftCredits)
    } catch (error) {
      console.error("Failed to fetch user credits:", error)
      setUserCredits(0)
    }
  }

  useEffect(() => {
    const fetchCreditPlans = async () => {
      try {
        const plans = await getCreditPlans()
        setCreditPlans(plans)
      } catch (error) {
        console.error("Failed to fetch credit plans:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCreditPlans()
  }, [])

  const handleBuyCredit = useCallback(async (item: CreditPlan) => {
    try {
      setIsLoading(true)
      // eslint-disable-next-line no-undef
      const stripe = Stripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
      const stripeCheckoutSessionId = await createStripeCheckoutSessionForBuyCredits({
        creditPlanId: item.id,
        cancelUrl: window.location.href,
        successUrl: `${window.location.origin}${window.location.pathname}?success=true`,
      })

      const result = await stripe.redirectToCheckout({
        sessionId: stripeCheckoutSessionId,
      })
      if (result.error) alert(result.error.message)
      setIsLoading(false)
    } catch (error) {
      console.log("error: ", error)
      setIsLoading(false)
    }
  }, [])

  return (
    <section className="flex justify-center gap-10 mx-4 my-4 lg:my-8 lg:mx-8">
      {showSuccessModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Purchase Successful!</h3>
            <p className="py-4">Your NFT credits have been added to your account.</p>
            <div className="modal-action">
              <button className="btn" onClick={() => setShowSuccessModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-1">
        <div className="prose max-w-prose">
          <h1 className="text-2xl font-bold mb-4">Credits</h1>
          {userCredits > 0 && (
            <p className="text-sm opacity-75">
              You have {userCredits} Blockchain credits.
            </p>
          )}
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="loading loading-spinner loading-lg"></div>
              <span className="ml-2">Loading...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {creditPlans.map((item, index) => (
                <div
                  key={index}
                  className="card bg-neutral text-neutral-content shadow-xl"
                >
                  <div className="card-body items-center text-center">
                    <h3 className="card-title">{item.name} credits</h3>
                    <p className="text-2xl font-bold">${item.price}</p>
                    <p className="text-sm opacity-75">{item.message}</p>
                    <div className="card-actions mt-4">
                      <button
                        onClick={() => handleBuyCredit(item)}
                        className="btn btn-primary"
                        disabled={isLoading}
                      >
                        Buy
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default Credits
