export interface User { 
    id: string; 
    name: string; 
    role: string; 
}

export interface ChatItem { 
    id: string; 
    name: string; 
    type: string; 
}

export interface Message { 
    user: string; 
    content: string; 
    isSystem?: boolean; 
}