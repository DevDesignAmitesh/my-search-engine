type Hosts = Map<
  string,
  { nextAllowedTime: number; urls: { url: string; id: string }[] }
>;

class HostManager {
  private static instance: HostManager;
  private hosts: Hosts;
  private urls: string[];

  constructor() {
    // todo: hydrate it via db
    this.hosts = new Map();
    this.urls = [];
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
        urls: [{ url, id: crypto.randomUUID() }],
      });
    } else {
      this.hosts.get(host)!.urls.push({ url, id: crypto.randomUUID() });
    }

    this.urls.push(url);
  }

  getNextHostUrl = async () => {
    let nextAllowedUrl: string | null = null;
    let nextAllowedUrlId: string | null = null;
    let host: string | null = null;
    const now = Date.now();

    for (const [key, val] of this.hosts.entries()) {
      if (nextAllowedUrl || nextAllowedUrlId || host) break;

      if (!val.urls.length) {
        this.hosts.delete(key);
        continue;
      }

      // getting the first url and assigning it
      const url = val.urls[0]!;
      nextAllowedUrl = url.url;
      nextAllowedUrlId = url.id;
      host = key;

      let timeout;

      // updating the nextallowed time
      let timeObject = new Date();
      const milliseconds = 2 * 1000; // 2 seconds = 2000 milliseconds
      timeObject = new Date(timeObject.getTime() + milliseconds);

      console.log("allowed or not", now > val.nextAllowedTime);
      console.log("delay", now - val.nextAllowedTime);

      const response = await new Promise<{
        url: string | null;
        id: string | null;
        host: string | null;
      }>((res) => {
        if (now > val.nextAllowedTime && val.urls.length) {
          // assigning it
          val.nextAllowedTime = timeObject.valueOf();
          res({ url: nextAllowedUrl, id: nextAllowedUrlId, host });
        } else {
          const delay = val.nextAllowedTime - now;

          timeout = setTimeout(() => {
            val.nextAllowedTime = timeObject.valueOf();
            res({ url: nextAllowedUrl, id: nextAllowedUrlId, host });
          }, delay);
        }
      });

      // deleting it then
      const filteredHostUrls = val.urls.filter((val) => val.url !== url.url);
      val.urls = filteredHostUrls;

      if (timeout) clearTimeout(timeout);
      nextAllowedUrl = response.url;
      nextAllowedUrlId = response.id;
      host = response.host;
    }

    console.log("nextAllowedUrl", nextAllowedUrl);

    return { id: nextAllowedUrlId, host, url: nextAllowedUrl };
  };

  checkExistingUrl({ url }: { url: string }) {
    return this.urls.find((val) => val == url);
  }
}

export const hostManager = HostManager.getInstance();
