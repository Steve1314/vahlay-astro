import React from "react";

const JitsiIframe= ({ roomName }) => {
  const jitsiUrl = `https://meet.jit.si/${roomName}#config.startWithAudioMuted=true&config.startWithVideoMuted=true`;

  return (
    <iframe
      allow="camera; microphone; fullscreen; display-capture"
      src={jitsiUrl}
      style={{ width: "100%", height: "1000px", border: "0" }}
      title="Jitsi Meet"
    ></iframe>
  );
};

export default JitsiIframe;
