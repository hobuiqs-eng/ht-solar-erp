/**
 * HT Solar ERP — Frontend Application
 * =====================================
 * Architecture: MVC-lite
 *   - State layer   : AppState (single source of truth)
 *   - Service layer : GAS (Google Apps Script calls) / LocalData (demo fallback)
 *   - View layer    : render* functions
 *
 * In production: replace DEMO_MODE = false and set GAS_URL.
 */

// =============================================
//  CONFIG
// =============================================
const DEMO_MODE = false;  // Set false in production
const GAS_URL = 'https://script.google.com/macros/s/AKfycbwhaMTea3ww6V6KJPZLKUBvXEuQQxXAXoz1UQdZJVFxlHElID50vP1a-9O4yX_gi4Q/exec';

// =============================================
//  DEMO DATA (mirrors Google Sheets structure)
// =============================================
const DemoData = {
  users: [
    { id:'U001', username:'admin',    password:'123456', fullname:'Trần Quản Trị',  role:'admin',     status:'active', lastLogin:'' },
    { id:'U002', username:'ketoan',   password:'kt2024', fullname:'Nguyễn Kế Toán', role:'ketoan',    status:'active', lastLogin:'' },
    { id:'U003', username:'sales1',   password:'kd2024', fullname:'Lê Kinh Doanh',  role:'kinhdoanh', status:'active', lastLogin:'' },
    { id:'U004', username:'kho1',     password:'kh2024', fullname:'Phạm Thủ Kho',   role:'kho',       status:'active', lastLogin:'' },
    { id:'U005', username:'kythuat1', password:'kt2024', fullname:'Võ Kỹ Thuật',    role:'kythuat',   status:'active', lastLogin:'' },
  ],
  customers: [
    { id:'KH001', name:'Nguyễn Văn An',   phone:'0901234567', address:'12 Nguyễn Trãi, Q.1, HCM', email:'an@gmail.com',   type:'Hộ gia đình', capacity:5,  status:'Đã ký HĐ', note:'Mái ngói'   },
    { id:'KH002', name:'Công ty TNHH ABC', phone:'0289123456', address:'45 Lê Lợi, Q.5, HCM',      email:'abc@corp.vn',   type:'Doanh nghiệp',capacity:50, status:'Đang thi công', note:'Mái tôn xưởng' },
    { id:'KH003', name:'Trần Thị Bình',   phone:'0912345678', address:'78 Trường Chinh, Đà Nẵng',  email:'binh@gmail.com',type:'Hộ gia đình', capacity:8,  status:'Đã báo giá', note:'Hybrid'     },
    { id:'KH004', name:'Trang trại Xanh', phone:'0905678901', address:'Km5 QL1A, Bình Thuận',      email:'tt@green.vn',   type:'Nông nghiệp', capacity:100,status:'Đang chốt', note:'Off-grid'    },
    { id:'KH005', name:'Lê Minh Cường',   phone:'0933456789', address:'23 Pasteur, Q.3, HCM',      email:'cuong@gmail.com',type:'Hộ gia đình',capacity:6,  status:'Khách mới', note:''           },
  ],
  products: [
    { id:'SP001', name:'LONGi Hi-MO X6',          model:'LR5-72HPH-550M', brand:'LONGi',    category:'Tấm pin',     unit:'Tấm', buyPrice:2800000, sellPrice:3200000 },
    { id:'SP002', name:'Jinko Tiger Neo',           model:'JKM580N-72HL4',  brand:'Jinko',    category:'Tấm pin',     unit:'Tấm', buyPrice:2650000, sellPrice:3050000 },
    { id:'SP003', name:'Sungrow SG5RS',             model:'SG5RS',          brand:'Sungrow',  category:'Inverter',    unit:'Bộ',  buyPrice:8500000, sellPrice:10500000 },
    { id:'SP004', name:'Sungrow SG10RS',            model:'SG10RS',         brand:'Sungrow',  category:'Inverter',    unit:'Bộ',  buyPrice:14000000,sellPrice:17000000 },
    { id:'SP005', name:'Huawei SUN2000-5KTL',      model:'SUN2000-5KTL-L1',brand:'Huawei',   category:'Inverter',    unit:'Bộ',  buyPrice:9200000, sellPrice:11500000 },
    { id:'SP006', name:'Pylontech US5000 5kWh',    model:'US5000C',        brand:'Pylontech',category:'Pin lưu trữ', unit:'Bộ',  buyPrice:22000000,sellPrice:27000000 },
    { id:'SP007', name:'BYD Battery-Box 10kWh',    model:'BYD-HVS-10.2',   brand:'BYD',      category:'Pin lưu trữ', unit:'Bộ',  buyPrice:38000000,sellPrice:46000000 },
    { id:'SP008', name:'Khung nhôm mái tôn',       model:'AL-TN-01',       brand:'VNAlum',   category:'Khung giá đỡ',unit:'Bộ',  buyPrice:1200000, sellPrice:1800000  },
    { id:'SP009', name:'Dây cáp DC 4mm²',          model:'PV-4mm-500m',    brand:'Cadivi',   category:'Phụ kiện',    unit:'m',   buyPrice:12000,   sellPrice:18000    },
    { id:'SP010', name:'Growatt MID 10KTL3-X',     model:'MID10KTL3-X',    brand:'Growatt',  category:'Inverter',    unit:'Bộ',  buyPrice:11500000,sellPrice:14500000 },
  ],
  inventory: [
    { productId:'SP001', productName:'LONGi Hi-MO X6',       category:'Tấm pin',     qty:85, avgCost:2800000, minQty:20 },
    { productId:'SP002', productName:'Jinko Tiger Neo',        category:'Tấm pin',     qty:12, avgCost:2650000, minQty:20 },
    { productId:'SP003', productName:'Sungrow SG5RS',          category:'Inverter',    qty:8,  avgCost:8500000, minQty:5  },
    { productId:'SP004', productName:'Sungrow SG10RS',         category:'Inverter',    qty:3,  avgCost:14000000,minQty:3  },
    { productId:'SP005', productName:'Huawei SUN2000-5KTL',   category:'Inverter',    qty:2,  avgCost:9200000, minQty:3  },
    { productId:'SP006', productName:'Pylontech US5000 5kWh', category:'Pin lưu trữ', qty:5,  avgCost:22000000,minQty:3  },
    { productId:'SP007', productName:'BYD Battery-Box 10kWh', category:'Pin lưu trữ', qty:1,  avgCost:38000000,minQty:2  },
    { productId:'SP008', productName:'Khung nhôm mái tôn',    category:'Khung giá đỡ',qty:42, avgCost:1200000, minQty:10 },
    { productId:'SP009', productName:'Dây cáp DC 4mm²',       category:'Phụ kiện',    qty:500,avgCost:12000,   minQty:100},
    { productId:'SP010', productName:'Growatt MID 10KTL3-X',  category:'Inverter',    qty:4,  avgCost:11500000,minQty:3  },
  ],
  contracts: [
    { id:'HD001', customerId:'KH001', customerName:'Nguyễn Văn An',   signDate:'2024-08-15', value:85000000,  paid:60000000,  status:'Hoàn thành',    progress:100 },
    { id:'HD002', customerId:'KH002', customerName:'Cty TNHH ABC',    signDate:'2024-09-01', value:520000000, paid:260000000, status:'Đang thi công', progress:55  },
    { id:'HD003', customerId:'KH003', customerName:'Trần Thị Bình',   signDate:'2024-10-10', value:140000000, paid:70000000,  status:'Đang thi công', progress:30  },
    { id:'HD004', customerId:'KH004', customerName:'Trang trại Xanh', signDate:'2024-11-01', value:980000000, paid:490000000, status:'Đang thi công', progress:20  },
  ],
  quotations: [
    { id:'BG001', customerId:'KH003', customerName:'Trần Thị Bình', system:'Hybrid', capacity:'8 kWp', total:140000000, createdAt:'2024-10-08', status:'Đã gửi', driveUrl:'#' },
    { id:'BG002', customerId:'KH005', customerName:'Lê Minh Cường', system:'Hòa lưới', capacity:'6 kWp', total:95000000,  createdAt:'2024-11-02', status:'Chờ phản hồi', driveUrl:'#' },
  ],
  payments: [
    { id:'TT001', contractId:'HD001', customerName:'Nguyễn Văn An',   amount:30000000, date:'2024-08-20', method:'Chuyển khoản', note:'Đặt cọc' },
    { id:'TT002', contractId:'HD001', customerName:'Nguyễn Văn An',   amount:30000000, date:'2024-09-01', method:'Chuyển khoản', note:'Lần 2'   },
    { id:'TT003', contractId:'HD002', customerName:'Cty TNHH ABC',    amount:260000000,date:'2024-09-05', method:'Chuyển khoản', note:'50%'     },
    { id:'TT004', contractId:'HD003', customerName:'Trần Thị Bình',   amount:70000000, date:'2024-10-12', method:'Tiền mặt',    note:'50%'     },
  ],
  logs: [
    { time:'2024-11-15 09:00', user:'admin',  action:'LOGIN',           module:'Hệ thống', detail:'Đăng nhập thành công', ip:'192.168.1.10' },
    { time:'2024-11-15 09:05', user:'sales1', action:'ADD_CUSTOMER',    module:'Khách hàng',detail:'Thêm KH: Lê Minh Cường', ip:'192.168.1.20' },
    { time:'2024-11-15 09:30', user:'kho1',   action:'IMPORT_STOCK',    module:'Kho',      detail:'Nhập 30 tấm LONGi',     ip:'192.168.1.30' },
    { time:'2024-11-15 10:00', user:'admin',  action:'EXPORT_QUOTATION',module:'Báo giá',  detail:'Xuất PDF BG002',        ip:'192.168.1.10' },
  ],
};

