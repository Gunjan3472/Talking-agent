
export enum CallStatus {
  IDLE = 'IDLE',
  CONNECTING = 'CONNECTING',
  ACTIVE = 'ACTIVE',
  DISCONNECTED = 'DISCONNECTED'
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  icon: string;
  systemInstruction: string;
  color: string;
  type: 'inbound' | 'outbound';
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
