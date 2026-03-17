/**
 * @file dictionary.js
 * @description Centralized string management (i18n) for the entire application.
 */

export const dict = {
  id: {
    // --- GENERAL ---
    loading: "Loading bentar...",
    copied: "Disalin ke clipboard!",
    sisa: "Sisa",
    warning_note: "⚠️ CATATAN:",

    // --- DASHBOARD ---
    dash_title: "Menu Utama",
    dash_subtitle: "Pilih modul",
    dash_closing: "Pembukuan & Laporan",
    dash_closing_sub: "Input sales, inventori, dan gramasi.",
    dash_history: "Riwayat Laporan",
    dash_history_sub: "Lihat laporan yang sudah disubmit.",
    dash_admin: "Admin Panel",
    dash_admin_sub: "Kelola master data dan staff.",

    // --- APP HEADER ---
    app_title: "DailyEase",
    app_subtitle: "Closing ga harus ribet ;)",
    select_outlet: "-- Pilih Outlet --",
    select_prompt: "Pilih outlet di atas untuk mulai pembukuan.",
    outlet_name: "Nama Outlet",
    date_label: "Tanggal Laporan",

    // --- ACCORDION TITLES ---
    financial_title: "💰 Sales Report Closing",
    category_title: "📊 Sales Report Produk",
    ingredients_title: "🥛 Filling",
    frozen_book: "❄️ Buku Frozen",
    display_book: "🏪 Buku Display",
    live_display_title: "🏪 Sisa Display",
    live_frozen_title: "❄️ Sisa Frozen",
    gramasi_title: "⚖️ Pemakaian Bahan (Gramasi)",

    // --- REVIEW SCREEN ---
    review_title: "Review & Share",
    review_subtitle: "Salin atau bagikan langsung ke WhatsApp.",
    report_1: "Sales Closing",
    report_2: "Penjualan Produk",
    report_3_cinere: "Sisa Produk",
    report_3_normal: "Frozen & Display",

    // --- BUTTONS ---
    btn_review: "Review & Bagikan",
    btn_submit_db: "Submit",
    btn_back: "← Kembali",
    btn_copy: "📋 Copy",
    btn_wa: "💬 WA",
    btn_add: "Tambah",
    btn_save: "Simpan",
    btn_cancel: "Batal",
    btn_edit: "Edit",
    btn_delete: "Hapus",

    // --- INPUT LABELS ---
    start: "Start",
    in: "In",
    out: "Out",
    sold: "Sold",
    waste: "Waste",
    shaping: "Shaping",
    expense_notes: "Catatan Pengeluaran",
    expense_placeholder: "cth., Beli Plastik",
    total_revenue: "Total Pendapatan:",

    // --- ALERTS ---
    shaping_deducted: "dikurangi untuk shaping",

    // --- ADMIN PANEL GENERAL ---
    admin_access_denied: "Akses Ditolak.",
    admin_master_panel: "Master Control Panel",
    tab_products: "Produk",
    tab_ingredients: "Bahan & Isian",
    tab_bundlings: "Bundling & Hampers",
    tab_outlets: "Outlet",
    tab_categories: "Kategori",
    tab_users: "Staff",

    // Admin Ingredients
    ing_title_add: "➕ Tambah Bahan Baru",
    ing_title_edit: "✏️ Edit Bahan",
    ing_subtitle: "Kelola bahan baku dan isian.",
    ing_name: "Nama Bahan",
    ing_name_ph: "cth., Keju Cheddar",
    ing_unit: "Satuan",
    ing_unit_ph: "cth., Gram, Pcs",
    ing_sort: "Urutan",
    ing_empty: "Belum ada bahan yang ditambahkan.",
    ing_alert_add: "Bahan berhasil ditambahkan!",
    ing_alert_update: "Bahan berhasil diperbarui!",
    ing_alert_delete: "Hapus bahan ini permanen?",

    // Admin Products
    prod_title: "Kelola Produk",
    prod_subtitle: "Lihat, Edit, Nonaktifkan, atau Hapus produk.",
    prod_col_name: "Nama",
    prod_col_cat: "Kategori",
    prod_col_status: "Status",
    prod_col_actions: "Aksi",
    prod_active: "Aktif",
    prod_disabled: "Nonaktif",
    prod_add_new: "➕ Tambah Produk Baru",
    prod_editing: "✏️ Mengedit:",
    prod_name: "Nama Produk",
    prod_cat: "Kategori",
    prod_sort: "Urutan",
    prod_notes: "Catatan Produksi",
    prod_is_base: "Ini ADALAH Produk Base",
    prod_deducts_from: "Mengurangi Stok Dari:",
    prod_recipe_title: "Resep Gramasi",
    prod_recipe_sub: "Bahan yang digunakan per 1 unit produksi",
    prod_add_ing: "+ Tambah Bahan",
    prod_btn_update: "Update Produk",
    prod_btn_save: "Simpan Produk Baru",

    // Admin Outlets
    out_title_1: "Kelola Outlet",
    out_sub_1: "Buat, nonaktifkan, atau hapus lokasi cabang.",
    out_name: "Nama Outlet",
    out_name_ph: "cth., RS Puri Cinere",
    out_type: "Tipe Outlet",
    out_type_fresh: "Fresh Bake",
    out_type_frozen: "Frozen Goods",
    out_btn_add: "Tambah Outlet",
    out_active: "🟢 Aktif",
    out_disabled: "🔴 Nonaktif",
    out_title_2: "Konfigurasi Outlet",
    out_sub_2: "Pilih outlet untuk mengatur menu.",
    out_select: "Pilih Outlet untuk Dikonfigurasi",
    out_avail_prods: "Produk Tersedia",
    out_avail_desc:
      "Centang produk yang dijual di outlet ini. Produk yang tidak dicentang akan disembunyikan dari aplikasi closing.",

    // Admin Categories
    cat_title_add: "➕ Tambah Kategori Baru",
    cat_title_edit: "✏️ Edit Kategori",
    cat_subtitle: "Kelola kategori produk (cth., Pastry, Bread).",
    cat_name: "Nama Kategori",
    cat_name_ph: "cth., Viennoiserie",
    cat_sort: "Urutan",
    cat_empty: "Belum ada kategori yang ditambahkan.",
    cat_alert_add: "Kategori berhasil ditambahkan!",
    cat_alert_update: "Kategori berhasil diperbarui!",
    cat_alert_delete: "Hapus kategori ini permanen?",

    // Admin Users (Staff)
    user_title: "Kelola Akses Staff",
    user_subtitle: "Tambahkan kasir, baker, atau supervisor baru.",
    user_name: "Username",
    user_name_ph: "cth., twcbr",
    user_pin: "PIN (Untuk Login)",
    user_pin_ph: "cth., 123456",
    user_role: "Role Akses",
    user_role_baker: "Baker / Kasir",
    user_role_spv: "Supervisor",
    user_role_admin: "Admin (Akses Penuh)",
    user_outlet: "Penempatan Outlet",
    user_empty: "Belum ada user terdaftar.",
    user_alert_add: "User berhasil ditambahkan!",
    user_alert_delete: "Hapus user ini permanen?",

    // Admin Bundlings
    bndl_title_add: "➕ Tambah Bundling/Hampers Baru",
    bndl_title_edit: "✏️ Edit Bundling/Hampers",
    bndl_subtitle: "Kelola paket promo dan hampers.",
    bndl_name: "Nama Bundling",
    bndl_name_ph: "cth., Hampers Idul Fitri",
    bndl_price: "Harga Total",
    bndl_status: "Status Aktif",
    bndl_items_title: "Isi Bundling",
    bndl_items_sub: "Produk apa saja yang ada di dalam paket ini?",
    bndl_add_item: "+ Tambah Produk",
    bndl_qty: "Qty",
    bndl_empty: "Belum ada bundling yang ditambahkan.",
    bndl_alert_add: "Bundling berhasil ditambahkan!",
    bndl_alert_update: "Bundling berhasil diperbarui!",
    bndl_alert_delete: "Hapus bundling ini permanen?",
    // --- FILTERS ---
    filter_today: "Hari Ini",
    filter_week: "Minggu Ini",
    filter_month: "Bulan Ini",
    filter_custom: "Kustom",
    filter_apply: "Terapkan Filter",
    filter_start: "Dari Tanggal",
    filter_end: "Sampai Tanggal",
    filter_no_data: "Tidak ada laporan ditemukan.",
  },
  en: {
    // --- GENERAL ---
    loading: "Loading for a second...",
    copied: "Copied to clipboard!",
    sisa: "Leftover",
    warning_note: "⚠️ NOTE:",

    // --- DASHBOARD ---
    dash_title: "Main Menu",
    dash_subtitle: "Select a module to access.",
    dash_closing: "📝 Daily Closing",
    dash_closing_sub: "Input sales, inventory, and raw materials.",
    dash_history: "🕰️ Report History",
    dash_history_sub: "View previously submitted reports.",
    dash_admin: "⚙️ Admin Panel",
    dash_admin_sub: "Manage master data and staff.",

    // --- APP HEADER ---
    app_title: "DailyEase Shift",
    app_subtitle: "Closing shouldn't be a hassle ;)",
    select_outlet: "-- Select Outlet --",
    select_prompt: "Select an outlet above to begin closing.",
    date_label: "Report Date",

    // --- ACCORDION TITLES ---
    financial_title: "💰 Total Sales by Payment",
    category_title: "📊 Sales by Category",
    ingredients_title: "🥛 Ingredients Inventory",
    frozen_book: "❄️ Frozen Book",
    display_book: "🏪 Display Book",
    live_display_title: "🏪 Live Display Leftover Summary",
    live_frozen_title: "❄️ Live Frozen Leftover Summary",
    gramasi_title: "⚖️ Calculated Gramasi (Raw Material Usage)",

    // --- REVIEW SCREEN ---
    review_title: "Review & Share",
    review_subtitle: "Copy or share directly to WhatsApp.",
    report_1: "Sales Report",
    report_2: "Product Sales Amount",
    report_3_cinere: "Product Leftovers",
    report_3_normal: "Frozen & Display",

    // --- BUTTONS ---
    btn_review: "Review & Share WA",
    btn_submit_db: "🚀 Submit Report to Database",
    btn_back: "← Go Back",
    btn_copy: "📋 Copy",
    btn_wa: "💬 WA",
    btn_add: "Add",
    btn_save: "Save",
    btn_cancel: "Cancel",
    btn_edit: "Edit",
    btn_delete: "Delete",

    // --- INPUT LABELS ---
    start: "Start",
    in: "In",
    out: "Out",
    sold: "Sold",
    waste: "Waste",
    shaping: "Shaping",
    expenses: "Pengeluaran",
    expense_notes: "Expense Notes",
    expense_placeholder: "e.g., Bought Plastic Bags",
    total_revenue: "Total Revenue:",

    // --- ALERTS ---
    shaping_deducted: "deducted for specialty shaping",

    // --- ADMIN PANEL GENERAL ---
    admin_access_denied: "Access Denied.",
    admin_master_panel: "Master Control Panel",
    tab_products: "Products",
    tab_ingredients: "Ingredients",
    tab_bundlings: "Bundlings & Hampers",
    tab_outlets: "Outlets",
    tab_categories: "Categories",
    tab_users: "Staff",

    // Admin Ingredients
    ing_title_add: "➕ Add New Ingredient",
    ing_title_edit: "✏️ Edit Ingredient",
    ing_subtitle: "Manage raw materials and fillings.",
    ing_name: "Ingredient Name",
    ing_name_ph: "e.g., Cheddar Cheese",
    ing_unit: "Unit",
    ing_unit_ph: "e.g., Gram, Pcs",
    ing_sort: "Sort Order",
    ing_empty: "No ingredients added yet.",
    ing_alert_add: "Ingredient added!",
    ing_alert_update: "Ingredient updated!",
    ing_alert_delete: "Delete this permanently?",

    // Admin Products
    prod_title: "Manage Existing Products",
    prod_subtitle: "View, Edit, Disable, or Delete products.",
    prod_col_name: "Name",
    prod_col_cat: "Category",
    prod_col_status: "Status",
    prod_col_actions: "Actions",
    prod_active: "Active",
    prod_disabled: "Disabled",
    prod_add_new: "➕ Add New Product",
    prod_editing: "✏️ Editing:",
    prod_name: "Product Name",
    prod_cat: "Category",
    prod_sort: "Sort Order",
    prod_notes: "Production Notes",
    prod_is_base: "This IS a Base Product (Dough Source)",
    prod_deducts_from: "Deducts Stock From:",
    prod_recipe_title: "Gramasi Recipe",
    prod_recipe_sub: "Ingredients per 1 unit produced",
    prod_add_ing: "+ Add Ingredient",
    prod_btn_update: "Update Product",
    prod_btn_save: "Save New Product",

    // Admin Outlets
    out_title_1: "Manage Outlets",
    out_sub_1: "Create, disable, or delete branch locations.",
    out_name: "Outlet Name",
    out_name_ph: "e.g., RS Puri Cinere",
    out_type: "Outlet Type",
    out_type_fresh: "Fresh Bake (Shapes Dough)",
    out_type_frozen: "Frozen Goods (Reheat Only)",
    out_btn_add: "Add Outlet",
    out_active: "🟢 Active",
    out_disabled: "🔴 Disabled",
    out_title_2: "Outlet Configurations",
    out_sub_2: "Select an outlet to manage its menu.",
    out_select: "Select Outlet to Configure",
    out_avail_prods: "Available Products",
    out_avail_desc:
      "Check items sold at this outlet. Unchecked items are hidden from their closing app.",

    // Admin Categories
    cat_title_add: "➕ Add New Category",
    cat_title_edit: "✏️ Edit Category",
    cat_subtitle: "Manage product categories (e.g., Pastry, Bread).",
    cat_name: "Category Name",
    cat_name_ph: "e.g., Viennoiserie",
    cat_sort: "Sort Order",
    cat_empty: "No categories added yet.",
    cat_alert_add: "Category added successfully!",
    cat_alert_update: "Category updated successfully!",
    cat_alert_delete: "Delete this category permanently?",

    // Admin Users (Staff)
    user_title: "Manage Staff Access",
    user_subtitle: "Add new cashiers, bakers, or supervisors.",
    user_name: "Username",
    user_name_ph: "e.g., Budi",
    user_pin: "PIN (For Login)",
    user_pin_ph: "e.g., 123456",
    user_role: "Access Role",
    user_role_baker: "Baker / Cashier",
    user_role_spv: "Supervisor",
    user_role_admin: "Admin (Full Access)",
    user_outlet: "Outlet Assignment",
    user_empty: "No users registered yet.",
    user_alert_add: "User added successfully!",
    user_alert_delete: "Delete this user permanently?",

    // Admin Bundlings
    bndl_title_add: "➕ Add New Bundling/Hampers",
    bndl_title_edit: "✏️ Edit Bundling/Hampers",
    bndl_subtitle: "Manage promo packages and hampers.",
    bndl_name: "Bundling Name",
    bndl_name_ph: "e.g., Eid Hampers",
    bndl_price: "Total Price",
    bndl_status: "Active Status",
    bndl_items_title: "Bundling Items",
    bndl_items_sub: "What products are included in this package?",
    bndl_add_item: "+ Add Product",
    bndl_qty: "Qty",
    bndl_empty: "No bundlings added yet.",
    bndl_alert_add: "Bundling added successfully!",
    bndl_alert_update: "Bundling updated successfully!",
    bndl_alert_delete: "Delete this bundling permanently?",
    // --- FILTERS ---
    filter_today: "Today",
    filter_week: "This Week",
    filter_month: "This Month",
    filter_custom: "Custom",
    filter_apply: "Apply Filter",
    filter_start: "Start Date",
    filter_end: "End Date",
    filter_no_data: "No reports found.",
  },
};

export const currentLang = "id";

export const t = (key) => {
  return dict[currentLang][key] || key;
};