// =============================================
//  APP STATE
// =============================================
const AppState = {
  currentUser: null,
  customers: [...DemoData.customers],
  products: [...DemoData.products],
  inventory: [...DemoData.inventory],
  contracts: [...DemoData.contracts],
  quotations: [...DemoData.quotations],
  payments: [...DemoData.payments],
  users: [...DemoData.users],
  logs: [...DemoData.logs],
  idCounters: { KH: 5, HD: 4, BG: 2, TT: 4, SP: 10, U: 5, LOG: 4 },
};

// =============================================
//  HELPERS
// =============================================
const fmt = n => new Intl.NumberFormat('vi-VN').format(n) + 'đ';
const fmtM = n => {
  if (n >= 1e9) return (n/1e9).toFixed(1) + ' tỷ';
  if (n >= 1e6) return (n/1e6).toFixed(0) + ' tr';
  return fmt(n);
};
const today = () => new Date().toISOString().split('T')[0];
const now = () => new Date().toLocaleString('vi-VN');
const genId = (prefix, counter) => prefix + String(counter).padStart('003', '0');

function nextId(type) {
  AppState.idCounters[type]++;
  return type + String(AppState.idCounters[type]).padStart(3,'0');
}

function showToast(msg, type='success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast ${type} show`;
  setTimeout(() => t.className = 'toast', 2800);
}

function addLog(action, module, detail) {
  AppState.logs.unshift({
    time: now(),
    user: AppState.currentUser?.username || '-',
    action, module, detail,
    ip: '192.168.x.x',
  });
  if (AppState.logs.length > 200) AppState.logs.pop();
}

// =============================================
//  GOOGLE APPS SCRIPT BRIDGE
// =============================================
async function callGAS(action, payload = {}) {
  if (DEMO_MODE) {
    console.log('[GAS-DEMO]', action, payload);
    return { ok: true };
  }
  try {
    const res = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...payload }),
    });
    return await res.json();
  } catch (e) {
    console.error('GAS Error:', e);
    return { ok: false, error: e.message };
  }
}

