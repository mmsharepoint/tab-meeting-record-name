import * as React from "react";
import { Provider, Flex, Header, Input } from "@fluentui/react-northstar";
import { useState, useEffect } from "react";
import { useTeams } from "msteams-react-base-component";
import * as microsoftTeams from "@microsoft/teams-js";

/**
 * Implementation of Pronounce name configuration page
 */
export const PronounceNameTabConfig = () => {
    const [{ inTeams, theme, context }] = useTeams({});
    const [siteID, setSiteID] = useState<string>("");

    useEffect(() => {
        if (context) {
            microsoftTeams.settings.registerOnSaveHandler((saveEvent: microsoftTeams.settings.SaveEvent) => {
                const host = "https://" + window.location.host;
                microsoftTeams.settings.setSettings({
                    contentUrl: host + "/pronounceNameTab/?name={loginHint}&tenant={tid}&group={groupId}&theme={theme}",
                    websiteUrl: host + "/pronounceNameTab/?name={loginHint}&tenant={tid}&group={groupId}&theme={theme}",
                    suggestedDisplayName: "Pronunce name",
                    removeUrl: host + "/pronounceNameTab/remove.html?theme={theme}"
                });
                saveEvent.notifySuccess();
            });

            microsoftTeams.settings.setValidityState(true);
            microsoftTeams.appInitialization.notifySuccess();
        }
    }, [context]);

    return (
        <Provider theme={theme}>
            <Flex fill={true}>
                <Flex.Item>
                    <div>
                        <Header content="Configure your tab" />
                        <Input
                            placeholder="Enter a value here"
                            label="Site ID"
                            fluid
                            clearable
                            value={siteID}
                            onChange={(e, data) => {
                                if (data) {
                                    setSiteID(data.value);
                                }
                            }}
                            required />
                    </div>
                </Flex.Item>
            </Flex>
        </Provider>
    );
};
