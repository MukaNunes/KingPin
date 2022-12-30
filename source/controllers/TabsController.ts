import ChromeTools from "../libraries/ChromeTools";

/**
 * Interface for TabItem
 *
 * @author Samuel Nunes <samuel.nunes@yahoo.com.br>
 */
interface TabItem {
    url: string;
    pinned: boolean;
    favIconUrl: string;
}

/**
 * Enumerates the possible storage items keys
 *
 * @author Samuel Nunes <samuel.nunes@yahoo.com.br>
 */
enum StorageItems {
    TABS = "pinnedTabs",
}

/**
 * Enumerates the DOM elements used in context
 *
 * @author Samuel Nunes <samuel.nunes@yahoo.com.br>
 */
enum DomElements {
    TAB_ENTRY_TEMPLATE = "#tr-template",
    TAB_ENTRY_ICON = ".tab-icon",
    TAB_ENTRY_TITLE = ".title",
    TAB_ENTRY_PIN_BUTTON = ".pin-button",
    TAB_ENTRY_PINNED_CLASS = "pinned",
    TAB_LIST_CONTAINER = "#list-content",
    RELOAD_TABS_BUTTON = "#reload-pinned",
    DELETE_TABS_BUTTON = "#delete-pinned",
}

/**
 * Tab management controller
 *
 * @author Samuel Nunes <samuel.nunes@yahoo.com.br>
 */
export default class TabsController {

    /**
     * ChromeTools instance
     */
    private readonly chromeTools: ChromeTools;

    /**
     * Opened tabs in chrome
     */
    private currentTabs: chrome.tabs.Tab[];

    /**
     * Tabs saved in storage
     */
    private savedTabs: TabItem[];

    /**
     * Class Constructor
     */
    public constructor() {
        this.chromeTools = new ChromeTools();
    }

    /**
     * Execute initialization methods
     * Load list of open tabs
     * Assign the click events in the DOM
     *
     * @author Samuel Nunes <samuel.nunes@yahoo.com.br>
     * @returns {Promise<void>}
     */
    public async init(): Promise<void> {
        this.currentTabs = await this.chromeTools.getChromeTabs();
        this.savedTabs = await this.getStoredTabs();

        await this.loadTabList();
        await this.assignPinButtonsEventListener();
        this.assignDeleteButtonsEventListener();
        this.assignReloadButtonsEventListener();
    }

    /**
     * Loads the list of open tabs in the view
     *
     * @author Samuel Nunes <samuel.nunes@yahoo.com.br>
     * @returns {Promise<void>}
     */
    private async loadTabList(): Promise<void> {
        const listElements: HTMLElement[] = [];

        for (const tab of this.currentTabs) {
            const tabElement = this.getTabEntryElement(tab);
            if (tabElement) listElements.push(tabElement);
        }

        document.querySelector(DomElements.TAB_LIST_CONTAINER)?.append(...listElements);
    }

    /**
     * Reloads saved tabs in the browser
     *
     * @author Samuel Nunes <samuel.nunes@yahoo.com.br>
     * @returns {Promise<void>}
     */
    private async reloadPinnedTabs(): Promise<void> {
        const savedTabs = await this.getStoredTabs();
        const openedTabs = await this.chromeTools.getChromeTabs();

        for (const savedTab of savedTabs) {
            const currentOpenedTab = openedTabs.find((openedTab) => openedTab.url === savedTab.url);
            const currentId = currentOpenedTab?.id;

            if (currentOpenedTab && currentId) {
                await this.chromeTools.updateChromeTab(currentId, { pinned: true });
                continue;
            }

            await this.chromeTools.createChromeTab({
                active: false,
                pinned: true,
                url: savedTab.url,
            });
        }

        self.close();
    }

    /**
     * Returns a clone of the table tr template filled with tab data
     *
     * @author Samuel Nunes <samuel.nunes@yahoo.com.br>
     * @param {chrome.tabs.Tab} tab Chrome tab object
     * @returns {HTMLElement | null}
     */
    private getTabEntryElement(tab: chrome.tabs.Tab): HTMLElement | null {
        const tabListItemTemplate: HTMLTemplateElement | null = document.querySelector(DomElements.TAB_ENTRY_TEMPLATE);
        if (!tab.title || !tab.id || !tabListItemTemplate) return null;

        const tabElement = tabListItemTemplate.content.cloneNode(true) as HTMLElement;
        tabElement.querySelector(DomElements.TAB_ENTRY_TITLE)!.textContent = tab.title;
        tabElement.querySelector(DomElements.TAB_ENTRY_PIN_BUTTON)!.id = tab.id.toString();
        if (tab.favIconUrl) tabElement.querySelector(DomElements.TAB_ENTRY_ICON)!
            .setAttribute("style", `background-image: url("${tab.favIconUrl}")`);

        if (this.savedTabs.some((savedTab) => savedTab.url === tab.url)) {
            tabElement.querySelector(DomElements.TAB_ENTRY_PIN_BUTTON)?.setAttribute("checked", "true");
        }

        return tabElement;
    }

