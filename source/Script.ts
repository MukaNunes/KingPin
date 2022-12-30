import "./Resources";

import Materialize from "materialize-css";

import TabsController from "./controllers/TabsController";

void (async (): Promise<void> => {
    const tabsController = new TabsController();
    await tabsController.init();
})();

// Initiate buttons tooltips
document.addEventListener("DOMContentLoaded", () => {
    const elements = document.querySelectorAll(".tooltipped");
    Materialize.Tooltip.init(elements, { position: "left" });
});
