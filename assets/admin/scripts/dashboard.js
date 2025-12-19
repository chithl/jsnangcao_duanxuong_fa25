// Dashboard data + charts
const numberFormatter = new Intl.NumberFormat("vi-VN");
const currencyFormatter = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

const statusClasses = {
  completed: "bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-500",
  paid: "bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-500",
  shipping: "bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-orange-400",
  pending: "bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-orange-400",
  canceled: "bg-error-50 text-error-700 dark:bg-error-500/15 dark:text-error-500"
};

const formatGrowth = (value) => {
  if (!Number.isFinite(value)) return "0%";
  const rounded = Math.round(value * 10) / 10;
  return `${rounded > 0 ? "+" : ""}${rounded}%`;
};

const parseDate = (value) => {
  if (value === undefined || value === null) return null;
  if (typeof value === "number") {
    const asDate = new Date(value);
    return Number.isNaN(asDate) ? null : asDate;
  }
  if (typeof value === "string") {
    const direct = new Date(value);
    if (!Number.isNaN(direct)) return direct;
    const parts = value.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/);
    if (parts) {
      const day = Number(parts[1]);
      const month = Number(parts[2]) - 1;
      const year = Number(parts[3].length === 2 ? `20${parts[3]}` : parts[3]);
      return new Date(year, month, day);
    }
  }
  return null;
};

const formatDateTime = (value) => {
  const date = parseDate(value);
  if (!date) return "--";
  const day = `${date.getDate()}`.padStart(2, "0");
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const year = date.getFullYear();
  const hour = `${date.getHours()}`.padStart(2, "0");
  const minute = `${date.getMinutes()}`.padStart(2, "0");
  return `${day}/${month}/${year} ${hour}:${minute}`;
};

const toArray = (obj) => Object.entries(obj || {}).map(([id, item]) => ({ id, ...item }));

const calcMonthGrowth = (items, getDate) => {
  const now = new Date();
  const currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  let current = 0;
  let previous = 0;

  items.forEach((item) => {
    const date = parseDate(getDate(item));
    if (!date) return;
    if (date >= currentStart) current += 1;
    else if (date >= previousStart && date <= previousEnd) previous += 1;
  });

  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

const computeCompletionRate = (orders) => {
  if (!orders.length) return 0;
  const done = orders.filter((o) => ["paid", "completed"].includes((o.status || "").toLowerCase())).length;
  return Math.round((done / orders.length) * 100);
};

const computeMonthlySeries = (orders) => {
  const now = new Date();
  const labels = [];
  const revenue = new Array(12).fill(0);
  const counts = new Array(12).fill(0);

  for (let i = 11; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(`${date.getMonth() + 1}/${`${date.getFullYear()}`.slice(-2)}`);
  }

  orders.forEach((order) => {
    const date = parseDate(order.created_at || order.createdAt || order.create_at || order.createAt || order.paid_at || order.paidAt);
    if (!date) return;
    const monthDiff = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
    if (monthDiff < 0 || monthDiff > 11) return;
    const index = 11 - monthDiff;
    counts[index] += 1;
    revenue[index] += Number(order.total) || 0;
  });

  return { labels, revenue, counts };
};

const seedSampleOrders = () => {
  const now = new Date();
  const makeDate = (monthsAgo) => {
    const d = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 10, 9, 30);
    return d.getTime();
  };

  return [
    { id: "S1", customer_name: "Khách lẻ", total: 1200000, status: "paid", created_at: makeDate(0) },
    { id: "S2", customer_name: "Công ty A", total: 3600000, status: "shipping", created_at: makeDate(1) },
    { id: "S3", customer_name: "Cửa hàng B", total: 2150000, status: "completed", created_at: makeDate(2) },
    { id: "S4", customer_name: "Đại lý C", total: 4800000, status: "paid", created_at: makeDate(3) },
    { id: "S5", customer_name: "Khách lẻ", total: 890000, status: "pending", created_at: makeDate(4) },
    { id: "S6", customer_name: "Công ty D", total: 5100000, status: "completed", created_at: makeDate(5) }
  ];
};

const ensureOrders = (orders) => {
  if (orders && orders.length) return orders;
  const sample = seedSampleOrders();
  console.warn("Dashboard: chưa có orders, dùng dữ liệu mẫu để hiển thị chart");
  return sample;
};

