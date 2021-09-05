import Axios from "axios";
import * as React from "react";
import { CustomAudio } from "./CustomAudio";

export const UserRecordedName = (props) => {
    const [audioUrl, setAudioUrl] = React.useState<string>("");

    React.useEffect(() => {
        if (typeof props.dataUrl === "undefined" || props.dataUrl === null || props.dataUrl === "") {
            Axios.get(`https://${process.env.HOSTNAME}/api/audio/${props.driveItemId}`, {
                            responseType: "blob",
                            headers: {
                                Authorization: `Bearer ${props.accessToken}`
                            }
                        }).then(result => {
                            const r = new FileReader();
                            r.readAsDataURL(result.data);
                            r.onloadend = () => {
                                if (r.error) {
                                    alert(r.error);
                                } else {
                                    setAudioUrl(r.result as string);
                                }
                            };
                        });
        } else {
            setAudioUrl(props.dataUrl);
        }
    }, []);

    return (
        <div className="userRecording">
            <span>{props.userName}</span>
            {/* {audioUrl !== "" && <audio controls src={audioUrl}></audio>} */}
            {audioUrl !== "" && <CustomAudio audioUrl={audioUrl} />}
        </div>
    );
};
