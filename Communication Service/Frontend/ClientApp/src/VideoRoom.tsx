import React, { useEffect, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";
import SimplePeer from "simple-peer";
import "./VideoRoom.css"; 

const Video = ({ peer }: { peer: SimplePeer.Instance }) => {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    peer.on("stream", (stream) => {
      if (ref.current) ref.current.srcObject = stream;
    });
  }, [peer]);
  return <video playsInline autoPlay ref={ref} className="video-element peer-video" />;
};

interface Props {
  connection: signalR.HubConnection | null;
  currentUser: string;
  roomId: string;
  isTabActive: boolean;
}

const VideoRoom: React.FC<Props> = ({ connection, currentUser, roomId, isTabActive }) => {
  const [peers, setPeers] = useState<any[]>([]);
  const userVideo = useRef<HTMLVideoElement>(null);
  const peersRef = useRef<any[]>([]);
  const userStream = useRef<MediaStream | null>(null);

  const [isCamOn, setIsCamOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false); // Trạng thái share màn hình
  const [isEnded, setIsEnded] = useState(false);

  useEffect(() => {
    if (!isTabActive || isEnded) return;

    let localStream: MediaStream | null = null;

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      localStream = stream;
      userStream.current = stream;
      if (userVideo.current) userVideo.current.srcObject = stream;

      if (!connection) return;

      connection.on("AllUsers", (users: string[]) => {
        const peersArr: any[] = [];
        users.forEach((userID) => {
          if (userID === connection.connectionId) return;
          const peer = createPeer(userID, stream);
          peersRef.current.push({ peerID: userID, peer });
          peersArr.push({ peerID: userID, peer });
        });
        setPeers(peersArr);
      });

      connection.on("UserJoinedSignal", (callerID: string, signal: string) => {
        const peer = addPeer(signal, callerID, stream);
        peersRef.current.push({ peerID: callerID, peer });
        setPeers((users) => [...users, { peerID: callerID, peer }]);
      });

      connection.on("ReceivingReturnedSignal", (id: string, signal: string) => {
        const item = peersRef.current.find((p) => p.peerID === id);
        if (item) item.peer.signal(signal);
      });

      connection.on("UserLeft", (id: string) => {
         const peerObj = peersRef.current.find(p => p.peerID === id);
         if(peerObj) peerObj.peer.destroy();
         const newPeers = peersRef.current.filter(p => p.peerID !== id);
         peersRef.current = newPeers;
         setPeers(newPeers);
      });
    });

    return () => {
        if (localStream) localStream.getTracks().forEach(track => track.stop());
        connection?.off("AllUsers");
        connection?.off("UserJoinedSignal");
        connection?.off("ReceivingReturnedSignal");
        connection?.off("UserLeft");
        peersRef.current.forEach(p => p.peer.destroy());
        setPeers([]);
    }
  }, [connection, roomId, isEnded, isTabActive]);

  function createPeer(userToSignal: string, stream: MediaStream) {
    const peer = new SimplePeer({ initiator: true, trickle: false, stream });
    peer.on("signal", (signal) => {
        connection?.invoke("SendSignal", userToSignal, JSON.stringify(signal));
    });
    return peer;
  }

  function addPeer(incomingSignal: string, callerID: string, stream: MediaStream) {
    const peer = new SimplePeer({ initiator: false, trickle: false, stream });
    peer.on("signal", (signal) => {
      connection?.invoke("ReturnSignal", callerID, JSON.stringify(signal));
    });
    peer.signal(incomingSignal);
    return peer;
  }

  // --- CHỨC NĂNG CHIA SẺ MÀN HÌNH MỚI ---
  const shareScreen = () => {
    if (isScreenSharing) {
        // Tắt share -> Quay lại camera
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
            replaceStream(stream);
            setIsScreenSharing(false);
            setIsCamOn(true);
        });
    } else {
        // Bật share
        // @ts-ignore
        navigator.mediaDevices.getDisplayMedia({ cursor: true }).then((screenStream) => {
            replaceStream(screenStream);
            setIsScreenSharing(true);
            
            // Tự động tắt share khi người dùng bấm "Stop sharing" của trình duyệt
            screenStream.getVideoTracks()[0].onended = () => {
                 navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((camStream) => {
                    replaceStream(camStream);
                    setIsScreenSharing(false);
                 });
            };
        });
    }
  };

  const replaceStream = (newStream: MediaStream) => {
      // 1. Thay đổi video của chính mình
      userStream.current = newStream;
      if (userVideo.current) userVideo.current.srcObject = newStream;

      // 2. Gửi luồng mới cho tất cả người khác
      const videoTrack = newStream.getVideoTracks()[0];
      peersRef.current.forEach(({ peer }) => {
          const oldTrack = peer.streams[0].getVideoTracks()[0];
          if(oldTrack) peer.replaceTrack(oldTrack, videoTrack, peer.streams[0]);
      });
  }
  // ----------------------------------------

  const toggleCam = () => {
    const stream = userStream.current;
    if (stream && !isScreenSharing) { // Không tắt cam khi đang share màn hình
        let newState = !isCamOn;
        stream.getVideoTracks().forEach(track => track.enabled = newState);
        setIsCamOn(newState);
    }
  };

  const toggleMic = () => {
    const stream = userStream.current;
    if (stream) {
        let newState = !isMicOn;
        stream.getAudioTracks().forEach(track => track.enabled = newState);
        setIsMicOn(newState);
    }
  };

  const leaveCall = () => setIsEnded(true);
  const rejoin = () => setIsEnded(false);

  if (isEnded) return <div className="video-room-container"><h2>📵 Cuộc gọi đã kết thúc</h2><button className="btn-rejoin" onClick={rejoin}>Tham gia lại</button></div>;

  return (
    <div className="video-room-container">
      <h3 className="video-room-title">🎥 Camera Nhóm ({peers.length + 1})</h3>
      <div className="video-grid">
        <div className="video-wrapper">
            <video muted ref={userVideo} autoPlay playsInline className="video-element my-video" />
            <div className="video-label">Tôi {isScreenSharing ? '(Màn hình)' : ''}</div>
        </div>
        {peers.map((peerObj) => (
            <div key={peerObj.peerID} className="video-wrapper">
                <Video peer={peerObj.peer} />
                <div className="video-label">User: {peerObj.peerID.substring(0,5)}...</div>
            </div>
        ))}
      </div>
      <div className="controls-bar">
          <button className={`btn-control ${isCamOn ? 'on' : 'off'}`} onClick={toggleCam} disabled={isScreenSharing}>{isCamOn ? "📷" : "🚫"}</button>
          <button className={`btn-control ${isMicOn ? 'on' : 'off'}`} onClick={toggleMic}>{isMicOn ? "🎤" : "🔇"}</button>
          
          {/* NÚT CHIA SẺ MÀN HÌNH */}
          <button className={`btn-control ${isScreenSharing ? 'active-share' : ''}`} onClick={shareScreen} title="Chia sẻ màn hình">
             {isScreenSharing ? "❌ Dừng Share" : "🖥️ Share Screen"}
          </button>

          <button className="btn-control hangup" onClick={leaveCall}>📞</button>
      </div>
    </div>
  );
};

export default VideoRoom;