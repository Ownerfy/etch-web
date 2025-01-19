export const PrivacyPolicy = () => {
  return (
    <section className="flex justify-center gap-10 mx-4 my-4 lg:my-8 lg:mx-8">
      <div className="flex flex-1">
        <div className="prose max-w-prose">
          <h1>About</h1>
          <p>{CONFIG.aboutText}</p>
          <p>
            <a href={CONFIG.repository}>Source code</a>
          </p>
        </div>
      </div>
    </section>
  )
}
