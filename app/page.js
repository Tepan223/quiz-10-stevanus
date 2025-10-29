import { Button } from 'antd';
export default function Home() {
  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>
        Welcome to the Ant Design Student Management System
      </h1>
      <Button type="primary" href="/students">
        Go to Student List
      </Button>
    </div>
  );
}
