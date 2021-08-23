import * as React from "react";
import { Provider, Flex, Text, Button, Header, MicrosoftStreamIcon } from "@fluentui/react-northstar";
import { useState, useEffect } from "react";
import { useTeams } from "msteams-react-base-component";
import * as microsoftTeams from "@microsoft/teams-js";
import jwt_decode from "jwt-decode";
import Axios from "axios";
import { RecordingArea } from "./components/RecordingArea";
import { UserRecordedName } from "./components/UserRecordedName";

/**
 * Implementation of the Pronounce name content page
 */
export const PronounceNameTab = () => {

    const [{ inTeams, theme, context }] = useTeams();
    const [entityId, setEntityId] = useState<string | undefined>();
    const [meetingId, setMeetingId] = useState<string | undefined>();
    const [name, setName] = useState<string>();
    const [accesstoken, setAccesstoken] = useState<string>();
    const [error, setError] = useState<string>();
    const [recording, setRecording] = useState<boolean>(false);
    const [recordings, setRecordings] = useState([]);

    const [userBlobUrl, setUserBlobUrl] = useState<string>("");

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
                resources: [process.env.PRONOUNCENAME_APP_URI as string]
            });
        } else {
            setEntityId("Not in Microsoft Teams");
        }
    }, [inTeams]);

    useEffect(() => {
        if (context) {
            setEntityId(context.entityId);
            setMeetingId(context.meetingId);
        }
    }, [context]);

    const btnClicked = () => {
        setRecording(true);
    };

    const blobReceived = (blob: Blob, userID: string) => {
        setRecording(false);
        const url = URL.createObjectURL(blob);
        setUserBlobUrl(url);

        const formData = new FormData();
        formData.append("file", blob, `${userID}.webm`);
        formData.append("meetingID", meetingId!);
        formData.append("userID", userID!);
        formData.append("userName", name!);
        Axios.post(`https://${process.env.HOSTNAME}/api/upload`, formData,
        { headers: { "Authorization": `Bearer ${accesstoken}`, "content-type": "multipart/form-data" }});
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
                            return <UserRecordedName userName={recording.username} driveItemId={recording.id} accessToken={accesstoken} />;
                        })}

                        {!recording ? (<div>
                            <Button onClick={btnClicked}>Record name</Button>
                        </div>) : (<RecordingArea userID={context?.userObjectId} callback={blobReceived} />)}
                        {userBlobUrl !== "" && <UserRecordedName userName={context?.userPrincipalName} userUrl={userBlobUrl} />}
                    </div>
                </Flex.Item>
            </Flex>
        </Provider>
    );
};
