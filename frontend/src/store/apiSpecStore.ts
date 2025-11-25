import { create } from 'zustand';

interface ApiSpec {
    service: string;
    version: string;
    endpoints: Endpoint[];
}

interface Endpoint {
    name: string;
    method: string;
    path: string;
    description: string;
    path_params: Param[];
    query_params: Param[];
    request_body?: any;
    response_body?: any;
    example_request?: any;
    example_response?: any;
}

interface Param {
    name: string;
    type: string;
    required: boolean;
    description?: string;
}

interface ApiSpecState {
    spec: ApiSpec | null;
    loading: boolean;
    error: string | null;
    fetchSpec: () => Promise<void>;
}

const API_URL = 'http://localhost:8080';

export const useApiSpecStore = create<ApiSpecState>((set) => ({
    spec: null,
    loading: false,
    error: null,
    fetchSpec: async () => {
        set({ loading: true, error: null });
        try {
            const response = await fetch(`${API_URL}/api/spec`);
            if (!response.ok) throw new Error('Failed to fetch API spec');
            const data = await response.json();
            set({ spec: data, loading: false });
        } catch (error: any) {
            set({ error: error.message, loading: false });
        }
    },
}));
