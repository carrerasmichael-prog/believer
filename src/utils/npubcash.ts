import NDK, { NDKEvent, NDKRelaySet } from '@nostr-dev-kit/ndk';
import { useUserStore } from '@/stores/user';

export class SimpleNWCWallet {
  private ndk: NDK;
  private connectionId: string;
  private relayUrls: string[];
  private pubkey: string;

  constructor(params: {
    ndk: NDK;
    connectionId: string;
    relayUrls: string[];
    pubkey: string;
  }) {
    this.ndk = params.ndk;
    this.connectionId = params.connectionId;
    this.relayUrls = params.relayUrls;
    this.pubkey = params.pubkey;
  }

  async connect(): Promise<void> {
    console.log('🔌 Connecting NWC:', this.connectionId);
    const relaySet = NDKRelaySet.fromRelayUrls(this.relayUrls, this.ndk);
    await this.ndk.connect().catch((e: unknown) => console.error('NWC connect error:', e));
    console.log('🔗 NWC: Connected to relays', this.relayUrls);

    const sub = this.ndk.subscribe(
      {
        kinds: [23195], // NIP-47 response kind
        authors: [this.pubkey],
        '#p': [useUserStore.getState().publicKey],
      },
      { subId: `nwc-response-${this.connectionId}` },
      relaySet
    );

    sub.on('event', (event: NDKEvent) => {
      console.log('🔍 NWC: Received response', event);
    });

    sub.on('eose', () => {
      console.log('🔍 NWC: All relays have reached the end of the event stream');
    });
  }
}

export async function initializeNWC(params: { connectionId: string; relayUrls: string[] }) {
  const { connectionId, relayUrls } = params;
  const ndkInstance = new NDK({
    explicitRelayUrls: relayUrls,
  });
  const pubkey = useUserStore.getState().publicKey;

  if (!pubkey) {
    console.error('🔍 NWC: No public key available');
    return false;
  }

  const wallet = new SimpleNWCWallet({
    ndk: ndkInstance,
    connectionId,
    relayUrls,
    pubkey,
  });

  try {
    await wallet.connect();
    console.log('✅ NWC connection successful!');
    return true;
  } catch (error) {
    console.error('🔍 NWC connection failed:', error);
    return false;
  }
}
