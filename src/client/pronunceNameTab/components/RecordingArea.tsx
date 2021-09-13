import * as React from "react";
import { Button, MicIcon } from "@fluentui/react-northstar";
import * as microsoftTeams from "@microsoft/teams-js";

export const RecordingArea = (props) => {
    const [recorder, setRecorder] = React.useState<MediaRecorder>();
    const [stream, setStream] = React.useState({
        access: false,
        error: ""
    });
    const [recording, setRecording] = React.useState({
        active: false,
        available: false
    });
    const chunks = React.useRef<any[]>([]);

    React.useEffect(() => {
      // if (props.clientType === "desktop") {
      //   let mediaInput: microsoftTeams.media.MediaInputs = {
      //     mediaType: microsoftTeams.media.MediaType.Audio,
      //     maxMediaCount: 1,
      //   };
      //   microsoftTeams.media.selectMedia(mediaInput, (error: microsoftTeams.SdkError, attachments: microsoftTeams.media.Media[]) => {
      //     if (error) {
      //       if (error.message) {
      //         console.log(" ErrorCode: " + error.errorCode + error.message);
      //       } else {
      //         console.log(" ErrorCode: " + error.errorCode);
      //       }
      //     }
      //     // If you want to directly use the audio file (for smaller file sizes (~4MB))
      //     if (attachments) {
      //       let audioResult = attachments[0];
      //     // var videoElement = document.createElement("video");
      //     // videoElement.setAttribute("src", ("data:" + y.mimeType + ";base64," + y.preview));
      //     //To use the audio file via get Media API for bigger audio file sizes greater than 4MB
      //       audioResult.getMedia((error: microsoftTeams.SdkError, blob: Blob) => {
      //         if (blob) {
      //           if (blob.type.includes("video")) {
      //             //  videoElement.setAttribute("src", URL.createObjectURL(blob));
      //           }
      //         }
      //       });
      //     }
      //   });
      // }
    }, []);

    const recordData = () => {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((mic) => {
          let mediaRecorder: MediaRecorder;

          try {
            mediaRecorder = new MediaRecorder(mic, {
              mimeType: "audio/webm"
            });
            const track = mediaRecorder.stream.getTracks()[0];
            track.onended = () => console.log("ended");

            mediaRecorder.onstart = () => {
              setRecording({
                active: true,
                available: false
              });
            };

            mediaRecorder.ondataavailable = (e) => {
              console.log("data available");
              chunks.current.push(e.data);
            };

            mediaRecorder.onstop = async () => {
              setRecording({
                active: false,
                available: true
              });
              mediaRecorder.stream.getTracks()[0].stop();
              props.callback(chunks.current[0], props.userID);
              chunks.current = [];
            };
            setStream({
              ...stream,
              access: true
            });
            setRecorder(mediaRecorder);
            mediaRecorder.start();
          } catch (err) {
            console.log(err);
            setStream({ ...stream, error: err.message });
          }
        })
        .catch((error) => {
          console.log(error);
          setStream({ ...stream, error: error.message });
        });
    };
    return (
        <div>
          <h2>Record your name</h2>
          <div>
          <p className={recording.active ? "recordDiv" : ""}>
              <Button icon={<MicIcon />} circular primary={recording.active} iconOnly title="Record your name" onMouseDown={() => recordData()} onMouseUp={() => recorder!.stop()} />
          </p>
          </div>
          {stream.error !== "" && <p>`No microphone ${stream.error}`</p>}
        </div>
    );
};
