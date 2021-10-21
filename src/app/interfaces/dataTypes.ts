
// Raw data types

import { NbChatMessageFile } from '../framework/theme/components/chat/chat-message-file.component';

export interface User {
    uid: string;
    username: string;
    name: string;
    surname: string;
    age?: string;
    sex?: string;
    bio?: string;
    last_access: number;
    profile_img_url?: string;
    online?: boolean;
}

export interface Chat {
    uid: string;
    last_message_preview?: string;
    messages_to_read?: number;
    updated_timestamp?: number;
    user_has_to_read?: string;
    users_uids: string[];
    user0_writing?: number;
    user1_writing?: number;
    user_writing_updated_by?: number;
}

export interface Message {
    uid: string;
    quote_message_uid?: string;
    readed: boolean;
    text?: string;
    timestamp: number;
    type: string;
    files: File[] | any[];
    users_uids: string[];
}

export interface File {
    title: string;
    type: string;
    url: string;
}

// Ui data types

export type UIUser = User;

export interface UIChat {
    uid: string;
    last_message_preview?: string;
    messages_to_read?: number;
    updated_timestamp?: number;
    user_has_to_read?: string;
    targetUserUID: string;
    targetUsername: string;
    notify: string;
    name: string;
    surname: string,
    profile_img_url: string;
    online?: boolean;
    user0_writing?: number;
    user1_writing?: number;
    user_writing_updated_by?: number;
    users_uids?: string[];
    target_user_writing?: boolean;
}

export interface UIMessage {
    uid: string;
    type: string;
    text: string;
    reply: boolean;
    status: string;
    timestamp?: number;
    files?: UIFile[];
    quote?: UIMessage;
    latitude?: number;
    longitude?: number;
    firstOfTheDay: boolean;
    lastOfAGroup: boolean;
    confirmTimestamp?: number;
    users_uids: string[];
}

export type UIFile = NbChatMessageFile;
