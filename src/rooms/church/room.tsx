import { useEffect, useState } from 'react';
import NDK, { NDKEvent } from '@nostr-dev-kit/ndk';
import { roomconfig } from './roomconfig'; // Fixed case

const Room = () => {
  const [posts, setPosts] = useState<NDKEvent[]>([]); // Type posts as NDKEvent[]

  useEffect(() => {
    const ndk = new NDK({
      explicitRelayUrls: roomconfig.relayurl ? [roomconfig.relayurl] : ['wss://relay.damus.io'], // Fallback relay
    });

    ndk.connect().catch((e: unknown) => console.error('NDK connect error:', e));

    const subscription = ndk.subscribe({
      kinds: [1], // Text notes
      '#t': roomconfig.tags, // ['christianity', 'church', 'jesus']
    });

    subscription.on('event', (event: NDKEvent) => {
      setPosts((prev) => [...prev, event]);
    });

    return () => subscription.stop();
  }, []);

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
  );
};

export default Room;
