export interface TokenPayload{
    sub: string;
    name: string;
    surname: string;
    username: string;
    email: string;
    role: string;
}

export interface TokenPayloadVerify{
    sub: string;
    name: string;
    surname: string;
    username: string;
    email: string;
    role: string;
    iat: number;
    exp: number;
}