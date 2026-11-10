// Ask the app to play the (quick) page loader — for in-page switches that
// don't change the route, e.g. Explore's colour picker or the Palette tabs.
// App listens for this event and mounts a fresh PageLoader over the page.
export const PLAY_LOADER_EVENT = 'kc:play-loader'

export function playPageLoader() {
  window.dispatchEvent(new Event(PLAY_LOADER_EVENT))
}
