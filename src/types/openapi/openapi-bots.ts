/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export type paths = {
    "/ocs/v2.php/apps/spreed/api/{apiVersion}/bot/{token}/message": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Sends a new chat message to the given room
         * @description The author and timestamp are automatically set to the current user/guest and time.
         */
        post: operations["bot-send-message"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/ocs/v2.php/apps/spreed/api/{apiVersion}/bot/{token}/reaction/{messageId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Adds a reaction to a chat message */
        post: operations["bot-react"];
        /** Deletes a reaction from a chat message */
        delete: operations["bot-delete-reaction"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
};
export type webhooks = Record<string, never>;
export type components = {
    schemas: {
        Capabilities: {
            features: string[];
            "features-local": string[];
            config: {
                attachments: {
                    allowed: boolean;
                    folder?: string;
                };
                call: {
                    enabled: boolean;
                    "breakout-rooms": boolean;
                    recording: boolean;
                    /** Format: int64 */
                    "recording-consent": number;
                    "supported-reactions": string[];
                    "predefined-backgrounds": string[];
                    "can-upload-background": boolean;
                    "sip-enabled": boolean;
                    "sip-dialout-enabled": boolean;
                    "can-enable-sip": boolean;
                    "start-without-media": boolean;
                    /** Format: int64 */
                    "max-duration": number;
                    "blur-virtual-background": boolean;
                };
                chat: {
                    /** Format: int64 */
                    "max-length": number;
                    /** Format: int64 */
                    "read-privacy": number;
                    "has-translation-providers": boolean;
                    "has-translation-task-providers": boolean;
                    /** Format: int64 */
                    "typing-privacy": number;
                    /** Format: int64 */
                    "summary-threshold": number;
                };
                conversations: {
                    "can-create": boolean;
                    "force-passwords": boolean;
                };
                federation: {
                    enabled: boolean;
                    "incoming-enabled": boolean;
                    "outgoing-enabled": boolean;
                    "only-trusted-servers": boolean;
                };
                previews: {
                    /** Format: int64 */
                    "max-gif-size": number;
                };
                signaling: {
                    /** Format: int64 */
                    "session-ping-limit": number;
                    "hello-v2-token-key"?: string;
                };
            };
            "config-local": {
                [key: string]: string[];
            };
            version: string;
        };
        OCSMeta: {
            status: string;
            statuscode: number;
            message?: string;
            totalitems?: string;
            itemsperpage?: string;
        };
        PublicCapabilities: {
            spreed?: components["schemas"]["Capabilities"];
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
};
export type $defs = Record<string, never>;
export interface operations {
    "bot-send-message": {
        parameters: {
            query?: never;
            header: {
                /** @description Required to be true for the API request to pass */
                "OCS-APIRequest": boolean;
            };
            path: {
                apiVersion: "v1";
                /** @description Conversation token */
                token: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** @description The message to send */
                    message: string;
                    /**
                     * @description For the message to be able to later identify it again
                     * @default
                     */
                    referenceId?: string;
                    /**
                     * Format: int64
                     * @description Parent id which this message is a reply to
                     * @default 0
                     */
                    replyTo?: number;
                    /**
                     * @description If sent silent the chat message will not create any notifications
                     * @default false
                     */
                    silent?: boolean;
                };
            };
        };
        responses: {
            /** @description Message sent successfully */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        ocs: {
                            meta: components["schemas"]["OCSMeta"];
                            data: unknown;
                        };
                    };
                };
            };
            /** @description When the replyTo is invalid or message is empty */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        ocs: {
                            meta: components["schemas"]["OCSMeta"];
                            data: unknown;
                        };
                    };
                };
            };
            /** @description Sending message is not allowed */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        ocs: {
                            meta: components["schemas"]["OCSMeta"];
                            data: unknown;
                        };
                    };
                };
            };
            /** @description Message too long */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        ocs: {
                            meta: components["schemas"]["OCSMeta"];
                            data: unknown;
                        };
                    };
                };
            };
        };
    };
    "bot-react": {
        parameters: {
            query?: never;
            header: {
                /** @description Required to be true for the API request to pass */
                "OCS-APIRequest": boolean;
            };
            path: {
                apiVersion: "v1";
                /** @description Conversation token */
                token: string;
                /** @description ID of the message */
                messageId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** @description Reaction to add */
                    reaction: string;
                };
            };
        };
        responses: {
            /** @description Reaction already exists */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        ocs: {
                            meta: components["schemas"]["OCSMeta"];
                            data: unknown;
                        };
                    };
                };
            };
            /** @description Reacted successfully */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        ocs: {
                            meta: components["schemas"]["OCSMeta"];
                            data: unknown;
                        };
                    };
                };
            };
            /** @description Reacting is not possible */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        ocs: {
                            meta: components["schemas"]["OCSMeta"];
                            data: unknown;
                        };
                    };
                };
            };
            /** @description Reacting is not allowed */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        ocs: {
                            meta: components["schemas"]["OCSMeta"];
                            data: unknown;
                        };
                    };
                };
            };
            /** @description Reaction not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        ocs: {
                            meta: components["schemas"]["OCSMeta"];
                            data: unknown;
                        };
                    };
                };
            };
        };
    };
    "bot-delete-reaction": {
        parameters: {
            query: {
                /** @description Reaction to delete */
                reaction: string;
            };
            header: {
                /** @description Required to be true for the API request to pass */
                "OCS-APIRequest": boolean;
            };
            path: {
                apiVersion: "v1";
                /** @description Conversation token */
                token: string;
                /** @description ID of the message */
                messageId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Reaction deleted successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        ocs: {
                            meta: components["schemas"]["OCSMeta"];
                            data: unknown;
                        };
                    };
                };
            };
            /** @description Reacting is not possible */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        ocs: {
                            meta: components["schemas"]["OCSMeta"];
                            data: unknown;
                        };
                    };
                };
            };
            /** @description Reacting is not allowed */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        ocs: {
                            meta: components["schemas"]["OCSMeta"];
                            data: unknown;
                        };
                    };
                };
            };
            /** @description Reaction not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        ocs: {
                            meta: components["schemas"]["OCSMeta"];
                            data: unknown;
                        };
                    };
                };
            };
        };
    };
}
