export interface RegisterProps {
    firstName: string,
    lastName: string,
    username: string, 
    password: string, 
}

export interface LoginProps {
    username: string, 
    password: string, 
}

export interface AccessTokenProps {
    password: string, 
    server: string, 
    storage: string, 
    username: string, 
}

export interface InitialStateProps {
    loading: boolean,
    error: string | null, 
    user: object | null,
    sucess: boolean, 
    accessToken: AccessTokenProps | null, 
    login: ({ username, password}: LoginProps) => void,
    register: ({firstName, lastName, username, password}: RegisterProps) => void,
    resetStore: () => void, 
    logout: () => void, 
}
