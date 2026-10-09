type Hosts = Map<string, { nextAllowedTime: number; urls: Set<string> }>;

class HostManager {
  private static instance: HostManager;
  private hosts: Hosts;
  private urls: Set<string>;

  constructor() {
    // todo: hydrate it via db
    this.hosts = new Map();
    this.urls = new Set();
  }

  static getInstance(): HostManager {
    if (!HostManager.instance) HostManager.instance = new HostManager();
    return HostManager.instance;
  }

  getHost(url: string) {
    return new URL(url).host;
  }

  addUrlToHosts(url: string) {
    const host = this.getHost(url);
    const existingHost = this.hosts.get(host);

    if (!existingHost) {
      let timeObject = new Date();
      const milliseconds = 2 * 1000; // 2 seconds = 2000 milliseconds
      timeObject = new Date(timeObject.getTime() + milliseconds);

      this.hosts.set(host, {
        nextAllowedTime: timeObject.valueOf(),
        urls: new Set(url),
      });
    } else {
      this.hosts.get(host)!.urls.add(url);
    }

    this.urls.add(url);
  }

  getNextHostUrl() {
    let nextAllowedUrl: string | null = null;

    const now = Date.now();

    for (const [_key, val] of this.hosts.entries()) {
      if (val.nextAllowedTime > now && val.urls.size) {
        // getting the first url and assigning it
        const url = Array.from(val.urls)[0]!;
        nextAllowedUrl = url;

        // deleting it then
        val.urls.delete(url);
        this.urls.delete(url);

        // updating the nextallowed time
        let timeObject = new Date();
        const milliseconds = 2 * 1000; // 2 seconds = 2000 milliseconds
        timeObject = new Date(timeObject.getTime() + milliseconds);

        // assigning it
        val.nextAllowedTime = timeObject.valueOf();
        break;
      } else {
        nextAllowedUrl = null;
      }
    }

    return nextAllowedUrl;
  }

  checkExistingUrl({ url }: { url: string }) {
    return this.urls.has(url);
  }
}

export const hostManager = HostManager.getInstance();
