
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
}

export interface Chat {
    uid: string;
    last_message_preview?: string;
    messages_to_read?: number;
    updated_timestamp?: number;
    users_has_to_read?: string;
    user_uids: string[];
}

export interface Message {
    uid: string;
    quote_message_uid?: string;
    readed: boolean;
    text?: string;
    timestamp: number;
    type: string;
    files: File[];
    user_uids: string[];
}

export interface MessageToSend {
    quote_message_uid?: string;
    text?: string;
    timestamp: number;
    type: string;
    files: any[];
    users_uids: string[];
}

export interface File {
    title: string;
    type: string;
    url: string;
}
