/**
 * Exposes some chrome API methods
 *
 * @author Samuel Nunes <samuel.nunes@yahoo.com.br>
 */
export default class ChromeTools {

    /**
     * Returns an array of open tabs in chrome
     *
     * @author Samuel Nunes <samuel.nunes@yahoo.com.br>
     * @returns {Promise<chrome.tabs.Tab[]>}
     */
    public async getChromeTabs(): Promise<chrome.tabs.Tab[]> {
        return chrome.tabs.query({});
    }

    /**
     * Creates an chrome tab property
     *
     * @author Samuel Nunes <samuel.nunes@yahoo.com.br>
     * @param {chrome.tabs.UpdateProperties} properties Tab properties object
     * @returns {Promise<void>}
     */
    public async createChromeTab(properties: chrome.tabs.UpdateProperties): Promise<chrome.tabs.Tab> {
        return chrome.tabs.create(properties);
    }

    /**
     * Updates an chrome tab property
     *
     * @author Samuel Nunes <samuel.nunes@yahoo.com.br>
     * @param {number} tabId Id of the tab to be updated
     * @param {chrome.tabs.UpdateProperties} properties Tab properties object
     * @returns {Promise<void>}
     */
    public async updateChromeTab(tabId: number, properties: chrome.tabs.UpdateProperties): Promise<chrome.tabs.Tab> {
        return chrome.tabs.update(tabId, properties);
    }

    /**
     * Returns an storage item from chrome.sync API
     *
     * @author Samuel Nunes <samuel.nunes@yahoo.com.br>
     * @param {string} dataItem storage item to be retrieved
     * @template {unknown} T Generic return type
     * @returns {Promise<T | undefined>}
     */
    public async getStorageItem<T>(dataItem: string): Promise<T | undefined> {
        const storageJson = await chrome.storage.sync.get([ dataItem ]);

        return storageJson[dataItem] ? JSON.parse(storageJson[dataItem]) as T : undefined;
    }

    /**
     * Saves an storage item in chrome.sync API
     *
     * @author Samuel Nunes <samuel.nunes@yahoo.com.br>
     * @param {string} dataKey storage item to be retrieved
     * @param {unknown} dataItem storage item to be retrieved
     * @returns {Promise<void>}
     */
    public async setStorageItem(dataKey: string, dataItem: unknown): Promise<void> {
        return chrome.storage.sync.set({ [dataKey]: JSON.stringify(dataItem) });
    }

    /**
     * Clears all data on a storage item from chrome.sync API
     *
     * @author Samuel Nunes <samuel.nunes@yahoo.com.br>
     * @param {string} dataItem storage item to be retrieved
     * @returns {Promise<void>}
     */
    public async deleteStorageItem(dataItem: string): Promise<void> {
        return chrome.storage.sync.remove([ dataItem ]);
    }

}
