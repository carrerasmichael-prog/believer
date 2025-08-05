import {CLOUDFLARE_CSAM_FLAGGED} from "@/utils/cloudflare_banned_users"
import {hexToBytes, bytesToHex} from "@noble/hashes/utils"
import {useParams, Link} from "@/navigation"
import {sha256} from "@noble/hashes/sha256"
import {useEffect, useState, useMemo} from "react"
import {nip05, nip19} from "nostr-tools"
import {Page404} from "@/pages/Page404"
import ThreadPage from "@/pages/thread"
import ProfilePage from "@/pages/user"

const CLOUDFLARE_CSAM_EXPLANATION_NOTE =
  "note1pu5kvxwfzytxsw6vkqd4eu6e0xr8znaur6sl38r4swl3klgsn6dqzlpnsl"
const CLOUDFLARE_CSAM_MESSAGE = "Flagged as CSAM by Cloudflare. See explanation at"

export default function NostrLinkHandler() {
  const {link} = useParams()
  const [error, setError] = useState<string>()
  const [asyncPubkey, setAsyncPubkey] = useState<string>()

  // Memoize link parsing to prevent recalculation
  const linkData = useMemo(() => {
    const isProfile = link?.startsWith("npub") || link?.startsWith("nprofile")
    const isNote = link?.startsWith("note") || link?.startsWith("nevent")
    const isAddress = link?.startsWith("naddr")

    let pubkey: string | undefined
    let naddrData: {pubkey: string; kind: number; identifier: string} | undefined
    let needsAsyncResolution = false

    try {
      if (link) {
        if (isProfile) {
          const decoded = nip19.decode(link)
          if (
            typeof decoded.data === "object" &&
            decoded.data !== null &&
            "pubkey" in decoded.data
          ) {
            pubkey = decoded.data.pubkey
          } else if (typeof decoded.data === "string" && decoded.data.length === 64) {
            pubkey = decoded.data
          }
        } else if (isAddress) {
          const decoded = nip19.decode(link)
          naddrData = decoded.data as {pubkey: string; kind: number; identifier: string}
        } else if (!isNote && !isProfile && !isAddress) {
          // Username/nip05 - needs async resolution
          needsAsyncResolution = true
        }
      }
    } catch (err) {
      console.error("Decode error:", err)
    }

    return {isProfile, isNote, isAddress, pubkey, naddrData, needsAsyncResolution}
  }, [link])

  const [loading, setLoading] = useState(linkData.needsAsyncResolution)

  useEffect(() => {
    if (!linkData.needsAsyncResolution || !link) return

    setError(undefined)

    const resolveLink = async () => {
      try {
        // Try exact match first
        let resolved = await nip05.queryProfile(link)

        // If not found and doesn't include @iris.to, try with @iris.to
        if (!resolved && !link.includes("@iris.to")) {
          const withIris = `${link}@iris.to`
          resolved = await nip05.queryProfile(withIris)
        }

        if (resolved) {
          setAsyncPubkey(resolved.pubkey)
        }
      } catch (err) {
        console.error("Resolution error:", err)
      } finally {
        setLoading(false)
      }
    }

    resolveLink()
  }, [link, linkData.needsAsyncResolution])

  // Use either sync or async pubkey
  const finalPubkey = linkData.pubkey || asyncPubkey

  useEffect(() => {
    if (finalPubkey && (linkData.isProfile || !linkData.isNote)) {
      const hash = bytesToHex(sha256(hexToBytes(finalPubkey)))
      if (CLOUDFLARE_CSAM_FLAGGED.includes(hash)) {
        setError(`${CLOUDFLARE_CSAM_MESSAGE} /${CLOUDFLARE_CSAM_EXPLANATION_NOTE}`)
      }
    }
  }, [finalPubkey, linkData.isProfile, linkData.isNote])

  // Memoize content to prevent re-renders
  const content = useMemo(() => {
    // If link is not yet available, show loading
    if (!link) {
      return (
        <div className="flex justify-center items-center">
          <div className="loading loading-spinner loading-lg" />
        </div>
      )
    }

    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <div className="loading loading-spinner loading-lg" />
        </div>
      )
    }

    if (error) {
      return (
        <section className="hero min-h-screen bg-base-200">
          <div className="hero-content text-center">
            <div className="max-w-md">
              <h1 className="text-5xl font-bold text-primary mb-2">Error</h1>
              <p className="text-xl mb-8">
                {CLOUDFLARE_CSAM_MESSAGE}{" "}
                <Link
                  to={`/${CLOUDFLARE_CSAM_EXPLANATION_NOTE}`}
                  className="link link-primary"
                >
                  {CLOUDFLARE_CSAM_EXPLANATION_NOTE}
                </Link>
              </p>
              <button
                onClick={() => (window.location.href = "/")}
                className="btn btn-primary btn-lg"
              >
                Go back to homepage
              </button>
            </div>
          </div>
        </section>
      )
    }

    if (linkData.isProfile && finalPubkey) {
      return <ProfilePage pubKey={finalPubkey} />
    }

    if (linkData.isNote) {
      return <ThreadPage id={link!} />
    }

    if (linkData.isAddress && linkData.naddrData) {
      return <ThreadPage id={link!} isNaddr={true} naddrData={linkData.naddrData} />
    }

    if (!linkData.isNote && !linkData.isProfile && !linkData.isAddress && finalPubkey) {
      // Username resolved to pubkey
      return <ProfilePage pubKey={finalPubkey} />
    }

    if (linkData.isProfile && !finalPubkey) {
      // Invalid npub/nprofile - show error instead of 404
      return (
        <section className="hero min-h-screen bg-base-200">
          <div className="hero-content text-center">
            <div className="max-w-md">
              <h1 className="text-5xl font-bold text-primary mb-2">
                Invalid Profile Link
              </h1>
              <p className="text-xl mb-8">The profile link appears to be invalid.</p>
              <button
                onClick={() => (window.location.href = "/")}
                className="btn btn-primary btn-lg"
              >
                Go back to homepage
              </button>
            </div>
          </div>
        </section>
      )
    }

    return <Page404 />
  }, [link, loading, error, linkData, finalPubkey])

  // Keep the same root structure to prevent remounting
  return <div className="min-h-screen">{content}</div>
}
