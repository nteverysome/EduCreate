export default function SimpleTest() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>🎉 路由測試成功！</h1>
      <p>如果您看到這個頁面，說明 Next.js 路由系統正常工作。</p>
      <p>時間: {new Date().toLocaleString()}</p>
    </div>
  );
}
