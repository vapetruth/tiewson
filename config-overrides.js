// config-overrides.js
// วางไฟล์นี้ในโฟลเดอร์หลัก (ข้างๆ package.json)

module.exports = function override(config) {
  // แก้ปัญหา face-api.js ใน browser environment
  config.resolve.fallback = {
    ...config.resolve.fallback,
    fs: false,
    path: false,
    crypto: false
  };

  // ปิด warnings ของ face-api.js
  config.ignoreWarnings = [
    {
      module: /node_modules\/face-api\.js/
    }
  ];

  return config;
};