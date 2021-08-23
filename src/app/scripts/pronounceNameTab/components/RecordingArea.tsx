import { Button, MicIcon } from "@fluentui/react-northstar";
import * as React from "react";

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
        navigator.mediaDevices
          .getUserMedia({ audio: true })
          .then((mic) => {
            let mediaRecorder;

            try {
              mediaRecorder = new MediaRecorder(mic, {
                mimeType: "audio/webm"
              });
            } catch (err) {
              console.log(err);
            }

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
                console.log("stopped");
                props.callback(chunks.current[0], props.userID);
                chunks.current = [];

                setRecording({
                    active: false,
                    available: true
                });
                mediaRecorder.stream.getTracks()[0].stop();
            };

            setStream({
              ...stream,
              access: true
            });
            setRecorder(mediaRecorder);
          })
          .catch((error) => {
            console.log(error);
            setStream({ ...stream, error });
          });
    }, []);

    return (
        <div id="profile-div">
            <h2>Record your name</h2>
            {stream.access ? (
            <div>
            <p className={recording.active ? "recordDiv" : ""}>
                <Button icon={<MicIcon />} circular primary={recording.active} iconOnly title="Record your name" onMouseDown={() => !recording.active && recorder!.start()} onMouseUp={() => recorder!.stop()} />
            </p>
            </div>) : null}
        </div>
    );
};
