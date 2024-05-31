import { updatePricesInCache } from "../service/priceService.js";
const startPriceMonitoring = () => {
  // Fetch and update prices every minute
  setInterval(async () => {
    await updatePricesInCache();
  }, 60000);
};

export default startPriceMonitoring;
