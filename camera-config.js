/* Camera connection configuration.
   The LiveKit API secret stays only in Supabase Edge Function Secrets. */
window.KA_CAMERA_CONFIG = window.KA_CAMERA_CONFIG || {
  functionName: 'livekit-token'
};
