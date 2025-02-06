declare const Stripe: (key: string) => {
  redirectToCheckout: (options: {
    sessionId: string
  }) => Promise<{error?: {message: string}}>
}
