const useProdApi = true;

module.exports = {
  apiUrl: (
    useProdApi
      ? 'https://api.localrelayer.com'
      : 'http://localhost:5001'
  ),
  socketUrl: (
    useProdApi
      ? 'wss://api.localrelayer.com:8082'
      : 'ws://localhost:5003'
  ),
  mockApi: false,
  useSentry: true,
};