// =============================================
//  AUTH
// =============================================
function doLogin() {
  const u = document.getElementById('loginUser').value.trim();
  const p = document.getElementById('loginPass').value;
  const user = AppState.users.find(x => x.username === u && x.password === p && x.status === 'active');
  if (!user) {
    document.getElementById('loginError').style.display = 'block';
    document.getElementById('loginError').textContent = 'Tài khoản hoặc mật khẩu không đúng!';
    return;
  }
  AppState.currentUser = user;
  user.lastLogin = now();
  addLog('LOGIN', 'Hệ thống', 'Đăng nhập thành công');
  document.getElementById('loginPage').style.display = 'none';
  document.getElementById('mainApp').style.display = 'flex';
  document.getElementById('userDisplayName').textContent = user.fullname;
  document.getElementById('userAvatar').textContent = user.fullname[0];
  document.getElementById('userRole').textContent = roleLabel(user.role);
  initApp();
}

function doLogout() {
  addLog('LOGOUT', 'Hệ thống', 'Đăng xuất');
  AppState.currentUser = null;
  document.getElementById('mainApp').style.display = 'none';
  document.getElementById('loginPage').style.display = 'flex';
  document.getElementById('loginUser').value = '';
  document.getElementById('loginPass').value = '';
  document.getElementById('loginError').style.display = 'none';
}

function roleLabel(r) {
  const map = { admin:'Quản trị', ketoan:'Kế toán', kinhdoanh:'Kinh doanh', kho:'Kho', kythuat:'Kỹ thuật' };
  return map[r] || r;
}

// =============================================
//  NAVIGATION
// =============================================
const pageTitles = {
  dashboard:  'Tổng quan hệ thống',
  customers:  'Quản lý khách hàng',
  contracts:  'Quản lý hợp đồng',
  quotations: 'Báo giá nhanh tự động',
  inventory:  'Quản lý kho hàng',
  products:   'Danh mục sản phẩm',
  payments:   'Quản lý thanh toán',
  users:      'Quản lý người dùng',
  logs:       'Nhật ký hoạt động',
};

function showPage(name, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const pg = document.getElementById('page-' + name);
  if (pg) pg.classList.add('active');
  if (el) el.classList.add('active');
  document.getElementById('pageTitle').textContent = pageTitles[name] || name;
  // Close mobile sidebar
  document.getElementById('sidebar').classList.remove('mobile-open');
  // Render page data
  const renders = {
    dashboard:  renderDashboard,
    customers:  renderCustomers,
    contracts:  renderContracts,
    quotations: renderQuotations,
    inventory:  renderInventory,
    products:   renderProducts,
    payments:   renderPayments,
    users:      renderUsers,
    logs:       renderLogs,
  };
  if (renders[name]) renders[name]();
}

function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  const mc = document.querySelector('.main-content');
  if (window.innerWidth <= 768) {
    sb.classList.toggle('mobile-open');
  } else {
    sb.classList.toggle('collapsed');
    mc.classList.toggle('expanded');
  }
}

// =============================================
//  INIT
// =============================================
function initApp() {
  updateTopbarDate();
  setInterval(updateTopbarDate, 60000);
  showPage('dashboard', document.querySelector('.nav-item.active'));
  populateCustomerSelects();
  updateQuoteCalc();
}

function updateTopbarDate() {
  document.getElementById('topbarDate').textContent =
    new Date().toLocaleDateString('vi-VN', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
}

// =============================================
//  DASHBOARD
// =============================================
function renderDashboard() {
  const totalRevenue = AppState.contracts.reduce((s, c) => s + c.paid, 0);
  const totalDebt    = AppState.contracts.reduce((s, c) => s + (c.value - c.paid), 0);
  const activeContracts = AppState.contracts.filter(c => c.status === 'Đang thi công').length;

  document.getElementById('statRevenue').textContent  = fmtM(totalRevenue);
  document.getElementById('statContracts').textContent = activeContracts;
  document.getElementById('statDebt').textContent      = fmtM(totalDebt);
  document.getElementById('statInventory').textContent = AppState.inventory.length;

  renderRevenueChart();
  renderContractPie();
  renderTopProductChart();
  renderRecentContracts();
}

function renderRevenueChart() {
  const ctx = document.getElementById('revenueChart');
  if (!ctx) return;
  if (ctx._chart) ctx._chart.destroy();
  const months = ['T6','T7','T8','T9','T10','T11'];
  const data   = [1200, 1850, 2100, 1650, 2400, 2750];
  ctx._chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: months,
      datasets: [{
        label: 'Doanh thu (triệu)',
        data,
        backgroundColor: 'rgba(37,99,235,.75)',
        borderRadius: 6,
      },{
        label: 'Lợi nhuận (triệu)',
        data: data.map(v => Math.round(v * .22)),
        backgroundColor: 'rgba(249,115,22,.65)',
        borderRadius: 6,
      }]
    },
    options: { responsive:true, plugins:{ legend:{ labels:{ font:{ family:'DM Sans' } } } }, scales:{ y:{ grid:{ color:'rgba(0,0,0,.05)' } } } }
  });
}

function renderContractPie() {
  const ctx = document.getElementById('contractPieChart');
  if (!ctx) return;
  if (ctx._chart) ctx._chart.destroy();
  const statusCounts = {};
  AppState.contracts.forEach(c => { statusCounts[c.status] = (statusCounts[c.status]||0)+1; });
  ctx._chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(statusCounts),
      datasets: [{ data: Object.values(statusCounts), backgroundColor: ['#1a56db','#f97316','#16a34a','#dc2626','#8b5cf6'], borderWidth: 2, borderColor:'#fff' }]
    },
    options: { responsive:true, plugins:{ legend:{ position:'bottom', labels:{ font:{ family:'DM Sans', size:11 } } } }, cutout:'65%' }
  });
}

function renderTopProductChart() {
  const ctx = document.getElementById('topProductChart');
  if (!ctx) return;
  if (ctx._chart) ctx._chart.destroy();
  const labels = ['LONGi Hi-MO X6','Sungrow SG5RS','Sungrow SG10RS','Pylontech US5000','Khung nhôm'];
  const data   = [120, 45, 28, 15, 80];
  ctx._chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{ label: 'Số lượng bán', data, backgroundColor: 'rgba(249,115,22,.7)', borderRadius: 6 }]
    },
    options: { indexAxis:'y', responsive:true, plugins:{ legend:{ display:false } }, scales:{ x:{ grid:{ color:'rgba(0,0,0,.05)' } } } }
  });
}

