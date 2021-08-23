import { PreventIframe } from "express-msteams-host";

/**
 * Used as place holder for the decorators
 */
@PreventIframe("/pronounceNameTab/index.html")
@PreventIframe("/pronounceNameTab/config.html")
@PreventIframe("/pronounceNameTab/remove.html")
export class PronounceNameTab {
}