const renderBarChart = (labels, values) => {
  if (typeof ApexCharts === "undefined") {
    console.error("Dashboard: ApexCharts chưa sẵn sàng (chart-sales)");
    return;
  }
  const container = document.querySelector("#chart-sales");
  if (!container) {
    console.error("Dashboard: không tìm thấy #chart-sales");
    return;
  }
  container.innerHTML = "";
  const maxVal = Math.max(...values, 0);
  const step = 300000;
  const maxY = maxVal > 0 ? Math.ceil(maxVal / step) * step : undefined;
  const chart = new ApexCharts(container, {
    series: [{ name: "Doanh thu", data: values.map((v) => Math.round(v)) }],
    colors: ["#465fff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 220,
      toolbar: { show: false },
      animations: { enabled: false }
    },
    plotOptions: { bar: { columnWidth: "22%", borderRadius: 6 } },
    dataLabels: { enabled: false },
    xaxis: { categories: labels, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: {
        decimalsInFloat: 0,
      min: 0,
      max: maxY,
      tickAmount: maxY && maxY > 0 ? Math.min(6, Math.ceil(maxY / step)) : undefined,
      labels: {
        formatter: (val) => currencyFormatter.format(val),
        style: { fontSize: "12px" },
        offsetX: 10
      }
    },
    tooltip: { y: { formatter: (val) => currencyFormatter.format(val) } },
    grid: { yaxis: { lines: { show: true } } }
  });
  chart.render();
};

const renderAreaChart = (labels, orderSeries, revenueSeries) => {
  if (typeof ApexCharts === "undefined") {
    console.error("Dashboard: ApexCharts chưa sẵn sàng (chart-trend)");
    return;
  }
  const container = document.querySelector("#chart-trend");
  if (!container) {
    console.error("Dashboard: không tìm thấy #chart-trend");
    return;
  }
  container.innerHTML = "";
  const chart = new ApexCharts(container, {
    series: [
      { name: "Đơn hàng", data: orderSeries },
      { name: "Doanh thu", data: revenueSeries.map((v) => Math.round(v)) }
    ],
    colors: ["#465fff", "#9cb9ff"],
    chart: {
      type: "area",
      height: 320,
      toolbar: { show: false },
      animations: { enabled: false }
    },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2 },
    fill: { opacity: 0.25 },
    legend: { show: true, position: "top", horizontalAlign: "left" },
    markers: { size: 0, hover: { size: 0 }, strokeWidth: 0 },
    xaxis: { categories: labels, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { labels: { formatter: (val) => numberFormatter.format(val) } },
    tooltip: { enabled: false },
    grid: { yaxis: { lines: { show: true } } }
  });
  chart.render();
};

const renderRadialChart = (completionRate) => {
  if (typeof ApexCharts === "undefined") {
    console.error("Dashboard: ApexCharts chưa sẵn sàng (chart-progress)");
    return;
  }
  const container = document.querySelector("#chart-progress");
  if (!container) {
    console.error("Dashboard: không tìm thấy #chart-progress");
    return;
  }
  container.innerHTML = "";
  const chart = new ApexCharts(container, {
    series: [completionRate],
    colors: ["#465fff"],
    chart: {
      type: "radialBar",
      height: 280,
      sparkline: { enabled: true },
      animations: { enabled: false }
    },
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        hollow: { size: "78%" },
        track: { background: "#e4e7ec", strokeWidth: "100%", margin: 8 },
        dataLabels: {
          name: { show: true, offsetY: -10, color: "#6b7280", fontSize: "14px" },
          value: {
            show: true,
            formatter: (val) => `${Math.round(val)}%`,
            color: "#1f2937",
            fontSize: "34px",
            fontWeight: 600,
            offsetY: 4
          }
        }
      }
    },
    labels: ["Hoàn tất"]
  });
  chart.render();
};

const renderRecentOrders = (orders) => {
  const body = document.querySelector("#recent-orders-body");
  if (!body) return;
  if (!orders || !orders.length) {
    body.innerHTML = `
      <tr>
        <td colspan="4" class="py-6 text-center text-gray-500 dark:text-gray-400">Chưa có đơn hàng</td>
      </tr>`;
    return;
  }

  const sorted = [...orders]
    .sort((a, b) => {
      const aDate = parseDate(a.created_at || a.createdAt || a.create_at || a.createAt || a.paid_at || a.paidAt)?.getTime() || 0;
      const bDate = parseDate(b.created_at || b.createdAt || b.create_at || b.createAt || b.paid_at || b.paidAt)?.getTime() || 0;
      return bDate - aDate;
    })
    .slice(0, 5);

  body.innerHTML = sorted
    .map((order) => {
      const status = (order.status || "pending").toLowerCase();
      const badgeClass = statusClasses[status] || statusClasses.pending;
      const badgeLabel = {
        completed: "Hoàn tất",
        paid: "Đã thanh toán",
        shipping: "Đang giao",
        pending: "Đang xử lý",
        canceled: "Đã hủy"
      }[status] || "Đang xử lý";

      return `
        <tr class="border-gray-100 border-b dark:border-gray-800">
          <td class="py-3">
            <div class="flex items-center">
              <p class="font-medium text-gray-800 text-theme-sm dark:text-white/90">Đơn #${order.id || "--"}</p>
            </div>
          </td>
          <td class="py-3">
            <div class="flex items-center">
              <p class="text-gray-500 text-theme-sm dark:text-gray-400">${order.customer_name || "Khách lẻ"}</p>
            </div>
          </td>
          <td class="py-3">
            <div class="flex items-center">
              <p class="text-gray-500 text-theme-sm dark:text-gray-400">${currencyFormatter.format(Number(order.total) || 0)}</p>
            </div>
          </td>
          <td class="py-3">
            <div class="flex flex-col gap-1">
              <p class="rounded-full px-2 py-0.5 text-theme-xs font-medium ${badgeClass}">${badgeLabel}</p>
              <span class="text-theme-xs text-gray-400 dark:text-gray-500">${formatDateTime(order.created_at || order.createdAt || order.create_at || order.createAt || order.paid_at || order.paidAt)}</span>
            </div>
          </td>
        </tr>`;
    })
    .join("");
};

