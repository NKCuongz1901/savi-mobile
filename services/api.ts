import api from "@/services/axios.customize";


export const loginApi = (email: string, password: string) => {
    const url = "/auth/login";
    return api.post(url, { email, password });
}

export const signupApi = (fullName: string, email: string, password: string) => {
    const url = "/user/create";
    return api.post(url, { fullName, email, password });
}

export const verifySignupApi = (codeId: string) => {
    const url = "/user/verify";
    return api.post(url, { codeId });
}