    /**
     * Returns tabs saved in storage
     *
     * @author Samuel Nunes <samuel.nunes@yahoo.com.br>
     * @returns {Promise<TabItem[]>}
     */
    private async getStoredTabs(): Promise<TabItem[]> {
        const tabs = await this.chromeTools.getStorageItem<TabItem[]>(StorageItems.TABS);

        return tabs ?? [];
    }

    /**
     * Saves the set of tabs in pinnedTabschrome storage
     *
     * @author Samuel Nunes <samuel.nunes@yahoo.com.br>
     * @param {TabItem} tabData tab object
     * @returns {Promise<void>}
     */
    private async setStoredTabs(tabData: TabItem): Promise<void> {
        let currentData = await this.getStoredTabs();
        if (currentData.includes(tabData)) {
            currentData = currentData.filter((item) => item !== tabData);
        } else {
            currentData.push(tabData);
        }

        return this.chromeTools.setStorageItem(StorageItems.TABS, currentData);
    }

    /**
     * Deletes all tabs in storage
     *
     * @author Samuel Nunes <samuel.nunes@yahoo.com.br>
     * @returns {Promise<void>}
     */
    private async deleteStoredTabs(): Promise<void> {
        await this.chromeTools.deleteStorageItem(StorageItems.TABS);

        self.close();
    }

    // [EVENTS HANDLERS] =======================================================

    /**
     * Assign the reloadPinnedTabs function to the click event of the reload-pinned button
     *
     * @author Samuel Nunes <samuel.nunes@yahoo.com.br>
     * @returns {void}
     */
    private assignReloadButtonsEventListener(): void {
        const reloadButton = document.querySelector(DomElements.RELOAD_TABS_BUTTON);
        console.log("reloadButton:", reloadButton);
        reloadButton?.addEventListener("click", () => {
            void (async (): Promise<void> => {
                await this.reloadPinnedTabs();
            })();
        });
    }

    /**
     * Assign the deletePinnedTabs function to the click event of the delete-pinned button
     *
     * @author Samuel Nunes <samuel.nunes@yahoo.com.br>
     * @returns {void}
     */
    private assignDeleteButtonsEventListener(): void {
        const reloadButton = document.querySelector(DomElements.DELETE_TABS_BUTTON);
        reloadButton?.addEventListener("click", () => {
            void (async (): Promise<void> => {
                await this.deleteStoredTabs();
            })();
        });
    }

    /**
     * Assign the handlePinButtonClick function to the click event of the pin-buttons
     *
     * @author Samuel Nunes <samuel.nunes@yahoo.com.br>
     * @returns {Promise<void>}
     */
    private async assignPinButtonsEventListener(): Promise<void> {
        const pinButtons = document.querySelectorAll(DomElements.TAB_ENTRY_PIN_BUTTON);

        Array.prototype.forEach.call(pinButtons, (pinButton: HTMLElement | null) => {
            if (pinButton) pinButton.addEventListener("click", (event) => {
                void (async (): Promise<void> => {
                    await this.handlePinButtonClick(event);
                })();
            });
        });
    }

    /**
     * Handles the click event on pin-buttons.
     * Updates the pinned status on the target tab.
     * Saves status of tabs in storage
     *
     * @author Samuel Nunes <samuel.nunes@yahoo.com.br>
     * @param {Event} event click event object
     * @returns {Promise<void>}
     */
    private async handlePinButtonClick(event: Event): Promise<void> {
        const savedTabs = await this.getStoredTabs();
        const openedTabs = await this.chromeTools.getChromeTabs();
        const eventTarget = event.target as HTMLInputElement;
        const id = eventTarget.id ? +eventTarget.id : null;
        if (!id) return;

        const currentTab = openedTabs.find((tab) => tab.id === id);
        const isSaved = savedTabs.find((tab) => tab.url === currentTab?.url);

        const pinStatus = !isSaved && currentTab?.pinned
            ? true
            : !currentTab?.pinned;

        await this.chromeTools.updateChromeTab(id, { pinned: pinStatus });
        await this.setStoredTabs(currentTab as TabItem);
    }

}