const renderCharts = (orders, completionRate) => {
  const monthly = computeMonthlySeries(orders);
  renderBarChart(monthly.labels, monthly.revenue);
  renderAreaChart(monthly.labels, monthly.counts, monthly.revenue);
  renderRadialChart(completionRate);
};

const updateKpis = (orders, users) => {
  const customerGrowth = calcMonthGrowth(users, (user) => user.createdAt || user.created_at || user.create_at || user.createAt);
  const orderGrowth = calcMonthGrowth(orders, (order) => order.created_at || order.createdAt || order.create_at || order.createAt || order.paid_at || order.paidAt);

  const elCustomers = document.querySelector("#kpi-customers");
  const elOrders = document.querySelector("#kpi-orders");
  const elCustomerGrowth = document.querySelector("#kpi-customers-growth");
  const elOrderGrowth = document.querySelector("#kpi-orders-growth");
  const elTotalRevenue = document.querySelector("#kpi-total-revenue");
  const elTodayRevenue = document.querySelector("#kpi-today-revenue");

  if (elCustomers) elCustomers.textContent = numberFormatter.format(users.length);
  if (elOrders) elOrders.textContent = numberFormatter.format(orders.length);
  if (elCustomerGrowth) elCustomerGrowth.textContent = formatGrowth(customerGrowth);
  if (elOrderGrowth) elOrderGrowth.textContent = formatGrowth(orderGrowth);

  const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
  const today = new Date();
  const todayRevenue = orders
    .filter((order) => {
      const date = parseDate(order.created_at || order.createdAt || order.create_at || order.createAt || order.paid_at || order.paidAt);
      return date && date.toDateString() === today.toDateString();
    })
    .reduce((sum, order) => sum + (Number(order.total) || 0), 0);

  if (elTotalRevenue) elTotalRevenue.textContent = currencyFormatter.format(totalRevenue);
  if (elTodayRevenue) elTodayRevenue.textContent = currencyFormatter.format(todayRevenue);
};

const fetchOrders = async () => {
  try {
    const res = await axios.get("https://dax-jsnangcao-fa25-default-rtdb.firebaseio.com/orders.json");
    return toArray(res.data);
  } catch (error) {
    console.error("Không lấy được orders", error);
    return [];
  }
};

const fetchUsers = async () => {
  try {
    const res = await axios.get("https://dax-jsnangcao-fa25-default-rtdb.firebaseio.com/users.json");
    return toArray(res.data);
  } catch (error) {
    console.error("Không lấy được users", error);
    return [];
  }
};

const loadDashboard = async () => {
  try {
    const [orders, users] = await Promise.all([fetchOrders(), fetchUsers()]);
    const ordersSafe = ensureOrders(orders);
    console.info("Dashboard: orders=", ordersSafe.length, "users=", users.length, "ApexCharts ready=", typeof ApexCharts !== "undefined");
    updateKpis(ordersSafe, users);
    renderRecentOrders(ordersSafe);
    renderCharts(ordersSafe, computeCompletionRate(ordersSafe));
  } catch (error) {
    console.error("Lỗi khi tải dashboard", error);
    const body = document.querySelector("#recent-orders-body");
    if (body) {
      body.innerHTML = '<tr><td colspan="4" class="py-6 text-center text-red-500">Không thể tải dữ liệu</td></tr>';
    }
  }
};

let dashboardLoaded = false;
const safeLoad = () => {
  if (dashboardLoaded) return;
  dashboardLoaded = true;
  loadDashboard();
};

document.addEventListener("DOMContentLoaded", safeLoad);
window.addEventListener("load", safeLoad);
