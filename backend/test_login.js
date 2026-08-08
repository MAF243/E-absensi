async function testLoginAndFetch() {
  try {
    console.log('Logging in...');
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identitas: '23010101', // Example Mahasiswa NIM
        password: '123' 
      })
    });
    
    const loginData = await loginRes.json();
    console.log('Login success:', loginData.success);
    if (!loginData.success) {
      console.log('Login Error:', loginData);
      // Let's try an admin credentials if that failed
      const loginRes2 = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identitas: '12345',
          password: '123'
        })
      });
      const loginData2 = await loginRes2.json();
      console.log('Admin login success:', loginData2.success);
      if (!loginData2.success) return;
      
      const token = loginData2.token;
      
      console.log('Fetching stats with token...');
      const statsRes = await fetch('http://localhost:5000/api/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const statsData = await statsRes.json();
      console.log('Stats success:', statsData.success);
      if (!statsData.success) console.log('Stats error:', statsData);
      
      return;
    }
    
    const token = loginData.token;
    
    console.log('Fetching stats with token...');
    const statsRes = await fetch('http://localhost:5000/api/dashboard/stats', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const statsData = await statsRes.json();
    console.log('Stats success:', statsData.success);
    if (!statsData.success) console.log('Stats error:', statsData);
  } catch (err) {
    console.log('Error:', err);
  }
}

testLoginAndFetch();
