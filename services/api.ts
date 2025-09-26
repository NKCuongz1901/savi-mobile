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

export const getUserApi = () => {
    return api.get("/auth/profile");
}

export const getUserWalletApi = () => {
    return api.get("/wallet");
}

export const createTransactionSpeechApi = (transcript: string) => {
    const url = "/transaction/ai-create";
    return api.post(url, { transcript });
}

export const getTransactionsApi = (
    userId: string,
    params: { type?: string; createdAtStart?: string; startDate?: string; endDate?: string }
) => {
    return api.get(`/transaction/${userId}/transactions`, { params });
}