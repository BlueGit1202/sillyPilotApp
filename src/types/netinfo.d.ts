declare module '@react-native-community/netinfo' {
  export interface NetInfoState {
    type: string
    isConnected: boolean | null
    isInternetReachable: boolean | null
    details: unknown
  }

  export interface NetInfoSubscription {
    (): void
  }

  interface NetInfo {
    addEventListener(callback: (state: NetInfoState) => void): NetInfoSubscription
    fetch(): Promise<NetInfoState>
  }

  const NetInfo: NetInfo
  export default NetInfo
}
