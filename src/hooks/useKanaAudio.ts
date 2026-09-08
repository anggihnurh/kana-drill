/**
 * useKanaAudio
 * Plays Japanese kana pronunciation using the browser's Web Speech API.
 * Falls back gracefully if speech synthesis is not supported.
 */

export function speakKana(kanaText: string): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();


  const utterance = new SpeechSynthesisUtterance(kanaText);
  utterance.lang = 'ja-JP';
  utterance.rate = 0.85;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  // Try to select a Japanese voice if available
  const voices = window.speechSynthesis.getVoices();
  const japaneseVoice =
    voices.find((v) => v.lang === 'ja-JP' && !v.localService) ||
    voices.find((v) => v.lang === 'ja-JP') ||
    voices.find((v) => v.lang.startsWith('ja'));

  if (japaneseVoice) {
    utterance.voice = japaneseVoice;
  }

  window.speechSynthesis.speak(utterance);
}

export function isKanaAudioSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}
