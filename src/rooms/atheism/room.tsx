import {useEffect, useState} from "react"
import {ndk} from "@/utils/ndk"
import {roomconfig} from "./roomconfig"

const Room = () => {
  const [posts, setPosts] = useState<any[]>([])

  useEffect(() => {
    const subscription = ndk().subscribe(
      {
        kinds: [1], // Text notes
        "#t": roomconfig.tags, // ['atheist', 'atheism', 'apatheistic', 'agnostic', 'secularism']
      },
      {
        relayUrls: roomconfig.relayurl ? [roomconfig.relayurl] : undefined,
      }
    )
    subscription.on("event", (event: any) => {
      setPosts((prev) => [...prev, event])
    })
    return () => subscription.stop()
  }, [])

  return (
    <div className="room-container">
      <h1>{roomconfig.name}</h1>
      <div className="feed">
        {posts.length ? (
          posts.map((post) => (
            <div key={post.id} className="post">
              <p>{post.content}</p>
              <small>By: {post.pubkey.slice(0, 8)}</small>
            </div>
          ))
        ) : (
          <p>No posts yet.</p>
        )}
      </div>
    </div>
  )
}

export default Room
