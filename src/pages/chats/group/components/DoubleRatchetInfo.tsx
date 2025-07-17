const DoubleRatchetInfo = () => (
  <>
    <p className="text-center text-sm text-base-content/70">
      Iris uses Signal-style{" "}
      <a
        href="https://github.com/mmalmi/nostr-double-ratchet"
        target="_blank"
        className="link"
        rel="noreferrer"
      >
        double ratchet encryption
      </a>{" "}
      to keep your private messages safe.
    </p>
    <p className="text-center text-sm text-base-content/70">
      Private chat history is stored locally on this device and cleared when you log out.
    </p>
  </>
)

export default DoubleRatchetInfo
