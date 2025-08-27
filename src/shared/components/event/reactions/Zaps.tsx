import {parseZapReceipt, groupZapsByUser, type ZapInfo} from "@/utils/nostr.ts"
import {UserRow} from "@/shared/components/user/UserRow.tsx"
import {ReactionContent} from "./ReactionContent"
import {NDKEvent} from "@nostr-dev-kit/ndk"
import {useEffect, useState} from "react"
import {ndk} from "@/utils/ndk"
import {KIND_ZAP_RECEIPT} from "@/utils/constants"

export default function Zaps({event}: {event: NDKEvent}) {
  const [zapsByUser, setZapsByUser] = useState(
    new Map<string, {totalAmount: number; zaps: ZapInfo[]}>()
  )

  useEffect(() => {
    try {
      // Clear previous state when event changes
      setZapsByUser(new Map())

      const filter = {
        kinds: [KIND_ZAP_RECEIPT],
        ["#e"]: [event.id],
      }
      const sub = ndk().subscribe(filter)
      const allZaps: ZapInfo[] = []

      sub?.on("event", async (zapEvent: NDKEvent) => {
        const zapInfo = parseZapReceipt(zapEvent)
        if (zapInfo) {
          // Check for duplicates
          if (!allZaps.some((z) => z.id === zapInfo.id)) {
            allZaps.push(zapInfo)
            const grouped = groupZapsByUser(allZaps)
            setZapsByUser(grouped)
          }
        }
      })
      return () => {
        sub.stop()
      }
    } catch (error) {
      console.warn(error)
    }
  }, [event.id])

  return (
    <div className="flex flex-col gap-4">
      {zapsByUser.size === 0 && <p>No zaps yet</p>}
      {Array.from(zapsByUser.entries())
        .sort(([, a], [, b]) => b.totalAmount - a.totalAmount)
        .map(([pubKey, data]) => {
          // Get the latest comment from the user's zaps
          const latestComment = data.zaps[data.zaps.length - 1]?.comment || ""
          return (
            <UserRow
              showHoverCard={true}
              key={pubKey}
              pubKey={pubKey}
              description={
                <>
                  <ReactionContent content={latestComment} event={event} />{" "}
                  {String(data.totalAmount)}
                </>
              }
            />
          )
        })}
    </div>
  )
}
