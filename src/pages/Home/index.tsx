import React from 'react';
import { Button, Card } from 'antd';

const Home: React.FC = () => {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5' }}>
      {/* 删除: Continue This Week 和 Start New Weekly Plan 按钮 */}
      {/* <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '30px' }}>
        <Button type="primary">Continue This Week</Button>
        <Button>Start New Weekly Plan</Button>
      </div> */}

      {/* 删除: Manage Classes 区域 */}
      {/* <div style={{ margin: '30px 0', textAlign: 'center' }}>
        <h2>Manage Classes</h2>
        <Button type="primary">Add Class or Edit Profile</Button>
      </div> */}

      {/* 删除: Previous Plans 区域 */}
      {/* <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <h2>Previous Plans</h2>
        <Card
          style={{ width: '300px', margin: '20px auto', border: '1px solid #e8e8e8' }}
          bodyStyle={{ padding: '16px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>Week 1</strong>
              <p style={{ margin: '0' }}>Sep 28 - Oct 2</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: '#1890ff', margin: '0' }}>Physics</p>
              <p style={{ margin: '0' }}>8</p>
            </div>
          </div>
        </Card>
      </div> */}
    </div>
  );
};

export default Home;

