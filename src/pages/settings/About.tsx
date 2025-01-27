function About() {
  return (
    <section className="flex justify-center gap-10 mx-4 my-4 lg:my-8 lg:mx-8">
      <div className="flex flex-1">
        <div className="prose max-w-prose">
          <h1 className="text-2xl font-bold mb-4">About Etch.Social</h1>

          <p className="mb-4">
            Welcome to Etch.Social, a platform envisioned by the founders of Ownerfy Inc.
            as a <strong>digital archive</strong> that stands the test of time. Our
            mission is to provide a space where people can share their thoughts, stories,
            and media in a way that endures—preserving human history and culture for
            future generations.
          </p>

          <h2 className="text-xl font-semibold mb-2">
            A Place for Trust and Accountability
          </h2>
          <p className="mb-4">
            In an era where <strong>artificial intelligence</strong> can fabricate entire
            narratives at scale, it has become increasingly difficult to verify
            authenticity. At Etch.Social, we require{" "}
            <strong>cryptographic signatures</strong> for posts and media, fostering an
            environment of <strong>trust</strong> and
            <strong>accountability</strong>. By using a blockchain for storage, we create
            a<strong>chronological history</strong> of all content, making it easier for
            our community to <strong>identify fakes</strong> and verify genuine content.
          </p>

          <h2 className="text-xl font-semibold mb-2">Rewards for Quality Content</h2>
          <p className="mb-4">
            We believe that <strong>content creators</strong> should be rewarded for the
            time and effort they invest. Blockchain technology unlocks a variety of
            <strong>direct financial rewards</strong> and innovative monetization models,
            empowering you to earn for producing meaningful posts and high-quality media.
            Our platform aims to <strong>incentivize and celebrate</strong> genuine
            contributions that enrich the community.
          </p>

          <h2 className="text-xl font-semibold mb-2">Built on ERC-7847</h2>
          <p className="mb-4">
            Etch.Social is built on top of the
            <a
              href="https://ethereum-magicians.org/t/erc-7847-social-media-nfts/22280"
              className="text-blue-400 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              ERC-7847
            </a>
            proposal, which <strong>standardizes</strong> how social media content can be
            recorded on a blockchain. By adhering to this specification, we lay the
            groundwork for a <strong>truly interoperable</strong> ecosystem—opening the
            door for other applications to <strong>easily integrate</strong> and
            collaborate in this future of on-chain social media.
          </p>

          <h2 className="text-xl font-semibold mb-2">Freedom Through Technology</h2>
          <p className="mb-4">
            While we may selectively decide what is visible on Etch.Social to maintain
            community standards, the <strong>underlying technology</strong> allows users
            to communicate in new ways <strong>free from tyranny</strong>. Our hope is to
            provide a <strong>sustainable, censorship-resistant</strong> layer that
            ensures your voice can be preserved in a transparent and accountable way.
          </p>

          <p className="mb-4">
            <strong>Etch.Social</strong> is an endeavor of <strong>Ownerfy Inc.</strong>
          </p>

          <p className="mb-4">
            For support or inquiries, please email us at
            <a
              href="mailto:support@ownerfy.com"
              className="text-blue-400 hover:underline"
            >
              support@ownerfy.com
            </a>
            .
          </p>

          <p className="font-semibold">
            Thank you for joining us on this journey—together, we can build a more
            enduring and trustworthy digital future.
          </p>
          <p>
            <a href={CONFIG.repository}>Source code</a>
          </p>
        </div>
      </div>
    </section>
  )
}

export default About
