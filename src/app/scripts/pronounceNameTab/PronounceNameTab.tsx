import * as React from "react";
import { Provider, Flex, Text, Button, Header, MicrosoftStreamIcon } from "@fluentui/react-northstar";
import { useState, useEffect } from "react";
import { useTeams } from "msteams-react-base-component";
import * as microsoftTeams from "@microsoft/teams-js";
import jwt_decode from "jwt-decode";
import Axios from "axios";
import { RecordingArea } from "./components/RecordingArea";
import { UserRecordedName } from "./components/UserRecordedName";
import { IRecording } from "../../../model/IRecording";

/**
 * Implementation of the Pronounce name content page
 */
export const PronounceNameTab = () => {

    const [{ inTeams, theme, context }] = useTeams();
    const [meetingId, setMeetingId] = useState<string | undefined>();
    const [name, setName] = useState<string>("");
    const [accesstoken, setAccesstoken] = useState<string>();
    const [error, setError] = useState<string>();
    const [recording, setRecording] = useState<boolean>(false);
    const [recordings, setRecordings] = useState<IRecording[]>([]);

    // const [userBlobUrl, setUserBlobUrl] = useState<string>("");

    useEffect(() => {
        if (inTeams === true) {

            microsoftTeams.authentication.getAuthToken({
                successCallback: (token: string) => {
                    const decoded: { [key: string]: any; } = jwt_decode(token) as { [key: string]: any; };
                    setName(decoded!.name);
                    setAccesstoken(token);
                    getRecordings(token);
                    microsoftTeams.appInitialization.notifySuccess();
                },
                failureCallback: (message: string) => {
                    setError(message);
                    microsoftTeams.appInitialization.notifyFailure({
                        reason: microsoftTeams.appInitialization.FailedReason.AuthFailed,
                        message
                    });
                },
                resources: [`api://${process.env.HOSTNAME}/${process.env.PRONOUNCENAME_APP_ID}`]
            });
        }
    }, [inTeams]);

    useEffect(() => {
        if (context) {
            setMeetingId(context.meetingId);
        }
    }, [context]);

    const btnClicked = () => {
        setRecording(true);
    };

    const blobReceived = (blob: Blob, userID: string) => {
        setRecording(false);
        const formData = new FormData();
        formData.append("file", blob, `${userID}_${meetingId}.webm`);
        formData.append("meetingID", meetingId!);
        formData.append("userID", userID!);
        formData.append("userName", name!);
        Axios.post(`https://${process.env.HOSTNAME}/api/upload`, formData,
        { headers: { "Authorization": `Bearer ${accesstoken}`, "content-type": "multipart/form-data" }})
            .then(r => {
                getRecordings(accesstoken!);
            });
    };

    const getRecordings = async (token: string) => {
        const response = await Axios.get(`https://${process.env.HOSTNAME}/api/files/${context?.meetingId}`,
        { headers: { Authorization: `Bearer ${token}` }});

        console.log(response);
        setRecordings(response.data);
    };

    /**
     * The render() method to create the UI of the tab
     */
    return (
        <Provider theme={theme}>
            <Flex fill={true} column styles={{
                padding: ".8rem 0 .8rem .5rem"
            }}>
                <Flex.Item>
                    <Header content="User name recordings" />
                </Flex.Item>
                <Flex.Item>
                    <div>
                        {recordings.length > 0 && recordings.map((recording: any) => {
                            return <UserRecordedName key={recording.id} userName={recording.username} driveItemId={recording.id} accessToken={accesstoken} dataUrl={recording.dataUrl} />;
                        })}

                        {!recording ? (<div>
                            <Button onClick={btnClicked}>Record name</Button>
                        </div>) : (<RecordingArea userID={context?.userObjectId} clientType={context?.hostClientType} callback={blobReceived} />)}
                    </div>
                </Flex.Item>
            </Flex>
        </Provider>
    );
};
