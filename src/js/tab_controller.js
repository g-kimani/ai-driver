class TabController {
  constructor(root, tabCount) {
    this.root = root;
    this.tabId = root.dataset.fortab;
    this.tabCount = tabCount;
    this.activeTab = 1;
    this.tabs = [];
    this.tabContainers = [];
    this.events = new EventHandler();
    this.getTabs();
    this.addTabListeners();
    this.loadInitialState();
  }

  getTabs() {
    const tabBtns = this.getTabBtns();
    const tabContainers = this.getTabContainers();
    if (
      tabBtns.length !== this.tabCount ||
      tabContainers.length !== this.tabCount ||
      tabContainers.length !== tabBtns.length
    ) {
      throw new Error(
        `Tab count is not consistent with tabs found Btns: ${tabBtns.length} != Containers: ${tabContainers.length} != Count: ${this.tabCount}`
      );
    }

    this.tabs = tabBtns;
    this.tabContainers = tabContainers;
  }
  getTabHeader() {
    const header = [...this.root.querySelectorAll(".tabs-header")].filter(
      (t) => t.dataset.fortab === this.tabId
    );
    if (header.length > 1) {
      throw new Error(`Found multiple headers for tab ${this.tabId}`);
    }
    if (header.length === 0) {
      throw new Error(`No tab header found for tab ${this.tabId} `);
    }
    return header[0];
  }

  getTabBtns() {
    const header = this.getTabHeader();
    return header.querySelectorAll(`[data-tab][data-forTab="${this.tabId}"]`);
  }

  getTabContent() {
    const content = [...this.root.querySelectorAll(".tab-content")].filter(
      (t) => t.dataset.fortab === this.tabId
    );
    if (content.length > 1) {
      throw new Error(`Found multiple contents for tab ${this.tabId}`);
    }
    if (content.length === 0) {
      throw new Error(`No tab content found for tab ${this.tabId} `);
    }
    return content[0];
  }

  getTabContainers() {
    const content = this.getTabContent();
    return content.querySelectorAll(`[data-tab][data-forTab="${this.tabId}"]`);
  }

  addTabListeners() {
    for (let btn of this.tabs) {
      btn.addEventListener("click", (event) => {
        this.setActiveTab(btn.dataset.tab);
      });
    }
  }

  setActiveTab(tabNum) {
    tabNum = String(tabNum);
    for (let btn of this.tabs) {
      if (btn.dataset.tab !== tabNum) {
        btn.classList.remove("active-tab");
      } else {
        btn.classList.add("active-tab");
      }
    }
    for (let container of this.tabContainers) {
      if (container.dataset.tab !== tabNum) {
        container.classList.add("hidden");
      } else {
        container.classList.remove("hidden");
      }
    }
    this.activeTab = tabNum;
    this.events.trigger("tabChange", tabNum);
    this.saveState();
  }

  saveState() {
    const save = this.getSaveState();
    save[this.tabId] = this.activeTab;
    localStorage.setItem("tabStates", JSON.stringify(save));
  }

  getSaveState() {
    const raw = localStorage.getItem("tabStates");
    if (!raw) {
      console.info("Creating Initial Tab Save");
      const saveData = {};
      saveData[this.tabId] = this.activeTab;
      localStorage.setItem("tabStates", JSON.stringify(saveData));
      return saveData;
    }
    try {
      const saveData = JSON.parse(raw);
      return saveData;
    } catch (e) {
      console.warn("Issue parsing track", e);
    }
  }

  loadInitialState() {
    const save = this.getSaveState();
    const savedActiveTab = save[this.tabId];
    if (savedActiveTab) {
      this.setActiveTab(savedActiveTab);
    } else {
      this.setActiveTab(1);
      this.saveState();
    }
  }
}
