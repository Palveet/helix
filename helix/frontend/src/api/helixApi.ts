import axios from 'axios';

const API_BASE_URL = "http://localhost:5000/api";


export interface ChatPayload {
  message: string;
  job_role: string;
  location: string;
  details: string[];
}

export interface SequencePayload {
  user_id: string;
  sequence_content: string;
}

export const sendChatMessage = (payload: ChatPayload) => {
    return axios.post(`${API_BASE_URL}/chat`, payload, {
        responseType: 'text'  
    });
};

export const createSequence = (payload: SequencePayload) => {
    return axios.post(`${API_BASE_URL}/sequence`, payload);
};
