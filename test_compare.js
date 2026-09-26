fetch('http://localhost:3001/api/compare', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    foodA: { name: 'A', ingredients: 'sugar' },
    foodB: { name: 'B', ingredients: 'salt' },
    profile: {}
  })
}).then(r => r.text()).then(console.log).catch(console.error);