function renderRecentContracts() {
  const rows = AppState.contracts.slice(0,5).map(c => `
    <tr>
      <td>${c.id}</td>
      <td>${c.customerName}</td>
      <td>${fmt(c.value)}</td>
      <td><span class="badge ${statusBadge(c.status)}">${c.status}</span></td>
    </tr>`).join('');
  document.getElementById('recentContracts').innerHTML = `
    <table class="mini-table">
      <thead><tr><th>Mã HĐ</th><th>Khách hàng</th><th>Giá trị</th><th>Trạng thái</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

// =============================================
//  CUSTOMERS
// =============================================
function renderCustomers(data) {
  data = data || AppState.customers;
  document.getElementById('customerBody').innerHTML = data.map(c => `
    <tr>
      <td><span class="badge badge-blue">${c.id}</span></td>
      <td><b>${c.name}</b></td>
      <td>${c.phone}</td>
      <td>${c.address}</td>
      <td>${c.type}</td>
      <td>${c.capacity} kWp</td>
      <td><span class="badge ${statusBadge(c.status)}">${c.status}</span></td>
      <td>
        <button class="btn-icon btn-icon-blue" title="Sửa" onclick="editCustomer('${c.id}')"><i class="fa fa-pen"></i></button>
        <button class="btn-icon btn-icon-orange" title="Báo giá" onclick="quickQuote('${c.id}')"><i class="fa fa-bolt"></i></button>
        <button class="btn-icon btn-icon-red" title="Xóa" onclick="deleteCustomer('${c.id}')"><i class="fa fa-trash"></i></button>
      </td>
    </tr>`).join('') || '<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:24px">Không có dữ liệu</td></tr>';
}

function filterCustomers() {
  const q  = document.getElementById('customerSearch').value.toLowerCase();
  const st = document.getElementById('customerStatusFilter').value;
  const tp = document.getElementById('customerTypeFilter').value;
  const filtered = AppState.customers.filter(c => {
    const match = !q || c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.address.toLowerCase().includes(q);
    const sMatch = !st || c.status === st;
    const tMatch = !tp || c.type === tp;
    return match && sMatch && tMatch;
  });
  renderCustomers(filtered);
}

function addCustomer() {
  const name = document.getElementById('cName').value.trim();
  const phone = document.getElementById('cPhone').value.trim();
  if (!name || !phone) { showToast('Vui lòng nhập Họ tên và SĐT', 'error'); return; }
  const cust = {
    id: nextId('KH'),
    name, phone,
    address:  document.getElementById('cAddress').value,
    email:    document.getElementById('cEmail').value,
    type:     document.getElementById('cType').value,
    capacity: parseFloat(document.getElementById('cCapacity').value) || 0,
    status:   document.getElementById('cStatus').value,
    note:     document.getElementById('cNote').value,
  };
  AppState.customers.push(cust);
  addLog('ADD_CUSTOMER', 'Khách hàng', `Thêm KH: ${name}`);
  callGAS('addCustomer', { data: cust });
  populateCustomerSelects();
  closeModal();
  renderCustomers();
  showToast(`Đã thêm khách hàng ${name}!`);
}

function deleteCustomer(id) {
  if (!confirm('Xóa khách hàng này?')) return;
  const idx = AppState.customers.findIndex(c => c.id === id);
  if (idx > -1) {
    addLog('DELETE_CUSTOMER', 'Khách hàng', `Xóa KH: ${AppState.customers[idx].name}`);
    AppState.customers.splice(idx, 1);
    callGAS('deleteCustomer', { id });
    renderCustomers();
    showToast('Đã xóa khách hàng!');
  }
}

function editCustomer(id) {
  const c = AppState.customers.find(x => x.id === id);
  if (!c) return;
  openModal('addCustomer');
  setTimeout(() => {
    document.getElementById('cName').value     = c.name;
    document.getElementById('cPhone').value    = c.phone;
    document.getElementById('cAddress').value  = c.address;
    document.getElementById('cEmail').value    = c.email;
    document.getElementById('cType').value     = c.type;
    document.getElementById('cCapacity').value = c.capacity;
    document.getElementById('cStatus').value   = c.status;
    document.getElementById('cNote').value     = c.note;
  }, 50);
}

function quickQuote(custId) {
  showPage('quotations', document.querySelector('[onclick*="quotations"]'));
  setTimeout(() => {
    document.getElementById('qCustomer').value = custId;
  }, 100);
}

// =============================================
//  CONTRACTS
// =============================================
function renderContracts() {
  renderKanban();
  document.getElementById('contractBody').innerHTML = AppState.contracts.map(c => {
    const debt = c.value - c.paid;
    const pct  = Math.round(c.paid / c.value * 100);
    return `<tr>
      <td><b>${c.id}</b></td>
      <td>${c.customerName}</td>
      <td>${c.signDate}</td>
      <td>${fmt(c.value)}</td>
      <td class="${pct>=50?'':''}"><span style="color:var(--green)">${fmt(c.paid)}</span></td>
      <td><span style="color:var(--red)">${fmt(debt)}</span></td>
      <td>
        <div style="display:flex;align-items:center;gap:6px">
          <div class="progress-wrap"><div class="progress-fill" style="width:${c.progress}%"></div></div>
          <span style="font-size:11px;color:var(--text-muted)">${c.progress}%</span>
        </div>
      </td>
      <td><span class="badge ${statusBadge(c.status)}">${c.status}</span></td>
      <td>
        <button class="btn-icon btn-icon-blue" onclick="editContract('${c.id}')"><i class="fa fa-pen"></i></button>
        <button class="btn-icon btn-icon-orange" onclick="updateProgress('${c.id}')"><i class="fa fa-percent"></i></button>
      </td>
    </tr>`;
  }).join('') || '<tr><td colspan="9" style="text-align:center;padding:24px;color:var(--text-muted)">Chưa có hợp đồng</td></tr>';
}

const KANBAN_STATUSES = ['Đã báo giá','Đang chốt','Đã ký hợp đồng','Đang thi công','Hoàn thành','Bảo hành'];

function renderKanban() {
  const board = document.getElementById('kanbanBoard');
  board.innerHTML = KANBAN_STATUSES.map(status => {
    const cards = AppState.contracts.filter(c => c.status === status);
    const cardHtml = cards.map(c => `
      <div class="kanban-card">
        <div class="kanban-card-name">${c.customerName}</div>
        <div class="kanban-card-val">${fmtM(c.value)}</div>
        <div style="font-size:10px;color:var(--text-muted);margin-top:3px">${c.id} • ${c.signDate}</div>
      </div>`).join('');
    return `<div class="kanban-col">
      <div class="kanban-col-title">${status} <span class="kanban-badge">${cards.length}</span></div>
      ${cardHtml || '<div style="font-size:11px;color:var(--text-muted);text-align:center;padding:12px">Trống</div>'}
    </div>`;
  }).join('');
}

function addContract() {
  const custId = document.getElementById('ctCustomer').value;
  const cust   = AppState.customers.find(c => c.id === custId);
  if (!custId) { showToast('Chọn khách hàng!', 'error'); return; }
  const value   = parseFloat(document.getElementById('ctValue').value) || 0;
  const deposit = parseFloat(document.getElementById('ctDeposit').value) || 0;
  const ct = {
    id: nextId('HD'),
    customerId: custId,
    customerName: cust?.name || custId,
    signDate:  document.getElementById('ctDate').value || today(),
    value, paid: deposit,
    status:   document.getElementById('ctStatus').value,
    progress: parseInt(document.getElementById('ctProgress').value) || 0,
    note:     document.getElementById('ctNote').value,
  };
  AppState.contracts.push(ct);
  addLog('ADD_CONTRACT', 'Hợp đồng', `Tạo HĐ: ${ct.id} - ${ct.customerName}`);
  callGAS('addContract', { data: ct });
  closeModal();
  renderContracts();
  showToast(`Đã tạo hợp đồng ${ct.id}!`);
}

function updateProgress(id) {
  const pct = prompt('Nhập tiến độ (%):');
  if (pct === null) return;
  const ct = AppState.contracts.find(c => c.id === id);
  if (ct) { ct.progress = Math.min(100, Math.max(0, parseInt(pct)||0)); renderContracts(); showToast('Đã cập nhật tiến độ!'); }
}

// =============================================
//  QUOTATION BUILDER
// =============================================
const QuoteDB = {
  panels: {
    longi:    { name:'LONGi Hi-MO X6 550W',       spec:'550W, Mono PERC, Hiệu suất 21.2%', price:3200000 },
    jinko:    { name:'Jinko Tiger Neo 580W',        spec:'580W, N-Type, Hiệu suất 22.1%',    price:3050000 },
    canadian: { name:'Canadian Solar 400W',          spec:'400W, Mono, Hiệu suất 19.8%',      price:2400000 },
  },
  inverters: {
    sungrow5:  { name:'Sungrow SG5RS 5kW',          spec:'5kW, 1 phase, Wi-Fi, MPPT x2', price:10500000 },
    sungrow10: { name:'Sungrow SG10RS 10kW',         spec:'10kW, 3 phase, Wi-Fi, MPPT x3',price:17000000 },
    huawei5:   { name:'Huawei SUN2000-5KTL 5kW',    spec:'5kW, AI Smart, MPPT x2',       price:11500000 },
    growatt:   { name:'Growatt MID 10KTL3-X 10kW',  spec:'10kW, 3 phase, MPPT x3',       price:14500000 },
    goodwe:    { name:'GoodWe GW5000D-NS 5kW',      spec:'5kW, MPPT x2, On-grid',         price:9500000  },
  },
  batteries: {
    none:        null,
    pylontech5:  { name:'Pylontech US5000 5kWh',  spec:'5kWh LiFePO4, 6000 chu kỳ', price:27000000 },
    pylontech10: { name:'Pylontech US5000 10kWh', spec:'10kWh LiFePO4, 6000 chu kỳ',price:48000000 },
    byd:         { name:'BYD Battery-Box 10kWh',  spec:'10kWh, HV, 6000 chu kỳ',    price:46000000 },
  },
  systemTypes: { hoaluo:'Hòa lưới (Grid-tie)', hybrid:'Hybrid', offgrid:'Độc lập (Off-grid)' },
};

function updateQuoteCalc() {
  const systemType = document.getElementById('qSystemType').value;
  const panels     = parseInt(document.getElementById('qPanels').value) || 0;
  const panelKey   = document.getElementById('qPanelModel').value;
  const invKey     = document.getElementById('qInverter').value;
  const batKey     = document.getElementById('qBattery').value;
  const installPct = parseFloat(document.getElementById('qInstall').value) || 15;

  const panelData  = QuoteDB.panels[panelKey];
  const invData    = QuoteDB.inverters[invKey];
  const batData    = QuoteDB.batteries[batKey];

  const panelTotal = panelData ? panelData.price * panels : 0;
  const invTotal   = invData   ? invData.price            : 0;
  const batTotal   = batData   ? batData.price            : 0;
  const equipTotal = panelTotal + invTotal + batTotal;
  const installFee = Math.round(equipTotal * installPct / 100);
  const subTotal   = equipTotal + installFee;
  const vat        = Math.round(subTotal * 0.08);
  const grandTotal = subTotal + vat;

  // Build frame kit estimate
  const frameTotal = Math.round(panels * 1800000);

  const preview = document.getElementById('quotePreview');
  const today2  = new Date().toLocaleDateString('vi-VN');
  const quoteId = 'BG-' + Date.now().toString().slice(-6);

  const batteryRow = batData ? `<tr><td>3</td><td>${batData.name}</td><td>${batData.spec}</td><td>1 Bộ</td><td>${fmt(batData.price)}</td><td>${fmt(batData.price)}</td></tr>` : '';
  const rowNum = batData ? 4 : 3;

  preview.innerHTML = `
    <div class="qp-header">
      <div class="qp-company">⚡ HT SOLAR</div>
      <div class="qp-title">BÁO GIÁ HỆ THỐNG ĐIỆN MẶT TRỜI</div>
      <div class="qp-meta">${QuoteDB.systemTypes[systemType]} | Mã: ${quoteId} | Ngày: ${today2}</div>
    </div>
    <hr style="border:none;border-top:2px solid var(--orange);margin:8px 0"/>
    <table class="qp-table">
      <thead><tr><th>#</th><th>Thiết bị</th><th>Thông số</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th></tr></thead>
      <tbody>
        <tr><td>1</td><td>${panelData?.name||'--'}</td><td>${panelData?.spec||'--'}</td><td>${panels} Tấm</td><td>${fmt(panelData?.price||0)}</td><td>${fmt(panelTotal)}</td></tr>
        <tr><td>2</td><td>${invData?.name||'--'}</td><td>${invData?.spec||'--'}</td><td>1 Bộ</td><td>${fmt(invData?.price||0)}</td><td>${fmt(invTotal)}</td></tr>
        ${batteryRow}
        <tr><td>${batData?4:3}</td><td>Khung giá đỡ & phụ kiện</td><td>Nhôm chống ăn mòn, dây cáp DC</td><td>${panels} Bộ</td><td>${fmt(1800000)}</td><td>${fmt(frameTotal)}</td></tr>
        <tr><td>${batData?5:4}</td><td>Chi phí thi công & lắp đặt</td><td>Nhân công, thiết bị đo kiểm</td><td>1</td><td>-</td><td>${fmt(installFee)}</td></tr>
      </tbody>
    </table>
    <div class="qp-total">
      <div class="qp-total-row">Cộng thiết bị: <b>${fmt(equipTotal + frameTotal)}</b></div>
      <div class="qp-total-row">Chi phí thi công (${installPct}%): <b>${fmt(installFee)}</b></div>
      <div class="qp-total-row">VAT 8%: <b>${fmt(vat)}</b></div>
      <div class="qp-total-final">TỔNG CỘNG: ${fmt(grandTotal)}</div>
    </div>
    <div style="margin-top:10px;font-size:10px;color:var(--text-muted)">
      ✅ Bảo hành tấm pin 25 năm | ✅ Bảo hành Inverter 10 năm | ✅ Bảo hành thi công 12 tháng
    </div>`;

  // Store for saving
  preview._data = { systemType, panels, panelKey, invKey, batKey, grandTotal, quoteId };
}

function generateQuotePDF() {
  showToast('Đang xuất PDF... (Demo: mở print dialog)', 'info');
  addLog('EXPORT_QUOTATION', 'Báo giá', 'Xuất PDF báo giá');
  // In production: callGAS('generatePDF', { quoteData: {...} })
  setTimeout(() => window.print(), 500);
}

function sendQuoteEmail() {
  const custId = document.getElementById('qCustomer').value;
  const cust   = AppState.customers.find(c => c.id === custId);
  if (!cust) { showToast('Chọn khách hàng trước khi gửi email!', 'error'); return; }
  showToast(`Đang gửi email tới ${cust.email || cust.name}...`, 'info');
  addLog('SEND_EMAIL', 'Báo giá', `Gửi email báo giá tới ${cust.name}`);
  // In production: callGAS('sendEmail', { email: cust.email, quoteData: {...} })
  setTimeout(() => showToast('Đã gửi email báo giá!'), 1500);
}

function saveQuote() {
  const preview = document.getElementById('quotePreview');
  const d = preview._data;
  if (!d) { showToast('Hãy cập nhật thông tin báo giá trước!', 'error'); return; }
  const custId = document.getElementById('qCustomer').value;
  const cust   = AppState.customers.find(c => c.id === custId);
  const q = {
    id: nextId('BG'),
    customerId:   custId || '',
    customerName: cust?.name || 'Khách lẻ',
    system:       QuoteDB.systemTypes[d.systemType],
    capacity:     document.getElementById('qCapacity').value + ' kWp',
    total:        d.grandTotal,
    createdAt:    today(),
    status:       'Đã lưu',
    driveUrl:     '#',
  };
  AppState.quotations.unshift(q);
  addLog('SAVE_QUOTATION', 'Báo giá', `Lưu báo giá ${q.id}`);
  callGAS('saveQuotation', { data: q });
  renderQuoteHistory();
  showToast(`Đã lưu báo giá ${q.id}!`);
}

function renderQuotations() {
  updateQuoteCalc();
  renderQuoteHistory();
  populateCustomerSelects();
}

function renderQuoteHistory() {
  document.getElementById('quoteHistory').innerHTML = AppState.quotations.map(q => `
    <tr>
      <td><b>${q.id}</b></td>
      <td>${q.customerName}</td>
      <td>${q.system}</td>
      <td style="color:var(--orange);font-weight:700">${fmt(q.total)}</td>
      <td>${q.createdAt}</td>
      <td><span class="badge badge-blue">${q.status}</span></td>
      <td><a href="${q.driveUrl}" target="_blank" style="color:var(--blue)"><i class="fa fa-file-pdf"></i> Tải</a></td>
    </tr>`).join('');
}

// =============================================
//  INVENTORY
// =============================================
function renderInventory(data) {
  data = data || AppState.inventory;
  // Alerts
  const alerts = AppState.inventory.filter(i => i.qty <= i.minQty);
  const alertBar = document.getElementById('stockAlerts');
  alertBar.innerHTML = alerts.map(i => `
    <div class="alert-item ${i.qty === 0 ? 'alert-error':'alert-warn'}">
      <i class="fa fa-${i.qty===0?'circle-xmark':'triangle-exclamation'}"></i>
      <b>${i.productName}</b>: Tồn kho ${i.qty} ${i.qty===0?'— HẾT HÀNG':'— Sắp hết'} (tối thiểu ${i.minQty})
    </div>`).join('');

  // Summary
  const panels   = AppState.inventory.filter(i=>i.category==='Tấm pin').reduce((s,i)=>s+i.qty,0);
  const inverters= AppState.inventory.filter(i=>i.category==='Inverter').reduce((s,i)=>s+i.qty,0);
  const batteries= AppState.inventory.filter(i=>i.category==='Pin lưu trữ').reduce((s,i)=>s+i.qty,0);
  document.getElementById('invPanel').textContent   = panels + ' tấm';
  document.getElementById('invInverter').textContent= inverters + ' bộ';
  document.getElementById('invBattery').textContent = batteries + ' bộ';

  // Table
  document.getElementById('inventoryBody').innerHTML = data.map(i => {
    const lowStock = i.qty <= i.minQty;
    const badge = i.qty === 0 ? 'badge-red' : lowStock ? 'badge-orange' : 'badge-green';
    const label = i.qty === 0 ? 'Hết hàng' : lowStock ? 'Sắp hết' : 'Còn hàng';
    return `<tr>
      <td><b>${i.productId}</b></td>
      <td>${i.productName}</td>
      <td>${i.category}</td>
      <td>${AppState.products.find(p=>p.id===i.productId)?.brand||'-'}</td>
      <td>${AppState.products.find(p=>p.id===i.productId)?.unit||'-'}</td>
      <td style="font-weight:700;${i.qty<=i.minQty?'color:var(--red)':''}">${i.qty}</td>
      <td>${fmt(i.avgCost)}</td>
      <td>${fmt(AppState.products.find(p=>p.id===i.productId)?.sellPrice||0)}</td>
      <td><span class="badge ${badge}">${label}</span></td>
      <td>
        <button class="btn-icon btn-icon-blue" onclick="openModal('importStock')"><i class="fa fa-arrow-down"></i></button>
      </td>
    </tr>`;
  }).join('');
}

function filterInventory() {
  const q   = document.getElementById('inventorySearch').value.toLowerCase();
  const cat = document.getElementById('inventoryCatFilter').value;
  const filtered = AppState.inventory.filter(i =>
    (!q || i.productName.toLowerCase().includes(q)) &&
    (!cat || i.category === cat)
  );
  renderInventory(filtered);
}

function importStock() {
  const prodId = document.getElementById('isProduct').value;
  const qty    = parseInt(document.getElementById('isQty').value) || 0;
  if (!prodId || qty <= 0) { showToast('Chọn sản phẩm và số lượng!', 'error'); return; }
  const inv = AppState.inventory.find(i => i.productId === prodId);
  if (inv) {
    const newPrice = parseFloat(document.getElementById('isPrice').value) || inv.avgCost;
    inv.avgCost = Math.round((inv.avgCost * inv.qty + newPrice * qty) / (inv.qty + qty));
    inv.qty += qty;
  }
  const prod = AppState.products.find(p => p.id === prodId);
  addLog('IMPORT_STOCK', 'Kho', `Nhập ${qty} ${prod?.name}`);
  callGAS('importStock', { productId: prodId, qty });
  closeModal();
  renderInventory();
  showToast(`Đã nhập ${qty} đơn vị vào kho!`);
}

// =============================================
//  PRODUCTS
// =============================================
function renderProducts() {
  document.getElementById('productBody').innerHTML = AppState.products.map(p => `
    <tr>
      <td><b>${p.id}</b></td>
      <td>${p.name}</td>
      <td>${p.model}</td>
      <td>${p.brand}</td>
      <td><span class="badge badge-blue">${p.category}</span></td>
      <td>${p.unit}</td>
      <td>${fmt(p.buyPrice)}</td>
      <td>${fmt(p.sellPrice)}</td>
      <td>
        <button class="btn-icon btn-icon-blue" onclick=""><i class="fa fa-pen"></i></button>
        <button class="btn-icon btn-icon-red" onclick="deleteProduct('${p.id}')"><i class="fa fa-trash"></i></button>
      </td>
    </tr>`).join('');
}

function addProduct() {
  const name = document.getElementById('pName').value.trim();
  if (!name) { showToast('Nhập tên sản phẩm!', 'error'); return; }
  const prod = {
    id: nextId('SP'),
    name, model: document.getElementById('pModel').value,
    brand:     document.getElementById('pBrand').value,
    category:  document.getElementById('pCategory').value,
    unit:      document.getElementById('pUnit').value,
    buyPrice:  parseFloat(document.getElementById('pBuyPrice').value)  || 0,
    sellPrice: parseFloat(document.getElementById('pSellPrice').value) || 0,
  };
  AppState.products.push(prod);
  AppState.inventory.push({ productId:prod.id, productName:prod.name, category:prod.category, qty:0, avgCost:prod.buyPrice, minQty:5 });
  addLog('ADD_PRODUCT', 'Sản phẩm', `Thêm SP: ${name}`);
  callGAS('addProduct', { data: prod });
  populateStockProductSelect();
  closeModal();
  renderProducts();
  showToast(`Đã thêm sản phẩm ${name}!`);
}

function deleteProduct(id) {
  if (!confirm('Xóa sản phẩm này?')) return;
  AppState.products = AppState.products.filter(p => p.id !== id);
  renderProducts();
  showToast('Đã xóa sản phẩm!');
}

// =============================================
//  PAYMENTS
// =============================================
function renderPayments() {
  document.getElementById('paymentBody').innerHTML = AppState.payments.map(p => `
    <tr>
      <td><b>${p.id}</b></td>
      <td>${p.contractId}</td>
      <td>${p.customerName}</td>
      <td style="color:var(--green);font-weight:700">${fmt(p.amount)}</td>
      <td>${p.date}</td>
      <td>${p.method}</td>
      <td>${p.note}</td>
    </tr>`).join('');
}

function addPayment() {
  const ctId   = document.getElementById('pmContract').value;
  const amount = parseFloat(document.getElementById('pmAmount').value) || 0;
  if (!ctId || amount <= 0) { showToast('Chọn hợp đồng và nhập số tiền!', 'error'); return; }
  const ct = AppState.contracts.find(c => c.id === ctId);
  if (ct) ct.paid = Math.min(ct.value, ct.paid + amount);
  const pay = {
    id: nextId('TT'),
    contractId: ctId,
    customerName: ct?.customerName || '',
    amount,
    date:   document.getElementById('pmDate').value || today(),
    method: document.getElementById('pmMethod').value,
    note:   document.getElementById('pmNote').value,
  };
  AppState.payments.push(pay);
  addLog('ADD_PAYMENT', 'Thanh toán', `Ghi nhận ${fmt(amount)} HĐ ${ctId}`);
  callGAS('addPayment', { data: pay });
  closeModal();
  renderPayments();
  showToast(`Đã ghi nhận thanh toán ${fmt(amount)}!`);
}

// =============================================
//  USERS
// =============================================
function renderUsers() {
  document.getElementById('userBody').innerHTML = AppState.users.map(u => `
    <tr>
      <td><b>${u.username}</b></td>
      <td>${u.fullname}</td>
      <td>${u.email||'-'}</td>
      <td><span class="badge ${roleBadge(u.role)}">${roleLabel(u.role)}</span></td>
      <td><span class="badge ${u.status==='active'?'badge-green':'badge-red'}">${u.status==='active'?'Hoạt động':'Khóa'}</span></td>
      <td>${u.lastLogin||'-'}</td>
      <td>
        <button class="btn-icon btn-icon-blue"><i class="fa fa-pen"></i></button>
        <button class="btn-icon btn-icon-red" onclick="deleteUser('${u.id}')"><i class="fa fa-trash"></i></button>
      </td>
    </tr>`).join('');
}

function addUser() {
  const username = document.getElementById('uUsername').value.trim();
  const fullname = document.getElementById('uFullname').value.trim();
  const password = document.getElementById('uPassword').value;
  if (!username || !fullname || !password) { showToast('Điền đầy đủ thông tin!', 'error'); return; }
  if (AppState.users.find(u => u.username === username)) { showToast('Tên đăng nhập đã tồn tại!', 'error'); return; }
  const user = {
    id: nextId('U'),
    username, fullname, password,
    email:  document.getElementById('uEmail').value,
    role:   document.getElementById('uRole').value,
    status: 'active', lastLogin: '',
  };
  AppState.users.push(user);
  addLog('ADD_USER', 'Người dùng', `Thêm user: ${username}`);
  callGAS('addUser', { data: { ...user, password:'[ENCRYPTED]' } });
  closeModal();
  renderUsers();
  showToast(`Đã tạo tài khoản ${username}!`);
}

function deleteUser(id) {
  if (AppState.currentUser?.id === id) { showToast('Không thể xóa tài khoản đang đăng nhập!', 'error'); return; }
  if (!confirm('Xóa người dùng này?')) return;
  AppState.users = AppState.users.filter(u => u.id !== id);
  renderUsers();
  showToast('Đã xóa người dùng!');
}

// =============================================
//  LOGS
// =============================================
function renderLogs() {
  document.getElementById('logBody').innerHTML = AppState.logs.map(l => `
    <tr>
      <td style="font-size:11px;white-space:nowrap">${l.time}</td>
      <td><b>${l.user}</b></td>
      <td><span class="badge badge-blue">${l.action}</span></td>
      <td>${l.module}</td>
      <td style="color:var(--text-muted)">${l.detail}</td>
      <td style="font-size:11px">${l.ip}</td>
    </tr>`).join('');
}

// =============================================
//  HELPERS — BADGE COLORS
// =============================================
function statusBadge(s) {
  const map = {
    'Khách mới':'badge-gray','Đã báo giá':'badge-blue','Đang chốt':'badge-orange',
    'Đã ký HĐ':'badge-blue','Đã ký hợp đồng':'badge-blue',
    'Đang thi công':'badge-orange','Hoàn thành':'badge-green','Bảo hành':'badge-gray',
  };
  return map[s] || 'badge-gray';
}
function roleBadge(r) {
  const map = { admin:'badge-red', ketoan:'badge-blue', kinhdoanh:'badge-orange', kho:'badge-green', kythuat:'badge-gray' };
  return map[r] || 'badge-gray';
}

// =============================================
//  MODAL MANAGEMENT
// =============================================
function openModal(name) {
  const overlay = document.getElementById('modalOverlay');
  document.querySelectorAll('.modal').forEach(m => { m.style.display='none'; m.classList.remove('visible'); });
  const modal = document.getElementById('modal-' + name);
  if (modal) { modal.style.display='block'; setTimeout(()=>modal.classList.add('visible'),10); }
  overlay.classList.add('open');

  // Special pre-fills
  if (name === 'importStock') populateStockProductSelect();
  if (name === 'addContract' || name === 'addPayment') populateContractSelect();
}

function closeModal(e) {
  if (e && e.target !== document.getElementById('modalOverlay')) return;
  document.getElementById('modalOverlay').classList.remove('open');
  document.querySelectorAll('.modal').forEach(m => { m.style.display='none'; m.classList.remove('visible'); });
}

// =============================================
//  POPULATE SELECTS
// =============================================
function populateCustomerSelects() {
  const opts = AppState.customers.map(c => `<option value="${c.id}">${c.name} (${c.id})</option>`).join('');
  ['ctCustomer','qCustomer'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      const first = el.options[0]?.text || '';
      el.innerHTML = `<option value="">${first}</option>` + opts;
    }
  });
}

function populateStockProductSelect() {
  const el = document.getElementById('isProduct');
  if (!el) return;
  el.innerHTML = AppState.products.map(p => `<option value="${p.id}">${p.name} (${p.id})</option>`).join('');
}

function populateContractSelect() {
  const el = document.getElementById('pmContract');
  if (el) {
    el.innerHTML = AppState.contracts.map(c => `<option value="${c.id}">${c.id} — ${c.customerName}</option>`).join('');
  }
}

// =============================================
//  KEYBOARD SHORTCUT: Enter to login
// =============================================
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && document.getElementById('loginPage').style.display !== 'none') doLogin();
  if (e.key === 'Escape') closeModal();
});
